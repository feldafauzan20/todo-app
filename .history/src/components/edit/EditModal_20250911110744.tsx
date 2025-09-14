"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText: string;
};

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  initialText,
}: EditModalProps) {
  const [text, setText] = useState(initialText);

  // Update text jika initialText berubah
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div className="relative bg-white rounded-2xl shadow-xl p-6 pt-12 max-w-sm md:max-w-lg w-full">
        {/* Gambar kucing */}
        <div className="absolute -top-10 md:-top-30 right-90 translate-x-1/2">
          <Image
            src="/assets/illustrations/cat-edit-modal.webp"
            alt="cat image"
            width={100}
            height={100}
            className="drop-shadow-lg"
          />
        </div>
        <h2 className="text-lg text-blue-600 font-semibold mb-3">Edit Todo</h2>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-blue-500 text-black px-3 py-2 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-white bg-red-400 hover:bg-red-500 transition hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(text);
              onClose();
            }}
            className="px-3 py-1 rounded bg-blue-400 hover:bg-blue-600 text-white hover:cursor-pointer"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
