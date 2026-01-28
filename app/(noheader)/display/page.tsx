'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MoveCloserAnimation from '@/components/MoveCloserAnimation';
import SoundPaySendButton from '@/components/SoundPaySendButton';
import { getIconById } from '@/lib/foodIcons';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  emoji?: string;
  icon_id?: string;
}

interface DisplayData {
  store_name: string;
  logo_url?: string;
  payment_id?: string; 
  cart: CartItem[];
  subtotal: number;
  total: number;
  status: 'idle' | 'ready' | 'processing' | 'success' | 'error' | 'qr' | 'signup' | 'split_pending' | 'link_pending' | 'soundpay';
  qr_code?: string | null;
  tip?: number;
  tips_enabled?: boolean;
  vendor_wallet?: string | null;
  last_updated: number | null;
  split_payment?: {
    parent_id: string;
    total_splits: number;
    paid_count: number;
    split_ids: string[];
    all_paid?: boolean;
  };
}
const API_URL = 'https://api.dltpays.com/nfc/api/v1';

function CustomerDisplay() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store');
  
  const [data, setData] = useState<DisplayData | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch store logo once
const [storeLogo, setStoreLogo] = useState<string | null>(null);
const [selectedTip, setSelectedTip] = useState<number>(0);
const [customTipInput, setCustomTipInput] = useState<string>('');
const [isProcessing, setIsProcessing] = useState(false);
const [showCustomTipModal, setShowCustomTipModal] = useState(false);

// NFC Payment state
const [nfcSupported, setNfcSupported] = useState(false);
const [nfcScanning, setNfcScanning] = useState(false);
const [nfcError, setNfcError] = useState<string | null>(null);
const [paymentProcessing, setPaymentProcessing] = useState(false);

// Signup form state
const [signupCardUid, setSignupCardUid] = useState<string | null>(null);
const [signupCardName, setSignupCardName] = useState('');
const [signupName, setSignupName] = useState('');
const [signupEmail, setSignupEmail] = useState('');
const [signupPhone, setSignupPhone] = useState('');
const [signupScanning, setSignupScanning] = useState(false);
const [signupSubmitting, setSignupSubmitting] = useState(false);
const [signupError, setSignupError] = useState<string | null>(null);
const [signupSuccess, setSignupSuccess] = useState(false);

// Live conversion state
const [liveRate, setLiveRate] = useState<number | null>(null);
const [rlusdAmount, setRlusdAmount] = useState<number | null>(null);

// NFC Payment refs
const nfcScanActiveRef = useRef(false);
const paymentInProgressRef = useRef(false);
const lastReadTimeRef = useRef(0);

// Sync selectedTip with data from API
useEffect(() => {
  if (data?.tip !== undefined) {
    setSelectedTip(data.tip);
  }
}, [data?.tip]);

