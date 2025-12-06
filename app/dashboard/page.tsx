'use client';
import { useState, useEffect } from 'react';
import StoreActivity from '@/components/StoreActivity';
import WalletFunding from '@/components/WalletFunding';
import Script from 'next/script';

const API_URL = 'https://api.dltpays.com/api/v1';

export default function StoreDashboard() {
  const [step, setStep] = useState<'login' | 'xaman' | 'dashboard'>('login');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'xaman' | 'crossmark' | 'web3auth' | null>(null);
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
  const [xamanUserToken, setXamanUserToken] = useState<string | null>(null);

  // Web3Auth specific state
  const [web3authTermsAccepted, setWeb3authTermsAccepted] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  // Claim token (from CLI)
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [claimStore, setClaimStore] = useState<any>(null);

  // Store referral (from ?ref= param)
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referringStore, setReferringStore] = useState<any>(null);

  // Amount visibility toggle
  const [showAmounts, setShowAmounts] = useState(false);

  // Wallet funding state (for new Web3Auth wallets)
  const [walletNeedsFunding, setWalletNeedsFunding] = useState(false);
  const [walletNeedsTrustline, setWalletNeedsTrustline] = useState(false);

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

      // Check for referral code (from store referral link)
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref);
        fetch(`${API_URL}/store/lookup-referral/${ref}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.store) {
              setReferringStore(data.store);
            }
          })
          .catch(console.error);
      }

      // Check for existing Web3Auth session
      const savedWallet = sessionStorage.getItem('vendorWalletAddress');
      const savedType = sessionStorage.getItem('vendorLoginMethod');
      if (savedWallet && savedType) {
        setWalletAddress(savedWallet);
        setWalletType(savedType as 'xaman' | 'crossmark' | 'web3auth');
        loadOrCreateStore(savedWallet, savedType as 'xaman' | 'crossmark' | 'web3auth');
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
          setXamanUserToken(data.xaman_user_token || null);
          setPolling(false);
          sessionStorage.setItem('vendorWalletAddress', data.wallet_address);
          sessionStorage.setItem('vendorLoginMethod', 'xaman');
          loadOrCreateStore(data.wallet_address, 'xaman', data.xaman_user_token);
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

  // Check if Web3Auth wallet needs funding on load
useEffect(() => {
  if (walletType === 'web3auth' && walletAddress && store) {
    // Check wallet funding status
    fetch(`${API_URL}/wallet/status/${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (!data.funded) {
            setWalletNeedsFunding(true);
            setWalletNeedsTrustline(false);
          } else if (!data.rlusd_trustline) {
            setWalletNeedsFunding(false);
            setWalletNeedsTrustline(true);
          } else {
            setWalletNeedsFunding(false);
            setWalletNeedsTrustline(false);
          }
        }
      })
      .catch(console.error);
  }
}, [walletType, walletAddress, store]);

  // =========================================================================
  // WEB3AUTH GOOGLE LOGIN
  // =========================================================================
  const connectGoogle = async () => {
    if (!web3authTermsAccepted) return;
    
    setConnectingGoogle(true);
    setError(null);
    
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth) {
        throw new Error('Web3Auth not available');
      }
      
      const provider = await web3auth.connect();
      if (!provider) {
        throw new Error('Connection cancelled');
      }
      
      const accounts = await provider.request({ method: 'xrpl_getAccounts' }) as string[];
      const address = accounts?.[0];
      
      if (!address) {
        throw new Error('No wallet address returned');
      }
      
      setWalletAddress(address);
      setWalletType('web3auth');
      sessionStorage.setItem('vendorWalletAddress', address);
      sessionStorage.setItem('vendorLoginMethod', 'web3auth');
      
      loadOrCreateStore(address, 'web3auth');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      if (!message.includes('cancelled') && !message.includes('closed')) {
        setError(message);
      }
    }
    
    setConnectingGoogle(false);
  };

  const loadOrCreateStore = async (wallet: string, type: 'xaman' | 'crossmark' | 'web3auth', xamanUserToken?: string | null) => {
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
            wallet_type: type,
            xaman_user_token: xamanUserToken || null
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

        // Save Xaman connection for existing store
        if (type === 'xaman' && xamanUserToken) {
          await fetch(`${API_URL}/store/save-xaman-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              store_id: data.store.store_id,
              wallet_address: wallet,
              xaman_user_token: xamanUserToken
            })
          });
          data.store.xaman_connected = true;
          data.store.xaman_user_token = xamanUserToken;
        }

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

  const createStore = async (storeName: string, storeUrl: string, email: string, referredBy: string | null = null) => {
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
          wallet_type: walletType,
          xaman_user_token: xamanUserToken,
          referred_by_store: referredBy
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
        auto_signing_enabled: false,
        xaman_connected: walletType === 'xaman',
        crossmark_connected: walletType === 'crossmark',
        web3auth_connected: walletType === 'web3auth'
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
        setStore({ ...store, commission_rates: commissionRates, daily_limit: dailyLimit, auto_sign_max_single_payout: maxSinglePayout });
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
      // For Web3Auth, also logout from Web3Auth
      if (walletType === 'web3auth') {
        try {
          const { logoutWeb3Auth } = await import('@/lib/web3auth');
          await logoutWeb3Auth();
        } catch (e) {
          console.error('Web3Auth logout error:', e);
        }
      }

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
        setStore({ ...store, wallet_address: null, xaman_connected: false, crossmark_connected: false, web3auth_connected: false, payout_mode: 'manual', auto_signing_enabled: false });
      } else {
        setError(data.error || 'Failed to disconnect');
      }
    } catch (err) {
      setError('Failed to disconnect wallet');
    }
    setLoading(false);
  };

  // =========================================================================
  // SIGN OUT (full logout)
  // =========================================================================
  const signOut = async () => {
    // Clear Web3Auth session if applicable
    if (walletType === 'web3auth') {
      try {
        const { logoutWeb3Auth } = await import('@/lib/web3auth');
        await logoutWeb3Auth();
      } catch (e) {
        console.error('Web3Auth logout error:', e);
      }
    }
    
    // Clear session storage
    sessionStorage.removeItem('vendorWalletAddress');
    sessionStorage.removeItem('vendorLoginMethod');
    
    // Reset state
    setWalletAddress(null);
    setWalletType(null);
    setStore(null);
    setStep('login');
  };

  // =========================================================================
  // AUTO-SIGN SETUP (Crossmark)
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
        web3auth_connected: false,
        daily_limit: dailyLimit,
        auto_sign_max_single_payout: maxSinglePayout
      });
      setWalletAddress(address);
      setWalletType('crossmark');
      sessionStorage.setItem('vendorWalletAddress', address);
      sessionStorage.setItem('vendorLoginMethod', 'crossmark');
      setAutoSignTermsAccepted(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable auto-sign';
      setError(message);
    }
    setSettingUpAutoSign(false);
  };

  // =========================================================================
  // AUTO-SIGN SETUP (Web3Auth) - Signs SignerListSet via Web3Auth
  // =========================================================================
  const setupAutoSignWeb3Auth = async () => {
    if (!autoSignTermsAccepted || !store || !walletAddress) return;

    setSettingUpAutoSign(true);
    setError(null);

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      // Get platform signer address from API
      const settingsRes = await fetch(`${API_URL}/xaman/setup-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: store.store_id })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) {
        throw new Error(settingsData.error);
      }

      // Handle unfunded wallet - show funding component
      if (settingsData.needs_funding) {
        setWalletNeedsFunding(true);
        setSettingUpAutoSign(false);
        return;
      }

      // If signer already exists, just verify
      if (settingsData.signer_exists) {
        const verifyRes = await fetch(`${API_URL}/xaman/verify-autosign?store_id=${store.store_id}`);
        const verifyData = await verifyRes.json();
        
        if (verifyData.auto_signing_enabled) {
          setStore({
            ...store,
            payout_mode: 'auto',
            auto_signing_enabled: true,
            daily_limit: dailyLimit,
            auto_sign_max_single_payout: maxSinglePayout
          });
          setAutoSignTermsAccepted(false);
          setSettingUpAutoSign(false);
          return;
        }
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) {
        throw new Error('Platform signer not configured');
      }

      // Build SignerListSet transaction
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: walletAddress,
        SignerQuorum: 1,
        SignerEntries: [
          {
            SignerEntry: {
              Account: platformSignerAddress,
              SignerWeight: 1
            }
          }
        ]
      };

      // Sign and submit via Web3Auth
      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: {
          transaction: signerListSetTx
        }
      });

      console.log('SignerListSet result:', result);

      // Verify the setup
      const verifyRes = await fetch(`${API_URL}/xaman/verify-autosign?store_id=${store.store_id}`);
      const verifyData = await verifyRes.json();

      if (!verifyData.auto_signing_enabled) {
        throw new Error('Signer setup failed. Please try again.');
      }

      // Update store settings with limits
      await fetch(`${API_URL}/store/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress,
          daily_limit: dailyLimit,
          auto_sign_max_single_payout: maxSinglePayout
        })
      });

      setStore({
        ...store,
        payout_mode: 'auto',
        auto_signing_enabled: true,
        daily_limit: dailyLimit,
        auto_sign_max_single_payout: maxSinglePayout
      });
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
    if (!confirm('⚠️ WARNING: This will permanently delete your store, all affiliates, and all payout history. This action cannot be undone.')) return;
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
        signOut();
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
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-zinc-400 mb-8">Sign in to manage your affiliate commissions.</p>

          {/* Show referral info if coming from store referral link */}
          {referringStore && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-400 mb-2">🎁 Referred by {referringStore.store_name}</h3>
              <p className="text-zinc-300 text-sm mb-1">
                You'll get <strong className="text-white">50% off platform fees</strong> for your first month!
              </p>
              <p className="text-zinc-500 text-sm">
                Connect your wallet below to get started.
              </p>
            </div>
          )}

          {/* Show claim store info if coming from CLI */}
          {claimStore && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-emerald-400 mb-2">✓ Dashboard ready to connect</h3>
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

          {/* ============================================================= */}
          {/* OPTION 1: GOOGLE (WEB3AUTH) - Easiest */}
          {/* ============================================================= */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold">Continue with Google</span>
                <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Easiest</span>
              </div>
            </div>

            <p className="text-zinc-400 text-sm mb-4">
              Get an XRPL wallet instantly using your Google account. After a one-time setup, payouts process automatically.
            </p>

            {/* Web3Auth Disclaimer */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-400 text-sm font-bold mb-2">ℹ️ How It Works</p>
              <ul className="text-blue-300/80 text-sm space-y-2">
                <li>• Your wallet is created via Web3Auth, linked to your Google account</li>
                <li>• After a one-time setup, payouts are processed automatically by our platform</li>
                <li>• No browser session required — payouts happen 24/7 without you being online</li>
                <li>• You can export your private key anytime if you want full custody</li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={web3authTermsAccepted}
                onChange={(e) => setWeb3authTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-zinc-300 text-sm">
                I have read and understand the above, and agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a>
              </span>
            </label>

            <button
              onClick={connectGoogle}
              disabled={!web3authTermsAccepted || connectingGoogle}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                web3authTermsAccepted
                  ? 'bg-white hover:bg-gray-100 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {connectingGoogle ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <p className="text-zinc-500 text-xs text-center mt-3">
              <a href="/terms" target="_blank" className="hover:text-zinc-400 underline">Terms of Service</a>
              {' · '}
              <a href="/privacy" target="_blank" className="hover:text-zinc-400 underline">Privacy Policy</a>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-sm">or use a crypto wallet</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          {/* RLUSD Trustline Confirmation (for wallet options) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="font-semibold mb-3">⚠️ Wallet Requirements</h3>
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
                I confirm my wallet has an <strong>RLUSD trustline</strong> enabled
              </span>
            </label>
          </div>

          {/* ============================================================= */}
          {/* OPTION 2: XAMAN */}
          {/* ============================================================= */}
          <button
            onClick={loginXaman}
            disabled={!trustlineConfirmed}
            className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition mb-4 ${
              trustlineConfirmed
                ? 'border-zinc-800 hover:border-blue-500'
                : 'border-zinc-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
              <span className="font-semibold">Xaman Mobile App</span>
            </div>
            <p className="text-zinc-400 text-sm">Approve each payout via push notification on your phone. Best for security.</p>
          </button>

          {/* ============================================================= */}
          {/* OPTION 3: CROSSMARK */}
          {/* ============================================================= */}
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
                sessionStorage.setItem('vendorWalletAddress', address);
                sessionStorage.setItem('vendorLoginMethod', 'crossmark');
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
            <p className="text-zinc-400 text-sm">Desktop browser wallet. Enable auto-sign for automatic payouts.</p>
          </button>

          {/* Comparison Table */}
          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Compare Options</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 text-left">
                    <th className="pb-3"></th>
                    <th className="pb-3">Google</th>
                    <th className="pb-3">Xaman</th>
                    <th className="pb-3">Crossmark</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-t border-zinc-800">
                    <td className="py-2 text-zinc-400">Setup</td>
                    <td className="py-2 text-emerald-400">Instant</td>
                    <td className="py-2">~2 min</td>
                    <td className="py-2">~2 min</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-2 text-zinc-400">Payouts</td>
                    <td className="py-2 text-emerald-400">Auto (24/7)</td>
                    <td className="py-2">Manual (push)</td>
                    <td className="py-2 text-emerald-400">Auto (24/7)</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-2 text-zinc-400">Mobile</td>
                    <td className="py-2 text-zinc-500">No</td>
                    <td className="py-2 text-emerald-400">Yes</td>
                    <td className="py-2 text-zinc-500">No</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-2 text-zinc-400">Key Control</td>
                    <td className="py-2">Google account</td>
                    <td className="py-2 text-emerald-400">You hold keys</td>
                    <td className="py-2 text-emerald-400">You hold keys</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold mb-1">{store?.store_name || 'Get Started'}</h1>
              <div className="flex items-center gap-3">
                {/* Amount visibility toggle */}
                {store && (
                  <button
                    onClick={() => setShowAmounts(!showAmounts)}
                    className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition"
                    title={showAmounts ? 'Hide amounts' : 'Show amounts'}
                  >
                    {showAmounts ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                )}
                <button
                  onClick={signOut}
                  className="text-zinc-500 text-sm hover:text-white sm:hidden"
                >
                  Sign out
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-zinc-500 text-sm font-mono">
                {walletAddress?.substring(0, 8)}...{walletAddress?.slice(-6)}
              </p>
              <button
                onClick={() => copyToClipboard(walletAddress || '', 'wallet')}
                className="text-zinc-500 hover:text-white text-xs"
              >
                {copied === 'wallet' ? '✓' : '📋'}
              </button>
              {walletType === 'web3auth' && (
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">Google</span>
              )}
              {walletType === 'xaman' && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Xaman</span>
              )}
              {walletType === 'crossmark' && (
                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">Crossmark</span>
              )}
            </div>
          </div>

          <button
            onClick={signOut}
            className="text-zinc-500 text-sm hover:text-white hidden sm:block"
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
            <h2 className="text-xl font-bold mb-6">Sign Up</h2>

            {/* Show referral banner in registration form */}
            {referringStore && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400">🎁</span>
                  <span className="text-blue-400 font-medium">Referred by {referringStore.store_name}</span>
                </div>
                <p className="text-zinc-400 text-sm">50% off platform fees for your first month!</p>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;

              // Determine the referring store - either from state or manual input
              let finalReferrer = referringStore;

              // If user entered a referral code manually, look it up first
              const manualRef = (form.elements.namedItem('referralCode') as HTMLInputElement)?.value?.trim();
              if (manualRef && !finalReferrer) {
                try {
                  const res = await fetch(`${API_URL}/store/lookup-referral/${manualRef}`);
                  const data = await res.json();
                  if (data.success && data.store) {
                    finalReferrer = data.store;
                    setReferringStore(data.store);
                  }
                } catch (err) {
                  console.error('Referral lookup failed:', err);
                }
              }

              createStore(
                (form.elements.namedItem('storeName') as HTMLInputElement).value,
                (form.elements.namedItem('storeUrl') as HTMLInputElement).value,
                (form.elements.namedItem('email') as HTMLInputElement).value,
                finalReferrer?.store_id || null
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Name</label>
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

                {/* Referral code input - only show if not already referred */}
                {!referringStore && (
                  <div>
                    <label className="text-zinc-400 text-sm block mb-2">Referral Code <span className="text-zinc-600">(optional)</span></label>
                    <input
                      name="referralCode"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                      placeholder="E.g. E73E22E4"
                      defaultValue={referralCode || ''}
                    />
                    <p className="text-zinc-600 text-xs mt-1">Get 50% off your first month's platform fees</p>
                  </div>
                )}
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
            {/* WALLET FUNDING (show for Web3Auth wallets that need funding or trustline) */}
            {/* ============================================================= */}
            {(walletNeedsFunding || walletNeedsTrustline) && walletType === 'web3auth' && walletAddress && (
              <WalletFunding 
                walletAddress={walletAddress}
                onFunded={() => {
                  console.log('Wallet funded!');
                  setWalletNeedsFunding(false);
                }}
                onTrustlineSet={() => {
                  console.log('Trustline set!');
                  setWalletNeedsFunding(false);
                  setWalletNeedsTrustline(false);
                }}
              />
            )}

            {/* ============================================================= */}
            {/* PAYOUT METHOD STATUS */}
            {/* ============================================================= */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Payout Method</h2>

              {/* Auto-sign enabled (works same for Web3Auth and Crossmark) */}
              {store.auto_signing_enabled ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {walletType === 'web3auth' ? (
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                      ) : (
                        <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 text-sm" style={{ textShadow: '0 0 8px rgba(34,197,94,0.9)' }}>●</span>
                          <span className="text-green-500 text-sm font-medium">Auto-Sign Active</span>
                        </div>
                        <p className="text-zinc-500 text-sm font-mono">
                          {store.wallet_address?.substring(0, 8)}...{store.wallet_address?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={revokeAutoSign}
                      disabled={loading}
                      className="text-zinc-400 hover:text-red-400 text-sm transition-colors whitespace-nowrap"
                    >
                      Revoke Auto-Sign
                    </button>
                  </div>

                  {/* Editable Limits */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-zinc-400 text-xs block mb-1">Max single (USD)</label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={maxSinglePayout}
                        onChange={(e) => { setMaxSinglePayout(parseInt(e.target.value) || 100); setSettingsSaved(false); }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-zinc-400 text-xs block mb-1">Daily limit (USD)</label>
                      <input
                        type="number"
                        min="10"
                        max="50000"
                        value={dailyLimit}
                        onChange={(e) => { setDailyLimit(parseInt(e.target.value) || 1000); setSettingsSaved(false); }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : walletType === 'web3auth' ? (
                /* Web3Auth connected but auto-sign not enabled yet */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 text-sm" style={{ textShadow: '0 0 8px rgba(234,179,8,0.9)' }}>●</span>
                          <span className="text-yellow-500 text-sm font-medium">Connected - Setup Required</span>
                        </div>
                        <p className="text-zinc-500 text-sm font-mono">
                          {store.wallet_address?.substring(0, 8)}...{store.wallet_address?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 font-medium">⚠️ Enable Auto-Sign to process payouts</p>
                    <p className="text-zinc-400 text-sm">Complete the auto-sign setup below to start paying affiliates automatically.</p>
                  </div>
                </div>
              ) : store.xaman_connected ? (
                /* Xaman connected - manual payouts */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 text-sm" style={{ textShadow: '0 0 8px rgba(34,197,94,0.9)' }}>●</span>
                          <span className="text-green-500 text-sm font-medium">Connection Good</span>
                        </div>
                        <p className="text-zinc-500 text-sm font-mono">
                          {store.wallet_address?.substring(0, 8)}...{store.wallet_address?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      disabled={loading}
                      className="text-zinc-400 hover:text-red-400 text-sm transition-colors whitespace-nowrap"
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
                /* No payout method - show options */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500 text-sm" style={{ textShadow: '0 0 8px rgba(239,68,68,0.9)' }}>●</span>
                    <span className="text-red-500 text-sm font-medium">No connection</span>
                  </div>

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
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <label className="text-zinc-400 text-xs block mb-1">Max single (USD)</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={maxSinglePayout}
                      onChange={(e) => setMaxSinglePayout(parseInt(e.target.value) || 100)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-zinc-400 text-xs block mb-1">Daily limit (USD)</label>
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

                {/* Setup Button - different for Web3Auth vs Crossmark */}
                {walletType === 'web3auth' ? (
                  <button
                    onClick={setupAutoSignWeb3Auth}
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
                      '🔐 Sign to Enable Auto-Sign'
                    )}
                  </button>
                ) : (
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
                )}
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
                  {`https://yesallofus.com/affiliate-dashboard?store=${store.store_id}`}
                </code>
                <button
                  onClick={() => copyToClipboard(`https://yesallofus.com/affiliate-dashboard?store=${store.store_id}`, 'affiliate_link')}
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
                <p className="text-zinc-500 text-xs mt-2">Share with other vendors to earn from their platform fees.</p>
                <p className="text-zinc-600 text-xs mt-1">Earn 25% L1 · 5% L2 · 3% L3 · 2% L4 · 1% L5 of their fees, paid instantly in RLUSD.</p>
              </div>

              {/* Referral Link */}
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <label className="text-zinc-500 text-sm block mb-1">Your Vendor Referral Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg font-mono text-sm text-blue-400 overflow-x-auto">{`https://yesallofus.com/dashboard?ref=${store.store_referral_code}`}</code>
                  <button onClick={() => copyToClipboard(`https://yesallofus.com/dashboard?ref=${store.store_referral_code}`, 'referral_link')} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
                    {copied === 'referral_link' ? '✓' : 'Copy'}
                  </button>
                </div>
                <p className="text-zinc-500 text-xs mt-2">Share this link - new vendors get 50% off their first month!</p>
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

            {store && walletAddress && (
              <StoreActivity storeId={store.store_id} walletAddress={walletAddress} showAmounts={showAmounts} />
            )}

            {/* ============================================================= */}
            {/* DANGER ZONE */}
            {/* ============================================================= */}
            <div className="border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5">
              <h2 className="text-lg font-bold text-red-400 mb-2">⚠️ Danger Zone</h2>
              <p className="text-zinc-400 text-sm mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={deleteStore}
                disabled={loading}
                className="bg-zinc-900 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Permanently Delete
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}