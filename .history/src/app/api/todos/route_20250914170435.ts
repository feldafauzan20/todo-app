import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// helper ambil session user
async function getUserId() {
  const supabaseServer = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user) return null;
  return { supabaseServer, userId: session.user.id };
}

// GET → fetch todos milik user
export async function GET() {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  const { data, error } = await supabaseServer
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// POST → add new todo milik user
export async function POST(req: Request) {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

  try {
    const { text } = await req.json();
    if (!text)
      return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const { data, error } = await supabaseServer
      .from("todos")
      .insert({ text, is_done: false, user_id: userId })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message },
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
    const { id, is_done, text } = await req.json();
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const check = await supabaseServer
      .from("todos")
      .select("*")
      .eq("id", Number(id))
      .eq("user_id", userId);

    if (!check.data || check.data.length === 0)
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    const updates: any = {};
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
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE → remove todo milik user
export async function DELETE(req: Request) {
  const result = await getUserId();
  if (!result)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseServer, userId } = result;

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

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}
