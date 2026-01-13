'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface DashboardHeaderProps {
  walletAddress?: string;
  storeId?: string;
  onSignOut?: () => void;
  showBalances?: boolean;
  onToggleBalances?: () => void;
  dashboardType?: 'vendor' | 'affiliate';
}

// Eye icon component
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    )}
  </svg>
);

export default function DashboardHeader({ walletAddress, storeId, onSignOut, showBalances = false, onToggleBalances, dashboardType = 'vendor' }: DashboardHeaderProps) {
  const router = useRouter();
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;
  const isConnected = !!walletAddress;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-sm w-full ${
  dashboardType === 'vendor' 
    ? 'bg-gradient-to-r from-emerald-300/55 via-emerald-500/50 via-green-600/45 to-green-900/50 border-b border-emerald-400/50'
    : 'bg-gradient-to-r from-lime-300/50 via-teal-400/50 via-cyan-400/55 via-blue-500/55 to-violet-500/60 border-b border-cyan-400/50'
}`}>
      <div className="px-6 py-3 flex items-center justify-between w-full max-w-full">
<div className="flex items-center gap-3">
  {/* Mobile hamburger - only show when logged in */}
  {isConnected && (
    <button 
      className="lg:hidden text-zinc-400 hover:text-white p-2 -ml-3 landscape:-ml-5"
      onClick={() => {
        const event = new CustomEvent('toggleSidebar');
        window.dispatchEvent(event);
      }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )}
  <Link href="/" className="flex items-center hover:opacity-80 md:ml-12 gap-3">
  {!walletAddress && dashboardType === 'vendor' && (
    <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllofUs" className="w-8 h-8 rounded-lg" />
  )}
  <span className={`font-bold text-white text-xl ${isConnected ? 'hidden md:block' : 'block'}`}>YesAllofUs</span>
</Link>

{/* Logo flush top-left - desktop/tablet only, logged in only */}
{walletAddress && (
  <div className="hidden md:block absolute top-0 left-0 z-50 h-full">
    <img 
      src="https://yesallofus.com/dltpayslogo1.png" 
      alt="YesAllofUs" 
      className="h-full w-auto object-cover" 
    />
  </div>
)}
</div>
        <div className="flex items-center gap-2">
          {isConnected && storeId && (
            <>
              {/* Take Payment */}
              <div className="relative group">
                <button
                  onClick={() => router.push('/take-payment')}
                  className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Take Payment
                </span>
              </div>

              {/* Analytics */}
              <div className="relative group">
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Analytics
                </span>
              </div>

              {/* Receipts */}
              <div className="relative group">
                <button
                  onClick={() => router.push('/receipts')}
                  className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Receipts
                </span>
              </div>

              {/* Customer Display */}
              <div className="relative group">
                <button
                  onClick={() => window.open(`/display?store=${storeId}`, '_blank')}
                  className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Customer Display
                </span>
              </div>

              {/* Staff */}
              <div className="relative group">
                <button
                  onClick={() => router.push('/staff')}
                  className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Staff
                </span>
              </div>

              <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            </>
          )}

          {/* Eye icon - show/hide balances */}
{isConnected && onToggleBalances && (
  <div className="relative group">
    <button
      id="balance-toggle"
      onClick={onToggleBalances}
      className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
    >
      <EyeIcon open={showBalances} />
    </button>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                {showBalances ? 'Hide balances' : 'Show balances'}
              </span>
            </div>
          )}

          {isConnected ? (
  <>
    <div className="hidden md:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      <span className="text-zinc-300 text-xs font-mono">{shortWallet}</span>
    </div>
    {onSignOut && (
      <button
onClick={onSignOut}
className="text-zinc-300 hover:text-white text-sm px-3 py-1.5 hidden md:block"
>
        Sign out
</button>
    )}
  </>
) : (
  <div className="hidden md:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg">
    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    <span className="text-zinc-400 text-xs">Not connected</span>
  </div>
)}
        </div>
      </div>
    </header>
  );
}