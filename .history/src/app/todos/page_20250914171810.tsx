"use client";

import TodoList from "@/components/TodoList";
import { useTodos } from "@/hooks/useTodos";

export default function TodoPage() {
  const { todos, loading, addTodo, toggleTodo, updateTodo, removeTodo } =
    useTodos();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Todo List</h1>
      <TodoList
        todos={todos}
        removeTodo={removeTodo}
        toggleTodo={toggleTodo}
        updateTodo={updateTodo}
      />
    </div>
  );
}
