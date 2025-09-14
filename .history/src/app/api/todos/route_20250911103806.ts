import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// GET → fetch all todos
export async function GET() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("id", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// POST → add new todo
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text)
      return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("todos")
      .insert({ text, is_done: false })
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

// PATCH → toggle todo / edit text
export async function PATCH(req: Request) {
  try {
    const { id, is_done, text } = await req.json(); // tambahkan text

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Cek apakah todo ada
    const check = await supabase.from("todos").select("*").eq("id", Number(id));
    if (!check.data || check.data.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // Siapkan object update
    const updates: any = {};
    if (is_done !== undefined) updates.is_done = is_done;
    if (text !== undefined) updates.text = text;

    // Update todo
    const { data, error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", Number(id))
      .select(); // jangan .single() supaya tetap array

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0)
      return NextResponse.json(
        { error: "Todo not found after update" },
        { status: 404 }
      );

    return NextResponse.json(data[0]); // kembalikan satu item
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE → remove todo by id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}
