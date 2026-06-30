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
    const { isDraft, ...recommendationData } = body;

    // Create recommendation
    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        support_request_id: id,
        recommended_service: recommendationData.recommended_service,
        timeline: recommendationData.timeline,
        estimated_cost: recommendationData.estimated_cost,
        payment_structure: recommendationData.payment_structure,
        summary: recommendationData.summary,
        is_draft: isDraft,
        created_by: staffData.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Request',
      action: isDraft ? 'recommendation_drafted' : 'recommendation_sent',
      description: isDraft ? 'Recommendation saved as draft' : 'Recommendation sent to client',
      support_request_id: id,
      entity_type: 'recommendations',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    // Update request status if sent
    if (!isDraft) {
      await supabase
        .from('support_requests')
        .update({ status: 'Recommendation Sent' })
        .eq('id', id);
    }

    return NextResponse.json({ success: true, recommendation: data });
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Failed to save recommendation' },
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
    const { isDraft, ...recommendationData } = body;

    // Update recommendation
    const { data, error } = await supabase
      .from('recommendations')
      .update({
        recommended_service: recommendationData.recommended_service,
        timeline: recommendationData.timeline,
        estimated_cost: recommendationData.estimated_cost,
        payment_structure: recommendationData.payment_structure,
        summary: recommendationData.summary,
        is_draft: isDraft,
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
      action: isDraft ? 'recommendation_drafted' : 'recommendation_sent',
      description: isDraft ? 'Recommendation updated (draft)' : 'Recommendation sent to client',
      support_request_id: id,
      entity_type: 'recommendations',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    // Update request status if sent
    if (!isDraft) {
      await supabase
        .from('support_requests')
        .update({ status: 'Recommendation Sent' })
        .eq('id', id);
    }

    return NextResponse.json({ success: true, recommendation: data });
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}