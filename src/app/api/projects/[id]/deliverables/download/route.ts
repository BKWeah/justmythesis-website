import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

async function authenticateStaff(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      ),
      adminClient: null,
    };
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
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      adminClient: null,
    };
  }

  const adminClient = createAdminClient();

  const { data: staff, error: staffError } = await adminClient
    .from('staff_users')
    .select('id')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ),
      adminClient: null,
    };
  }

  return {
    errorResponse: null,
    adminClient,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff(request);

    if (
      authentication.errorResponse ||
      !authentication.adminClient
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

    const { data: deliverable, error: deliverableError } =
      await authentication.adminClient
        .from('deliverables')
        .select('storage_path')
        .eq('id', deliverableId)
        .eq('project_id', params.id)
        .single();

    if (
      deliverableError ||
      !deliverable ||
      !deliverable.storage_path
    ) {
      return NextResponse.json(
        { error: 'Deliverable file not found' },
        { status: 404 }
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await authentication.adminClient.storage
        .from('deliverables')
        .createSignedUrl(deliverable.storage_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Unable to generate download link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
    });
  } catch (error: unknown) {
    console.error('Deliverable download API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate download link',
      },
      { status: 500 }
    );
  }
}