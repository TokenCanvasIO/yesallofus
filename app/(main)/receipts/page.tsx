'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Receipt {
  receipt_id: string;
  receipt_number: string;
  customer_wallet: string;
  items: ReceiptItem[];
  total: number;
  currency: string;
  payment_method?: string;
  payment_status: string;
  payment_tx_hash: string;
  paid_at: string;
  created_at: string;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

function ReceiptsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  
  // Auth
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  
  // Data
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail view
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const receiptsPerPage = 20;

  // Load store data
  useEffect(() => {
    const stored = sessionStorage.getItem('vendorWalletAddress');
    const storeData = sessionStorage.getItem('storeData');
    
    if (!stored) {
      router.push('/dashboard');
      return;
    }
    
    setWalletAddress(stored);
    
    if (storeData) {
      const store = JSON.parse(storeData);
      setStoreId(store.store_id || null);
      setStoreName(store.store_name || 'Your Store');
    }
  }, [router]);

  // Fetch receipts
  useEffect(() => {
    if (storeId && walletAddress) {
      fetchReceipts();
    }
  }, [storeId, walletAddress]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, sortBy, searchQuery]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/receipts?wallet_address=${walletAddress}&limit=500`
      );
      const data = await res.json();
      if (data.success) {
        setReceipts(data.receipts);
      } else {
        setError(data.error || 'Failed to load receipts');
      }
    } catch (err) {
      setError('Failed to load receipts');
    }
    setLoading(false);
  };

  // Filter and sort receipts
  const getFilteredReceipts = () => {
    let filtered = [...receipts];
    
    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(r => new Date(r.paid_at) >= todayStart);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.paid_at) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.paid_at) >= monthAgo);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.receipt_number.toLowerCase().includes(query) ||
        r.payment_tx_hash.toLowerCase().includes(query) ||
        r.total.toString().includes(query) ||
        r.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime());
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.total - b.total);
    }
    
    return filtered;
  };

  const filteredReceipts = getFilteredReceipts();
  const totalPages = Math.ceil(filteredReceipts.length / receiptsPerPage);
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * receiptsPerPage,
    currentPage * receiptsPerPage
  );
  
  // Stats
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.total, 0);
  const avgTransaction = filteredReceipts.length > 0 ? totalRevenue / filteredReceipts.length : 0;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time ago
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
  onClick={() => router.push(from === 'take-payment' ? '/take-payment' : '/dashboard')}
  className="text-zinc-400 hover:text-white transition flex items-center gap-1"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  Back
</button>
          
          <h1 className="text-lg font-bold">Receipts</h1>
          
          <button
            onClick={fetchReceipts}
            className="text-zinc-400 hover:text-white transition p-2"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Transactions</p>
            <p className="text-2xl font-bold">{filteredReceipts.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Revenue</p>
            <p className="text-2xl font-bold text-emerald-400">£{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Avg Sale</p>
            <p className="text-2xl font-bold">£{avgTransaction.toFixed(2)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['today', 'week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                dateFilter === filter
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-zinc-500">Loading receipts...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredReceipts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧾</div>
            <p className="text-zinc-400 mb-2">No receipts found</p>
            <p className="text-zinc-600 text-sm">
              {searchQuery ? 'Try a different search' : 'Receipts will appear here after payments'}
            </p>
          </div>
        )}

        {/* Receipts List */}
        {!loading && filteredReceipts.length > 0 && (
          <div className="space-y-3">
            {paginatedReceipts.map((receipt) => (
              <button
                key={receipt.receipt_id}
                onClick={() => setSelectedReceipt(receipt)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-left transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs font-mono">{receipt.receipt_number}</span>
                  <span className="text-zinc-500 text-xs">{timeAgo(receipt.paid_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {receipt.items.length === 1 
                        ? receipt.items[0].name 
                        : `${receipt.items.length} items`}
                    </p>
                    <p className="text-zinc-500 text-sm">
                      {receipt.payment_method === 'qr_xaman' ? '📱 QR' : '💳 NFC'} · {formatDate(receipt.paid_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400">£{receipt.total.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-zinc-600 px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        currentPage === page
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Page Info */}
        {!loading && totalPages > 1 && (
          <p className="text-center text-zinc-500 text-sm mt-3">
            Showing {((currentPage - 1) * receiptsPerPage) + 1}-{Math.min(currentPage * receiptsPerPage, filteredReceipts.length)} of {filteredReceipts.length}
          </p>
        )}

        {/* Receipt Detail Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="font-bold">{selectedReceipt.receipt_number}</p>
                  <p className="text-zinc-500 text-sm">{formatDate(selectedReceipt.paid_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-zinc-400 hover:text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                {/* Items */}
                <div className="mb-4">
                  <p className="text-zinc-500 text-sm mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-zinc-500 text-sm">
                            {item.quantity} × £{item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">£{item.line_total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-zinc-700 mb-4">
                  <p className="font-semibold">Total</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    £{selectedReceipt.total.toFixed(2)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Payment Method</span>
                    <span>{selectedReceipt.payment_method === 'qr_xaman' ? '📱 QR (Xaman)' : '💳 NFC Card'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-emerald-400">✓ {selectedReceipt.payment_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer</span>
                    <span className="font-mono text-xs">
                      {selectedReceipt.customer_wallet.slice(0, 8)}...{selectedReceipt.customer_wallet.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* TX Link */}
                <a
                  href={`https://livenet.xrpl.org/transactions/${selectedReceipt.payment_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 text-center transition"
                >
                  <p className="text-zinc-500 text-xs mb-1">Transaction</p>
                  <p className="text-emerald-400 text-sm font-mono">
                    {selectedReceipt.payment_tx_hash.slice(0, 12)}...{selectedReceipt.payment_tx_hash.slice(-8)} ↗
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}

</main>
    </div>
  );
}

function ReceiptsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ReceiptsPage />
    </Suspense>
  );
}

export default ReceiptsPageWrapper;