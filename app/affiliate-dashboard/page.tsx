'use client';

import { useState, useEffect, useRef } from 'react';
import PayoutsTable from '@/components/PayoutsTable';
import { loginWithWeb3Auth } from '@/lib/web3auth';

interface Store {
  store_id: string;
  store_name: string;
  store_url: string;
  referral_code: string;
  referral_link: string;
  total_earned: number;
  level: number;
}

interface Payout {
  store_name: string;
  order_id: string;
  amount: number;
  currency: string;
  tx_hash: string;
  paid_at: string;
}

interface DashboardData {
  wallet: string;
  total_earned: number;
  stores: Store[];
  recent_payouts: Payout[];
}

export default function AffiliateDashboard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const registeringRef = useRef(false);

  useEffect(() => {
    checkWalletConnection();
    
    // Poll for wallet connection
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem('walletAddress');
      if (stored && stored !== walletAddress) {
        setWalletAddress(stored);
        fetchDashboard(stored);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    const stored = sessionStorage.getItem('walletAddress');
    if (stored) {
      setWalletAddress(stored);
      await fetchDashboard(stored);
    } else {
      setLoading(false);
    }
  };

  const fetchDashboard = async (wallet: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`https://api.dltpays.com/api/v1/affiliate/dashboard/${wallet}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No affiliate account found for this wallet. Join a YesAllofUs store affiliate program to get started.');
        } else {
          setError(data.error || 'Failed to load dashboard');
        }
        setDashboardData(null);
        return;
      }
      
      setDashboardData(data);
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (referralLink: string, code: string) => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('connectedWallet');
    setWalletAddress('');
    setDashboardData(null);
    setError('');
    setLoading(false);
  };

  const [connecting, setConnecting] = useState<'none' | 'xaman' | 'crossmark'>('none');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);

  // Poll for Xaman login
  useEffect(() => {
    if (!loginId || connecting !== 'xaman') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.dltpays.com/api/v1/xaman/login/poll/${loginId}`);
        const data = await res.json();
        
        if (data.status === 'signed' && data.wallet_address) {
          // Check for store signup FIRST, before anything else
          const params = new URLSearchParams(window.location.search);
          const storeId = params.get('store');
          
          if (storeId) {
            const parentRef = params.get('ref') || '';
            await fetch('https://api.dltpays.com/api/v1/affiliate/register-public', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                store_id: storeId, 
                wallet: data.wallet_address,
                parent_referral_code: parentRef
              })
            });
            window.history.replaceState({}, '', window.location.pathname);
            await new Promise(r => setTimeout(r, 500));
          }
          
          sessionStorage.setItem('walletAddress', data.wallet_address);
          setWalletAddress(data.wallet_address);
          setConnecting('none');
          setXamanQR(null);
          setLoginId(null);
          await fetchDashboard(data.wallet_address);
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          setError(data.status === 'expired' ? 'QR code expired. Please try again.' : 'Login cancelled.');
          setConnecting('none');
          setXamanQR(null);
          setLoginId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loginId, connecting]);

  const connectXaman = async () => {
    setConnecting('xaman');
    setError('');
    
    try {
      const res = await fetch('https://api.dltpays.com/api/v1/xaman/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setConnecting('none');
        return;
      }
      
      setXamanQR(data.qr_png);
      setXamanDeepLink(data.deep_link);
      setLoginId(data.login_id);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setConnecting('none');
    }
  };

  const connectCrossmark = async () => {
    setConnecting('crossmark');
    setError('');
    
    try {
      const crossmark = (window as any).crossmark;
      if (!crossmark) {
        setError('Crossmark not installed. Please install the browser extension.');
        setConnecting('none');
        return;
      }
      
      const res = await crossmark.async.signInAndWait();
      const address = res.response.data.address;
      
      // Register FIRST if coming from store link
      const params = new URLSearchParams(window.location.search);
      const storeId = params.get('store');
      
      if (storeId) {
        const parentRef = params.get('ref') || '';
        await fetch('https://api.dltpays.com/api/v1/affiliate/register-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            store_id: storeId, 
            wallet: address,
            parent_referral_code: parentRef
          })
        });
        window.history.replaceState({}, '', window.location.pathname);
        await new Promise(r => setTimeout(r, 500));
      }
      
      sessionStorage.setItem('walletAddress', address);
      setWalletAddress(address);
      await fetchDashboard(address);
    } catch (err) {
      setError('Failed to connect Crossmark. Please try again.');
    }
    setConnecting('none');
  };

  const connectGoogle = async () => {
    setConnecting('xaman'); // reuse loading state
    setError('');
    
    try {
      const address = await loginWithWeb3Auth();
      
      if (!address) {
        setError('Login cancelled');
        setConnecting('none');
        return;
      }
      
      // Check for store signup
      const params = new URLSearchParams(window.location.search);
      const storeId = params.get('store');
      
      if (storeId) {
        const parentRef = params.get('ref') || '';
        await fetch('https://api.dltpays.com/api/v1/affiliate/register-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            store_id: storeId, 
            wallet: address,
            parent_referral_code: parentRef
          })
        });
        window.history.replaceState({}, '', window.location.pathname);
        await new Promise(r => setTimeout(r, 500));
      }
      
      sessionStorage.setItem('walletAddress', address);
      setWalletAddress(address);
      await fetchDashboard(address);
    } catch (err) {
      console.error('Web3Auth error:', err);
      setError('Failed to connect. Please try again.');
    }
    setConnecting('none');
  };

  const cancelXamanLogin = () => {
    setConnecting('none');
    setXamanQR(null);
    setXamanDeepLink(null);
    setLoginId(null);
  };

  // Not connected
  if (!walletAddress && !loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
        <script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />
        
        <main className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Affiliate Dashboard</h1>
            <p className="text-zinc-400 mb-8">Connect your wallet to view your earnings</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {/* Xaman QR Code Display */}
            {connecting === 'xaman' && xamanQR && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto mb-6">
                <p className="text-zinc-300 mb-4">Scan with Xaman app</p>
                <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg" />
                <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  Waiting for signature...
                </div>
                <a 
                  href={xamanDeepLink || '#'} 
                  className="text-sky-400 text-sm hover:underline block mb-4"
                >
                  Open in Xaman app →
                </a>
                <button
                  onClick={cancelXamanLogin}
                  className="text-zinc-500 text-sm hover:text-white"
                >
                  ← Back
                </button>
              </div>
            )}
            
            {/* Wallet Selection */}
            {connecting === 'none' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-zinc-300 mb-6">
                  Connect the wallet you registered as an affiliate to see your commissions across all stores.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={connectXaman}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 px-6 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold">Xaman</div>
                        <div className="text-zinc-400 text-sm">Mobile wallet</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={connectCrossmark}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 px-6 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold">Crossmark</div>
                        <div className="text-zinc-400 text-sm">Browser extension</div>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-zinc-900 px-4 text-zinc-500">or continue with</span>
                  </div>
                </div>

                <button
                  onClick={connectGoogle}
                  disabled={connecting !== 'none'}
                  className="w-full bg-white hover:bg-zinc-100 text-black py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="text-zinc-500 text-xs mt-6">
                  Don&apos;t have a wallet? Get <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Xaman</a> or <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Crossmark</a>
                </p>
              </div>
            )}
            
            {/* Crossmark connecting state */}
            {connecting === 'crossmark' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-zinc-400">
                  <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Crossmark...</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <main className="max-w-4xl mx-auto px-6 py-10 mt-10">
        {/* Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
              <p className="text-zinc-400">Track your earnings across all stores</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm">
                <span className="text-zinc-400">Wallet: </span>
                <span className="text-white font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && (
          <>
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Total Earned</p>
                  <p className="text-4xl font-bold">${dashboardData.total_earned.toFixed(2)}</p>
                  <p className="text-zinc-400 text-sm mt-1">RLUSD</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm mb-1">Active Stores</p>
                  <p className="text-2xl font-bold">{dashboardData.stores.length}</p>
                </div>
              </div>
            </div>

            {/* Stores */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Your Stores</h2>
              
              {dashboardData.stores.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-400">You haven&apos;t joined any affiliate programs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.stores.map((store, index) => (
                    <div 
                      key={`${store.store_id}-${index}`}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{store.store_name}</h3>
                          <p className="text-zinc-500 text-sm">{store.store_url}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-400">
                            ${store.total_earned.toFixed(2)}
                          </p>
                          <p className="text-zinc-500 text-sm">earned</p>
                        </div>
                      </div>
                      
                      {/* Referral Link */}
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-400 text-xs mb-1">Your Referral Link</p>
                            <p className="text-sm font-mono truncate">{store.referral_link}</p>
                          </div>
                          <button
                            onClick={() => handleCopyLink(store.referral_link, store.referral_code)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              copiedCode === store.referral_code
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                            }`}
                          >
                            {copiedCode === store.referral_code ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">
                          Code: <span className="font-mono text-zinc-300">{store.referral_code}</span>
                          {' · '}
                          Level {store.level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Payouts */}
            <section>
              <h2 className="text-xl font-bold mb-4">Recent Payouts</h2>
              <PayoutsTable payouts={dashboardData.recent_payouts} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}