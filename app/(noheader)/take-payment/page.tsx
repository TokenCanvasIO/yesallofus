'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProductsManager from '@/components/ProductsManager';
import { updateCustomerDisplay, clearCustomerDisplay } from '@/lib/customerDisplay';
import StaffSelector from '@/components/StaffSelector';
import SendPaymentLink from '@/components/SendPaymentLink';
import PendingPayments from '@/components/PendingPayments';
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
// Mobile Staff List Component (inline for mobile modal)
function MobileStaffList({ 
  storeId, 
  walletAddress, 
  activeStaff, 
  onSelect 
}: { 
  storeId: string; 
  walletAddress: string; 
  activeStaff: any; 
  onSelect: (staff: any) => void;
}) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(
          `https://api.dltpays.com/nfc/api/v1/store/${storeId}/staff?wallet_address=${walletAddress}`
        );
        const data = await res.json();
        if (data.success) {
          setStaffList(data.staff || []);
        }
      } catch (err) {
        console.error('Failed to fetch staff');
      }
      setLoading(false);
    };
    fetchStaff();
  }, [storeId, walletAddress]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500 mb-2">No staff members yet</p>
        <a href="/staff" className="text-emerald-400 text-sm">+ Add staff</a>
      </div>
    );
  }

  return (
    <>
      {staffList.map((staff) => (
        <button
          key={staff.staff_id}
          onClick={() => onSelect(staff)}
          className={`w-full flex items-center gap-3 px-4 py-4 border-b border-zinc-800 transition ${
            activeStaff?.staff_id === staff.staff_id ? 'bg-zinc-800' : ''
          }`}
        >
          {staff.photo_url ? (
            <img src={staff.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">
              {staff.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-left">
            <p className="text-white">{staff.name}</p>
            <p className="text-zinc-500 text-sm">{staff.role}</p>
          </div>
          {activeStaff?.staff_id === staff.staff_id ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : staff.is_clocked_in ? (
            <span className="text-emerald-400 text-xs">● On shift</span>
          ) : (
            <span className="text-zinc-600 text-xs">Off</span>
          )}
        </button>
      ))}
    </>
  );
}
export default function TakePayment() {
const router = useRouter();
// Store data
const [walletAddress, setWalletAddress] = useState<string | null>(null);
const [storeId, setStoreId] = useState<string | null>(null);
const [storeName, setStoreName] = useState<string>('');
const nfcScanActiveRef = useRef(false);
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
// Logo
const [storeLogo, setStoreLogo] = useState<string | null>(null);
const [showLogoUpload, setShowLogoUpload] = useState(false);
const [uploadingLogo, setUploadingLogo] = useState(false);
// Staff Dropdown
const [activeStaff, setActiveStaff] = useState<any | null>(null);
// Tip
const [tipsEnabled, setTipsEnabled] = useState<boolean>(false);
const [tipAmount, setTipAmount] = useState<number>(0);
const [showCustomTipModal, setShowCustomTipModal] = useState(false);
const [customTipInput, setCustomTipInput] = useState('');

// Live conversion state
const [liveRate, setLiveRate] = useState<number | null>(null);
const [rlusdAmount, setRlusdAmount] = useState<number | null>(null);
const [priceAge, setPriceAge] = useState<number>(0);
// Split pay email
const [showSendPaymentLink, setShowSendPaymentLink] = useState(false);
// Update share pay modal ui
const [showPendingPayments, setShowPendingPayments] = useState(false);
// Header staff UI
const [showStaffModal, setShowStaffModal] = useState(false);

// Convert GBP to RLUSD - Live price from CoinGecko Pro with audit trail
const convertGBPtoRLUSD = async (gbpAmount: number): Promise<number> => {
  try {
    const res = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${gbpAmount}&capture=true`);
    const data = await res.json();
    if (data.success) {
      console.log(`💱 Rate: £1 = ${(1/data.rate.rlusd_gbp).toFixed(6)} RLUSD | Source: ${data.source}`);
      return data.rlusd;
    }
    throw new Error('Conversion failed');
  } catch (err) {
    console.error('Conversion error:', err);
    // Fallback to cached endpoint
    try {
      const fallback = await fetch('https://tokencanvas.io/api/coingecko/simple/price?ids=ripple-usd&vs_currencies=gbp');
      const fallbackData = await fallback.json();
      const rlusdInGbp = fallbackData['ripple-usd']?.gbp;
      if (rlusdInGbp) {
        return Math.round((gbpAmount / rlusdInGbp) * 1000000) / 1000000;
      }
    } catch {}
    return Math.round(gbpAmount * 1.35 * 1000000) / 1000000;
  }
};

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
// Update session storage with fresh data
const updatedStore = { ...store, logo_url: data.store.logo_url };
sessionStorage.setItem('storeData', JSON.stringify(updatedStore));
          }
        })
        .catch(err => console.error('Failed to fetch store:', err));
    }
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
if (storeId) updateCustomerDisplay(storeId, storeName, cart, getPaymentAmount(), 'success', null, tipAmount);
if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
} else if (data.status === 'expired' || data.status === 'cancelled') {
setError(`Payment ${data.status}`);
setStatus('idle');
if (storeId) updateCustomerDisplay(storeId, storeName, cart, getPaymentAmount(), 'idle', null, 0);
}
    } catch (err) {
console.error('Poll error:', err);
    }
  }, 2000);
return () => clearInterval(pollInterval);
}, [status, xamanPaymentId, cart]);
// Cart calculations
const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const customAmount = parseFloat(manualAmount) || 0;

// Fetch live conversion rate
useEffect(() => {
  const fetchRate = async () => {
    const amount = getPaymentAmount();
    if (amount <= 0) return;
    
    try {
      const res = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${amount}&capture=true`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.success) {
        setLiveRate(data.rate.gbp_to_rlusd);
        setRlusdAmount(data.rlusd);
        setPriceAge(data.price_age_ms);
      }
    } catch (err) {
      // Fallback: estimate rate
      setLiveRate(1.35);
      setRlusdAmount(amount * 1.35);
      setPriceAge(0);
    }
  };

  if (status === 'idle' || status === 'qr') {
    fetchRate();
    const interval = setInterval(fetchRate, 10000);
    return () => clearInterval(interval);
  }
}, [cartTotal, customAmount, tipAmount, status]);

// Sync cart to customer display
useEffect(() => {
if (storeId && status === 'idle' && cart.length > 0) {
updateCustomerDisplay(storeId, storeName, cart, cartTotal + tipAmount, 'idle', null, tipAmount, tipsEnabled);
  } else if (storeId && status === 'idle' && cart.length === 0) {
clearCustomerDisplay(storeId, storeName);
  }
}, [cart, cartTotal, storeId, storeName, status, tipAmount, tipsEnabled]);

// Poll for tip changes and customer confirmation from display
useEffect(() => {
if (!storeId || status !== 'idle') return;
if (cart.length === 0 && customAmount === 0) return;

const pollDisplay = async () => {
try {
const res = await fetch(`${API_URL}/display/${storeId}`);
if (!res.ok) return;
const data = await res.json();

// Sync tip from display
if (data.tip !== undefined && data.tip !== tipAmount) {
setTipAmount(data.tip);
      }

// Customer confirmed - trigger payment
if (data.customer_confirmed && status === 'idle') {
// Reset flag to prevent double-trigger
fetch(`${API_URL}/display/${storeId}/reset-confirm`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' }
  }).catch(() => {});

// FIX: Use data.total directly - it already contains subtotal + tip
// The API calculates this correctly in the /tip endpoint
const totalFromAPI = data.total;

console.log('Customer confirmed payment:', {
  subtotal: data.subtotal,
  tip: data.tip,
  total: data.total,
  totalFromAPI
});

setTipAmount(data.tip || 0);
showQRPayment(totalFromAPI);
}
    } catch (err) {}
  };

const interval = setInterval(pollDisplay, 1000);
return () => clearInterval(interval);
}, [storeId, status, tipAmount, cart.length, customAmount]);

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
if (storeId) clearCustomerDisplay(storeId, storeName);
  };
