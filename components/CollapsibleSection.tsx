'use client';
import { useState, useEffect, useRef, ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  size?: 'default' | 'tall';
  dashboardType?: 'vendor' | 'affiliate';
  videoBg?: string;
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
  dashboardType = 'vendor',
  videoBg,
  children
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll into view when opened
  useEffect(() => {
    if (isOpen && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 250);
    }
  }, [isOpen]);

  const paddingClass = size === 'tall' ? 'py-[22px] px-4' : 'p-4';

  return (
    <div ref={sectionRef} id={id} className="bg-zinc-900/50 rounded-xl overflow-hidden">
      <button
  onClick={handleToggle}
  className={`w-full flex items-center justify-between ${paddingClass} hover:bg-zinc-800/50 transition relative overflow-hidden`}
>
  {videoBg && (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoBg} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-black/60 z-[1]"></div>
    </>
  )}
        <div className="flex items-center gap-3 relative z-[2]">
  {icon && <span className="text-zinc-400">{icon}</span>}
  <span className="font-medium">{title}</span>
</div>
        <div className="relative z-[2]">
        {isOpen ? (
          <svg className={`w-5 h-5 transition-all duration-200 ${dashboardType === 'vendor' ? 'text-emerald-400' : 'text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 transition-all duration-200 ${dashboardType === 'vendor' ? 'text-emerald-400' : 'text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
        </div>
</button>
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-0 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}