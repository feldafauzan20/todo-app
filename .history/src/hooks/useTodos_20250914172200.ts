"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  user_id: string;
};

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

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

    // ✅ pastikan selalu array
    setTodos(Array.isArray(data) ? data : []);
  };

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

    // ✅ pastikan set array
    setTodos((prev) => [...prev, data]);
    toast.success("Task added successfully!");
  };

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

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
  };
}
