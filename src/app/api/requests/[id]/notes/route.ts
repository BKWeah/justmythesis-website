import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
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

    const { id } = params;

    // Fetch notes
    const { data, error } = await supabase
      .from('internal_notes')
      .select(`
        *,
        staff:author_id (
          full_name
        )
      `)
      .eq('support_request_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const notes = (data || []).map((note: any) => ({
      ...note,
      author_name: note.staff?.full_name || 'Unknown',
    }));

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

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
      .select('id, full_name')
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
    const { content } = body;

    // Create note
    const { data, error } = await supabase
      .from('internal_notes')
      .insert({
        support_request_id: id,
        author_id: staffData.id,
        content,
      })
      .select(`
        *,
        staff:author_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      category: 'Request',
      action: 'note_added',
      description: 'Internal note added',
      support_request_id: id,
      entity_type: 'internal_notes',
      entity_id: data.id,
      performed_by: staffData.id,
    });

    return NextResponse.json({
      success: true,
      note: {
        ...data,
        author_name: data.staff?.full_name || staffData.full_name,
      },
    });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}