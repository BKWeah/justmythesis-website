import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Database service role not configured');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ requests: [] }, { status: 200 });
    }

    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: staffData } = await adminClient
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const service = searchParams.get('service') || '';
    const institution = searchParams.get('institution') || '';

    let query = adminClient
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

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (service) query = query.eq('requested_service', service);

    const { data, error } = await query;

    if (error) {
      console.error('Requests fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
      filteredData = filteredData.filter((req: any) => req.clients?.institution === institution);
    }

    return NextResponse.json({ requests: filteredData });
  } catch (error: any) {
    console.error('Requests API error:', error);
    return NextResponse.json(
      { requests: [], error: error.message || 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: staffData } = await adminClient
      .from('staff_users')
      .select('id, full_name')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data: requestData } = body;

    switch (action) {
      case 'update_status': {
        const { id, status } = requestData;

        const { data, error } = await adminClient
          .from('support_requests')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        await adminClient.from('activity_logs').insert({
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
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Requests API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}