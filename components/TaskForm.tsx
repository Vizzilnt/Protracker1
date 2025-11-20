
import React, { useState, useEffect } from 'react';
import { Task, TaskType, TASK_TYPE_LABELS, ToDoItem, TODO_CATEGORY_LABELS, ToDoCategory } from '../types';
import { calculateDuration } from '../services/storage';
import { Save, ArrowDownRight, CheckSquare } from 'lucide-react';

interface TaskFormProps {
  onSave: (task: Task) => void;
  initialData?: Partial<Task>;
  onCancel?: () => void;
  activeTodos?: ToDoItem[];
  onLinkTodo?: (id: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSave, initialData, onCancel, activeTodos = [], onLinkTodo }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.I);
  const [description, setDescription] = useState('');
  const [durationStr, setDurationStr] = useState('0 hrs');
  
  // Todo linking state
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [markTodoDone, setMarkTodoDone] = useState(true);

  useEffect(() => {
    if (initialData) {
      if (initialData.date) setDate(initialData.date);
      if (initialData.startTime) setStartTime(initialData.startTime);
      if (initialData.endTime) setEndTime(initialData.endTime);
      if (initialData.type) setType(initialData.type);
      if (initialData.description) setDescription(initialData.description);
    }
  }, [initialData]);

  useEffect(() => {
    if (startTime && endTime) {
      const mins = calculateDuration(startTime, endTime);
      const hrs = (mins / 60).toFixed(2);
      setDurationStr(`${hrs} hrs (${mins} mins)`);
    } else {
      setDurationStr('0 hrs');
    }
  }, [startTime, endTime]);

  const handleTodoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTodoId(id);
    if (id) {
      const todo = activeTodos.find(t => t.id === id);
      if (todo) {
        setDescription(todo.text);
        // Auto-select the task type based on the ToDo category since the keys (UI, I, U, N) match.
        if (Object.values(TaskType).includes(todo.category as unknown as TaskType)) {
            setType(todo.category as unknown as TaskType);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = calculateDuration(startTime, endTime);
    
    if (mins <= 0) {
      alert("End time must be after start time.");
      return;
    }

    const newTask: Task = {
      id: initialData?.id || crypto.randomUUID(),
      date,
      startTime,
      endTime,
      description,
      type,
      durationMinutes: mins
    };

    onSave(newTask);
    
    // Handle Todo Completion
    if (selectedTodoId && markTodoDone && onLinkTodo) {
        onLinkTodo(selectedTodoId);
    }

    // Reset if not editing
    if (!initialData?.id) {
      setDescription('');
      setSelectedTodoId('');
      setStartTime(endTime); // Auto-set next start time to prev end time
      setEndTime('');
    }
  };

  // Group active todos by category for the dropdown
  const groupedTodos = activeTodos.reduce((acc, todo) => {
    const cat = todo.category as ToDoCategory;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(todo);
    return acc;
  }, {} as Record<ToDoCategory, ToDoItem[]>);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
        {initialData?.id ? 'Edit Task' : 'Log New Task'}
      </h3>

      {/* Import from Planner (Only show for new tasks and if todos exist) */}
      {!initialData?.id && activeTodos.length > 0 && (
        <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-blue-800 font-medium text-sm whitespace-nowrap">
                    <ArrowDownRight size={16} />
                    Import from Planner:
                </div>
                <select 
                    className="flex-1 p-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={selectedTodoId}
                    onChange={handleTodoSelect}
                >
                    <option value="">-- Select a pending To-Do --</option>
                    {Object.entries(TODO_CATEGORY_LABELS).map(([cat, label]) => {
                       const todosInCat = groupedTodos[cat as ToDoCategory];
                       if (!todosInCat || todosInCat.length === 0) return null;
                       
                       return (
                         <optgroup key={cat} label={label}>
                            {todosInCat.map(todo => (
                                <option key={todo.id} value={todo.id}>
                                     {todo.text} {todo.deadline ? `(Due: ${todo.deadline})` : ''}
                                </option>
                            ))}
                         </optgroup>
                       );
                    })}
                </select>
            </div>
            {selectedTodoId && (
                <div className="mt-2 flex items-center gap-2 ml-1">
                    <input 
                        type="checkbox" 
                        id="markDone" 
                        checked={markTodoDone} 
                        onChange={e => setMarkTodoDone(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="markDone" className="text-xs text-slate-600 cursor-pointer flex items-center gap-1">
                        <CheckSquare size={12} />
                        Mark as completed in Planner automatically
                    </label>
                </div>
            )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
          <input 
            type="date" 
            required
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
          <input 
            type="time" 
            required
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
          <input 
            type="time" 
            required
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Task Type</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            {Object.entries(TASK_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
        <input 
          type="text" 
          required
          placeholder="What did you work on?"
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-medium text-slate-500">
          Calculated Duration: <span className="text-blue-600">{durationStr}</span>
        </div>
        <div className="flex gap-2">
            {onCancel && (
                <button 
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    Cancel
                </button>
            )}
            <button 
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
            <Save size={18} />
            Save Task
            </button>
        </div>
      </div>
    </form>
  );
};
