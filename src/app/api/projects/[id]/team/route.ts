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
  
  console.log('========== AUTH TEST ==========');
console.log('USER:', user);
console.log('ERROR:', userError);
console.log('COOKIES:', request.cookies.getAll());
console.log('===============================');

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
    .select('id, full_name')
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

const ALLOWED_ROLES = [
  'Lead Researcher',
  'Researcher',
  'Writer',
  'Editor',
  'QA Reviewer',
  'Supervisor',
] as const;

export async function POST(
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
    const currentStaff = authentication.staff;
    const projectId = params.id;
    const body = await request.json();

    const staffId = body?.staffId;
    const role = body?.role;

    if (!staffId || !role) {
      return NextResponse.json(
        { error: 'Team member and project role are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid project role' },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, project_reference')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const { data: selectedStaff, error: selectedStaffError } =
      await adminClient
        .from('staff_users')
        .select('id, full_name, email, role')
        .eq('id', staffId)
        .maybeSingle();

    if (selectedStaffError) {
      throw selectedStaffError;
    }

    if (!selectedStaff) {
      return NextResponse.json(
        { error: 'Selected staff member was not found' },
        { status: 404 }
      );
    }

    const { data: existingAssignment, error: duplicateError } =
      await adminClient
        .from('project_staff')
        .select('id')
        .eq('project_id', projectId)
        .eq('staff_id', staffId)
        .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'This staff member is already assigned to the project' },
        { status: 409 }
      );
    }

    const { data: assignment, error: assignmentError } =
      await adminClient
        .from('project_staff')
        .insert({
          project_id: projectId,
          staff_id: staffId,
          role,
          assigned_at: new Date().toISOString(),
        })
        .select('id, project_id, staff_id, role, assigned_at')
        .single();

    if (assignmentError) {
      throw assignmentError;
    }

    await adminClient.from('activity_logs').insert({
      category: 'Project',
      action: 'team_member_assigned',
      description: `${selectedStaff.full_name} assigned as ${role}`,
      project_id: projectId,
      entity_type: 'project_staff',
      entity_id: assignment.id,
      performed_by: currentStaff.id,
      metadata: {
        staff_id: selectedStaff.id,
        staff_name: selectedStaff.full_name,
        project_role: role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        assignment: {
          ...assignment,
          staff_name: selectedStaff.full_name,
          staff_email: selectedStaff.email,
          staff_role: selectedStaff.role,
          assigned_date: assignment.assigned_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Assign team API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to assign team member',
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
    const currentStaff = authentication.staff;
    const projectId = params.id;
    const body = await request.json();

    const memberId = body?.memberId;
    const role = body?.role;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'Assignment and project role are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid project role' },
        { status: 400 }
      );
    }

    const { data: existingAssignment, error: lookupError } =
      await adminClient
        .from('project_staff')
        .select(`
          id,
          staff_id,
          staff:staff_id (
            full_name
          )
        `)
        .eq('id', memberId)
        .eq('project_id', projectId)
        .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Team assignment not found' },
        { status: 404 }
      );
    }

    const { data: assignment, error: updateError } =
      await adminClient
        .from('project_staff')
        .update({ role })
        .eq('id', memberId)
        .eq('project_id', projectId)
        .select('id, project_id, staff_id, role, assigned_at')
        .single();

    if (updateError) {
      throw updateError;
    }

    const staffName =
      (existingAssignment as any).staff?.full_name || 'Team member';

    await adminClient.from('activity_logs').insert({
      category: 'Project',
      action: 'team_role_updated',
      description: `${staffName}'s project role changed to ${role}`,
      project_id: projectId,
      entity_type: 'project_staff',
      entity_id: memberId,
      performed_by: currentStaff.id,
      metadata: {
        staff_id: existingAssignment.staff_id,
        project_role: role,
      },
    });

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    console.error('Update team role API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to update team role',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const currentStaff = authentication.staff;
    const projectId = params.id;
    const memberId = request.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const { data: assignment, error: lookupError } = await adminClient
      .from('project_staff')
      .select(`
        id,
        staff_id,
        role,
        staff:staff_id (
          full_name
        )
      `)
      .eq('id', memberId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!assignment) {
      return NextResponse.json(
        { error: 'Team assignment not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await adminClient
      .from('project_staff')
      .delete()
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (deleteError) {
      throw deleteError;
    }

    const staffName =
      (assignment as any).staff?.full_name || 'Team member';

    await adminClient.from('activity_logs').insert({
      category: 'Project',
      action: 'team_member_removed',
      description: `${staffName} removed from the project team`,
      project_id: projectId,
      entity_type: 'project_staff',
      entity_id: memberId,
      performed_by: currentStaff.id,
      metadata: {
        staff_id: assignment.staff_id,
        previous_role: assignment.role,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Remove team member API error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to remove team member',
      },
      { status: 500 }
    );
  }
}
