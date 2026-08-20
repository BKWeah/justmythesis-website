import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { user: null, staff: null, error: 'Database not configured' },
      { status: 200 }
    );
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Get staff user info using service role to bypass RLS
let staffData = null;

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );

  const { data } = await adminClient
    .from('staff_users')
    .select('id, email, full_name, role')
    .eq('auth_uid', user.id)
    .single();

  staffData = data;
}

    return NextResponse.json({
      user,
      staff: staffData,
    }, { status: 200 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { user: null, staff: null, error: 'Session check failed' },
      { status: 200 }
    );
  }
}