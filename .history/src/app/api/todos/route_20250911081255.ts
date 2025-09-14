import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// GET → fetch all todos
export async function GET() {
  const { data, error } = await supabase.from("todos").select("*").order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST → add new todo
export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("todos")
      .insert({ text, is_done: false }) // ✅ tambahin default false
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data[0]);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH → toggle todo
export async function PATCH(req: Request) {
  const { id, is_done } = await req.json();

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("todos")
    .update({ is_done })
    .eq("id", id)
    .select()
    .single(); // ✅ pastikan hanya satu row

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 }); // ✅ tidak mungkin kosong
}



// DELETE → remove todo by id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase.from("todos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id });
}
