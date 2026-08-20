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

    const { data: staffData, error: staffError } = await adminClient
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (staffError || !staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const staff = searchParams.get('staff') || '';
    const institution = searchParams.get('institution') || '';

    let query = adminClient
      .from('projects')
      .select(`
        *,
        clients:client_id (
          id,
          full_name,
          email,
          institution
        )
      `)
      .order('created_at', { ascending: false });

    if (stage) {
      query = query.eq('current_stage', stage);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Projects fetch error:', error);

      return NextResponse.json(
        { error: error.message || 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    let filteredData = (data || []).map((project: any) => ({
      ...project,
      project_staff: [],
    }));

    if (search) {
      const searchLower = search.toLowerCase();

      filteredData = filteredData.filter((project: any) => {
        const client = project.clients;

        return (
          project.project_reference
            ?.toLowerCase()
            .includes(searchLower) ||
          project.project_title
            ?.toLowerCase()
            .includes(searchLower) ||
          client?.full_name
            ?.toLowerCase()
            .includes(searchLower) ||
          client?.institution
            ?.toLowerCase()
            .includes(searchLower)
        );
      });
    }

    if (institution) {
      filteredData = filteredData.filter(
        (project: any) =>
          project.clients?.institution === institution
      );
    }

    if (staff) {
      filteredData = [];
    }

    return NextResponse.json({
      projects: filteredData,
    });
  } catch (error: any) {
    console.error('Projects API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}