// Get payment amount
const getPaymentAmount = () => {
if (cart.length > 0) {
return cartTotal + tipAmount;
  }
return customAmount + tipAmount;
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
// Sync manual amount to customer display
useEffect(() => {
if (storeId && status === 'idle' && showManualEntry && customAmount > 0) {
const manualCart = [{ name: 'Payment', quantity: 1, price: customAmount, emoji: '💷' }];
updateCustomerDisplay(storeId, storeName, manualCart, customAmount + tipAmount, 'idle', null, tipAmount, tipsEnabled);
  }
}, [customAmount, storeId, storeName, status, showManualEntry, tipAmount, tipsEnabled]);

// Show QR Payment (Xaman)
const showQRPayment = async (overrideAmount?: number) => {
const gbpAmount = overrideAmount ?? getPaymentAmount();
console.log('showQRPayment called with:', { 
  overrideAmount, 
  gbpAmount, 
  tipAmount, 
  cartTotal, 
  customAmount,
  getPaymentAmount: getPaymentAmount()
});

if (gbpAmount <= 0) {
setError('Please add items or enter an amount');
return;
  }

setStatus('qr');
setError(null);

// Convert GBP to RLUSD
const amount = await convertGBPtoRLUSD(gbpAmount);

console.log('Creating Xaman payment:', { gbpAmount, rlusdAmount: amount });

// Start NFC scan in background (Android only)
if ('NDEFReader' in window) {
startNFCScan(amount);
  }

// Don't update display yet - wait for QR code
try {
const res = await fetch('https://api.dltpays.com/api/v1/xaman/payment', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
amount: amount,
vendor_wallet: walletAddress,
store_id: storeId,
store_name: storeName
      })
    });
