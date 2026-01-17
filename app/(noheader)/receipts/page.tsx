// Imports
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NebulaBackground from '@/components/NebulaBackground'; // adjust path as needed
interface ReceiptItem {
name: string;
quantity: number;
unit_price?: number;
price?: number;
line_total?: number;
}

interface Receipt {
  receipt_id: string;
  receipt_number: string;
  customer_wallet: string;
  items: ReceiptItem[];
  tip_amount?: number;
  subtotal?: number;
  total: number;
  amount_rlusd?: number;
  currency: string;
  payment_method?: string;
  payment_status: string;
  payment_tx_hash: string;
  paid_at: string;
  created_at: string;
  conversion_rate?: {
    rlusd_gbp: number;
    gbp_to_rlusd?: number;
    source?: string;
    captured_at?: string;
    price_age_ms?: number;
  };
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

  // Logo
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  
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

  // Print preview modal
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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
    setStoreLogo(store.logo_url || null);
    
    // Fetch fresh store data to get latest logo
    if (store.store_id) {
      fetch(`${API_URL}/store/public/${store.store_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.store) {
            setStoreLogo(data.store.logo_url || null);
          }
        })
        .catch(err => console.error('Failed to fetch store:', err));
    }
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
        (r.total || 0).toString().includes(query) ||
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

  // Get payment method display
  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return '💳 NFC';
    switch (method) {
      case 'xaman_qr':
      case 'qr_xaman':
        return '📱 Xaman';
      case 'web3auth':
        return '🔐 Web3Auth';
      case 'nfc_card':
        return '💳 NFC';
      default:
        return '💳 ' + method;
    }
  };

  // Show print preview
const showPrintModal = (receipt: Receipt) => {
  setPreviewReceipt(receipt);
  setShowPrintPreview(true);
};

// Actually print
const handlePrint = () => {
  window.print();
};
// Export to CSV
const exportCSV = () => {
  const headers = ['Receipt #', 'Date', 'Items', 'Total', 'Payment Method', 'TX Hash'];
  const rows = filteredReceipts.map(r => [
    r.receipt_number,
    new Date(r.paid_at).toLocaleString('en-GB'),
    r.items.map(i => `${i.name} x${i.quantity}`).join('; '),
    `£${r.total.toFixed(2)}`,
    r.payment_method || 'NFC',
    r.payment_tx_hash
  ]);
  
  const csv = [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipts-${storeName}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export to PDF
const exportPDF = () => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Report - ${storeName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1a1a1a;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }
        .logo {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          object-fit: cover;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .stats {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 10px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          text-align: left;
          padding: 12px 8px;
          border-bottom: 2px solid #1a1a1a;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }
        td {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .amount {
          font-weight: 600;
          color: #10b981;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .footer-logo {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          opacity: 0.6;
        }
        .footer-text {
          color: #999;
          font-size: 11px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${storeLogo 
          ? `<img src="${storeLogo}" alt="${storeName}" class="logo">`
          : `<img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="logo">`
        }
        <div>
          <div class="title">${storeLogo ? storeName : 'YesAllOfUs'}</div>
          <div class="subtitle">Sales Report - ${dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : dateFilter === 'month' ? 'This Month' : 'All Time'}</div>
          ${!storeLogo ? `<div class="subtitle">${storeName}</div>` : ''}
        </div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${filteredReceipts.length}</div>
          <div class="stat-label">Transactions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">£${totalRevenue.toFixed(2)}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">£${avgTransaction.toFixed(2)}</div>
          <div class="stat-label">Average Sale</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Date</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          ${filteredReceipts.map(r => `
            <tr>
              <td>${r.receipt_number}</td>
              <td>${new Date(r.paid_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td>${r.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
              <td class="amount">£${r.total.toFixed(2)}</td>
              <td>${r.payment_method === 'xaman_qr' ? '📱 Xaman' : r.payment_method === 'web3auth' ? '🔐 Web3Auth' : '💳 NFC'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer" style="flex-direction: column; gap: 4px;">
        <span style="color: #71717a; font-size: 9px; font-weight: 500; letter-spacing: 1px;">REPORT</span>
        <span style="font-size: 16px; font-weight: 800; letter-spacing: 2px;"><span style="color: #10b981;">Y</span><span style="color: #22c55e;">A</span><span style="color: #3b82f6;">O</span><span style="color: #6366f1;">F</span><span style="color: #8b5cf6;">U</span><span style="color: #a855f7;">S</span></span>
        <span style="color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 1.5px;">INSTANT</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="footer-logo">
          <span class="footer-text">Generated by YesAllOfUs</span>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};

  return (
  <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative">
    {/* Nebula Background */}
    <NebulaBackground opacity={0.3} blur={0} />
    
    {/* Header with orange to black gradient */}
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-600/30 via-orange-900/20 via-amber-950/15 to-zinc-900/20 backdrop-blur border-b border-orange-500/30">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push(from === 'take-payment' ? '/take-payment' : '/dashboard')}
          className="text-zinc-200 hover:text-white transition flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <h1 className="text-lg font-bold">Receipts</h1>
        
        <button
          onClick={fetchReceipts}
          className="text-zinc-200 hover:text-white transition p-2"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    {/* Add relative z-10 to main to ensure content appears above nebula */}
    <main className="max-w-2xl mx-auto px-4 pb-8 relative z-10">
        
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

        {/* Sort & Export */}
<div className="flex gap-2 mb-6 flex-wrap">
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
  
  <div className="flex gap-2 ml-auto">
  <button
    onClick={exportCSV}
    disabled={filteredReceipts.length === 0}
    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
  >
    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    CSV
  </button>
  <button
    onClick={exportPDF}
    disabled={filteredReceipts.length === 0}
    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
  >
    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h4" />
    </svg>
    PDF
  </button>
</div>
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
                      {getPaymentMethodDisplay(receipt.payment_method)} · {formatDate(receipt.paid_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400">£{(receipt.total || 0).toFixed(2)}</p>
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
          className="text-zinc-400 hover:text-white p-2 transition-colors"
          aria-label="Close receipt modal"
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
            {selectedReceipt.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-zinc-500 text-sm">
                    {item.quantity || 1} × £{(item.unit_price || item.price || 0).toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">
                  £{((item.line_total || (item.unit_price || item.price || 0) * (item.quantity || 1))).toFixed(2)}
                </p>
              </div>
            )) ?? null}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-zinc-700 mb-4">
          <p className="font-semibold">Total</p>
          <p className="text-2xl font-bold text-emerald-400">
            £{Number(selectedReceipt.total || 0).toFixed(2)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Payment Method</span>
            <span>{getPaymentMethodDisplay(selectedReceipt.payment_method)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Status</span>
            <span className="text-emerald-400">✓ {selectedReceipt.payment_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Customer</span>
            <span className="font-mono text-xs">
              {selectedReceipt.customer_wallet?.slice(0, 8) ?? '——'}...
              {selectedReceipt.customer_wallet?.slice(-4) ?? '——'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email</span>
          </button>
          <button
            onClick={() => showPrintModal(selectedReceipt)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>
        </div>

        {/* Transaction Link */}
        {selectedReceipt.payment_tx_hash && (
          <a
            href={`https://livenet.xrpl.org/transactions/${selectedReceipt.payment_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 text-center transition"
          >
            <p className="text-zinc-500 text-xs mb-1">Transaction</p>
            <p className="text-emerald-400 text-sm font-mono break-all">
              {selectedReceipt.payment_tx_hash.slice(0, 12)}...
              {selectedReceipt.payment_tx_hash.slice(-8)} ↗
            </p>
          </a>
        )}
      </div>
    </div>

    {/* Email Modal */}
    {showEmailModal && (
      <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
          <h3 className="text-lg font-bold mb-4">Send Receipt</h3>
          <input
            type="email"
            placeholder="Customer email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailAddress('');
              }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!emailAddress || !emailAddress.includes('@')) return;
                setSendingEmail(true);
                try {
                  const res = await fetch(`${API_URL}/receipt/email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: emailAddress,
                      store_name: storeName,
                      store_id: storeId,
                      amount: selectedReceipt.total,
                      rlusd_amount: selectedReceipt.amount_rlusd,
                      items: selectedReceipt.items,
                      tip_amount: selectedReceipt.tip_amount,
                      tx_hash: selectedReceipt.payment_tx_hash,
                      receipt_number: selectedReceipt.receipt_number,
                      conversion_rate: selectedReceipt.conversion_rate,
                      rate_source: selectedReceipt.conversion_rate?.source,
                      rate_timestamp: selectedReceipt.conversion_rate?.captured_at,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setShowEmailModal(false);
                    setEmailAddress('');
                    // Optional: add success toast here
                  } else {
                    console.error('Email API error:', data);
                  }
                } catch (err) {
                  console.error('Failed to send email:', err);
                } finally {
                  setSendingEmail(false);
                }
              }}
              disabled={sendingEmail}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {sendingEmail ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

        {/* Print Preview Modal */}
        {showPrintPreview && previewReceipt && (
          <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
            {/* Print Actions - Hidden when printing */}
            <div className="no-print sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <h2 className="font-bold">Print Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setShowPrintPreview(false);
                      setPreviewReceipt(null);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Print Content */}
            <div className="max-w-md mx-auto bg-white text-black p-8 my-8">
              {/* Header */}
              <div className="text-center mb-6 pb-6 border-b-2 border-gray-200">
                {storeLogo ? (
                  <img 
                    src={storeLogo} 
                    alt={storeName} 
                    className="w-16 h-16 rounded-xl object-cover mx-auto mb-3"
                  />
                ) : (
                  <img 
                    src="https://yesallofus.com/dltpayslogo1.png" 
                    alt="YesAllOfUs" 
                    className="w-16 h-16 rounded-xl object-cover mx-auto mb-3"
                  />
                )}
                <h1 className="text-2xl font-bold mb-1">{storeName}</h1>
                <p className="text-sm text-gray-600">{previewReceipt.receipt_number}</p>
              </div>

              {/* Date */}
              <p className="text-sm text-gray-600 mb-6">
                {new Date(previewReceipt.paid_at).toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* Items */}
              <div className="mb-6">
                {previewReceipt.items.filter(item => item.name.toLowerCase() !== 'tip').map((item, idx) => (
                  <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity || 1} × £{(item.unit_price || item.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      £{(item.line_total || (item.unit_price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}

                {/* Tip */}
                {previewReceipt.tip_amount && previewReceipt.tip_amount > 0 && (
                  <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-emerald-600">Tip</p>
                        <p className="text-sm text-gray-600">Thank you!</p>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-600">
                      £{(previewReceipt.tip_amount * (previewReceipt.conversion_rate?.rlusd_gbp || 0.74)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t-2 border-black mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-3xl font-bold text-emerald-600">
                  £{previewReceipt.total.toFixed(2)}
                </span>
              </div>

              {/* Settlement Details */}
              {previewReceipt.amount_rlusd && previewReceipt.conversion_rate && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-xs font-semibold text-emerald-800 mb-2">💱 SETTLEMENT DETAILS</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Quoted:</span>
                      <span>£{previewReceipt.total.toFixed(2)} GBP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Settled:</span>
                      <span className="font-semibold">{previewReceipt.amount_rlusd.toFixed(6)} RLUSD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span>£1 = {previewReceipt.conversion_rate.gbp_to_rlusd?.toFixed(6) || 'N/A'} RLUSD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate Source:</span>
                      <span>{previewReceipt.conversion_rate.source || 'CoinGecko Pro API'}</span>
                    </div>
                    {previewReceipt.conversion_rate.captured_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate Timestamp:</span>
                        <span className="text-xs text-gray-500">{new Date(previewReceipt.conversion_rate.captured_at).toISOString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction */}
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-600 mb-1">Transaction ID (XRPL)</p>
                <p className="text-xs font-mono break-all text-gray-800">
                  {previewReceipt.payment_tx_hash}
                </p>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">RECEIPT</p>
                <p className="text-lg font-extrabold tracking-widest mb-1">
                  <span className="text-emerald-500">Y</span>
                  <span className="text-green-500">A</span>
                  <span className="text-blue-500">O</span>
                  <span className="text-indigo-500">F</span>
                  <span className="text-violet-500">U</span>
                  <span className="text-purple-500">S</span>
                </p>
                <p className="text-xs text-gray-600 font-semibold mb-3">INSTANT</p>
                <div className="flex items-center justify-center gap-2">
                  <img 
                    src="https://yesallofus.com/dltpayslogo1.png" 
                    alt="YesAllOfUs" 
                    className="w-5 h-5 rounded opacity-60"
                  />
                  <span className="text-xs text-gray-500">Powered by YesAllOfUs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YAOFU Pioneers Badge */}
        <div className="mt-8 flex flex-col items-center gap-1">
          <span className="text-zinc-500 text-[10px] font-medium tracking-wider">VERIFIED</span>
          <span className="text-base font-extrabold tracking-widest">
            <span className="text-emerald-500">Y</span>
            <span className="text-green-500">A</span>
            <span className="text-blue-500">O</span>
            <span className="text-indigo-500">F</span>
            <span className="text-violet-500">U</span>
            <span className="text-purple-500">S</span>
          </span>
          <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">RECEIPTS</span>
          <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
            <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
            <span>Powered by YesAllOfUs</span>
          </div>
        </div>

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
