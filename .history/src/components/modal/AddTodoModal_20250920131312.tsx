"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Bell, X } from "lucide-react";

type AddTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => Promise<void>;
};

// Helper function for WIB datetime
const getJakartaDateTime = () => {
  const now = new Date();
  const jakartaOffset = 7 * 60; // WIB is UTC+7
  const localOffset = now.getTimezoneOffset();
  const totalOffset = jakartaOffset + localOffset;

  now.setMinutes(now.getMinutes() + totalOffset);
  return now.toISOString().slice(0, 16);
};

export default function AddTodoModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTodoModalProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [deadline, setDeadline] = useState("");
  const [reminder, setReminder] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await onSubmit(text.trim(), priority, deadline, reminder);
      // Reset form
      setText("");
      setPriority("medium");
      setDeadline("");
      setReminder("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Task
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Task Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your task..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    autoFocus
                  />
                </div>

                {/* Priority Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Deadline & Reminder */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Deadline
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      min={getJakartaDateTime()}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Reminder
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      value={reminder}
                      min={getJakartaDateTime()}
                      onChange={(e) => setReminder(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
