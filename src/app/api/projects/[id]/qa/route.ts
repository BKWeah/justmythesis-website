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

    // Check if QA review already exists
    const { data: existing } = await supabase
      .from('project_qa_reviews')
      .select('id')
      .eq('project_id', id)
      .single();

    let data, error;

    if (existing) {
      // Update existing review
      const result = await supabase
        .from('project_qa_reviews')
        .update({
          structure_review: body.structure_review,
          formatting_review: body.formatting_review,
          citation_review: body.citation_review,
          compliance_review: body.compliance_review,
          overall_status: body.overall_status,
          reviewer_notes: body.reviewer_notes,
          updated_by: staffData.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new review
      const result = await supabase
        .from('project_qa_reviews')
        .insert({
          project_id: id,
          structure_review: body.structure_review,
          formatting_review: body.formatting_review,
          citation_review: body.citation_review,
          compliance_review: body.compliance_review,
          overall_status: body.overall_status,
          reviewer_notes: body.reviewer_notes,
          reviewed_by: staffData.id,
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'qa_review_saved',
      description: `QA review saved: ${body.overall_status}`,
      project_id: id,
      entity_type: 'project_qa_reviews',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, qa_review: data });
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json(
      { error: 'Failed to save QA review' },
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
    const { status } = body;

    // Get existing review
    const { data: existing } = await supabase
      .from('project_qa_reviews')
      .select('id')
      .eq('project_id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'No QA review found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('project_qa_reviews')
      .update({
        overall_status: status,
        updated_by: staffData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Project',
      action: 'qa_status_changed',
      description: `QA status changed to ${status}`,
      project_id: id,
      entity_type: 'project_qa_reviews',
      entity_id: existing.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({ success: true, qa_review: data });
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json(
      { error: 'Failed to update QA review' },
      { status: 500 }
    );
  }
}