'use client';
import { useState, useEffect } from 'react';
import StoreActivity from '@/components/StoreActivity';
import WalletFunding from '@/components/WalletFunding';
import Script from 'next/script';
import TopUpRLUSD from '@/components/TopUpRLUSD';
import WithdrawRLUSD from '@/components/WithdrawRLUSD';
import DashboardHeader from "@/components/DashboardHeader";
import Link from 'next/link';
import QRCodeModal from '@/components/QRCodeModal';
import Logo from '@/components/Logo';
import { useRouter } from 'next/navigation';
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [web3authTermsAccepted, setWeb3authTermsAccepted] = useState(false);
const [connectingGoogle, setConnectingGoogle] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
const router = useRouter();

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
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  // Claim token (from CLI)
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [claimStore, setClaimStore] = useState<any>(null);

  // Store referral (from ?ref= param)
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referringStore, setReferringStore] = useState<any>(null);

  // Amount visibility toggle
  const [showAmounts, setShowAmounts] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Wallet funding state (for new Web3Auth wallets)
  const [walletNeedsFunding, setWalletNeedsFunding] = useState(false);
  const [walletNeedsTrustline, setWalletNeedsTrustline] = useState(false);
  const [walletXrpBalance, setWalletXrpBalance] = useState(0);
  const [walletRlusdBalance, setWalletRlusdBalance] = useState(0);

  const refreshWalletStatus = async () => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setWalletXrpBalance(data.xrp_balance || 0);
        setWalletRlusdBalance(data.rlusd_balance || 0);
        setWalletNeedsFunding(!data.funded);
        setWalletNeedsTrustline(!data.rlusd_trustline);
      }
    } catch (err) {
      console.error('Failed to refresh wallet status:', err);
    }
  };

  // Sidebar scroll function
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setSidebarOpen(false);
  };

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

      // Check for WordPress return URL - just store in sessionStorage for now
