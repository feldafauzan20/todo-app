"use client";
import { useEffect, useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { LuBookOpenCheck } from "react-icons/lu";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
};

export default function Home() {
 const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    setLoading(true);
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
    setLoading(false);
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
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = async (id: number, is_done: boolean) => {
    try {
      // Optimistic update
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? { ...t, is_done } : t))
      );

      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_done }),
      });

      if (!res.ok) {
        // Revert optimistic update on error
        setTodos((prevTodos) =>
          prevTodos.map((t) => (t.id === id ? { ...t, is_done: !is_done } : t))
        );
        
        const errorData = await res.json();
        console.error("Failed to update todo:", errorData.error);
        
        // Optional: Show error to user
        alert(`Failed to update todo: ${errorData.error}`);
        return;
      }

      const updated = await res.json();
      // Update with server data
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (error) {
      // Revert optimistic update on network error
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? { ...t, is_done: !is_done } : t))
      );
      console.error("Error updating todo:", error);
      alert("Network error occurred while updating todo");
    }
  };

  const removeTodo = async (id: number) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-3 mb-6">
        To-Do App <LuBookOpenCheck />
      </h1>

      <TodoForm addTodo={addTodo} />

      {loading ? (
        <ul className="w-full max-w-md space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
            >
              {/* Text placeholder */}
              <div className="flex-1">
                <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Button placeholder */}
              <div className="w-8 h-6 bg-gray-300 rounded animate-pulse" />
            </li>
          ))}
        </ul>
      ) : (
        <TodoList todos={todos} removeTodo={removeTodo} toggleTodo={toggleTodo} />
      )}
    </main>
  );
}
