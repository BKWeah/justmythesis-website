import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import {
  NextResponse,
  type NextRequest,
} from 'next/server';

export const dynamic = 'force-dynamic';

type DatabaseQAStatus =
  | 'Pending'
  | 'Passed'
  | 'Needs Correction';

interface StaffRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface QAReviewRecord {
  id: string;
  project_id: string;
  review_round: number;
  structure_review: string | null;
  formatting_review: string | null;
  citation_review: string | null;
  compliance_review: string | null;
  final_notes: string | null;
  status: DatabaseQAStatus;
  is_passed: boolean | null;
  issues_found_count: number | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface QARequestBody {
  structure_review?: unknown;
  formatting_review?: unknown;
  citation_review?: unknown;
  compliance_review?: unknown;
  reviewer_notes?: unknown;
  final_notes?: unknown;
  overall_status?: unknown;
  status?: unknown;
}

interface AuthenticationResult {
  adminClient: SupabaseClient | null;
  staff: StaffRecord | null;
  errorResponse: NextResponse | null;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function createAdminClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new ApiError(
      'Database service role not configured.',
      503
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function normalizeRole(role: string | null): string {
  return (role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function canManageQA(role: string | null): boolean {
  const normalizedRole = normalizeRole(role);

  return [
    'super_admin',
    'operations_manager',
    'qa_specialist',
    'quality_assurance_specialist',
  ].includes(normalizedRole);
}

async function authenticateStaff(): Promise<AuthenticationResult> {
  const authClient = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  const adminClient = createAdminClient();

  const {
    data: staff,
    error: staffError,
  } = await adminClient
    .from('staff_users')
    .select('id, full_name, email, role')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    console.error(
      'QA staff authentication failed:',
      staffError
    );

    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied.' },
        { status: 403 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  if (!canManageQA(staff.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          error:
            'Your staff role is not authorized to manage QA reviews.',
        },
        { status: 403 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  return {
    errorResponse: null,
    adminClient,
    staff: staff as StaffRecord,
  };
}

async function verifyProject(
  adminClient: SupabaseClient,
  projectId: string
): Promise<void> {
  const {
    data: project,
    error,
  } = await adminClient
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    console.error(
      'QA project verification failed:',
      error
    );

    throw new ApiError(
      'Unable to verify the project.',
      500
    );
  }

  if (!project) {
    throw new ApiError(
      'Project not found.',
      404
    );
  }
}

async function getLatestQAReview(
  adminClient: SupabaseClient,
  projectId: string
): Promise<QAReviewRecord | null> {
  const {
    data,
    error,
  } = await adminClient
    .from('qa_reviews')
    .select(`
      id,
      project_id,
      review_round,
      structure_review,
      formatting_review,
      citation_review,
      compliance_review,
      final_notes,
      status,
      is_passed,
      issues_found_count,
      reviewed_by,
      created_at,
      updated_at
    `)
    .eq('project_id', projectId)
    .order('review_round', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      'QA review database query failed:',
      error
    );

    throw new ApiError(
      'Unable to retrieve the QA review.',
      500
    );
  }

  return data
    ? (data as QAReviewRecord)
    : null;
}

async function getReviewerName(
  adminClient: SupabaseClient,
  reviewedBy: string | null
): Promise<string | null> {
  if (!reviewedBy) {
    return null;
  }

  const {
    data,
    error,
  } = await adminClient
    .from('staff_users')
    .select('full_name')
    .eq('id', reviewedBy)
    .maybeSingle();

  if (error) {
    console.error(
      'QA reviewer lookup failed:',
      error
    );

    return null;
  }

  return data?.full_name ?? null;
}

function mapDatabaseStatusToInterface(
  status: DatabaseQAStatus
): string {
  switch (status) {
    case 'Passed':
      return 'Approved';

    case 'Needs Correction':
      return 'Corrections Required';

    default:
      return 'Pending';
  }
}

function mapInterfaceStatusToDatabase(
  status: unknown
): DatabaseQAStatus {
  if (typeof status !== 'string') {
    throw new ApiError(
      'Overall status is required.',
      400
    );
  }

  const normalizedStatus = status
    .trim()
    .toLowerCase();

  switch (normalizedStatus) {
    case 'approved':
    case 'passed':
      return 'Passed';

    case 'corrections required':
    case 'needs correction':
      return 'Needs Correction';

    case 'pending':
    case 'in progress':
      return 'Pending';

    default:
      throw new ApiError(
        'Overall status must be Pending, Approved, or Corrections Required.',
        400
      );
  }
}

function requireText(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    throw new ApiError(
      `${fieldName} is required.`,
      400
    );
  }

  return value.trim();
}

function optionalText(
  value: unknown
): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0
    ? trimmedValue
    : null;
}

function mapReviewForResponse(
  review: QAReviewRecord,
  reviewerName: string | null
) {
  return {
    id: review.id,
    project_id: review.project_id,
    review_round: review.review_round,
    structure_review:
      review.structure_review ?? '',
    formatting_review:
      review.formatting_review ?? '',
    citation_review:
      review.citation_review ?? '',
    compliance_review:
      review.compliance_review ?? '',
    reviewer_notes:
      review.final_notes ?? '',
    final_notes:
      review.final_notes ?? '',
    overall_status:
      mapDatabaseStatusToInterface(
        review.status
      ),
    status: review.status,
    is_passed:
      review.is_passed ??
      review.status === 'Passed',
    issues_found_count:
      review.issues_found_count,
    reviewed_by:
      review.reviewed_by,
    reviewed_by_name:
      reviewerName,
    created_at:
      review.created_at,
    updated_at:
      review.updated_at,
  };
}

async function writeActivityLog(
  adminClient: SupabaseClient,
  values: {
    action: string;
    description: string;
    projectId: string;
    reviewId: string;
    performedBy: string;
  }
): Promise<void> {
  const { error } = await adminClient
    .from('activity_logs')
    .insert({
      category: 'Project',
      action: values.action,
      description: values.description,
      project_id: values.projectId,
      entity_type: 'qa_reviews',
      entity_id: values.reviewId,
      performed_by: values.performedBy,
    });

  if (error) {
    console.error(
      'QA activity log failed:',
      error
    );
  }
}

function errorResponse(
  error: unknown
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error(
    'Unexpected QA API error:',
    error
  );

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected QA server error.',
    },
    { status: 500 }
  );
}

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const authentication =
      await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    await verifyProject(
      authentication.adminClient,
      params.id
    );

