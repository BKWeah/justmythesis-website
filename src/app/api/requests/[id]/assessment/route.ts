import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

type AssessmentStatus = 'Draft' | 'Completed';
type RiskLevel = 'Low' | 'Medium' | 'High';

interface AssessmentPayload {
  current_project_stage?: string | null;
  completion_estimate?: string | null;
  risk_level?: RiskLevel | null;
  strengths?: string | null;
  weaknesses?: string | null;
  missing_requirements?: string | null;
  compliance_issues?: string | null;
  assessment_summary?: string | null;
  status?: AssessmentStatus;
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role is not configured');
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
      error: NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      ),
      staff: null,
      adminClient: null,
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
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      staff: null,
      adminClient: null,
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
      error: NextResponse.json(
        { error: 'Access denied. Staff accounts only.' },
        { status: 403 }
      ),
      staff: null,
      adminClient: null,
    };
  }

  return {
    error: null,
    staff,
    adminClient,
  };
}

function normalizePayload(body: AssessmentPayload) {
  return {
    current_project_stage: body.current_project_stage?.trim() || null,
    completion_estimate: body.completion_estimate?.trim() || null,
    risk_level: body.risk_level || null,
    strengths: body.strengths?.trim() || null,
    weaknesses: body.weaknesses?.trim() || null,
    missing_requirements: body.missing_requirements?.trim() || null,
    compliance_issues: body.compliance_issues?.trim() || null,
    assessment_summary: body.assessment_summary?.trim() || null,
    status: body.status || 'Draft',
  };
}

async function updateRequestStatus(
  adminClient: ReturnType<typeof createAdminClient>,
  requestId: string,
  assessmentStatus: AssessmentStatus
) {
  if (assessmentStatus === 'Completed') {
    await adminClient
      .from('support_requests')
      .update({ status: 'Assessment Complete' })
      .eq('id', requestId);

    return;
  }

  const { data: requestData } = await adminClient
    .from('support_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (
    requestData?.status === 'New Request' ||
    requestData?.status === 'Under Review'
  ) {
    await adminClient
      .from('support_requests')
      .update({ status: 'Ready for Assessment' })
      .eq('id', requestId);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff(request);

    if (
      authentication.error ||
      !authentication.staff ||
      !authentication.adminClient
    ) {
      return authentication.error!;
    }

    const { id } = params;
    const body = (await request.json()) as AssessmentPayload;
    const assessmentData = normalizePayload(body);

    const { data: existingAssessment } = await authentication.adminClient
      .from('assessments')
      .select('id')
      .eq('support_request_id', id)
      .maybeSingle();

    if (existingAssessment) {
      return NextResponse.json(
        {
          error:
            'An assessment already exists for this request. Update the existing assessment instead.',
        },
        { status: 409 }
      );
    }

    const { data: assessment, error: assessmentError } =
      await authentication.adminClient
        .from('assessments')
        .insert({
          support_request_id: id,
          ...assessmentData,
          created_by: authentication.staff.id,
        })
        .select('*')
        .single();

    if (assessmentError) {
      throw assessmentError;
    }

    await updateRequestStatus(
      authentication.adminClient,
      id,
      assessmentData.status
    );

    await authentication.adminClient.from('activity_logs').insert({
      category: 'Request',
      action:
        assessmentData.status === 'Completed'
          ? 'assessment_completed'
          : 'assessment_saved',
      description:
        assessmentData.status === 'Completed'
          ? `Assessment completed by ${authentication.staff.full_name}`
          : `Assessment draft saved by ${authentication.staff.full_name}`,
      support_request_id: id,
      entity_type: 'assessments',
      entity_id: assessment.id,
      performed_by: authentication.staff.id,
    });

    return NextResponse.json(
      {
        success: true,
        assessment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Assessment POST error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to save assessment',
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
      authentication.error ||
      !authentication.staff ||
      !authentication.adminClient
    ) {
      return authentication.error!;
    }

    const { id } = params;
    const body = (await request.json()) as AssessmentPayload;
    const assessmentData = normalizePayload(body);

    const { data: assessment, error: assessmentError } =
      await authentication.adminClient
        .from('assessments')
        .update({
          ...assessmentData,
          updated_at: new Date().toISOString(),
        })
        .eq('support_request_id', id)
        .select('*')
        .single();

    if (assessmentError) {
      throw assessmentError;
    }

    await updateRequestStatus(
      authentication.adminClient,
      id,
      assessmentData.status
    );

    await authentication.adminClient.from('activity_logs').insert({
      category: 'Request',
      action:
        assessmentData.status === 'Completed'
          ? 'assessment_completed'
          : 'assessment_updated',
      description:
        assessmentData.status === 'Completed'
          ? `Assessment completed by ${authentication.staff.full_name}`
          : `Assessment updated by ${authentication.staff.full_name}`,
      support_request_id: id,
      entity_type: 'assessments',
      entity_id: assessment.id,
      performed_by: authentication.staff.id,
    });

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error: any) {
    console.error('Assessment PATCH error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to update assessment',
      },
      { status: 500 }
    );
  }
}