import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { getDeliverables } from '@/lib/services/deliverables/getDeliverables';
import { uploadDeliverable } from '@/lib/services/deliverables/uploadDeliverable';
import { releaseDeliverable } from '@/lib/services/deliverables/releaseDeliverable';
import { withdrawDeliverable } from '@/lib/services/deliverables/withdrawDeliverable';
import { confirmDeliverable } from '@/lib/services/deliverables/confirmDeliverable';
import { setFinalDeliverable } from '@/lib/services/deliverables/setFinalDeliverable';
import { deleteDeliverable } from '@/lib/services/deliverables/deleteDeliverable';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Database service role not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function authenticateStaff() {
  const authClient = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  const adminClient = createAdminClient();

  const { data: staff, error: staffError } = await adminClient
    .from('staff_users')
    .select('id, full_name, email, role')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  return {
    errorResponse: null,
    adminClient,
    staff,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const deliverables = await getDeliverables(
      authentication.adminClient,
      params.id
    );

    return NextResponse.json({ deliverables });
  } catch (error: unknown) {
    console.error('Deliverables GET API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch deliverables',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const body = await request.json();

    const {
      fileName,
      fileType,
      fileSize,
      fileData,
      description,
      isFinal,
    } = body;

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json(
        {
          error:
            'File name, file type, and file data are required',
        },
        { status: 400 }
      );
    }

    const deliverable = await uploadDeliverable(
      authentication.adminClient,
      {
        projectId: params.id,
        uploadedBy: authentication.staff.id,
        fileName,
        fileType,
        fileSize: Number(fileSize) || 0,
        fileData,
        description:
          typeof description === 'string'
            ? description.trim() || undefined
            : undefined,
        isFinal: Boolean(isFinal),
      }
    );

    return NextResponse.json(
      {
        success: true,
        deliverable,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Deliverables POST API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload deliverable',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const body = await request.json();

    const action = body?.action;
    const deliverableId = body?.deliverableId;

    if (!deliverableId) {
      return NextResponse.json(
        { error: 'Deliverable ID is required' },
        { status: 400 }
      );
    }

    let deliverable;

    switch (action) {
      case 'release':
        deliverable = await releaseDeliverable(
          authentication.adminClient,
          deliverableId,
          params.id,
          authentication.staff.id
        );
        break;

      case 'withdraw':
        deliverable = await withdrawDeliverable(
          authentication.adminClient,
          deliverableId,
          params.id,
          authentication.staff.id
        );
        break;

      case 'confirm':
        deliverable = await confirmDeliverable(
          authentication.adminClient,
          deliverableId,
          params.id,
          authentication.staff.id
        );
        break;

      case 'set_final':
        deliverable = await setFinalDeliverable(
          authentication.adminClient,
          deliverableId,
          params.id,
          authentication.staff.id
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid deliverable action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      deliverable,
    });
  } catch (error: unknown) {
    console.error('Deliverables PATCH API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update deliverable',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const deliverableId =
      request.nextUrl.searchParams.get('deliverableId');

    if (!deliverableId) {
      return NextResponse.json(
        { error: 'Deliverable ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteDeliverable(
      authentication.adminClient,
      deliverableId,
      params.id,
      authentication.staff.id
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Deliverables DELETE API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete deliverable',
      },
      { status: 500 }
    );
  }
}