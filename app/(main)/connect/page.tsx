'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Script from 'next/script';

const API_URL = 'https://api.dltpays.com/api/v1';

declare global {
  interface Window {
    crossmark?: {
      async: {
        signInAndWait: () => Promise<{ response: { data: { address: string } } }>;
      };
    };
  }
}

function ConnectContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store');
  
  const [step, setStep] = useState<'choose' | 'xaman' | 'crossmark' | 'complete'>('choose');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (!polling || !connectionId || !storeId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/xaman/poll/${connectionId}?store_id=${storeId}`);
        const data = await res.json();
        
        if ((data.status === 'signed' || data.status === 'connected') && data.wallet_address) {
          setWalletAddress(data.wallet_address);
          setPolling(false);
          setStep('complete');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling, connectionId, storeId]);

  const connectXaman = async () => {
    setStep('xaman');
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/xaman/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setXamanQR(data.qr_png);
      setConnectionId(data.connection_id);
      setPolling(true);
    } catch (err) {
      setError('Failed to connect. Please try again.');
    }
  };

  const connectCrossmark = async () => {
    setStep('crossmark');
    setError(null);
    
    if (!window.crossmark) {
  setError('Crossmark not installed. Please install the extension and refresh.');
  setStep('choose');
  return;
}

try {
  const res = await window.crossmark.async.signInAndWait();
      const address = res.response.data.address;
      
      const saveRes = await fetch(`${API_URL}/store/save-wallet-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, wallet_address: address })
      });
      
      const data = await saveRes.json();
      if (data.error) throw new Error(data.error);
      
      setWalletAddress(address);
      setStep('complete');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect Crossmark';
      setError(message);
      setStep('choose');
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Missing store ID</h1>
          <p className="text-zinc-400">Run <code className="bg-zinc-800 px-2 py-1 rounded">npx YesAllofUs</code> to get your connect link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <Script
        src="https://unpkg.com/@crossmarkio/sdk/dist/umd/index.js"
        onLoad={() => setSdkLoaded(true)}
      />
      
      <main className="max-w-xl mx-auto px-6 py-16">
        
        <a href="/" className="text-zinc-500 text-sm hover:text-white mb-8 inline-block">← Back</a>
        
        <h1 className="text-3xl font-bold mb-2">Connect your wallet</h1>
        <p className="text-zinc-400 mb-8">Store: <code className="bg-zinc-800 px-2 py-1 rounded text-sm">{storeId}</code></p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={connectXaman}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 text-left transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-zinc-800 rounded-lg px-3 py-1 text-sm">Xaman</span>
                <span className="text-zinc-500 text-sm">Mobile app</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Approve each payout manually via push notification.
              </p>
            </button>

            <button
              onClick={connectCrossmark}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 text-left transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-zinc-800 rounded-lg px-3 py-1 text-sm">Crossmark</span>
                <span className="text-zinc-500 text-sm">Browser extension</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Automatic payouts within your set limits.
              </p>
            </button>

            <p className="text-center mt-6">
              <a href="/wallet-guide" className="text-sky-500 text-sm hover:underline">
                Not sure which to choose? →
              </a>
            </p>
          </div>
        )}

        {step === 'xaman' && (
          <div className="text-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
              {xamanQR ? (
                <>
                  <p className="text-zinc-400 mb-4">Scan with Xaman app</p>
                  <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg" />
                  <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                    Waiting for signature...
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-zinc-500">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  Loading...
                </div>
              )}
            </div>
            <button
              onClick={() => setStep('choose')}
              className="text-zinc-500 text-sm hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {step === 'crossmark' && (
          <div className="text-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
              <div className="flex items-center justify-center gap-2 text-zinc-500">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                Connecting to Crossmark...
              </div>
            </div>
            <button
              onClick={() => setStep('choose')}
              className="text-zinc-500 text-sm hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 mb-6">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-xl font-bold mb-2">Wallet connected!</h2>
              <p className="text-zinc-400 text-sm mb-4">
                {walletAddress && (
                  <code className="bg-zinc-800 px-2 py-1 rounded">{walletAddress}</code>
                )}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left">
              <h3 className="font-semibold mb-4">Next steps</h3>
              <ol className="text-zinc-400 text-sm space-y-3">
                <li>1. Add RLUSD to your wallet for payouts</li>
                <li>2. Add the payout code to your checkout</li>
                <li>3. Register your first affiliate</li>
              </ol>
              <div className="mt-6 flex gap-4">
                <a href="/docs" className="text-sky-500 text-sm hover:underline">
                  View docs →
                </a>
                <a href="mailto:mark@YesAllofUs.com" className="text-sky-500 text-sm hover:underline">
                  Get help →
                </a>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">Built on XRPL · Powered by RLUSD</p>
          <div className="flex gap-6 text-zinc-600 text-sm">
            <a href="/docs" className="hover:text-white">Docs</a>
            <a href="/wallet-guide" className="hover:text-white">Security</a>
            <a href="https://x.com/YesAllofUs" className="hover:text-white">X</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    }>
      <ConnectContent />
    </Suspense>
  );
}
