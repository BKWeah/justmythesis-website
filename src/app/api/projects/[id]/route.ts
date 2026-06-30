import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Fetch project with all related data
    const [
      projectResult,
      linkedRequestResult,
      milestonesResult,
      teamResult,
      documentsResult,
      qaResult,
      deliverablesResult,
      activityResult,
      paymentsResult,
    ] = await Promise.all([
      // Main project data
      supabase
        .from('projects')
        .select(`
          *,
          clients:client_id (
            *,
            programme,
            academic_level
          )
        `)
        .eq('id', id)
        .single(),

      // Linked request
      supabase
        .from('request_projects')
        .select(`
          support_requests (
            id,
            request_reference,
            working_title,
            status
          )
        `)
        .eq('project_id', id)
        .single(),

      // Milestones
      supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', id)
        .order('due_date', { ascending: true }),

      // Project team
      supabase
        .from('project_staff')
        .select(`
          *,
          staff:staff_id (
            id,
            full_name,
            email,
            role
          )
        `)
        .eq('project_id', id),

      // Documents
      supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true }),

      // QA Reviews
      supabase
        .from('project_qa_reviews')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Deliverables
      supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', id)
        .order('version', { ascending: false }),

      // Activity log
      supabase
        .from('activity_logs')
        .select(`
          *,
          staff:performed_by (
            full_name
          )
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false }),

      // Payment history
      supabase
        .from('project_payments')
        .select('*')
        .eq('project_id', id)
        .order('payment_date', { ascending: false }),
    ]);

    if (projectResult.error) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project: {
        ...projectResult.data,
        linked_request: linkedRequestResult?.data?.support_requests || null,
        milestones: milestonesResult.data || [],
        team: (teamResult.data || []).map((t: any) => ({
          ...t,
          staff_name: t.staff?.full_name,
          staff_email: t.staff?.email,
          staff_role: t.staff?.role,
        })),
        documents: documentsResult.data || [],
        qa_review: qaResult.data || null,
        deliverables: deliverablesResult.data || [],
        activities: (activityResult.data || []).map((a: any) => ({
          ...a,
          performer_name: a.staff?.full_name || 'System',
        })),
        payments: paymentsResult.data || [],
      },
    });
  } catch (error) {
    console.error('Project detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { action, data: updateData } = body;

    switch (action) {
      case 'update_stage': {
        const { stage } = updateData;
        
        const { data, error } = await supabase
          .from('projects')
          .update({ current_stage: stage })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          category: 'Project',
          action: 'stage_updated',
          description: `Stage updated to ${stage}`,
          project_id: id,
          entity_type: 'projects',
          entity_id: id,
          performed_by: staffData.id,
        });

        return NextResponse.json({ success: true, data });
      }

      case 'complete': {
        const { data, error } = await supabase
          .from('projects')
          .update({ 
            status: 'Completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          category: 'Project',
          action: 'project_completed',
          description: 'Project marked as completed',
          project_id: id,
          entity_type: 'projects',
          entity_id: id,
          performed_by: staffData.id,
        });

        return NextResponse.json({ success: true, data });
      }

      case 'archive': {
        const { data, error } = await supabase
          .from('projects')
          .update({ status: 'Archived' })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          category: 'Project',
          action: 'project_archived',
          description: 'Project archived',
          project_id: id,
          entity_type: 'projects',
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
    console.error('Project update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}