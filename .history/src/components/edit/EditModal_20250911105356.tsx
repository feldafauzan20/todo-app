"use client";

import { useState, useEffect } from "react";

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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
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
            className="px-3 py-1 rounded text-red-700 bg-red-500 hover:bg-gray-300 transition hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(text);
              onClose();
            }}
            className="px-3 py-1 rounded bg-blue-400 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
