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

// PATCH → toggle todo
export async function PATCH(req: Request) {
  try {
    const { id, is_done } = await req.json();
    console.log("Received update request for:", { id, is_done });
    console.log("ID type:", typeof id, "Value:", id);
    console.log("is_done type:", typeof is_done, "Value:", is_done);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // LOG SEBELUM UPDATE → cek apakah record ada di DB
    const check = await supabase.from("todos").select("*").eq("id", Number(id));
    console.log("DB lookup before update:", check);

    if (!check.data || check.data.length === 0) {
      console.warn("Todo not found in DB before update for id", id);
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // Update todo
    const { data, error } = await supabase
      .from("todos")
      .update({ is_done })
      .eq("id", Number(id))
      .select(); // Remove .single()

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Todo not found after update" },
        { status: 404 }
      );
    }

    console.log("Successfully updated todo:", data[0]);
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("PATCH error:", error);
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
