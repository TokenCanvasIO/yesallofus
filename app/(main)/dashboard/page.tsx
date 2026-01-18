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
import LoginScreen from '@/components/LoginScreen';
import PendingCustomers from '@/components/PendingCustomers';
import EarnInterest from '@/components/EarnInterest';
import Sidebar from '@/components/Sidebar';
import MilestoneChecklist from '@/components/MilestoneChecklist';
import CelebrationToast from '@/components/CelebrationToast';
import { InfoButton, InfoModal, useInfoModal } from '@/components/InfoModal';
import CollapsibleSection from '@/components/CollapsibleSection';
import SignUpCustomerCard from '@/components/SignUpCustomerCard';
import NebulaBackground from '@/components/NebulaBackground';
import VendorDashboardTour from '@/components/VendorDashboardTour';
import OnboardingSetup from '@/components/OnboardingSetup';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface WalletStatus {
  funded: boolean;
  xrp_balance: number;
  rlusd_trustline: boolean;
  rlusd_balance: number;
  usdc_trustline?: boolean;
  usdc_balance?: number;
  auto_signing_enabled?: boolean;
}

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
// Disconnect modal state
const [showDisconnectModal, setShowDisconnectModal] = useState(false);
const [setupProgress, setSetupProgress] = useState<string | null>(null);
// State (add with other state)
const [runTour, setRunTour] = useState(false);

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

  // Logo state
const [storeLogo, setStoreLogo] = useState<string | null>(null);
const [showLogoUpload, setShowLogoUpload] = useState(false);
const [uploadingLogo, setUploadingLogo] = useState(false);

// Collapsed sidebar
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// Store tracking
const [celebrateMilestone, setCelebrateMilestone] = useState<string | null>(null);
// Info modal
const { activeInfo, openInfo, closeInfo, getContent } = useInfoModal();
// Wallet status for OnboardingSetup
const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
const [allMilestonesComplete, setAllMilestonesComplete] = useState(false);
const [setupComplete, setSetupComplete] = useState(false);
const [customerAutoSignEnabled, setCustomerAutoSignEnabled] = useState(false);
// Collapsed section
const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
// Progress bar on button
const [progressHidden, setProgressHidden] = useState(false);
// Delete Modal
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleting, setDeleting] = useState(false);

// Effect (add with other effects)
useEffect(() => {
  if (store?.store_id && !loading) {
    const hasSeenTour = localStorage.getItem(`vendor_tour_completed_${store.store_id}`);
    if (!hasSeenTour) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }
}, [store?.store_id, loading]);

// Check if all milestones complete on login
useEffect(() => {
  const checkMilestones = async () => {
    if (!store?.store_id) return;
    try {
      const res = await fetch(`${API_URL}/store/${store.store_id}/milestones`);
      const data = await res.json();
      if (data.success) {
        setAllMilestonesComplete(data.all_complete || false);
      }
    } catch (err) {
      console.error('Failed to check milestones:', err);
    }
  };
  checkMilestones();
}, [store?.store_id]);

useEffect(() => {
  const handleToggle = () => setSidebarOpen(prev => !prev);
  window.addEventListener('toggleSidebar', handleToggle);
  return () => window.removeEventListener('toggleSidebar', handleToggle);
}, []);

useEffect(() => {
  if (store?.store_id) {
    const dismissed = localStorage.getItem(`milestones_dismissed_${store.store_id}`);
    setProgressHidden(dismissed === 'true');
  }
}, [store?.store_id]);

const toggleSection = (id: string) => {
  setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
};

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
      
      // Set walletStatus for OnboardingSetup
      setWalletStatus({
        funded: data.funded,
        xrp_balance: data.xrp_balance || 0,
        rlusd_trustline: data.rlusd_trustline || false,
        rlusd_balance: data.rlusd_balance || 0,
        usdc_trustline: data.usdc_trustline || false,
        usdc_balance: data.usdc_balance || 0,
        auto_signing_enabled: data.auto_signing_enabled || false
      });
      
      // Check milestones
      if (data.funded) {
        setMilestone('wallet_funded');
      }
      if (data.rlusd_trustline) {
        setMilestone('trustline_set');
      }
    }
  } catch (err) {
    console.error('Failed to refresh wallet status:', err);
  }
};

  // Upload store logo
const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !store) return;

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'store_logos');

    const uploadRes = await fetch('https://tokencanvas.io/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    });

    const uploadData = await uploadRes.json();
    
    if (!uploadData.secure_url) {
      throw new Error(uploadData.error?.message || 'Upload failed');
    }

    const logoUrl = uploadData.secure_url;

    const res = await fetch(`https://api.dltpays.com/nfc/api/v1/store/${store.store_id}/logo`, {
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
      setStore({ ...store, logo_url: logoUrl });
      sessionStorage.setItem('storeData', JSON.stringify({ ...store, logo_url: logoUrl }));
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
  if (!store) return;
  setUploadingLogo(true);
  try {
    const res = await fetch(`https://api.dltpays.com/nfc/api/v1/store/${store.store_id}/logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logo_url: null,
        wallet_address: walletAddress
      })
    });
    if (res.ok) {
      setStoreLogo(null);
      setStore({ ...store, logo_url: null });
      sessionStorage.setItem('storeData', JSON.stringify({ ...store, logo_url: null }));
      setShowLogoUpload(false);
    }
  } catch (err) {
    setError('Failed to remove logo');
  }
  setUploadingLogo(false);
};

  // Sidebar scroll function
  const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80; // Height of header + some padding
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
  setSidebarOpen(false);
};

const handleNavClick = (id: string, onClick?: () => void) => {
  if (onClick) {
    onClick();
  } else {
    setOpenSections(prev => ({ ...prev, [id]: true }));
    scrollToSection(id);
  }
  setSidebarOpen(false);
  setSidebarCollapsed(true);
};

const setMilestone = async (milestoneId: string) => {
  if (!store?.store_id || !walletAddress) return;
  
  try {
    const res = await fetch(`${API_URL}/store/${store.store_id}/milestone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        milestone: milestoneId,
        wallet_address: walletAddress
      })
    });
    const data = await res.json();
    
    if (data.success && data.new) {
      setCelebrateMilestone(milestoneId);
    }
  } catch (err) {
    console.error('Failed to set milestone:', err);
  }
};

