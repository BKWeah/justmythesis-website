import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { fileName, fileType, fileSize, description, isFinal } = body;

    // Get next version number
    const { count } = await supabase
      .from('project_deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    const version = (count || 0) + 1;

    // Upload file to storage
    const fileBuffer = Buffer.from(body.fileData, 'base64');
    const filePath = `${id}/deliverable-v${version}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-deliverables')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-deliverables')
      .getPublicUrl(filePath);

    // Create deliverable record
    const { data: deliverable, error: dbError } = await supabase
      .from('project_deliverables')
      .insert({
        project_id: id,
        version,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        description,
        is_final: isFinal || false,
        uploaded_by: staffData.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // If marking as final, update other deliverables
    if (isFinal) {
      await supabase
        .from('project_deliverables')
        .update({ is_final: false })
        .eq('project_id', id)
        .neq('id', deliverable.id);
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'deliverable_uploaded',
      description: `Deliverable uploaded: Version ${version}${isFinal ? ' (Final)' : ''}`,
      project_id: id,
      entity_type: 'project_deliverables',
      entity_id: deliverable.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, deliverable });
  } catch (error) {
    console.error('Deliverables API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload deliverable' },
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { deliverableId, clientConfirmed } = body;

    // Update deliverable
    const { data, error } = await supabase
      .from('project_deliverables')
      .update({
        client_confirmed: clientConfirmed,
        confirmed_at: clientConfirmed ? new Date().toISOString() : null,
      })
      .eq('id', deliverableId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (clientConfirmed) {
      await supabase.from('activity_logs').insert({
        category: 'Project',
        action: 'deliverable_confirmed',
        description: `Deliverable Version ${data.version} confirmed by client`,
        project_id: id,
        entity_type: 'project_deliverables',
        entity_id: deliverableId,
        performed_by: staffData.id,
      });
    }

    return NextResponse.json({ success: true, deliverable: data });
  } catch (error) {
    console.error('Deliverables API error:', error);
    return NextResponse.json(
      { error: 'Failed to update deliverable' },
      { status: 500 }
    );
  }
}