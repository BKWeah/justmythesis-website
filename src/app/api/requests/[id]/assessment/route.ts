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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is staff
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Create assessment
    const { data, error } = await supabase
      .from('request_assessments')
      .insert({
        support_request_id: id,
        complexity: body.complexity,
        risk_level: body.risk_level,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        missing_requirements: body.missing_requirements,
        assessment_summary: body.assessment_summary,
        assessed_by: staffData.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Request',
      action: 'assessment_saved',
      description: 'Assessment saved',
      support_request_id: id,
      entity_type: 'request_assessments',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    // Update request status if needed
    const { data: requestData } = await supabase
      .from('support_requests')
      .select('status')
      .eq('id', id)
      .single();

    if (requestData?.status === 'Under Review') {
      await supabase
        .from('support_requests')
        .update({ status: 'Ready for Assessment' })
        .eq('id', id);
    }

    return NextResponse.json({ success: true, assessment: data });
  } catch (error) {
    console.error('Assessment API error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is staff
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Update assessment
    const { data, error } = await supabase
      .from('request_assessments')
      .update({
        complexity: body.complexity,
        risk_level: body.risk_level,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        missing_requirements: body.missing_requirements,
        assessment_summary: body.assessment_summary,
        updated_by: staffData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('support_request_id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Request',
      action: 'assessment_updated',
      description: 'Assessment updated',
      support_request_id: id,
      entity_type: 'request_assessments',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, assessment: data });
  } catch (error) {
    console.error('Assessment API error:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}