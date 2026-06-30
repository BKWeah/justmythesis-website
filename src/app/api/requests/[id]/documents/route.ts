import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch documents
    const { data, error } = await supabase
      .from('request_documents')
      .select('*')
      .eq('support_request_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ documents: data });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is staff
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { fileName, fileType, fileSize, category, description } = body;

    // Upload file to storage
    const fileBuffer = Buffer.from(body.fileData, 'base64');
    const filePath = `${id}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('request-documents')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('request-documents')
      .getPublicUrl(filePath);

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('request_documents')
      .insert({
        support_request_id: id,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        category,
        description,
        uploaded_by: staffData.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Request',
      action: 'document_uploaded',
      description: `Document uploaded: ${fileName}`,
      support_request_id: id,
      entity_type: 'request_documents',
      entity_id: document.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { documentId, action, fileName, fileType, fileSize, category, description } = body;

    if (action === 'replace' && body.fileData) {
      // Get existing document
      const { data: existingDoc } = await supabase
        .from('request_documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (!existingDoc) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Upload new file
      const fileBuffer = Buffer.from(body.fileData, 'base64');
      const filePath = existingDoc.storage_path;

      const { error: uploadError } = await supabase.storage
        .from('request-documents')
        .upload(filePath, fileBuffer, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('request-documents')
        .getPublicUrl(filePath);

      // Update document record
      const { data: document, error: dbError } = await supabase
        .from('request_documents')
        .update({
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          public_url: urlData.publicUrl,
          category,
          description,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (dbError) throw dbError;

      // Log activity
      const { data: staffData } = await supabase
        .from('staff_users')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      await supabase.from('activity_logs').insert({
        category: 'Request',
        action: 'document_replaced',
        description: `Document replaced: ${fileName}`,
        support_request_id: id,
        entity_type: 'request_documents',
        entity_id: documentId,
        performed_by: staffData?.id,
      });

      return NextResponse.json({ success: true, document });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}