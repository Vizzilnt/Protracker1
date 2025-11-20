import React from 'react';
import { Task, TASK_TYPE_COLORS, TASK_TYPE_LABELS } from '../types';
import { Trash2, Edit2, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete, onEdit }) => {
  // Sort tasks descending by date/time
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <div className="text-slate-400 mb-2">No tasks logged yet</div>
        <div className="text-sm text-slate-500">Use the form above or the timer to start tracking.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedTasks.map((task) => (
            <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${task.durationMinutes > 180 ? 'bg-red-50 hover:bg-red-100' : ''}`}>
              <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">{task.date}</td>
              <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                {task.startTime} - {task.endTime}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                {(task.durationMinutes / 60).toFixed(2)} hrs
              </td>
              <td className="py-3 px-4 text-sm whitespace-nowrap">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: TASK_TYPE_COLORS[task.type] }}
                >
                  {task.type}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-slate-700 max-w-xs truncate" title={task.description}>
                {task.description}
              </td>
              <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                <button 
                  onClick={() => onEdit(task)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};