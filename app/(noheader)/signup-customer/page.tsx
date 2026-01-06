'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';

const API_URL = 'https://api.dltpays.com/api/v1';
const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

function SignupCustomerPage() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store');

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [cardUid, setCardUid] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load store info
  useEffect(() => {
    if (!storeId) {
      setError('No store specified');
      setLoading(false);
      return;
    }

    fetch(`${NFC_API_URL}/store/public/${storeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.store) {
          setStore(data.store);
        } else {
          setError('Store not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load store');
        setLoading(false);
      });
  }, [storeId]);

  // NFC Scan
  const startNFCScan = async () => {
    setError(null);

    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device. Please use Chrome on Android.');
      return;
    }

    setScanning(true);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', async (event: any) => {
        const serialNumber = event.serialNumber;
        
        if (!serialNumber) {
          setError('Could not read card. Please try again.');
          setScanning(false);
          return;
        }

        // Format card UID (remove colons, uppercase)
        const uid = serialNumber.replace(/:/g, '').toUpperCase();
        setCardUid(uid);
        setScanning(false);
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading card. Please try again.');
        setScanning(false);
      });

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('NFC permission denied. Please allow NFC access.');
      } else if (err.name === 'NotSupportedError') {
        setError('NFC is not supported on this device.');
      } else {
        setError('Failed to start NFC scan. Make sure NFC is enabled.');
      }
      setScanning(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardUid) {
      setError('Please tap an NFC card first');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/register-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_uid: cardUid,
          card_name: cardName.trim() || null,
          store_id: storeId,
          name: name.trim() || null,
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null
        })
      });

      const data = await res.json();

      if (data.success) {
  setSuccess(true);
  
  // Reset display to idle after 5 seconds
  setTimeout(async () => {
    try {
      await fetch(`${NFC_API_URL}/display/${storeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'idle' })
      });
    } catch (err) {
      console.error('Failed to reset display:', err);
    }
  }, 5000);
} else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
    }

    setSubmitting(false);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error - no store
  if (!store) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">Store Not Found</h1>
          <p className="text-zinc-400">{error || 'Invalid store link'}</p>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
  {store.logo_url ? (
    <img 
      src={store.logo_url} 
      alt={store.store_name} 
      className="w-20 h-20 rounded-2xl object-cover mx-auto"
    />
  ) : (
    <div className="flex justify-center">
      <Logo size={80} />
    </div>
  )}
</div>
          <h1 className="text-2xl font-bold mb-2">Welcome to {store.store_name}!</h1>
          <p className="text-zinc-400 mb-6">
            Your card is now linked. Check your email for next steps.
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left">
            <p className="text-zinc-300 text-sm mb-4">
              <strong className="text-white">{store.store_name}</strong> has signed you up!
            </p>
            {cardName && (
              <p className="text-zinc-400 text-sm mb-2">
                Card: <span className="text-white">{cardName}</span>
              </p>
            )}
            <p className="text-zinc-400 text-sm">
              You'll receive a welcome email with a link to set up your member dashboard where you can earn rewards on every purchase.
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setCardUid(null);
              setCardName('');
              setName('');
              setEmail('');
              setPhone('');
            }}
            className="mt-6 text-zinc-500 hover:text-white text-sm transition"
          >
            Register another customer
          </button>
          {/* Powered by */}
<div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2">
  <Logo size={20} />
  <span className="text-zinc-500 text-sm">Powered by YesAllOfUs</span>
</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/dashboard" 
              className="text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Dashboard</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm">{store.store_name}</span>
            {store.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={store.store_name} 
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <Logo size={32} />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">New Member Sign Up</h1>
        <p className="text-zinc-400 mb-8">
          Register a new customer to earn rewards with {store.store_name}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: NFC Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${cardUid ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-white'}`}>
              {cardUid ? '✓' : '1'}
            </div>
            <h2 className="font-semibold">Tap NFC Card</h2>
          </div>

          {cardUid ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-xl">💳</span>
                  <div>
                    <p className="text-emerald-400 font-medium">Card Detected</p>
                    <p className="text-zinc-500 text-sm font-mono">
                      {cardUid.slice(0, 4)}...{cardUid.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCardUid(null);
                    setCardName('');
                  }}
                  className="text-zinc-400 hover:text-white text-sm transition"
                >
                  Change
                </button>
              </div>
              
              {/* Card Name Input */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Card Name <span className="text-zinc-600">(optional)</span></label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g., Puffin Bus Card, Gym Card"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                />
                <p className="text-zinc-600 text-xs mt-1">Help the customer identify this card later</p>
              </div>
            </div>
          ) : scanning ? (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-blue-500/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">💳</span>
                </div>
              </div>
              <p className="text-blue-400 font-medium mb-2">Ready to scan</p>
              <p className="text-zinc-400 text-sm mb-4">Hold the NFC card near your phone</p>
              <button
                onClick={() => setScanning(false)}
                className="text-zinc-500 hover:text-white text-sm transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startNFCScan}
              className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span>📱</span>
              Tap Card to Scan
            </button>
          )}
        </div>

        {/* Step 2: Customer Info */}
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${cardUid ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                2
              </div>
              <h2 className="font-semibold">Customer Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-2">Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!cardUid || !email || submitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
              cardUid && email && !submitting
                ? 'bg-white hover:bg-zinc-100 text-black'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                Registering...
              </>
            ) : (
              <>
                <span>✓</span>
                Register Member
              </>
            )}
          </button>
        </form>

        <p className="text-zinc-600 text-xs text-center mt-6">
          Customer will receive a welcome email with instructions to complete their account setup.
        </p>
      </main>
    </div>
  );
}

export default function SignupCustomerPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignupCustomerPage />
    </Suspense>
  );
}