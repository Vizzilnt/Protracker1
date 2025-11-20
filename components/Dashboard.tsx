
import React, { useState } from 'react';
import { Task, TASK_TYPE_COLORS, TASK_TYPE_LABELS, TaskType, ToDoItem } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileDown } from 'lucide-react';
import { generatePDFReport } from '../services/pdfGenerator';

interface DashboardProps {
  tasks: Task[];
  todos: ToDoItem[];
  userName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, todos, userName }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter tasks
  const filteredTasks = tasks.filter(t => t.date >= startDate && t.date <= endDate);

  // Process Data for Charts
  const typeDataMap: Record<string, number> = {};
  filteredTasks.forEach(t => {
    if (!typeDataMap[t.type]) typeDataMap[t.type] = 0;
    typeDataMap[t.type] += t.durationMinutes;
  });

  const pieData = Object.entries(typeDataMap).map(([type, mins]) => ({
    name: type,
    value: mins,
    label: TASK_TYPE_LABELS[type as TaskType]
  }));

  const totalHours = filteredTasks.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60;

  const handleDownloadPDF = () => {
    generatePDFReport(filteredTasks, todos, startDate, endDate, userName);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium mb-1">From</span>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="border p-1.5 rounded text-sm"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium mb-1">To</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="border p-1.5 rounded text-sm"
                />
            </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Tasks</h3>
            <p className="text-3xl font-bold text-slate-800">{filteredTasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Hours</h3>
            <p className="text-3xl font-bold text-slate-800">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Avg. Task Duration</h3>
            <p className="text-3xl font-bold text-slate-800">
                {filteredTasks.length ? (totalHours * 60 / filteredTasks.length).toFixed(0) : 0} <span className="text-base font-normal text-slate-500">min</span>
            </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-6">Hours by Task Type</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={TASK_TYPE_COLORS[entry.name as TaskType]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${(value / 60).toFixed(1)} hrs`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-6">Hours Breakdown</h4>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={30} />
                         <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `${(value / 60).toFixed(1)} hrs`} />
                         <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={TASK_TYPE_COLORS[entry.name as TaskType]} />
                            ))}
                         </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: TASK_TYPE_COLORS[d.name as TaskType]}}></span>
                            {d.label.split('(')[0]}
                        </span>
                        <span className="font-medium text-slate-800">{(d.value / 60).toFixed(1)} hrs</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
