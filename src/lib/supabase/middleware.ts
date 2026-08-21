import { createServerClient } from '@supabase/ssr';
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

const PUBLIC_WORKSPACE_ROUTES = new Set([
  '/workspace/login',
  '/workspace/forgot-password',
  '/workspace/reset-password',
]);

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicWorkspaceRoute = PUBLIC_WORKSPACE_ROUTES.has(pathname);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !isValidSupabaseUrl(supabaseUrl)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isWorkspaceRoute = pathname.startsWith('/workspace');

    if (!user && isWorkspaceRoute && !isPublicWorkspaceRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/workspace/login';
      return NextResponse.redirect(url);
    }

    if (user && pathname === '/workspace/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/workspace/dashboard';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Supabase middleware error:', error);
  }

  return supabaseResponse;
}
