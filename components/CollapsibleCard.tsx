'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: 'emerald' | 'yellow' | 'red' | 'blue';
  children: ReactNode;
}

export default function CollapsibleCard({
  title,
  icon,
  defaultOpen = false,
  badge,
  badgeColor = 'emerald',
  children
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeColors = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-zinc-800/50 transition"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h2 className="text-lg font-bold">{title}</h2>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}