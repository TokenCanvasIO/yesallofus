'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

const API_URL = 'https://api.dltpays.com/api/v1';

export default function StoreDashboard() {
  const [step, setStep] = useState<'login' | 'xaman' | 'dashboard'>('login');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'xaman' | 'crossmark' | null>(null);
  const [store, setStore] = useState<any>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secretSaved, setSecretSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [commissionRates, setCommissionRates] = useState([25, 5, 3, 2, 1]);
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [maxSinglePayout, setMaxSinglePayout] = useState(100);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(true);
  
  // Auto-sign setup state (only used on dashboard)
  const [autoSignTermsAccepted, setAutoSignTermsAccepted] = useState(false);
  const [settingUpAutoSign, setSettingUpAutoSign] = useState(false);
  
  // Trustline confirmation (login screen)
  const [trustlineConfirmed, setTrustlineConfirmed] = useState(false);
  
  // Claim token (from CLI)
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [claimStore, setClaimStore] = useState<any>(null);

  // Check URL for claim token on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const claim = params.get('claim');
      if (claim) {
        setClaimToken(claim);
        fetch(`${API_URL}/store/by-claim/${claim}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.store) {
              setClaimStore(data.store);
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  // Poll for Xaman login
  useEffect(() => {
    if (!polling || !loginId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/xaman/login/poll/${loginId}`);
        const data = await res.json();
        
        if (data.status === 'signed' && data.wallet_address) {
          setWalletAddress(data.wallet_address);
          setWalletType('xaman');
          setPolling(false);
          loadOrCreateStore(data.wallet_address, 'xaman');
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          setPolling(false);
          setError('Connection ' + data.status + '. Please try again.');
          setStep('login');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling, loginId]);

  const loadOrCreateStore = async (wallet: string, type: 'xaman' | 'crossmark') => {
    setLoading(true);
    try {
      // If we have a claim token, attach wallet to that store
      if (claimToken && claimStore) {
        const res = await fetch(`${API_URL}/store/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claim_token: claimToken,
            wallet_address: wallet,
            wallet_type: type
          })
        });
        const data = await res.json();
        
        if (data.success && data.store) {
          setStore(data.store);
          if (data.store.commission_rates) setCommissionRates(data.store.commission_rates);
          if (data.store.daily_limit) setDailyLimit(data.store.daily_limit);
          setStep('dashboard');
          setClaimToken(null);
          setClaimStore(null);
          setLoading(false);
          return;
        } else {
          setError(data.error || 'Failed to claim store');
        }
      }
      
      // Normal flow - check if wallet has existing store
      const res = await fetch(`${API_URL}/store/by-wallet/${wallet}`);
      const data = await res.json();
      
      if (data.success && data.store) {
        setStore(data.store);
        setNewSecret(null);
        if (data.store.commission_rates) setCommissionRates(data.store.commission_rates);
        if (data.store.daily_limit) setDailyLimit(data.store.daily_limit);
        if (data.store.auto_sign_max_single_payout) setMaxSinglePayout(data.store.auto_sign_max_single_payout);
        setStep('dashboard');
      } else {
        setStore(null);
        setStep('dashboard');
      }
    } catch (err) {
      setError('Failed to load store');
    }
    setLoading(false);
  };

  const createStore = async (storeName: string, storeUrl: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/store/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          store_url: storeUrl,
          email: email,
          wallet_address: walletAddress,
          wallet_type: walletType
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      setNewSecret(data.api_secret);
      setStore({
        store_id: data.store_id,
        store_name: storeName,
        store_url: storeUrl,
        api_key: data.api_key,
        store_referral_code: data.store_referral_code,
        wallet_address: walletAddress,
        payout_mode: 'manual',
        xaman_connected: walletType === 'xaman',
        crossmark_connected: walletType === 'crossmark'
      });
      setStep('dashboard');
    } catch (err) {
      setError('Failed to create store');
    }
    setLoading(false);
  };

  const regenerateSecret = async () => {
    if (!store || !walletAddress) return;
    if (!confirm('This will invalidate your current secret. Your WordPress plugin and any API integrations will stop working until you update them. Continue?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/regenerate-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setNewSecret(data.api_secret);
        setSecretRevealed(false);
        setSecretSaved(false);
      }
    } catch (err) {
      setError('Failed to regenerate secret');
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!store || !walletAddress) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/store/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress,
          commission_rates: commissionRates,
          daily_limit: dailyLimit,
          auto_sign_max_single_payout: maxSinglePayout
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSettingsSaved(true);
        setStore({ ...store, commission_rates: commissionRates, daily_limit: dailyLimit });
      }
    } catch (err) {
      setError('Failed to save settings');
    }
    setSavingSettings(false);
  };

  // =========================================================================
  // XAMAN LOGIN
  // =========================================================================
  const loginXaman = async () => {
    setStep('xaman');
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/xaman/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setStep('login');
        return;
      }
      
      setXamanQR(data.qr_png);
      setXamanDeepLink(data.deep_link);
      setLoginId(data.login_id);
      setPolling(true);
    } catch (err) {
      setError('Failed to connect');
      setStep('login');
    }
  };

  // =========================================================================
  // DISCONNECT WALLET
  // =========================================================================
  const disconnectWallet = async () => {
    if (!confirm('Disconnect your wallet? You will need to reconnect to process payouts.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/disconnect-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setStore({ ...store, wallet_address: null, xaman_connected: false, crossmark_connected: false, payout_mode: 'manual', auto_signing_enabled: false });
      } else {
        setError(data.error || 'Failed to disconnect');
      }
    } catch (err) {
      setError('Failed to disconnect wallet');
    }
    setLoading(false);
  };

  // =========================================================================
  // AUTO-SIGN SETUP (separate from wallet connection)
  // =========================================================================
  const setupAutoSign = async () => {
    if (!autoSignTermsAccepted || !store) return;
    
    const sdk = (window as any).xrpl?.crossmark;
    if (!sdk) {
      setError('Crossmark wallet not detected.');
      return;
    }
    
    setSettingUpAutoSign(true);
    setError(null);
    
    try {
      // Sign in to verify wallet
      const signIn = await sdk.methods.signInAndWait();
      
      if (!signIn.response?.data?.address) {
        throw new Error('Connection cancelled');
      }
      
      const address = signIn.response.data.address;
      
      // Enable auto-sign on server (wallet will be updated)
      const res = await fetch(`${API_URL}/store/enable-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: address,
          daily_limit: dailyLimit,
          max_single_payout: maxSinglePayout
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStore({ 
        ...store, 
        payout_mode: 'auto', 
        auto_signing_enabled: true,
        wallet_address: address,
        crossmark_connected: true,
        xaman_connected: false,
        daily_limit: dailyLimit
      });
      setWalletAddress(address);
      setAutoSignTermsAccepted(false);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable auto-sign';
      setError(message);
    }
    setSettingUpAutoSign(false);
  };

  // =========================================================================
  // REVOKE AUTO-SIGN
  // =========================================================================
  const revokeAutoSign = async () => {
    if (!confirm('Disable auto-signing? You will need to manually approve each payout.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/revoke-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setStore({ ...store, payout_mode: 'manual', auto_signing_enabled: false });
      } else {
        setError(data.error || 'Failed to revoke');
      }
    } catch (err) {
      setError('Failed to revoke auto-sign');
    }
    setLoading(false);
  };

  // =========================================================================
  // PERMANENTLY DELETE STORE
  // =========================================================================
  const deleteStore = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete your store, all affiliates, and all payout history. This cannot be undone.')) return;
    
    const confirmation = prompt('Type "PERMANENTLY DELETE" to confirm:');
    if (confirmation !== 'PERMANENTLY DELETE') return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress,
          confirm: 'PERMANENTLY DELETE'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Store permanently deleted.');
        setStore(null);
        setWalletAddress(null);
        setStep('login');
      } else {
        setError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete store');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
        <Script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />
        
        <main className="max-w-xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-2">Store Dashboard</h1>
          <p className="text-zinc-400 mb-8">Sign in with your wallet to manage your store.</p>

          {/* Show claim store info if coming from CLI */}
          {claimStore && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-emerald-400 mb-2">✓ Store ready to connect</h3>
              <p className="text-zinc-300 text-sm mb-1">
                <strong>{claimStore.store_name}</strong>
              </p>
              <p className="text-zinc-500 text-sm">
                Connect your wallet below to complete setup.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* RLUSD Trustline Confirmation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">⚠️ Before you connect</h3>
            <p className="text-zinc-400 text-sm mb-4">
              YesAllofUs pays affiliate commissions in <strong className="text-white">RLUSD</strong> (Ripple USD stablecoin). 
              Your wallet must have an RLUSD trustline set up before commissions can be paid.
            </p>
            <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={trustlineConfirmed}
                onChange={(e) => setTrustlineConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-zinc-300 text-sm">
                I confirm this wallet has an <strong>RLUSD trustline</strong> enabled, and I understand that 
                commissions cannot be settled if my RLUSD balance is too low.
              </span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Xaman Option */}
            <button
              onClick={loginXaman}
              disabled={!trustlineConfirmed}
              className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition ${
                trustlineConfirmed 
                  ? 'border-zinc-800 hover:border-blue-500' 
                  : 'border-zinc-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                <span className="font-semibold">Xaman Mobile App</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Recommended</span>
              </div>
              <p className="text-zinc-400 text-sm">Manual payouts — approve each via push notification</p>
            </button>

            {/* Crossmark Option - Just sign in */}
            <button
              disabled={!trustlineConfirmed}
              onClick={async () => {
                if (!trustlineConfirmed) return;
                const sdk = (window as any).xrpl?.crossmark;
                if (!sdk) {
                  setError('Crossmark wallet not detected. Please install the Crossmark browser extension and refresh.');
                  return;
                }
                setError(null);
                try {
                  const signIn = await sdk.methods.signInAndWait();
                  if (!signIn.response?.data?.address) {
                    throw new Error('Connection cancelled');
                  }
                  const address = signIn.response.data.address;
                  
                  // Save to Firebase via API
                  const res = await fetch(`${API_URL}/store/save-crossmark-wallet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      wallet_address: address,
                      store_id: null
                    })
                  });
                  
                  const data = await res.json();
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  
                  setWalletAddress(address);
                  setWalletType('crossmark');
                  loadOrCreateStore(address, 'crossmark');
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Crossmark error';
                  setError(message);
                }
              }}
              className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition ${
                trustlineConfirmed 
                  ? 'border-zinc-800 hover:border-blue-500' 
                  : 'border-zinc-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
                <span className="font-semibold">Crossmark Browser Extension</span>
              </div>
              <p className="text-zinc-400 text-sm">Sign in with Crossmark browser wallet</p>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // XAMAN QR SCREEN
  // =========================================================================
  if (step === 'xaman') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
        <main className="max-w-xl mx-auto px-6 py-16">
          <button onClick={() => setStep('login')} className="text-zinc-500 text-sm hover:text-white mb-8">
            ← Back
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Scan with Xaman</h1>
          <p className="text-zinc-400 mb-8">Open your Xaman app and scan the QR code</p>

          <div className="text-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
              {xamanQR ? (
                <>
                  <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg" />
                  <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mb-4">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Waiting for signature...
                  </div>
                  {xamanDeepLink && (
                    <a 
                      href={xamanDeepLink} 
                      className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg transition"
                    >
                      Open Xaman App
                    </a>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-zinc-500">
                  <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <Script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{store?.store_name || 'Create Store'}</h1>
            <p className="text-zinc-500 text-sm font-mono">{walletAddress}</p>
          </div>
          <button
            onClick={() => { setWalletAddress(null); setStore(null); setStep('login'); }}
            className="text-zinc-500 text-sm hover:text-white"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 text-xs mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* No store yet - show create form */}
        {!store && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Create your store</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              createStore(
                (form.elements.namedItem('storeName') as HTMLInputElement).value,
                (form.elements.namedItem('storeUrl') as HTMLInputElement).value,
                (form.elements.namedItem('email') as HTMLInputElement).value
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Store name</label>
                  <input name="storeName" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="My Store" />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Website URL</label>
                  <input name="storeUrl" type="url" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="https://mystore.com" />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Email</label>
                  <input name="email" type="email" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Store'}
              </button>
            </form>
          </div>
        )}

        {/* Has store - show dashboard */}
        {store && (
          <div className="space-y-6">
            
            {/* ============================================================= */}
            {/* PAYOUT METHOD STATUS */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Payout Method</h2>
              
              {/* Auto-sign enabled - show status */}
              {store.auto_signing_enabled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
                      <div>
                        <p className="text-blue-400 font-medium">⚡ Auto-sign enabled</p>
                        <p className="text-zinc-500 text-sm font-mono">
                          {store.wallet_address?.substring(0, 12)}...{store.wallet_address?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={revokeAutoSign}
                      disabled={loading}
                      className="text-orange-400 text-sm hover:text-orange-300"
                    >
                      Revoke
                    </button>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    Daily limit: ${store.daily_limit || dailyLimit} • Max single: ${store.auto_sign_max_single_payout || maxSinglePayout}
                  </p>
                </div>
              ) : store.xaman_connected ? (
                /* Xaman connected - show manual payout status + option to switch to auto-sign */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                      <div>
                        <p className="text-emerald-400 font-medium">📱 Manual approval via Xaman</p>
                        <p className="text-zinc-500 text-sm font-mono">
                          {store.wallet_address?.substring(0, 12)}...{store.wallet_address?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={disconnectWallet}
                      disabled={loading}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Disconnect
                    </button>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    You'll receive a push notification to approve each payout.
                  </p>
                  
                  {/* Option to switch to auto-sign */}
                  <div className="border-t border-zinc-800 pt-4 mt-4">
                    <p className="text-zinc-400 text-sm mb-2">Prefer automatic payouts?</p>
                    <p className="text-zinc-500 text-xs">Enable auto-sign below to process payouts automatically with Crossmark.</p>
                  </div>
                </div>
              ) : (
                /* No payout method chosen - show options */
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-400 font-medium">⚠️ Choose a payout method</p>
                    <p className="text-zinc-400 text-sm">Select how you want to pay your affiliates.</p>
                  </div>
                  
                  {/* Option 1: Connect Xaman for manual */}
                  <button
                    onClick={loginXaman}
                    className="w-full bg-zinc-800 border border-zinc-700 hover:border-emerald-500 rounded-xl p-4 text-left transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                      <span className="font-semibold">Connect Xaman for Manual Payouts</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Approve each payout via push notification on your phone.</p>
                  </button>
                  
                  {/* Option 2: Enable Auto-sign - this will show the auto-sign section below */}
                  <div className="text-center text-zinc-500 text-sm py-2">— or —</div>
                  
                  <p className="text-zinc-400 text-sm">Enable auto-sign below to process payouts automatically.</p>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* AUTO-SIGN SETUP (show if auto-sign not enabled yet) */}
            {/* ============================================================= */}
            {!store.auto_signing_enabled && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Enable Auto-Sign</h2>
                <p className="text-zinc-400 text-sm mb-4">
                  Process affiliate payouts automatically without manual approval for each transaction.
                </p>
                
                {/* Security Notice */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <p className="text-orange-400 text-sm font-bold mb-2">⚠️ Security Notice</p>
                  <p className="text-orange-300/90 text-sm mb-3">
                    Auto-sign allows YesAllofUs to sign RLUSD transactions from your wallet 
                    automatically, without requiring manual approval for each payout.
                  </p>
                  <p className="text-orange-300/80 text-sm mb-3">
                    While we take every precaution to secure our systems, there is always inherent risk 
                    when granting signing permissions. We recommend:
                  </p>
                  <ul className="text-orange-300/80 text-xs space-y-1">
                    <li>• Keep only 1-2 days worth of expected commissions in this wallet</li>
                    <li>• Set a conservative daily limit below</li>
                    <li>• Top up regularly rather than storing large balances</li>
                  </ul>
                </div>
                
                {/* Limits */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-zinc-400 text-sm block mb-2">Max single payout (USD)</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={maxSinglePayout}
                      onChange={(e) => setMaxSinglePayout(parseInt(e.target.value) || 100)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm block mb-2">Daily limit (USD)</label>
                    <input
                      type="number"
                      min="10"
                      max="50000"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value) || 1000)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                
                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={autoSignTermsAccepted}
                    onChange={(e) => setAutoSignTermsAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-zinc-300 text-sm">
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms & Conditions</a>{' '}
                    for auto-signing.
                  </span>
                </label>
                
                {/* Setup Button */}
                <button
                  onClick={setupAutoSign}
                  disabled={!autoSignTermsAccepted || settingUpAutoSign}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    autoSignTermsAccepted 
                      ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {settingUpAutoSign ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Setting up...
                    </span>
                  ) : (
                    '🔐 Sign with Crossmark to Enable Auto-Sign'
                  )}
                </button>
              </div>
            )}

            {/* ============================================================= */}
            {/* COMMISSION RATES */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Commission Rates</h2>
              <p className="text-zinc-500 text-sm mb-6">Set the percentage affiliates earn on each level.</p>
              
              <div className="space-y-4">
                {[
                  { level: 1, label: 'Direct referral', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
                  { level: 2, label: 'Level 2', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
                  { level: 3, label: 'Level 3', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
                  { level: 4, label: 'Level 4', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' },
                  { level: 5, label: 'Level 5', bgColor: 'bg-pink-500/20', textColor: 'text-pink-400' }
                ].map((tier, i) => (
                  <div key={tier.level} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${tier.bgColor} ${tier.textColor}`}>
                      {tier.level}
                    </div>
                    <span className="text-zinc-400 text-sm w-28">{tier.label}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionRates[i]}
                      onChange={(e) => {
                        const newRates = [...commissionRates];
                        newRates[i] = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                        setCommissionRates(newRates);
                        setSettingsSaved(false);
                      }}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center"
                    />
                    <span className="text-zinc-500">%</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                <div className="text-sm">
                  <span className="text-zinc-500">Total: </span>
                  <span className={commissionRates.reduce((a, b) => a + b, 0) > 100 ? 'text-red-400' : 'text-white'}>
                    {commissionRates.reduce((a, b) => a + b, 0)}%
                  </span>
                  {commissionRates.reduce((a, b) => a + b, 0) > 100 && (
                    <span className="text-red-400 text-xs ml-2">Cannot exceed 100%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            {!settingsSaved && (
              <button
                onClick={saveSettings}
                disabled={savingSettings || commissionRates.reduce((a, b) => a + b, 0) > 100}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            )}

            {/* ============================================================= */}
            {/* AFFILIATE SIGNUP LINK */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Your Affiliate Signup Link</h2>
              <p className="text-zinc-500 text-sm mb-4">Share this link or add it to your website.</p>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-zinc-800 px-4 py-3 rounded-lg font-mono text-sm text-emerald-400 overflow-x-auto">
                  {`https://yesallofus.com/affiliate/signup?store=${store.store_id}`}
                </code>
                <button 
                  onClick={() => copyToClipboard(`https://yesallofus.com/affiliate/signup?store=${store.store_id}`, 'affiliate_link')} 
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg text-sm transition whitespace-nowrap"
                >
                  {copied === 'affiliate_link' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* API CREDENTIALS */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">API Credentials</h2>
              
              {/* Store ID */}
              <div className="mb-4">
                <label className="text-zinc-500 text-sm block mb-1">Store ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm">{store.store_id}</code>
                  <button onClick={() => copyToClipboard(store.store_id, 'store_id')} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
                    {copied === 'store_id' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              
              {/* API Key */}
              <div className="mb-4">
                <label className="text-zinc-500 text-sm block mb-1">API Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm">{store.api_key}</code>
                  <button onClick={() => copyToClipboard(store.api_key, 'api_key')} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
                    {copied === 'api_key' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              
              {/* API Secret */}
              <div className="mb-4">
                <label className="text-zinc-500 text-sm block mb-1">API Secret</label>
                
                {newSecret && !secretSaved ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm tracking-wider">
                        ••••••••••••••••
                      </code>
                      <button 
                        onClick={() => { copyToClipboard(newSecret, 'secret'); setSecretRevealed(true); }} 
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        {copied === 'secret' ? '✓ Copied' : 'Copy Secret'}
                      </button>
                    </div>
                    
                    <div className="bg-yellow-500/20 rounded-lg p-3 mb-3">
                      <p className="text-yellow-200 text-sm font-semibold mb-1">⚠️ SAVE THIS NOW</p>
                      <p className="text-yellow-200/80 text-sm">This secret will disappear when you leave this page.</p>
                    </div>
                    
                    {secretRevealed && (
                      <button onClick={() => setSecretSaved(true)} className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm transition">
                        ✓ I've saved my secret
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <p className="text-zinc-400 text-sm mb-3">Your secret is not stored for security.</p>
                    <button onClick={regenerateSecret} disabled={loading} className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                      {loading ? 'Generating...' : 'Generate New Secret'}
                    </button>
                  </div>
                )}
              </div>

              {/* Referral Code */}
              <div>
                <label className="text-zinc-500 text-sm block mb-1">Your Store Referral Code</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm">{store.store_referral_code}</code>
                  <button onClick={() => copyToClipboard(store.store_referral_code, 'referral')} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
                    {copied === 'referral' ? '✓' : 'Copy'}
                  </button>
                </div>
                <p className="text-zinc-500 text-xs mt-2">Share with other store owners to earn from their platform fees.</p>
              </div>
            </div>

            {/* ============================================================= */}
            {/* QUICK LINKS */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="/docs" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="text-sm font-medium">Documentation</p>
                </a>
                <a href="/terms" target="_blank" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition">
                  <div className="text-2xl mb-2">📜</div>
                  <p className="text-sm font-medium">Terms</p>
                </a>
                <a href={`/affiliate-dashboard?store=${store.store_id}`} target="_blank" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-sm font-medium">Affiliate Dashboard</p>
                </a>
                <a href="https://github.com/TokenCanvasIO/YesAllofUs-wordpress/releases/download/v1.0.0/YesAllofUs.zip" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition">
                  <div className="text-2xl mb-2">📦</div>
                  <p className="text-sm font-medium">WordPress Plugin</p>
                </a>
              </div>
            </div>

            {/* ============================================================= */}
            {/* DANGER ZONE */}
            {/* ============================================================= */}
            <div className="border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5">
              <h2 className="text-lg font-bold text-red-400 mb-2">⚠️ Danger Zone</h2>
              <p className="text-zinc-400 text-sm mb-4">
                Permanently delete your store and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={deleteStore}
                disabled={loading}
                className="bg-zinc-900 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Permanently Delete Store
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}