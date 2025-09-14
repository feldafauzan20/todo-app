"use client";

import toast from "react-hot-toast";
import { useState } from "react";

type Props = {
  addTodo: (todo: string) => void;
};

export default function TodoForm({ addTodo }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a task before adding!");
      return;
    }

    addTodo(input);
    toast.success("Task added successfully!");
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
        className="px-4 py-2 rounded-xl border text-pink-700 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50 placeholder-pink-400"
      />
      <button
        type="submit"
        disabled={!input.trim()} // tombol disabled kalau kosong
        className={`px-4 py-2 rounded-xl transition text-white ${
          !input.trim()
            ? "bg-pink-300 cursor-not-allowed"
            : "bg-pink-400 hover:bg-pink-500"
        }`}
      >
        Add
      </button>
    </form>
  );
}
