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

type ProjectType =
  | 'Proposal Development'
  | 'Foundation Thesis'
  | 'Complete Thesis Development'
  | 'Thesis Rescue'
  | 'Formatting & Compliance'
  | 'Defense Presentation';

function normalizeProjectType(value?: string | null): ProjectType | null {
  const normalized = value?.trim();
  switch (normalized) {
    case 'A - Proposal Development': case 'Proposal Development': return 'Proposal Development';
    case 'B - Foundation Thesis': case 'Foundation Thesis': return 'Foundation Thesis';
    case 'C - Complete Thesis Development': case 'Complete Thesis Development': return 'Complete Thesis Development';
    case 'D - Thesis Rescue': case 'Thesis Rescue': return 'Thesis Rescue';
    case 'E - Formatting & Compliance': case 'Formatting & Compliance': return 'Formatting & Compliance';
    case 'F - Defense Presentation': case 'Defense Presentation': return 'Defense Presentation';
    default: return null;
  }
}

async function authenticateStaff(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return { errorResponse: NextResponse.json({ error: 'Database not configured' }, { status: 503 }), adminClient: null, staff: null };

  const authClient = createServerClient(supabaseUrl, anonKey, {
    cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} },
  });
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), adminClient: null, staff: null };

  const adminClient = createAdminClient();
  const { data: staff, error: staffError } = await adminClient.from('staff_users').select('id, full_name, email, role').eq('auth_uid', user.id).single();
  if (staffError || !staff) return { errorResponse: NextResponse.json({ error: 'Access denied' }, { status: 403 }), adminClient: null, staff: null };
  return { errorResponse: null, adminClient, staff };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authentication = await authenticateStaff(request);
    if (authentication.errorResponse || !authentication.adminClient || !authentication.staff) return authentication.errorResponse!;
    const adminClient = authentication.adminClient;
    const { id } = params;

    const { data: requestData, error: requestError } = await adminClient.from('support_requests').select(`*, clients:client_id (*)`).eq('id', id).single();
    if (requestError || !requestData) return NextResponse.json({ error: requestError?.message || 'Request not found' }, { status: 404 });

    const [documentsResult, notesResult, activityResult, assessmentResult, recommendationResult, projectResult] = await Promise.allSettled([
      adminClient.from('documents').select('*').eq('support_request_id', id).order('created_at', { ascending: true }),
      adminClient.from('internal_notes').select('*').eq('support_request_id', id).order('created_at', { ascending: false }),
      adminClient.from('activity_logs').select('*').eq('support_request_id', id).order('created_at', { ascending: false }),
      adminClient.from('assessments').select('*').eq('support_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      adminClient.from('recommendations').select('*').eq('support_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      adminClient.from('projects').select('id, project_reference, project_title, status').eq('support_request_id', id).maybeSingle(),
    ]);

    const documents = documentsResult.status === 'fulfilled' ? documentsResult.value.data || [] : [];
    const rawNotes = notesResult.status === 'fulfilled' ? notesResult.value.data || [] : [];
    const rawActivities = activityResult.status === 'fulfilled' ? activityResult.value.data || [] : [];
    const assessment = assessmentResult.status === 'fulfilled' ? assessmentResult.value.data || null : null;
    const recommendation = recommendationResult.status === 'fulfilled' ? recommendationResult.value.data || null : null;
    const project = projectResult.status === 'fulfilled' ? projectResult.value.data || null : null;

    return NextResponse.json({ request: { ...requestData, staff: null, documents, notes: rawNotes.map((n: any) => ({ ...n, author_name: n.author_name || 'Staff' })), activities: rawActivities.map((a: any) => ({ ...a, performer_name: a.performer_name || 'System' })), assessment, recommendation, project } });
  } catch (error: any) {
    console.error('Request detail API error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch request' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authentication = await authenticateStaff(request);
    if (authentication.errorResponse || !authentication.adminClient || !authentication.staff) return authentication.errorResponse!;
    const adminClient = authentication.adminClient;
    const staffData = authentication.staff;
    const { id } = params;
    const body = await request.json();
    const { action, data: updateData } = body;

    switch (action) {
      case 'update_status': {
        const status = updateData?.status;
        if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        const { data, error } = await adminClient.from('support_requests').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        await adminClient.from('activity_logs').insert({ category: 'Request', action: 'status_changed', description: `Status changed to ${status}`, support_request_id: id, entity_type: 'support_requests', entity_id: id, performed_by: staffData.id });
        return NextResponse.json({ success: true, data });
      }

      case 'assign_staff': {
        const staffId = updateData?.staffId;
        if (!staffId) return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
        const { data, error } = await adminClient.from('support_requests').update({ assigned_staff_id: staffId }).eq('id', id).select().single();
        if (error) throw error;
        const { data: assignedStaff } = await adminClient.from('staff_users').select('full_name').eq('id', staffId).single();
        await adminClient.from('activity_logs').insert({ category: 'Request', action: 'staff_assigned', description: `Assigned to ${assignedStaff?.full_name || 'staff member'}`, support_request_id: id, entity_type: 'support_requests', entity_id: id, performed_by: staffData.id });
        return NextResponse.json({ success: true, data });
      }

      case 'convert_to_project': {
        const { project_title, start_date, deadline, service_package } = updateData || {};
        if (!project_title) return NextResponse.json({ error: 'Project title is required' }, { status: 400 });

        const { data: requestData, error: requestError } = await adminClient.from('support_requests').select('*').eq('id', id).single();
        if (requestError || !requestData) throw requestError || new Error('Request not found');

        const { data: recommendation, error: recommendationError } = await adminClient.from('recommendations').select('id, status, recommended_service').eq('support_request_id', id).maybeSingle();
        if (recommendationError) throw recommendationError;
        if (!recommendation || recommendation.status !== 'Accepted') return NextResponse.json({ error: 'Project conversion is available only after the client accepts the recommendation.' }, { status: 409 });

        const { data: existingProject, error: existingProjectError } = await adminClient.from('projects').select('id, project_reference, project_title, status').eq('support_request_id', id).maybeSingle();
        if (existingProjectError) throw existingProjectError;
        if (existingProject) {
          if (requestData.status !== 'Project Activated') await adminClient.from('support_requests').update({ status: 'Project Activated' }).eq('id', id);
          return NextResponse.json({ error: `This request has already been converted to project ${existingProject.project_reference}.`, project: existingProject }, { status: 409 });
        }

        const approvedService = normalizeProjectType(service_package || recommendation.recommended_service);
        if (!approvedService) return NextResponse.json({ error: 'The selected service package is not supported by the projects table.' }, { status: 400 });

        const { data: project, error: projectError } = await adminClient.from('projects').insert({ support_request_id: id, client_id: requestData.client_id, project_title: project_title.trim(), approved_service: approvedService, start_date, expected_delivery_date: deadline || null, status: 'Project Activated', completion_percentage: 0, notes: `Created from support request ${requestData.request_reference || id}.` }).select('*').single();
        if (projectError) throw projectError;

        const { error: requestUpdateError } = await adminClient.from('support_requests').update({ status: 'Project Activated' }).eq('id', id);
        if (requestUpdateError) {
          await adminClient.from('projects').delete().eq('id', project.id);
          throw requestUpdateError;
        }

        const { error: documentLinkError } = await adminClient.from('documents').update({ project_id: project.id }).eq('support_request_id', id);
        if (documentLinkError) console.error('Document project-linking error:', documentLinkError);

        const { error: activityError } = await adminClient.from('activity_logs').insert({ category: 'Project', action: 'project_created', description: `Project ${project.project_reference} created from request`, client_id: requestData.client_id, support_request_id: id, project_id: project.id, entity_type: 'projects', entity_id: project.id, performed_by: staffData.id, metadata: { project_reference: project.project_reference, recommendation_id: recommendation.id } });
        if (activityError) console.error('Project activity log error:', activityError);

        return NextResponse.json({ success: true, project, request_status: 'Project Activated' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Request update API error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update request' }, { status: 500 });
  }
}
