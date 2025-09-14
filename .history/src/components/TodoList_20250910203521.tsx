"use client";
import { FaTrashAlt } from 'react-icons/fa';

type Props = {
  todos: string[];
  removeTodo: (index: number) => void;
};

export default function TodoList({ todos, removeTodo }: Props) {
  return (
    <ul className="w-full max-w-md space-y-3">
      {todos.map((todo, index) => (
        <li
          key={index}
          className="flex justify-between items-center bg-white rounded-xl shadow p-3"
        >
          <span className="text-gray-700">{todo}</span>
          <button
            onClick={() => removeTodo(index)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            <FaTrashAlt/>
          </button>
        </li>
      ))}
    </ul>
  );
}
