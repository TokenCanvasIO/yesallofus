'use client';

import { useRouter } from 'next/navigation';

// Stable Asset Exchange Logo SVG
const StableAssetLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#sae-gradient)" />
    <path 
      d="M14 24C14 18.477 18.477 14 24 14V14C29.523 14 34 18.477 34 24V24C34 29.523 29.523 34 24 34V34C18.477 34 14 29.523 14 24V24Z" 
      stroke="white" 
      strokeWidth="2"
    />
    <path 
      d="M24 18V30M18 24H30" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <circle cx="24" cy="24" r="3" fill="white" />
    <defs>
      <linearGradient id="sae-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export default function EarnInterest() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <StableAssetLogo className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">Earn Interest</h3>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              Coming Soon
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Yield products provided through our regulated partner.
          </p>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
          <p className="text-indigo-400 text-xl font-bold">4.5%</p>
          <p className="text-zinc-500 text-xs">Flexible APY</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
          <p className="text-purple-400 text-xl font-bold">6.0%</p>
          <p className="text-zinc-500 text-xs">90-Day Fixed</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
          <p className="text-emerald-400 text-xl font-bold">8.5%</p>
          <p className="text-zinc-500 text-xs">Liquidity Pools</p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/earn')}
        className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
      >
        <span>Explore Products</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Powered By */}
      <p className="text-zinc-600 text-xs text-center mt-3">
        Powered by Stable Asset Exchange · Regulated & Secure
      </p>

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-zinc-700/50">
        <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
          For presentation purposes only. This is not a live product.
        </p>
      </div>
    </div>
  );
}