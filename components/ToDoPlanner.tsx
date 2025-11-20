
import React, { useState, useEffect, useRef } from 'react';
import { ToDoItem, ToDoCategory, Timeframe, TODO_CATEGORY_LABELS, TODO_CATEGORY_STYLES, TIMEFRAME_LABELS } from '../types';
import { 
    Plus, CheckCircle2, Circle, Trash2, AlertCircle, Clock, Zap, ClipboardList, X, 
    Calendar, CalendarDays, CalendarRange, FolderClock, ChevronLeft, ChevronRight, 
    RotateCcw, AlignLeft, ChevronUp,
    Star, Flag, AlertTriangle, Home, Briefcase, Book, Phone, Mail, Gift, Coffee, 
    Music, Gamepad2, Dumbbell, Plane, Smile
} from 'lucide-react';

interface ToDoPlannerProps {
  todos: ToDoItem[];
  onAdd: (todo: ToDoItem) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (todo: ToDoItem) => void;
}

// --- Constants & Helpers ---

const ICON_OPTIONS = [
    { name: 'star', Icon: Star },
    { name: 'flag', Icon: Flag },
    { name: 'zap', Icon: Zap },
    { name: 'alert', Icon: AlertTriangle },
    { name: 'home', Icon: Home },
    { name: 'work', Icon: Briefcase },
    { name: 'study', Icon: Book },
    { name: 'call', Icon: Phone },
    { name: 'email', Icon: Mail },
    { name: 'gift', Icon: Gift },
    { name: 'break', Icon: Coffee },
    { name: 'music', Icon: Music },
    { name: 'game', Icon: Gamepad2 },
    { name: 'gym', Icon: Dumbbell },
    { name: 'travel', Icon: Plane },
    { name: 'idea', Icon: Smile },
];

const toISODate = (d: Date) => d.toISOString().split('T')[0];

const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
  return new Date(date.setDate(diff));
};

const getEndOfWeek = (d: Date) => {
  const date = getStartOfWeek(d);
  date.setDate(date.getDate() + 6);
  return new Date(date);
};

// --- Sub-Component: Icon Picker ---

