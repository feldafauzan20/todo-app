import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Exchange code for session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      if (!session) {
        console.error("No session created");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Tambahkan timestamp untuk mencegah cache
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set('t', Date.now().toString());

      // Set headers yang lebih ketat
      return NextResponse.redirect(redirectUrl, {
        status: 302,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'SameSite': 'Lax',
          'Set-Cookie': `session-last-access=${Date.now()}; path=/; HttpOnly`
        }
      });
    }

    console.error("No code provided in callback");
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