// Send tip to API and confirm payment
const addTip = async (tipAmount: number) => {
  setSelectedTip(tipAmount);

  // L5: Await tip update and handle errors
  try {
    const res = await fetch(`${API_URL}/display/${storeId}/tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip: tipAmount })
    });
    if (!res.ok) {
      console.error('Failed to add tip:', res.status);
    }
  } catch (err) {
    console.error('Failed to add tip:', err);
  }
};

const startNFCPayment = async () => {
  // TEMP DEBUG - remove later
  
  // Guard against duplicate scans
  if (nfcScanActiveRef.current) {
    setNfcError('NFC scan already active, skipping');
    return;
  }

  if (!('NDEFReader' in window)) {
    setNfcError('NFC not supported on this device');
    return;
  }

  nfcScanActiveRef.current = true;
  setNfcScanning(true);
  setNfcError(null);

  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.scan();

    ndef.addEventListener('reading', async (event: any) => {
      // Debounce: ignore reads within 5 seconds
      const now = Date.now();
      if (now - lastReadTimeRef.current < 5000) {
        console.log('NFC read debounced');
        return;
      }
      lastReadTimeRef.current = now;

      // Prevent duplicate payment processing
      if (paymentInProgressRef.current) {
        console.log('Payment already in progress, skipping');
        return;
      }
      paymentInProgressRef.current = true;

      const uid = event.serialNumber?.replace(/:/g, '').toUpperCase();
      if (!uid) {
        setNfcError('Could not read card');
        setNfcScanning(false);
        nfcScanActiveRef.current = false;
        paymentInProgressRef.current = false;
        return;
      }

      setNfcScanning(false);
      setPaymentProcessing(true);

      try {
        // Fetch FRESH data to avoid stale closures
        const displayRes = await fetch(`${API_URL}/display/${storeId}`);
        const freshData = await displayRes.json();

        const vendorWallet = freshData.vendor_wallet;
        const totalAmount = freshData.total;
        const cartItems = freshData.cart;

        if (!vendorWallet) {
          setNfcError('Vendor wallet not available');
          setPaymentProcessing(false);
          nfcScanActiveRef.current = false;
          paymentInProgressRef.current = false;
          return;
        }

        const res = await fetch(`${API_URL}/nfc/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: uid,
            vendor_wallet: vendorWallet,
            store_id: storeId,
            amount: totalAmount,
            gbp_amount: totalAmount,
            items: cartItems,
            payment_id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
          })
        });

        const result = await res.json();

        if (result.success) {
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          // Update display to success status
          await fetch(`${API_URL}/display/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              store_id: storeId,
              store_name: freshData.store_name,
              cart: [],
              total: 0,
              status: 'success',
              tip: 0,
              vendor_wallet: vendorWallet
            })
          });
        } else {
          if (result.error === 'NO_SIGNER_AUTHORITY') {
  setNfcError('Customer wallet not set up for tap-to-pay.');
} else {
  setNfcError(result.error || 'Payment failed');
}
        }
      } catch (err) {
        setNfcError('Payment failed');
      } finally {
        setPaymentProcessing(false);
        nfcScanActiveRef.current = false;
        paymentInProgressRef.current = false;
      }
    });

    ndef.addEventListener('readingerror', () => {
      setNfcError('Error reading card');
      setNfcScanning(false);
      nfcScanActiveRef.current = false;
    });

  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      setNfcError('NFC permission denied');
    } else {
      setNfcError('Failed to start NFC');
    }
    setNfcScanning(false);
    nfcScanActiveRef.current = false;
    }
};

// Auto-start NFC scan when QR code is displayed
useEffect(() => {
  if (data?.status === 'qr' && nfcSupported && !nfcScanActiveRef.current && !paymentProcessing) {
    startNFCPayment();
  }
}, [data?.status, nfcSupported, paymentProcessing]);

// NFC Scan for signup
const startSignupNFCScan = async () => {
  setSignupError(null);

  if (!('NDEFReader' in window)) {
    setSignupError('NFC is not supported on this device. Please use Chrome on Android.');
    return;
  }

  setSignupScanning(true);

  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.scan();

    let lastReadTime = 0;
    ndef.addEventListener('reading', async ({ serialNumber }: { serialNumber: string }) => {
      // Debounce: ignore reads within 5 seconds
      const now = Date.now();
      if (now - lastReadTime < 5000) {
        console.log('NFC read debounced');
        return;
      }
      lastReadTime = now;

      const uid = serialNumber?.replace(/:/g, '').toUpperCase();
      setSignupCardUid(uid);
      setSignupScanning(false);
    });

    ndef.addEventListener('readingerror', () => {
      setSignupError('Error reading card. Please try again.');
      setSignupScanning(false);
    });

  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      setSignupError('NFC permission denied. Please allow NFC access.');
    } else if (err.name === 'NotSupportedError') {
      setSignupError('NFC is not supported on this device.');
    } else {
      setSignupError('Failed to start NFC scan. Make sure NFC is enabled.');
    }
    setSignupScanning(false);
  }
};

// Submit signup
const handleSignupSubmit = async () => {
  if (!signupCardUid) {
    setSignupError('Please tap an NFC card first');
    return;
  }

  if (!signupEmail) {
    setSignupError('Email is required');
    return;
  }

  setSignupSubmitting(true);
  setSignupError(null);

  try {
    const res = await fetch(`${API_URL}/nfc/register-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_uid: signupCardUid,
        card_name: signupCardName.trim() || null,
        store_id: storeId,
        name: signupName.trim() || null,
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone.trim() || null
      })
    });

    const result = await res.json();

    if (result.success) {
      setSignupSuccess(true);
    } else {
      setSignupError(result.error || 'Registration failed');
    }
  } catch (err) {
    setSignupError('Failed to register. Please try again.');
  }

  setSignupSubmitting(false);
};

