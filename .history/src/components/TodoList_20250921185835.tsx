"use client";

import { useState } from "react";
import { FaTrashAlt, FaRegEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./modal/ConfirmModal";
import EditModal from "./edit/EditModal";
import { Calendar, Bell } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Add Indonesian locale

// Update the Todo type to include priority
type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string; // Add deadline
  reminder?: string; // Add reminder
};

type Props = {
  todos: Todo[] | null | undefined;
  removeTodo: (id: number) => void;
  toggleTodo: (id: number, is_done: boolean) => void;
  updateTodo: (
    id: number,
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => void; // Update this
  deleteAllTodos: () => Promise<void>;
};

export default function TodoList({
  todos,
  removeTodo,
  toggleTodo,
  updateTodo,
  deleteAllTodos, // Add this
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  // State modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editTodoText, setEditTodoText] = useState("");

  const [editTodoPriority, setEditTodoPriority] = useState<
    "low" | "medium" | "high"
  >("medium");

  const [editTodoDeadline, setEditTodoDeadline] = useState<string | undefined>(
    undefined
  );
  const [editTodoReminder, setEditTodoReminder] = useState<string | undefined>(
    undefined
  );

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const truncateText = (text: string, maxLength: number = 35) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Pastikan todos selalu array
  const todosArray = Array.isArray(todos) ? todos : [];

  // Add helper function to format date in Indonesian
  const formatIndonesianDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Use UTC methods to get exact values without timezone conversion
    const utcDay = date.getUTCDay();
    const utcDate = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();

    return `${days[utcDay]}, ${utcDate} ${months[utcMonth]} ${utcYear} ${String(
      utcHours
    ).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`;
  };

  // Add this helper function to convert date format for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Update both functions to handle timezone consistently
  const isDeadlineOverdue = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);

    // Convert both to WIB timezone for comparison
    const nowWIB = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const deadlineWIB = new Date(deadlineDate.getTime() + 7 * 60 * 60 * 1000);

    return nowWIB > deadlineWIB;
  };

  return (
    <>
      {/* Delete All button section */}
      {todosArray.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete All
          </button>
        </div>
      )}

      <ul className="w-full space-y-3">
        {todosArray.length === 0 ? (
          <div className="text-center text-black italic">
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
                // whileTap={{ scale: 0.95 }}
                className="flex items-center justify-between w-full bg-white shadow rounded-lg p-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
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
                      className="text-gray-800 flex-1"
                    >
                      {todo.text}
                    </motion.span>
                  </div>

                  {(todo.deadline || todo.reminder) && (
                    <div className="flex gap-4 text-xs ml-7">
                      {todo.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span
                            className={`${
                              isDeadlineOverdue(todo.deadline) && !todo.is_done
                                ? "text-red-500 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {formatIndonesianDateTime(todo.deadline)} WIB
                          </span>
                        </div>
                      )}

                      {todo.reminder && (
                        <div className="flex items-center gap-1">
                          <Bell className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">
                            {formatIndonesianDateTime(todo.reminder)} WIB
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Priority badge */}
                  {todo.priority && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        todo.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : todo.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {todo.priority}
                    </span>
                  )}

                  {/* Action buttons */}
                  <button
                    onClick={() => {
                      setEditTodoId(todo.id);
                      setEditTodoText(todo.text);
                      setEditTodoPriority(todo.priority || "medium");
                      setEditTodoDeadline(todo.deadline);
                      setEditTodoReminder(todo.reminder);
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
          // toast.success("Task deleted successfully!");
        }}
        itemName={truncateText(selectedText)}
        title="Delete Confirmation"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialText={editTodoText}
        initialPriority={editTodoPriority}
        initialDeadline={editTodoDeadline}
        initialReminder={editTodoReminder}
        onSave={(text, priority, deadline, reminder) => {
          if (editTodoId) {
            updateTodo(editTodoId, text, priority, deadline, reminder);
          }
        }}
      />

      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={() => {
          deleteAllTodos();
          setIsDeleteAllModalOpen(false);
        }}
        title="Delete All Tasks"
        message="Are you sure you want to delete all tasks? This action cannot be undone."
      />
    </>
  );
}
