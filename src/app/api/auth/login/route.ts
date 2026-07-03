import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.supabase.co');
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || !isValidSupabaseUrl(supabaseUrl)) {
      return NextResponse.json(
        { error: 'Database not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    // Create client with anon key for authentication
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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

    // Check if user is a staff member using service role key to bypass RLS
    if (data.user) {
      let staffData = null;

      // Try to query staff_users with service role key first (bypasses RLS)
      if (supabaseServiceKey) {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data: adminStaffData, error: adminError } = await adminClient
          .from('staff_users')
          .select('id, role')
          .eq('auth_uid', data.user.id)
          .single();

        if (!adminError && adminStaffData) {
          staffData = adminStaffData;
        }
      }

      // Fallback: try with anon key if service key not available
      if (!staffData) {
        const { data: anonStaffData } = await supabase
          .from('staff_users')
          .select('id, role')
          .eq('auth_uid', data.user.id)
          .single();

        staffData = anonStaffData;
      }

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