// It will be saved to Firebase in loadOrCreateStore
const wpReturn = params.get('wordpress_return') || sessionStorage.getItem('wordpress_return');
if (wpReturn) {
    sessionStorage.setItem('wordpress_return', wpReturn);
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
const savedSocialProvider = sessionStorage.getItem('socialProvider');
if (savedWallet && savedType) {
  setWalletAddress(savedWallet);
  setWalletType(savedType as 'xaman' | 'crossmark' | 'web3auth');
  if (savedSocialProvider) setSocialProvider(savedSocialProvider);
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

  // Check wallet status on load (Web3Auth and Xaman)
useEffect(() => {
  console.log('Wallet useEffect triggered:', { walletType, walletAddress, store: !!store });
  if ((walletType === 'web3auth' || walletType === 'xaman') && walletAddress && store) {
    // Check wallet funding status
    fetch(`${API_URL}/wallet/status/${walletAddress}`)
      .then(res => res.json())
      .then(data => {
  console.log('Wallet status response:', data);
  if (data.success) {
    console.log('Setting XRP balance:', data.xrp_balance);
    console.log('Setting RLUSD balance:', data.rlusd_balance);
    setWalletXrpBalance(data.xrp_balance || 0);
    setWalletRlusdBalance(data.rlusd_balance || 0);
          
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
      
      // Get the social provider type
      // Get the social provider type
      const userInfo = await web3auth.getUserInfo();
      const socialProviderType = userInfo?.authConnection;
      
      setWalletAddress(address);
      setWalletType('web3auth');
      setSocialProvider(socialProviderType);
      sessionStorage.setItem('vendorWalletAddress', address);
      sessionStorage.setItem('vendorLoginMethod', 'web3auth');
      sessionStorage.setItem('socialProvider', socialProviderType);
      
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
        sessionStorage.setItem('storeData', JSON.stringify(data.store));
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
  sessionStorage.setItem('storeData', JSON.stringify(data.store));
  setNewSecret(null);
      if (data.store.commission_rates) setCommissionRates(data.store.commission_rates);
      if (data.store.daily_limit) setDailyLimit(data.store.daily_limit);
      if (data.store.auto_sign_max_single_payout) setMaxSinglePayout(data.store.auto_sign_max_single_payout);

      // If we have a wordpress_return in URL/session, save it to Firebase
      const wpReturn = new URLSearchParams(window.location.search).get('wordpress_return') 
        || sessionStorage.getItem('wordpress_return');
      
      if (wpReturn && !data.store.platform_return_url) {
        await fetch(`${API_URL}/store/set-platform-return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: data.store.store_id,
            wallet_address: wallet,
            platform_return_url: wpReturn,
            platform_type: 'wordpress'
          })
        });
        data.store.platform_return_url = wpReturn;
        data.store.platform_type = 'wordpress';
        setStore({ ...data.store, platform_return_url: wpReturn, platform_type: 'wordpress' });
      }

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
      // ========== NEW: Try to link wallet to unclaimed store ==========
      const linkRes = await fetch(`${API_URL}/store/link-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          wallet_type: type,
          xaman_user_token: xamanUserToken || null
        })
      });
      const linkData = await linkRes.json();

      if (linkData.success && linkData.store) {
        // Store was found and linked!
        setStore(linkData.store);
        if (linkData.api_secret) {
          setNewSecret(linkData.api_secret); // Show the new secret to user
        }
        if (linkData.store.commission_rates) setCommissionRates(linkData.store.commission_rates);
        if (linkData.store.daily_limit) setDailyLimit(linkData.store.daily_limit);
        setStep('dashboard');
      } else if (linkData.unclaimed_stores && linkData.unclaimed_stores.length > 0) {
        // Multiple unclaimed stores - for now just show the first one
        // TODO: Could add a store selector UI here
        console.log('Multiple unclaimed stores found:', linkData.unclaimed_stores);
        setStore(null);
        setStep('dashboard');
      } else {
        // No store found at all - show create form
        setStore(null);
        setStep('dashboard');
      }
      // ========== END NEW ==========
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

// Save platform return URL if we came from WordPress
const wpReturn = new URLSearchParams(window.location.search).get('wordpress_return') 
  || sessionStorage.getItem('wordpress_return');

const newStore = {
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
  web3auth_connected: walletType === 'web3auth',
  platform_return_url: wpReturn || null,
  platform_type: wpReturn ? 'wordpress' : null
};

if (wpReturn) {
  // Save to Firebase
  fetch(`${API_URL}/store/set-platform-return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      store_id: data.store_id,
      wallet_address: walletAddress,
      platform_return_url: wpReturn,
      platform_type: 'wordpress'
    })
  });
}

setStore(newStore);
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
  if (!store) return;

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
  if (!store || !walletAddress) return;

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
  sessionStorage.removeItem('vendorWalletAddress');
  sessionStorage.removeItem('vendorLoginMethod');
  sessionStorage.removeItem('socialProvider');
  alert('Store permanently deleted.');
  window.location.href = '/dashboard';
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

  const SocialIcon = ({ provider }: { provider: string | null }) => {
    switch (provider) {
      case 'github':
        return (
          <div className="w-8 h-8 bg-[#24292e] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
        );
      case 'twitter':
        return (
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'discord':
        return (
          <div className="w-8 h-8 bg-[#5865F2] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'apple':
        return (
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
        );
      case 'google':
      default:
        return (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        );
    }
  };

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (step === 'login') {
  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
        <Script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />

        <main className="max-w-xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-2">Partners Dashboard</h1>
          <p className="text-zinc-400 mb-8">Sign in to manage your affiliate commissions.</p>

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
<span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium ml-2">✓ Live</span>
            </div>
            <p className="text-zinc-400 text-sm">Approve each payout via push notification on your phone. Best for security.</p>
          </button>

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

{/* ============================================================= */}
{/* OPTION 3: CROSSMARK */}
{/* ============================================================= */}
          <button
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
            className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition mb-4 ${
  trustlineConfirmed
    ? 'border-zinc-800 hover:border-blue-500 cursor-pointer'
    : 'border-zinc-800 opacity-50 cursor-not-allowed'
}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
              <span className="font-semibold">Crossmark Browser Extension</span>
            </div>
            <p className="text-zinc-400 text-sm">Desktop browser wallet. Enable auto-sign for automatic payouts.</p>
          </button>

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
{/* OPTION 1: SOCIAL LOGIN (WEB3AUTH) - Easiest */}
{/* ============================================================= */}
{true && (
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
  <div className="flex items-center gap-3 mb-4">
    <div className="flex -space-x-2">
      {/* Google */}
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      {/* Apple */}
      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      </div>
      {/* Facebook */}
      <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
      {/* X/Twitter */}
      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
      {/* Discord */}
      <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>
      {/* More indicator */}
      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-900">
        <span className="text-zinc-400 text-xs font-bold">+7</span>
      </div>
    </div>
    <div>
      <span className="font-semibold">Continue with Social</span>
      <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Easiest</span>
    </div>
  </div>

  <p className="text-zinc-400 text-sm mb-4">
    Get an XRPL wallet instantly using Google, Apple, Facebook, X, Discord, and more. After a one-time setup, payouts process automatically.
  </p>

  {/* Web3Auth Disclaimer */}
<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
  <p className="text-blue-400 text-sm font-bold mb-2">ℹ️ How It Works</p>
  <ul className="text-blue-300/80 text-sm space-y-2">
    <li>• Your wallet is created via Web3Auth, linked to your social account</li>
    <li>• After a one-time setup, payouts are processed automatically by our platform</li>
    <li>• No browser session required — payouts happen 24/7 without you being online</li>
    <li>• Withdraw your funds anytime from the dashboard</li>
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
      <>Sign in with Social Account</>
    )}
  </button>

  <p className="text-zinc-500 text-xs text-center mt-3">
    <a href="/terms" target="_blank" className="hover:text-zinc-400 underline">Terms of Service</a>
    {' · '}
    <a href="/privacy" target="_blank" className="hover:text-zinc-400 underline">Privacy Policy</a>
  </p>
</div>
)}

{/* Divider */}
{true && (
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-zinc-800"></div>
  <span className="text-zinc-500 text-sm">or use a crypto wallet</span>
  <div className="flex-1 h-px bg-zinc-800"></div>
</div>
)}

          {/* Comparison Table */}
{true && (
<div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
<h3 className="font-semibold mb-4">Compare Options</h3>
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="text-zinc-400 text-left">
<th className="pb-3"></th>
<th className="pb-3">Social</th>
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
)}
</main>
</div>
</>
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
  // DASHBOARD - Navigation items for sidebar
  // =========================================================================
  const navItems = [
    { id: 'payout-method', label: 'Payout Method', icon: '💳' },
    { id: 'wallet-funding', label: 'Wallet', icon: '💰', show: walletType === 'web3auth' },
    { id: 'auto-sign', label: 'Auto-Sign', icon: '⚡', show: !store?.auto_signing_enabled },
    { id: 'commission-rates', label: 'Commission Rates', icon: '📊' },
    { id: 'affiliate-link', label: 'Affiliate Link', icon: '🔗' },
    { id: 'api-credentials', label: 'API Credentials', icon: '🔑' },
    { id: 'return-wordpress', label: 'Return to Site', icon: '↩️', show: !!store?.platform_return_url },
    { id: 'quick-links', label: 'Quick Links', icon: '📚' },
    { id: 'activity', label: 'Activity', icon: '📈' },
    { id: 'danger-zone', label: 'Danger Zone', icon: '⚠️' },
  ].filter(item => item.show !== false);
 // =========================================================================
// DASHBOARD
// =========================================================================
return (
  <>
    <DashboardHeader 
  walletAddress={walletAddress || undefined}
  storeId={store?.store_id}
  onSignOut={signOut}
/>
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <Script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />

      {/* Mobile Menu Button - NOT a full header, just the hamburger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 text-zinc-400 hover:text-white p-2 bg-zinc-900/80 rounded-lg backdrop-blur"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - remove the duplicate logo/branding since DashboardHeader has it */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300
          lg:translate-x-0 lg:top-14 lg:h-[calc(100vh-3.5rem)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
  <div className="p-6 border-b border-zinc-800">
  <h2 className="font-bold text-lg text-white mb-2">Dashboard</h2>
  <p className="font-medium text-zinc-300 truncate">
    {store?.store_name || 'Get Started'}
  </p>
  <p className="text-zinc-500 text-xs font-mono mt-1">
    {walletAddress?.substring(0, 8)}...{walletAddress?.slice(-6)}
  </p>
</div>

  <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
    {store &&
      navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
        >
          <span>{item.icon}</span>
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
  </nav>

  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
    <button
      onClick={signOut}
      className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
    >
      <span>🚪</span>
      <span className="text-sm">Sign out</span>
    </button>
  </div>
</aside>

      {/* Main Content */}
<main className="lg:ml-64 min-h-screen pt-14 lg:pt-8">
        <div className="max-w-3xl mx-auto px-6 py-8">

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
{/* PAYOUT METHOD STATUS */}
{/* ============================================================= */}
<div id="payout-method" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
  <h2 className="text-lg font-bold mb-4">Payout Method</h2>

  {/* Auto-sign enabled (works same for Web3Auth and Crossmark) */}
  {store.auto_signing_enabled ? (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
        <div className="flex items-center gap-3">
          {walletType === 'web3auth' ? (
            <SocialIcon provider={socialProvider} />
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
            onChange={(e) => {
              setMaxSinglePayout(parseInt(e.target.value) || 100);
              setSettingsSaved(false);
            }}
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
            onChange={(e) => {
              setDailyLimit(parseInt(e.target.value) || 1000);
              setSettingsSaved(false);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>
      {/* End of Editable Limits */}
    </div>
  ) : walletType === 'web3auth' ? (
    /* Web3Auth connected but auto-sign not enabled yet */
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <SocialIcon provider={socialProvider} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-sm" style={{ textShadow: '0 0 8px rgba(234,179,8,0.9)' }}>
                ●
              </span>
              <span className="text-yellow-500 text-sm font-medium">Connected - Setup Required</span>
            </div>
            <p className="text-zinc-500 text-sm font-mono">
              {store.wallet_address?.substring(0, 8)}...{store.wallet_address?.slice(-6)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 font-medium">Enable Auto-Sign to process payouts</p>
        <p className="text-zinc-400 text-sm">
          Complete the auto-sign setup below to start paying affiliates automatically.
        </p>
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
{false && (
<div className="border-t border-zinc-800 pt-4 mt-4">
  <p className="text-zinc-400 text-sm mb-2">Prefer automatic payouts?</p>
  <p className="text-zinc-500 text-xs">
    Enable auto-sign below to process payouts automatically with Crossmark.
  </p>
</div>
)}
    </div>
  ) : (
    /* No payout method - show options */
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-500 text-sm" style={{ textShadow: '0 0 8px rgba(239,68,68,0.9)' }}>●</span>
        <span className="text-red-500 text-sm font-medium">No connection</span>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <p className="text-yellow-400 font-medium">Choose a payout method</p>
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
        <p className="text-zinc-400 text-sm">
          Approve each payout via push notification on your phone.
        </p>
      </button>

      <div className="text-center text-zinc-500 text-sm py-2">— or —</div>

      <p className="text-zinc-400 text-sm">
        Enable auto-sign below to process payouts automatically. Coming Soon.
      </p>
    </div>
  )}
</div>

{/* ============================================================= */}
{/* WALLET BALANCE (for Xaman users) */}
{/* ============================================================= */}
{walletType === 'xaman' && walletAddress && store && (
  <div id="wallet-balance" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">Wallet Balance</h2>
      <button
        onClick={() => setShowAmounts(!showAmounts)}
        className="text-zinc-400 hover:text-white transition"
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
    </div>

    {/* State 1: Wallet not funded (no XRP) */}
{walletXrpBalance < 1 && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
    <div className="text-4xl mb-3">⚠️</div>
    <h3 className="text-xl font-bold text-red-400 mb-2">Wallet Not Activated</h3>
    <p className="text-zinc-400 mb-4">
      Your wallet needs at least <strong className="text-white">1 XRP</strong> to activate and set up the RLUSD trustline.
    </p>
    <div className="bg-zinc-800 rounded-lg p-4 mb-4">
      <p className="text-zinc-500 text-sm mb-2">Send XRP to:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-zinc-900 px-3 py-2 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
          {walletAddress}
        </code>
        <button
          onClick={() => copyToClipboard(walletAddress || '', 'wallet_address')}
          className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm transition"
        >
          {copied === 'wallet_address' ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
    <button
      onClick={() => setShowQR(!showQR)}
      className="text-blue-400 hover:text-blue-300 text-sm transition"
    >
      {showQR ? '▼ Hide QR Code' : '▶ Show QR Code to Scan'}
    </button>
    {showQR && (
      <div className="mt-4 flex justify-center">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
          alt="Wallet QR Code"
          className="rounded-lg"
        />
      </div>
    )}
    <button
      onClick={refreshWalletStatus}
      className="mt-4 block w-full text-zinc-500 hover:text-zinc-300 text-sm transition"
    >
      ↻ Refresh Balance
    </button>
  </div>
)}

    {/* State 2: Funded but no RLUSD trustline */}
{walletXrpBalance >= 1 && walletNeedsTrustline && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
    <div className="text-4xl mb-3">🔗</div>
    <h3 className="text-xl font-bold text-yellow-400 mb-2">Add RLUSD Trustline</h3>
    <p className="text-zinc-400 mb-4">
      Your wallet is activated! Now add the <strong className="text-white">RLUSD trustline</strong> in Xaman to receive payments.
    </p>
    <div className="bg-zinc-800 rounded-lg p-4">
      <p className="text-zinc-300 text-sm mb-2"><strong>In Xaman app:</strong></p>
      <ol className="text-zinc-400 text-sm text-left space-y-1">
        <li>1. Go to Settings → Advanced → Add Trustline</li>
        <li>2. Search for <strong className="text-white">RLUSD</strong></li>
        <li>3. Confirm the trustline transaction</li>
      </ol>
    </div>
    
      <a href="/trustline"
      target="_blank"
      className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm transition"
    >
      📖 View Full Trustline Setup Guide
    </a>
    <button
      onClick={refreshWalletStatus}
      className="mt-4 block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg transition"
    >
      I've Added the Trustline → Check Status
    </button>
  </div>
)}
    {/* State 3: Ready but no RLUSD balance */}
{walletXrpBalance >= 1 && !walletNeedsTrustline && walletRlusdBalance === 0 && (
  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-zinc-400 text-sm mb-1">RLUSD</p>
        <p className="text-xl font-bold text-yellow-400">
          {showAmounts ? '$0.00' : '••••••'}
        </p>
      </div>
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-zinc-400 text-sm mb-1">XRP</p>
        <p className="text-xl font-bold">
          {showAmounts ? walletXrpBalance.toFixed(2) : '••••••'}
        </p>
      </div>
    </div>

    <div className="text-center">
      <div className="text-4xl mb-3">💰</div>
      <h3 className="text-xl font-bold text-blue-400 mb-2">Top Up RLUSD</h3>
      <p className="text-zinc-400 mb-4">
        Your wallet is ready! Add <strong className="text-white">RLUSD</strong> to start paying affiliate commissions.
      </p>
    </div>

    <div className="bg-zinc-800 rounded-lg p-4 mb-4">
      <p className="text-zinc-500 text-sm mb-2">Send RLUSD to:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-zinc-900 px-3 py-2 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
          {walletAddress}
        </code>
        <button
          onClick={() => copyToClipboard(walletAddress || '', 'wallet_address')}
          className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm transition"
        >
          {copied === 'wallet_address' ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
    <button
      onClick={() => setShowQR(!showQR)}
      className="text-blue-400 hover:text-blue-300 text-sm transition"
    >
      {showQR ? '▼ Hide QR Code' : '▶ Show QR Code to Scan'}
    </button>
    {showQR && (
      <div className="mt-4 flex justify-center">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
          alt="Wallet QR Code"
          className="rounded-lg"
        />
      </div>
    )}
    <button
      onClick={refreshWalletStatus}
      className="mt-4 block w-full text-zinc-500 hover:text-zinc-300 text-sm transition"
    >
      ↻ Refresh Balance
    </button>
  </div>
)}

    {/* State 4: Wallet ready with RLUSD */}
    {walletXrpBalance >= 1 && !walletNeedsTrustline && walletRlusdBalance > 0 && (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-zinc-400 text-sm mb-1">RLUSD</p>
            <p className="text-xl font-bold text-emerald-400">
              {showAmounts ? `$${walletRlusdBalance.toFixed(2)}` : '••••••'}
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-zinc-400 text-sm mb-1">XRP</p>
            <p className="text-xl font-bold">
              {showAmounts ? walletXrpBalance.toFixed(2) : '••••••'}
            </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <p className="text-blue-400 text-sm font-medium mb-2">💡 Top up in Xaman</p>
          <p className="text-zinc-400 text-sm mb-3">
            Send RLUSD to your wallet address to pay affiliate commissions.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 bg-zinc-800 px-3 py-2 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
              {walletAddress}
            </code>
            <button
              onClick={() => copyToClipboard(walletAddress || '', 'wallet_address')}
              className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded text-sm transition"
            >
              {copied === 'wallet_address' ? '✓' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-blue-400 hover:text-blue-300 text-sm transition flex items-center gap-2"
          >
            {showQR ? '▼ Hide QR Code' : '▶ Show QR Code'}
          </button>
          {showQR && (
            <div className="mt-3 flex justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
                alt="Wallet QR Code"
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          onClick={refreshWalletStatus}
          className="mt-4 w-full text-zinc-500 hover:text-zinc-300 text-sm transition"
        >
          ↻ Refresh Balance
        </button>
      </>
    )}
  </div>
)}

{/* ============================================================= */}
{/* WALLET FUNDING (show for Web3Auth wallets that need funding or trustline) */}
{/* ============================================================= */}
{(walletNeedsFunding || walletNeedsTrustline) && walletType === 'web3auth' && walletAddress && (
  <div id="wallet-funding">
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
  </div>
)}

{/* Show Top-Up and Withdraw components when wallet is ready */}
{!walletNeedsFunding && !walletNeedsTrustline && walletType === 'web3auth' && walletAddress && (
  <div id="wallet-funding">
    <TopUpRLUSD
      walletAddress={walletAddress}
      xrpBalance={walletXrpBalance}
      rlusdBalance={walletRlusdBalance}
      showAmounts={showAmounts}
      onToggleAmounts={() => setShowAmounts(!showAmounts)} 
      onRefresh={refreshWalletStatus} 
    />
    <WithdrawRLUSD
  walletAddress={walletAddress}
  rlusdBalance={walletRlusdBalance}
  showAmounts={showAmounts}
  onToggleAmounts={() => setShowAmounts(!showAmounts)}
  onRefresh={refreshWalletStatus}
  onSuccess={() => {
    fetch(`${API_URL}/wallet/status/${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWalletXrpBalance(data.xrp_balance || 0);
          setWalletRlusdBalance(data.rlusd_balance || 0);
        }
      });
  }}
/>
  </div>
)}

            {/* ============================================================= */}
{/* AUTO-SIGN SETUP (show if auto-sign not enabled yet - NOT for Xaman) */}
{/* ============================================================= */}
{!store.auto_signing_enabled && walletType !== 'xaman' && (
  <div id="auto-sign" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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

            {/* TAKE PAYMENT BUTTON */}
<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
  <button
    onClick={() => router.push('/take-payment')}
    className="w-full bg-white hover:bg-zinc-100 text-black font-semibold text-lg py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
    Take Payment
  </button>
  <p className="text-zinc-500 text-sm text-center mt-3">Accept contactless payments from customers</p>
</div>

{/* SIGN UP CUSTOMER BUTTON */}
<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
  <button
    onClick={() => router.push(`/signup-customer?store=${store.store_id}`)}
    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-semibold text-lg py-4 rounded-xl transition flex items-center justify-center gap-3"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
    Sign Up New Customer
  </button>
  <p className="text-zinc-500 text-sm text-center mt-3">Register customers with NFC card to earn rewards</p>
</div>
            {/* ============================================================= */}
            {/* COMMISSION RATES */}
            {/* ============================================================= */}
            <div id="commission-rates" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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
            <div id="affiliate-link" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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
<button
  onClick={() => setShowQRModal(true)}
  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg text-sm transition whitespace-nowrap"
>
  QR Code
</button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* API CREDENTIALS */}
            {/* ============================================================= */}
            <div id="api-credentials" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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
  className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap"
>
  {copied === 'secret' ? '✓' : 'Copy'}
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
                <label className="text-zinc-500 text-sm block mb-1">Your Partners Referral Link</label>
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
{/* RETURN TO WORDPRESS */}
{/* ============================================================= */}
{/* RETURN TO WORDPRESS/PLATFORM */}
{store?.platform_return_url && (
  <div
    id="return-wordpress"
    className={`${
      !walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled)
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-yellow-500/10 border-yellow-500/30'
    } border rounded-xl p-6`}
  >
    <h2 className="text-lg font-bold mb-2">
      {!walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled) 
        ? '✅ Setup Complete!' 
        : '⏳ Setup In Progress'}
    </h2>
    <p className="text-zinc-400 text-sm mb-4">
      {walletNeedsFunding
        ? 'Step 1: Fund your wallet with at least 1.5 XRP to continue.'
        : walletNeedsTrustline
          ? 'Step 2: Add the RLUSD trustline to receive payments.'
          : walletType === 'web3auth' && !store.auto_signing_enabled
            ? 'Step 3: Enable auto-sign to process payouts automatically.'
            : 'Your wallet is ready to receive affiliate commissions.'}
    </p>

    <a
      href="#"
  onClick={async (e) => {
  e.preventDefault();
  const targetUrl = store.platform_return_url;
  
  try {
    // Generate fresh claim token
    const tokenRes = await fetch(`${API_URL}/store/generate-claim-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.store_id,
        wallet_address: walletAddress,
      }),
    });
    const tokenData = await tokenRes.json();
    
    if (!tokenData.success || !tokenData.claim_token) {
      throw new Error('Failed to generate token');
    }
    
    // Clear platform return
    await fetch(`${API_URL}/store/clear-platform-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.store_id,
        wallet_address: walletAddress,
      }),
    });
    
    sessionStorage.removeItem('wordpress_return');
    
    // Redirect with fresh token
    const separator = targetUrl.includes('?') ? '&' : '?';
    window.location.href = `${targetUrl}${separator}claim_token=${tokenData.claim_token}`;
    
  } catch (err) {
    console.error('Failed to generate claim token:', err);
    alert('Failed to return to WordPress. Please try again.');
  }
}}
      className={`inline-block ${
        !walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled)
          ? 'bg-emerald-500 hover:bg-emerald-400'
          : 'bg-yellow-500 hover:bg-yellow-400'
      } text-black font-semibold px-6 py-3 rounded-lg transition mt-4`}
    >
      Return to {store.platform_type === 'wordpress' ? 'WordPress' : 'Your Site'}
    </a>
  </div>
)}


            {/* ============================================================= */}
            {/* QUICK LINKS */}
            {/* ============================================================= */}
            <div id="quick-links" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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
                <a href="https://github.com/TokenCanvasIO/YesAllofUs-wordpress/releases/download/v1.0.2/yesallofus.zip" className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition">
                  <div className="text-2xl mb-2">📦</div>
                  <p className="text-sm font-medium">WordPress Plugin</p>
                </a>
              </div>
            </div>

            {store && walletAddress && (
  <div id="activity">
    <StoreActivity storeId={store.store_id} walletAddress={walletAddress} showAmounts={showAmounts} />
  </div>
)}

            {/* ============================================================= */}
            {/* DANGER ZONE */}
            {/* ============================================================= */}
            <div id="danger-zone" className="border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5">
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
     </div>
      </main>
    </div>
    <QRCodeModal
  isOpen={showQRModal}
  onClose={() => setShowQRModal(false)}
  url={`https://yesallofus.com/affiliate-dashboard?store=${store?.store_id}`}
  title="Share Affiliate Link"
  subtitle={store?.store_name}
/>
    </>
    
  );
}