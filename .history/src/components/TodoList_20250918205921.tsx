"use client";

import { useState } from "react";
import { FaTrashAlt, FaRegEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./modal/ConfirmModal";
import EditModal from "./edit/EditModal";
import toast from "react-hot-toast";

type Todo = {
  id: number;
  text: string;
  is_done: boolean;
};

type Props = {
  todos: Todo[] | null | undefined; // Bisa null/undefined dari parent
  removeTodo: (id: number) => void;
  toggleTodo: (id: number, is_done: boolean) => void;
  updateTodo: (id: number, text: string) => void;
};

export default function TodoList({
  todos,
  removeTodo,
  toggleTodo,
  updateTodo,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  // State modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editTodoText, setEditTodoText] = useState("");

  const truncateText = (text: string, maxLength: number = 35) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Pastikan todos selalu array
  const todosArray = Array.isArray(todos) ? todos : [];

  return (
    <>
      <ul className="w-full max-w-md space-y-3">
        {todosArray.length === 0 ? (
          <div className="text-center text-black italic py-6 bg-white rounded-lg shadow-sm">
            No tasks yet. Add something to get started ✨
          </div>
        ) : (
          <AnimatePresence>
            {todosArray.map((todo) => (
              <motion.li
                key={todo.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, scale: todo.is_done ? 0.98 : 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-between bg-white shadow rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.is_done}
                    onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
                  />
                  <motion.span
                    animate={{
                      opacity: todo.is_done ? 0.5 : 1,
                      textDecoration: todo.is_done ? "line-through" : "none",
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-800"
                  >
                    {todo.text}
                  </motion.span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditTodoId(todo.id);
                      setEditTodoText(todo.text);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                  >
                    <FaRegEdit />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedId(todo.id);
                      setSelectedText(todo.text);
                      setIsModalOpen(true);
                    }}
                  >
                    <FaTrashAlt className="text-pink-600 hover:text-pink-800 hover:cursor-pointer" />
                  </button>
                </div>
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
          toast.success("Task deleted successfully!");
        }}
        itemName={truncateText(selectedText)}
        title="Delete Confirmation"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialText={editTodoText ?? ""}
        onSave={(text) => {
          if (editTodoId) {
            updateTodo(editTodoId, text);
            toast.success("Task updated successfully!");
          }
        }}
      />
    </>
  );
}
