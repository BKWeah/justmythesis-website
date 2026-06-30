import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Check if user is a staff member
    if (data.user) {
      const { data: staffData } = await supabase
        .from('staff_users')
        .select('id, role')
        .eq('auth_uid', data.user.id)
        .single();

      if (!staffData) {
        // Sign out if not a staff member
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: 'Access denied. Staff accounts only.' },
          { status: 403 }
        );
      }
    }

    const response = NextResponse.json(
      { success: true, user: data.user },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}