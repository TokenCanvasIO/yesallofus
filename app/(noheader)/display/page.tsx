'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  emoji?: string;
}

interface DisplayData {
  store_name: string;
  logo_url?: string; 
  cart: CartItem[];
  total: number;
  status: 'idle' | 'ready' | 'processing' | 'success' | 'error';
  last_updated: number | null;
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

  // Poll API for display data
  useEffect(() => {
    if (!storeId) return;

    const fetchDisplay = async () => {
  try {
    const res = await fetch(`${API_URL}/display/${storeId}`);
    if (!res.ok) throw new Error('Failed');
    const val = await res.json();
    setData(val);
    setConnected(true);
  } catch (error) {
    // Don't spam console on localhost
    setConnected(false);
  }
};

    fetchDisplay();
    const interval = setInterval(fetchDisplay, 500);
    return () => clearInterval(interval);
  }, [storeId]);

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
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-[100px] sm:blur-[150px] transition-colors duration-1000 ${
          status === 'success' ? 'bg-emerald-500/30' : 
          status === 'processing' ? 'bg-amber-500/20' : 
          status === 'error' ? 'bg-red-500/20' : 
          'bg-emerald-500/10'
        }`} />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-sky-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src="https://yesallofus.com/dltpayslogo1.png" 
            alt="Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
          />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold truncate max-w-[150px] sm:max-w-none">{store_name}</h1>
            <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl sm:text-4xl font-light tabular-nums">
            {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-zinc-500 text-xs sm:text-base hidden sm:block">
            {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col p-4 sm:p-8">
        
        {/* Success State */}
        {status === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 sm:w-40 sm:h-40 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 sm:mb-8">
              <svg className="w-14 h-14 sm:w-24 sm:h-24 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl sm:text-6xl font-bold text-emerald-400 mb-2 sm:mb-4 text-center">Payment Complete</p>
            <p className="text-xl sm:text-3xl text-zinc-400">Thank you!</p>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6 sm:mb-8"></div>
            <p className="text-2xl sm:text-5xl font-bold text-amber-400 mb-2 sm:mb-4">Processing...</p>
            <p className="text-5xl sm:text-8xl font-bold mt-2 sm:mt-4">£{total.toFixed(2)}</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 sm:w-40 sm:h-40 bg-red-500/20 rounded-full flex items-center justify-center mb-6 sm:mb-8">
              <svg className="w-14 h-14 sm:w-24 sm:h-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-2xl sm:text-5xl font-bold text-red-400 text-center">Payment Failed</p>
            <p className="text-lg sm:text-2xl text-zinc-500 mt-2 sm:mt-4">Please try again</p>
          </div>
        )}

        {/* Idle State - Show Cart */}
{status === 'idle' && (
  <>
    {cart && cart.length > 0 ? (
      <div className="flex-1 flex flex-col">
        {/* Items */}
        <div className="flex-1 overflow-y-auto mb-4 sm:mb-8">
          <div className="space-y-2 sm:space-y-4">
            {cart.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-zinc-800/50"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-4xl">{item.emoji || '📦'}</span>
                  <div>
                    <p className="text-base sm:text-2xl font-semibold">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-zinc-500 text-sm sm:text-lg">
                        {item.quantity} × £{item.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-lg sm:text-3xl font-bold">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-zinc-800 pt-4 sm:pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-zinc-500 text-lg sm:text-2xl mb-1 sm:mb-2">Total</p>
              <p className="text-zinc-600 text-sm sm:text-lg">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </p>
            </div>
            <p className="text-5xl sm:text-9xl font-bold tracking-tight">
              £{total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    ) : (
      /* Empty State */
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-zinc-800 mb-6 sm:mb-8">
          <svg className="w-24 h-24 sm:w-48 sm:h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-xl sm:text-4xl text-zinc-700 font-light text-center">Ready for your order</p>
      </div>
    )}
  </>
)}

{/* Ready State - Payment Instructions */}
{status === 'ready' && (
  <div className="flex-1 flex flex-col">
    {/* Total at top */}
    <div className="text-center mb-6 sm:mb-10">
      <p className="text-zinc-500 text-lg sm:text-2xl mb-2">Total to pay</p>
      <p className="text-6xl sm:text-9xl font-bold text-emerald-400">£{total.toFixed(2)}</p>
    </div>

    {/* Payment Options */}
    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
      
      {/* NFC Tap Zone */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/20 rounded-full flex items-center justify-center relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse"></div>
          <svg className="w-16 h-16 sm:w-24 sm:h-24 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className="text-xl sm:text-3xl font-bold text-emerald-400 mb-2">Tap Card</p>
        <p className="text-zinc-500 text-sm sm:text-lg text-center">Hold your NFC card<br/>to the terminal</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="w-16 sm:w-24 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-32 bg-zinc-800"></div>
        <span className="text-zinc-600 text-lg sm:text-xl font-medium">or</span>
        <div className="w-16 sm:w-24 h-px bg-zinc-800 sm:hidden"></div>
        <div className="hidden sm:block w-px h-32 bg-zinc-800"></div>
      </div>

      {/* QR/Wallet Scan */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-sky-500/20 rounded-3xl flex items-center justify-center relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-sky-500/10 rounded-3xl animate-pulse"></div>
          <svg className="w-16 h-16 sm:w-24 sm:h-24 text-sky-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-xl sm:text-3xl font-bold text-sky-400 mb-2">Scan QR</p>
        <p className="text-zinc-500 text-sm sm:text-lg text-center">Open Xaman wallet<br/>and scan code</p>
      </div>

    </div>

    {/* Items summary (collapsed) */}
    {cart && cart.length > 0 && (
      <div className="mt-6 sm:mt-8 pt-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-center text-sm sm:text-base">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} items: {cart.map(item => item.name).join(', ')}
        </p>
      </div>
    )}
  </div>
)}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-3 sm:p-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
            <img 
  src={data.logo_url || "https://yesallofus.com/dltpayslogo1.png"} 
  alt="Logo" 
  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover"
/>
          <span className="text-zinc-600 text-xs sm:text-base">Powered by YesAllOfUs</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs sm:text-base">Secure payments on XRPL</span>
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