const data = await res.json();
if (data.success) {
setXamanQR(data.qr_png);
setXamanPaymentId(data.payment_id);
const displayCart = cart.length > 0 
  ? cart 
  : [{ name: 'Payment', quantity: 1, price: customAmount || gbpAmount, emoji: '💷' }];
if (storeId) updateCustomerDisplay(storeId, storeName, displayCart, gbpAmount, 'qr', data.qr_png, tipAmount);
}else {
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
if (storeId) updateCustomerDisplay(storeId, storeName, cart, amount, 'ready');
// Try Web NFC if available (Android Chrome)
if ('NDEFReader' in window) {
startNFCScan(amount);
    }
  };
// Web NFC scan (Android only)
const startNFCScan = async (paymentAmount: number) => {
if (nfcScanActiveRef.current) {
  console.log('NFC scan already active, skipping');
  return;
}
nfcScanActiveRef.current = true;
try {
const ndef = new (window as any).NDEFReader();
await ndef.scan();
let lastReadTime = 0;
ndef.addEventListener('reading', async ({ serialNumber }: { serialNumber: string }) => {
  // Debounce: ignore reads within 5 seconds of last read
  const now = Date.now();
  if (now - lastReadTime < 5000) {
    console.log('NFC read debounced');
    return;
  }
  lastReadTime = now;
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
// Prevent duplicate payments
if (status === 'processing') {
  console.log('Payment already processing, skipping');
  return;
}
setStatus('processing');
if (storeId) updateCustomerDisplay(storeId, storeName, cart, paymentAmount, 'processing');
try {
// Build items array from cart
const items = cart.length > 0 
? [
...cart.map(item => ({
product_id: item.product_id,
name: item.name,
quantity: item.quantity,
unit_price: item.price,
line_total: item.price * item.quantity
      })),
...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, unit_price: tipAmount, line_total: tipAmount }] : [])
    ]
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
    items: items,
    staff_id: activeStaff?.staff_id || null,
    staff_name: activeStaff?.name || null
  })
});
const data = await response.json();
if (data.success) {
setTxHash(data.tx_hash);
setLastOrder([...cart]);
setStatus('success');
if (storeId) updateCustomerDisplay(storeId, storeName, cart, paymentAmount, 'success');
// Haptic + sound feedback
if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
} else {
setError(data.error || 'Payment failed');
setStatus('error');
if (storeId) updateCustomerDisplay(storeId, storeName, cart, paymentAmount, 'error');
      }
    } catch (err: any) {
setError(err.message || 'Payment failed');
setStatus('error');
if (storeId) updateCustomerDisplay(storeId, storeName, cart, paymentAmount, 'error');
    }
  };
