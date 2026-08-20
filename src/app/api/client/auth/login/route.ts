import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

interface CookieToSet {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === 'https:' &&
      parsedUrl.hostname.includes('.supabase.co')
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const email =
      typeof requestBody.email === 'string'
        ? requestBody.email.trim().toLowerCase()
        : '';
    const password =
      typeof requestBody.password === 'string'
        ? requestBody.password
        : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !isValidSupabaseUrl(supabaseUrl)
    ) {
      return NextResponse.json(
        {
          error:
            'Authentication service is not configured. Please contact support.',
        },
        { status: 503 }
      );
    }

    const cookiesToSet: CookieToSet[] = [];

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies);
          },
        },
      }
    );

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error: 'Invalid email or password.',
        },
        { status: 401 }
      );
    }

    let clientProfile: {
      id: string;
      full_name: string;
      email: string;
    } | null = null;

    if (supabaseServiceRoleKey) {
      const adminClient = createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data } = await adminClient
        .from('clients')
        .select('id, full_name, email')
        .eq('auth_uid', authData.user.id)
        .maybeSingle();

      clientProfile = data;
    }

    if (!clientProfile) {
      const { data } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('auth_uid', authData.user.id)
        .maybeSingle();

      clientProfile = data;
    }

    if (!clientProfile) {
      await supabase.auth.signOut();

      const deniedResponse = NextResponse.json(
        {
          error: 'Access denied. Client accounts only.',
        },
        { status: 403 }
      );

      cookiesToSet.forEach(({ name, value, options }) => {
        deniedResponse.cookies.set(
          name,
          value,
          options as Parameters<
            typeof deniedResponse.cookies.set
          >[2]
        );
      });

      return deniedResponse;
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        client: clientProfile,
      },
      { status: 200 }
    );

    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(
        name,
        value,
        options as Parameters<typeof response.cookies.set>[2]
      );
    });

    return response;
  } catch (error) {
    console.error('Client login error:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}