// Reset signup form
const resetSignupForm = () => {
  setSignupCardUid(null);
  setSignupCardName('');
  setSignupName('');
  setSignupEmail('');
  setSignupPhone('');
  setSignupError(null);
  setSignupSuccess(false);
  setSignupScanning(false);
  setSignupSubmitting(false);
};

useEffect(() => {
  if (!storeId) return;
  
  // Fetch store data for logo (once)
  fetch(`${API_URL}/store/public/${storeId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.store) {
        setStoreLogo(data.store.logo_url || null);
      }
    })
    .catch(() => {});
}, [storeId]);

// Poll API for display data
useEffect(() => {
  if (!storeId) return;
  if (nfcScanning || paymentProcessing) return; // Stop polling during NFC

  const fetchDisplay = async () => {
    try {
      const res = await fetch(`${API_URL}/display/${storeId}`);
      if (!res.ok) throw new Error('Failed');
      const val = await res.json();
      console.log('Display data:', val.status, val.cart); 
      setData(val);
      setConnected(true);
      if (val.status === 'qr') {
        setIsProcessing(false);
      }
    } catch (error) {
      setConnected(false);
    }
  };

  fetchDisplay();
  const interval = setInterval(fetchDisplay, 500);
  return () => clearInterval(interval);
}, [storeId, nfcScanning, paymentProcessing]);

// Fetch live conversion rate
useEffect(() => {
  if (!data) return;
  
  const total = data.total;
  const status = data.status;
  
  const fetchRate = async () => {
    if (total <= 0) return;
    
    try {
      const res = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${total}`);
      const result = await res.json();
      if (result.success) {
        setLiveRate(result.rate.gbp_to_rlusd);
        setRlusdAmount(result.rlusd);
      }
    } catch (err) {
      console.error('Rate fetch error:', err);
    }
  };

  if (status === 'qr' || status === 'ready' || status === 'idle') {
    fetchRate();
    const interval = setInterval(fetchRate, 10000);
    return () => clearInterval(interval);
  }
}, [data]);

// Check NFC support
useEffect(() => {
  if ('NDEFReader' in window) {
    setNfcSupported(true);
  }
}, []);

