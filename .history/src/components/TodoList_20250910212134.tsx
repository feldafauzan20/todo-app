"use client";
import { FaTrashAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  todos: string[];
  removeTodo: (index: number) => void;
};

export default function TodoList({ todos, removeTodo }: Props) {
  return (
    <ul className="w-full max-w-md space-y-3">
      <AnimatePresence>
        {todos.map((todo, index) => (
          <motion.li
            key={todo} // gunakan text sebagai key sementara
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center bg-white rounded-xl shadow p-3"
          >
            <span className="text-gray-700">{todo}</span>
            <button
              onClick={() => removeTodo(index)}
              className="text-sm text-red-500 hover:text-red-700"
            >
                <FaTrashAlt />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
