"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialPriority?: "low" | "medium" | "high"; // Add this
  onSave: (text: string, priority: "low" | "medium" | "high") => void; // Update this
};

export default function EditModal({
  isOpen,
  onClose,
  initialText,
  initialPriority = "medium", // Add this
  onSave,
}: EditModalProps) {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState(initialPriority); // Add this
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // update text jika initialText berubah
  useEffect(() => {
    setText(initialText);
    setPriority(initialPriority); // Add this
  }, [initialText, initialPriority]);

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
      await onSave(text, priority);

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
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
                  className="w-full px-4 py-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1 rounded text-white bg-red-400 hover:bg-red-500 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <motion.button
                onClick={handleSave}
                disabled={isDisabled}
                animate={saved ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`px-3 py-1 rounded transition ${
                  isDisabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : saved
                    ? "bg-green-500 text-white"
                    : "bg-blue-400 hover:bg-blue-600 text-white hover:cursor-pointer"
                }`}
              >
                {loading ? "Saving..." : saved ? "Saved ✓" : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
