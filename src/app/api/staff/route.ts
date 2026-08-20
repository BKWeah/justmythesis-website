import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    const { data: currentStaff, error: staffCheckError } =
      await adminClient
        .from('staff_users')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

    if (staffCheckError || !currentStaff) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data: staff, error } = await adminClient
      .from('staff_users')
      .select('id, full_name, email, role')
      .order('full_name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      staff: staff || [],
    });
  } catch (error: any) {
    console.error('Staff API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch staff',
      },
      { status: 500 }
    );
  }
}
