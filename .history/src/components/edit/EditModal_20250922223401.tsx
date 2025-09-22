"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, Bell } from "lucide-react";
import { convertToWIB } from "@/lib/utils";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialPriority: "low" | "medium" | "high";
  initialDeadline?: string;
  initialReminder?: string;
  onSave: (
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => void;
};

const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

export default function EditModal({
  isOpen,
  onClose,
  initialText,
  initialPriority,
  initialDeadline,
  initialReminder,
  onSave,
}: EditModalProps) {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState(initialPriority);
  const [deadline, setDeadline] = useState(
    formatDateTimeForInput(initialDeadline || "")
  );
  const [reminder, setReminder] = useState(
    formatDateTimeForInput(initialReminder || "")
  );
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // update text jika initialText berubah
  useEffect(() => {
    setText(initialText);
    setPriority(initialPriority);
    setDeadline(formatDateTimeForInput(initialDeadline || ""));
    setReminder(formatDateTimeForInput(initialReminder || ""));
  }, [initialText, initialPriority, initialDeadline, initialReminder]);

  // auto focus saat modal dibuka
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // esc key → cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isDisabled = !text?.trim() || loading;

  const handleSave = async () => {
    if (isDisabled) return;
    try {
      setLoading(true);
      await onSave(
        text.trim(),
        priority,
        deadline ? convertToWIB(deadline) : undefined,
        reminder ? convertToWIB(reminder) : undefined
      );

      // Close modal after successful save
      setTimeout(() => {
        onClose();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 pt-12 max-w-sm md:max-w-lg w-full"
          >
            {/* Gambar kucing */}
            <div className="absolute -top-23 md:-top-30.5 left-1/2 -translate-x-1/2">
              <Image
                src="/assets/illustrations/cat-edit-modal.webp"
                alt="cat image"
                width={600}
                height={600}
                className="drop-shadow-lg"
              />
            </div>

            <h2 className="text-lg text-blue-600 font-semibold mb-3">
              Edit Task
            </h2>

            <form className="space-y-6">
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  placeholder="Edit your task..."
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSave();
                    }
                  }}
                  className="w-full border border-blue-500 text-black px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-300 outline-none"
                />

                {/* Add priority selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full px-4 py-2 border text-pink-500 border-pink-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

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
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 text-pink-500 border-pink-300 focus:ring-pink-400"
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
                      onChange={(e) => setReminder(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isDisabled}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    isDisabled
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