    const review =
      await getLatestQAReview(
        authentication.adminClient,
        params.id
      );

    if (!review) {
      return NextResponse.json({
        success: true,
        qa_review: null,
      });
    }

    const reviewerName =
      await getReviewerName(
        authentication.adminClient,
        review.reviewed_by
      );

    return NextResponse.json({
      success: true,
      qa_review: mapReviewForResponse(
        review,
        reviewerName
      ),
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const authentication =
      await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    await verifyProject(
      authentication.adminClient,
      params.id
    );

    const body =
      (await request.json()) as QARequestBody;

    const structureReview = requireText(
      body.structure_review,
      'Structure review'
    );

    const formattingReview = requireText(
      body.formatting_review,
      'Formatting review'
    );

    const citationReview = requireText(
      body.citation_review,
      'Citation review'
    );

    const complianceReview = requireText(
      body.compliance_review,
      'Compliance review'
    );

    const finalNotes = optionalText(
      body.reviewer_notes ??
        body.final_notes
    );

    const databaseStatus =
      mapInterfaceStatusToDatabase(
        body.overall_status ??
          body.status
      );

    const existingReview =
      await getLatestQAReview(
        authentication.adminClient,
        params.id
      );

    let savedReview: QAReviewRecord;

    if (existingReview) {
      const {
        data,
        error,
      } = await authentication.adminClient
        .from('qa_reviews')
        .update({
          structure_review:
            structureReview,
          formatting_review:
            formattingReview,
          citation_review:
            citationReview,
          compliance_review:
            complianceReview,
          final_notes:
            finalNotes,
          status:
            databaseStatus,
          is_passed:
            databaseStatus === 'Passed',
          reviewed_by:
            authentication.staff.id,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', existingReview.id)
        .eq('project_id', params.id)
        .select(`
          id,
          project_id,
          review_round,
          structure_review,
          formatting_review,
          citation_review,
          compliance_review,
          final_notes,
          status,
          is_passed,
          issues_found_count,
          reviewed_by,
          created_at,
          updated_at
        `)
        .single();

      if (error || !data) {
        console.error(
          'QA review update failed:',
          error
        );

        throw new ApiError(
          'Unable to update the QA review.',
          500
        );
      }

      savedReview =
        data as QAReviewRecord;

      await writeActivityLog(
        authentication.adminClient,
        {
          action: 'qa_review_updated',
          description:
            `QA review updated: ${databaseStatus}.`,
          projectId: params.id,
          reviewId: savedReview.id,
          performedBy:
            authentication.staff.id,
        }
      );
    } else {
      const {
        data,
        error,
      } = await authentication.adminClient
        .from('qa_reviews')
        .insert({
          project_id:
            params.id,
          review_round:
            1,
          structure_review:
            structureReview,
          formatting_review:
            formattingReview,
          citation_review:
            citationReview,
          compliance_review:
            complianceReview,
          final_notes:
            finalNotes,
          status:
            databaseStatus,
          is_passed:
            databaseStatus === 'Passed',
          reviewed_by:
            authentication.staff.id,
        })
        .select(`
          id,
          project_id,
          review_round,
          structure_review,
          formatting_review,
          citation_review,
          compliance_review,
          final_notes,
          status,
          is_passed,
          issues_found_count,
          reviewed_by,
          created_at,
          updated_at
        `)
        .single();

      if (error || !data) {
        console.error(
          'QA review creation failed:',
          error
        );

        throw new ApiError(
          'Unable to create the QA review.',
          500
        );
      }

      savedReview =
        data as QAReviewRecord;

      await writeActivityLog(
        authentication.adminClient,
        {
          action: 'qa_review_saved',
          description:
            `QA review saved: ${databaseStatus}.`,
          projectId: params.id,
          reviewId: savedReview.id,
          performedBy:
            authentication.staff.id,
        }
      );
    }

    const reviewerName =
      authentication.staff.full_name ??
      authentication.staff.email;

    return NextResponse.json({
      success: true,
      qa_review:
        mapReviewForResponse(
          savedReview,
          reviewerName
        ),
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const authentication =
      await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    await verifyProject(
      authentication.adminClient,
      params.id
    );

    const body =
      (await request.json()) as QARequestBody;

    const databaseStatus =
      mapInterfaceStatusToDatabase(
        body.overall_status ??
          body.status
      );

    const existingReview =
      await getLatestQAReview(
        authentication.adminClient,
        params.id
      );

    if (!existingReview) {
      throw new ApiError(
        'No QA review was found for this project.',
        404
      );
    }

    const {
      data,
      error,
    } = await authentication.adminClient
      .from('qa_reviews')
      .update({
        status:
          databaseStatus,
        is_passed:
          databaseStatus === 'Passed',
        reviewed_by:
          authentication.staff.id,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', existingReview.id)
      .eq('project_id', params.id)
      .select(`
        id,
        project_id,
        review_round,
        structure_review,
        formatting_review,
        citation_review,
        compliance_review,
        final_notes,
        status,
        is_passed,
        issues_found_count,
        reviewed_by,
        created_at,
        updated_at
      `)
      .single();

    if (error || !data) {
      console.error(
        'QA status update failed:',
        error
      );

      throw new ApiError(
        'Unable to update the QA status.',
        500
      );
    }

    const savedReview =
      data as QAReviewRecord;

    await writeActivityLog(
      authentication.adminClient,
      {
        action: 'qa_status_changed',
        description:
          `QA status changed to ${databaseStatus}.`,
        projectId: params.id,
        reviewId: savedReview.id,
        performedBy:
          authentication.staff.id,
      }
    );

    const reviewerName =
      authentication.staff.full_name ??
      authentication.staff.email;

    return NextResponse.json({
      success: true,
      qa_review:
        mapReviewForResponse(
          savedReview,
          reviewerName
        ),
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}