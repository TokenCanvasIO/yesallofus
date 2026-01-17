'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import NebulaBackground from '@/components/NebulaBackground';

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

function AnalyticsPage() {
  const router = useRouter();
  
  // Auth
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  
  // Data
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Time period
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

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
    }
  }, [router]);

  // Fetch receipts
  useEffect(() => {
    if (storeId && walletAddress) {
      fetchReceipts();
    }
  }, [storeId, walletAddress]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/receipts?wallet_address=${walletAddress}&limit=500`
      );
      const data = await res.json();
      console.log('📊 Receipts response:', data);
      if (data.success) {
        setReceipts(data.receipts);
        // Debug: Check for tips in receipts
        const receiptsWithTips = data.receipts.filter((r: Receipt) => 
          r.items?.some((i: ReceiptItem) => i.name?.toLowerCase() === 'tip')
        );
        console.log('🧾 Total receipts:', data.receipts.length);
        console.log('💰 Receipts with tips:', receiptsWithTips.length);
        if (data.receipts.length > 0) {
          console.log('📝 Sample receipt items:', data.receipts[0].items);
        }
      }
    } catch (err) {
      console.error('Failed to load receipts');
    }
    setLoading(false);
  };

  // Filter receipts by period
  const getFilteredReceipts = () => {
    const now = new Date();
    let filtered = [...receipts];
    
    if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(r => new Date(r.paid_at) >= todayStart);
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.paid_at) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.paid_at) >= monthAgo);
    }
    
    return filtered.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
  };

  const filteredReceipts = getFilteredReceipts();

  // Calculate stats
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.total, 0);
  const transactionCount = filteredReceipts.length;
  const avgTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  // Previous period comparison
  const getPreviousPeriodReceipts = () => {
    const now = new Date();
    let start: Date, end: Date;
    
    if (period === 'today') {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      end = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      return [];
    }
    
    return receipts.filter(r => {
      const date = new Date(r.paid_at);
      return date >= start && date < end;
    });
  };

  const previousReceipts = getPreviousPeriodReceipts();
  const previousRevenue = previousReceipts.reduce((sum, r) => sum + r.total, 0);
  const revenueChange = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : totalRevenue > 0 ? 100 : 0;

  // Tips calculation - check multiple possible tip naming conventions
  const totalTips = filteredReceipts.reduce((sum, r) => {
    const tipItem = r.items.find(i => 
      i.name.toLowerCase() === 'tip' || 
      i.name.toLowerCase() === 'gratuity' ||
      i.name.toLowerCase().includes('tip')
    );
    return sum + (tipItem?.line_total || tipItem?.unit_price || 0);
  }, 0);

  // Payment method breakdown
  const qrPayments = filteredReceipts.filter(r => r.payment_method === 'qr_xaman').length;
  const nfcPayments = filteredReceipts.filter(r => r.payment_method !== 'qr_xaman').length;

  // Top products
const productSales: Record<string, { quantity: number; revenue: number }> = {};
filteredReceipts.forEach(r => {
  r.items.forEach(item => {
    if (item.name.toLowerCase() !== 'tip' && item.name.toLowerCase() !== 'payment') {
      if (!productSales[item.name]) {
        productSales[item.name] = { quantity: 0, revenue: 0 };
      }
      const qty = Number(item.quantity) || 0;
      const lineTotal = Number(item.line_total) || (Number(item.unit_price) * qty) || 0;
      productSales[item.name].quantity += qty;
      productSales[item.name].revenue += lineTotal;
    }
  });
});
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

console.log('🛒 Product sales data:', productSales);
console.log('🏆 Top products:', topProducts);

  // Sales by day - responds to period
const getSalesByDay = () => {
  const days: { day: string; revenue: number; count: number }[] = [];
  const numDays = period === 'week' ? 7 : period === 'month' ? 30 : period === 'today' ? 1 : 90;
  
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayReceipts = receipts.filter(r => {
      const rDate = new Date(r.paid_at);
      return rDate >= dayStart && rDate < dayEnd;
    });
    
    days.push({
      day: numDays <= 7 
        ? dayStart.toLocaleDateString('en-GB', { weekday: 'short' })
        : dayStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: dayReceipts.reduce((sum, r) => sum + r.total, 0),
      count: dayReceipts.length
    });
  }
  
  // For month/all, group into chunks to avoid too many bars
  if (numDays > 14) {
    const chunkSize = Math.ceil(numDays / 10);
    const chunked: typeof days = [];
    for (let i = 0; i < days.length; i += chunkSize) {
      const chunk = days.slice(i, i + chunkSize);
      chunked.push({
        day: chunk[0].day,
        revenue: chunk.reduce((sum, d) => sum + d.revenue, 0),
        count: chunk.reduce((sum, d) => sum + d.count, 0)
      });
    }
    return chunked;
  }
  
  return days;
};

const salesByDay = getSalesByDay();
const maxDayRevenue = Math.max(...salesByDay.map(d => d.revenue), 1);

// Hourly breakdown for the selected period (aggregated)
const getPeriodHourlyData = () => {
  const hourlyTotals: { hour: string; revenue: number; count: number }[] = [];
  
  for (let h = 0; h < 24; h++) {
    hourlyTotals.push({
      hour: `${h.toString().padStart(2, '0')}:00`,
      revenue: 0,
      count: 0
    });
  }
  
  filteredReceipts.forEach(r => {
    const hour = new Date(r.paid_at).getHours();
    hourlyTotals[hour].revenue += r.total;
    hourlyTotals[hour].count += 1;
  });
  
  return hourlyTotals;
};

const periodHourlyData = getPeriodHourlyData();
const maxPeriodHourRevenue = Math.max(...periodHourlyData.map(h => h.revenue), 1);
const periodPeakHour = periodHourlyData.reduce((max, h) => h.revenue > max.revenue ? h : max, periodHourlyData[0]);

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
    <>
      <NebulaBackground opacity={0.3} />
      <div className="min-h-screen bg-transparent text-white font-sans overflow-x-hidden">
      
        {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-zinc-600/20 via-zinc-400/15 via-zinc-500/10 to-zinc-800/20 backdrop-blur border-b border-zinc-500/30">
        <div className="max-w-4xl lg:max-w-none mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
  <button
    onClick={() => router.push('/take-payment')}
    className="text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer active:scale-95"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  </button>
  <button
    onClick={() => router.push('/dashboard')}
    className="text-zinc-400 hover:text-white transition p-2 cursor-pointer active:scale-95"
    title="Dashboard"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  </button>
</div>
          
          <div className="flex items-center gap-2">
            {storeLogo ? (
              <img src={storeLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : null}
            <h1 className="text-lg font-bold">Analytics</h1>
          </div>
          
          <button
            onClick={fetchReceipts}
            className="text-zinc-400 hover:text-white transition p-2 cursor-pointer active:scale-95"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl lg:max-w-none mx-auto px-4 lg:px-6 pb-8">
        
        {/* Period Selector + Fee Info */}
<div className="flex flex-wrap items-center justify-between gap-4 py-6">
  <div className="flex gap-2 overflow-x-auto">
    {(['today', 'week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer active:scale-95 ${
                period === p
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
  </div>
  
 {/* Fee Info - Two compact badges */}
  <div className="grid grid-cols-2 gap-2 text-xs w-full sm:w-auto sm:flex">
    <div className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
      <span className="text-zinc-500">Platform:</span>
      <span className="text-amber-400 font-mono font-medium">0.5%</span>
      <span className="text-zinc-600">(£{(totalRevenue * 0.005).toFixed(2)})</span>
    </div>
    <div className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
      <span className="text-zinc-500">Commission:</span>
      <span className="text-emerald-400 font-mono font-medium">2.9%</span>
      <span className="text-zinc-600 hidden sm:inline">(Free tier)</span>
    </div>
  </div>
</div>
        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-500">Loading analytics...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Revenue */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-zinc-500 text-sm mb-1">Revenue</p>
                <p className="text-3xl sm:text-4xl font-bold text-emerald-400">£{totalRevenue.toFixed(2)}</p>
                {period !== 'all' && (
                  <p className={`text-sm mt-2 ${revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(0)}% vs last {period === 'today' ? 'day' : period}
                  </p>
                )}
              </div>

              {/* Transactions */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-zinc-500 text-sm mb-1">Transactions</p>
                <p className="text-3xl sm:text-4xl font-bold">{transactionCount}</p>
                <p className="text-zinc-600 text-sm mt-2">
                  {period === 'today' ? 'today' : period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'total'}
                </p>
              </div>

              {/* Average */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-zinc-500 text-sm mb-1">Avg Sale</p>
                <p className="text-3xl sm:text-4xl font-bold">£{avgTransaction.toFixed(2)}</p>
                <p className="text-zinc-600 text-sm mt-2">per transaction</p>
              </div>

              {/* Tips */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-zinc-500 text-sm mb-1">Tips</p>
                <p className="text-3xl sm:text-4xl font-bold text-amber-400">£{totalTips.toFixed(2)}</p>
                <p className="text-zinc-600 text-sm mt-2">
                  {totalRevenue > 0 ? ((totalTips / totalRevenue) * 100).toFixed(1) : 0}% of sales
                </p>
              </div>
            </div>

            {/* Charts Row */}
<div className="grid lg:grid-cols-2 gap-6 mb-8">
  
  {/* Sales Over Time - responds to period */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <h3 className="font-semibold mb-4">
      {period === 'today' ? 'Today by Hour' : period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time by Month'}
    </h3>
    
    {period === 'today' ? (
  /* Hourly view for today */
  <>
    <div className="flex items-end gap-0.5 h-40 overflow-x-auto max-w-full">
      {periodHourlyData.filter((_, i) => i >= 6 && i <= 22).map((hour, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1">
          <div className="w-full bg-zinc-800 rounded-t relative" style={{ height: '110px' }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t transition-all duration-500"
              style={{ height: `${(hour.revenue / maxPeriodHourRevenue) * 100}%` }}
            />
          </div>
          <span className="text-zinc-600 text-[10px]">{hour.hour.split(':')[0]}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4 text-sm">
      <span className="text-zinc-500">Peak hour</span>
      <span className="font-semibold text-emerald-400">{periodPeakHour?.hour || '--'}</span>
    </div>
  </>
): (
      /* Daily/Weekly/Monthly view */
      <>
        <div className="flex items-end gap-2 h-40 max-w-full">
  {salesByDay.map((day, i) => (
    <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-2">
              <div className="w-full bg-zinc-800 rounded-t-lg relative" style={{ height: '120px' }}>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(day.revenue / maxDayRevenue) * 100}%` }}
                />
              </div>
              <span className="text-zinc-500 text-xs">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <span className="text-zinc-500">{period === 'week' ? '7 day' : period === 'month' ? '30 day' : 'Total'}</span>
          <span className="font-semibold text-emerald-400">
            £{salesByDay.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
          </span>
        </div>
      </>
    )}
  </div>

  {/* Busiest Times - always shows hourly heatmap for selected period */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <h3 className="font-semibold mb-4">Busiest Hours</h3>
    <div className="flex items-end gap-0.5 h-40 overflow-x-auto max-w-full">
      {periodHourlyData.filter((_, i) => i >= 6 && i <= 22).map((hour, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1">
          <div className="w-full bg-zinc-800 rounded-t relative" style={{ height: '110px' }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t transition-all duration-500"
              style={{ height: `${maxPeriodHourRevenue > 0 ? (hour.revenue / maxPeriodHourRevenue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-zinc-600 text-[10px]">{hour.hour.split(':')[0]}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4 text-sm">
      <span className="text-zinc-500">Peak hour ({period === 'today' ? 'today' : period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'all time'})</span>
      <span className="font-semibold text-sky-400">{periodPeakHour?.hour || '--'}</span>
    </div>
  </div>
</div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Payment Methods */}
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
  <h3 className="font-semibold mb-4">Payment Methods</h3>
  <div className="space-y-4">
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          QR (Xaman)
        </span>
        <span className="font-medium">{qrPayments}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sky-500 rounded-full transition-all duration-500"
          style={{ width: `${transactionCount > 0 ? (qrPayments / transactionCount) * 100 : 0}%` }}
        />
      </div>
    </div>
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          NFC Card
        </span>
        <span className="font-medium">{nfcPayments}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${transactionCount > 0 ? (nfcPayments / transactionCount) * 100 : 0}%` }}
        />
      </div>
    </div>
  </div>
</div>

              {/* Top Products */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Top Products</h3>
                {topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.map(([name, data], i) => (
  <div key={name} className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-zinc-600 text-sm font-medium w-5">{i + 1}</span>
      <span className="text-sm truncate max-w-[120px]">{name}</span>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-emerald-400">£{(data?.revenue || 0).toFixed(2)}</p>
      <p className="text-zinc-600 text-xs">{data?.quantity || 0} sold</p>
    </div>
  </div>
))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No product sales yet</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <button 
                    onClick={() => router.push('/receipts')}
                    className="text-emerald-400 text-sm hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
                {filteredReceipts.length > 0 ? (
                  <div className="space-y-3">
                    {filteredReceipts.slice(0, 5).map((r) => (
                      <div key={r.receipt_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium">
                            {r.items.length === 1 ? r.items[0].name : `${r.items.length} items`}
                          </p>
                          <p className="text-zinc-500 text-xs">{timeAgo(r.paid_at)}</p>
                        </div>
                        <p className="font-semibold text-emerald-400">£{r.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No transactions yet</p>
                )}
              </div>
            </div>

            {/* YAOFUS Pioneers Badge */}
            <div className="mt-8 flex flex-col items-center gap-1">
              <span className="text-zinc-500 text-[10px] font-medium tracking-wider">PRECISION</span>
              <span className="text-base font-extrabold tracking-widest">
                <span className="text-emerald-500">Y</span>
                <span className="text-green-500">A</span>
                <span className="text-blue-500">O</span>
                <span className="text-indigo-500">F</span>
                <span className="text-violet-500">U</span>
                <span className="text-purple-500">S</span>
              </span>
              <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">ANALYTICS</span>
              <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
                <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
                <span>Powered by YesAllOfUs</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}

export default function AnalyticsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AnalyticsPage />
    </Suspense>
  );
}