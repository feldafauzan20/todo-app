"use client";

import toast from "react-hot-toast";
import { useState } from "react";

type Props = {
  addTodo: (todo: string) => Promise<void>; // ubah ke async biar bisa tunggu insert Supabase
};

export default function TodoForm({ addTodo }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // ⬅️ state tambahan

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setLoading(true); // ⬅️ mulai loading
      await addTodo(input); // ⬅️ tunggu Supabase insert
      toast.success("Task added successfully!");
      setInput("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add task");
    } finally {
      setLoading(false); // ⬅️ matikan loading
    }
  };

  const isDisabled = loading || !input.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
        className="px-4 py-2 rounded-xl border text-pink-700 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50 placeholder-pink-400"
        disabled={loading} // ⬅️ jangan bisa input kalau lagi loading
      />
      <button
        type="submit"
        disabled={loading} // ⬅️ tombol ikut nonaktif
        className={`px-4 py-2 rounded-xl transition ${
          loading
            ? "bg-pink-300 text-white cursor-not-allowed"
            : "bg-pink-400 text-white hover:bg-pink-500"
        }`}
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
