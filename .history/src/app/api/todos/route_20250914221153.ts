import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// type Todo update
type TodoUpdate = { text?: string; is_done?: boolean };

// helper ambil session user
async function getUserId() {
  try {
    const supabaseServer = createRouteHandlerClient({
      cookies: nextCookies,
    });

    console.log(nextCookies());
    // console.log("Cookies in request:", cookieList);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return null;
    }

    console.log("Session from supabaseServer:", session);

    if (!session?.user) return null;

    return { supabaseServer, userId: session.user.id };
  } catch (err: unknown) {
    console.error("getUserId error:", err);
    return null;
  }
}

// GET → fetch todos milik user
export async function GET() {
  const supabaseServer = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseServer
    .from("todos")
    .select("*")
    .eq("user_id", session.user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST → add new todo milik user
export async function POST(req: Request) {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("todos")
      .insert({ text: body.text, is_done: false, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Supabase query error (POST):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /todos unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

// PATCH → toggle / edit todo milik user
export async function PATCH(req: Request) {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

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

    if (error) {
      console.error("Supabase query error (PATCH):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { data, error } = await supabaseServer
      .from("todos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase query error (DELETE):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? null, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /todos unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
