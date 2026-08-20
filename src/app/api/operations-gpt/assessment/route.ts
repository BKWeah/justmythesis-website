import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

interface AssessmentRequestBody {
  requestId?: string;
}

interface GeneratedAssessment {
  current_project_stage: string;
  completion_estimate: string;
  risk_level: 'Low' | 'Medium' | 'High';
  strengths: string;
  weaknesses: string;
  missing_requirements: string;
  compliance_issues: string;
  assessment_summary: string;
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
    .select('id, full_name, role')
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

function extractResponseText(responseData: any): string {
  if (typeof responseData?.output_text === 'string') {
    return responseData.output_text;
  }

  const output = Array.isArray(responseData?.output)
    ? responseData.output
    : [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];

    for (const contentItem of content) {
      if (
        contentItem?.type === 'output_text' &&
        typeof contentItem?.text === 'string'
      ) {
        return contentItem.text;
      }
    }
  }

  throw new Error('Operations GPT returned no assessment content');
}

function validateGeneratedAssessment(
  value: any
): GeneratedAssessment {
  const riskLevels = ['Low', 'Medium', 'High'];

  if (!value || typeof value !== 'object') {
    throw new Error('Operations GPT returned an invalid assessment');
  }

  return {
    current_project_stage:
      typeof value.current_project_stage === 'string'
        ? value.current_project_stage
        : '',
    completion_estimate:
      typeof value.completion_estimate === 'string'
        ? value.completion_estimate
        : '',
    risk_level: riskLevels.includes(value.risk_level)
      ? value.risk_level
      : 'Medium',
    strengths:
      typeof value.strengths === 'string' ? value.strengths : '',
    weaknesses:
      typeof value.weaknesses === 'string' ? value.weaknesses : '',
    missing_requirements:
      typeof value.missing_requirements === 'string'
        ? value.missing_requirements
        : '',
    compliance_issues:
      typeof value.compliance_issues === 'string'
        ? value.compliance_issues
        : '',
    assessment_summary:
      typeof value.assessment_summary === 'string'
        ? value.assessment_summary
        : '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      return NextResponse.json(
        {
          error:
            'Operations GPT is not configured. Add OPENAI_API_KEY to .env.local.',
        },
        { status: 503 }
      );
    }

    const authentication = await authenticateStaff(request);

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const body = (await request.json()) as AssessmentRequestBody;
    const requestId = body.requestId?.trim();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const adminClient = authentication.adminClient;

    const { data: supportRequest, error: requestError } =
      await adminClient
        .from('support_requests')
        .select(`
          *,
          clients:client_id (
            id,
            full_name,
            institution,
            programme,
            degree_level,
            academic_level
          )
        `)
        .eq('id', requestId)
        .single();

    if (requestError || !supportRequest) {
      return NextResponse.json(
        { error: 'Support request not found' },
        { status: 404 }
      );
    }

    const { data: documents } = await adminClient
      .from('documents')
      .select('file_name, category, description')
      .eq('support_request_id', requestId)
      .order('created_at', { ascending: true });

    const requestContext = {
      request_reference: supportRequest.request_reference,
      working_title: supportRequest.working_title,
      requested_service: supportRequest.requested_service,
      current_stage: supportRequest.current_stage,
      academic_level: supportRequest.academic_level,
      submission_deadline: supportRequest.submission_deadline,
      priority: supportRequest.priority,
      client: supportRequest.clients,
      submitted_documents: documents || [],
    };

    const model =
      process.env.OPENAI_MODEL || 'gpt-4.1-mini';

    const openAiResponse = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text: `You are Operations GPT for JUSTmyTHESIS, a professional research-support operations platform.

Your task is to prepare an internal draft assessment from the submitted request information.

Rules:
1. Do not invent documents, approvals, institutional requirements, facts, research findings, or client information.
2. Clearly identify missing information.
3. Use professional and concise language.
4. Evaluate feasibility, expected effort, risks, missing requirements, and compliance concerns.
5. Risk level must be exactly Low, Medium, or High.
6. Completion estimate must be realistic but clearly presented as an estimate.
7. This output is an internal draft for human staff review and must not be treated as final approval.
8. Return only valid JSON matching the required structure.`,
                },
              ],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: JSON.stringify(requestContext, null, 2),
                },
              ],
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'justmythesis_assessment',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  current_project_stage: {
                    type: 'string',
                  },
                  completion_estimate: {
                    type: 'string',
                  },
                  risk_level: {
                    type: 'string',
                    enum: ['Low', 'Medium', 'High'],
                  },
                  strengths: {
                    type: 'string',
                  },
                  weaknesses: {
                    type: 'string',
                  },
                  missing_requirements: {
                    type: 'string',
                  },
                  compliance_issues: {
                    type: 'string',
                  },
                  assessment_summary: {
                    type: 'string',
                  },
                },
                required: [
                  'current_project_stage',
                  'completion_estimate',
                  'risk_level',
                  'strengths',
                  'weaknesses',
                  'missing_requirements',
                  'compliance_issues',
                  'assessment_summary',
                ],
              },
            },
          },
        }),
      }
    );

    const openAiData = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.error(
        'Operations GPT assessment error:',
        openAiData
      );

      return NextResponse.json(
        {
          error:
            openAiData?.error?.message ||
            'Operations GPT failed to analyze the request',
        },
        { status: openAiResponse.status }
      );
    }

    const responseText = extractResponseText(openAiData);
    const parsedAssessment = JSON.parse(responseText);
    const assessment =
      validateGeneratedAssessment(parsedAssessment);

    await adminClient.from('activity_logs').insert({
      category: 'Operations GPT',
      action: 'assessment_draft_generated',
      description: `Assessment draft generated with Operations GPT by ${authentication.staff.full_name}`,
      support_request_id: requestId,
      entity_type: 'support_requests',
      entity_id: requestId,
      performed_by: authentication.staff.id,
    });

    return NextResponse.json({
      success: true,
      assessment,
      notice:
        'AI-generated draft. Staff review and approval are required before saving.',
    });
  } catch (error: any) {
    console.error(
      'Operations GPT assessment API error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to generate the assessment draft',
      },
      { status: 500 }
    );
  }
}