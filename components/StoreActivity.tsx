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
    affiliate_id?: string;
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
  showAmounts?: boolean;
}

export default function StoreActivity({ storeId, walletAddress, showAmounts = false }: StoreActivityProps) {
  const [tab, setTab] = useState<'affiliates' | 'payments'>('affiliates');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'rank' | 'oldest' | 'newest' | 'lowest'>('rank');
  const [paymentSortNewest, setPaymentSortNewest] = useState(true);
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
      // L4: Use Promise.allSettled to handle partial failures gracefully
      const [affResult, payResult] = await Promise.allSettled([
        fetch(`${API_URL}/store/${storeId}/affiliates?wallet=${walletAddress}`),
        fetch(`${API_URL}/store/${storeId}/payouts?wallet=${walletAddress}`)
      ]);

      // Handle affiliates response
      if (affResult.status === 'fulfilled') {
        const affData = await affResult.value.json();
        if (affData.success) setAffiliates(affData.affiliates || []);
      } else {
        console.error('Failed to fetch affiliates:', affResult.reason);
      }

      // Handle payouts response
      if (payResult.status === 'fulfilled') {
        const payData = await payResult.value.json();
        if (payData.success) setPayments(payData.payouts || []);
      } else {
        console.error('Failed to fetch payouts:', payResult.reason);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
    setLoading(false);
  };

  const getActualEarnings = (affiliateId: string): number => {
    let total = 0;
    for (const payment of payments) {
      for (const p of payment.payments) {
        if (p.affiliate_id === affiliateId) {
          total += p.amount;
        }
      }
    }
    return total;
  };

  const totalPaidOut = payments.reduce((sum, payment) => {
    const affiliatePayments = payment.payments
      .filter(p => p.type !== 'platform_fee')
      .reduce((s, p) => s + p.amount, 0);
    return sum + affiliatePayments;
  }, 0);

  const totalPlatformFees = payments.reduce((sum, payment) => {
    const platformFee = payment.payments
      .filter(p => p.type === 'platform_fee')
      .reduce((s, p) => s + p.amount, 0);
    return sum + platformFee;
  }, 0);

  const totalOrderValue = payments.reduce((sum, payment) => sum + payment.order_total, 0);

  const affiliatesWithActualEarnings = affiliates.map(aff => ({
    ...aff,
    actualEarned: getActualEarnings(aff.affiliate_id)
  }));

  // Sort affiliates based on selected option
  const sortedAffiliates = [...affiliatesWithActualEarnings].sort((a, b) => {
    switch (sortOption) {
      case 'rank':
        return b.actualEarned - a.actualEarned; // Highest earner first
      case 'lowest':
        return a.actualEarned - b.actualEarned; // Lowest earner first
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  // Ranked affiliates always by earnings (for showing rank number)
  const rankedAffiliates = [...affiliatesWithActualEarnings].sort((a, b) => b.actualEarned - a.actualEarned);

  const sortedPayments = [...payments].sort((a, b) => {
    if (paymentSortNewest) {
      const bTime = b.paid_at ? new Date(b.paid_at).getTime() : 0;
      const aTime = a.paid_at ? new Date(a.paid_at).getTime() : 0;
      return bTime - aTime;
    }
    const aTime = a.paid_at ? new Date(a.paid_at).getTime() : 0;
    const bTime = b.paid_at ? new Date(b.paid_at).getTime() : 0;
    return aTime - bTime;
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

  const formatAmount = (amount: number) => {
    return showAmounts ? `$${amount.toFixed(2)}` : '$•••••';
  };

  const getRank = (affiliateId: string) => {
    const idx = rankedAffiliates.findIndex(a => a.affiliate_id === affiliateId);
    return idx >= 0 ? idx + 1 : '-';
  };

  const getRankIcon = (rank: number) => {
  if (rank === 1) return (
    <svg className="w-5 h-5 inline-block ml-1" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
    </svg>
  );
  if (rank === 2) return (
    <svg className="w-5 h-5 inline-block ml-1" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#C0C0C0" stroke="#808080" strokeWidth="1"/>
    </svg>
  );
  if (rank === 3) return (
    <svg className="w-5 h-5 inline-block ml-1" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#CD7F32" stroke="#8B4513" strokeWidth="1"/>
    </svg>
  );
  return null;
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
      {payments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-white">{payments.length}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Order Value</p>
            <p className="text-2xl font-bold text-white">{formatAmount(totalOrderValue)}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Paid to Affiliates</p>
            <p className="text-2xl font-bold text-emerald-400">{formatAmount(totalPaidOut)}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Platform Fees</p>
            <p className="text-2xl font-bold text-zinc-400">{formatAmount(totalPlatformFees)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
  <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg flex-shrink-0">
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

        {tab === 'affiliates' ? (
  <div className="relative self-end sm:self-auto">
    <select
      value={sortOption}
      onChange={(e) => { setSortOption(e.target.value as any); setPage(0); }}
      className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 pr-7 sm:pr-8 text-xs sm:text-sm text-zinc-300 cursor-pointer hover:border-zinc-700 transition focus:outline-none focus:border-emerald-500"
    >
      <option value="rank">⏶ Top Earners</option>
      <option value="lowest">⏷ Lowest First</option>
      <option value="newest">★ Newest First</option>
      <option value="oldest">◷ Oldest First</option>
    </select>
    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
) : (
  <button
    onClick={() => setPaymentSortNewest(!paymentSortNewest)}
    className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition"
  >
    {paymentSortNewest ? (
      <>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Newest first
      </>
    ) : (
      <>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        Oldest first
      </>
    )}
  </button>
)}
</div>

      {tab === 'affiliates' && (
        <>
          {affiliates.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <p className="text-zinc-500">No affiliates yet</p>
              <p className="text-zinc-600 text-sm mt-1">Share your affiliate signup link to get started</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto sm:overflow-visible">
                <table className="min-w-[600px] sm:min-w-0 w-full">
                  <thead>
                    <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">#</th>
                      <th className="text-left px-4 py-3 font-medium">Wallet</th>
                      <th className="text-left px-4 py-3 font-medium">Code</th>
                      <th className="text-right px-4 py-3 font-medium">Earned</th>
                      <th className="text-center px-4 py-3 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAffiliates.map((aff) => {
                      const rank = getRank(aff.affiliate_id) as number;
                      const actualEarned = aff.actualEarned;
                      return (
                        <tr key={aff.affiliate_id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition">
                          <td className="px-4 py-3 text-sm">
  <span className="text-zinc-400">{rank}</span>
  {getRankIcon(rank)}
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
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-medium ${actualEarned > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {formatAmount(actualEarned)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 mx-auto"></span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

      {tab === 'payments' && (
        <>
          {payments.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <p className="text-zinc-500">No payments yet</p>
              <p className="text-zinc-600 text-sm mt-1">Payments will appear here once orders complete</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto sm:overflow-visible">
                <table className="min-w-[600px] sm:min-w-0 w-full">
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
                            <span className="font-mono text-sm text-zinc-300">{pay.order_id.slice(0, 8)}...</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-zinc-400">{formatAmount(pay.order_total)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-400">{formatAmount(commissionTotal)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${
  pay.auto_signed 
    ? 'bg-emerald-500/20 text-emerald-400' 
    : 'bg-sky-500/20 text-sky-400'
}`}>
  {pay.auto_signed ? (
    <>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
      </svg>
      Auto
    </>
  ) : (
    <>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      Manual
    </>
  )}
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
                                {txCount > 1 ? `${txCount} txs` : `${firstTx.slice(0, 8)}...`}
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
            </div>
          )}

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