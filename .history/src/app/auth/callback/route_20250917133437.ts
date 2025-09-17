import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Define url outside try-catch to make it accessible in catch block
  const url = new URL(request.url);
  
  try {
    const code = url.searchParams.get("code");

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to dashboard using the request URL's origin
    return NextResponse.redirect(new URL("/dashboard", url.origin));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", url.origin));
  }
}
