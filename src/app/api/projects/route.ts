import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is staff
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const staff = searchParams.get('staff') || '';
    const institution = searchParams.get('institution') || '';

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        *,
        clients:client_id (
          id,
          full_name,
          email,
          institution
        ),
        project_staff (
          staff:staff_id (
            id,
            full_name,
            email,
            role
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
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
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Filter by client fields (need to do this in JS since Supabase doesn't support all ILIKE)
    let filteredData = data || [];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((proj: any) => {
        const client = proj.clients;
        const assignedStaff = proj.project_staff?.[0]?.staff;
        return (
          proj.project_reference?.toLowerCase().includes(searchLower) ||
          proj.project_title?.toLowerCase().includes(searchLower) ||
          client?.full_name?.toLowerCase().includes(searchLower) ||
          client?.institution?.toLowerCase().includes(searchLower) ||
          assignedStaff?.full_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (institution) {
      filteredData = filteredData.filter((proj: any) =>
        proj.clients?.institution === institution
      );
    }

    if (staff) {
      filteredData = filteredData.filter((proj: any) =>
        proj.project_staff?.some((ps: any) => ps.staff?.id === staff)
      );
    }

    return NextResponse.json({ projects: filteredData });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}