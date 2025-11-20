
import React, { useState, useEffect } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { Dashboard } from './components/Dashboard';
import { Timer } from './components/Timer';
import { ToDoPlanner } from './components/ToDoPlanner';
import { Auth } from './components/Auth';
import { Logo } from './components/Logo';
import { getTasks, saveTask, deleteTask, updateTask, getToDos, saveToDo, toggleToDo, deleteToDo, updateToDo } from './services/storage';
import { getCurrentUser, logoutUser } from './services/auth';
import { Task, ToDoItem, User } from './types';
import { LayoutDashboard, List, PlusCircle, CheckSquare, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'todo'>('tasks');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Timer auto-fill data
  const [timerData, setTimerData] = useState<{startTime: string, endTime: string} | undefined>(undefined);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      setTasks(getTasks());
      setTodos(getToDos());
    }
  }, [user]);

  // --- Auth Handlers ---
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // --- Task Handlers ---
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
        const updated = updateTask(task);
        setTasks(updated);
        setEditingTask(undefined);
    } else {
        const updated = saveTask(task);
        setTasks(updated);
    }
    setIsFormOpen(false);
    setTimerData(undefined);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updated = deleteTask(id);
      setTasks(updated);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
    setActiveTab('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTimerStop = (start: string, end: string) => {
    setTimerData({ startTime: start, endTime: end });
    setIsFormOpen(true);
    setActiveTab('tasks');
  };

  const handleCancelForm = () => {
      setIsFormOpen(false);
      setEditingTask(undefined);
      setTimerData(undefined);
  }

  // --- ToDo Handlers ---
  const handleAddToDo = (todo: ToDoItem) => {
    const updated = saveToDo(todo);
    setTodos(updated);
  };

  const handleToggleToDo = (id: string) => {
    const updated = toggleToDo(id);
    setTodos(updated);
  };

  const handleDeleteToDo = (id: string) => {
    const updated = deleteToDo(id);
    setTodos(updated);
  };

  const handleUpdateToDo = (todo: ToDoItem) => {
    const updated = updateToDo(todo);
    setTodos(updated);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Filter for dropdown in TaskForm
  const activeTodos = todos.filter(t => !t.completed);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Logo className="h-10" iconClassName="h-8 w-auto" textClassName="text-xl" />
             <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
             <p className="hidden md:block text-xs text-slate-500">Activity & Time Tracker</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <Timer onStop={handleTimerStop} />
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-slate-600">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate max-w-[100px]">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1 rounded-lg border border-slate-200 w-fit">
            <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'tasks' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <List size={18} />
                Log & Tasks
            </button>
            <button
                onClick={() => setActiveTab('todo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'todo' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <CheckSquare size={18} />
                Daily Planner
            </button>
            <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <LayoutDashboard size={18} />
                Dashboard & Reports
            </button>
        </div>

        {/* Content Area */}
        {activeTab === 'tasks' && (
            <div className="space-y-8">
                {/* Add Task Button (if form is closed) */}
                {!isFormOpen && (
                     <button 
                        onClick={() => setIsFormOpen(true)}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                     >
                        <PlusCircle size={20} />
                        Log Manual Task
                     </button>
                )}

                {/* Task Form */}
                {isFormOpen && (
                     <div className="animate-fade-in-down">
                        <TaskForm 
                            onSave={handleSaveTask} 
                            initialData={editingTask || timerData} 
                            onCancel={handleCancelForm}
                            activeTodos={activeTodos}
                            onLinkTodo={handleToggleToDo}
                        />
                     </div>
                )}

                {/* Task List */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activities</h2>
                    <TaskList tasks={tasks} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                </div>
            </div>
        )}

        {activeTab === 'todo' && (
            <div className="space-y-4">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Daily Priorities</h2>
                    <p className="text-sm text-slate-500">Categorize tasks to focus on what matters.</p>
                </div>
                <ToDoPlanner 
                    todos={todos} 
                    onAdd={handleAddToDo} 
                    onToggle={handleToggleToDo} 
                    onDelete={handleDeleteToDo}
                    onUpdate={handleUpdateToDo}
                />
            </div>
        )}

        {activeTab === 'dashboard' && (
            <Dashboard tasks={tasks} todos={todos} userName={user.name} />
        )}
      </main>
    </div>
  );
};

export default App;
