'use client';
import { useState, useEffect, ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  size?: 'default' | 'tall';
  children: ReactNode;
}

export default function CollapsibleSection({
  id,
  title,
  icon,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  size = 'default',
  children
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Support both controlled and uncontrolled modes
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  
  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalOpen(newState);
    }
  };

  const paddingClass = size === 'tall' ? 'py-[22px] px-4' : 'p-4';

  return (
    <div id={id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between ${paddingClass} hover:bg-zinc-800/50 transition`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 pt-2 border-t border-zinc-800">
          {children}
        </div>
      </div>
    </div>
  );
}