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
      await supabase.auth.exchangeCodeForSession(code);

      // Log untuk debugging
      console.log("Auth callback successful, redirecting to /");
    }

    // Explicit redirect dengan cache control
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
