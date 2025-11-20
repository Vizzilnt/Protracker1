
export enum TaskType {
  UI = 'UI', // Urgent & Important
  I = 'I',   // Important
  U = 'U',   // Urgent
  N = 'N',   // Necessary
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.UI]: 'Urgent & Important',
  [TaskType.I]: 'Important',
  [TaskType.U]: 'Urgent',
  [TaskType.N]: 'Necessary',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  [TaskType.UI]: '#e11d48', // Rose-600
  [TaskType.I]: '#0284c7', // Sky-600
  [TaskType.U]: '#d97706', // Amber-600
  [TaskType.N]: '#475569', // Slate-600
};

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description: string;
  type: TaskType;
  durationMinutes: number;
}

export interface DailySummary {
  date: string;
  totalMinutes: number;
  breakdown: Record<TaskType, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords
}

// --- To-Do List Types ---

export enum ToDoCategory {
  URGENT_IMPORTANT = 'UI',
  IMPORTANT = 'I',
  URGENT = 'U',
  NECESSARY = 'N',
}

export const TODO_CATEGORY_LABELS: Record<ToDoCategory, string> = {
  [ToDoCategory.URGENT_IMPORTANT]: 'Urgent & Important',
  [ToDoCategory.IMPORTANT]: 'Important (Not Urgent)',
  [ToDoCategory.URGENT]: 'Urgent (Not Important)',
  [ToDoCategory.NECESSARY]: 'Necessary (Not Urgent/Important)',
};

export const TODO_CATEGORY_STYLES: Record<ToDoCategory, { bg: string, border: string, text: string, icon: string, borderTop: string }> = {
  [ToDoCategory.URGENT_IMPORTANT]: { 
    bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', icon: 'text-rose-600', borderTop: 'border-t-rose-500'
  },
  [ToDoCategory.IMPORTANT]: { 
    bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-800', icon: 'text-sky-600', borderTop: 'border-t-sky-500'
  },
  [ToDoCategory.URGENT]: { 
    bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', icon: 'text-amber-600', borderTop: 'border-t-amber-500'
  },
  [ToDoCategory.NECESSARY]: { 
    bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-800', icon: 'text-slate-600', borderTop: 'border-t-slate-500'
  },
};

export enum Timeframe {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  [Timeframe.DAILY]: 'Today',
  [Timeframe.WEEKLY]: 'This Week',
  [Timeframe.MONTHLY]: 'This Month',
  [Timeframe.YEARLY]: 'This Year',
};

export interface ToDoItem {
  id: string;
  text: string;
  category: ToDoCategory;
  timeframe: Timeframe;
  completed: boolean;
  createdAt: string;
  deadline?: string;
  notes?: string;
  icon?: string;
}