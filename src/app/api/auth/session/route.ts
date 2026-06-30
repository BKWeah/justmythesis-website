import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null, staff: null },
        { status: 200 }
      );
    }

    // Get staff user info
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('id, email, full_name, role')
      .eq('auth_uid', user.id)
      .single();

    return NextResponse.json({
      user,
      staff: staffData,
    }, { status: 200 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { user: null, staff: null, error: 'Session check failed' },
      { status: 500 }
    );
  }
}