'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

interface SignUpCustomerCardProps {
  storeId: string;
  walletAddress: string | null;
  onSignUp: () => void;
}

export default function SignUpCustomerCard({ storeId, walletAddress, onSignUp }: SignUpCustomerCardProps) {
  const [stats, setStats] = useState({ total: 0, hasPayouts: false });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const affiliateLink = `https://yesallofus.com/affiliate-dashboard?store=${storeId}`;

  useEffect(() => {
    const fetchStats = async () => {
      if (!storeId || !walletAddress) return;
      
      try {
        const res = await fetch(`${API_URL}/store/${storeId}/affiliate-count?wallet_address=${walletAddress}`);
        const data = await res.json();
        
        if (data.success) {
          setStats({
            total: data.affiliates_count || 0,
            hasPayouts: data.has_payouts || false
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
      setLoading(false);
    };

    fetchStats();
  }, [storeId, walletAddress]);

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="signup-customer" className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6 flex flex-col">
      <button
        onClick={onSignUp}
        className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-semibold text-lg py-4 rounded-xl transition flex items-center justify-center gap-3"
      >
        {/* User Plus Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
        Sign Up New Customer
      </button>
      
      <p className="text-zinc-500 text-sm text-center mt-3">Register customers with NFC card to earn rewards</p>

      {/* Stats Row */}
      <div className="mt-4 pt-4 border-t border-zinc-700/50 grid grid-cols-3 gap-3">
        {/* Total Customers */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-white">
            {loading ? '—' : stats.total}
          </p>
          <p className="text-zinc-500 text-xs">Total</p>
        </div>

        {/* Active Status */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-white">
            {loading ? '—' : (stats.hasPayouts ? 'Yes' : 'No')}
          </p>
          <p className="text-zinc-500 text-xs">Payouts</p>
        </div>

        {/* Rewards Icon */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-white">
            {loading ? '—' : (stats.total > 0 ? 'Active' : 'Ready')}
          </p>
          <p className="text-zinc-500 text-xs">Rewards</p>
        </div>
      </div>

      {/* Affiliate Link */}
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <p className="text-zinc-500 text-xs mb-2">Affiliate Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800 px-3 py-2 rounded-lg font-mono text-xs text-emerald-400 truncate">
            {affiliateLink}
          </code>
          <button
            onClick={copyLink}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
              copied 
                ? 'bg-emerald-500 text-black' 
                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
            }`}
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}