// Check wallet status and set milestones on dashboard load
useEffect(() => {
  if (walletAddress && store?.store_id) {
    refreshWalletStatus();
  }
}, [walletAddress, store?.store_id, walletType]);

  // Check URL for claim token on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const claim = params.get('claim');
      if (claim) {
        setClaimToken(claim);
        fetch(`${API_URL}/store/by-claim/${claim}?_t=${Date.now()}`, { cache: 'no-store' })
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
      const ref = params.get('ref') || sessionStorage.getItem('vendorReferralCode');
      if (ref) {
        setReferralCode(ref);
        sessionStorage.setItem('vendorReferralCode', ref);
        // Check if we already have the referring store cached
        const cachedReferrer = sessionStorage.getItem('vendorReferringStore');
        if (cachedReferrer) {
          setReferringStore(JSON.parse(cachedReferrer));
        }
       fetch(`${API_URL}/store/lookup-referral/${ref}?_t=${Date.now()}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.store) {
              setReferringStore(data.store);
              sessionStorage.setItem('vendorReferringStore', JSON.stringify(data.store));
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

  // Check milestones on dashboard load
useEffect(() => {
  if (!store?.store_id || !walletAddress) return;

  const checkMilestones = async () => {
    try {
      // Check for first affiliate and payouts
      const countRes = await fetch(`${API_URL}/store/${store.store_id}/affiliate-count?wallet_address=${walletAddress}`);
      const countData = await countRes.json();
      
      if (countData.success) {
        if (countData.affiliates_count > 0) {
          setMilestone('first_affiliate');
        }
        
        if (countData.has_payouts) {
          setMilestone('first_payout_sent');
        }
      }

      // Check for first referred vendor
      const vendorRes = await fetch(`${API_URL}/store/${store.store_id}/referred-vendors`);
      const vendorData = await vendorRes.json();
      if (vendorData.success && vendorData.count > 0) {
        setMilestone('first_partner_signed');
      }
    } catch (err) {
      console.error('Failed to check milestones:', err);
    }
  };

  checkMilestones();
}, [store?.store_id, walletAddress]);

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
  if (walletAddress && store) {
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

    setWalletStatus({
      funded: data.funded,
      xrp_balance: data.xrp_balance || 0,
      rlusd_trustline: data.rlusd_trustline || false,
      rlusd_balance: data.rlusd_balance || 0,
      usdc_trustline: data.usdc_trustline || false,
      usdc_balance: data.usdc_balance || 0,
      auto_signing_enabled: data.auto_signing_enabled || false
    });
          
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
  setStoreLogo(data.store.logo_url || null);
  console.log('🔍 Normal flow - Logo URL:', data.store.logo_url);
  sessionStorage.setItem('storeData', JSON.stringify(data.store));
  setNewSecret(null);
  if (data.store.commission_rates) setCommissionRates(data.store.commission_rates);
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
  setStoreLogo(data.store.logo_url || null);
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
        setStoreLogo(data.store.logo_url || null);
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
        setStoreLogo(linkData.store.logo_url || null);
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
          referral_code: referredBy
        })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setNewSecret(data.api_secret);
      
      // Clear referral sessionStorage after successful signup
      sessionStorage.removeItem('vendorReferralCode');
      sessionStorage.removeItem('vendorReferringStore');

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
  setWalletAddress(null);
  setWalletType(null);
  setWalletStatus(null);
  sessionStorage.removeItem('vendorWalletAddress');
  sessionStorage.removeItem('vendorLoginMethod');
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
  console.log('setupAutoSign called, walletType:', walletType);
  if (!store || !walletAddress) return;

    const sdk = (window as any).xrpl?.crossmark;
    if (!sdk) {
      setError('Crossmark wallet not detected.');
      return;
    }
    console.log('Crossmark SDK found');

    setSettingUpAutoSign(true);
    setError(null);

    try {
      // Use existing wallet address - no need to sign in again
      const address = walletAddress;
      console.log('Address:', address);

      // Check if wallet needs RLUSD setup
      const walletStatusRes = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${address}`);
      const walletStatusData = await walletStatusRes.json();
      
      if (walletStatusData.success && walletStatusData.funded && !walletStatusData.rlusd_trustline) {
        console.log('Setting up RLUSD for wallet via Crossmark...');
        
        await sdk.methods.signAndSubmitAndWait({
          TransactionType: 'TrustSet',
          Account: address,
          LimitAmount: {
            currency: '524C555344000000000000000000000000000000',
            issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
            value: '1000000',
          },
        });
        
        console.log('RLUSD enabled successfully via Crossmark');
setMilestone('trustline_set');
// Wait for ledger
await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Get platform signer address from API
      const settingsRes = await fetch(`${API_URL}/xaman/setup-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: store.store_id })
      });
      const settingsData = await settingsRes.json();
      console.log('Settings data:', settingsData);

      if (settingsData.error) {
        throw new Error(settingsData.error);
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) {
        throw new Error('Platform signer not configured');
      }

      // Build and sign SignerListSet transaction with Crossmark
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: address,
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

      console.log('About to sign tx:', signerListSetTx);
let signResult;
try {
  signResult = await sdk.methods.signAndSubmitAndWait({
    TransactionType: 'SignerListSet',
    Account: address,
    SignerQuorum: 1,
    SignerEntries: [
      {
        SignerEntry: {
          Account: platformSignerAddress,
          SignerWeight: 1
        }
      }
    ]
  });
  console.log('Sign result:', signResult);
} catch (signError) {
  console.error('Sign error:', signError);
  throw signError;
}

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
          wallet_address: address,
          daily_limit: dailyLimit,
          auto_sign_max_single_payout: maxSinglePayout
        })
      });

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
setMilestone('auto_sign_enabled');
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

    // Check if wallet needs RLUSD setup
    const walletStatusRes = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${walletAddress}`);
    const walletStatusData = await walletStatusRes.json();
    
    if (walletStatusData.success && walletStatusData.funded && !walletStatusData.rlusd_trustline) {
      // POSITIVE MESSAGE instead of just console.log
      setError(null);
      setSetupProgress('Setting up RLUSD trustline... (1/2)');
      
      const trustlineTx = {
        TransactionType: 'TrustSet',
        Account: walletAddress,
        LimitAmount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: '1000000',
        },
      };
      
      await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: trustlineTx },
      });
      
      setSetupProgress('RLUSD enabled ✓ Now confirm Auto-Pay... (2/2)');
