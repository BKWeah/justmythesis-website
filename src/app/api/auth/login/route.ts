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

    // Track cookies set by Supabase
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSetFromSupabase) {
            cookiesToSet.push(...cookiesToSetFromSupabase);
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

    // Build success response and apply cookies
    const response = NextResponse.json(
      { success: true, user: data.user },
      { status: 200 }
    );

    // Apply all cookies that Supabase set
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}