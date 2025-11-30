'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

interface Affiliate {
  affiliate_id: string;
  wallet: string;
  referral_code: string;
  total_earned: number;
  level: number;
  parent_id: string | null;
  created_at: any;
}

interface Payment {
  payout_id: string;
  order_id: string;
  order_total: number;
  payments: Array<{
    wallet: string;
    amount: number;
    level: number;
    type?: string;
  }>;
  tx_hashes: Array<{
    wallet: string;
    amount: number;
    tx_hash: string;
  }>;
  paid_at: any;
  auto_signed?: boolean;
}

interface StoreActivityProps {
  storeId: string;
  walletAddress: string;
}

export default function StoreActivity({ storeId, walletAddress }: StoreActivityProps) {
  const [tab, setTab] = useState<'affiliates' | 'payments'>('affiliates');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 20;

  useEffect(() => {
    if (storeId && walletAddress) {
      fetchData();
    }
  }, [storeId, walletAddress]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [affRes, payRes] = await Promise.all([
        fetch(`${API_URL}/store/${storeId}/affiliates?wallet=${walletAddress}`),
        fetch(`${API_URL}/store/${storeId}/payouts?wallet=${walletAddress}`)
      ]);
      
      const affData = await affRes.json();
      const payData = await payRes.json();
      
      if (affData.success) setAffiliates(affData.affiliates || []);
      if (payData.success) setPayments(payData.payouts || []);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
    setLoading(false);
  };

  const sortedAffiliates = [...affiliates].sort((a, b) => {
    if (sortNewest) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const rankedAffiliates = [...affiliates].sort((a, b) => b.total_earned - a.total_earned);

  const sortedPayments = [...payments].sort((a, b) => {
    if (sortNewest) {
      return new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime();
    }
    return new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime();
  });

  const paginatedAffiliates = sortedAffiliates.slice(page * perPage, (page + 1) * perPage);
  const paginatedPayments = sortedPayments.slice(page * perPage, (page + 1) * perPage);
  
  const totalAffiliatePages = Math.ceil(affiliates.length / perPage);
  const totalPaymentPages = Math.ceil(payments.length / perPage);

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatWallet = (wallet: string) => {
    if (!wallet) return '-';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const getRank = (wallet: string) => {
    const idx = rankedAffiliates.findIndex(a => a.wallet === wallet);
    return idx >= 0 ? idx + 1 : '-';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => { setTab('affiliates'); setPage(0); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'affiliates' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => { setTab('payments'); setPage(0); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'payments' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition"
        >
          {sortNewest ? '↓ Newest first' : '↑ Oldest first'}
        </button>
      </div>

      {/* Affiliates Tab */}
      {tab === 'affiliates' && (
        <>
          {affiliates.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <p className="text-zinc-500">No affiliates yet</p>
              <p className="text-zinc-600 text-sm mt-1">Share your affiliate signup link to get started</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Wallet</th>
                    <th className="text-left px-4 py-3 font-medium">Code</th>
                    <th className="text-center px-4 py-3 font-medium">Level</th>
                    <th className="text-right px-4 py-3 font-medium">Earned</th>
                    <th className="text-right px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAffiliates.map((aff) => {
                    const rank = getRank(aff.wallet) as number;
                    return (
                      <tr key={aff.affiliate_id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition">
                        <td className="px-4 py-3 text-sm">
                          <span className="text-zinc-400">{rank}</span>
                          <span className="ml-1">{getRankEmoji(rank)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`https://livenet.xrpl.org/accounts/${aff.wallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-zinc-300 hover:text-emerald-400 transition"
                          >
                            {formatWallet(aff.wallet)}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-zinc-400">{aff.referral_code}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">L{aff.level}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${aff.total_earned > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            ${aff.total_earned.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-zinc-500">{formatDate(aff.created_at)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalAffiliatePages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {page + 1} of {totalAffiliatePages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalAffiliatePages - 1, p + 1))}
                disabled={page >= totalAffiliatePages - 1}
                className="text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <>
          {payments.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <p className="text-zinc-500">No payments yet</p>
              <p className="text-zinc-600 text-sm mt-1">Payments will appear here once orders complete</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Order</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-right px-4 py-3 font-medium">Commissions</th>
                    <th className="text-center px-4 py-3 font-medium">Mode</th>
                    <th className="text-right px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">TX</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((pay) => {
                    const commissionTotal = pay.payments
                      .filter(p => p.type !== 'platform_fee')
                      .reduce((sum, p) => sum + p.amount, 0);
                    const txCount = pay.tx_hashes?.length || 0;
                    const firstTx = pay.tx_hashes?.[0]?.tx_hash;
                    
                    return (
                      <tr key={pay.payout_id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-zinc-300">{pay.order_id}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-zinc-400">${pay.order_total.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-emerald-400">${commissionTotal.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${
                            pay.auto_signed 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {pay.auto_signed ? '⚡ Auto' : '📱 Manual'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-zinc-500">{formatDate(pay.paid_at)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {firstTx ? (
                            <a
                              href={`https://livenet.xrpl.org/transactions/${firstTx}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-zinc-400 hover:text-emerald-400 transition font-mono"
                            >
                              {txCount > 1 ? `${txCount} txs` : firstTx.slice(0, 8)}...
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPaymentPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {page + 1} of {totalPaymentPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPaymentPages - 1, p + 1))}
                disabled={page >= totalPaymentPages - 1}
                className="text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}