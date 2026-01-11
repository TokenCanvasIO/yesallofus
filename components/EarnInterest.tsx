'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// Product data - same as earn page
const products = [
  {
    id: 'flexible-savings',
    name: 'Flexible Savings',
    description: 'No lock-up, withdraw anytime',
    fullDescription: 'Earn daily interest with no lock-up. Withdraw anytime.',
    apy: '4.5%',
    risk: 'Low' as const,
    lockPeriod: 'None',
    minDeposit: '$10',
    color: 'emerald',
    features: ['Daily interest accrual', 'Instant withdrawals', 'No minimum lock', 'Compound earnings']
  },
  {
    id: 'fixed-30',
    name: '30-Day Fixed',
    description: 'Higher returns with 30-day lock',
    fullDescription: 'Lock your funds for 30 days for higher returns.',
    apy: '5.2%',
    risk: 'Low' as const,
    lockPeriod: '30 Days',
    minDeposit: '$50',
    color: 'sky',
    features: ['Guaranteed rate', 'Auto-renewal option', 'Early exit penalty: 1%', 'Interest paid at maturity']
  },
  {
    id: 'fixed-90',
    name: '90-Day Fixed',
    description: 'Best balance of yield & flexibility',
    fullDescription: 'Our most popular product. Great balance of yield and flexibility.',
    apy: '6.0%',
    risk: 'Low' as const,
    lockPeriod: '90 Days',
    minDeposit: '$100',
    color: 'indigo',
    features: ['Best fixed rate', 'Monthly interest payouts', 'Early exit penalty: 2%', 'Priority support']
  },
  {
    id: 'fixed-180',
    name: '180-Day Fixed',
    description: 'Maximum returns for patient investors.',
    fullDescription: 'Maximum returns for patient investors.',
    apy: '7.0%',
    risk: 'Low' as const,
    lockPeriod: '180 Days',
    minDeposit: '$250',
    color: 'purple',
    features: ['Highest fixed APY', 'Monthly compounding', 'Early exit penalty: 3%', 'VIP support']
  },
  {
    id: 'liquidity-pool',
    name: 'Liquidity Pools',
    description: 'Earn trading fees plus rewards',
    fullDescription: 'Provide liquidity and earn trading fees plus rewards.',
    apy: '8-12%',
    risk: 'Medium' as const,
    lockPeriod: 'Flexible',
    minDeposit: '$100',
    color: 'cyan',
    features: ['Variable APY', 'Trading fee share', 'Impermanent loss risk', 'Bonus rewards']
  },
  {
    id: 'staking',
    name: 'XRP Staking',
    description: 'Network rewards',
    fullDescription: 'Stake XRP and earn rewards while supporting the network.',
    apy: '3.2%',
    risk: 'Low' as const,
    lockPeriod: '7 Days',
    minDeposit: '100 XRP',
    color: 'amber',
    features: ['Network rewards', '7-day unbonding', 'Auto-compound option', 'No slashing risk']
  }
];

const productColors: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' }
};

const riskColors = {
  Low: 'text-emerald-400 bg-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/20',
  High: 'text-red-400 bg-red-500/20'
};

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

// Small product card component
const SmallProductCard = ({ product, onClick }: { product: typeof products[0]; onClick: () => void }) => {
  const colors = productColors[product.color];
  return (
    <button
      onClick={onClick}
      className={`w-full ${colors.bg} border ${colors.border} rounded-lg p-3 text-left hover:scale-[1.01] transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm">{product.name}</h4>
          <p className="text-zinc-500 text-xs truncate">{product.description}</p>
        </div>
        <p className={`font-bold ${colors.text} ml-3`}>{product.apy}</p>
      </div>
    </button>
  );
};

// Full product modal component
const FullProductModal = ({ product }: { product: typeof products[0] }) => {
  const colors = productColors[product.color];
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white">{product.name}</h4>
          <p className="text-zinc-400 text-sm">{product.fullDescription}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${riskColors[product.risk]}`}>
          {product.risk} Risk
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
          <p className="text-zinc-500 text-xs">APY</p>
          <p className={`font-bold ${colors.text}`}>{product.apy}</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
          <p className="text-zinc-500 text-xs">Lock</p>
          <p className="font-bold text-white text-sm">{product.lockPeriod}</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-2 text-center">
          <p className="text-zinc-500 text-xs">Min</p>
          <p className="font-bold text-white text-sm">{product.minDeposit}</p>
        </div>
      </div>
      <div className="space-y-1">
        {product.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
            <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

interface EarnInterestProps {
  noBorder?: boolean;
  rightColumnRef?: React.RefObject<HTMLDivElement | null>;
  openSections?: Record<string, boolean>;
}

// Base height of the card without products (header + stats + button + footer)
const BASE_HEIGHT = 320;
// Height of each small product card
const SMALL_CARD_HEIGHT = 60;
// Height of each full modal
const FULL_MODAL_HEIGHT = 220;

export default function EarnInterest({ noBorder = false, rightColumnRef, openSections = {} }: EarnInterestProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTwoColumn, setIsTwoColumn] = useState(false);

  useEffect(() => {
    const checkLayout = () => {
      setIsTwoColumn(window.innerWidth >= 1024);
    };
    checkLayout();
    window.addEventListener('resize', checkLayout);

    return () => {
      window.removeEventListener('resize', checkLayout);
    };
  }, []);

  // Calculate how many sections are open
  const openCount = Object.values(openSections).filter(Boolean).length;

  // Calculate what to show based on open sections
  let smallCardsCount = 0;
  let fullModalsCount = 0;

  if (isTwoColumn && openCount > 0) {
  // Each open section adds roughly 350px of space
  const estimatedExtraHeight = openCount * 350;
  
  // First allocate full modals (they look better with more space)
  fullModalsCount = Math.floor(estimatedExtraHeight / FULL_MODAL_HEIGHT);
  
  // Then fill remaining space with small cards
  const remainingHeight = estimatedExtraHeight - (fullModalsCount * FULL_MODAL_HEIGHT);
  smallCardsCount = Math.floor(remainingHeight / SMALL_CARD_HEIGHT);
  
  // Cap totals to available products
  const totalProducts = products.length;
  fullModalsCount = Math.min(fullModalsCount, totalProducts);
  smallCardsCount = Math.min(smallCardsCount, Math.max(0, totalProducts - fullModalsCount));
}

  const smallCards = products.slice(0, smallCardsCount);
  const fullModals = products.slice(smallCardsCount, smallCardsCount + fullModalsCount);

  return (
    <div 
      ref={containerRef}
      className={`h-full ${noBorder ? "" : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 mb-6"}`}
    >
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

      {/* Dynamic product display based on available height */}
      {(smallCards.length > 0 || fullModals.length > 0) && (
        <div className="mt-4 space-y-3">
          {/* Small cards first */}
          {smallCards.length > 0 && (
            <div className="space-y-2">
              {smallCards.map((product) => (
                <SmallProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => router.push('/earn')} 
                />
              ))}
            </div>
          )}
          
          {/* Full modals */}
          {fullModals.map((product) => (
            <FullProductModal key={product.id} product={product} />
          ))}
        </div>
      )}

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