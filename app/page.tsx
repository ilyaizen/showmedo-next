"use client";

import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <TodoList />
    </div>
  );
}
