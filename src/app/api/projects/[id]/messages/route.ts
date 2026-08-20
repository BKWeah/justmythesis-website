import { createServerClient } from '@supabase/ssr';
import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import {
  NextRequest,
  NextResponse,
} from 'next/server';

export const dynamic = 'force-dynamic';

interface MessageRecord {
  id: string;
  project_id: string;
  sender_type: 'staff' | 'client';
  sender_staff_id: string | null;
  sender_client_id: string | null;
  message: string;
  read_by_client_at: string | null;
  read_by_staff_at: string | null;
  created_at: string;
  updated_at: string;
}

interface StaffRecord {
  id: string;
  full_name: string | null;
}

interface ClientRecord {
  id: string;
  full_name: string | null;
}

function createAdminClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Database service role is not configured.'
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

async function authenticateStaff(
  request: NextRequest
) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Database configuration is missing.'
    );
  }

  const authClient = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized.');
  }

  const admin = createAdminClient();

  const { data: staff, error: staffError } =
    await admin
      .from('staff_users')
      .select('id, full_name')
      .eq('auth_uid', user.id)
      .maybeSingle();

  if (staffError) {
    throw new Error(staffError.message);
  }

  if (!staff) {
    throw new Error('Access denied.');
  }

  return {
    admin,
    staff: staff as StaffRecord,
  };
}

async function verifyProject(
  admin: SupabaseClient,
  projectId: string
) {
  const { data: project, error } =
    await admin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!project) {
    throw new Error('Project not found.');
  }
}

async function getProjectMessages(
  admin: SupabaseClient,
  projectId: string,
  currentStaffId: string
) {
  const { data, error } = await admin
    .from('project_messages')
    .select(
      `
        id,
        project_id,
        sender_type,
        sender_staff_id,
        sender_client_id,
        message,
        read_by_client_at,
        read_by_staff_at,
        created_at,
        updated_at
      `
    )
    .eq('project_id', projectId)
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const messages =
    (data ?? []) as MessageRecord[];

  const staffIds = [
    ...new Set(
      messages
        .map((message) =>
          message.sender_type === 'staff'
            ? message.sender_staff_id
            : null
        )
        .filter(
          (id): id is string =>
            typeof id === 'string'
        )
    ),
  ];

  const clientIds = [
    ...new Set(
      messages
        .map((message) =>
          message.sender_type === 'client'
            ? message.sender_client_id
            : null
        )
        .filter(
          (id): id is string =>
            typeof id === 'string'
        )
    ),
  ];

  const staffNames: Record<string, string> = {};
  const clientNames: Record<string, string> = {};

  if (staffIds.length > 0) {
    const { data: staffRows, error: staffError } =
      await admin
        .from('staff_users')
        .select('id, full_name')
        .in('id', staffIds);

    if (staffError) {
      throw new Error(staffError.message);
    }

    for (const staff of
      (staffRows ?? []) as StaffRecord[]) {
      staffNames[staff.id] =
        staff.full_name?.trim() ||
        'JUSTmyTHESIS Team';
    }
  }

  if (clientIds.length > 0) {
    const { data: clientRows, error: clientError } =
      await admin
        .from('clients')
        .select('id, full_name')
        .in('id', clientIds);

    if (clientError) {
      throw new Error(clientError.message);
    }

    for (const client of
      (clientRows ?? []) as ClientRecord[]) {
      clientNames[client.id] =
        client.full_name?.trim() || 'Client';
    }
  }

  return messages.map((message) => ({
    id: message.id,
    senderType: message.sender_type,
    senderName:
      message.sender_type === 'staff'
        ? staffNames[
            message.sender_staff_id ?? ''
          ] || 'JUSTmyTHESIS Team'
        : clientNames[
            message.sender_client_id ?? ''
          ] || 'Client',
    message: message.message,
    createdAt: message.created_at,
    isCurrentUser:
      message.sender_type === 'staff' &&
      message.sender_staff_id ===
        currentStaffId,
  }));
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : 'Unexpected server error.';

  if (message === 'Unauthorized.') {
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }

  if (message === 'Access denied.') {
    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  if (message === 'Project not found.') {
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }

  console.error(
    'Staff project messages API error:',
    error
  );

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const { admin, staff } =
      await authenticateStaff(request);

    await verifyProject(admin, params.id);

    const readAt = new Date().toISOString();

    const { error: readError } = await admin
      .from('project_messages')
      .update({
        read_by_staff_at: readAt,
        updated_at: readAt,
      })
      .eq('project_id', params.id)
      .eq('sender_type', 'client')
      .is('read_by_staff_at', null);

    if (readError) {
      throw new Error(readError.message);
    }

    const messages = await getProjectMessages(
      admin,
      params.id,
      staff.id
    );

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const { admin, staff } =
      await authenticateStaff(request);

    await verifyProject(admin, params.id);

    const body = (await request.json()) as {
      message?: unknown;
    };

    const message =
      typeof body.message === 'string'
        ? body.message.trim()
        : '';

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          error:
            'Message cannot exceed 5,000 characters.',
        },
        { status: 400 }
      );
    }

    const { error: insertError } = await admin
      .from('project_messages')
      .insert({
        project_id: params.id,
        sender_type: 'staff',
        sender_staff_id: staff.id,
        sender_client_id: null,
        message,
        read_by_staff_at:
          new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const messages = await getProjectMessages(
      admin,
      params.id,
      staff.id
    );

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}