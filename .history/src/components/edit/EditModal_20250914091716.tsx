"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void | Promise<void>;
  initialText: string;
};

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  initialText,
}: EditModalProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // update text jika initialText berubah
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

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

  if (!isOpen) return null;

  const isDisabled = text.trim().length === 0 || loading;

  const handleSave = async () => {
    if (isDisabled) return;
    try {
      setLoading(true);
      await onSave(text);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
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

        <h2 className="text-lg text-blue-600 font-semibold mb-3">Edit List</h2>

        <input
          ref={inputRef}
          type="text"
          value={text}
          placeholder="Type your new list item..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            }
          }}
          className="w-full border border-blue-500 text-black px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-300 outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1 rounded text-white bg-red-400 hover:bg-red-500 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className={`px-3 py-1 rounded transition hover:cursor-pointer ${
              isDisabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-400 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
