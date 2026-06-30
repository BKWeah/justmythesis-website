import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip auth check for login page - no Supabase client needed
  if (request.nextUrl.pathname === '/workspace/login') {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

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
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

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
    // If Supabase client fails, allow request to continue for login page
    // Other workspace routes will redirect to login via client-side check
  }

  return supabaseResponse;
}