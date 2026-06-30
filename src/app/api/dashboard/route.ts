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

    // Fetch dashboard stats
    const [
      totalRequestsResult,
      pendingRequestsResult,
      activeProjectsResult,
      completedProjectsResult,
      recentRequestsResult,
      attentionProjectsResult,
    ] = await Promise.all([
      // Total requests count
      supabase
        .from('support_requests')
        .select('id', { count: 'exact', head: true }),

      // Pending requests count (New Request + Under Review)
      supabase
        .from('support_requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['New Request', 'Under Review']),

      // Active projects count
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '("Completed","Archived")'),

      // Completed projects count
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Completed'),

      // Recent requests (last 10)
      supabase
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

      // Projects requiring attention (not completed, sorted by deadline)
      supabase
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
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}