// Reset payment refs when status changes to idle or success
// Reset payment refs when payment succeeds
useEffect(() => {
  if (data?.status === 'success') {
    paymentInProgressRef.current = false;
    nfcScanActiveRef.current = false;
  }
}, [data?.status]);

  // No store ID
  if (!storeId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="text-6xl sm:text-8xl mb-6 sm:mb-8">📺</div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Customer Display</h1>
          <p className="text-zinc-400 text-base sm:text-xl mb-6 sm:mb-8">Add ?store=YOUR_STORE_ID to the URL</p>
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-6 inline-block">
            <code className="text-emerald-400 text-sm sm:text-lg break-all">yesallofus.com/display?store=store_xxx</code>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for connection
  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 sm:mb-8"></div>
          <p className="text-xl sm:text-2xl text-zinc-400">Connecting to POS...</p>
          <p className="text-zinc-600 mt-4 font-mono text-sm">{storeId}</p>
        </div>
      </div>
    );
  }

  const { store_name, cart, total, status } = data;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-[100px] sm:blur-[150px] transition-colors duration-1000 ${
          status === 'success' ? 'bg-emerald-500/30' : 
          status === 'processing' ? 'bg-amber-500/20' : 
          status === 'error' ? 'bg-red-500/20' : 
          'bg-emerald-500/10'
        }`} />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-sky-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 sm:px-8 sm:py-6 flex items-center justify-between border-b border-zinc-800/50">
  <div className="flex items-center gap-3 sm:gap-4">
    {storeLogo ? (
      <img 
        src={storeLogo} 
        alt={store_name} 
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover"
      />
    ) : (
      <img 
        src="https://yesallofus.com/dltpayslogo1.png" 
        alt="YesAllOfUs" 
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl"
      />
    )}
    <div>
      <h1 className="text-xl sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">{storeLogo ? store_name : 'YesAllOfUs'}</h1>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl sm:text-5xl font-light tabular-nums">
            {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-zinc-500 text-sm sm:text-base">
            {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col px-6 py-4 sm:px-8 sm:py-6 overflow-y-auto overflow-x-hidden -mt-5">

        {/* Split Payment Tracking */}
{status === 'split_pending' && data?.split_payment && (
  <div className="flex-1 flex flex-col items-center justify-center">
    <div className="text-center mb-8">
      <p className="text-zinc-500 text-xl sm:text-2xl mb-2">Split Bill</p>
      <p className="text-6xl sm:text-8xl font-bold text-emerald-400">
        {data.split_payment.paid_count}/{data.split_payment.total_splits}
      </p>
      <p className="text-zinc-400 text-xl mt-4">payments received</p>
    </div>
    
    {/* Progress bar */}
    <div className="w-full max-w-md bg-zinc-800 rounded-full h-4 mb-8">
      <div 
        className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
        style={{ width: `${(data.split_payment.paid_count / data.split_payment.total_splits) * 100}%` }}
      />
    </div>
    
    <p className="text-zinc-500">
      £{total.toFixed(2)} total
    </p>
  </div>
)}
        
        {/* Success State */}
        {status === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 sm:mb-10">
              <svg className="w-20 h-20 sm:w-28 sm:h-28 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-4xl sm:text-7xl font-bold text-emerald-400 mb-3 sm:mb-4 text-center">Payment Complete</p>
            <p className="text-2xl sm:text-4xl text-zinc-400">Thank you!</p>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 sm:w-40 sm:h-40 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-8 sm:mb-10"></div>
            <p className="text-3xl sm:text-6xl font-bold text-amber-400 mb-3 sm:mb-4">Processing...</p>
            <p className="text-6xl sm:text-9xl font-bold mt-4 sm:mt-6">£{total.toFixed(2)}</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 bg-red-500/20 rounded-full flex items-center justify-center mb-8 sm:mb-10">
              <svg className="w-20 h-20 sm:w-28 sm:h-28 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-3xl sm:text-6xl font-bold text-red-400 text-center">Payment Failed</p>
            <p className="text-xl sm:text-3xl text-zinc-500 mt-3 sm:mt-4">Please try again</p>
          </div>
        )}

        {/* Idle State - Show Cart */}
{status === 'idle' && (
  <>
    {cart && cart.length > 0 ? (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Items */}
        <div className="flex-shrink-0 overflow-y-auto max-h-[35vh] mb-6">
          <div className="space-y-3 sm:space-y-4">
            {cart.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-4 px-5 sm:py-5 sm:px-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <span className="text-3xl sm:text-5xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
  {item.icon_id && getIconById(item.icon_id) ? (
    <span className="w-full h-full" dangerouslySetInnerHTML={{ __html: getIconById(item.icon_id)!.svg }} />
  ) : (item.emoji || '📦')}
</span>
                  <div>
                    <p className="text-xl sm:text-3xl font-semibold">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-zinc-500 text-lg sm:text-xl">
                        {item.quantity} × £{item.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-2xl sm:text-4xl font-bold">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Section - Customer adds tip */}
        {data?.tips_enabled && (
        <div className="border-t border-zinc-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <p className="text-zinc-400 text-center text-lg sm:text-2xl mb-4 sm:mb-6">Add a tip?</p>
          
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            {[0, 10, 15, 20].map((percent) => {
              const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const tipValue = percent === 0 ? 0 : subtotal * percent / 100;
              const label = percent === 0 ? 'No Tip' : `${percent}% · £${tipValue.toFixed(2)}`;
              
              return (
                <div
                  key={percent}
                  onClick={() => addTip(tipValue)}
                  className={`px-5 sm:px-8 py-4 sm:py-5 rounded-2xl text-lg sm:text-2xl font-semibold cursor-pointer select-none active:scale-95 transition ${
                    selectedTip === tipValue
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
              className="px-5 sm:px-8 py-4 sm:py-5 rounded-2xl text-lg sm:text-2xl font-semibold cursor-pointer select-none bg-zinc-800 text-white active:bg-zinc-700 active:scale-95 transition"
            >
              Custom
            </div>
          </div>
          
          {/* Show tip if added */}
          {selectedTip > 0 && (
            <div className="mt-5 text-center">
              <p className="text-emerald-400 text-2xl sm:text-3xl font-semibold">
                Tip: £{selectedTip.toFixed(2)}
              </p>
            </div>
          )}
          
          {/* Confirm Payment Button */}
          <button
  onClick={() => {
    setIsProcessing(true);
    fetch(`${API_URL}/display/${storeId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('Failed to confirm:', err));
  }}
  disabled={isProcessing}
  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold text-xl sm:text-2xl py-5 sm:py-6 rounded-2xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-3"
>
  {isProcessing ? (
    <>
      <div className="w-7 h-7 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
      Processing...
    </>
  ) : (
    <>Pay £{total.toFixed(2)}</>
  )}
</button>
        </div>
        )}
        
        {/* Total */}
<div className="border-t border-zinc-800 pt-6 sm:pt-8 flex-shrink-0">
  <div className="flex items-end justify-between">
    <div>
      <p className="text-zinc-500 text-xl sm:text-2xl mb-1">Total</p>
      <p className="text-zinc-600 text-base sm:text-lg">
        {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        {selectedTip > 0 && ` + tip`}
      </p>
    </div>
    <p className="text-5xl sm:text-8xl font-bold tracking-tight text-emerald-400">
      £{total.toFixed(2)}
    </p>
          </div>
        </div>
      </div>
    ) : (
      /* Empty State */
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-zinc-800 mb-8 sm:mb-10">
          <svg className="w-32 h-32 sm:w-56 sm:h-56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-5xl text-zinc-700 font-light text-center">Ready for your order</p>
      </div>
    )}
  </>
)}

{/* Payment Link Pending - Waiting for remote payment */}
{status === 'link_pending' && (
  <div className="flex-1 flex flex-col items-center justify-center">
    {/* YAOFUS Badge */}
    <div className="mb-8">
      <svg viewBox="0 0 140 52" className="w-48 h-20">
        <text x="70" y="14" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="10" letterSpacing="1">
          PARTNER
        </text>
        <text x="70" y="32" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="16" letterSpacing="3">
          <tspan fill="#10b981">Y</tspan>
          <tspan fill="#22c55e">A</tspan>
          <tspan fill="#3b82f6">O</tspan>
          <tspan fill="#6366f1">F</tspan>
          <tspan fill="#8b5cf6">U</tspan>
          <tspan fill="#a855f7">S</tspan>
        </text>
        <text x="70" y="47" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="10" letterSpacing="1.5">
          DISPLAY
        </text>
      </svg>
    </div>

    {/* Amount */}
    <p className="text-7xl sm:text-[10rem] font-bold text-emerald-400 mb-4">£{total.toFixed(2)}</p>
    
    {/* Waiting indicator */}
    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
      <p className="text-zinc-400 text-2xl sm:text-3xl">Waiting for payment...</p>
    </div>
    
    {/* Store name */}
    <p className="text-zinc-600 text-lg">{data?.store_name}</p>
  </div>
)}

{/* Ready State - Payment Instructions */}
{status === 'ready' && (
  <div className="flex-1 flex flex-col">
    {/* Total at top */}
    <div className="text-center mb-8 sm:mb-12">
      <p className="text-zinc-500 text-xl sm:text-3xl mb-2">Total to pay</p>
      <p className="text-5xl sm:text-7xl font-bold text-emerald-400">£{(total ?? 0).toFixed(2)}</p>
    </div>

    {/* Payment Options */}
    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
      
      {/* NFC Tap Zone */}
      <button 
        onClick={startNFCPayment}
        disabled={nfcScanning || paymentProcessing}
        className="flex flex-col items-center cursor-pointer"
      >
        <div className="w-40 h-40 sm:w-56 sm:h-56 bg-emerald-500/20 rounded-full flex items-center justify-center relative mb-5 sm:mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse"></div>
          <svg className="w-20 h-20 sm:w-28 sm:h-28 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className={`text-2xl sm:text-3xl font-bold mb-2 ${nfcScanning ? 'text-amber-400' : 'text-emerald-400'}`}>
          {paymentProcessing ? 'Processing...' : nfcScanning ? 'Tap Now...' : 'Tap Card'}
        </p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">
          {nfcScanning ? 'Hold your card to this device' : 'Tap here, then hold your NFC card'}
        </p>
        {nfcError && (
          <p className="text-red-400 text-sm mt-2">{nfcError}</p>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
        <span className="text-zinc-600 text-xl sm:text-2xl font-medium">or</span>
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
      </div>

      {/* QR/Wallet Scan */}
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 sm:w-56 sm:h-56 bg-sky-500/20 rounded-3xl flex items-center justify-center relative mb-5 sm:mb-8">
          <div className="absolute inset-0 bg-sky-500/10 rounded-3xl animate-pulse"></div>
          <svg className="w-20 h-20 sm:w-28 sm:h-28 text-sky-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-4xl font-bold text-sky-400 mb-2">Scan QR</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Open Xaman wallet<br/>and scan code</p>
      </div>

    </div>

    {/* Items summary (collapsed) */}
    {cart && cart.length > 0 && (
      <div className="mt-8 sm:mt-10 pt-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-center text-base sm:text-lg">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} items: {cart.map(item => item.name).join(', ')}
        </p>
      </div>
    )}
  </div>
)}
{/* QR Code State - Show both QR and Tap options */}
{status === 'qr' && (
  <div className="flex-1 flex flex-col">
    {/* Total at top */}
    <div className="text-center mb-8 sm:mb-12">
      <p className="text-zinc-500 text-xl sm:text-3xl mb-2">Total to pay</p>
      <p className="text-5xl sm:text-7xl font-bold text-emerald-400">£{(total ?? 0).toFixed(2)}</p>
    </div>

    {/* Payment Options */}
    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
      
      {/* NFC Tap Zone */}
      <button 
        onClick={startNFCPayment}
        disabled={nfcScanning || paymentProcessing}
        className="flex flex-col items-center cursor-pointer"
      >
        <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center relative mb-5 ${
          nfcScanning ? 'bg-amber-500/30' : paymentProcessing ? 'bg-emerald-500/40' : 'bg-emerald-500/20'
        }`}>
          {!nfcScanning && !paymentProcessing && (
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
          )}
          {nfcScanning && (
            <div className="absolute inset-0 bg-amber-500/30 rounded-full animate-pulse"></div>
          )}
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse"></div>
          {paymentProcessing ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className={`w-20 h-20 sm:w-28 sm:h-28 relative z-10 ${nfcScanning ? 'text-amber-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )}
        </div>
        <p className={`text-2xl sm:text-3xl font-bold mb-2 ${nfcScanning ? 'text-amber-400' : 'text-emerald-400'}`}>
          {paymentProcessing ? 'Processing...' : nfcScanning ? 'Tap Now...' : 'Tap Card'}
        </p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">
          {nfcScanning ? 'Hold your card to this device' : 'Tap here, then hold your NFC card'}
        </p>
        {nfcError && (
          <p className="text-red-400 text-sm mt-2">{nfcError}</p>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
        <span className="text-zinc-600 text-xl sm:text-2xl font-medium">or</span>
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        {data?.qr_code ? (
          <div className="bg-white rounded-3xl p-5 sm:p-8 mb-5 sm:mb-8">
            <img 
              src={data.qr_code} 
              alt="Scan to pay" 
              className="w-40 h-40 sm:w-56 sm:h-56"
            />
          </div>
        ) : (
          <div className="w-40 h-40 sm:w-56 sm:h-56 bg-zinc-800 rounded-3xl animate-pulse mb-5 sm:mb-8"></div>
        )}
        <p className="text-2xl sm:text-4xl font-bold text-sky-400 mb-2">Scan QR</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Open Xaman wallet<br/>and scan code</p>
      </div>

    </div>

    {/* Items summary */}
    {cart && cart.length > 0 && (
      <div className="mt-8 sm:mt-10 pt-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-center text-base sm:text-lg">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} items: {cart.map(item => item.name).join(', ')}
        </p>
      </div>
    )}
  </div>
)}
{/* SoundPay State - Show animation and Tap options */}
{status === 'soundpay' && (
  <div className="flex-1 flex flex-col">
    {/* Total at top */}
    <div className="text-center mb-8 sm:mb-12">
      <p className="text-zinc-500 text-xl sm:text-3xl mb-2">Total to pay</p>
      <p className="text-5xl sm:text-7xl font-bold text-emerald-400">£{(total ?? 0).toFixed(2)}</p>
    </div>

    {/* Payment Options */}
    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
      
      {/* SoundPay Send Button - Left Side */}
<SoundPaySendButton
  paymentId={data?.payment_id || ''}
  storeId={storeId || ''}
  onSuccess={(txHash, receiptId) => {
    fetch(`${API_URL}/display/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        store_name: data?.store_name,
        cart: [],
        total: 0,
        status: 'success',
        tip: 0,
        vendor_wallet: data?.vendor_wallet,
      }),
    });
  }}
  onError={(error) => console.error('SoundPay error:', error)}
