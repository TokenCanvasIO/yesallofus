'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface DashboardHeaderProps {
  walletAddress?: string;
  storeId?: string;
  onSignOut?: () => void;
}

export default function DashboardHeader({ walletAddress, storeId, onSignOut }: DashboardHeaderProps) {
  const router = useRouter();
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;
  const isConnected = !!walletAddress;

  return (
    <header className="hidden sm:block sticky top-0 z-50 bg-[#0d0d0d]">
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80">
          <Logo size={32} />
          <span className="font-bold text-white text-xl">YesAllofUs</span>
        </Link>

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

          {isConnected ? (
            <>
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-zinc-300 text-xs font-mono">{shortWallet}</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-zinc-500 hover:text-white text-sm px-3 py-1.5"
                >
                  Sign out
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-zinc-400 text-xs">Not connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}