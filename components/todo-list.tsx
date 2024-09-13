"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define the structure of a Todo item
type Todo = {
  id: number;
  task: string;
  priority: number;
  completed: boolean;
  isNew?: boolean;
};

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use useEffect to initialize todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      setTodos([
        { id: 1, task: "Buy groceries", priority: 7, completed: false },
        { id: 2, task: "Finish project report", priority: 9, completed: false },
        { id: 3, task: "Call mom", priority: 6, completed: false },
        { id: 4, task: "Go for a run", priority: 4, completed: false },
        { id: 5, task: "Plan weekend trip", priority: 5, completed: false },
      ]);
    }
    setIsLoaded(true);
  }, []);

  // State for the new task input
  const [newTask, setNewTask] = useState("");
  // State for the priority of the new task
  const [newTaskPriority, setNewTaskPriority] = useState(5);
  // State to control the visibility of the task recommendation
  const [showRecommendation, setShowRecommendation] = useState(false);

  // New state for retry count
  const [retryCount, setRetryCount] = useState(3);

  // Function to handle priority changes for existing todos
  const handlePriorityChange = useCallback(
    (id: number, newPriority: number) => {
      setShowRecommendation(false); // Hide recommendation when priority changes
      setTodos((prevTodos) => {
        const updatedTodo = prevTodos.find((todo) => todo.id === id);
        if (!updatedTodo) return prevTodos;

        const priorityDiff = newPriority - updatedTodo.priority;
        const otherTodos = prevTodos.filter(
          (todo) => todo.id !== id && !todo.completed
        );
        const totalOtherPriorities = otherTodos.reduce(
          (sum, todo) => sum + todo.priority,
          0
        );

        // Calculate the adjustment factor for other todos
        const adjustmentFactor = -priorityDiff / totalOtherPriorities;

        // Update priorities for all todos
        const updatedTodos = prevTodos.map((todo) => {
          if (todo.id === id) {
            // Update the priority of the selected todo
            return { ...todo, priority: newPriority };
          } else if (!todo.completed) {
            // Adjust other uncompleted todos proportionally to their current priority
            const newPriority = Math.max(
              0,
              Math.min(10, todo.priority * (1 + adjustmentFactor))
            );
            return { ...todo, priority: Math.round(newPriority * 10) / 10 };
          }
          return todo;
        });

        return updatedTodos;
      });
    },
    []
  );

  // Effect to update localStorage when todos change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Function to add a new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTodo = {
        id: Date.now(),
        task: newTask.trim(),
        priority: newTaskPriority,
        completed: false,
        isNew: true,
      };
      setTodos([newTodo, ...todos]); // Add new task at the beginning of the array
      setNewTask("");
      setNewTaskPriority(5);

      // Remove the isNew flag after animation completes
      setTimeout(() => {
        setTodos((currentTodos) =>
          currentTodos.map((todo) =>
            todo.id === newTodo.id ? { ...todo, isNew: false } : todo
          )
        );
      }, 300); // Match this with the CSS animation duration
    }
  };

  // Updated function to toggle the completion status of a todo
  const handleToggleComplete = (id: number) => {
    setTodos((prevTodos) => {
      const updatedTodos = prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );

      // Sort todos: uncompleted first, then completed
      return [
        ...updatedTodos.filter((todo) => !todo.completed),
        ...updatedTodos.filter((todo) => todo.completed),
      ];
    });
  };

  // Function to delete a todo
  const handleDeleteTask = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Updated function to handle ShowMeDo button click
  const handleShowMeDo = () => {
    if (retryCount > 0) {
      setShowRecommendation(false); // Hide the recommendation first
      setTimeout(() => {
        setShowRecommendation(true);
        setRetryCount((prevCount) => prevCount - 1);
      }, 50); // Short delay to trigger animation
    }
  };

  // Function to reset retry count
  const resetRetryCount = () => {
    setRetryCount(3);
    setShowRecommendation(false);
  };

  // Function to get the recommended task based on priority-weighted random selection
  const getRecommendedTask = useCallback(() => {
    // Filter out completed tasks
    const uncompletedTasks = todos.filter((todo) => !todo.completed);

    if (uncompletedTasks.length === 0) {
      return "No tasks left!";
    }

    // Calculate the total priority score
    const totalPriority = uncompletedTasks.reduce(
      (sum, todo) => sum + todo.priority,
      0
    );

    // Generate a random number between 0 and the total priority score
    const randomValue = Math.random() * totalPriority;

    // Use the random value to select a task
    let cumulativePriority = 0;
    for (const todo of uncompletedTasks) {
      cumulativePriority += todo.priority;
      if (randomValue <= cumulativePriority) {
        return todo.task;
      }
    }

    // Fallback (should never reach here, but TypeScript might complain without it)
    return uncompletedTasks[uncompletedTasks.length - 1].task;
  }, [todos]); // Remove recommendationKey from dependencies

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {isLoaded ? (
        <>
          <div className="flex flex-col items-center space-y-2 mb-6">
            <Button
              onClick={retryCount > 0 ? handleShowMeDo : resetRetryCount}
              className="w-full max-w-xs"
            >
              {retryCount === 3
                ? "ShowMeDo"
                : retryCount > 0
                ? `Retry... (${retryCount} ${
                    retryCount === 1 ? "retry" : "retries"
                  } left)`
                : "Reset Retries"}
            </Button>
            {showRecommendation && (
              <Card className="w-full max-w-xs animate-recommendation-pop-in shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">Recommended next task:</p>
                  <p className="text-lg">{getRecommendedTask()}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* New task section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task"
                    className="flex-grow"
                  />
                  <Button type="submit">Add</Button>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Slider for setting priority of new task */}
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[newTaskPriority]}
                    onValueChange={(value) => setNewTaskPriority(value[0])}
                    className="flex-grow"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List of todos */}
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`
                    shadow-md
                    ${todo.completed ? "opacity-50" : ""}
                    ${todo.isNew ? "animate-pop-in" : ""}
                    transition-all duration-300 ease-in-out
                  `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {/* Checkbox to mark todo as complete */}
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleComplete(todo.id)}
                          id={`todo-${todo.id}`}
                        />
                        {/* Todo task text */}
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`font-medium ${
                            todo.completed ? "line-through" : ""
                          }`}
                        >
                          {todo.task}
                        </label>
                      </div>
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(todo.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Slider for adjusting todo priority */}
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={[todo.priority]}
                        onValueChange={(value) => {
                          handlePriorityChange(todo.id, value[0]);
                          setShowRecommendation(false); // Hide recommendation when slider moves
                        }}
                        className="flex-grow"
                        disabled={todo.completed}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
