"use client";

import { useState } from "react";
import { FaTrashAlt, FaRegEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./modal/ConfirmModal";
import EditModal from "./edit/EditModal";
import { Calendar, Bell, Edit3, Trash2 } from "lucide-react";
import {
  formatIndonesianDateTime,
  truncateText,
  getPriorityBadgeClasses,
} from "@/lib/utils";

// Update the Todo type to include priority
type Todo = {
  id: number;
  text: string;
  is_done: boolean;
  priority?: "low" | "medium" | "high";
  deadline?: string;
  reminder?: string;
};

type Props = {
  todos: Todo[] | null | undefined;
  remindedTasks: number[]; // ✅ Array of reminded task IDs
  recentlyEditedReminders: number[]; // ✅ NEW: Array of recently edited reminder IDs
  removeTodo: (id: number) => void;
  toggleTodo: (id: number, is_done: boolean) => void;
  updateTodo: (
    id: number,
    text: string,
    priority: "low" | "medium" | "high",
    deadline?: string,
    reminder?: string
  ) => void;
  deleteAllTodos: () => Promise<void>;
  isOverdue: (todo: Todo) => boolean;
};

export default function TodoList({
  todos,
  remindedTasks, // ✅ Destructure remindedTasks prop
  recentlyEditedReminders, // ✅ NEW: Destructure recentlyEditedReminders prop
  removeTodo,
  toggleTodo,
  updateTodo,
  deleteAllTodos,
  isOverdue,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  // ✅ NEW: Debug log untuk reminded tasks dan recently edited
  console.log("🎯 [TODOLIST] Received remindedTasks:", remindedTasks);
  console.log(
    "🎯 [TODOLIST] Received recentlyEditedReminders:",
    recentlyEditedReminders
  );

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

  // Pastikan todos selalu array
  const todosArray = Array.isArray(todos) ? todos : [];

  return (
    <>
      {/* Delete All button section */}
      {todosArray.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTrashAlt className="h-3.5 w-3.5" />
            Clear All
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
            {todosArray.map((todo) => {
              // ✅ SIMPLE: Only check if task is currently reminded (no more recently edited)
              const isReminded = remindedTasks.includes(todo.id);
              const shouldPulse = isReminded;

              // ✅ DEBUG: Log visual state
              if (shouldPulse) {
                console.log(`🎯 [VISUAL] Task ${todo.id} should pulse - reminded: ${isReminded}`);
              }

              return (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0, scale: todo.is_done ? 0.98 : 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-white shadow rounded-lg overflow-hidden ${
                    shouldPulse
                      ? "animate-pulse border-2 border-amber-400 shadow-amber-200"
                      : ""
                  }`}
                >
                  {/* ✅ ENHANCED: Reminder Badge with different text for different states */}
                  {shouldPulse && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                      <span>⏰</span>
                      <span>REMINDER!</span>
                    </div>
                  )}

                  {/* Mobile-First Responsive Layout */}
                  <div className="p-4 lg:hidden">
                    {/* Top Row: Checkbox + Task Name + Priority */}
                    <div className="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={todo.is_done}
                        onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                        className="w-5 h-5 mt-0.5 text-pink-500 rounded focus:ring-pink-400 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <motion.div
                          animate={{
                            opacity: todo.is_done ? 0.5 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`text-base font-medium break-words ${
                            todo.deadline && isOverdue(todo) && !todo.is_done
                              ? "text-red-500"
                              : "text-gray-800"
                          } ${todo.is_done ? "line-through" : ""}`}
                        >
                          {todo.text}
                        </motion.div>

                        {/* Overdue badge - prominent on mobile */}
                        {isOverdue(todo) && !todo.is_done && (
                          <span className="inline-block mt-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Priority Badge */}
                      {todo.priority && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getPriorityBadgeClasses(
                            todo.priority
                          )}`}
                        >
                          {todo.priority}
                        </span>
                      )}
                    </div>

                    {/* Date/Time Information */}
                    {(todo.deadline || todo.reminder) && (
                      <div className="mb-3 ml-8 space-y-1">
                        {todo.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span
                              className={`${
                                isOverdue(todo) && !todo.is_done
                                  ? "text-red-500 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {formatIndonesianDateTime(todo.deadline)} WIB
                            </span>
                          </div>
                        )}

                        {todo.reminder && (
                          <div className="flex items-center gap-2 text-sm">
                            <Bell className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">
                              {formatIndonesianDateTime(todo.reminder)} WIB
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex gap-2 ml-8">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditTodoId(todo.id);
                          setEditTodoText(todo.text);
                          setEditTodoPriority(todo.priority || "medium");
                          setEditTodoDeadline(todo.deadline);
                          setEditTodoReminder(todo.reminder);
                          setIsEditModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] flex-1 justify-center sm:flex-initial sm:min-h-0"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="sm:hidden">Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedId(todo.id);
                          setSelectedText(todo.text);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] flex-1 justify-center sm:flex-initial sm:min-h-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    {/* ✅ ENHANCED: Desktop Reminder Badge */}
                    {shouldPulse && (
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                        <span>⏰</span>
                        <span>
                          {isReminded
                            ? "REMINDER!"
                            : isRecentlyEdited
                            ? "REMINDER UPDATED!"
                            : "REMINDER!"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={todo.is_done}
                            onChange={(e) =>
                              toggleTodo(todo.id, e.target.checked)
                            }
                            className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
                          />
                          <motion.span
                            animate={{
                              opacity: todo.is_done ? 0.5 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className={`text-gray-800 flex-1 ${
                              todo.deadline && isOverdue(todo) && !todo.is_done
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            } ${todo.is_done ? "line-through" : ""}`}
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
                                    isOverdue(todo) && !todo.is_done
                                      ? "text-red-500 font-medium"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {formatIndonesianDateTime(todo.deadline)} WIB
                                  {isOverdue(todo) && !todo.is_done && (
                                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                      Overdue
                                    </span>
                                  )}
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
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeClasses(
                              todo.priority
                            )}`}
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
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        )}
      </ul>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (selectedId) removeTodo(selectedId);
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
