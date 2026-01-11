'use client';
import { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string | ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  show?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleOpen: () => void;
  onToggleCollapsed: () => void;
  dashboardType?: 'vendor' | 'affiliate';
  storeName?: string;
  storeLogo?: string | null;
  walletAddress?: string | null;
  navItems: NavItem[];
  onNavClick: (id: string, onClick?: () => void) => void;
  onLogoClick: () => void;
  onSignOut: () => void;
  onTakeTour?: () => void;
  onInfoClick?: (sectionId: string) => void;
  onShowProgress?: () => void;
}

export default function Sidebar({
  isOpen,
  isCollapsed,
  onToggleOpen,
  onToggleCollapsed,
  dashboardType = 'vendor',
  storeName,
  storeLogo,
  walletAddress,
  navItems,
  onNavClick,
  onLogoClick,
  onSignOut,
  onTakeTour,
  onInfoClick,
  onShowProgress
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={onToggleOpen} 
        />
      )}

      {/* Desktop Collapsed Tab Handle */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-24 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 border-l-0 rounded-r-lg items-center justify-center transition-colors"
          title="Open menu"
        >
          <svg 
            className="w-4 h-4 text-zinc-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
  className={`
    fixed left-0 w-64 bg-zinc-900 lg:bg-zinc-900/90 border-r border-zinc-800 z-[60]
    transform transition-transform duration-300 ease-in-out
    top-14 h-[calc(100vh-3.5rem)] lg:rounded-tr-2xl lg:rounded-br-2xl
    flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${!isCollapsed ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
  `}
>
        {/* Close button (desktop only when expanded) */}
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex absolute top-4 right-4 w-8 h-8 items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          title="Collapse menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Store Info Header */}
<div className="p-6 landscape:p-2 landscape:pt-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <button
onClick={onLogoClick}
className={`relative w-10 h-10 landscape:w-7 landscape:h-7 rounded-lg overflow-hidden transition flex-shrink-0 cursor-pointer ${
                storeLogo ? 'hover:opacity-80' : 'border border-zinc-700 hover:border-emerald-500'
              }`}
              title="Store logo"
            >
              {storeLogo ? (
                <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </button>
          </div>
          <p className="font-medium text-zinc-300 truncate landscape:text-sm">
            {storeName || 'Get Started'}
          </p>
          {walletAddress && (
            <p className="text-zinc-500 text-xs font-mono mt-1">
              {walletAddress.substring(0, 8)}...{walletAddress.slice(-6)}
            </p>
          )}
        </div>

        {/* Navigation - scrollable area */}
        <nav className="flex-1 p-4 landscape:p-2 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => item.show !== false)
            .map((item) => (
              <div key={item.id} className="flex items-center group">
                <button
  onClick={() => onNavClick(item.id, item.onClick)}
  className={`flex-1 flex items-center gap-3 px-3 py-2 landscape:py-1.5 text-left text-zinc-400 hover:bg-zinc-800 rounded-lg transition ${
    dashboardType === 'vendor' 
      ? 'hover:text-emerald-400' 
      : 'hover:text-cyan-400'
  }`}
>
                  <span className="text-zinc-500">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
                {onInfoClick && (
                  <button
  onClick={(e) => {
    e.stopPropagation();
    onInfoClick(item.id);
  }}
  className={`p-1.5 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 ${
  dashboardType === 'vendor' 
    ? 'text-zinc-500 hover:text-emerald-400' 
    : 'text-zinc-500 hover:text-cyan-400'
}`}
  title="Learn more"
>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
        </nav>

        {/* Footer - fixed at bottom */}
<div className="flex-shrink-0 p-4 landscape:p-2 border-t border-zinc-800 bg-zinc-900 lg:bg-transparent relative overflow-hidden">
  {/* Guernsey Flag Video Background - desktop only */}
  <div className="hidden lg:block absolute inset-0 z-0">
    <video
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
  ref={(el) => { if (el) el.playbackRate = 0.2; }}
>
      <source src="/guernsey-flag.webm" type="video/webm" />
    </video>
    <div className="absolute inset-0 bg-black/90"></div>
  </div>
  <div className="relative z-10">
          {/* Show Progress Button */}
          {onShowProgress && (
            <button
              onClick={onShowProgress}
              className="w-full flex items-center gap-3 px-3 py-2 landscape:py-1.5 mb-1 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5 landscape:w-4 landscape:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">Show Progress</span>
            </button>
          )}

          {/* Take Tour Button */}
          {onTakeTour && (
            <button
              onClick={onTakeTour}
              className="w-full flex items-center gap-3 px-3 py-2 landscape:py-1.5 mb-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5 landscape:w-4 landscape:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm">Take Tour</span>
            </button>
          )}

          {/* YAOFU Badge - desktop only */}
          <div className="hidden lg:flex mt-4 mb-4 justify-center">
            <svg viewBox="0 0 140 58" className="w-28 h-14">
              <defs>
                <linearGradient id="yaofuGradientSidebar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="40%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <text x="70" y="12" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="9" letterSpacing="1">
                {dashboardType === 'affiliate' ? 'AFFILIATE' : 'PARTNER'}
              </text>
              <text x="70" y="32" textAnchor="middle" fill="url(#yaofuGradientSidebar)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
                YAOFUS
              </text>
              <text x="70" y="50" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="10" letterSpacing="2">
                DASHBOARD
              </text>
            </svg>
          </div>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 landscape:py-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
          >
            <svg className="w-5 h-5 landscape:w-4 landscape:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm">Sign out</span>
          </button>
  </div>
</div>
      </aside>
    </>
  );
}