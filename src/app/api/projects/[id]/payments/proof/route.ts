import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const STORAGE_BUCKET = 'project-documents';
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

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

async function ensureProject(admin: ReturnType<typeof createAdminClient>, projectId: string) {
  const { data: project, error } = await admin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  return project;
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isProjectProofPath(path: string, projectId: string) {
  return path.startsWith(`${projectId}/payment-proofs/`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.error || !auth.admin) return auth.error!;

    const projectId = params.id;
    const project = await ensureProject(auth.admin, projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const fileName = String(body?.fileName || '').trim();
    const fileType = String(body?.fileType || '').trim();
    const fileSize = Number(body?.fileSize);
    const fileData = String(body?.fileData || '');

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json({ error: 'Payment proof file is required' }, { status: 400 });
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Payment proof must be between 1 byte and 10 MB' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(fileType)) {
      return NextResponse.json(
        { error: 'Payment proof must be a PDF, image, DOC, or DOCX file' },
        { status: 400 }
      );
    }

    const path = `${projectId}/payment-proofs/${Date.now()}-${safeFileName(fileName)}`;
    const buffer = Buffer.from(fileData, 'base64');

    const { error: uploadError } = await auth.admin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: fileType, upsert: false });

    if (uploadError) throw uploadError;

    return NextResponse.json({ success: true, path, fileName });
  } catch (error) {
    console.error('Payment proof POST API error:', error);
    return NextResponse.json({ error: 'Failed to upload payment proof' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.error || !auth.admin) return auth.error!;

    const projectId = params.id;
    const paymentId = request.nextUrl.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const { data: payment, error } = await auth.admin
      .from('payments')
      .select('id, proof_url')
      .eq('id', paymentId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) throw error;
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (!payment.proof_url) {
      return NextResponse.json({ error: 'No payment proof is attached' }, { status: 404 });
    }

    const path = String(payment.proof_url);
    if (!isProjectProofPath(path, projectId)) {
      return NextResponse.json({ error: 'Invalid payment proof path' }, { status: 400 });
    }

    const { data: signed, error: signedError } = await auth.admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, 60);

    if (signedError || !signed?.signedUrl) {
      throw signedError || new Error('Unable to create secure payment proof link');
    }

    return NextResponse.json({ success: true, url: signed.signedUrl, expiresIn: 60 });
  } catch (error) {
    console.error('Payment proof GET API error:', error);
    return NextResponse.json({ error: 'Failed to open payment proof' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.error || !auth.admin) return auth.error!;

    const projectId = params.id;
    const body = await request.json();
    const path = String(body?.path || '').trim();

    if (!path || !isProjectProofPath(path, projectId)) {
      return NextResponse.json({ error: 'Invalid payment proof path' }, { status: 400 });
    }

    const { error } = await auth.admin.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment proof DELETE API error:', error);
    return NextResponse.json({ error: 'Failed to remove payment proof' }, { status: 500 });
  }
}
