import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { staffId, role } = body;

    // Check if already assigned
    const { data: existing } = await supabase
      .from('project_staff')
      .select('id')
      .eq('project_id', id)
      .eq('staff_id', staffId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Staff member already assigned' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('project_staff')
      .insert({
        project_id: id,
        staff_id: staffId,
        role,
        assigned_date: new Date().toISOString().split('T')[0],
      })
      .select(`
        *,
        staff:staff_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'team_member_added',
      description: `${data.staff?.full_name} assigned as ${role}`,
      project_id: id,
      entity_type: 'project_staff',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, team_member: data });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json(
      { error: 'Failed to assign team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // Get member info for logging
    const { data: member } = await supabase
      .from('project_staff')
      .select(`
        *,
        staff:staff_id (
          full_name
        )
      `)
      .eq('id', memberId)
      .single();

    const { error } = await supabase
      .from('project_staff')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'team_member_removed',
      description: `${member?.staff?.full_name || 'Team member'} removed from project`,
      project_id: id,
      entity_type: 'project_staff',
      entity_id: memberId,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { memberId, role } = body;

    const { data, error } = await supabase
      .from('project_staff')
      .update({ role })
      .eq('id', memberId)
      .select(`
        *,
        staff:staff_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'team_member_role_changed',
      description: `${data.staff?.full_name}'s role changed to ${role}`,
      project_id: id,
      entity_type: 'project_staff',
      entity_id: memberId,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, team_member: data });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}