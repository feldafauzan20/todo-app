"use client";

import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./modal/ConfirmModal";

type Props = {
  todos: { id: number; text: string; is_done: boolean }[];
  removeTodo: (id: number) => void;
  toggleTodo: (id: number, is_done: boolean) => void;
};

export default function TodoList({ todos, removeTodo, toggleTodo }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <ul className="w-full max-w-md space-y-3">
        {todos.length === 0 ? (
          <div className="text-center text-gray-500 italic py-6 bg-white rounded-lg shadow-sm">
            No tasks yet. Add something to get started ✨
          </div>
        ) : (
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between bg-white shadow rounded-lg p-3"
              >
                 <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={todo.is_done}
          onChange={(e) => toggleTodo(todo.id, e.target.checked)}
          className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
        />
        <span className={todo.is_done ? "line-through text-gray-400" : "text-gray-800"}>
          {todo.text}
        </span>
      </div>
      <button onClick={() => { setSelectedId(todo.id); setIsModalOpen(true); }}>
        <FaTrashAlt className="text-pink-600 hover:text-pink-800" />
      </button>
              </motion.li>
            ))}
          </AnimatePresence>
        )}
      </ul>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (selectedId) removeTodo(selectedId);
        }}
        title="Delete Confirmation"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
      />
    </>
  );
}
