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
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: staffData, error: staffError } = await adminClient
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (staffError || !staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').trim();
    const stage = (searchParams.get('stage') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const staff = (searchParams.get('staff') || '').trim();
    const institution = (searchParams.get('institution') || '').trim();

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

    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error: projectsError } = await query;

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
      return NextResponse.json(
        { error: projectsError.message || 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectIds = (projects || []).map((project: any) => project.id).filter(Boolean);
    let staffRows: any[] = [];

    if (projectIds.length > 0) {
      const { data, error } = await adminClient
        .from('project_staff')
        .select(`
          id,
          project_id,
          role,
          assigned_at,
          staff:staff_id (
            id,
            full_name,
            email,
            role
          )
        `)
        .in('project_id', projectIds)
        .order('assigned_at', { ascending: true });

      if (error) {
        console.error('Project staff fetch error:', error);
      } else {
        staffRows = data || [];
      }
    }

    const staffByProject = staffRows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.project_id]) acc[row.project_id] = [];
      acc[row.project_id].push(row);
      return acc;
    }, {});

    let filteredData = (projects || []).map((project: any) => ({
      ...project,
      current_stage: project.status,
      project_staff: staffByProject[project.id] || [],
    }));

    if (stage) {
      filteredData = filteredData.filter((project: any) => project.current_stage === stage);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((project: any) => {
        const client = project.clients;
        const assignedStaff = project.project_staff || [];

        return (
          project.project_reference?.toLowerCase().includes(searchLower) ||
          project.project_title?.toLowerCase().includes(searchLower) ||
          client?.full_name?.toLowerCase().includes(searchLower) ||
          client?.institution?.toLowerCase().includes(searchLower) ||
          assignedStaff.some((assignment: any) =>
            assignment.staff?.full_name?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    if (institution) {
      filteredData = filteredData.filter(
        (project: any) => project.clients?.institution === institution
      );
    }

    if (staff) {
      filteredData = filteredData.filter((project: any) =>
        project.project_staff?.some((assignment: any) => assignment.staff?.id === staff)
      );
    }

    return NextResponse.json({ projects: filteredData });
  } catch (error: unknown) {
    console.error('Projects API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
