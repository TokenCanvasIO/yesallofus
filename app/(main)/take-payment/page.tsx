'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductsManager from '@/components/ProductsManager';

interface Product {
  product_id: string;
  name: string;
  price: number;
  sku: string;
  category: string | null;
  emoji?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  'hot drinks': '☕',
  'cold drinks': '🧊',
  'food': '🍽️',
  'snacks': '🍪',
  'desserts': '🧁',
  'breakfast': '🥐',
  'lunch': '🥪',
  'default': '📦'
};

// Product name emoji suggestions
const productEmojis: Record<string, string> = {
  'coffee': '☕', 'latte': '☕', 'cappuccino': '☕', 'espresso': '☕', 'americano': '☕',
  'flat white': '☕', 'mocha': '☕', 'macchiato': '☕',
  'tea': '🍵', 'chai': '🍵', 'matcha': '🍵',
  'water': '💧', 'juice': '🧃', 'smoothie': '🥤', 'soda': '🥤', 'cola': '🥤',
  'croissant': '🥐', 'pastry': '🥐', 'danish': '🥐',
  'muffin': '🧁', 'cupcake': '🧁', 'cake': '🍰',
  'cookie': '🍪', 'biscuit': '🍪',
  'sandwich': '🥪', 'wrap': '🌯', 'bagel': '🥯',
  'salad': '🥗', 'soup': '🍲',
  'burger': '🍔', 'fries': '🍟', 'pizza': '🍕',
  'toast': '🍞', 'bread': '🍞',
  'egg': '🥚', 'bacon': '🥓', 'sausage': '🌭',
  'ice cream': '🍦', 'chocolate': '🍫',
  'beer': '🍺', 'wine': '🍷', 'cocktail': '🍸',
};

function getProductEmoji(product: Product): string {
  if (product.emoji) return product.emoji;
  
  const nameLower = product.name.toLowerCase();
  for (const [key, emoji] of Object.entries(productEmojis)) {
    if (nameLower.includes(key)) return emoji;
  }
  
  if (product.category) {
    const catLower = product.category.toLowerCase();
    return categoryEmojis[catLower] || categoryEmojis['default'];
  }
  
  return categoryEmojis['default'];
}

export default function TakePayment() {
  const router = useRouter();
  
  // Store data
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  
  // Products & Cart
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // UI State
  const [showProductsManager, setShowProductsManager] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  
  // Payment State
  const [status, setStatus] = useState<'idle' | 'qr' | 'waiting' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUID, setLastUID] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [qrPaymentUrl, setQrPaymentUrl] = useState<string | null>(null);
  // Last order for repeat
const [lastOrder, setLastOrder] = useState<CartItem[] | null>(null);
// Xaman QR Payment
const [xamanQR, setXamanQR] = useState<string | null>(null);
const [xamanPaymentId, setXamanPaymentId] = useState<string | null>(null);
  // Search & Filter
const [searchQuery, setSearchQuery] = useState('');
const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
    }
  }, [router]);

  // Fetch products
  useEffect(() => {
    if (storeId && walletAddress) {
      fetchProducts();
    }
  }, [storeId, walletAddress]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/products?wallet_address=${walletAddress}`
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
    setLoadingProducts(false);
  };

  // Poll for Xaman payment status
useEffect(() => {
  if (status !== 'qr' || !xamanPaymentId) return;
  
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://api.dltpays.com/api/v1/xaman/payment/poll/${xamanPaymentId}`);
      const data = await res.json();
      
      if (data.status === 'signed') {
        setTxHash(data.tx_hash);
        setLastOrder([...cart]);
        setStatus('success');
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      } else if (data.status === 'expired' || data.status === 'cancelled') {
        setError(`Payment ${data.status}`);
        setStatus('idle');
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, 2000);
  
  return () => clearInterval(pollInterval);
}, [status, xamanPaymentId, cart]);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart (increment if exists)
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  // Decrease quantity
  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.product_id !== productId);
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setManualAmount('');
  };

  // Get payment amount
  const getPaymentAmount = (): number => {
    if (showManualEntry && manualAmount) {
      return parseFloat(manualAmount) || 0;
    }
    return cartTotal;
  };

  // Handle number pad input
  const handleNumberInput = (num: string) => {
    if (num === 'clear') {
      setManualAmount('');
      return;
    }
    if (num === 'back') {
      setManualAmount(prev => prev.slice(0, -1));
      return;
    }
    if (num === '.' && manualAmount.includes('.')) return;
    if (manualAmount.includes('.') && manualAmount.split('.')[1]?.length >= 2) return;
    setManualAmount(prev => prev + num);
  };

  // Show QR Payment (Xaman)
