import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// type Todo update
type TodoUpdate = { text?: string; is_done?: boolean };

// helper ambil session user
async function getUserId() {
  try {
    // Pakai cookies dari Next.js App Router
    const supabaseServer = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return null;
    }

    if (!session?.user) return null;

    return { supabaseServer, userId: session.user.id };
  } catch (err: unknown) {
    console.error("getUserId error:", err);
    return null;
  }
}

// GET - fetch todos with priority
export async function GET() {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - create todo with priority
export async function POST(req: Request) {
  const { text, priority = "medium" } = await req.json(); // tambahkan priority
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("todos")
    .insert([{ text, user_id: session.user.id, priority }]) // tambahkan priority
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

// PATCH → toggle / edit todo milik user
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE → remove todo milik user
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (id) {
      // Delete single todo
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;
    } else {
      // Delete all todos
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("user_id", session.user.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
