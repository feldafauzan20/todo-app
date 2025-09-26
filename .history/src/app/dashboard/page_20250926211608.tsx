"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ListTodo,
  Loader,
  LogOut,
  Search,
  Flag,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/modal/ConfirmModal";
import EditModal from "@/components/edit/EditModal";
import TodoList from "@/components/TodoList";
import AddTodoModal from "@/components/modal/AddTodoModal";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useOverdueManager } from "@/hooks/useOverdueManager";
import { useReminderManager } from "@/hooks/useReminderManager";
import NotificationSettings from "@/components/NotificationSettings";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string;
  reminder?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [animatedRate, setAnimatedRate] = useState(0);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    todoId: number | null;
    itemName: string;
  }>({
    isOpen: false,
    todoId: null,
    itemName: "",
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    todo: Todo | null;
  }>({
    isOpen: false,
    todo: null,
  });
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ✅ FIX: Add toast hook
  const { toasts, removeToast, showReminder } = useToast();

  const { permission, isGranted, isSupported, requestPermission } =
    useNotificationPermission();

  const { overdueCount, hasOverdue, isOverdue, clearTaskNotification } =
    useOverdueManager(todos, isGranted);

  // ✅ FIX: Use showReminder from useToast hook and get remindedTasks
  const { remindedTasks, clearReminderEffect } = useReminderManager(
    todos,
    showReminder
  );

  // 👉 helper untuk pilih warna sesuai progress
  const getProgressColor = (rate: number) => {
    if (rate < 30) return "text-red-500"; // rendah
    if (rate < 70) return "text-yellow-500"; // sedang
    return "text-green-500"; // tinggi
  };

  // ✅ TAMBAHKAN useEffect UNTUK SYNC SOUND STATUS DI SINI
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundEnabled(localStorage.getItem("notification-sound") !== "false");
    }
  }, []);

  // ✅ TAMBAHKAN FUNCTION TOGGLE SOUND MOBILE DI SINI
  const toggleSoundMobile = async () => {
    const { notificationService } = await import(
      "@/services/NotificationService"
    );
    const newStatus = notificationService.toggleSound();
    setSoundEnabled(newStatus);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  // The second useEffect already handles fetching todos when user is set
  useEffect(() => {
    const getTodos = async () => {
      if (!user) return; // Add this check

      try {
        const { data, error } = await supabase
          .from("todos")
          .select("id, text, is_done, priority, deadline, reminder, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setTodos(data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching todos:", error);
        setLoading(false);
      }
    };

    getTodos();
  }, [user]);

  const addTodo = async (
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => {
    const toastId = toast.loading("Adding task...");

    try {
      // Prepare payload dengan data yang clean
      const payload: {
        text: string;
        priority: "low" | "medium" | "high";
        deadline?: string;
        reminder?: string;
      } = {
        text: text.trim(),
        priority,
      };

      // Hanya tambahkan deadline jika ada dan tidak kosong
      if (deadline && deadline.trim() !== "") {
        payload.deadline = deadline;
      }

      // Hanya tambahkan reminder jika ada dan tidak kosong
      if (reminder && reminder.trim() !== "") {
        payload.reminder = reminder;
      }

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      if (data && Array.isArray(data) && data.length > 0) {
        setTodos((prev) => [...prev, ...data]);
        toast.success("Task added successfully!", { id: toastId });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add task", { id: toastId });
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

      // Clear notification if task completed
      if (is_done) {
        clearTaskNotification(id);
      }
    } catch {
      setTodos(previousTodos);
    }
  };

  const updateTodo = async (
    id: number,
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => {
    try {
      const toastId = toast.loading("Updating task...");

      const { data, error } = await supabase
        .from("todos")
        .update({
          text,
          priority,
          deadline: deadline || null,
          reminder: reminder || null,
        })
        .eq("id", id)
        .select();

      if (error) throw error;

      if (data) {
        setTodos(
          todos.map((todo) =>
            todo.id === id
              ? { ...todo, text, priority, deadline, reminder }
              : todo
          )
        );
        toast.success("Task updated successfully!", { id: toastId });
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update task");
    }
  };

  const removeTodo = async (id: number) => {
    const toastId = toast.loading("Deleting task..."); // Add this line

    try {
      await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted successfully!", { id: toastId });

      // Clear notification when deleted
      clearTaskNotification(id);
    } catch {
      toast.error("Failed to delete task", { id: toastId });
    }
  };

  const deleteAllTodos = async () => {
    const toastId = toast.loading("Deleting all tasks...");
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("user_id", user?.id);

      if (error) throw error;

      setTodos([]);
      toast.success("All tasks deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting all todos:", error);
      toast.error("Failed to delete tasks", { id: toastId });
    }
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
  const animatedRateRef = useRef(0);

  useEffect(() => {
    const currentAnimatedRate = animatedRateRef.current;

    // Skip jika nilai sudah sama
    if (Math.abs(currentAnimatedRate - completionRate) < 1) return;

    let startTime: number | null = null;
    let animationFrame: number;
    const startValue = currentAnimatedRate;
    const endValue = completionRate;
    const duration = 800;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = Math.round(
        startValue + (endValue - startValue) * easedProgress
      );

      setAnimatedRate(currentValue);
      animatedRateRef.current = currentValue; // ✅ Keep ref in sync

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [completionRate]); // ✅ Clean deps array

  // ✅ Initialize ref when component mounts
  useEffect(() => {
    animatedRateRef.current = animatedRate;
  }, [animatedRate]);

  // Fix the second useEffect
  useEffect(() => {
    if (todos.length === 0 && animatedRate !== 0) {
      setAnimatedRate(0);
    }
  }, [todos.length, animatedRate]);

  // Add priority order helper
  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "active" && todo.is_done) return false;
      if (filter === "completed" && !todo.is_done) return false;
      if (search && !todo.text.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .filter((todo) => {
      if (priorityFilter === "all") return true;
      return todo.priority === priorityFilter;
    })
    // Add sorting by priority
    .sort((a, b) => {
      // First sort by priority
      const priorityA = priorityOrder[a.priority || "low"];
      const priorityB = priorityOrder[b.priority || "low"];
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      // If same priority, sort by completion status
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1;
      }
      // If same completion status, sort by id (most recent first)
      return b.id - a.id;
    });

  // Add priority statistics
  const highPriorityTodos = todos.filter(
    (todo) => todo.priority === "high"
  ).length;
  const mediumPriorityTodos = todos.filter(
    (todo) => todo.priority === "medium"
  ).length;
  const lowPriorityTodos = todos.filter(
    (todo) => todo.priority === "low"
  ).length;

  // ✅ ADD reminder manager (mirip dengan overdue manager)
  useReminderManager(todos, showReminder);
  useOverdueManager(todos, isGranted); // ✅ FIX: Add isGranted parameter

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-2xl"
              >
                📋
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Dashboard
                {/* Badge overdue indicator */}
                {hasOverdue && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {overdueCount}
                  </motion.span>
                )}
              </h1>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              {/* Overdue indicator text */}
              {hasOverdue && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {overdueCount} overdue task{overdueCount > 1 ? "s" : ""}
                </motion.div>
              )}

              {/* Tambahkan Notification Settings */}
              <NotificationSettings
                permission={permission}
                isGranted={isGranted}
                isSupported={isSupported}
                requestPermission={requestPermission}
              />

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
                  {/* Overdue indicator untuk mobile */}
                  {hasOverdue && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mx-1"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {overdueCount} overdue task{overdueCount > 1 ? "s" : ""}
                      </span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                        {overdueCount}
                      </span>
                    </motion.div>
                  )}

                  {/* Notification Settings untuk mobile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-2"
                  >
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Notification Settings
                    </div>

                    {/* Permission Status */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">
                          Browser Notifications
                        </span>
                        <div className="flex items-center gap-2">
                          {isGranted ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isGranted
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {permission}
                          </span>
                        </div>
                      </div>

                      {!isGranted && permission === "default" && (
                        <button
                          onClick={requestPermission}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
                        >
                          Enable Notifications
                        </button>
                      )}
                    </div>

                    {/* Sound Toggle untuk mobile - improved version */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Sound</span>
                        <button
                          onClick={toggleSoundMobile}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            soundEnabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {soundEnabled ? "🔊" : "🔇"}
                          {soundEnabled ? "On" : "Off"}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* User email */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-2 text-sm text-gray-600 border-t border-gray-200"
                  >
                    {user?.email}
                  </motion.div>

                  {/* Logout button */}
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
                    )} transition-all duration-[800ms] ease-out`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="20"
                    cy="20"
                    strokeDasharray={`${(animatedRate * 100.53) / 100} 100.53`}
                    style={{
                      strokeDashoffset: 0,
                      transformOrigin: "center",
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Todos */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-8">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Task
            </button>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Filter */}
            <div className="flex gap-2">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as "all" | "active" | "completed")}
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

          {/* Priority Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setPriorityFilter("all")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                priorityFilter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter("high")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                priorityFilter === "high"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setPriorityFilter("medium")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                priorityFilter === "medium"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              Medium Priority
            </button>
            <button
              onClick={() => setPriorityFilter("low")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                priorityFilter === "low"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Low Priority
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 text-pink-500 animate-spin" />
              </div>
            ) : (
              <TodoList
                todos={filteredTodos}
                remindedTasks={remindedTasks}
                clearReminderEffect={clearReminderEffect}
                removeTodo={removeTodo}
                toggleTodo={toggleTodo}
                updateTodo={updateTodo}
                deleteAllTodos={deleteAllTodos}
                isOverdue={isOverdue}
              />
            )}
          </div>
        </div>

        {/* Priority Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm">Priority Breakdown</p>
            </div>
            <Flag className="h-8 w-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-600">High:</span>
              <span className="font-medium text-red-600">
                {highPriorityTodos}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Medium:</span>
              <span className="font-medium text-yellow-600">
                {mediumPriorityTodos}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Low:</span>
              <span className="font-medium text-green-600">
                {lowPriorityTodos}
              </span>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, todoId: null, itemName: "" })
          }
          onConfirm={() => {
            if (deleteModal.todoId) {
              removeTodo(deleteModal.todoId);
            }
          }}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          itemName={deleteModal.itemName}
        />

        <EditModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, todo: null })}
          initialText={editModal.todo?.text || ""}
          initialPriority={editModal.todo?.priority || "medium"}
          onSave={(text, priority) => {
            if (editModal.todo) {
              updateTodo(editModal.todo.id, text, priority);
            }
          }}
        />

        <AddTodoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={addTodo}
        />

        {/* ✅ ADD Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </main>
    </div>
  );
}
