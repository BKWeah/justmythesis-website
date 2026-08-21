import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PreferenceRecord = {
  email_notifications: boolean;
  project_updates: boolean;
  request_updates: boolean;
  qa_alerts: boolean;
  compact_mode: boolean;
  items_per_page: number;
};

const DEFAULT_PREFERENCES: PreferenceRecord = {
  email_notifications: true,
  project_updates: true,
  request_updates: true,
  qa_alerts: true,
  compact_mode: false,
  items_per_page: 25,
};

function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Database service role is not configured.');
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
    throw new Error('Database configuration is missing.');
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
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized.');
  }

  const admin = createAdminClient();
  const { data: staff, error: staffError } = await admin
    .from('staff_users')
    .select('id, full_name, email, role')
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

async function ensurePreferences(admin: SupabaseClient, staffId: string) {
  const { data, error } = await admin
    .from('staff_preferences')
    .select('email_notifications, project_updates, request_updates, qa_alerts, compact_mode, items_per_page')
    .eq('staff_id', staffId)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') {
      throw new Error('Workspace settings database migration has not been applied.');
    }
    throw new Error(error.message);
  }

  if (data) {
    return data as PreferenceRecord;
  }

  const { data: inserted, error: insertError } = await admin
    .from('staff_preferences')
    .insert({ staff_id: staffId, ...DEFAULT_PREFERENCES })
    .select('email_notifications, project_updates, request_updates, qa_alerts, compact_mode, items_per_page')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted as PreferenceRecord;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected server error.';

  if (message === 'Unauthorized.') {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message === 'Access denied.') {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (message.includes('database migration')) {
    return NextResponse.json({ error: message }, { status: 503 });
  }

  console.error('Workspace settings API error:', error);
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { admin, staff } = await authenticateStaff(request);
    const preferences = await ensurePreferences(admin, staff.id);

    return NextResponse.json({
      success: true,
      profile: {
        id: staff.id,
        fullName: staff.full_name,
        email: staff.email,
        role: staff.role,
      },
      preferences: {
        emailNotifications: preferences.email_notifications,
        projectUpdates: preferences.project_updates,
        requestUpdates: preferences.request_updates,
        qaAlerts: preferences.qa_alerts,
        compactMode: preferences.compact_mode,
        itemsPerPage: preferences.items_per_page,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, staff } = await authenticateStaff(request);
    const body = (await request.json()) as {
      fullName?: unknown;
      emailNotifications?: unknown;
      projectUpdates?: unknown;
      requestUpdates?: unknown;
      qaAlerts?: unknown;
      compactMode?: unknown;
      itemsPerPage?: unknown;
    };

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    const itemsPerPage = Number(body.itemsPerPage);
    if (![10, 25, 50].includes(itemsPerPage)) {
      return NextResponse.json({ error: 'Items per page must be 10, 25, or 50.' }, { status: 400 });
    }

    const { error: profileError } = await admin
      .from('staff_users')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staff.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const preferencePayload = {
      staff_id: staff.id,
      email_notifications: Boolean(body.emailNotifications),
      project_updates: Boolean(body.projectUpdates),
      request_updates: Boolean(body.requestUpdates),
      qa_alerts: Boolean(body.qaAlerts),
      compact_mode: Boolean(body.compactMode),
      items_per_page: itemsPerPage,
      updated_at: new Date().toISOString(),
    };

    const { error: preferenceError } = await admin
      .from('staff_preferences')
      .upsert(preferencePayload, { onConflict: 'staff_id' });

    if (preferenceError) {
      if (preferenceError.code === '42P01') {
        throw new Error('Workspace settings database migration has not been applied.');
      }
      throw new Error(preferenceError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
