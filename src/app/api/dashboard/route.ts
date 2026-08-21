import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      {
        stats: {
          totalRequests: 0,
          pendingRequests: 0,
          activeProjects: 0,
          completedProjects: 0,
        },
        recentRequests: [],
        attentionProjects: [],
      },
      { status: 200 }
    );
  }

  try {
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

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: staffData, error: staffError } = await adminClient
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (staffError || !staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const [
      totalRequestsResult,
      pendingRequestsResult,
      activeProjectsResult,
      completedProjectsResult,
      recentRequestsResult,
      attentionProjectsResult,
    ] = await Promise.all([
      adminClient
        .from('support_requests')
        .select('id', { count: 'exact', head: true }),

      adminClient
        .from('support_requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['New Request', 'Under Review']),

      adminClient
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '("Completed","Archived")'),

      adminClient
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Completed'),

      adminClient
        .from('support_requests')
        .select(`
          id,
          request_reference,
          working_title,
          status,
          priority,
          created_at,
          clients:client_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10),

      adminClient
        .from('projects')
        .select(`
          id,
          project_reference,
          project_title,
          status,
          completion_percentage,
          expected_delivery_date,
          clients:client_id (
            full_name,
            email
          )
        `)
        .not('status', 'in', '("Completed","Archived")')
        .order('expected_delivery_date', { ascending: true })
        .limit(5),
    ]);

    const stats = {
      totalRequests: totalRequestsResult.count || 0,
      pendingRequests: pendingRequestsResult.count || 0,
      activeProjects: activeProjectsResult.count || 0,
      completedProjects: completedProjectsResult.count || 0,
    };

    const recentRequests = (recentRequestsResult.data || []).map((req: any) => ({
      id: req.id,
      request_reference: req.request_reference,
      working_title: req.working_title,
      status: req.status,
      priority: req.priority,
      created_at: req.created_at,
      client: req.clients,
    }));

    const attentionProjects = (attentionProjectsResult.data || []).map((proj: any) => ({
      id: proj.id,
      project_reference: proj.project_reference,
      project_title: proj.project_title,
      status: proj.status,
      completion_percentage: proj.completion_percentage || 0,
      expected_delivery_date: proj.expected_delivery_date,
      client: proj.clients,
    }));

    return NextResponse.json({
      stats,
      recentRequests,
      attentionProjects,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        stats: {
          totalRequests: 0,
          pendingRequests: 0,
          activeProjects: 0,
          completedProjects: 0,
        },
        recentRequests: [],
        attentionProjects: [],
        error: 'Failed to fetch dashboard data',
      },
      { status: 200 }
    );
  }
}
