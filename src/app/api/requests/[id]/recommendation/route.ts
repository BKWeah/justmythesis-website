import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

type RecommendationStatus =
  | 'Draft'
  | 'Approved Internally'
  | 'Sent to Client'
  | 'Accepted'
  | 'Rejected';

interface RecommendationPayload {
  recommended_service?: string | null;
  recommended_timeline?: string | null;
  recommended_fee?: number | string | null;
  payment_structure?: string | null;
  roadmap_summary?: string | null;
  recommendation_summary?: string | null;
  status?: RecommendationStatus;
  client_feedback?: string | null;
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Database service role is not configured');
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
        { error: 'Database is not configured' },
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
    .select('id, full_name')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied. Staff accounts only.' },
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

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function normalizeFee(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const fee =
    typeof value === 'number'
      ? value
      : Number.parseFloat(value);

  if (!Number.isFinite(fee) || fee < 0) {
    throw new Error(
      'Recommended fee must be a valid positive amount'
    );
  }

  return fee;
}

function normalizePayload(body: RecommendationPayload) {
  return {
    recommended_service: normalizeText(
      body.recommended_service
    ),
    recommended_timeline: normalizeText(
      body.recommended_timeline
    ),
    recommended_fee: normalizeFee(body.recommended_fee),
    payment_structure: normalizeText(
      body.payment_structure
    ),
    roadmap_summary: normalizeText(body.roadmap_summary),
    recommendation_summary: normalizeText(
      body.recommendation_summary
    ),
    status: body.status || 'Draft',
    client_feedback: normalizeText(body.client_feedback),
  };
}

function validatePayload(
  payload: ReturnType<typeof normalizePayload>
) {
  if (!payload.recommended_service) {
    throw new Error('Recommended service is required');
  }

  if (!payload.recommended_timeline) {
    throw new Error('Recommended timeline is required');
  }

  if (payload.recommended_fee === null) {
    throw new Error('Recommended fee is required');
  }

  if (!payload.payment_structure) {
    throw new Error('Payment structure is required');
  }

  if (!payload.recommendation_summary) {
    throw new Error('Recommendation summary is required');
  }

  if (
    payload.status === 'Rejected' &&
    !payload.client_feedback
  ) {
    throw new Error(
      'Client feedback is required when rejecting a recommendation'
    );
  }
}

async function updateRequestStatus(
  adminClient: ReturnType<typeof createAdminClient>,
  requestId: string,
  recommendationStatus: RecommendationStatus
) {
  if (recommendationStatus === 'Sent to Client') {
    const { error } = await adminClient
      .from('support_requests')
      .update({ status: 'Recommendation Sent' })
      .eq('id', requestId);

    if (error) throw error;
    return;
  }

  if (recommendationStatus === 'Accepted') {
    const { error } = await adminClient
      .from('support_requests')
      .update({ status: 'Approved' })
      .eq('id', requestId);

    if (error) throw error;
    return;
  }

  if (recommendationStatus === 'Rejected') {
    const { error } = await adminClient
      .from('support_requests')
      .update({ status: 'Declined' })
      .eq('id', requestId);

    if (error) throw error;
  }
}

function getActivityDetails(status: RecommendationStatus) {
  switch (status) {
    case 'Approved Internally':
      return {
        action: 'recommendation_approved',
        description: 'Recommendation approved internally',
      };

    case 'Sent to Client':
      return {
        action: 'recommendation_sent',
        description: 'Recommendation sent to client',
      };

    case 'Accepted':
      return {
        action: 'recommendation_accepted',
        description: 'Recommendation accepted by client',
      };

    case 'Rejected':
      return {
        action: 'recommendation_rejected',
        description: 'Recommendation rejected by client',
      };

    default:
      return {
        action: 'recommendation_drafted',
        description: 'Recommendation saved as draft',
      };
  }
}

function getDecisionFields(
  status: RecommendationStatus,
  clientFeedback: string | null
) {
  if (status === 'Accepted') {
    return {
      client_feedback: clientFeedback,
      client_decision_at: new Date().toISOString(),
    };
  }

  if (status === 'Rejected') {
    return {
      client_feedback: clientFeedback,
      client_decision_at: new Date().toISOString(),
    };
  }

  return {
    client_feedback: null,
    client_decision_at: null,
  };
}

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

