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

    // Fetch request with all related data
    const [requestResult, documentsResult, notesResult, activityResult, assessmentResult, recommendationResult] = await Promise.all([
      // Main request data
      supabase
        .from('support_requests')
        .select(`
          *,
          clients:client_id (
            *,
            programme,
            academic_level
          ),
          staff:assigned_staff_id (
            id,
            full_name,
            email,
            role
          )
        `)
        .eq('id', id)
        .single(),

      // Documents
      supabase
        .from('request_documents')
        .select('*')
        .eq('support_request_id', id)
        .order('created_at', { ascending: true }),

      // Internal notes
      supabase
        .from('internal_notes')
        .select(`
          *,
          staff:author_id (
            full_name
          )
        `)
        .eq('support_request_id', id)
        .order('created_at', { ascending: false }),

      // Activity log
      supabase
        .from('activity_logs')
        .select(`
          *,
          staff:performed_by (
            full_name
          )
        `)
        .eq('support_request_id', id)
        .order('created_at', { ascending: false }),

      // Assessment
      supabase
        .from('request_assessments')
        .select('*')
        .eq('support_request_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Recommendation
      supabase
        .from('recommendations')
        .select('*')
        .eq('support_request_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (requestResult.error) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      request: {
        ...requestResult.data,
        documents: documentsResult.data || [],
        notes: (notesResult.data || []).map((note: any) => ({
          ...note,
          author_name: note.staff?.full_name || 'Unknown',
        })),
        activities: (activityResult.data || []).map((activity: any) => ({
          ...activity,
          performer_name: activity.staff?.full_name || 'System',
        })),
        assessment: assessmentResult.data || null,
        recommendation: recommendationResult.data || null,
      },
    });
  } catch (error) {
    console.error('Request detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
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
      case 'update_status': {
        const { status } = updateData;
        
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

      case 'assign_staff': {
        const { staffId } = updateData;
        
        const { data, error } = await supabase
          .from('support_requests')
          .update({ assigned_staff_id: staffId })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Log activity
        const staffResult = await supabase
          .from('staff_users')
          .select('full_name')
          .eq('id', staffId)
          .single();

        await supabase.from('activity_logs').insert({
          category: 'Request',
          action: 'staff_assigned',
          description: `Assigned to ${staffResult.data?.full_name || 'staff'}`,
          support_request_id: id,
          entity_type: 'support_requests',
          entity_id: id,
          performed_by: staffData.id,
        });

        return NextResponse.json({ success: true, data });
      }

      case 'convert_to_project': {
        const { 
          project_title,
          start_date,
          deadline,
          service_package,
          payment_structure,
          estimated_cost 
        } = updateData;

        // Get the request data
        const { data: requestData, error: requestError } = await supabase
          .from('support_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (requestError) throw requestError;

        // Generate project reference
        const year = new Date().getFullYear();
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        const projectReference = `JMTP-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

        // Create project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            project_reference: projectReference,
            project_title,
            client_id: requestData.client_id,
            start_date,
            expected_delivery_date: deadline,
            service_package,
            payment_structure,
            estimated_cost,
            status: 'Project Activated',
            completion_percentage: 0,
            academic_level: requestData.academic_level,
            current_stage: requestData.current_stage,
          })
          .select()
          .single();

        if (projectError) throw projectError;

        // Update request status
        await supabase
          .from('support_requests')
          .update({ status: 'Project Activated' })
          .eq('id', id);

        // Link request to project
        await supabase
          .from('request_projects')
          .insert({
            support_request_id: id,
            project_id: project.id,
          });

        // Log activity
        await supabase.from('activity_logs').insert({
          category: 'Request',
          action: 'project_created',
          description: `Project ${projectReference} created`,
          support_request_id: id,
          entity_type: 'projects',
          entity_id: project.id,
          performed_by: staffData.id,
        });

        return NextResponse.json({ success: true, project });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Request update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}