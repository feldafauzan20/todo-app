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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("todos")
    .select("id, text, is_done, priority") // tambahkan priority
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
export async function PATCH(req: Request) {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { id, is_done, text } = body;

    const check = await supabaseServer
      .from("todos")
      .select("*")
      .eq("id", Number(id))
      .eq("user_id", userId);

    if (!check.data || check.data.length === 0)
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    const updates: TodoUpdate = {};
    if (is_done !== undefined) updates.is_done = is_done;
    if (text !== undefined) updates.text = text;

    const { data, error } = await supabaseServer
      .from("todos")
      .update(updates)
      .eq("id", Number(id))
      .eq("user_id", userId)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data?.[0] ?? null);
  } catch (err: unknown) {
    console.error("PATCH /todos unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
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
