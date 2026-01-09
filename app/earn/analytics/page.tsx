'use client';

import { useState, JSX } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

// Stable Asset Exchange Logo SVG
const StableAssetLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#sae-gradient-analytics)" />
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
      <linearGradient id="sae-gradient-analytics" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

// Mock holdings data
const mockHoldings = [
  { product: 'Flexible Savings', amount: 523.76, apy: 4.5, earnings: 23.76, color: 'emerald' },
  { product: '90-Day Fixed', amount: 502.47, apy: 6.0, earnings: 2.47, color: 'indigo' },
  { product: 'XRP Staking', amount: 200.00, apy: 3.2, earnings: 0.53, color: 'amber' },
];

// Mock transactions data
const mockTransactions = [
  { id: '1', type: 'deposit', product: 'Flexible Savings', amount: 500, date: '2025-01-04T10:30:00Z', status: 'completed' },
  { id: '2', type: 'interest', product: 'Flexible Savings', amount: 1.87, date: '2025-01-05T00:00:00Z', status: 'completed' },
  { id: '3', type: 'deposit', product: '90-Day Fixed', amount: 500, date: '2025-01-06T14:15:00Z', status: 'completed' },
  { id: '4', type: 'interest', product: 'Flexible Savings', amount: 1.89, date: '2025-01-06T00:00:00Z', status: 'completed' },
  { id: '5', type: 'interest', product: '90-Day Fixed', amount: 2.47, date: '2025-01-06T00:00:00Z', status: 'pending' },
];