setMilestone('trustline_set');
await new Promise(resolve => setTimeout(resolve, 2000));
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

    // Handle unfunded wallet
    if (settingsData.needs_funding) {
      setWalletNeedsFunding(true);
      setSettingUpAutoSign(false);
      setSetupProgress(null);
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
        setSetupProgress(null);
        return;
      }
    }

    const platformSignerAddress = settingsData.platform_signer_address;
    if (!platformSignerAddress) {
      throw new Error('Platform signer not configured');
    }

    // POSITIVE MESSAGE before SignerList
    setSetupProgress('Confirm Auto-Pay in your wallet...');

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

    await web3auth.provider.request({
      method: 'xrpl_submitTransaction',
      params: { transaction: signerListSetTx }
    });

    setSetupProgress('Verifying setup...');

    // Retry verification up to 5 times with increasing delays
    let verified = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      
      const verifyRes = await fetch(`${API_URL}/xaman/verify-autosign?store_id=${store.store_id}`);
      const verifyData = await verifyRes.json();
      
      if (verifyData.auto_signing_enabled) {
        verified = true;
        break;
      }
      
      if (attempt < 5) {
        setSetupProgress(`Confirming on XRPL... (attempt ${attempt + 1}/5)`);
      }
    }

    if (!verified) {
      throw new Error('Signer setup failed. Please try again.');
    }

    // Update store settings
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

    // SUCCESS - update state immediately (no manual refresh needed)
setStore({
  ...store,
  payout_mode: 'auto',
  auto_signing_enabled: true,
  daily_limit: dailyLimit,
  auto_sign_max_single_payout: maxSinglePayout
});
setMilestone('auto_sign_enabled');
setAutoSignTermsAccepted(false);
setSetupProgress(null);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to enable auto-sign';
    setError(message);
    setSetupProgress(null);
  }
  setSettingUpAutoSign(false);
};

  // =========================================================================
  // REVOKE AUTO-SIGN
  // =========================================================================
  const revokeAutoSign = async () => {
  if (!confirm('Disable auto-signing? You will need to manually approve each payout.')) return;

  setLoading(true);
  setError(null);
  
  try {
    // Step 1: Get revoke status from API
    const res = await fetch(`${API_URL}/store/revoke-autosign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.store_id,
        wallet_address: walletAddress
      })
    });

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to revoke');
    }

    // Already revoked
    if (data.already_revoked) {
      setStore({ ...store, payout_mode: 'manual', auto_signing_enabled: false });
setCustomerAutoSignEnabled(false);
      setLoading(false);
      return;
    }

    // Step 2: Sign transaction to remove signer from XRPL
    if (data.needs_signature) {
      const revokeTx = {
        TransactionType: 'SignerListSet',
        Account: walletAddress,
        SignerQuorum: 0,
      };

      let result;
      
      if (walletType === 'crossmark') {
        // Use Crossmark SDK
        const sdk = (window as any).xrpl?.crossmark;
        if (!sdk) {
          throw new Error('Crossmark wallet not detected.');
        }
        result = await sdk.methods.signAndSubmitAndWait(revokeTx);
      } else {
        // Use Web3Auth
        const { getWeb3Auth } = await import('@/lib/web3auth');
        const web3auth = await getWeb3Auth();

        if (!web3auth || !web3auth.provider) {
          throw new Error('Web3Auth session expired. Please sign in again.');
        }

        result = await web3auth.provider.request({
          method: 'xrpl_submitTransaction',
          params: { transaction: revokeTx }
        });
      }

      // Step 3: Confirm with backend
      await fetch(`${API_URL}/store/confirm-revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.store_id,
          wallet_address: walletAddress,
          tx_hash: (result as any)?.result?.hash || (result as any)?.hash || null
        })
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setStore({ ...store, payout_mode: 'manual', auto_signing_enabled: false });
setCustomerAutoSignEnabled(false);
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revoke auto-sign';
    setError(message);
  }
  setLoading(false);
};

  // =========================================================================
  // PERMANENTLY DELETE STORE
  // =========================================================================
  const deleteStore = async () => {
  setDeleting(true);
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
      window.location.href = '/dashboard';
    } else {
      setError(data.error || 'Failed to delete');
      setShowDeleteModal(false);
    }
  } catch (err) {
    setError('Failed to delete store');
    setShowDeleteModal(false);
  }
  setDeleting(false);
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
        <LoginScreen 
          onLogin={(wallet, method, extras) => {
setWalletAddress(wallet);
setWalletType(method);
if (extras?.xamanUserToken) setXamanUserToken(extras.xamanUserToken);
if (extras?.socialProvider) setSocialProvider(extras.socialProvider);
sessionStorage.setItem('vendorWalletAddress', wallet);
sessionStorage.setItem('vendorLoginMethod', method);
if (extras?.socialProvider) sessionStorage.setItem('socialProvider', extras.socialProvider);
loadOrCreateStore(wallet, method, extras?.xamanUserToken);
          }}
