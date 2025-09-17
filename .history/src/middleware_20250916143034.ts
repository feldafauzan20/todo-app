import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle auth callback
  const isAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback');
  if (isAuthCallback) {
    return res;
  }

  // Protected routes
  if (!session) {
    // Exclude login page from redirect
    if (req.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } else {
    // User is signed in
    if (req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth callback
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
};
