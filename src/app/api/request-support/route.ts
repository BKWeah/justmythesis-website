import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

type DatabaseDegreeLevel =
  | 'Undergraduate'
  | "Master's"
  | 'Doctoral'
  | 'Professional'
  | 'Other';

function normalizeDegreeLevel(
  value?: string | null
): DatabaseDegreeLevel {
  switch (value) {
    case 'Masters':
    case "Master's":
      return "Master's";

    case 'Doctoral':
      return 'Doctoral';

    case 'Professional':
      return 'Professional';

    case 'Other':
      return 'Other';

    case 'Undergraduate':
    default:
      return 'Undergraduate';
  }
}

function optionalText(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned || null;
}

function requiredText(
  value: string | null | undefined,
  fallback: string
) {
  const cleaned = value?.trim();
  return cleaned || fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body?.data;

    if (!data) {
      return NextResponse.json(
        { error: 'Request information is missing' },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const email = optionalText(data.email)?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const fullName = requiredText(
      data.fullName,
      'Unnamed Client'
    );

    const phone = requiredText(
      data.phone,
      'Not provided'
    );

    const institution = requiredText(
      data.institution,
      'Not provided'
    );

    const programme = requiredText(
      data.programme,
      'Not provided'
    );

    const degreeLevel = normalizeDegreeLevel(
      data.academicLevel
    );

    const {
      data: existingClient,
      error: lookupError,
    } = await supabase
      .from('clients')
      .select('id, full_name, email')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    let clientId: string;

    if (existingClient) {
      const { error: updateClientError } =
        await supabase
          .from('clients')
          .update({
            full_name: fullName,
            phone,
            whatsapp: phone,
            institution,
            degree_level: degreeLevel,
            programme,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingClient.id);

      if (updateClientError) {
        throw updateClientError;
      }

      clientId = existingClient.id;
    } else {
      const {
        data: newClient,
        error: createClientError,
      } = await supabase
        .from('clients')
        .insert({
          full_name: fullName,
          phone,
          whatsapp: phone,
          email,
          institution,
          degree_level: degreeLevel,
          programme,
          notes: '',
        })
        .select('id')
        .single();

      if (createClientError) {
        throw createClientError;
      }

      clientId = newClient.id;
    }

    const {
      data: supportRequest,
      error: requestError,
    } = await supabase
      .from('support_requests')
      .insert({
        client_id: clientId,
        working_title: optionalText(
          data.workingTitle
        ),
        academic_level:
          data.academicLevel || null,
        current_stage: optionalText(
          data.currentStage
        ),
        requested_service: optionalText(
          data.requestedService
        ),
        submission_deadline: optionalText(
          data.submissionDeadline
        ),
        priority: data.priority || 'Normal',
        support_description: optionalText(
          data.supportDescription
        ),
        status: 'New Request',
        source: 'website',
      })
      .select('request_reference, id')
      .single();

    if (requestError) {
      throw requestError;
    }

    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        category: 'Request',
        action: 'created',
        description:
          'New support request submitted via website form',
        client_id: clientId,
        support_request_id: supportRequest.id,
        entity_type: 'support_requests',
        entity_id: supportRequest.id,
        metadata: {
          source: 'website',
          academic_level:
            data.academicLevel || null,
          requested_service:
            data.requestedService || null,
        },
      });

    if (activityError) {
      console.error(
        'Request activity log error:',
        activityError
      );
    }

    return NextResponse.json(
      {
        success: true,
        reference:
          supportRequest.request_reference,
        requestId: supportRequest.id,
        clientId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      'Request support API error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to submit request',
      },
      { status: 500 }
    );
  }
}