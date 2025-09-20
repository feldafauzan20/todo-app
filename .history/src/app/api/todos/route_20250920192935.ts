import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Await the cookies
    const cookieStore = cookies();
    const token = await cookieStore.get("sb-zobtvnminagptpzifhgn-auth-token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const cookieStore = cookies();
    const token = await cookieStore.get("sb-zobtvnminagptpzifhgn-auth-token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updates } = await request.json();

    const { data, error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
