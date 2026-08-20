import { createServerClient } from '@supabase/ssr/dist/module/createServerClient';
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

export async function updateSession(request: NextRequest) {
  // Skip auth check for login page - no Supabase client needed
  if (request.nextUrl.pathname === '/workspace/login') {
    return NextResponse.next({ request });
  }

  // Check if Supabase is configured with valid URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !isValidSupabaseUrl(supabaseUrl)) {
    // Supabase not configured or invalid URL - allow all requests through
    // Pages will handle auth state gracefully
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected workspace routes require authentication
    const isWorkspaceRoute = request.nextUrl.pathname.startsWith('/workspace');
    const isAuthRoute = request.nextUrl.pathname.startsWith('/workspace/login');

    if (!user && isWorkspaceRoute && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/workspace/login';
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/workspace/dashboard';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // If Supabase client fails, allow request to continue
    // Client-side checks will handle auth state
    console.error('Supabase middleware error:', error);
  }

  return supabaseResponse;
}