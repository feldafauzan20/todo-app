"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import {
  BookOpenCheck,
  CheckCircle2,
  ListTodo,
  Loader,
  LogOut,
  Search,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // 👉 filter & search
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

  const [animatedRate, setAnimatedRate] = useState(0);

  const getProgressColor = (rate: number) => {
    if (rate < 30) return "text-red-500";
    if (rate < 70) return "text-yellow-500";
    return "text-green-500";
  };

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

  const addTodo = async (
    text: string,
    priority: "low" | "medium" | "high" = "medium"
  ) => {
    if (!text.trim()) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setTodos((prev) => [...(prev ?? []), data]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id: number, is_done: boolean) => {
    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, is_done } : todo))
    );

    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_done }),
      });
      const data = await res.json();
      if (!res.ok || !data) setTodos(previousTodos);
    } catch {
      setTodos(previousTodos);
    }
  };

  const updateTodo = async (id: number, text: string) => {
    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text }),
      });
      if (!res.ok) setTodos(previousTodos);
    } catch {
      setTodos(previousTodos);
    }
  };

  const removeTodo = async (id: number) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = "/";
  };

  // 👉 Stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.is_done).length;
  const completionRate = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  useEffect(() => {
    const start = animatedRate;
    const end = completionRate;
    let startTime: number | null = null;
    const duration = 500;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      setAnimatedRate(value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [completionRate]);

  // 👉 filtered & searched todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active" && todo.is_done) return false;
    if (filter === "completed" && !todo.is_done) return false;
    if (search && !todo.text.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-pink-500" />
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filter */}
            <div className="flex gap-2">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    filter === f
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Todos */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Your Tasks</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 text-pink-500 animate-spin" />
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.is_done}
                      onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                      className="h-4 w-4 text-pink-500 rounded border-gray-300"
                    />
                    <span
                      className={`${
                        todo.is_done ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  {/* Priority tag */}
                  {todo.priority && (
                    <span
                      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        todo.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : todo.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <Tag className="h-3 w-3" />
                      {todo.priority}
                    </span>
                  )}
                </li>
              ))}
              {!filteredTodos.length && (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No tasks found
                </p>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
