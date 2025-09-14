"use client";

import { useState } from "react";
import { FaTrashAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./ConfirmModal";

type Props = {
  todos: { id: number; text: string }[];
  removeTodo: (id: number) => void;
};

export default function TodoList({ todos, removeTodo }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <ul className="w-full max-w-md space-y-3">
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
              <span className="text-gray-800">{todo.text}</span>
              <button
                onClick={() => {
                  setSelectedId(todo.id);
                  setIsModalOpen(true);
                }}
                className="text-pink-600 hover:text-pink-800 transition-colors"
              >
                <FaTrashAlt />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (selectedId) removeTodo(selectedId);
        }}
        title="Hapus Todo?"
        message="Apakah kamu yakin ingin menghapus todo ini?"
      />
    </>
  );
}
