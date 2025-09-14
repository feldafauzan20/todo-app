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

    const { data, error } = await supabase.from("todos").insert({ text }).select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Inserted todo:", data[0]);
    return NextResponse.json(data[0]);
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("POST /api/todos failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error("POST /api/todos failed:", err);
  return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
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
