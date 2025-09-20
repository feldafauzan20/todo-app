"use client";

import { useState } from "react";
import { Calendar, Bell } from "lucide-react";

type Props = {
  addTodo: (
    todo: string,
    priority?: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => Promise<void>;
};

export default function TodoForm({ addTodo }: Props) {
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [deadline, setDeadline] = useState("");
  const [reminder, setReminder] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await addTodo(input.trim(), priority, deadline, reminder);
      setInput("");
      setPriority("medium");
      setDeadline("");
      setReminder("");
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
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
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

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-400" />
          <input
            type="datetime-local"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
      </div>
    </form>
  );
}
