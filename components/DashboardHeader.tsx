'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface DashboardHeaderProps {
  walletAddress?: string;
  onSignOut?: () => void;
}

export default function DashboardHeader({ walletAddress, onSignOut }: DashboardHeaderProps) {
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
        
        <div className="flex items-center gap-3">
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