requireTrustline={true}
claimStore={claimStore}
referringStore={referringStore}
storagePrefix="vendor"
title="Partners Dashboard"
subtitle="Sign in to manage your affiliate commissions"
showLogo={true}
/>
      </>
    );
  }

  // =========================================================================
  // XAMAN QR SCREEN
  // =========================================================================
  if (step === 'xaman') {
return (
<div className="min-h-screen bg-transparent text-white font-sans relative z-10">
<main className="max-w-xl mx-auto px-6 py-16">
<button onClick={() => {
  setPolling(false);
  if (store) {
    setStep('dashboard');
  } else {
    setStep('login');
  }
}} className="text-zinc-500 text-sm hover:text-white mb-8">
← Back
</button>

          <h1 className="text-3xl font-bold mb-2">Scan with Xaman</h1>
          <p className="text-zinc-400 mb-8">Open your Xaman app and scan the QR code</p>

          <div className="text-center">
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-8 mb-6">
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
  { 
    id: 'take-payment', 
    label: 'Take Payment', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    onClick: () => router.push('/take-payment')
  },
  { 
    id: 'signup-customer', 
    label: 'Sign Up Customer', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    )
  },
  { 
    id: 'wallet-funding', 
    label: 'Top Up Wallet', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
    show: !walletNeedsFunding && !walletNeedsTrustline
  },
  { 
    id: 'withdraw', 
    label: 'Balance/Withdraw', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    show: !walletNeedsFunding && !walletNeedsTrustline
  },
  { 
    id: 'payout-method', 
    label: 'Payout Method', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    )
  },
  { 
    id: 'pending-customers', 
    label: 'Pending Customers', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    )
  },
  { 
  id: 'earn-interest', 
  label: (
    <span className="flex items-center gap-2">
      Earn Interest
      <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full">Soon</span>
    </span>
  ),
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  )
},
  { 
    id: 'auto-sign', 
    label: 'Auto-Sign', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    show: !store?.auto_signing_enabled
  },
  { 
    id: 'commission-rates', 
    label: 'Commission Rates', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  { 
    id: 'affiliate-link', 
    label: 'Affiliate Link', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    )
  },
  { 
    id: 'api-credentials', 
    label: 'API Credentials', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    )
  },
  { 
    id: 'return-wordpress', 
    label: 'Return to Site', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    show: !!store?.platform_return_url
  },
  { 
    id: 'quick-links', 
    label: 'Quick Links', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    )
  },
  { 
    id: 'activity', 
    label: 'Activity', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  { 
    id: 'danger-zone', 
    label: 'Danger Zone', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    )
  },
].filter(item => item.show !== false);
// =========================================================================
// DASHBOARD
// =========================================================================
return (
<>
<NebulaBackground opacity={0.2} />
<DashboardHeader
  dashboardType="vendor"
  walletAddress={walletAddress || undefined}
  storeId={store?.store_id}
  onSignOut={signOut}
  allMilestonesComplete={allMilestonesComplete}
  setupComplete={setupComplete}
/>
<VendorDashboardTour
  run={runTour} 
  onComplete={() => {
    setRunTour(false);
    if (store?.store_id) {
      localStorage.setItem(`vendor_tour_completed_${store.store_id}`, 'true');
    }
  }}
/>
    <div className="min-h-screen bg-transparent text-white font-sans relative z-0 overflow-x-hidden">
      <Script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />

      {/* Celebration Toast */}
  {celebrateMilestone && (
    <CelebrationToast
      milestone={celebrateMilestone}
      onClose={() => setCelebrateMilestone(null)}
    />
  )}

  {/* Info Modal */}
{activeInfo && getContent() && (
  <InfoModal
    content={getContent()!}
    isOpen={!!activeInfo}
    onClose={closeInfo}
  />
)}

      <Sidebar
  isOpen={sidebarOpen}
  isCollapsed={sidebarCollapsed}
  onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
  onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
  storeName={store?.store_name}
  storeLogo={storeLogo}
  walletAddress={walletAddress}
  navItems={navItems}
  onNavClick={handleNavClick}
  onLogoClick={() => setShowLogoUpload(true)}
  onSignOut={signOut}
  onTakeTour={() => {
  setSidebarOpen(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setRunTour(false);
  setTimeout(() => setRunTour(true), 100);
}}
  onInfoClick={openInfo}
  onShowProgress={() => {
    if (store?.store_id) {
      localStorage.removeItem(`milestones_dismissed_${store.store_id}`);
      setProgressHidden(false);
    }
  }}
/>

{/* Logo Upload Modal */}
{showLogoUpload && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <div className="bg-zinc-900/95 rounded-2xl p-6 w-full max-w-sm">
      <h3 className="text-lg font-bold mb-4">Store Logo</h3>
      {storeLogo && (
        <div className="mb-4 flex justify-center">
          <img src={storeLogo} alt="Current logo" className="w-24 h-24 rounded-xl object-cover" />
        </div>
      )}
      <label className="block mb-4">
        <div className="bg-zinc-800/90 border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition">
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
          className="flex-1 bg-zinc-800/90 hover:bg-zinc-700 py-3 rounded-xl transition"
        >
          {storeLogo ? 'Done' : 'Cancel'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Main Content */}
<main className={`min-h-screen pt-2 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        <div className="max-w-3xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-4 pt-20 pb-4">

          {/* Onboarding Setup Wizard */}
{(walletStatus || !walletAddress) && (
  <OnboardingSetup
  walletAddress={walletAddress}
  walletStatus={walletStatus}
  autoSignEnabled={store?.auto_signing_enabled || customerAutoSignEnabled}
  loginMethod={walletType}
  onSetupComplete={() => { setCustomerAutoSignEnabled(true); setSetupComplete(true); }}
  onRefreshWallet={refreshWalletStatus}
  onSetupStatusChange={(isComplete) => setSetupComplete(isComplete)}
  storagePrefix="vendor"
/>
)}

        {error && (
  error.includes('beta') || error.includes('full') || error.includes('waitlist') ? (
    <div className="bg-gradient-to-b from-sky-900/50 to-slate-900/50 border border-sky-500/30 rounded-xl p-6 mb-6">
      <div className="text-center">
        
        {/* Professional Shield Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-sky-500/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-sky-400 mb-2">Beta is Full!</h3>
        <p className="text-sky-200/70 mb-6">We're at capacity right now, but we'd love to have you join when spots open up.</p>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const email = (form.elements.namedItem('waitlistEmail') as HTMLInputElement).value;
          try {
            await fetch('https://api.dltpays.com/api/v1/waitlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, source: 'beta_full' })
            });
            setError(null);
            alert('Thanks! We\'ll notify you when a spot opens up.');
          } catch (err) {
            alert('Failed to join waitlist. Please try again.');
          }
        }} className="max-w-sm mx-auto">
          <input
            name="waitlistEmail"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full bg-slate-800/50 border border-sky-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 mb-3 focus:outline-none focus:border-sky-400 transition-all"
          />
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-sky-500/25">
            Join Waitlist
          </button>
        </form>
        
        <button onClick={() => setError(null)} className="text-slate-400 text-sm mt-4 hover:text-white transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 text-xs mt-2 hover:underline">Dismiss</button>
            </div>
          )
        )}

        {/* No store yet - show create form */}
        {!store && (
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-8">
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

              // Determine the referring store - either from state, sessionStorage, or manual input
              let finalReferrer = referringStore;
              if (!finalReferrer) {
                const cachedReferrer = sessionStorage.getItem('vendorReferringStore');
                if (cachedReferrer) {
                  finalReferrer = JSON.parse(cachedReferrer);
                }
              }

              // If user entered a referral code manually, look it up first
              const manualRef = (form.elements.namedItem('referralCode') as HTMLInputElement)?.value?.trim();
              if (manualRef && !finalReferrer) {
                try {
                  const res = await fetch(`${API_URL}/store/lookup-referral/${manualRef}?_t=${Date.now()}`, { cache: 'no-store' });
                  const data = await res.json();
                  if (data.success && data.store) {
                    finalReferrer = data.store;
                    setReferringStore(data.store);
                  }
                } catch (err) {
                  console.error('Referral lookup failed:', err);
                }
              }

              // Get referral code from URL, sessionStorage, or manual input
              const refCode = new URLSearchParams(window.location.search).get('ref') 
                || sessionStorage.getItem('vendorReferralCode')
                || (form.elements.namedItem('referralCode') as HTMLInputElement)?.value?.trim()
                || null;
              
              createStore(
                (form.elements.namedItem('storeName') as HTMLInputElement).value,
                (form.elements.namedItem('storeUrl') as HTMLInputElement).value,
                (form.elements.namedItem('email') as HTMLInputElement).value,
                refCode
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Name</label>
                  <input name="storeName" required className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="My Store" />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Website URL</label>
                  <input name="storeUrl" type="url" required className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="https://mystore.com" />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">Email</label>
                  <input name="email" type="email" required className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-4 py-3 text-white" placeholder="you@example.com" />
                </div>

                {/* Referral code input - only show if not already referred */}
                {!referringStore && (
                  <div>
                    <label className="text-zinc-400 text-sm block mb-2">Referral Code <span className="text-zinc-600">(optional)</span></label>
                    <input
                      name="referralCode"
                      className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-4 py-3 text-white"
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

           {/* MILESTONE CHECKLIST */}
{!progressHidden && (
  <MilestoneChecklist 
    key={`${celebrateMilestone}-${progressHidden}`}
    storeId={store.store_id} 
    walletAddress={walletAddress || ''}
    autoSignEnabled={store.auto_signing_enabled}
    onMilestoneAchieved={(milestone) => setCelebrateMilestone(milestone)}
    onInfoClick={openInfo}
    onDismiss={() => setProgressHidden(true)}
  />
)}

            {/* ============================================================= */}
{/* PAYOUT METHOD STATUS */}
{/* ============================================================= */}
<h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Wallet</h3>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
<div id="payout-method" className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-6 flex flex-col">
  <h2 className="text-lg font-bold mb-4">Payout Method</h2>

  {/* Auto-sign enabled (works same for Web3Auth and Crossmark) */}
  {(store.auto_signing_enabled || customerAutoSignEnabled) ? (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-zinc-800/90 rounded-lg">
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
            className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-white"
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
            className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>
      {/* End of Editable Limits */}

      {/* Feature Badges */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex-1 min-w-[100px]">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <div>
            <p className="text-emerald-400 text-xs font-semibold">Instant</p>
            <p className="text-zinc-500 text-[10px]">Sub-second payouts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2 flex-1 min-w-[100px]">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div>
            <p className="text-sky-400 text-xs font-semibold">Secure</p>
            <p className="text-zinc-500 text-[10px]">XRPL validated</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2 flex-1 min-w-[100px]">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-violet-400 text-xs font-semibold">24/7</p>
            <p className="text-zinc-500 text-[10px]">Always available</p>
          </div>
        </div>
      </div>
    </div>
  ) : (walletType === 'web3auth' && !customerAutoSignEnabled) ? (
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
  ) : store.crossmark_connected && !store.auto_signing_enabled ? (
/* Crossmark connected but auto-sign not enabled */
<div className="space-y-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
    <div className="flex items-center gap-3">
      <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-sm" style={{ textShadow: '0 0 8px rgba(249,115,22,0.9)' }}>●</span>
          <span className="text-orange-500 text-sm font-medium">Connected - Enable Auto-Sign</span>
        </div>
        <p className="text-zinc-500 text-sm font-mono">
          {store.wallet_address?.substring(0, 8)}...{store.wallet_address?.slice(-6)}
        </p>
      </div>
    </div>
  </div>
  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
    <p className="text-orange-400 font-medium">Enable Auto-Sign to process payouts</p>
    <p className="text-zinc-400 text-sm">
      Scroll down to enable auto-sign for automatic affiliate payouts.
    </p>
    <button 
      onClick={() => scrollToSection('auto-sign')}
      className="mt-2 text-orange-400 hover:text-orange-300 text-sm underline"
    >
      Go to Auto-Sign Setup →
    </button>
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

      {/* Option 1: Social Login (Web3Auth) */}
      <div className="bg-zinc-800/90 border border-zinc-700 hover:border-emerald-500 rounded-xl p-4 transition">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-zinc-600">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border border-zinc-600">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center border border-zinc-500">
              <span className="text-zinc-300 text-[8px] font-bold">+10</span>
            </div>
          </div>
          <div>
            <span className="font-semibold">Social Login</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Easiest</span>
          </div>
        </div>
        <p className="text-zinc-400 text-sm mb-3">
          Get an XRPL wallet instantly. Payouts process automatically 24/7.
        </p>
        <button
          onClick={() => {
            setWeb3authTermsAccepted(true);
            connectGoogle();
          }}
          disabled={connectingGoogle}
          className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
        >
          {connectingGoogle ? (
            <>
              <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></span>
              Connecting...
            </>
          ) : (
            'Connect Social Wallet'
          )}
        </button>
      </div>

      <div className="text-center text-zinc-500 text-sm py-2">— or —</div>

      {/* Option 2: Connect Xaman for manual */}
      <button
        onClick={loginXaman}
        className="w-full bg-zinc-800/90 border border-zinc-700 hover:border-emerald-500 rounded-xl p-4 text-left transition"
      >
        <div className="flex items-center gap-3 mb-2">
          <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
          <span className="font-semibold">Connect Xaman for Manual Payouts</span>
        </div>
        <p className="text-zinc-400 text-sm">
          Approve each payout via push notification on your phone.
        </p>
      </button>

      {/* Option 3: Crossmark - only show if not already connected with Crossmark */}
{walletType !== 'crossmark' && (
<button
onClick={async () => {
          const sdk = (window as any).xrpl?.crossmark;
          if (!sdk) {
            setError('Crossmark wallet not detected.');
            return;
          }
          try {
            const signIn = await sdk.methods.signInAndWait();
            const address = signIn.response?.data?.address;
            if (address) {
  setWalletAddress(address);
  setWalletType('crossmark');
  sessionStorage.setItem('vendorWalletAddress', address);
  sessionStorage.setItem('vendorLoginMethod', 'crossmark');
  loadOrCreateStore(address, 'crossmark');
}
          } catch (err) {
            console.error('Crossmark error:', err);
          }
        }}
        className="w-full bg-zinc-800/90 border border-zinc-700 hover:border-emerald-500 rounded-xl p-4 text-left transition"
      >
        <div className="flex items-center gap-3 mb-2">
          <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
          <span className="font-semibold">Connect Crossmark</span>
        </div>
        <p className="text-zinc-400 text-sm">
          Browser extension. Enable auto-sign for automatic payouts.
        </p>
</button>
)}
</div>
)}
</div>

{/* ============================================================= */}
{/* WALLET FUNDING (show for Web3Auth wallets that need funding or trustline) */}
{/* ============================================================= */}
{(walletNeedsFunding || walletNeedsTrustline) && walletAddress && (
  <div id="wallet-funding">
  <WalletFunding
  walletAddress={walletAddress}
  walletType={walletType}
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
{!walletNeedsFunding && !walletNeedsTrustline && walletAddress && (
  <div className="space-y-4">
    {/* TAKE PAYMENT BUTTON */}
    <button
  id="take-payment-btn"
  onClick={() => router.push('/take-payment')}
  className="w-full bg-white hover:bg-zinc-100 text-black font-semibold text-lg py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      Take Payment
    </button>

    <CollapsibleSection dashboardType="vendor"
      id="wallet-funding"
      title="Top Up Wallet"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
      }
      isOpen={openSections['wallet-funding']}
      onToggle={() => toggleSection('wallet-funding')}
    >
      <TopUpRLUSD
  walletAddress={walletAddress}
  xrpBalance={walletXrpBalance}
  rlusdBalance={walletRlusdBalance}
  showAmounts={showAmounts}
  onToggleAmounts={() => setShowAmounts(!showAmounts)} 
  onRefresh={refreshWalletStatus}
  walletType={walletType}
/>
    </CollapsibleSection>

    <CollapsibleSection dashboardType="vendor"
      id="withdraw"
      title="Balance | Withdraw"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      }
      isOpen={openSections['withdraw']}
      onToggle={() => toggleSection('withdraw')}
    >
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
    </CollapsibleSection>

    {/* QUICK LINKS POS */}
<div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4">
  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Quick Links</p>
  <div className="grid grid-cols-5 gap-2">
    <button
      onClick={() => router.push('/take-payment')}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800/90 transition"
    >
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <span className="text-zinc-500 text-xs group-hover:text-emerald-400 transition">Payment</span>
    </button>
    <button
      onClick={() => router.push('/analytics')}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800/90 transition"
    >
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span className="text-zinc-500 text-xs group-hover:text-emerald-400 transition">Analytics</span>
    </button>
    <button
      onClick={() => router.push('/receipts')}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800/90 transition"
    >
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-zinc-500 text-xs group-hover:text-emerald-400 transition">Receipts</span>
    </button>
    <button
      onClick={() => window.open(`/display?store=${store.store_id}`, '_blank')}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800/90 transition"
    >
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="text-zinc-500 text-xs group-hover:text-emerald-400 transition">Display</span>
    </button>
    <button
      onClick={() => router.push('/staff')}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800/90 transition"
    >
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span className="text-zinc-500 text-xs group-hover:text-emerald-400 transition">Staff</span>
    </button>
  </div>
</div>
  </div>
)}
</div>

            {/* ============================================================= */}
{/* AUTO-SIGN SETUP (show if auto-sign not enabled yet - NOT for Xaman) */}
{/* ============================================================= */}
{!store.auto_signing_enabled && walletType !== 'xaman' && (
  <div id="auto-sign" className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-6">
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
                      className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-white"
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
                      className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 p-3 bg-zinc-800/90 rounded-lg cursor-pointer mb-4">
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

                {/* Setup Button - Web3Auth */}
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
    {setupProgress || 'Setting up...'}
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

{/* CUSTOMERS - SIGN UP + PENDING */}
<h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Customers</h3>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
  {/* SIGN UP CUSTOMER BUTTON */}
  <SignUpCustomerCard storeId={store.store_id} walletAddress={walletAddress} onSignUp={async () => {
    try {
      await fetch(`${API_URL}/display/${store.store_id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'signup' })
      });
    } catch (err) {
      console.error('Failed to set display status:', err);
    }
    router.push(`/signup-customer?store=${store.store_id}`);
  }} />

  {/* PENDING CUSTOMERS */}
  <div id="pending-customers">
    <PendingCustomers storeId={store.store_id} walletAddress={walletAddress} />
  </div>
