"use client";

import { useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { LuBookOpenCheck } from 'react-icons/lu';

export default function Home() {
  const [todos, setTodos] = useState<string[]>([]);

  const addTodo = (todo: string) => {
    if (!todo.trim()) return;
    setTodos([...todos, todo]);
  };

  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">To-Do App <LuBookOpenCheck/></h1>

      <TodoForm addTodo={addTodo} />

      <TodoList todos={todos} removeTodo={removeTodo} />
    </main>
  );
}
