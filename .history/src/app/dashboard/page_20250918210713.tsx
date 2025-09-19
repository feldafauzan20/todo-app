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
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/modal/ConfirmModal";
import EditModal from "@/components/modal/EditModal";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 👉 Animated completion rate
  const [animatedRate, setAnimatedRate] = useState(0);

  // 👉 Filter & search
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

  // 👉 Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    todoId: number | null;
  }>({
    isOpen: false,
    todoId: null,
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    todo: Todo | null;
  }>({
    isOpen: false,
    todo: null,
  });

  // 👉 helper untuk pilih warna sesuai progress
  const getProgressColor = (rate: number) => {
    if (rate < 30) return "text-red-500"; // rendah
    if (rate < 70) return "text-yellow-500"; // sedang
    return "text-green-500"; // tinggi
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
    priority: "low" | "medium" | "high" = "low"
  ) => {
    if (!text.trim()) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
    } catch (error) {
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

  // 👉 calculate real completionRate
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.is_done).length;
  const completionRate = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  // 👉 animate completionRate changes
  useEffect(() => {
    const start = animatedRate;
    const end = completionRate;
    let startTime: number | null = null;

    const duration = 500; // ms
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      setAnimatedRate(value);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [completionRate]);

  // 👉 apply filter & search
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-6 w-6 text-pink-500" />
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2 relative w-8 h-8"
              >
                <motion.span
                  className="absolute block h-0.5 w-5 bg-current transform transition-all duration-300"
                  style={{
                    top: "35%",
                    left: "50%",
                    translateX: "-50%",
                  }}
                  animate={
                    isMenuOpen
                      ? {
                          rotate: 45,
                          top: "50%",
                        }
                      : {
                          rotate: 0,
                          top: "35%",
                        }
                  }
                />
                <motion.span
                  className="absolute block h-0.5 w-5 bg-current transform transition-all duration-300"
                  style={{
                    top: "50%",
                    left: "50%",
                    translateX: "-50%",
                  }}
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                />
                <motion.span
                  className="absolute block h-0.5 w-5 bg-current transform transition-all duration-300"
                  style={{
                    top: "65%",
                    left: "50%",
                    translateX: "-50%",
                  }}
                  animate={
                    isMenuOpen
                      ? {
                          rotate: -45,
                          top: "50%",
                        }
                      : {
                          rotate: 0,
                          top: "65%",
                        }
                  }
                />
              </motion.button>
            </div>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-gray-200 overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  exit={{ y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 py-4 space-y-3"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-2 text-sm text-gray-600"
                  >
                    {user?.email}
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 
                   hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {totalTodos}
                </p>
              </div>
              <ListTodo className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {completedTodos}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {animatedRate}%
                </p>
              </div>
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 transform -rotate-90">
                  {/* background circle */}
                  <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="20"
                    cy="20"
                  />
                  {/* animated circle */}
                  <circle
                    className={`${getProgressColor(
                      animatedRate
                    )} transition-all duration-500`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="20"
                    cy="20"
                    strokeDasharray={`${animatedRate} 100`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Todos */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Add New Task
            </h2>
            <TodoForm addTodo={addTodo} />
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Filter */}
            <div className="flex gap-2">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-md text-sm border ${
                    filter === f
                      ? "bg-pink-100 text-pink-600 border-pink-300"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-black pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Your Tasks
            </h2>
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
                          todo.is_done
                            ? "line-through text-gray-400"
                            : "text-black"
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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

                      {/* Edit and Delete buttons */}
                      <button
                        onClick={() => setEditModal({ isOpen: true, todo })}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ isOpen: true, todoId: todo.id })
                        }
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, todoId: null })}
          onConfirm={() => {
            if (deleteModal.todoId) {
              removeTodo(deleteModal.todoId);
            }
          }}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
        />

        <EditModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, todo: null })}
          onSave={(text) => {
            if (editModal.todo) {
              updateTodo(editModal.todo.id, text);
            }
          }}
          initialText={editModal.todo?.text || ""}
        />
      </main>
    </div>
  );
}
