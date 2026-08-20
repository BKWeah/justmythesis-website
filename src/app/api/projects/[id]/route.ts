import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

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

async function authenticateStaff(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      ),
      adminClient: null,
      staff: null,
    };
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
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  const adminClient = createAdminClient();

  const { data: staff, error: staffError } = await adminClient
    .from('staff_users')
    .select('id, full_name, email, role')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  return {
    errorResponse: null,
    adminClient,
    staff,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff(request);

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const adminClient = authentication.adminClient;
    const projectId = params.id;

    console.log('Requested Project ID:', projectId);

    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    console.log('Project Query Result:', {
      project,
      projectError,
    });

    if (projectError) {
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const [clientResult, requestResult, activityResult, teamResult] =
      await Promise.allSettled([
        adminClient
          .from('clients')
          .select(`
            id,
            full_name,
            email,
            phone,
            whatsapp,
            institution,
            degree_level,
            programme
          `)
          .eq('id', project.client_id)
          .maybeSingle(),

        project.support_request_id
          ? adminClient
              .from('support_requests')
              .select(`
                id,
                request_reference,
                working_title,
                requested_service,
                current_stage,
                academic_level,
                status,
                created_at
              `)
              .eq('id', project.support_request_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        adminClient
          .from('activity_logs')
          .select(`
            id,
            category,
            action,
            description,
            performed_by,
            created_at
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),

        adminClient
          .from('project_staff')
          .select(`
            id,
            project_id,
            staff_id,
            role,
            assigned_at,
            staff:staff_id (
              id,
              full_name,
              email,
              role
            )
          `)
          .eq('project_id', projectId)
          .order('assigned_at', { ascending: true }),
      ]);

    const client =
      clientResult.status === 'fulfilled'
        ? clientResult.value.data || null
        : null;

    const linkedRequest =
      requestResult.status === 'fulfilled'
        ? requestResult.value.data || null
        : null;

    const rawActivities =
      activityResult.status === 'fulfilled'
        ? activityResult.value.data || []
        : [];

    const rawTeam =
      teamResult.status === 'fulfilled'
        ? teamResult.value.data || []
        : [];

    const performerIds = [
      ...new Set(
        rawActivities
          .map((activity: any) => activity.performed_by)
          .filter(Boolean)
      ),
    ];

    let performers: Record<string, string> = {};

    if (performerIds.length > 0) {
      const { data: staffRows } = await adminClient
        .from('staff_users')
        .select('id, full_name')
        .in('id', performerIds);

      performers = Object.fromEntries(
        (staffRows || []).map((staff: any) => [
          staff.id,
          staff.full_name,
        ])
      );
    }

    const activities = rawActivities.map((activity: any) => ({
      ...activity,
      performer_name:
        performers[activity.performed_by] || 'System',
    }));

    const team = rawTeam.map((member: any) => ({
      id: member.id,
      staff_id: member.staff_id,
      staff_name: member.staff?.full_name || 'Unknown Staff',
      staff_email: member.staff?.email || '',
      staff_role: member.staff?.role || '',
      role: member.role,
      assigned_date: member.assigned_at,
    }));

    return NextResponse.json({
      project: {
        ...project,
        clients: client,
        linked_request: linkedRequest,
        activities,
        team,
        milestones: [],
        documents: [],
        payments: [],
        qa_review: null,
        deliverables: [],
      },
    });
  } catch (error: any) {
    console.error('Project detail API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch project',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff(request);

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const adminClient = authentication.adminClient;
    const staff = authentication.staff;
    const projectId = params.id;

    const body = await request.json();
    const { action, data: updateData } = body;

        if (action === 'update_project') {
      const allowedStatuses = [
        'Project Activated',
        'Development',
        'Quality Review',
        'Ready for Delivery',
        'Delivered',
        'Completed',
      ];

      const status = String(
        updateData?.status ?? ''
      ).trim();

      const completionPercentage = Number(
        updateData?.completionPercentage
      );

      const expectedDeliveryDate =
        updateData?.expectedDeliveryDate || null;

      const notes =
        String(updateData?.notes ?? '').trim() || null;

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            error:
              'A valid project status is required',
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(completionPercentage) ||
        completionPercentage < 0 ||
        completionPercentage > 100
      ) {
        return NextResponse.json(
          {
            error:
              'Progress must be a whole number from 0 to 100',
          },
          { status: 400 }
        );
      }

      if (
        expectedDeliveryDate &&
        !/^\d{4}-\d{2}-\d{2}$/.test(
          expectedDeliveryDate
        )
      ) {
        return NextResponse.json(
          {
            error:
              'A valid target deadline is required',
          },
          { status: 400 }
        );
      }

      const isCompleting =
        status === 'Completed' ||
        completionPercentage === 100;

      const { data: project, error } =
        await adminClient
          .from('projects')
          .update({
            status: isCompleting
              ? 'Completed'
              : status,
            completion_percentage: isCompleting
              ? 100
              : completionPercentage,
            expected_delivery_date:
              expectedDeliveryDate,
            notes,
            completed_at: isCompleting
              ? new Date().toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .select('*')
          .single();

      if (error) {
        throw error;
      }

      await adminClient
        .from('activity_logs')
        .insert({
          category: 'Project',
          action: 'project_updated',
          description: `Project updated: ${
            isCompleting ? 'Completed' : status
          }, ${
            isCompleting
              ? 100
              : completionPercentage
          }% complete`,
          project_id: projectId,
          entity_type: 'projects',
          entity_id: projectId,
          performed_by: staff.id,
        });

      return NextResponse.json({
        success: true,
        project,
      });
    }

    if (action === 'complete') {
      const { data: project, error } = await adminClient
        .from('projects')
        .update({
          status: 'Completed',
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      await adminClient.from('activity_logs').insert({
        category: 'Project',
        action: 'project_completed',
        description: 'Project marked as completed',
        project_id: projectId,
        entity_type: 'projects',
        entity_id: projectId,
        performed_by: staff.id,
      });

      return NextResponse.json({
        success: true,
        project,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Project update API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to update project',
      },
      { status: 500 }
    );
  }
}