export default function EarnAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('quarter');

  // Calculate totals
  const totalDeposited = mockHoldings.reduce((sum, h) => sum + h.amount, 0);
  const totalEarnings = mockHoldings.reduce((sum, h) => sum + h.earnings, 0);
  const portfolioValue = totalDeposited;
  const avgAPY = mockHoldings.reduce((sum, h) => sum + (h.apy * h.amount), 0) / totalDeposited;

  const holdingColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    sky: 'bg-sky-500',
  };

  const holdingTextColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    indigo: 'text-indigo-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    sky: 'text-sky-400',
  };

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
          <div className="max-w-5xl lg:max-w-none mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push('/earn')}
                className="text-zinc-400 hover:text-white transition flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Products</span>
              </button>
              <button
                onClick={() => {
                  // Try to go back to dashboard - check sessionStorage for login type
                  const vendorWallet = sessionStorage.getItem('vendorWalletAddress');
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
            
            <div className="flex items-center gap-3">
              <StableAssetLogo className="w-8 h-8" />
              <h1 className="text-lg font-bold">Performance</h1>
            </div>
            
            <button
              onClick={() => router.push('/earn')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              View Products
            </button>
          </div>
        </header>

        <main className="max-w-5xl lg:max-w-none mx-auto px-4 lg:px-6 pb-12">
          
          {/* Disclaimer Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mt-6 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-amber-400 text-sm font-medium">For Presentation Purposes Only</p>
                <p className="text-zinc-400 text-xs">
                  This is not a live product. All data shown is simulated for demonstration.
                </p>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  period === p
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p === 'week' ? '1 Week' : p === 'month' ? '1 Month' : p === 'quarter' ? '3 Months' : '1 Year'}
              </button>
            ))}
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-white">${portfolioValue.toFixed(2)}</p>
              <p className="text-emerald-400 text-sm mt-1">+${totalEarnings.toFixed(2)} earned</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-emerald-400">${totalEarnings.toFixed(2)}</p>
              <p className="text-zinc-500 text-sm mt-1">All time</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm mb-1">Avg. APY</p>
              <p className="text-3xl font-bold text-indigo-400">{avgAPY.toFixed(1)}%</p>
              <p className="text-zinc-500 text-sm mt-1">Weighted average</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm mb-1">Active Products</p>
              <p className="text-3xl font-bold text-white">{mockHoldings.length}</p>
              <p className="text-zinc-500 text-sm mt-1">Diversified</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            
            {/* Portfolio Growth Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Portfolio Growth</h3>
              <div className="h-48 flex items-end gap-2">
                {[
                  { month: 'Jan', value: 35 },
                  { month: 'Feb', value: 42 },
                  { month: 'Mar', value: 48 },
                  { month: 'Apr', value: 55 },
                  { month: 'May', value: 52 },
                  { month: 'Jun', value: 61 },
                  { month: 'Jul', value: 68 },
                  { month: 'Aug', value: 72 },
                  { month: 'Sep', value: 78 },
                  { month: 'Oct', value: 85 },
                  { month: 'Nov', value: 88 },
                  { month: 'Dec', value: 95 },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-zinc-800 rounded-t-lg relative" style={{ height: '140px' }}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-[10px]">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-zinc-500">Total growth</span>
                <span className="font-semibold text-emerald-400">+25.6%</span>
              </div>
            </div>

            {/* APY History Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">APY History</h3>
              <div className="h-48 flex items-end gap-3">
                {[
                  { month: 'Jul', flexible: 60, fixed30: 70, fixed90: 80 },
                  { month: 'Aug', flexible: 62, fixed30: 72, fixed90: 82 },
                  { month: 'Sep', flexible: 63, fixed30: 73, fixed90: 83 },
                  { month: 'Oct', flexible: 64, fixed30: 74, fixed90: 84 },
                  { month: 'Nov', flexible: 65, fixed30: 75, fixed90: 86 },
                  { month: 'Dec', flexible: 65, fixed30: 76, fixed90: 87 },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div className="flex-1 flex items-end gap-0.5" style={{ height: '140px' }}>
                      <div className="flex-1 bg-zinc-800 rounded-t relative h-full">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t"
                          style={{ height: `${item.flexible}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-zinc-800 rounded-t relative h-full">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t"
                          style={{ height: `${item.fixed30}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-zinc-800 rounded-t relative h-full">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t"
                          style={{ height: `${item.fixed90}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs text-center">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-zinc-500">Flexible 4.5%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  <span className="text-zinc-500">30-Day 5.2%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="text-zinc-500">90-Day 6.0%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Holdings & Transactions */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            
            {/* Holdings Breakdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Your Holdings</h3>
              
              {/* Pie chart visual */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {mockHoldings.reduce((acc, holding, i) => {
                      const percentage = (holding.amount / totalDeposited) * 100;
                      const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
                      const strokeDashoffset = -acc.offset;
                      acc.elements.push(
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={holding.color === 'emerald' ? '#10b981' : holding.color === 'indigo' ? '#6366f1' : '#f59e0b'}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                      acc.offset += percentage * 2.51;
                      return acc;
                    }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold">${totalDeposited.toFixed(0)}</p>
                      <p className="text-zinc-500 text-xs">Total</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  {mockHoldings.map((holding, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${holdingColors[holding.color]}`}></span>
                        <span className="text-sm">{holding.product}</span>
                      </div>
                      <span className="text-sm font-medium">{((holding.amount / totalDeposited) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holdings list */}
              <div className="space-y-3 border-t border-zinc-800 pt-4">
                {mockHoldings.map((holding, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{holding.product}</p>
                      <p className="text-zinc-500 text-sm">{holding.apy}% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${holding.amount.toFixed(2)}</p>
                      <p className={`text-sm ${holdingTextColors[holding.color]}`}>+${holding.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-sky-500/20' : 'bg-emerald-500/20'
                      }`}>
                        {tx.type === 'deposit' ? (
                          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-zinc-500 text-sm">{tx.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'interest' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'interest' ? '+' : ''}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium py-2">
                View All Transactions
              </button>
            </div>
          </div>

          {/* Projected Earnings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Projected Earnings</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { period: '1 Month', amount: (totalDeposited * (avgAPY / 100) / 12).toFixed(2) },
                { period: '3 Months', amount: (totalDeposited * (avgAPY / 100) / 4).toFixed(2) },
                { period: '6 Months', amount: (totalDeposited * (avgAPY / 100) / 2).toFixed(2) },
                { period: '1 Year', amount: (totalDeposited * (avgAPY / 100)).toFixed(2) },
              ].map((projection, i) => (
                <div key={i} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-sm mb-1">{projection.period}</p>
                  <p className="text-2xl font-bold text-emerald-400">+${projection.amount}</p>
                  <p className="text-zinc-600 text-xs mt-1">at current rates</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-600 text-xs text-center mt-4">
              * Projections are estimates based on current APY rates and do not guarantee future returns
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center mt-8">
            <p className="text-amber-400 text-sm font-medium mb-1">For Presentation Purposes Only</p>
            <p className="text-zinc-400 text-xs">This is not a live product. All rates, figures, and portfolio data shown are for demonstration purposes only.</p>
          </div>
        </main>
      </div>
    </>
  );
}