// Reset for next payment
const resetPayment = () => {
setStatus('idle');
setCart([]);
setManualAmount('');
setTipAmount(0);
setLastUID(null);
setTxHash(null);
setQrPaymentUrl(null);
setXamanQR(null);
setXamanPaymentId(null);
setError(null);
setShowManualEntry(false);
if (storeId) clearCustomerDisplay(storeId, storeName);
};

// Upload store logo
const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setError('Image must be less than 5MB');
    return;
  }

  if (!file.type.startsWith('image/')) {
    setError('Please upload an image file');
    return;
  }

  setUploadingLogo(true);
  setError(null);

  try {
    // Upload directly to Cloudinary with unsigned preset
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'store_logos'); // Your unsigned preset name

    const uploadRes = await fetch('https://tokencanvas.io/api/cloudinary/upload', {
  method: 'POST',
  body: formData
});

    const uploadData = await uploadRes.json();
    
    if (!uploadData.secure_url) {
      throw new Error(uploadData.error?.message || 'Upload failed');
    }

    const logoUrl = uploadData.secure_url;

    // Save URL to your backend
    const res = await fetch(`${API_URL}/store/${storeId}/logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logo_url: logoUrl,
        wallet_address: walletAddress
      })
    });

    const data = await res.json();
    if (data.success) {
      setStoreLogo(logoUrl);
      // Update session storage
      const storeData = sessionStorage.getItem('storeData');
      if (storeData) {
        const store = JSON.parse(storeData);
        store.logo_url = logoUrl;
        sessionStorage.setItem('storeData', JSON.stringify(store));
      }
      setShowLogoUpload(false);
    } else {
      setError('Failed to save logo');
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    setError(err.message || 'Failed to upload logo');
  }
  setUploadingLogo(false);
};

// Remove store logo
const removeLogo = async () => {
setUploadingLogo(true);
try {
const res = await fetch(`${API_URL}/store/${storeId}/logo`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
logo_url: null,
wallet_address: walletAddress
      })
    });
if (res.ok) {
setStoreLogo(null);
const storeData = sessionStorage.getItem('storeData');
if (storeData) {
const store = JSON.parse(storeData);
store.logo_url = null;
sessionStorage.setItem('storeData', JSON.stringify(store));
      }
setShowLogoUpload(false);
    }
  } catch (err) {
setError('Failed to remove logo');
  }
setUploadingLogo(false);
};
// Send receipt email
const sendReceiptEmail = async () => {
if (!emailAddress || !emailAddress.includes('@')) {
setError('Please enter a valid email');
return;
  }
setSendingEmail(true);
try {
const orderItems = cart.length > 0 
? [
...cart.map(item => ({
name: item.name,
quantity: item.quantity,
unit_price: item.price
      })),
...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, unit_price: tipAmount }] : [])
    ]
: lastOrder 
? [
...lastOrder.map(item => ({
name: item.name,
quantity: item.quantity,
unit_price: item.price
        })),
...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, unit_price: tipAmount }] : [])
      ]
: [];
const res = await fetch('https://api.dltpays.com/nfc/api/v1/receipt/email', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email: emailAddress,
store_name: storeName,
store_id: storeId,
amount: getPaymentAmount(),
items: orderItems,
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
const items = [
...(lastOrder || cart),
...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, price: tipAmount }] : [])
];
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
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
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
        .receipt-label {
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
    ? `
      <img src="${storeLogo}" alt="${storeName}" class="store-logo">
      <div class="store-info">
        <div class="store-name">${storeName}</div>
        <div class="receipt-label">Receipt</div>
      </div>
    `
    : `
      <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="store-logo">
      <div class="store-info">
        <div class="store-name">YesAllOfUs</div>
      </div>
      <div style="text-align: right; margin-left: auto;">
        <div class="store-name">${storeName}</div>
        <div class="receipt-label">Receipt</div>
      </div>
    `
}
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
      <div class="footer" style="flex-direction: column; gap: 4px;">
        <span style="color: #71717a; font-size: 9px; font-weight: 500; letter-spacing: 1px;">RECEIPT</span>
        <span style="font-size: 16px; font-weight: 800; letter-spacing: 2px;"><span style="color: #10b981;">Y</span><span style="color: #22c55e;">A</span><span style="color: #3b82f6;">O</span><span style="color: #6366f1;">F</span><span style="color: #8b5cf6;">U</span><span style="color: #a855f7;">S</span></span>
        <span style="color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 1.5px;">INSTANT</span>
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
<div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex flex-col">
{/* Header */}
<header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
<div className="max-w-lg mx-auto sm:max-w-none sm:mx-0 w-full px-4 py-3 flex items-center justify-between">
{/* Left - Home button */}
<button
onClick={() => router.push('/dashboard')}
className="text-zinc-400 hover:text-white transition p-2 active:scale-95 cursor-pointer"
title="Dashboard"
>
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
</svg>
</button>

{/* Center - Logo and Store Name */}
<div className="flex items-center gap-2 landscape:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2">
  <button
    onClick={() => setShowLogoUpload(true)}
    className={`relative w-8 h-8 rounded-lg overflow-hidden transition flex-shrink-0 cursor-pointer ${
      storeLogo ? 'hover:opacity-80' : 'border border-zinc-700 hover:border-emerald-500'
    }`}
    title="Store logo"
  >
    {storeLogo ? (
      <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )}
  </button>
  <h1 className="text-lg font-bold truncate max-w-[120px] hidden landscape:block sm:block">{storeName}</h1>
</div>

{/* Right - Staff selector and icons */}
<div className="flex items-center gap-1">
{/* Staff Selector - Icon only on mobile, full on desktop */}
{storeId && walletAddress && (
  <div className="hidden sm:block">
    <StaffSelector
      storeId={storeId}
      walletAddress={walletAddress}
      onStaffChange={(staff) => setActiveStaff(staff)}
    />
  </div>
)}
{storeId && walletAddress && (
  <button
    onClick={() => setShowStaffModal(true)}
    className="sm:hidden text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
    title={activeStaff?.name || 'Staff'}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </button>
)}

{/* Analytics */}
<div className="relative group">
  <button
    onClick={() => router.push('/analytics')}
    className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </button>
  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
    Analytics
  </span>
</div>

{/* Pending Payments */}
<div className="relative group">
  <button
    onClick={() => setShowPendingPayments(true)}
    className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
    Pending Payments
  </span>
</div>

{/* Customer Display */}
<div className="relative group">
<button
onClick={() => window.open(`/display?store=${storeId}`, '_blank')}
className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
>
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
</button>
<span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
      Customer Display
</span>
</div>
{/* Receipts */}
<div className="relative group">
<button
onClick={() => router.push('/receipts?from=take-payment')}
className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
>
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
</button>
<span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
      Receipts
</span>
</div>
{/* Add Products */}
<div className="relative group">
<button
onClick={() => setShowProductsManager(true)}
className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
>
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg>
</button>
<span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
      Add Products
</span>
</div>
</div>
</div>
</header>
{/* Logo Upload Modal */}
{showLogoUpload && (
<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
<div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
<h3 className="text-lg font-bold mb-4">Store Logo</h3>
{storeLogo && (
<div className="mb-4 flex justify-center">
<img src={storeLogo} alt="Current logo" className="w-24 h-24 rounded-xl object-cover" />
</div>
      )}
<label className="block mb-4">
<div className="bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition">
{uploadingLogo ? (
<div className="flex flex-col items-center">
<div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
<p className="text-zinc-400 text-sm">Uploading...</p>
</div>
          ) : (
<>
<svg className="w-8 h-8 text-zinc-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
<p className="text-zinc-400 text-sm">Click to upload image</p>
<p className="text-zinc-600 text-xs mt-1">Max 5MB</p>
</>
          )}
</div>
<input
type="file"
accept="image/*"
onChange={handleLogoUpload}
className="hidden"
disabled={uploadingLogo}
/>
</label>
<div className="flex gap-3">
{storeLogo && (
<button
onClick={removeLogo}
disabled={uploadingLogo}
className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl transition disabled:opacity-50"
>
            Remove
</button>
        )}
<button
onClick={() => setShowLogoUpload(false)}
className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
>
{storeLogo ? 'Done' : 'Cancel'}
</button>
</div>
</div>
</div>
)}
{/* Products Manager Modal */}
{showProductsManager && storeId && walletAddress && (
<div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
<div className="min-h-screen flex flex-col">
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
<div className="p-4 flex-1">
<ProductsManager storeId={storeId} walletAddress={walletAddress} />
</div>
{/* YAOFUS Pioneers Badge - Footer */}
<footer className="py-6 flex flex-col items-center gap-1">
  <span className="text-zinc-500 text-[10px] font-medium tracking-wider">CATALOG</span>
  <span className="text-base font-extrabold tracking-widest">
    <span className="text-emerald-500">Y</span>
    <span className="text-green-500">A</span>
    <span className="text-blue-500">O</span>
    <span className="text-indigo-500">F</span>
    <span className="text-violet-500">U</span>
    <span className="text-purple-500">S</span>
  </span>
  <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">PRODUCTS</span>
  <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
    <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
    <span>Powered by YesAllOfUs</span>
  </div>
</footer>
</div>
</div>
      )}
<main className="w-full sm:max-w-lg mx-auto px-2 sm:px-4 pb-8 flex-1">
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
className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition active:scale-95 cursor-pointer ${
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
className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition active:scale-95 cursor-pointer ${
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
className={`relative bg-zinc-900 hover:bg-zinc-800 border rounded-2xl p-3 text-center transition-all active:scale-95 cursor-pointer ${
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
className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 text-white text-2xl font-semibold py-5 rounded-2xl transition active:scale-95 cursor-pointer"
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
{/* Tip Section */}
<div className="mb-4">
{/* Tips Toggle */}
<div className="flex items-center justify-between mb-3">
<p className="text-zinc-500 text-sm">Tips</p>
<button
type="button"
onClick={() => {
setTipsEnabled(!tipsEnabled);
if (tipsEnabled) setTipAmount(0);
  }}
className={`relative w-11 h-6 rounded-full transition-colors active:scale-95 cursor-pointer ${
tipsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
}`}
>
<span
className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
tipsEnabled ? 'translate-x-5' : 'translate-x-0'
}`}
/>
</button>
</div>
{/* Tip Buttons - only show when enabled */}
{tipsEnabled && (
<>
<div className="flex gap-2 flex-wrap">
{[0, 10, 15, 20].map((percent) => {
const base = cart.length > 0 ? cartTotal : customAmount;
const tipValue = percent === 0 ? 0 : base * percent / 100;
const label = percent === 0 ? 'No Tip' : `${percent}% · £${tipValue.toFixed(2)}`;
return (
<div
key={percent}
onClick={() => setTipAmount(tipValue)}
className={`flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer text-center ${
tipAmount === tipValue
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-800 text-white active:bg-zinc-700'
}`}
>
{label}
</div>
            );
          })}
<div
onClick={() => setShowCustomTipModal(true)}
className="flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer text-center bg-zinc-800 text-white active:bg-zinc-700"
>
            Custom
</div>
</div>
{tipAmount > 0 && (
<p className="text-emerald-400 text-sm mt-2 text-center">
            Tip: £{tipAmount.toFixed(2)} • Total: £{getPaymentAmount().toFixed(2)}
</p>
        )}
</>
   )}
</div>
{/* Payment Buttons */}
<div className="space-y-3">
<button
onClick={() => showQRPayment()}
disabled={getPaymentAmount() <= 0}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-xl py-6 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
>
<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>
  Pay £{getPaymentAmount().toFixed(2)}
</button>

{getPaymentAmount() > 0 && (
<button
onClick={() => setShowSendPaymentLink(true)}
className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
>
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
</svg>
    Send Payment Link
</button>
)}

{!showManualEntry && (
<button
onClick={() => setShowManualEntry(true)}
className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-800 text-zinc-400 font-medium py-3 rounded-xl transition cursor-pointer"
>
  Enter amount manually
</button>
)}
</div>
</>
        )}
{/* ============================================================= */}
{/* QR CODE STATE - Show both QR and Tap options */}
{/* ============================================================= */}
{status === 'qr' && (
<div className="flex-1 flex flex-col items-center justify-center py-8">
  {/* Total */}
  <div className="text-center mb-6">
    <p className="text-zinc-500 text-lg mb-2">Total to pay</p>
    <p className="text-6xl sm:text-7xl font-bold text-emerald-400">£{getPaymentAmount().toFixed(2)}</p>
  </div>

  {xamanQR ? (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 mb-10">
      {/* NFC Tap Zone */}
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-emerald-500/20 rounded-full flex items-center justify-center relative mb-5">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse"></div>
          <svg className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">Tap Card</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Hold NFC card<br/>to phone</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-32 bg-zinc-800"></div>
        <span className="text-zinc-600 text-lg font-medium">or</span>
        <div className="w-16 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-32 bg-zinc-800"></div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-3xl p-5 sm:p-6 mb-5 shadow-2xl shadow-sky-500/10 aspect-square flex items-center justify-center">
  <img
    src={xamanQR}
    alt="Scan with Xaman"
    className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
  />
</div>
<p className="text-2xl sm:text-3xl font-bold text-sky-400 mb-2 whitespace-nowrap">Scan QR</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Open Xaman<br/>and scan</p>
      </div>
    </div>
  ) : (
    <div className="py-16">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-zinc-400 text-xl">Creating payment request...</p>
    </div>
  )}

  <button
    onClick={() => {
      setStatus('idle');
      setXamanQR(null);
      setXamanPaymentId(null);
      if (storeId) updateCustomerDisplay(storeId, storeName, cart, getPaymentAmount(), 'idle', null, 0);
    }}
    className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-12 py-4 rounded-2xl transition active:scale-95 cursor-pointer text-lg"
  >
    Cancel
  </button>
  {/* Live Conversion Rate - Powered by CoinGecko */}
  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mt-8 w-full max-w-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <img 
src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png" 
alt="CoinGecko" 
className="h-5 w-auto object-contain"
/>
        <span className="text-xs text-zinc-500">Live rate from CoinGecko Pro</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs text-emerald-500 font-medium">LIVE</span>
      </div>
    </div>
    
    <div className="flex items-baseline justify-between">
      <span className="text-zinc-400 text-sm">Settlement amount</span>
      <div className="text-right">
        <span className="text-2xl font-bold text-white font-mono">
          {rlusdAmount ? rlusdAmount.toFixed(4) : '...'} <span className="text-emerald-400 text-lg">RLUSD</span>
        </span>
        {liveRate && (
          <p className="text-xs text-zinc-500 mt-1">
            £1 = {liveRate.toFixed(4)} RLUSD
          </p>
        )}
      </div>
    </div>
    
    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
      <svg className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <p className="text-[11px] text-zinc-500 leading-relaxed">
  <span className="text-zinc-400 font-medium">Live price.</span> Updated every 10s via CoinGecko Pro (600+ exchanges). Settlement variance &lt;0.1%.
</p>
    </div>
  </div>
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
{/* Custom Tip Modal */}
{showCustomTipModal && (
<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
<div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
<h3 className="text-lg font-bold mb-4">Custom Tip</h3>
<div className="relative mb-4">
<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">£</span>
<input
type="number"
inputMode="decimal"
step="0.01"
min="0"
placeholder="0.00"
value={customTipInput}
onChange={(e) => setCustomTipInput(e.target.value)}
className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
autoFocus
/>
</div>
<div className="flex gap-3">
<button
onClick={() => {
setShowCustomTipModal(false);
setCustomTipInput('');
          }}
className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
>
          Cancel
</button>
<button
onClick={() => {
const tip = parseFloat(customTipInput) || 0;
console.log('Setting tip to:', tip);
setTipAmount(tip);
setShowCustomTipModal(false);
setCustomTipInput('');
}}
className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition"
>
          Add Tip
</button>
</div>
</div>
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
{/* Send Payment Link Modal */}
{showSendPaymentLink && storeId && (
  <SendPaymentLink
    storeId={storeId}
    storeName={storeName}
    storeLogo={storeLogo}
    amount={getPaymentAmount()}
    items={cart.length > 0 ? cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    })) : undefined}
    onClose={() => setShowSendPaymentLink(false)}
    onSuccess={() => {
      // Optionally clear cart after sending
    }}
  />
)}
{/* Pending Payments Modal */}
{showPendingPayments && storeId && (
  <PendingPayments
    storeId={storeId}
    onClose={() => setShowPendingPayments(false)}
    onPaymentComplete={(paymentId) => {
      console.log('Payment completed:', paymentId);
    }}
  />
)}
{/* Mobile Staff Modal */}
{showStaffModal && (
<div className="fixed inset-0 bg-black/80 z-50 flex items-start sm:hidden p-4 pt-20">
    <div className="bg-zinc-900 rounded-2xl w-full max-h-[60vh] overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-bold">Select Staff</h3>
        <button onClick={() => setShowStaffModal(false)} className="text-zinc-500 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto max-h-[40vh]">
        {/* No one option */}
        <button
          onClick={() => {
            setActiveStaff(null);
            sessionStorage.removeItem('activeStaff');
            setShowStaffModal(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-4 border-b border-zinc-800 transition ${
            !activeStaff ? 'bg-zinc-800' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white">No one</p>
            <p className="text-zinc-500 text-sm">Skip staff selection</p>
          </div>
          {!activeStaff && (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Staff list - fetch inline */}
        <MobileStaffList 
          storeId={storeId!} 
          walletAddress={walletAddress!} 
          activeStaff={activeStaff}
          onSelect={(staff) => {
            setActiveStaff(staff);
            if (staff) {
              sessionStorage.setItem('activeStaff', JSON.stringify(staff));
            }
            setShowStaffModal(false);
          }}
        />
      </div>
{/* Manage Staff Link */}
<button 
onClick={() => {
  setShowStaffModal(false);
  // Small delay to ensure modal closes before navigation
  setTimeout(() => {
    router.push('/staff');
  }, 100);
}}
className="block w-full text-center text-sm text-zinc-400 hover:text-white py-4 border-t border-zinc-800 cursor-pointer"
>
  Manage Staff →
</button>
</div>
</div>
)}
</main>

{/* YAOFUS Pioneers Badge - Footer */}
<footer className="py-6 flex flex-col items-center gap-1">
  <span className="text-zinc-500 text-[10px] font-medium tracking-wider">INSTANT</span>
  <span className="text-base font-extrabold tracking-widest">
    <span className="text-emerald-500">Y</span>
    <span className="text-green-500">A</span>
    <span className="text-blue-500">O</span>
    <span className="text-indigo-500">F</span>
    <span className="text-violet-500">U</span>
    <span className="text-purple-500">S</span>
  </span>
  <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">PAYMENTS</span>
  <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
    <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
    <span>Powered by YesAllOfUs</span>
  </div>
</footer>
</div>
  );
}