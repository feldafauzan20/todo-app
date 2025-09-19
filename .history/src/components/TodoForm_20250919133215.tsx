"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

type Props = {
  addTodo: (
    todo: string,
    priority?: "low" | "medium" | "high"
  ) => Promise<void>;
};

export default function TodoForm({ addTodo }: Props) {
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await addTodo(input.trim(), priority);
      setInput("");
      setPriority("medium");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-pink-400"
        />

        {/* Priority selector */}
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          type="submit"
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Priority indicator */}
      <div className="flex items-center gap-2 text-sm">
        <Flag
          className={`h-4 w-4 ${
            priority === "high"
              ? "text-red-500"
              : priority === "medium"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        />
        <span className="text-gray-600">Priority: {priority}</span>
      </div>
    </form>
  );
}