    const requestId = params.id;
    const body =
      (await request.json()) as RecommendationPayload;

    const recommendationData = normalizePayload(body);

    validatePayload(recommendationData);

    const { data: supportRequest, error: requestError } =
      await authentication.adminClient
        .from('support_requests')
        .select('id')
        .eq('id', requestId)
        .single();

    if (requestError || !supportRequest) {
      return NextResponse.json(
        { error: 'Support request not found' },
        { status: 404 }
      );
    }

    const { data: existingRecommendation } =
      await authentication.adminClient
        .from('recommendations')
        .select('id')
        .eq('support_request_id', requestId)
        .maybeSingle();

    if (existingRecommendation) {
      return NextResponse.json(
        {
          error:
            'A recommendation already exists for this request. Update the existing recommendation instead.',
        },
        { status: 409 }
      );
    }

    const decisionFields = getDecisionFields(
      recommendationData.status,
      recommendationData.client_feedback
    );

    const { data: recommendation, error: recommendationError } =
      await authentication.adminClient
        .from('recommendations')
        .insert({
          support_request_id: requestId,
          recommended_service:
            recommendationData.recommended_service,
          recommended_timeline:
            recommendationData.recommended_timeline,
          recommended_fee:
            recommendationData.recommended_fee,
          payment_structure:
            recommendationData.payment_structure,
          roadmap_summary:
            recommendationData.roadmap_summary,
          recommendation_summary:
            recommendationData.recommendation_summary,
          status: recommendationData.status,
          ...decisionFields,
          created_by: authentication.staff.id,
        })
        .select('*')
        .single();

    if (recommendationError) {
      throw recommendationError;
    }

    await updateRequestStatus(
      authentication.adminClient,
      requestId,
      recommendationData.status
    );

    const activity = getActivityDetails(
      recommendationData.status
    );

    await authentication.adminClient
      .from('activity_logs')
      .insert({
        category: 'Request',
        action: activity.action,
        description: `${activity.description} by ${authentication.staff.full_name}`,
        support_request_id: requestId,
        entity_type: 'recommendations',
        entity_id: recommendation.id,
        performed_by: authentication.staff.id,
      });

    return NextResponse.json(
      {
        success: true,
        recommendation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Recommendation POST error:', error);

    return NextResponse.json(
      {
        error:
          error?.message || 'Failed to save recommendation',
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

    const requestId = params.id;
    const body =
      (await request.json()) as RecommendationPayload;

    const recommendationData = normalizePayload(body);

    validatePayload(recommendationData);

    const {
      data: existingRecommendation,
      error: lookupError,
    } = await authentication.adminClient
      .from('recommendations')
      .select('id')
      .eq('support_request_id', requestId)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!existingRecommendation) {
      return NextResponse.json(
        {
          error:
            'No recommendation exists for this request',
        },
        { status: 404 }
      );
    }

    const decisionFields = getDecisionFields(
      recommendationData.status,
      recommendationData.client_feedback
    );

    const { data: recommendation, error: recommendationError } =
      await authentication.adminClient
        .from('recommendations')
        .update({
          recommended_service:
            recommendationData.recommended_service,
          recommended_timeline:
            recommendationData.recommended_timeline,
          recommended_fee:
            recommendationData.recommended_fee,
          payment_structure:
            recommendationData.payment_structure,
          roadmap_summary:
            recommendationData.roadmap_summary,
          recommendation_summary:
            recommendationData.recommendation_summary,
          status: recommendationData.status,
          ...decisionFields,
          updated_at: new Date().toISOString(),
        })
        .eq('support_request_id', requestId)
        .select('*')
        .single();

    if (recommendationError) {
      throw recommendationError;
    }

    await updateRequestStatus(
      authentication.adminClient,
      requestId,
      recommendationData.status
    );

    const activity = getActivityDetails(
      recommendationData.status
    );

    await authentication.adminClient
      .from('activity_logs')
      .insert({
        category: 'Request',
        action: activity.action,
        description: `${activity.description} by ${authentication.staff.full_name}`,
        support_request_id: requestId,
        entity_type: 'recommendations',
        entity_id: recommendation.id,
        performed_by: authentication.staff.id,
      });

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error: any) {
    console.error('Recommendation PATCH error:', error);

    return NextResponse.json(
      {
        error:
          error?.message || 'Failed to update recommendation',
      },
      { status: 500 }
    );
  }
}