const showQRPayment = async () => {
  const amount = getPaymentAmount();
  if (amount <= 0) {
    setError('Please add items or enter an amount');
    return;
  }
  
  setStatus('qr');
  setError(null);
  
  try {
    const res = await fetch('https://api.dltpays.com/api/v1/xaman/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_wallet: walletAddress,
        amount: amount,
        store_id: storeId,
        store_name: storeName
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      setXamanQR(data.qr_png);
      setXamanPaymentId(data.payment_id);
    } else {
      setError(data.error || 'Failed to create payment request');
      setStatus('idle');
    }
  } catch (err: any) {
    setError('Failed to create payment request');
    setStatus('idle');
  }
};

  // Start NFC Payment
  const startNFCPayment = () => {
    const amount = getPaymentAmount();
    if (amount <= 0) {
      setError('Please add items or enter an amount');
      return;
    }
    
    setStatus('waiting');
    setError(null);
    
    // Try Web NFC if available (Android Chrome)
    if ('NDEFReader' in window) {
      startNFCScan(amount);
    }
  };

  // Web NFC scan (Android only)
  const startNFCScan = async (paymentAmount: number) => {
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener('reading', async ({ serialNumber }: { serialNumber: string }) => {
        setLastUID(serialNumber);
        await processPayment(serialNumber, paymentAmount);
      });
      
      ndef.addEventListener('readingerror', () => {
        setError('Could not read NFC tag');
        setStatus('idle');
      });
    } catch (err: any) {
      console.log('Web NFC not available, using manual mode');
    }
  };

  // Manual UID entry (for iOS/demo)
  const handleManualUID = async () => {
    const amount = getPaymentAmount();
    const uid = prompt('Enter customer NFC card UID:', '04:5B:07:0A:FD:75:80');
    
    if (uid) {
      setLastUID(uid);
      await processPayment(uid, amount);
    }
  };

  // Process the payment
  const processPayment = async (uid: string, paymentAmount: number) => {
    setStatus('processing');
    
    try {
      // Build items array from cart
      const items = cart.length > 0 
        ? cart.map(item => ({
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity
          }))
        : [{ name: 'Payment', quantity: 1, unit_price: paymentAmount, line_total: paymentAmount }];

      const response = await fetch(`${API_URL}/nfc/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: uid,
          amount: paymentAmount,
          vendor_wallet: walletAddress,
          store_name: storeName,
          store_id: storeId,
          items: items
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
  setTxHash(data.tx_hash);
  setLastOrder([...cart]);
  setStatus('success');
  // Haptic + sound feedback
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
} else {
        setError(data.error || 'Payment failed');
        setStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  // Reset for next payment
  const resetPayment = () => {
  setStatus('idle');
  setCart([]);
  setManualAmount('');
  setLastUID(null);
  setTxHash(null);
  setQrPaymentUrl(null);
  setXamanQR(null);
  setXamanPaymentId(null);
  setError(null);
  setShowManualEntry(false);
};
// Send receipt email
const sendReceiptEmail = async () => {
  if (!emailAddress || !emailAddress.includes('@')) {
    setError('Please enter a valid email');
    return;
  }
  
  setSendingEmail(true);
  try {
    const items = cart.length > 0 ? cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    })) : lastOrder?.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const res = await fetch('https://api.dltpays.com/api/v1/receipt/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailAddress,
        store_name: storeName,
        amount: getPaymentAmount(),
        items: items,
        tx_hash: txHash
      })
    });
    
    const data = await res.json();
    if (data.success) {
      setShowEmailModal(false);
      setEmailAddress('');
    } else {
      setError('Failed to send email');
    }
  } catch (err) {
    setError('Failed to send email');
  }
  setSendingEmail(false);
};

// Print receipt
const printReceipt = () => {
  const items = lastOrder || cart;
  const amount = getPaymentAmount();
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }
        .brand {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
        .store-name {
          font-size: 24px;
          font-weight: 700;
          text-align: right;
        }
        .receipt-label {
          font-size: 12px;
          color: #666;
          text-align: right;
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
          padding: 12px 0;
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
          font-size: 18px;
          font-weight: 600;
        }
        .total-amount {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
        }
        .tx-section {
          margin-top: 30px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .tx-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        .tx-hash {
          font-size: 10px;
          font-family: monospace;
          word-break: break-all;
          color: #333;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="Logo" class="logo">
          <span class="brand">YesAllOfUs</span>
        </div>
        <div>
          <div class="store-name">${storeName}</div>
          <div class="receipt-label">Receipt</div>
        </div>
      </div>
      
      <div class="date">${new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</div>
      
      <div class="items">
        ${items.map(item => `
          <div class="item">
            <div>
              <div class="item-name">${item.name}</div>
              <div class="item-qty">Qty: ${item.quantity} × £${item.price.toFixed(2)}</div>
            </div>
            <div class="item-price">£${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="total-section">
        <span class="total-label">Total</span>
        <span class="total-amount">£${amount.toFixed(2)}</span>
      </div>
      
      ${txHash ? `
        <div class="tx-section">
          <div class="tx-label">Transaction ID (XRPL)</div>
          <div class="tx-hash">${txHash}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your payment!</p>
        <p>Powered by YesAllOfUs · Payments on XRPL</p>
      </div>
    </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
if (printWindow) {
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  // Wait for logo to load before printing
  const logo = printWindow.document.querySelector('.logo') as HTMLImageElement;
  if (logo) {
    logo.onload = () => printWindow.print();
    logo.onerror = () => printWindow.print();
    setTimeout(() => printWindow.print(), 1000); // Fallback
  } else {
    printWindow.print();
  }
}
};

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Get all categories
const categories = Object.keys(groupedProducts);

// Filter products by search
const filteredProducts = searchQuery
  ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  : activeCategory
    ? groupedProducts[activeCategory] || []
    : products;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-lg font-bold truncate max-w-[180px]">{storeName}</h1>
  <button
  onClick={() => router.push('/receipts?from=take-payment')}
  className="text-zinc-400 hover:text-white transition p-2"
  title="Receipts"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
</button>
          <button
  onClick={() => router.push('/receipts?from=take-payment')}
  className="text-zinc-400 hover:text-white transition p-2"
  title="Receipts"
>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Products Manager Modal */}
      {showProductsManager && storeId && walletAddress && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen">
            <div className="sticky top-0 bg-[#0a0a0a] p-4 border-b border-zinc-800 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <button
                onClick={() => {
                  setShowProductsManager(false);
                  fetchProducts();
                }}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition"
              >
                Done
              </button>
            </div>
            <div className="p-4">
              <ProductsManager storeId={storeId} walletAddress={walletAddress} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pb-8">

        {/* ============================================================= */}
        {/* IDLE STATE - Product Selection */}
        {/* ============================================================= */}
        {status === 'idle' && (
          <>
            {/* Amount Display */}
            <div className="py-8 text-center">
              <p className="text-zinc-500 text-sm mb-1">
                {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''}` : 'Total'}
              </p>
              <div className="text-5xl font-bold tracking-tight">
                £{showManualEntry ? (manualAmount || '0.00') : cartTotal.toFixed(2)}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Products Grid or Manual Entry */}
            {!showManualEntry ? (
              <>
                {/* Products */}
                {loadingProducts ? (
  <div className="text-center py-12">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p className="text-zinc-500">Loading products...</p>
  </div>
) : products.length === 0 ? (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📦</div>
    <p className="text-zinc-400 mb-2">No products yet</p>
    <button
      onClick={() => setShowProductsManager(true)}
      className="text-emerald-400 hover:text-emerald-300 font-medium"
    >
      + Add your first product
    </button>
  </div>
) : (
  <div className="mb-6">
    {/* Search Bar */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setActiveCategory(null);
        }}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
      />
    </div>

    {/* Repeat Last Order */}
{lastOrder && lastOrder.length > 0 && cart.length === 0 && (
  <button
    onClick={() => setCart(lastOrder.map(item => ({ ...item })))}
    className="w-full mb-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-between transition"
  >
    <div className="flex items-center gap-3">
      <span className="text-xl">🔄</span>
      <div className="text-left">
        <p className="text-sm font-medium">Repeat last order</p>
        <p className="text-zinc-500 text-xs">
          {lastOrder.length} item{lastOrder.length > 1 ? 's' : ''} · £{lastOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
        </p>
      </div>
    </div>
    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
)}

    {/* Category Tabs */}
    {!searchQuery && categories.length > 1 && (
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            activeCategory === null
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    )}

    {/* Products Grid */}
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {filteredProducts.map((product) => {
        const inCart = cart.find(item => item.product_id === product.product_id);
        return (
          <button
            key={product.product_id}
            onClick={() => addToCart(product)}
            className={`relative bg-zinc-900 hover:bg-zinc-800 border rounded-2xl p-3 text-center transition-all active:scale-95 ${
              inCart ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800'
            }`}
          >
            {inCart && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                {inCart.quantity}
              </div>
            )}
            <div className="text-2xl mb-1">{getProductEmoji(product)}</div>
            <p className="text-xs font-medium truncate mb-1">{product.name}</p>
            <p className="text-emerald-400 text-sm font-semibold">£{product.price.toFixed(2)}</p>
          </button>
        );
      })}
    </div>

    {/* No results */}
    {filteredProducts.length === 0 && searchQuery && (
      <div className="text-center py-8">
        <p className="text-zinc-500">No products match "{searchQuery}"</p>
      </div>
    )}
  </div>
)}

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Cart</h3>
                      <button
                        onClick={clearCart}
                        className="text-zinc-500 hover:text-red-400 text-sm transition"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => decreaseQuantity(item.product_id)}
                                className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-sm transition"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-sm transition"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-zinc-300">{item.name}</span>
                          </div>
                          <span className="text-zinc-400">£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-emerald-400">£{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Manual Amount Entry */
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-2xl font-semibold py-5 rounded-2xl transition active:scale-95"
                    >
                      {num === 'back' ? '⌫' : num}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualAmount('');
                  }}
                  className="w-full text-zinc-500 hover:text-white text-sm py-2 transition"
                >
                  ← Back to products
                </button>
              </div>
            )}

            {/* Payment Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={showQRPayment}
                  disabled={getPaymentAmount() <= 0}
                  className="bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-lg py-5 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Show QR
                </button>
                <button
                  onClick={startNFCPayment}
                  disabled={getPaymentAmount() <= 0}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-lg py-5 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Tap Card
                </button>
              </div>
              
              {!showManualEntry && (
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-medium py-3 rounded-xl transition"
                >
                  Enter amount manually
                </button>
              )}
            </div>
          </>
        )}

        {/* ============================================================= */}
        {/* QR CODE STATE */}
        {/* ============================================================= */}
{status === 'qr' && (
  <div className="text-center py-8">
    {xamanQR ? (
      <>
        <div className="bg-white rounded-3xl p-6 inline-block mb-6">
          <img
            src={xamanQR}
            alt="Scan with Xaman"
            className="w-64 h-64"
          />
        </div>
        
        <p className="text-3xl font-bold mb-2">£{getPaymentAmount().toFixed(2)}</p>
        <p className="text-emerald-400 text-lg mb-2">Scan with Xaman</p>
        <p className="text-zinc-500 mb-8">Open Xaman app and scan this QR code</p>
      </>
    ) : (
      <div className="py-12">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Creating payment request...</p>
      </div>
    )}
    
    <button
      onClick={() => {
        setStatus('idle');
        setXamanQR(null);
        setXamanPaymentId(null);
      }}
      className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl transition"
    >
      Cancel
    </button>
  </div>
)}

        {/* ============================================================= */}
        {/* WAITING FOR NFC STATE */}
        {/* ============================================================= */}
        {status === 'waiting' && (
          <div className="text-center py-12">
            <div className="w-40 h-40 mx-auto mb-8 bg-emerald-500/20 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <svg className="w-20 h-20 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            
            <p className="text-3xl font-bold mb-2">£{getPaymentAmount().toFixed(2)}</p>
            <p className="text-emerald-400 text-xl font-semibold mb-2">Ready for payment</p>
            <p className="text-zinc-500 mb-8">Customer: tap your card on the phone</p>
            
            <div className="space-y-3">
              <button
                onClick={handleManualUID}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl transition"
              >
                Enter Card ID Manually
              </button>
              
              <button
                onClick={() => setStatus('idle')}
                className="block mx-auto text-zinc-500 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* PROCESSING STATE */}
        {/* ============================================================= */}
        {status === 'processing' && (
          <div className="text-center py-12">
            <div className="w-40 h-40 mx-auto mb-8 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <p className="text-3xl font-bold mb-2">£{getPaymentAmount().toFixed(2)}</p>
            <p className="text-yellow-400 text-xl font-semibold">Processing...</p>
            <p className="text-zinc-500 text-sm mt-2">Card: {lastUID}</p>
          </div>
        )}

        {/* ============================================================= */}
        {/* SUCCESS STATE */}
        {/* ============================================================= */}
        {status === 'success' && (
          <div className="text-center py-12">
            <div className="w-40 h-40 mx-auto mb-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-24 h-24 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <p className="text-4xl font-bold mb-2">£{getPaymentAmount().toFixed(2)}</p>
            <p className="text-emerald-400 text-2xl font-semibold mb-4">Payment Complete!</p>
            
            {txHash && ( <a
  
    href={`https://livenet.xrpl.org/transactions/${txHash}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-500 hover:text-emerald-400 text-sm mb-8 font-mono block"
  >
    TX: {txHash.slice(0, 8)}...{txHash.slice(-8)} ↗
  </a>
)}

            <div className="flex justify-center gap-3 mb-8">
  <button 
    onClick={() => setShowEmailModal(true)}
    className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
  >
    <span>📧</span> Email
  </button>
  <button 
    onClick={printReceipt}
    className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
  >
    <span>🖨️</span> Print
  </button>
</div>
            
            <button
              onClick={resetPayment}
              className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg py-4 rounded-2xl transition"
            >
              New Payment
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* ERROR STATE */}
        {/* ============================================================= */}
        {status === 'error' && (
          <div className="text-center py-12">
            <div className="w-40 h-40 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-24 h-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <p className="text-3xl font-bold mb-2">£{getPaymentAmount().toFixed(2)}</p>
            <p className="text-red-400 text-2xl font-semibold mb-2">Payment Failed</p>
            <p className="text-zinc-500 mb-8">{error}</p>
            
            <button
              onClick={resetPayment}
              className="w-full max-w-xs mx-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg py-4 rounded-2xl transition"
            >
              Try Again
            </button>
          </div>
        )}
{/* Email Modal */}
{showEmailModal && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
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
          onClick={sendReceiptEmail}
          disabled={sendingEmail}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
        >
          {sendingEmail ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}