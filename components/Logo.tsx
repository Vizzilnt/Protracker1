
import React from 'react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  iconClassName = "h-8 w-auto", 
  textClassName = "text-xl",
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={iconClassName}
        aria-label="ProTracker Logo"
      >
        {/* Dark Grey Segment (Base) */}
        <path 
          d="M20 80 L50 50 L50 65 L35 80 Z" 
          fill="#334155" 
        />
        {/* Blue Segment (Arrow Up) */}
        <path 
          d="M50 50 L80 20 L80 45 L65 60 L50 45 Z" 
          fill="#2563eb" 
        />
        {/* Arrow Head */}
        <path 
          d="M60 20 L80 20 L80 40" 
          stroke="#2563eb" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      
      {showText && (
        <span className={`font-bold tracking-tight ${textClassName}`}>
          <span className="text-slate-700">Pro</span>
          <span className="text-blue-600">Tracker</span>
        </span>
      )}
    </div>
  );
};
