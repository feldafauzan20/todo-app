"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Bell, X, AlertCircle } from "lucide-react";

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

// Update the helper function for WIB datetime
const getJakartaDateTime = () => {
  const now = new Date();
  // Convert to WIB (UTC+7)
  const wibDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return wibDate.toISOString().slice(0, 16);
};

const convertToWIB = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  // Remove the timezone offset to get actual WIB time
  const wibDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return wibDate.toISOString();
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

  // State untuk validation
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    // Hide error saat user mulai mengetik
    if (showError && e.target.value.trim()) {
      setShowError(false);
    }
  };

  // Update handleSubmit function (sekitar line 60-85)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation dengan smooth UX
    if (!text.trim()) {
      setShowError(true);
      // Focus kembali ke input
      const inputElement = e.currentTarget.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      inputElement?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data dengan proper format
      const deadlineData = deadline ? convertToWIB(deadline) : undefined;
      const reminderData = reminder ? convertToWIB(reminder) : undefined;

      console.log("Submitting data:", {
        text: text.trim(),
        priority,
        deadline: deadlineData,
        reminder: reminderData,
      });

      await onSubmit(text.trim(), priority, deadlineData, reminderData);

      // Reset form setelah berhasil
      setText("");
      setPriority("medium");
      setDeadline("");
      setReminder("");
      setShowError(false);
      onClose();
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state saat modal dibuka/ditutup
  const handleClose = () => {
    setText("");
    setPriority("medium");
    setDeadline("");
    setReminder("");
    setShowError(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 h-screen"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-500">
                  Add New Task
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Task Input dengan Validation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Enter your task..."
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        showError
                          ? "border-red-300 text-red-600 focus:ring-red-400 bg-red-50"
                          : "border-pink-300 text-pink-500 focus:ring-pink-400"
                      }`}
                      autoFocus
                    />
                    {/* Error Icon */}
                    <AnimatePresence>
                      {showError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {showError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 flex items-center gap-2 text-sm text-red-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>Task description is required</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    className="w-full px-4 py-2 text-pink-500 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                      className="w-full px-3 text-pink-500 py-2 border border-pink-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                      className="w-full px-3 py-2 text-pink-500 border border-pink-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                {/* Submit Button dengan Loading State */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                      isSubmitting
                        ? "bg-pink-400 cursor-not-allowed"
                        : "bg-pink-600 hover:bg-pink-700"
                    }`}
                  >
                    {isSubmitting && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    )}
                    {isSubmitting ? "Adding..." : "Add Task"}
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
