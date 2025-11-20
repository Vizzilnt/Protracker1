
import { Task, ToDoItem, Timeframe } from '../types';

const STORAGE_KEY = 'protrack_tasks_v1';
const STORAGE_KEY_TODOS = 'protrack_todos_v1';

// --- Tasks ---

export const getTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTask = (task: Task): Task[] => {
  const tasks = getTasks();
  const updatedTasks = [...tasks, task];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  return updatedTasks;
};

export const updateTask = (updatedTask: Task): Task[] => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  return tasks;
};

export const deleteTask = (taskId: string): Task[] => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const calculateDuration = (start: string, end: string): number => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return Math.max(0, endTotal - startTotal);
};

// --- To-Dos ---

export const getToDos = (): ToDoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TODOS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Migration helper: ensure timeframe exists for backward compatibility
    // @ts-ignore
    return parsed.map((item: any) => ({
      ...item,
      timeframe: item.timeframe || Timeframe.DAILY
    }));
  } catch (e) {
    console.error("Failed to load todos", e);
    return [];
  }
};

export const saveToDo = (todo: ToDoItem): ToDoItem[] => {
  const todos = getToDos();
  const updatedTodos = [...todos, todo];
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
  return updatedTodos;
};

export const updateToDo = (updatedToDo: ToDoItem): ToDoItem[] => {
  const todos = getToDos();
  const index = todos.findIndex(t => t.id === updatedToDo.id);
  if (index !== -1) {
    todos[index] = updatedToDo;
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  }
  return todos;
};

export const toggleToDo = (id: string): ToDoItem[] => {
  const todos = getToDos();
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos[index].completed = !todos[index].completed;
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  }
  return todos;
};

export const deleteToDo = (id: string): ToDoItem[] => {
  const todos = getToDos();
  const filtered = todos.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(filtered));
  return filtered;
};
