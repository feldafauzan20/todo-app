"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TodoList from "@/components/TodoList";
import toast from "react-hot-toast";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  user_id: string;
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil todos milik user yang login
  const fetchTodos = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      toast.error("Please login first!");
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("id", { ascending: true });

    setLoading(false);
    if (error) return toast.error(error.message);
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = async (text: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return toast.error("Please login first!");

    const { data, error } = await supabase
      .from("todos")
      .insert({ text, is_done: false, user_id: session.user.id })
      .select()
      .single();

    if (error) return toast.error(error.message);
    setTodos((prev) => [...prev, data]);
    toast.success("Task added successfully!");
  };

  // Toggle todo
  const toggleTodo = async (id: number, is_done: boolean) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return toast.error("Please login first!");

    const { data, error } = await supabase
      .from("todos")
      .update({ is_done })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) return toast.error(error.message);
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  // Update todo text
  const updateTodo = async (id: number, text: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return toast.error("Please login first!");

    const { data, error } = await supabase
      .from("todos")
      .update({ text })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) return toast.error(error.message);
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  // Remove todo
  const removeTodo = async (id: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return toast.error("Please login first!");

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) return toast.error(error.message);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted successfully!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Todo List</h1>
      <TodoList
        todos={Array.isArray(todos) ? todos : []}
        removeTodo={removeTodo}
        toggleTodo={toggleTodo}
        updateTodo={updateTodo}
      />
    </div>
  );
}