/>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
        <span className="text-zinc-600 text-xl sm:text-2xl font-medium">or</span>
        <div className="w-20 sm:w-28 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-40 bg-zinc-800"></div>
      </div>

      {/* NFC Tap Zone - Right Side */}
      <button 
        onClick={startNFCPayment}
        disabled={nfcScanning || paymentProcessing}
        className="flex flex-col items-center cursor-pointer"
      >
        <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center relative mb-5 ${
          nfcScanning ? 'bg-amber-500/30' : paymentProcessing ? 'bg-emerald-500/40' : 'bg-emerald-500/20'
        }`}>
          {!nfcScanning && !paymentProcessing && (
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
          )}
          {nfcScanning && (
            <div className="absolute inset-0 bg-amber-500/30 rounded-full animate-pulse"></div>
          )}
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse"></div>
          {paymentProcessing ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className={`w-20 h-20 sm:w-28 sm:h-28 relative z-10 ${nfcScanning ? 'text-amber-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )}
        </div>
        <p className={`text-2xl sm:text-3xl font-bold mb-2 ${nfcScanning ? 'text-amber-400' : 'text-emerald-400'}`}>
          {paymentProcessing ? 'Processing...' : nfcScanning ? 'Tap Now...' : 'Tap Card'}
        </p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">
          {nfcScanning ? 'Hold your card to this device' : 'Tap here, then hold your NFC card'}
        </p>
        {nfcError && (
          <p className="text-red-400 text-sm mt-2">{nfcError}</p>
        )}
      </button>

    </div>

    {/* Items summary */}
    {cart && cart.length > 0 && (
      <div className="mt-8 sm:mt-10 pt-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-center text-base sm:text-lg">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} items: {cart.map(item => item.name).join(', ')}
        </p>
      </div>
    )}
  </div>
)}
{/* Custom Tip Modal */}
{showCustomTipModal && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md">
      <h3 className="text-xl sm:text-2xl font-bold mb-5">Custom Tip</h3>
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl sm:text-2xl">£</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={customTipInput}
          onChange={(e) => setCustomTipInput(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-4 text-xl sm:text-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowCustomTipModal(false);
            setCustomTipInput('');
          }}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-xl text-lg sm:text-xl transition active:scale-95 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            const tip = parseFloat(customTipInput) || 0;
            addTip(tip);
            setShowCustomTipModal(false);
            setCustomTipInput('');
          }}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl text-lg sm:text-xl transition active:scale-95 cursor-pointer"
        >
          Add Tip
        </button>
      </div>
    </div>
  </div>
)}

