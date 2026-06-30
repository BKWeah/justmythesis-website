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
    const { title, description, due_date } = body;

    const { data, error } = await supabase
      .from('project_milestones')
      .insert({
        project_id: id,
        title,
        description,
        due_date,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'milestone_added',
      description: `Milestone added: ${title}`,
      project_id: id,
      entity_type: 'project_milestones',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, milestone: data });
  } catch (error) {
    console.error('Milestone API error:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
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
    const { milestoneId, action, data: milestoneData } = body;

    if (action === 'complete') {
      const { data, error } = await supabase
        .from('project_milestones')
        .update({
          status: 'Completed',
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        category: 'Project',
        action: 'milestone_completed',
        description: `Milestone completed: ${data.title}`,
        project_id: id,
        entity_type: 'project_milestones',
        entity_id: milestoneId,
        performed_by: staffData.id,
      });

      return NextResponse.json({ success: true, milestone: data });
    }

    if (action === 'update') {
      const { data, error } = await supabase
        .from('project_milestones')
        .update(milestoneData)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, milestone: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Milestone API error:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}