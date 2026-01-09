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

  // Print receipt
const printReceipt = (receipt: Receipt) => {
  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${storeName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 400px; 
          margin: 0 auto; 
          padding: 30px 20px;
          color: #1a1a1a;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }
        .store-logo {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
          margin: 0 auto 12px;
          display: block;
        }
        .store-name {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .receipt-number {
          font-size: 12px;
          color: #666;
        }
        .store-logo {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          object-fit: cover;
        }
        .store-info {
          flex: 1;
        }
        .store-name {
          font-size: 20px;
          font-weight: 700;
        }
        .receipt-number {
          font-size: 12px;
          color: #666;
        }
        .date {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .items {
          margin: 20px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .item-name {
          font-weight: 500;
        }
        .item-qty {
          color: #666;
          font-size: 14px;
        }
        .item-price {
          font-weight: 600;
        }
        .total-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 16px;
          font-weight: 600;
        }
        .total-amount {
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
        }
        .tx-section {
          margin-top: 20px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .tx-label {
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }
        .tx-hash {
          font-size: 9px;
          font-family: monospace;
          word-break: break-all;
          color: #333;
        }
        .footer {
          margin-top: 30px;
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
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${storeLogo 
          ? `<img src="${storeLogo}" alt="${storeName}" class="store-logo">`
          : `<img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="store-logo">`
        }
        <div class="store-name">${storeName}</div>
        <div class="receipt-number">${receipt.receipt_number}</div>
      </div>
      
      <div class="date">${new Date(receipt.paid_at).toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</div>
      
      <div class="items">
        ${receipt.items.map(item => `
          <div class="item">
            <div>
              <div class="item-name">${item.name}</div>
              <div class="item-qty">Qty: ${item.quantity} × £${item.unit_price.toFixed(2)}</div>
            </div>
            <div class="item-price">£${item.line_total.toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="total-section">
        <span class="total-label">Total</span>
        <span class="total-amount">£${(receipt.total || 0).toFixed(2)}</span>
      </div>
      
      <div class="tx-section">
        <div class="tx-label">Transaction ID (XRPL)</div>
        <div class="tx-hash">${receipt.payment_tx_hash}</div>
      </div>
      
      <div class="footer" style="flex-direction: column; gap: 4px;">
        <span style="color: #71717a; font-size: 9px; font-weight: 500; letter-spacing: 1px;">RECEIPT</span>
        <span style="font-size: 16px; font-weight: 800; letter-spacing: 2px;"><span style="color: #10b981;">Y</span><span style="color: #22c55e;">A</span><span style="color: #3b82f6;">O</span><span style="color: #6366f1;">F</span><span style="color: #8b5cf6;">U</span><span style="color: #a855f7;">S</span></span>
        <span style="color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 1.5px;">PIONEERS</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="footer-logo">
          <span class="footer-text">Powered by YesAllOfUs</span>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
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
        <span style="color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 1.5px;">PIONEERS</span>
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
      <span>📊</span> CSV
    </button>
    <button
      onClick={exportPDF}
      disabled={filteredReceipts.length === 0}
      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
    >
      <span>📄</span> PDF
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
                    <span>{getPaymentMethodDisplay(selectedReceipt.payment_method)}</span>
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
            if (!emailAddress || !emailAddress.includes('@')) {
              return;
            }
            setSendingEmail(true);
            try {
              const res = await fetch('https://api.dltpays.com/nfc/api/v1/receipt/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: emailAddress,
                  store_name: storeName,
                  store_id: storeId,
                  amount: selectedReceipt?.total,
                  items: selectedReceipt?.items,
                  tx_hash: selectedReceipt?.payment_tx_hash
                })
              });
              const data = await res.json();
              if (data.success) {
                setShowEmailModal(false);
                setEmailAddress('');
              }
            } catch (err) {
              console.error('Failed to send email');
            }
            setSendingEmail(false);
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

                {/* Actions */}
<div className="flex gap-3 mt-4">
  <button
    onClick={() => setShowEmailModal(true)}
    className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition flex items-center justify-center gap-2"
  >
    <span>📧</span>
    <span>Email</span>
  </button>
  <button
    onClick={() => printReceipt(selectedReceipt)}
    className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition flex items-center justify-center gap-2"
  >
    <span>🖨️</span>
    <span>Print</span>
  </button>
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
        {/* YAOFU Pioneers Badge */}
        <div className="mt-8 flex justify-center">
          <svg viewBox="0 0 140 48" className="w-32 h-12">
            <defs>
              <linearGradient id="yaofuGradientReceipts" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="40%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <text x="70" y="12" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="9" letterSpacing="1">
              RECEIPT
            </text>
            <text x="70" y="28" textAnchor="middle" fill="url(#yaofuGradientReceipts)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="14" letterSpacing="3">
              YAOFUS
            </text>
            <text x="70" y="43" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="10" letterSpacing="1.5">
              PIONEERS
            </text>
          </svg>
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