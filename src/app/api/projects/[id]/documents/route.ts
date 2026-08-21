import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { getFileType } from '@/lib/utils/file-types';

const ALLOWED_CATEGORIES = [
  'Thesis Guide',
  'Proposal',
  'Draft Chapter',
  'Supervisor Comment',
  'Data',
  'Payment Proof',
  'Agreement',
  'Final Deliverable',
  'Other',
] as const;

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Database service role not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authenticateStaff(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { error: NextResponse.json({ error: 'Database not configured' }, { status: 503 }) };
  }

  const authClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: staff } = await admin
    .from('staff_users')
    .select('id')
    .eq('auth_uid', user.id)
    .maybeSingle();

  if (!staff) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) };
  }

  return { error: null, admin, staff };
}

function storagePathFromValue(value: string): string {
  if (!value.startsWith('http')) return value;

  const marker = '/project-documents/';
  const index = value.indexOf(marker);
  return index >= 0 ? decodeURIComponent(value.slice(index + marker.length)) : value;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.error || !auth.admin) return auth.error!;

    const projectId = params.id;
    const documentId = request.nextUrl.searchParams.get('documentId');

    const { data: project } = await auth.admin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (documentId) {
      const { data: document, error } = await auth.admin
        .from('documents')
        .select('id, file_name, file_url')
        .eq('id', documentId)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      const filePath = storagePathFromValue(document.file_url);
      const { data: signed, error: signedError } = await auth.admin.storage
        .from('project-documents')
        .createSignedUrl(filePath, 60);

      if (signedError || !signed?.signedUrl) {
        throw signedError || new Error('Unable to create secure download link');
      }

      return NextResponse.json({
        success: true,
        fileName: document.file_name,
        url: signed.signedUrl,
        expiresIn: 60,
      });
    }

    const { data, error } = await auth.admin
      .from('documents')
      .select('id, file_name, file_type, file_size_bytes, category, description, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, documents: data || [] });
  } catch (error) {
    console.error('Documents GET API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve documents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.error || !auth.admin || !auth.staff) return auth.error!;

    const projectId = params.id;
    const body = await request.json();
    const { fileName, fileType, fileSize, category, description, fileData } = body;

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json({ error: 'File data is required' }, { status: 400 });
    }

    if (!Number.isFinite(Number(fileSize)) || Number(fileSize) <= 0 || Number(fileSize) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be between 1 byte and 25 MB' }, { status: 400 });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'A valid document category is required' }, { status: 400 });
    }

    const { data: project, error: projectError } = await auth.admin
      .from('projects')
      .select('id, client_id')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) throw projectError;
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const shortFileType = getFileType(fileType);
    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${projectId}/${Date.now()}-${safeFileName}`;
    const fileBuffer = Buffer.from(fileData, 'base64');

    const { error: uploadError } = await auth.admin.storage
      .from('project-documents')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: document, error: dbError } = await auth.admin
      .from('documents')
      .insert({
        client_id: project.client_id,
        project_id: projectId,
        file_name: fileName,
        file_type: shortFileType,
        file_size_bytes: Number(fileSize),
        file_url: filePath,
        category,
        description: String(description || '').trim() || null,
        uploaded_by: auth.staff.id,
      })
      .select('id, file_name, file_type, file_size_bytes, category, description, created_at')
      .single();

    if (dbError) {
      await auth.admin.storage.from('project-documents').remove([filePath]);
      throw dbError;
    }

    await auth.admin.from('activity_logs').insert({
      category: 'Project',
      action: 'document_uploaded',
      description: `Document uploaded: ${fileName}`,
      project_id: projectId,
      entity_type: 'documents',
      entity_id: document.id,
      performed_by: auth.staff.id,
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Documents POST API error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
