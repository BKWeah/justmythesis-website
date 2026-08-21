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
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

async function authenticateStaff(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      errorResponse: NextResponse.json({ error: 'Database not configured' }, { status: 503 }),
      adminClient: null,
      staff: null,
      applyAuthCookies: (response: NextResponse) => response,
    };
  }

  const cookiesToSet: CookieToSet[] = [];
  const authClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookiesToSet.push({ name, value, options });
        });
      },
    },
  });

  const { data: { user }, error: userError } = await authClient.auth.getUser();

  const applyAuthCookies = (response: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
    });
    return response;
  };

  if (userError || !user) {
    return {
      errorResponse: applyAuthCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })),
      adminClient: null,
      staff: null,
      applyAuthCookies,
    };
  }

  const adminClient = createAdminClient();
  const { data: staff, error: staffError } = await adminClient
    .from('staff_users')
    .select('id')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: applyAuthCookies(NextResponse.json({ error: 'Access denied' }, { status: 403 })),
      adminClient: null,
      staff: null,
      applyAuthCookies,
    };
  }

  return { errorResponse: null, adminClient, staff, applyAuthCookies };
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.errorResponse || !auth.adminClient || !auth.staff) return auth.errorResponse!;

    const { id } = params;
    const { title, description, due_date } = await request.json();

    if (!title?.trim() || !due_date) {
      return auth.applyAuthCookies(NextResponse.json({ error: 'Title and due date are required' }, { status: 400 }));
    }

    const { data, error } = await auth.adminClient
      .from('project_milestones')
      .insert({ project_id: id, title: title.trim(), description, due_date, status: 'Pending' })
      .select()
      .single();

    if (error) throw error;

    await auth.adminClient.from('activity_logs').insert({
      category: 'Project',
      action: 'milestone_added',
      description: `Milestone added: ${title.trim()}`,
      project_id: id,
      entity_type: 'project_milestones',
      entity_id: data.id,
      performed_by: auth.staff.id,
    });

    return auth.applyAuthCookies(NextResponse.json({ success: true, milestone: data }));
  } catch (error) {
    console.error('Milestone API error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateStaff(request);
    if (auth.errorResponse || !auth.adminClient || !auth.staff) return auth.errorResponse!;

    const { id } = params;
    const { milestoneId, action, data: milestoneData } = await request.json();

    if (!milestoneId) {
      return auth.applyAuthCookies(NextResponse.json({ error: 'Milestone ID is required' }, { status: 400 }));
    }

    if (action === 'complete') {
      const { data, error } = await auth.adminClient
        .from('project_milestones')
        .update({ status: 'Completed', completed_date: new Date().toISOString().split('T')[0] })
        .eq('id', milestoneId)
        .eq('project_id', id)
        .select()
        .single();

      if (error) throw error;

      await auth.adminClient.from('activity_logs').insert({
        category: 'Project',
        action: 'milestone_completed',
        description: `Milestone completed: ${data.title}`,
        project_id: id,
        entity_type: 'project_milestones',
        entity_id: milestoneId,
        performed_by: auth.staff.id,
      });

      return auth.applyAuthCookies(NextResponse.json({ success: true, milestone: data }));
    }

    if (action === 'update') {
      const { data, error } = await auth.adminClient
        .from('project_milestones')
        .update(milestoneData)
        .eq('id', milestoneId)
        .eq('project_id', id)
        .select()
        .single();

      if (error) throw error;
      return auth.applyAuthCookies(NextResponse.json({ success: true, milestone: data }));
    }

    return auth.applyAuthCookies(NextResponse.json({ error: 'Invalid action' }, { status: 400 }));
  } catch (error) {
    console.error('Milestone API error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}
