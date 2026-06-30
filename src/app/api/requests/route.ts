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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
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
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const service = searchParams.get('service') || '';
    const institution = searchParams.get('institution') || '';

    // Build query
    let query = supabase
      .from('support_requests')
      .select(`
        id,
        request_reference,
        working_title,
        requested_service,
        current_stage,
        academic_level,
        submission_deadline,
        status,
        priority,
        created_at,
        clients:client_id (
          id,
          full_name,
          email,
          phone,
          institution
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(
        `request_reference.ilike.%${search}%,working_title.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (service) {
      query = query.eq('requested_service', service);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Requests fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    // Filter by client fields (need to do this in JS since Supabase doesn't support all ILIKE)
    let filteredData = data || [];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((req: any) => {
        const client = req.clients;
        return (
          req.request_reference?.toLowerCase().includes(searchLower) ||
          req.working_title?.toLowerCase().includes(searchLower) ||
          client?.full_name?.toLowerCase().includes(searchLower) ||
          client?.email?.toLowerCase().includes(searchLower) ||
          client?.phone?.includes(search) ||
          client?.institution?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (institution) {
      filteredData = filteredData.filter((req: any) =>
        req.clients?.institution === institution
      );
    }

    return NextResponse.json({ requests: filteredData });
  } catch (error) {
    console.error('Requests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      .select('id, full_name')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data: requestData } = body;

    // Handle different actions
    switch (action) {
      case 'update_status': {
        const { id, status } = requestData;
        
        const { data, error } = await supabase
          .from('support_requests')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          category: 'Request',
          action: 'status_changed',
          description: `Status changed to ${status}`,
          support_request_id: id,
          entity_type: 'support_requests',
          entity_id: id,
          performed_by: staffData.id,
        });

        return NextResponse.json({ success: true, data });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Requests API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}