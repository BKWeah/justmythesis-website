import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Database service role is not configured.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function authenticateStaff(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Database configuration is missing.');
  }

  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized.');
  }

  const admin = createAdminClient();

  const { data: staff, error: staffError } = await admin
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

  return { admin, staff };
}

async function resolveProject(
  admin: ReturnType<typeof createAdminClient>,
  identifier: string
) {
  const decodedIdentifier = decodeURIComponent(identifier);

  const { data, error } = await admin
    .from('projects')
    .select('id, client_id')
    .or(
      `id.eq.${decodedIdentifier},project_reference.eq.${decodedIdentifier}`
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Project not found.');
  }

  return data;
}

async function retrieveMessages(
  admin: ReturnType<typeof createAdminClient>,
  projectId: string,
  currentStaffId: string
) {
  const { data, error } = await admin
    .from('project_messages')
    .select(`
      id,
      sender_type,
      sender_staff_id,
      sender_client_id,
      message,
      created_at
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const messages = data ?? [];

  const staffIds = [
    ...new Set(
      messages
        .map((message) => message.sender_staff_id)
        .filter(Boolean)
    ),
  ] as string[];

  const clientIds = [
    ...new Set(
      messages
        .map((message) => message.sender_client_id)
        .filter(Boolean)
    ),
  ] as string[];

  let staffNames: Record<string, string> = {};
  let clientNames: Record<string, string> = {};

  if (staffIds.length > 0) {
    const { data: staffRows, error: staffError } = await admin
      .from('staff_users')
      .select('id, full_name')
      .in('id', staffIds);

    if (staffError) {
      throw new Error(staffError.message);
    }

    staffNames = Object.fromEntries(
      (staffRows ?? []).map((staff) => [
        staff.id,
        staff.full_name || 'JUSTmyTHESIS Team',
      ])
    );
  }

  if (clientIds.length > 0) {
    const { data: clientRows, error: clientError } = await admin
      .from('clients')
      .select('id, full_name')
      .in('id', clientIds);

    if (clientError) {
      throw new Error(clientError.message);
    }

    clientNames = Object.fromEntries(
      (clientRows ?? []).map((client) => [
        client.id,
        client.full_name || 'Client',
      ])
    );
  }

  await admin
    .from('project_messages')
    .update({
      read_by_staff_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)
    .eq('sender_type', 'client')
    .is('read_by_staff_at', null);

  return messages.map((message) => ({
    id: message.id,
    senderType: message.sender_type,
    senderName:
      message.sender_type === 'staff'
        ? staffNames[message.sender_staff_id] ||
          'JUSTmyTHESIS Team'
        : clientNames[message.sender_client_id] || 'Client',
    message: message.message,
    createdAt: message.created_at,
    isCurrentUser:
      message.sender_type === 'staff' &&
      message.sender_staff_id === currentStaffId,
  }));
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : 'Unexpected server error.';

  const status =
    message === 'Unauthorized.'
      ? 401
      : message === 'Access denied.'
        ? 403
        : message === 'Project not found.'
          ? 404
          : 500;

  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, staff } = await authenticateStaff(request);
    const project = await resolveProject(admin, params.id);

    const messages = await retrieveMessages(
      admin,
      project.id,
      staff.id
    );

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Staff messages GET error:', error);
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, staff } = await authenticateStaff(request);
    const project = await resolveProject(admin, params.id);

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
        { error: 'Message cannot exceed 5000 characters.' },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from('project_messages')
      .insert({
        project_id: project.id,
        sender_type: 'staff',
        sender_staff_id: staff.id,
        sender_client_id: null,
        message,
        read_by_staff_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    const messages = await retrieveMessages(
      admin,
      project.id,
      staff.id
    );

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Staff messages POST error:', error);
    return errorResponse(error);
  }
}