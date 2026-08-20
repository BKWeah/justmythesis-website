import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

export const dynamic = 'force-dynamic';

interface OwnedProject {
  id: string;
  project_reference: string;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function getOwnedProject(
  request: NextRequest,
  identifier: string
) {
  const { admin, client } =
    await getAuthenticatedClient(request);

  let query = admin
    .from('projects')
    .select('id, project_reference')
    .eq('client_id', client.id)
    .is('archived_at', null);

  if (isUuid(identifier)) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('project_reference', identifier);
  }

  const { data: project, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    admin,
    project: project as OwnedProject | null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = decodeURIComponent(params.id);
    const { admin, project } = await getOwnedProject(
      request,
      identifier
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    const deliverableId =
      request.nextUrl.searchParams.get('deliverableId');

    if (deliverableId) {
      const { data: deliverable, error: deliverableError } =
        await admin
          .from('deliverables')
          .select('id, file_name, storage_path')
          .eq('id', deliverableId)
          .eq('project_id', project.id)
          .not('delivered_at', 'is', null)
          .maybeSingle();

      if (
        deliverableError ||
        !deliverable ||
        !deliverable.storage_path
      ) {
        return NextResponse.json(
          { error: 'Released deliverable not found.' },
          { status: 404 }
        );
      }

      const { data: signedUrlData, error: signedUrlError } =
        await admin.storage
          .from('deliverables')
          .createSignedUrl(deliverable.storage_path, 60);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        return NextResponse.json(
          { error: 'Unable to generate download link.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        fileName: deliverable.file_name,
        url: signedUrlData.signedUrl,
        expiresIn: 60,
      });
    }

    const { data: deliverables, error: deliverablesError } =
      await admin
        .from('deliverables')
        .select(`
          id,
          file_name,
          file_type,
          file_size_bytes,
          delivery_notes,
          version_number,
          is_final,
          delivered_at,
          client_confirmed,
          client_confirmed_at,
          created_at
        `)
        .eq('project_id', project.id)
        .not('delivered_at', 'is', null)
        .order('version_number', { ascending: false });

    if (deliverablesError) {
      throw new Error(deliverablesError.message);
    }

    return NextResponse.json({
      success: true,
      deliverables: (deliverables || []).map(
        (deliverable) => ({
          id: deliverable.id,
          fileName: deliverable.file_name,
          fileType: deliverable.file_type,
          fileSizeBytes: deliverable.file_size_bytes,
          deliveryNotes: deliverable.delivery_notes,
          versionNumber: deliverable.version_number,
          isFinal: deliverable.is_final,
          releasedAt: deliverable.delivered_at,
          clientConfirmed: deliverable.client_confirmed,
          clientConfirmedAt:
            deliverable.client_confirmed_at,
          createdAt: deliverable.created_at,
        })
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unexpected server error.';

    const status =
      message === 'Unauthorized.' ||
      message === 'Client profile not found.'
        ? 401
        : 500;

    console.error('Client deliverables API error:', error);

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}