{/* Signup Customer State */}
{status === 'signup' && (
  <div className="flex-1 flex flex-col items-center justify-center p-4">
    <div className="max-w-xl w-full text-center">
      
      {/* Sparkle Icon */}
      <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-full blur-xl"></div>
        <div className="relative bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-full p-6 sm:p-8 border border-emerald-500/20">
          <svg className="w-14 h-14 sm:w-18 sm:h-18 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5L12 8z" />
          </svg>
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
        Welcome to {store_name}
      </h1>
      <p className="text-zinc-400 text-lg sm:text-xl mb-12 max-w-md mx-auto">
        Join our rewards program and start earning on every purchase
      </p>

      {/* Card Tap Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-10 backdrop-blur">
        <div className="flex flex-col items-center gap-6">
          
          {/* NFC Animation */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-3 bg-emerald-500/15 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-2xl sm:text-3xl font-semibold text-white mb-2">
              Tap Your Card
            </p>
            <p className="text-zinc-500 text-base sm:text-lg">
              Staff will complete your registration
            </p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-8 mt-10 text-zinc-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm">Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm">Instant</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm">Protected</span>
        </div>
      </div>

    </div>
  </div>
)}
      </main>
{/* Live Conversion Widget - Show in payment states */}
{(status === 'qr' || status === 'ready' || (status === 'idle' && cart && cart.length > 0)) && liveRate && (
  <div className="relative z-10 px-6 sm:px-8 pb-4">
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 max-w-md mx-auto">
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
            {rlusdAmount?.toFixed(4)} <span className="text-emerald-400 text-lg">RLUSD</span>
          </span>
          <p className="text-xs text-zinc-500 mt-1">
            £1 = {liveRate?.toFixed(4)} RLUSD
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-zinc-800">
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          <span className="text-zinc-400 font-medium">Live price.</span> Updated every 10s via CoinGecko Pro (600+ exchanges). Settlement variance &lt;0.1%.
        </p>
      </div>
    </div>
  </div>
)}
      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 sm:px-8 sm:py-5 border-t border-zinc-800/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
              <img 
    src={data.logo_url || "https://yesallofus.com/dltpayslogo1.png"} 
    alt="Logo" 
    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover"
  />
            <span className="text-zinc-600 text-sm sm:text-base">Powered by YesAllOfUs</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm sm:text-base">Secure payments on XRPL</span>
          </div>
        </div>
        {/* Discreet back to POS link */}
        <div className="mt-4 flex justify-center">
          <a 
            href="/take-payment" 
            className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-500 transition text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to POS</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CustomerDisplay />
    </Suspense>
  );
}