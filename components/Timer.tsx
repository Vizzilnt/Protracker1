import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock } from 'lucide-react';

interface TimerProps {
  onStop: (startTime: string, endTime: string) => void;
}

export const Timer: React.FC<TimerProps> = ({ onStop }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTimeStr, setStartTimeStr] = useState<string | null>(null);
  
  // To handle intervals correctly
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStartTimeStr(getCurrentTimeStr());
    setSeconds(0);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    const endTimeStr = getCurrentTimeStr();
    if (startTimeStr) {
      onStop(startTimeStr, endTimeStr);
    }
    setStartTimeStr(null);
    setSeconds(0);
  };

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-6 w-full md:w-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">
          <Clock size={20} className="text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Session</div>
          <div className="text-xl font-mono font-bold tracking-wider">{formatTime(seconds)}</div>
        </div>
      </div>

      <button
        onClick={isActive ? handleStop : handleStart}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isActive ? (
          <>
            <Square size={16} fill="currentColor" /> Stop
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" /> Start
          </>
        )}
      </button>
    </div>
  );
};