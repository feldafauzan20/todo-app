"use client";

import { useEffect, useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { LuBookOpenCheck } from "react-icons/lu";

export default function Home() {
  const [todos, setTodos] = useState<{ id: number; text: string }[]>([]);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (text: string) => {
    if (!text.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
  };

  const removeTodo = async (id: number) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-pink-100 to-blue-100 p-6">
        <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-3 mb-6">
          To-Do App <LuBookOpenCheck />
        </h1>

      <TodoForm addTodo={addTodo} />

      <TodoList todos={todos} removeTodo={(id) => removeTodo(id)} />
    </main>
  );
}
