"use client";

import { useState } from "react";

type Props = {
  addTodo: (todo: string) => void;
};

export default function TodoForm({ addTodo }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
        className="px-4 py-2 rounded-xl border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
      <button
        type="submit"
        className="bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition"
      >
        Add
      </button>
    </form>
  );
}