</div>

{/* EARN INTEREST */}
<div id="earn-interest">
  <EarnInterest dashboardType="vendor" />
</div>

{/* ============================================================= */}
{/* SETTINGS GROUP */}
{/* ============================================================= */}
<div className="space-y-4">
  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Settings</h3>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <CollapsibleSection dashboardType="vendor"
      id="commission-rates"
      title="Commission Rates"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      }
      isOpen={openSections['commission-rates']}
      onToggle={() => toggleSection('commission-rates')}
    >
      <p className="text-zinc-500 text-sm mb-6">Set the percentage affiliates earn on each level.</p>
      <div className="space-y-4">
        {[
          { level: 1, label: 'Direct referral', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
          { level: 2, label: 'Level 2', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400', borderColor: 'border-blue-500/30' },
          { level: 3, label: 'Level 3', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400', borderColor: 'border-purple-500/30' },
          { level: 4, label: 'Level 4', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400', borderColor: 'border-orange-500/30' },
          { level: 5, label: 'Level 5', bgColor: 'bg-pink-500/20', textColor: 'text-pink-400', borderColor: 'border-pink-500/30' }
        ].map((tier, i) => (
          <div key={tier.level} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tier.bgColor} ${tier.borderColor} border`}>
              <svg className={`w-6 h-6 ${tier.textColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {tier.level === 1 && (
                  <>
                    <circle cx="12" cy="8" r="4" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                  </>
                )}
                {tier.level === 2 && (
                  <>
                    <circle cx="9" cy="7" r="3" strokeWidth={1.5} />
                    <circle cx="15" cy="7" r="3" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-1a4 4 0 014-4h2m12 5v-1a4 4 0 00-4-4h-2" />
                  </>
                )}
                {tier.level === 3 && (
                  <>
                    <circle cx="12" cy="5" r="2.5" strokeWidth={1.5} />
                    <circle cx="6" cy="10" r="2.5" strokeWidth={1.5} />
                    <circle cx="18" cy="10" r="2.5" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v4m-6 0v4m12-4v4" />
                  </>
                )}
                {tier.level === 4 && (
                  <>
                    <circle cx="6" cy="6" r="2.5" strokeWidth={1.5} />
                    <circle cx="18" cy="6" r="2.5" strokeWidth={1.5} />
                    <circle cx="6" cy="14" r="2.5" strokeWidth={1.5} />
                    <circle cx="18" cy="14" r="2.5" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 8.5v3m12-3v3M8.5 6h7M8.5 14h7" />
                  </>
                )}
                {tier.level === 5 && (
                  <>
                    <circle cx="12" cy="4" r="2" strokeWidth={1.5} />
                    <circle cx="5" cy="9" r="2" strokeWidth={1.5} />
                    <circle cx="19" cy="9" r="2" strokeWidth={1.5} />
                    <circle cx="7" cy="17" r="2" strokeWidth={1.5} />
                    <circle cx="17" cy="17" r="2" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v2m-5.5 2.5l2 3m7-3l-2 3" />
                  </>
                )}
              </svg>
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
              className="w-20 bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center"
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
      {!settingsSaved && (
        <button
          onClick={saveSettings}
          disabled={savingSettings || commissionRates.reduce((a, b) => a + b, 0) > 100}
          className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
        >
          {savingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      )}
    </CollapsibleSection>

    <CollapsibleSection dashboardType="vendor"
      id="quick-links"
      title="Quick Links"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      }
      isOpen={openSections['quick-links']}
      onToggle={() => toggleSection('quick-links')}
    >
      <div className="grid grid-cols-2 gap-4">
        <a href="/docs" className="bg-zinc-800/90 hover:bg-zinc-700 rounded-lg p-4 text-center transition group">
          <div className="flex justify-center mb-2">
            <svg className="w-8 h-8 text-sky-400 group-hover:text-sky-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-sm font-medium">Documentation</p>
        </a>
        <a href="/terms" target="_blank" className="bg-zinc-800/90 hover:bg-zinc-700 rounded-lg p-4 text-center transition group">
          <div className="flex justify-center mb-2">
            <svg className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Terms</p>
        </a>
        <a href={`/affiliate-dashboard?store=${store.store_id}`} target="_blank" className="bg-zinc-800/90 hover:bg-zinc-700 rounded-lg p-4 text-center transition group">
          <div className="flex justify-center mb-2">
            <svg className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Affiliate Dashboard</p>
        </a>
        <a href="https://github.com/TokenCanvasIO/YesAllofUs-wordpress/releases/download/v1.0.2/yesallofus.zip" className="bg-zinc-800/90 hover:bg-zinc-700 rounded-lg p-4 text-center transition group">
          <div className="flex justify-center mb-2">
            <svg className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
          </div>
          <p className="text-sm font-medium">WordPress Plugin</p>
        </a>
      </div>
    </CollapsibleSection>
  </div>
</div>

{/* ============================================================= */}
{/* MARKETING GROUP */}
{/* ============================================================= */}
<div className="space-y-4">
  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Marketing</h3>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <CollapsibleSection dashboardType="vendor"
      id="affiliate-link"
      title="Affiliate Link"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      }
      isOpen={openSections['affiliate-link']}
      onToggle={() => toggleSection('affiliate-link')}
    >
      <p className="text-zinc-500 text-sm mb-4">Share this link or add it to your website.</p>
      <div className="flex flex-col gap-2">
        <code className="bg-zinc-800/90 px-4 py-3 rounded-lg font-mono text-sm text-emerald-400 overflow-x-auto">
          {`https://yesallofus.com/affiliate-dashboard?store=${store.store_id}`}
        </code>
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(`https://yesallofus.com/affiliate-dashboard?store=${store.store_id}`, 'affiliate_link')}
            className="flex-1 bg-zinc-800/90 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition"
          >
            {copied === 'affiliate_link' ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setShowQRModal(true)}
            className="flex-1 bg-zinc-800/90 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition"
          >
            QR Code
          </button>
        </div>
      </div>
    </CollapsibleSection>

    {store && walletAddress && (
      <CollapsibleSection dashboardType="vendor"
        id="activity"
        title="Activity"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        }
        isOpen={openSections['activity']}
        onToggle={() => toggleSection('activity')}
      >
        <StoreActivity storeId={store.store_id} walletAddress={walletAddress} showAmounts={showAmounts} />
      </CollapsibleSection>
    )}
  </div>
</div>

{/* ============================================================= */}
{/* DEVELOPER & ACCOUNT GROUP - 2 COLUMN */}
{/* ============================================================= */}
<div className="space-y-4">
  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Developer & Account</h3>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* API Credentials */}
    <CollapsibleSection dashboardType="vendor"
      id="api-credentials"
      title="API Credentials"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      }
      isOpen={openSections['api-credentials']}
      onToggle={() => toggleSection('api-credentials')}
    >
      <div className="mb-4">
        <label className="text-zinc-500 text-sm block mb-1">Store ID</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800/90 px-4 py-2 rounded-lg font-mono text-sm">{store.store_id}</code>
          <button onClick={() => copyToClipboard(store.store_id, 'store_id')} className="bg-zinc-800/90 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
            {copied === 'store_id' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-zinc-500 text-sm block mb-1">API Key</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800/90 px-4 py-2 rounded-lg font-mono text-sm">{store.api_key}</code>
          <button onClick={() => copyToClipboard(store.api_key, 'api_key')} className="bg-zinc-800/90 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
            {copied === 'api_key' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-zinc-500 text-sm block mb-1">API Secret</label>
        {newSecret && !secretSaved ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 bg-zinc-800/90 px-4 py-2 rounded-lg font-mono text-sm tracking-wider">
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
              <button onClick={() => setSecretSaved(true)} className="w-full bg-zinc-800/90 hover:bg-zinc-700 py-2 rounded-lg text-sm transition">
                ✓ I've saved my secret
              </button>
            )}
          </div>
        ) : (
          <div className="bg-zinc-800/90 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-3">Your secret is not stored for security.</p>
            <button onClick={regenerateSecret} disabled={loading} className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate New Secret'}
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="text-zinc-500 text-sm block mb-1">Your Store Referral Code</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800/90 px-4 py-2 rounded-lg font-mono text-sm">{store.store_referral_code}</code>
          <button onClick={() => copyToClipboard(store.store_referral_code, 'referral')} className="bg-zinc-800/90 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
            {copied === 'referral' ? '✓' : 'Copy'}
          </button>
        </div>
        <p className="text-zinc-500 text-xs mt-2">Share with other vendors to earn from their platform fees.</p>
        <p className="text-zinc-600 text-xs mt-1">Earn 25% L1 · 5% L2 · 3% L3 · 2% L4 · 1% L5 of their fees, paid instantly in RLUSD.</p>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <label className="text-zinc-500 text-sm block mb-1">Your Partners Referral Link</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800/90 px-4 py-2 rounded-lg font-mono text-sm text-blue-400 overflow-x-auto">{`https://yesallofus.com/dashboard?ref=${store.store_referral_code}`}</code>
          <button onClick={() => copyToClipboard(`https://yesallofus.com/dashboard?ref=${store.store_referral_code}`, 'referral_link')} className="bg-zinc-800/90 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition">
            {copied === 'referral_link' ? '✓' : 'Copy'}
          </button>
        </div>
        <p className="text-zinc-500 text-xs mt-2">Share this link - new vendors get 50% off their first month!</p>
      </div>
    </CollapsibleSection>

    {/* Danger Zone */}
    <CollapsibleSection dashboardType="vendor"
      id="danger-zone"
      title="Danger Zone"
      icon={
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      }
      isOpen={openSections['danger-zone']}
      onToggle={() => toggleSection('danger-zone')}
    >
      <p className="text-zinc-400 text-sm mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={loading}
        className="bg-zinc-900/95 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Permanently Delete
      </button>
    </CollapsibleSection>
  </div>
</div>

{/* ============================================================= */}
{/* RETURN TO WORDPRESS */}
{/* ============================================================= */}
{store?.platform_return_url && (
  <div
    id="return-wordpress"
    className={`${
      !walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled)
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-yellow-500/10 border-yellow-500/30'
    } border rounded-xl p-6`}
  >
    <div className="flex items-center gap-2 mb-2">
      {!walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled) ? (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <h2 className="text-lg font-bold">
        {!walletNeedsFunding && !walletNeedsTrustline && (walletType !== 'web3auth' || store.auto_signing_enabled)
          ? 'Setup Complete!'
          : 'Setup In Progress'}
      </h2>
    </div>
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
          await fetch(`${API_URL}/store/clear-platform-return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              store_id: store.store_id,
              wallet_address: walletAddress,
            }),
          });
          sessionStorage.removeItem('wordpress_return');
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
{/* Delete Store Modal */}
<DeleteConfirmModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={deleteStore}
  title="Delete Store"
  description="This will permanently delete your store, all affiliates, and all payout history. This action cannot be undone."
  confirmText="PERMANENTLY DELETE"
  loading={deleting}
/>
{/* Disconnect Wallet Modal */}
{showDisconnectModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
      <h3 className="text-lg font-bold mb-2">Disconnect Wallet</h3>
      <p className="text-zinc-400 text-sm mb-6">
        Disconnect your wallet? You will need to reconnect to process payouts.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowDisconnectModal(false)}
          className="flex-1 bg-zinc-800/90 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setShowDisconnectModal(false);
            disconnectWallet();
          }}
          className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-lg font-medium transition"
        >
          Disconnect
        </button>
      </div>
    </div>
  </div>
)}
    </>
    
  );
}