'use client';

import { useState } from 'react';
import { safeGetItem } from '@/lib/safeStorage';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

// Stable Asset Exchange Logo SVG
const StableAssetLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#sae-gradient-page)" />
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
      <linearGradient id="sae-gradient-page" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

interface Product {
  id: string;
  name: string;
  description: string;
  apy: string;
  apyValue: number;
  risk: 'Low' | 'Medium' | 'High';
  lockPeriod: string;
  minDeposit: string;
  icon: string;
  color: string;
  features: string[];
}

// SVG Icons for products
const ProductIcons = {
  flexibleSavings: (
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  fixed30: (
    <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  fixed90: (
    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  fixed180: (
    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  liquidityPool: (
    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  staking: (
    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const products: Product[] = [
  {
    id: 'flexible-savings',
    name: 'Flexible Savings',
    description: 'Earn daily interest with no lock-up. Withdraw anytime.',
    apy: '4.5%',
    apyValue: 4.5,
    risk: 'Low',
    lockPeriod: 'None',
    minDeposit: '$10',
    icon: 'flexibleSavings',
    color: 'emerald',
    features: ['Daily interest accrual', 'Instant withdrawals', 'No minimum lock', 'Compound earnings']
  },
  {
    id: 'fixed-30',
    name: '30-Day Fixed',
    description: 'Lock your funds for 30 days for higher returns.',
    apy: '5.2%',
    apyValue: 5.2,
    risk: 'Low',
    lockPeriod: '30 Days',
    minDeposit: '$50',
    icon: 'fixed30',
    color: 'sky',
    features: ['Guaranteed rate', 'Auto-renewal option', 'Early exit penalty: 1%', 'Interest paid at maturity']
  },
  {
    id: 'fixed-90',
    name: '90-Day Fixed',
    description: 'Our most popular product. Great balance of yield and flexibility.',
    apy: '6.0%',
    apyValue: 6.0,
    risk: 'Low',
    lockPeriod: '90 Days',
    minDeposit: '$100',
    icon: 'fixed90',
    color: 'indigo',
    features: ['Best fixed rate', 'Monthly interest payouts', 'Early exit penalty: 2%', 'Priority support']
  },
  {
    id: 'fixed-180',
    name: '180-Day Fixed',
    description: 'Maximum returns for patient investors.',
    apy: '7.0%',
    apyValue: 7.0,
    risk: 'Low',
    lockPeriod: '180 Days',
    minDeposit: '$250',
    icon: 'fixed180',
    color: 'purple',
    features: ['Highest fixed APY', 'Monthly compounding', 'Early exit penalty: 3%', 'VIP support']
  },
  {
    id: 'liquidity-pool',
    name: 'Liquidity Pools',
    description: 'Provide liquidity and earn trading fees plus rewards.',
    apy: '8-12%',
    apyValue: 10,
    risk: 'Medium',
    lockPeriod: 'Flexible',
    minDeposit: '$100',
    icon: 'liquidityPool',
    color: 'cyan',
    features: ['Variable APY', 'Trading fee share', 'Impermanent loss risk', 'Bonus rewards']
  },
  {
    id: 'staking',
    name: 'XRP Staking',
    description: 'Stake XRP and earn rewards while supporting the network.',
    apy: '3.2%',
    apyValue: 3.2,
    risk: 'Low',
    lockPeriod: '7 Days',
    minDeposit: '100 XRP',
    icon: 'staking',
    color: 'amber',
    features: ['Network rewards', '7-day unbonding', 'Auto-compound option', 'No slashing risk']
  }
];

const riskColors = {
  Low: 'text-emerald-400 bg-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/20',
  High: 'text-red-400 bg-red-500/20'
};

const productColors: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' }
};

export default function EarnPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'flexible' | 'fixed' | 'advanced'>('all');

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'flexible') return p.lockPeriod === 'None' || p.lockPeriod === 'Flexible';
    if (filter === 'fixed') return p.lockPeriod.includes('Day');
    if (filter === 'advanced') return p.risk !== 'Low';
    return true;
  });

  const totalTVL = '$2.4M'; // Mock
  const avgAPY = '5.8%'; // Mock
  const activeUsers = '1,247'; // Mock

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
          <div className="max-w-5xl lg:max-w-none mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.back()}
                className="text-zinc-400 hover:text-white transition p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const vendorWallet = safeGetItem('vendorWalletAddress');
                  if (vendorWallet) {
                    router.push('/dashboard');
                  } else {
                    router.push('/affiliate-dashboard');
                  }
                }}
                className="text-zinc-400 hover:text-white transition p-2"
                title="Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <StableAssetLogo className="w-8 h-8" />
              <h1 className="text-base sm:text-lg font-bold hidden sm:block">Stable Asset Exchange</h1>
            </div>
            
            <button
              onClick={() => router.push('/earn/analytics')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl lg:max-w-none mx-auto px-4 lg:px-6 pb-12">
          
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 mt-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-1">Earn Interest on Your Assets</h2>
                <p className="text-zinc-400">
                  Yield products provided through our regulated partner.
                </p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition">
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-zinc-500 text-xs sm:text-sm mb-1">Total Value Locked</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{totalTVL}</p>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1">+12.4%</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-zinc-500 text-xs sm:text-sm mb-1">Average APY</p>
              <p className="text-xl sm:text-3xl font-bold text-indigo-400">{avgAPY}</p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">All products</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-zinc-500 text-xs sm:text-sm mb-1">Active Users</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{activeUsers}</p>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1">+89</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'flexible', label: 'Flexible' },
              { id: 'fixed', label: 'Fixed Term' },
              { id: 'advanced', label: 'Advanced' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  filter === tab.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredProducts.map((product) => {
              const colors = productColors[product.color];
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`${colors.bg} border ${colors.border} rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>{ProductIcons[product.icon as keyof typeof ProductIcons]}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${riskColors[product.risk]}`}>
                      {product.risk} Risk
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{product.description}</p>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-zinc-500 text-xs">APY</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{product.apy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500 text-xs">Lock Period</p>
                      <p className="text-white font-medium">{product.lockPeriod}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700/50">
                    <p className="text-zinc-500 text-xs">Min. Deposit: <span className="text-white">{product.minDeposit}</span></p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-6">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Connect', desc: 'Link your wallet or sign in with social login', icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )},
                { step: '2', title: 'Deposit', desc: 'Transfer RLUSD or XRP to your earn account', icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )},
                { step: '3', title: 'Choose Product', desc: 'Select a product that matches your goals', icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )},
                { step: '4', title: 'Earn', desc: 'Watch your balance grow with compound interest', icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )}
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <div className="text-indigo-400 text-sm font-medium mb-1">Step {item.step}</div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Security & Compliance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Regulated Partner</h4>
                  <p className="text-zinc-500 text-sm">Fully licensed and regulated in multiple jurisdictions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Secure Custody</h4>
                  <p className="text-zinc-500 text-sm">Assets held in institutional-grade cold storage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Audited</h4>
                  <p className="text-zinc-500 text-sm">Regular third-party security audits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-amber-400 text-sm font-medium mb-1">For Presentation Purposes Only</p>
            <p className="text-zinc-400 text-xs">This is not a live product. All rates, figures, and features shown are for demonstration purposes only.</p>
          </div>
        </main>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {ProductIcons[selectedProduct.icon as keyof typeof ProductIcons]}
                  <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-zinc-400 mb-6">{selectedProduct.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">APY</p>
                  <p className={`text-2xl font-bold ${productColors[selectedProduct.color].text}`}>
                    {selectedProduct.apy}
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Lock Period</p>
                  <p className="text-xl font-bold">{selectedProduct.lockPeriod}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Min. Deposit</p>
                  <p className="text-xl font-bold">{selectedProduct.minDeposit}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Risk Level</p>
                  <p className={`text-xl font-bold ${riskColors[selectedProduct.risk].split(' ')[0]}`}>
                    {selectedProduct.risk}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled
                className="w-full bg-zinc-700 text-zinc-400 font-semibold py-3 rounded-xl cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}