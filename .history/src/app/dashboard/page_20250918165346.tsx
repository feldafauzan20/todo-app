"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { LuBookOpenCheck, LuCheckCircle2, LuListTodo, LuLoader2, LuLogOut } from "react-icons/lu";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchTodos();
      }
    };
    checkUser();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const res = await fetch("/api/todos", { credentials: "include" });
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  };

  const addTodo = async (text: string) => {
    if (!text.trim()) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        return;
      }

      // data harus object todo
      setTodos((prev) => [...(prev ?? []), data]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id: number, is_done: boolean) => {
    const previousTodos = [...todos];
    const todoExists = todos.find((todo) => todo.id === id);

    if (!todoExists) {
      console.warn("Todo with id", id, "does not exist in local state");
      return;
    }

    try {
      // Optimistic update
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? { ...todo, is_done } : todo))
      );

      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), is_done }),
      });

      const data = await res.json();

      if (!res.ok || !data) {
        setTodos(previousTodos);
        throw new Error(data?.error || "Unknown error");
      }
    } catch (error: unknown) {
      setTodos(previousTodos);
      console.error("Toggle todo error:", (error as Error).message);
    }
  };

  const updateTodo = async (id: number, text: string) => {
    const previousTodos = [...todos];
    try {
      // Optimistic update
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
      );

      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text }),
      });

      if (!res.ok) {
        setTodos(previousTodos);
        throw new Error("Failed to update todo text");
      }
    } catch (err) {
      setTodos(previousTodos);
      console.error(err);
    }
  };

  const removeTodo = async (id: number) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error.message);
    else window.location.href = "/";
  };

  // Add statistics calculations
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.is_done).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LuBookOpenCheck className="h-8 w-8 text-pink-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Todo Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LuLogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{totalTodos}</p>
              </div>
              <LuListTodo className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTodos}</p>
              </div>
              <LuCheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                  />
                  <circle
                    className="text-pink-600"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                    strokeDasharray={`${completionRate * 1.25} 125`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Todo Management Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h2>
            <TodoForm addTodo={addTodo} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LuLoader2 className="h-8 w-8 text-pink-600 animate-spin" />
              </div>
            ) : (
              <TodoList
                todos={todos}
                removeTodo={removeTodo}
                toggleTodo={toggleTodo}
                updateTodo={updateTodo}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