const IconPicker = ({ selected, onSelect }: { selected: string | undefined, onSelect: (icon: string | undefined) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const SelectedIcon = selected ? (ICON_OPTIONS.find(i => i.name === selected)?.Icon || Smile) : Smile;

    return (
      <div className="relative" ref={containerRef}>
         <button 
           type="button"
           onClick={() => setIsOpen(!isOpen)}
           className={`p-2 rounded-lg border transition-all flex items-center justify-center h-[46px] w-[46px] ${selected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
           title="Select Icon for Task"
         >
           {selected ? <SelectedIcon size={24} /> : <Smile size={24} className="opacity-50" />}
         </button>
         
         {isOpen && (
           <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-72 grid grid-cols-6 gap-2 animate-fade-in-up">
              <div className="col-span-6 text-xs font-bold text-slate-400 uppercase mb-1">Choose Icon</div>
              <button 
                  type="button"
                  onClick={() => { onSelect(undefined); setIsOpen(false); }}
                  className="p-2 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center h-9 w-9 border border-transparent hover:border-red-100"
                  title="No Icon"
              >
                  <X size={18} />
              </button>
              {ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                      key={name}
                      type="button"
                      onClick={() => { onSelect(name); setIsOpen(false); }}
                      className={`p-2 rounded flex items-center justify-center h-9 w-9 transition-all border ${selected === name ? 'bg-blue-100 text-blue-600 border-blue-200' : 'hover:bg-slate-100 text-slate-600 border-transparent'}`}
                      title={name}
                  >
                      <Icon size={18} />
                  </button>
              ))}
           </div>
         )}
      </div>
    );
};

// --- Main Component ---

export const ToDoPlanner: React.FC<ToDoPlannerProps> = ({ todos, onAdd, onToggle, onDelete, onUpdate }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ToDoCategory>(ToDoCategory.URGENT_IMPORTANT);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>(Timeframe.DAILY);
  const [deadline, setDeadline] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(undefined);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingIcon, setEditingIcon] = useState<string | undefined>(undefined);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Intelligent Date Adjustment
  useEffect(() => {
    const d = new Date(viewDate);
    switch (activeTimeframe) {
      case Timeframe.WEEKLY:
        setViewDate(getStartOfWeek(d));
        break;
      case Timeframe.MONTHLY:
        d.setDate(1);
        setViewDate(new Date(d));
        break;
      case Timeframe.YEARLY:
        d.setMonth(0);
        d.setDate(1);
        setViewDate(new Date(d));
        break;
    }
  }, [activeTimeframe]);

  // --- Date Helpers ---

  const getDateRange = (date: Date, tf: Timeframe): { start: string, end: string, label: string } => {
    const d = new Date(date);
    const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    
    switch (tf) {
      case Timeframe.DAILY:
        return {
          start: toISODate(d),
          end: toISODate(d),
          label: d.toLocaleDateString('en-US', { weekday: 'short', ...formatOptions })
        };
      case Timeframe.WEEKLY: {
        const start = getStartOfWeek(d);
        const end = getEndOfWeek(d);
        return {
          start: toISODate(start),
          end: toISODate(end),
          label: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        };
      }
      case Timeframe.MONTHLY: {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return {
          start: toISODate(start),
          end: toISODate(end),
          label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      }
      case Timeframe.YEARLY: {
        const start = new Date(d.getFullYear(), 0, 1);
        const end = new Date(d.getFullYear(), 11, 31);
        return {
          start: toISODate(start),
          end: toISODate(end),
          label: `${d.getFullYear()}`
        };
      }
    }
  };

  const navigateDate = (direction: -1 | 1) => {
    const newDate = new Date(viewDate);
    switch (activeTimeframe) {
      case Timeframe.DAILY:
        newDate.setDate(newDate.getDate() + direction);
        break;
      case Timeframe.WEEKLY:
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case Timeframe.MONTHLY:
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case Timeframe.YEARLY:
        newDate.setFullYear(newDate.getFullYear() + direction);
        break;
    }
    setViewDate(newDate);
    
    if (activeTimeframe === Timeframe.DAILY) {
        setDeadline(toISODate(newDate));
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setViewDate(today);
    if (activeTimeframe === Timeframe.DAILY) {
        setDeadline(toISODate(today));
    } else {
        setDeadline('');
    }
  };

  // --- Filtering Logic ---
  
  const { start, end, label } = getDateRange(viewDate, activeTimeframe);
  
  const todayISO = toISODate(new Date());
  const isCurrentPeriod = todayISO >= start && todayISO <= end;

  const currentTodos = todos.filter(t => {
    if (t.timeframe !== activeTimeframe) return false;
    if (t.deadline) {
      return t.deadline >= start && t.deadline <= end;
    } else {
      return isCurrentPeriod;
    }
  });

  const completedTodos = currentTodos.filter(t => t.completed);

  // --- Handlers ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newItem: ToDoItem = {
      id: crypto.randomUUID(),
      text,
      category,
      timeframe: activeTimeframe,
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: deadline || (activeTimeframe === Timeframe.DAILY ? start : undefined),
      icon: selectedIcon,
    };

    onAdd(newItem);
    setText('');
    setSelectedIcon(undefined);
  };

  const handleStartEdit = (item: ToDoItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
    setEditingNotes(item.notes || '');
    setEditingIcon(item.icon);
  };

  const handleSaveEdit = () => {
    if (editingId && editingText.trim()) {
      const todo = todos.find(t => t.id === editingId);
      if (todo) {
        if (todo.text !== editingText || (todo.notes || '') !== editingNotes || todo.icon !== editingIcon) {
            onUpdate({ ...todo, text: editingText, notes: editingNotes, icon: editingIcon });
        }
      }
    }
    setEditingId(null);
    setEditingText('');
    setEditingNotes('');
    setEditingIcon(undefined);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Only save if focus moves outside the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleSaveEdit();
    }
  };

  const CategoryIcon = ({ cat }: { cat: ToDoCategory }) => {
    switch (cat) {
      case ToDoCategory.URGENT_IMPORTANT: return <AlertCircle size={18} />;
      case ToDoCategory.IMPORTANT: return <Clock size={18} />;
      case ToDoCategory.URGENT: return <Zap size={18} />;
      case ToDoCategory.NECESSARY: return <ClipboardList size={18} />;
      default: return <Circle size={18} />;
    }
  };

  const TimeframeIcon = ({ tf }: { tf: Timeframe }) => {
    switch (tf) {
      case Timeframe.DAILY: return <Calendar size={16} />;
      case Timeframe.WEEKLY: return <CalendarDays size={16} />;
      case Timeframe.MONTHLY: return <CalendarRange size={16} />;
      case Timeframe.YEARLY: return <FolderClock size={16} />;
    }
  };

  const ToDoCard = ({ cat }: { cat: ToDoCategory }) => {
    const styles = TODO_CATEGORY_STYLES[cat];
    const items = currentTodos
      .filter(t => t.category === cat && !t.completed)
      .sort((a, b) => {
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline && a.deadline !== b.deadline) {
             return a.deadline.localeCompare(b.deadline);
        }
        return a.createdAt.localeCompare(b.createdAt);
      });

    return (
      <div className={`rounded-xl border-t-4 shadow-md bg-white h-full flex flex-col ${styles.border} ${styles.borderTop}`}>
        <div className={`p-4 border-b ${styles.border} ${styles.bg}`}>
            <div className={`flex items-center gap-2 font-bold ${styles.text} uppercase text-sm tracking-wide`}>
                <CategoryIcon cat={cat} />
                {TODO_CATEGORY_LABELS[cat]}
            </div>
        </div>
        
        <div className="p-4 space-y-3 flex-1 bg-white">
          {items.length === 0 && (
            <div className="text-center py-6 opacity-40 text-xs italic text-slate-500">No active tasks</div>
          )}
          {items.map(item => {
            const isOverdue = item.deadline && item.deadline < todayISO;
            const isEditing = editingId === item.id;
            const hasNotes = !!item.notes;
            const isExpanded = expandedIds.has(item.id);
            const ItemIcon = item.icon ? (ICON_OPTIONS.find(i => i.name === item.icon)?.Icon || Smile) : null;

            return (
              <div key={item.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg group hover:bg-white hover:shadow-md transition-all border border-slate-100">
                <button 
                  onClick={() => onToggle(item.id)}
                  className={`${styles.text} hover:opacity-70 mt-0.5 flex-shrink-0`}
                >
                  <Circle size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div onBlur={handleBlur} className="space-y-2 w-full">
                            <div className="flex items-center gap-2">
                                <IconPicker selected={editingIcon} onSelect={setEditingIcon} />
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); 
                                            handleSaveEdit();
                                        } else if (e.key === 'Escape') {
                                            setEditingId(null);
                                        }
                                    }}
                                    className="flex-1 p-2 text-sm border border-blue-400 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <textarea 
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                placeholder="Add notes (optional)..."
                                rows={3}
                                className="w-full p-2 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none resize-none transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setEditingId(null);
                                    }
                                    e.stopPropagation();
                                }}
                            />
                        </div>
                    ) : (
                        <div className="group/item">
                             <div className="flex justify-between items-start gap-2">
                                <span 
                                    onClick={() => handleStartEdit(item)}
                                    className="text-sm text-slate-800 font-medium leading-snug block break-words cursor-text hover:bg-slate-100 -mx-1 px-1 rounded transition-colors relative flex-1 flex items-center gap-2"
                                    title="Click to edit"
                                >
                                    {ItemIcon && <ItemIcon size={16} className="text-slate-500 flex-shrink-0" />}
                                    {item.text}
                                </span>
                                {hasNotes && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                                        className="text-slate-400 hover:text-blue-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                                        title={isExpanded ? "Collapse notes" : "Show notes"}
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <AlignLeft size={16} />}
                                    </button>
                                )}
                             </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                {item.deadline && (
                                    <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                                        <Calendar size={10} />
                                        {isOverdue ? 'Overdue: ' : 'Due: '}{item.deadline}
                                    </div>
                                )}
                            </div>

                            {isExpanded && hasNotes && (
                                <div className="mt-2 text-xs text-slate-600 bg-white/60 p-2 rounded border border-slate-100 whitespace-pre-wrap animate-fade-in-down">
                                    {item.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-slate-200 shadow-sm p-2 rounded-xl">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
            {Object.values(Timeframe).map((tf) => (
            <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTimeframe === tf 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
                <TimeframeIcon tf={tf} />
                {TIMEFRAME_LABELS[tf]}
            </button>
            ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-1 flex-1 md:flex-none justify-between">
                <button onClick={() => navigateDate(-1)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center">
                    {label}
                </div>
                <button onClick={() => navigateDate(1)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
            <button 
                onClick={resetToToday}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                title="Go to Today"
            >
                <RotateCcw size={14} />
                Today
            </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1">
              Add to {TIMEFRAME_LABELS[activeTimeframe]} List
            </label>
            <div className="flex gap-2">
                <IconPicker selected={selectedIcon} onSelect={setSelectedIcon} />
                <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`What needs to be done ${activeTimeframe === Timeframe.DAILY && !isCurrentPeriod ? `on ${label}` : 'now'}?`}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none shadow-sm"
                />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full lg:w-48">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Category</label>
                <div className="relative">
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ToDoCategory)}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none appearance-none bg-white shadow-sm"
                    >
                        {Object.entries(TODO_CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-40">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Deadline</label>
                <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm text-slate-600 shadow-sm"
                />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg hover:shadow-slate-200"
          >
            <Plus size={20} />
            Add Task
          </button>
        </form>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToDoCard cat={ToDoCategory.URGENT_IMPORTANT} />
        <ToDoCard cat={ToDoCategory.IMPORTANT} />
        <ToDoCard cat={ToDoCategory.URGENT} />
        <ToDoCard cat={ToDoCategory.NECESSARY} />
      </div>

      {/* Completed Section */}
      {completedTodos.length > 0 && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            Completed ({label})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedTodos.map(item => {
                const ItemIcon = item.icon ? (ICON_OPTIONS.find(i => i.name === item.icon)?.Icon || Smile) : null;
                return (
                <div key={item.id} className="flex items-center justify-between text-slate-400 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => onToggle(item.id)} className="text-green-500 flex-shrink-0 hover:scale-110 transition-transform">
                        <CheckCircle2 size={18} />
                    </button>
                    <div className="min-w-0">
                         <span className="line-through text-sm truncate flex items-center gap-2">
                            {ItemIcon && <ItemIcon size={14} className="opacity-50" />}
                            {item.text}
                         </span>
                        <div className="flex gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider border border-slate-100 px-1.5 rounded bg-slate-50">{TODO_CATEGORY_LABELS[item.category].split(' ')[0]}</span>
                        </div>
                    </div>
                    </div>
                    <button 
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 hover:text-red-400 flex-shrink-0 ml-2 p-1 hover:bg-red-50 rounded"
                    >
                    <Trash2 size={14} />
                    </button>
                </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};
