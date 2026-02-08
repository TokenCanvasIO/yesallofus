'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Papa from 'papaparse';

const API_URL = 'https://api.dltpays.com/api/v1';

export default function StoreDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center"><p>Loading...</p></div>}>
      <StoreDashboardContent />
    </Suspense>
  );
}

function StoreDashboardContent() {
  const searchParams = useSearchParams();
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

  // Products & CSV Import
  const [products, setProducts] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [autoShowImport, setAutoShowImport] = useState(false);

  // Token-based auto-login: detect token synchronously so we show loading instead of login screen
  const hasToken = searchParams.get('token');
  const [tokenLoading, setTokenLoading] = useState(!!hasToken);
  const [tokenChecked, setTokenChecked] = useState(false);

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

  // Token-based auto-login (from POS app redirect) — runs once on mount
  useEffect(() => {
    if (tokenChecked) return;
    const token = searchParams.get('token');
    const view = searchParams.get('view');
    if (!token) {
      setTokenLoading(false);
      setTokenChecked(true);
      return;
    }

    setTokenLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_URL}/store/by-dashboard-token/${token}`);
        const data = await res.json();

        if (data.success && data.store) {
          setWalletAddress(data.wallet_address);
          setStore(data.store);
          setNewSecret(null);
          if (data.store.commission_rates) setCommissionRates(data.store.commission_rates);
          if (data.store.daily_limit) setDailyLimit(data.store.daily_limit);
          if (data.store.auto_sign_max_single_payout) setMaxSinglePayout(data.store.auto_sign_max_single_payout);
          setStep('dashboard');

          if (view === 'import') {
            setAutoShowImport(true);
          }
        } else {
          setError(data.error || 'Invalid or expired token');
        }
      } catch {
        setError('Failed to authenticate with token');
      }
      setTokenLoading(false);
      setTokenChecked(true);
    })();
  }, [tokenChecked]);

  // Auto-open import modal when autoShowImport flag is set
  useEffect(() => {
    if (autoShowImport && store && !showImportModal) {
      setShowImportModal(true);
      setAutoShowImport(false);
    }
  }, [autoShowImport, store]);

  // Fetch products for the store
  const fetchProducts = async (storeId?: string) => {
    const id = storeId || store?.store_id;
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/store/${id}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch {
      console.error('Failed to fetch products');
    }
  };

  // Load products when store changes
  useEffect(() => {
    if (store?.store_id) {
      fetchProducts(store.store_id);
    }
  }, [store?.store_id]);

  // CSV Import Handler
  const handleCSVImport = async (rows: Record<string, string>[]): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
      const importProducts = rows.map(row => ({
        name: row.name?.trim(),
        price: parseFloat(row.price),
        category: row.category?.trim() || null,
        sku: row.sku?.trim() || null,
        barcode: row.barcode?.trim() || null,
        track_stock: row.quantity !== undefined && row.quantity !== '',
        quantity: parseInt(row.quantity) || 0,
        low_stock_threshold: parseInt(row.low_stock_threshold) || 5
      }));

      const res = await fetch(`${API_URL}/store/${store.store_id}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          products: importProducts
        })
      });

      const data = await res.json();

      if (data.success) {
        await fetchProducts();
        return {
          success: data.created || 0,
          failed: data.errors?.length || 0,
          errors: data.errors || []
        };
      } else {
        return {
          success: 0,
          failed: rows.length,
          errors: [data.error || 'Import failed']
        };
      }
    } catch (err: any) {
      return {
        success: 0,
        failed: rows.length,
        errors: [err.message || 'Network error']
      };
    }
  };

  const loadOrCreateStore = async (wallet: string, type: 'xaman' | 'crossmark') => {
    setLoading(true);
    try {
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
  // TOKEN LOADING SCREEN
  // =========================================================================
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-500 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Signing you in...</p>
        </div>
      </div>
    );
  }

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
              {store.api_key && (
              <div className="mb-4">
                <label className="text-zinc-500 text-sm block mb-1">API Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm">{store.api_key}</code>
                  <button onClick={() => copyToClipboard(store.api_key, 'api_key')} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
                    {copied === 'api_key' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              )}
              
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
            {/* PRODUCTS */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Products</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import CSV
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-zinc-400 mb-2">No products yet</p>
                  <p className="text-zinc-500 text-sm mb-4">Import products via CSV to get started</p>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition text-sm"
                  >
                    Import Products
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-zinc-400 text-sm mb-3">{products.length} product{products.length !== 1 ? 's' : ''}</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {products.slice(0, 20).map((product: any) => (
                      <div key={product.id || product.name} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{product.name}</p>
                          {product.category && <p className="text-zinc-500 text-xs">{product.category}</p>}
                        </div>
                        <span className="text-emerald-400 font-mono text-sm">
                          £{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </span>
                      </div>
                    ))}
                    {products.length > 20 && (
                      <p className="text-zinc-500 text-xs text-center pt-2">
                        ...and {products.length - 20} more products
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CSV Import Modal */}
            <CSVImportModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onImport={handleCSVImport}
              templateColumns={['name', 'price', 'category', 'sku', 'barcode', 'quantity', 'low_stock_threshold']}
              requiredColumns={['name', 'price']}
              templateName="Products"
            />

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

// =========================================================================
// CSV IMPORT MODAL
// =========================================================================
interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

function CSVImportModal({
  isOpen,
  onClose,
  onImport,
  templateColumns,
  requiredColumns,
  templateName
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, string>[]) => Promise<{ success: number; failed: number; errors: string[] }>;
  templateColumns: string[];
  requiredColumns: string[];
  templateName: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setResult(null);
    setProgress(0);
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setParseErrors(['Please select a CSV file']);
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setParsedData([]);
    setResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results: any) => {
        const errors: string[] = [];
        const headers = results.meta.fields || [];
        const normalizedRequired = requiredColumns.map(c => c.toLowerCase());
        const missingColumns = normalizedRequired.filter((col: string) => !headers.includes(col));

        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        if (results.errors.length > 0) {
          results.errors.slice(0, 5).forEach((err: any) => {
            errors.push(`Row ${(err.row || 0) + 2}: ${err.message}`);
          });
        }

        if (errors.length > 0) {
          setParseErrors(errors);
          return;
        }

        const parsed: ParsedRow[] = (results.data as Record<string, string>[]).map((row, index) => {
          const rowErrors: string[] = [];
          normalizedRequired.forEach(col => {
            if (!row[col] || row[col].trim() === '') {
              rowErrors.push(`${col} is required`);
            }
          });
          if (row.price !== undefined) {
            const price = parseFloat(row.price);
            if (isNaN(price) || price < 0) {
              rowErrors.push('price must be a valid positive number');
            }
          }
          if (row.quantity !== undefined && row.quantity !== '') {
            const qty = parseInt(row.quantity);
            if (isNaN(qty) || qty < 0) {
              rowErrors.push('quantity must be a non-negative integer');
            }
          }
          return { data: row, errors: rowErrors, rowIndex: index + 2 };
        });

        setParsedData(parsed);
      },
      error: (error: any) => {
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const onFileDrop = (e: React.DragEvent) => {
    handleDrop(e);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.errors.length === 0);
    if (validRows.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const importResult = await onImport(validRows.map(r => r.data));

      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);
    } catch (err: any) {
      setResult({
        success: 0,
        failed: validRows.length,
        errors: [err.message || 'Import failed']
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse({
      fields: templateColumns,
      data: [
        templateColumns.reduce((acc, col) => {
          if (col === 'name') acc[col] = 'Example Product';
          else if (col === 'price') acc[col] = '9.99';
          else if (col === 'category') acc[col] = 'Category';
          else if (col === 'barcode') acc[col] = '5901234123457';
          else if (col === 'sku') acc[col] = 'SKU001';
          else if (col === 'quantity') acc[col] = '100';
          else if (col === 'low_stock_threshold') acc[col] = '10';
          else acc[col] = '';
          return acc;
        }, {} as Record<string, string>)
      ]
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(r => r.errors.length === 0).length;
  const invalidCount = parsedData.filter(r => r.errors.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import {templateName}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Template download */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV Template
            </button>
            <p className="text-zinc-500 text-xs mt-1">
              Required columns: {requiredColumns.join(', ')}
            </p>
          </div>

          {/* Drop zone */}
          {!file && !result && (
            <div
              onDrop={onFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-zinc-400 mb-2">Drag and drop your CSV file here</p>
              <p className="text-zinc-500 text-sm mb-4">or</p>
              <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* File selected */}
          {file && !result && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-800 rounded-lg">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white flex-1 truncate">{file.name}</span>
              <button onClick={resetState} className="text-zinc-400 hover:text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 font-medium mb-2">Errors found:</p>
              <ul className="text-sm text-red-300 space-y-1">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div>
              <div className="flex gap-4 mb-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                  <span className="text-emerald-400 font-bold">{validCount}</span>
                  <span className="text-zinc-400 text-sm ml-2">valid rows</span>
                </div>
                {invalidCount > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    <span className="text-red-400 font-bold">{invalidCount}</span>
                    <span className="text-zinc-400 text-sm ml-2">invalid rows</span>
                  </div>
                )}
              </div>

              <div className="border border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-zinc-400 w-12">Row</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Name</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Price</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Category</th>
                      <th className="px-3 py-2 text-left text-zinc-400 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((row) => (
                      <tr key={row.rowIndex} className="border-t border-zinc-800">
                        <td className="px-3 py-2 text-zinc-500">{row.rowIndex}</td>
                        <td className="px-3 py-2 text-white truncate max-w-[150px]">{row.data.name || '-'}</td>
                        <td className="px-3 py-2 text-white">{row.data.price ? `£${parseFloat(row.data.price).toFixed(2)}` : '-'}</td>
                        <td className="px-3 py-2 text-zinc-400 truncate max-w-[100px]">{row.data.category || '-'}</td>
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="text-emerald-400 text-xs">Valid</span>
                          ) : (
                            <span className="text-red-400 text-xs cursor-help" title={row.errors.join(', ')}>Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <div className="p-3 text-center text-zinc-500 text-sm bg-zinc-800/50">
                    Showing first 50 of {parsedData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Importing products...</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4">
              <div className={`rounded-lg p-4 ${
                result.failed === 0
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.failed === 0 ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <p className={`font-medium ${result.failed === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Import Complete
                  </p>
                </div>
                <p className="text-sm text-zinc-400">
                  {result.success} product{result.success !== 1 ? 's' : ''} imported successfully
                  {result.failed > 0 && `, ${result.failed} failed`}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-3 text-sm text-red-400 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <li key={i} className="truncate">{err}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-zinc-500">...and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          {!result ? (
            <>
              <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition"
              >
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importing...
                  </span>
                ) : (
                  `Import ${validCount} Product${validCount !== 1 ? 's' : ''}`
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={resetState} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition">
                Import More
              </button>
              <button onClick={onClose} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition">
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}