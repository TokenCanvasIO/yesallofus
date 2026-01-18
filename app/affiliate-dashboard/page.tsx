'use client';

import { useState, useEffect, useRef } from 'react';
import PayoutsTable from '@/components/PayoutsTable';
import DashboardHeader from "@/components/DashboardHeader";
import QRCodeModal from '@/components/QRCodeModal';
import LinkNFCCard from '@/components/LinkNFCCard';
import LoginScreen from '@/components/LoginScreen';
import MyPendingStatus from '@/components/MyPendingStatus';
import EarnInterest from '@/components/EarnInterest';
import TopUpRLUSD from '@/components/TopUpRLUSD';
import WithdrawRLUSD from '@/components/WithdrawRLUSD';
import Sidebar from '@/components/Sidebar';
import MilestoneChecklist from '@/components/MilestoneChecklist';
import CelebrationToast from '@/components/CelebrationToast';
import NebulaBackground from '@/components/NebulaBackground';
import CollapsibleSection from '@/components/CollapsibleSection';
import { InfoModal, useInfoModal } from '@/components/InfoModal';
import AffiliateDashboardTour from '@/components/AffiliateDashboardTour';
import OnboardingSetup from '@/components/OnboardingSetup';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const API_URL = 'https://api.dltpays.com/api/v1';

interface Store {
  store_id: string;
  store_name: string;
  store_url: string;
  referral_code: string;
  referral_link: string;
  total_earned: number;
  level: number;
  commission_rates?: number[];
  logo_url?: string;  // ADD THIS LINE
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

interface WalletStatus {
  funded: boolean;
  xrp_balance: number;
  rlusd_trustline: boolean;
  usdc_trustline: boolean;
  rlusd_balance: number;
  usdc_balance: number;
  pending_commissions: {
    total: number;
    threshold: number;
    until_payout: number;
  } | null;
}

interface PublicStore {
  store_id: string;
  store_name: string;
  store_url: string;
  commission_rates: number[];
  affiliates_count: number;
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
);

const SocialIcon = ({ provider, size = 'sm' }: { provider: string; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  
  const icons: Record<string, React.ReactNode> = {
    google: (
      <div className={`${sizeClasses} bg-white rounded-full flex items-center justify-center`}>
        <svg className={iconSize} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
    ),
    apple: (
      <div className={`${sizeClasses} bg-black rounded-full flex items-center justify-center border border-zinc-700`}>
        <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      </div>
    ),
    github: (
      <div className={`${sizeClasses} bg-[#24292e] rounded-full flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </div>
    ),
    discord: (
      <div className={`${sizeClasses} bg-[#5865F2] rounded-full flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>
    ),
    twitter: (
      <div className={`${sizeClasses} bg-black rounded-full flex items-center justify-center border border-zinc-700`}>
        <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
    ),
    facebook: (
      <div className={`${sizeClasses} bg-[#1877F2] rounded-full flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    ),
  };

  return icons[provider?.toLowerCase()] || (
    <div className={`${sizeClasses} bg-zinc-700 rounded-full flex items-center justify-center`}>
      <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
};

export default function AffiliateDashboard() {
  // Core state
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [publicStores, setPublicStores] = useState<PublicStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<string | null>(null);
  
  // Xaman connection state
  const [connectingXaman, setConnectingXaman] = useState(false);
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [xamanLoginId, setXamanLoginId] = useState<string | null>(null);
  
  // UI state
  const [copiedCode, setCopiedCode] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [joiningStore, setJoiningStore] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalances, setShowBalances] = useState(false);
  const [allMilestonesComplete, setAllMilestonesComplete] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshingWallet, setRefreshingWallet] = useState(false);
  
  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrStoreName, setQrStoreName] = useState('');

  // Auto sign
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  const [settingUpAutoSign, setSettingUpAutoSign] = useState(false);
  const [setupProgress, setSetupProgress] = useState<string | null>(null);
  const [showAutoSignPrompt, setShowAutoSignPrompt] = useState(false);

  // NEW: VendorDashboard-style state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [progressHidden, setProgressHidden] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [celebrateMilestone, setCelebrateMilestone] = useState<string | null>(null);
  const { activeInfo, openInfo, closeInfo, getContent } = useInfoModal();
  // NEW: Tour
  const [runTour, setRunTour] = useState(false);

  const registeringRef = useRef(false);
const rightColumnRef = useRef<HTMLDivElement>(null);
// Delete Affiliate
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleting, setDeleting] = useState(false);

// Check if first time user
useEffect(() => {
  if (walletAddress && !loading) {
    const hasSeenTour = localStorage.getItem(`tour_completed_${walletAddress}`);
    if (!hasSeenTour) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }
}, [walletAddress, loading]);

// Check if all milestones complete on login
useEffect(() => {
  const checkMilestones = async () => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`${API_URL}/customer/milestones/${walletAddress}`);
      const data = await res.json();
      if (data.success && data.milestones) {
        const allComplete = Object.values(data.milestones).every(v => v !== null);
        const dismissedKey = `milestones_celebrated_${walletAddress}`;
        const alreadyCelebrated = localStorage.getItem(dismissedKey);
        
        if (allComplete && !alreadyCelebrated) {
          setAllMilestonesComplete(true);
          localStorage.setItem(dismissedKey, 'true');
        }
      }
    } catch (err) {
      console.error('Failed to check milestones:', err);
    }
  };
  checkMilestones();
}, [walletAddress]);

  useEffect(() => {
  const handleToggle = () => setSidebarOpen(prev => !prev);
  window.addEventListener('toggleSidebar', handleToggle);
  return () => window.removeEventListener('toggleSidebar', handleToggle);
}, []);

  // Load progress hidden state
  useEffect(() => {
    if (walletAddress) {
      const dismissed = localStorage.getItem(`milestones_dismissed_customer_${walletAddress}`);
      setProgressHidden(dismissed === 'true');
    }
  }, [walletAddress]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Save URL params before login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const storeId = urlParams.get('store');
    const join = urlParams.get('join');
    if (email && join === '1') {
      sessionStorage.setItem('pendingSignup', JSON.stringify({ email, storeId }));
    }
  }, []);

  const completeCustomerSignup = async (wallet: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    let email = urlParams.get('email');
    let storeId = urlParams.get('store');
    let join = urlParams.get('join');
    
    if (!email || join !== '1') {
      const pending = sessionStorage.getItem('pendingSignup');
      if (pending) {
        const parsed = JSON.parse(pending);
        email = parsed.email;
        storeId = parsed.storeId;
        join = '1';
      }
    }
    
    if (!email || join !== '1') return;
    
    try {
      const res = await fetch('https://api.dltpays.com/nfc/api/v1/nfc/complete-customer-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wallet_address: wallet, store_id: storeId || null })
      });
      const data = await res.json();
      if (data.success && data.card_linked) {
        console.log('✅ NFC card linked to wallet:', data.card_uid);
      }
      sessionStorage.removeItem('pendingSignup');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('email');
      newUrl.searchParams.delete('store');
      newUrl.searchParams.delete('join');
      window.history.replaceState({}, '', newUrl.toString());
    } catch (err) {
      console.error('Failed to complete customer signup:', err);
    }
  };

  const checkAutoSignStatus = async (wallet: string, method: string) => {
    if (method !== 'web3auth') return;
    try {
      const res = await fetch(`https://api.dltpays.com/nfc/api/v1/customer/autosign-status/${wallet}`);
      const data = await res.json();
      if (data.success) {
        setAutoSignEnabled(data.auto_signing_enabled);
        if (!data.auto_signing_enabled) setShowAutoSignPrompt(true);
      }
    } catch (err) {
      console.error('Failed to check auto-sign status:', err);
    }
  };

  const setupAutoSignWeb3Auth = async () => {
    if (!walletAddress) return;
    setSettingUpAutoSign(true);
    setError(null);
    setSetupProgress(null);

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      setSetupProgress('Checking wallet...');
      const walletStatusRes = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${walletAddress}`);
      const walletStatusData = await walletStatusRes.json();
      
      if (walletStatusData.success && walletStatusData.funded && !walletStatusData.rlusd_trustline) {
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
        setSetupProgress('RLUSD enabled ✓ Now confirm Tap-to-Pay... (2/2)');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setSetupProgress('Preparing Tap-to-Pay...');
      const settingsRes = await fetch('https://api.dltpays.com/nfc/api/v1/customer/setup-autosign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) throw new Error(settingsData.error);
      if (settingsData.signer_exists || settingsData.auto_sign_enabled) {
        setAutoSignEnabled(true);
        setShowAutoSignPrompt(false);
        setSettingUpAutoSign(false);
        setSetupProgress(null);
        return;
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) throw new Error('Platform signer not configured');

      setSetupProgress('Confirm in your wallet...');
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: walletAddress,
        SignerQuorum: 1,
        SignerEntries: [{ SignerEntry: { Account: platformSignerAddress, SignerWeight: 1 } }]
      };
      await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: signerListSetTx }
      });

      setSetupProgress('Verifying setup...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const verifyRes = await fetch(`https://api.dltpays.com/nfc/api/v1/customer/autosign-status/${walletAddress}`);
      const verifyData = await verifyRes.json();
      if (verifyData.auto_sign_enabled) {
        setAutoSignEnabled(true);
        setShowAutoSignPrompt(false);
      } else {
        throw new Error('Auto-sign setup failed. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable auto-sign';
      setError(message);
    }
    setSettingUpAutoSign(false);
    setSetupProgress(null);
  };

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('walletAddress');
    const storedMethod = sessionStorage.getItem('loginMethod');
    const storedProvider = sessionStorage.getItem('socialProvider');
    const storedLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (storedLoggedIn === 'true') setIsLoggedIn(true);
    
    if (stored) {
      setWalletAddress(stored);
      setIsLoggedIn(true);
      if (storedMethod) setLoginMethod(storedMethod);
      if (storedProvider) setSocialProvider(storedProvider);
      completeCustomerSignup(stored);
      Promise.all([fetchDashboard(stored), fetchWalletStatus(stored)]);
      if (storedMethod === 'web3auth') checkAutoSignStatus(stored, storedMethod);
    } else {
      setLoading(false);
    }
    
    const interval = setInterval(() => {
      const currentStored = sessionStorage.getItem('walletAddress');
      if (currentStored && currentStored !== walletAddress && walletAddress) {
        setWalletAddress(currentStored);
        fetchDashboard(currentStored);
        fetchWalletStatus(currentStored);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  const fetchWalletStatus = async (wallet: string, showLoading = false) => {
    if (showLoading) setRefreshingWallet(true);
    try {
      const res = await fetch(`${API_URL}/wallet/status/${wallet}`);
      const data = await res.json();
      if (data.success) setWalletStatus(data);
    } catch (err) {
      console.error('Failed to fetch wallet status:', err);
    }
    if (showLoading) setRefreshingWallet(false);
  };

  const fetchPublicStores = async () => {
    try {
      const res = await fetch(`${API_URL}/stores/public`);
      const data = await res.json();
      if (data.success) setPublicStores(data.stores);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const fetchDashboard = async (wallet: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/affiliate/dashboard/${wallet}`);
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404) {
          setDashboardData(null);
          setShowDiscover(true);
          await fetchPublicStores();
        } else {
          setError(data.error || 'Failed to load dashboard');
        }
        return;
      }
      
      setDashboardData(data);
      if (data.stores.length === 0) {
        setShowDiscover(true);
        await fetchPublicStores();
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStore = async (storeId: string) => {
    if (!walletAddress) return;
    setJoiningStore(storeId);
    try {
      const res = await fetch(`${API_URL}/affiliate/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, wallet: walletAddress })
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboard(walletAddress);
        setShowDiscover(false);
      } else {
        setError(data.error || 'Failed to join vendor');
      }
    } catch (err) {
      setError('Failed to join vendor');
    } finally {
      setJoiningStore(null);
    }
  };

  const handleLogin = (wallet: string, method: 'xaman' | 'crossmark' | 'web3auth', extras?: { socialProvider?: string }) => {
    setWalletAddress(wallet);
    setLoginMethod(method);
    setIsLoggedIn(true);
    sessionStorage.setItem('walletAddress', wallet);
    sessionStorage.setItem('loginMethod', method);
    sessionStorage.setItem('isLoggedIn', 'true');
    if (extras?.socialProvider) {
      setSocialProvider(extras.socialProvider);
      sessionStorage.setItem('socialProvider', extras.socialProvider);
    }
    completeCustomerSignup(wallet);
    fetchDashboard(wallet);
    fetchWalletStatus(wallet);
    checkAutoSignStatus(wallet, method);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('loginMethod');
    sessionStorage.removeItem('socialProvider');
    sessionStorage.removeItem('isLoggedIn');
    setWalletAddress('');
    setIsLoggedIn(false);
    setDashboardData(null);
    setWalletStatus(null);
    setLoginMethod(null);
    setSocialProvider(null);
    setShowBalances(false);
    setSidebarOpen(false);
    setLoading(false);
  };

  const handleDisconnectWallet = () => {
    // Clear success flag so it shows again on reconnect
    if (walletAddress) {
      localStorage.removeItem(`onboarding_success_shown_affiliate_${walletAddress}`);
    }
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('loginMethod');
    sessionStorage.removeItem('socialProvider');
    setWalletAddress('');
    setLoginMethod(null);
    setSocialProvider(null);
  };

  const handleCopyLink = (link: string, code: string) => {
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleCopyAddress = () => {
  navigator.clipboard.writeText(walletAddress);
  setCopiedAddress(true);
  setTimeout(() => setCopiedAddress(false), 2000);
};

const deleteAffiliateData = async () => {
  setDeleting(true);
  try {
    const res = await fetch(`${API_URL}/affiliate/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: walletAddress,
        confirm: 'DELETE'
      })
    });

    const data = await res.json();
    if (data.success) {
      sessionStorage.removeItem('walletAddress');
      sessionStorage.removeItem('loginMethod');
      sessionStorage.removeItem('socialProvider');
      sessionStorage.removeItem('isLoggedIn');
      window.location.href = '/affiliate-dashboard';
    } else {
      setError(data.error || 'Failed to delete data');
      setShowDeleteModal(false);
    }
  } catch (err) {
    setError('Failed to delete data');
    setShowDeleteModal(false);
  }
  setDeleting(false);
};

  const formatBalance = (amount: number, prefix = '$') => showBalances ? `${prefix}${amount.toFixed(2)}` : '****';
  const formatXRP = (amount: number) => showBalances ? `${amount.toFixed(2)} XRP` : '****';
  const abbreviateWallet = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const isJoined = (storeId: string) => dashboardData?.stores.some(s => s.store_id === storeId) || false;
  const filteredStores = publicStores.filter(s => 
    s.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.store_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectXaman = async () => {
    setConnectingXaman(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/xaman/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'affiliate_dashboard' })
      });
      const data = await res.json();
      if (data.success) {
        setXamanQR(data.qr_png);
        setXamanDeepLink(data.deep_link);
        setXamanLoginId(data.login_id);
      } else {
        setError(data.error || 'Failed to start Xaman login');
        setConnectingXaman(false);
      }
    } catch (err) {
      setError('Failed to connect to Xaman');
      setConnectingXaman(false);
    }
  };

  const cancelXamanConnection = () => {
    setConnectingXaman(false);
    setXamanQR(null);
    setXamanDeepLink(null);
    setXamanLoginId(null);
  };

  useEffect(() => {
    if (!xamanLoginId || !connectingXaman) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/xaman/login/poll/${xamanLoginId}`);
        const data = await res.json();
        if (data.status === 'signed' && data.wallet_address) {
          clearInterval(interval);
          setConnectingXaman(false);
          setXamanQR(null);
          setXamanLoginId(null);
          sessionStorage.setItem('walletAddress', data.wallet_address);
          sessionStorage.setItem('loginMethod', 'xaman');
          sessionStorage.removeItem('socialProvider');
          setWalletAddress(data.wallet_address);
          setLoginMethod('xaman');
          setSocialProvider(null);
          fetchDashboard(data.wallet_address);
          fetchWalletStatus(data.wallet_address);
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          clearInterval(interval);
          setError(data.status === 'expired' ? 'QR code expired. Please try again.' : 'Connection cancelled.');
          setConnectingXaman(false);
          setXamanQR(null);
          setXamanLoginId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [xamanLoginId, connectingXaman]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setSidebarOpen(false);
  };

  const handleNavClick = (id: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else {
      // Map nav IDs to collapsible section IDs
      const sectionIdMap: Record<string, string> = {
        'top-up': 'top-up-inner',
        'withdraw': 'withdraw',
        'tap-to-pay': 'tap-to-pay',
        'browser-wallet': 'browser-wallet',
        'xaman-wallet': 'xaman-wallet',
        'payment-cards': 'payment-cards',
      };
      const sectionId = sectionIdMap[id] || id;
      setOpenSections(prev => ({ ...prev, [sectionId]: true }));
      // Wait for section to expand before scrolling
      setTimeout(() => scrollToSection(sectionId), 150);
    }
    // Only close sidebar on mobile
    setSidebarOpen(false);
    // Don't collapse on desktop - let user control it
  };

  // Navigation items for Sidebar component
  const navItems = [
    { id: 'earnings', label: 'Total Earnings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'wallet-status', label: 'Wallet Status', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, show: !!walletStatus },
    { id: 'top-up', label: 'Top Up Wallet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>, show: !!walletStatus },
    { id: 'withdraw', label: 'Withdraw', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>, show: !!walletStatus },
    { id: 'payment-cards', label: 'Payment Cards', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    { id: 'tap-to-pay', label: 'Tap-to-Pay', icon: <img src="/dltpayslogo1.png" alt="Tap to Pay" className="w-5 h-5 rounded object-cover" /> },
    { id: 'browser-wallet', label: 'Browser Wallet', icon: <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" /> },
    { id: 'xaman-wallet', label: 'Manual Wallet', icon: <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-5 h-5 rounded" /> },
    { id: 'earn-interest', label: 'Earn Interest', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>, badge: 'Soon' },
    { id: 'discover', label: 'Discover Vendors', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { id: 'payouts', label: 'Recent Payouts', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, show: !!(dashboardData && dashboardData.stores.length > 0) },
    { id: 'danger-zone', label: <span className="text-red-400">Danger Zone</span>, icon: <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
  ].filter(item => item.show !== false);

  // RENDER: Loading
if (loading) {
return (
<div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
<div className="text-center">
<div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
<p className="text-zinc-400">Loading dashboard...</p>
</div>
</div>
    );
  }

  // RENDER: Login screen
  if (!isLoggedIn) {
return <LoginScreen onLogin={handleLogin} />;
  }

  // RENDER: Main dashboard
  return (
    <>
      <NebulaBackground opacity={0.3} />
      <DashboardHeader dashboardType="affiliate" walletAddress={walletAddress} onSignOut={handleSignOut} showBalances={showBalances} onToggleBalances={() => setShowBalances(!showBalances)} allMilestonesComplete={allMilestonesComplete} setupComplete={setupComplete} />
      <AffiliateDashboardTour 
  run={runTour} 
  onComplete={() => {
    setRunTour(false);  // This must happen!
    localStorage.setItem(`tour_completed_${walletAddress}`, 'true');
  }}
  hasJoinedVendor={!!(dashboardData && dashboardData.stores.length > 0)}
/>
      <div className="min-h-screen bg-transparent text-white font-sans relative z-10">
        {/* Celebration Toast */}
        {celebrateMilestone && <CelebrationToast milestone={celebrateMilestone} onClose={() => setCelebrateMilestone(null)} />}
        
        {/* Info Modal */}
        {activeInfo && getContent() && <InfoModal content={getContent()!} isOpen={!!activeInfo} onClose={closeInfo} />}

        {/* Sidebar Component */}
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          dashboardType="affiliate"
          storeName="Member"
          walletAddress={walletAddress}
          navItems={navItems}
          onNavClick={handleNavClick}
          onSignOut={handleSignOut}
          onInfoClick={openInfo}
          onLogoClick={() => {}}
          onTakeTour={() => {
  setSidebarOpen(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Force reset then set true
  setRunTour(false);
  setTimeout(() => setRunTour(true), 100);
  if (walletAddress) {
    localStorage.removeItem(`milestones_dismissed_customer_${walletAddress}`);
    setProgressHidden(false);
  }
}}
          onShowProgress={() => {
            if (walletAddress) {
              localStorage.removeItem(`milestones_dismissed_customer_${walletAddress}`);
              setProgressHidden(false);
            }
          }}
        />

        {/* Main Content */}
        <main className={`min-h-screen pt-2 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
          <div className={`max-w-3xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-4 pb-8 ${progressHidden ? 'pt-16' : 'pt-24'}`}>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* MILESTONE CHECKLIST */}
            {!progressHidden && walletAddress && (
              <MilestoneChecklist
  type="customer"
  forceCollapsed={setupComplete}
  onAllComplete={(complete) => {
    if (complete && walletAddress) {
      const dismissedKey = `milestones_celebrated_${walletAddress}`;
      const alreadyCelebrated = localStorage.getItem(dismissedKey);
      if (!alreadyCelebrated) {
        setAllMilestonesComplete(true);
        localStorage.setItem(dismissedKey, 'true');
      }
    }
  }}
  storeId={walletAddress}
                walletAddress={walletAddress}
                autoSignEnabled={autoSignEnabled}
                walletFunded={walletStatus?.funded || false}
                trustlineSet={walletStatus?.rlusd_trustline || false}
                tapPayEnabled={autoSignEnabled}
                nfcCardAdded={false} // TODO: track NFC card state
                joinedAffiliate={!!(dashboardData && dashboardData.stores.length > 0)}
                onMilestoneAchieved={(milestone) => setCelebrateMilestone(milestone)}
                onInfoClick={openInfo}
                onDismiss={() => {
                  localStorage.setItem(`milestones_dismissed_customer_${walletAddress}`, 'true');
                  setProgressHidden(true);
                }}
              />
            )}

            {/* PENDING SIGNUP STATUS */}
            <MyPendingStatus walletAddress={walletAddress} email={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('email') || undefined} />

            {/* AUTO-SIGN SETUP PROMPT */}
            {/* AUTO-SIGN SETUP PROMPT */}
            {isLoggedIn && (
  <OnboardingSetup
    walletAddress={walletAddress}
    walletStatus={walletStatus}
    autoSignEnabled={autoSignEnabled}
    loginMethod={loginMethod as 'xaman' | 'crossmark' | 'web3auth' | null}
    onSetupComplete={() => {
      setAutoSignEnabled(true);
      setShowAutoSignPrompt(false);
      fetchWalletStatus(walletAddress);
    }}
    onRefreshWallet={() => fetchWalletStatus(walletAddress)}
    onSetupStatusChange={(isComplete) => setSetupComplete(isComplete)}
    storagePrefix="affiliate"
    onVendorEnableAutoPay={walletAddress ? setupAutoSignWeb3Auth : undefined}
  />
)}

            {/* ============================================================= */}
            {/* EARNINGS GROUP */}
            {/* ============================================================= */}
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 mt-2">Earnings</h3>
            <div id="earnings" className="mb-6">
              {dashboardData && dashboardData.stores.length > 0 ? (
                <div className="bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Total Earned</p>
                      <p className="text-4xl font-bold">{formatBalance(dashboardData.total_earned)}</p>
                      <p className="text-zinc-400 text-sm mt-1">RLUSD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-sm mb-1">Active Vendors</p>
                      <p className="text-2xl font-bold">{dashboardData.stores.length}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowDiscover(true); fetchPublicStores(); setTimeout(() => scrollToSection('discover'), 100); }} className="w-full bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 rounded-xl p-6 text-left hover:border-emerald-400/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-400 font-bold text-lg mb-1">🚀 Join the Affiliate Program</p>
                      <p className="text-zinc-300 text-sm mb-2">Earn commissions 5 levels deep into the chain</p>
                      <p className="text-zinc-500 text-sm">Build passive income by referring customers to your favourite vendors</p>
                    </div>
                    <div className="text-emerald-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* ============================================================= */}
            {/* WALLET & PAYMENTS - Two Column Layout */}
            {/* ============================================================= */}
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Wallet</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
              {/* LEFT COLUMN: Wallet Status */}
              <div id="wallet-status" className="h-full">
                {walletStatus && (
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 h-full flex flex-col">
                    <div id="wallet-balances">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-400">Wallet Status</h3>
                          {loginMethod === 'web3auth' && socialProvider && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded capitalize flex items-center gap-1.5">
                              <SocialIcon provider={socialProvider} size="sm" />
                              {socialProvider}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => fetchWalletStatus(walletAddress, true)} className="text-zinc-400 hover:text-white transition-colors p-1" title="Refresh" disabled={refreshingWallet}>
                            <svg className={`w-5 h-5 ${refreshingWallet ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                          <button onClick={() => setShowBalances(!showBalances)} className="text-zinc-400 hover:text-white transition-colors p-1">
                            <EyeIcon open={showBalances} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">XRP Balance</p>
                          <p className={`text-lg font-bold ${walletStatus.funded ? 'text-white' : 'text-orange-400'}`}>{walletStatus.funded ? formatXRP(walletStatus.xrp_balance) : 'Not Funded'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">RLUSD Balance</p>
                          <p className="text-lg font-bold text-white">{formatBalance(walletStatus.rlusd_balance)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">RLUSD Trustline</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${walletStatus.rlusd_trustline ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                            <span className={walletStatus.rlusd_trustline ? 'text-emerald-400 text-sm' : 'text-orange-400 text-sm'}>{walletStatus.rlusd_trustline ? 'Set' : 'Not Set'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">Pending</p>
                          {walletStatus.pending_commissions ? (
                            <p className="text-lg font-bold text-amber-400">{formatBalance(walletStatus.pending_commissions.total)}</p>
                          ) : (
                            <p className="text-zinc-500 text-sm">None</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex-1 min-w-[80px]">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                        <div><p className="text-emerald-400 text-xs font-semibold">Instant</p></div>
                      </div>
                      <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2 flex-1 min-w-[80px]">
                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                        <div><p className="text-sky-400 text-xs font-semibold">Secure</p></div>
                      </div>
                      <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2 flex-1 min-w-[80px]">
                        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div><p className="text-violet-400 text-xs font-semibold">24/7</p></div>
                      </div>
                    </div>

                    {/* Earn Interest - grows to fill remaining space */}
<div id="earn-interest" className="mt-4 pt-4 border-t border-zinc-800 flex-1">
  <EarnInterest noBorder rightColumnRef={rightColumnRef} openSections={openSections} dashboardType="affiliate" />
</div>

                    {!walletStatus.funded && (
                      <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                        <p className="text-orange-400 text-sm">💡 Your wallet is not funded yet. Commissions will accumulate until you reach {walletStatus.pending_commissions?.threshold || 1.2} XRP.</p>
                      </div>
                    )}
                    {walletStatus.funded && !walletStatus.rlusd_trustline && (
                      <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-amber-400 text-sm">⚠️ Set up your RLUSD trustline to receive instant payments. <a href="https://xrpl.services/?issuer=rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De&currency=RLUSD&limit=10000000" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-amber-300">Set trustline →</a></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Payments + Manage Funds in ONE card, same height as Wallet Status */}
<div ref={rightColumnRef} id="top-up" className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-5 h-full">
                {walletStatus && (
                  <div>
                    {/* PAYMENTS */}
                    <h3 className="text-sm font-semibold text-zinc-400 mb-4">Payments</h3>
                    <div className="space-y-3">
                      {/* TAP-TO-PAY */}
                      <CollapsibleSection dashboardType="affiliate" id="tap-to-pay" title="Tap-to-Pay Wallet" size="tall" icon={<img src="/dltpayslogo1.png" alt="Tap to Pay" className="w-5 h-5 rounded object-cover" />} isOpen={openSections['tap-to-pay']} onToggle={() => toggleSection('tap-to-pay')}>
                        <div className="px-0 py-3">
                          <div className="flex items-center gap-2 text-zinc-300 text-sm mb-4">
  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  <span>Auto-pay limit: <strong className="text-white">£25</strong> per transaction</span>
</div>
                          {loginMethod === 'web3auth' ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-400 text-sm"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Connected via {socialProvider || 'Social'}</div>
                              <button onClick={handleDisconnectWallet} className="text-zinc-400 hover:text-red-400 text-sm transition-colors">Disconnect</button>
                            </div>
                          ) : (
                            <button onClick={async () => {
                              try {
                                const { loginWithWeb3Auth } = await import('@/lib/web3auth');
                                const result = await loginWithWeb3Auth();
                                if (!result) return;
                                const address = typeof result === 'string' ? result : result.address;
                                const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
                                sessionStorage.setItem('walletAddress', address);
                                sessionStorage.setItem('loginMethod', 'web3auth');
                                sessionStorage.setItem('socialProvider', provider);
                                setWalletAddress(address);
                                setLoginMethod('web3auth');
                                setSocialProvider(provider);
                                fetchDashboard(address);
                                fetchWalletStatus(address);
                              } catch (err) { console.error('Web3Auth error:', err); }
                            }} className="w-full bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 hover:border-emerald-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-3">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                </div>
                                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                </div>
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                                  <span className="text-white text-[8px] font-bold">+10</span>
                                </div>
                              </div>
                              Connect to Tap-to-Pay
                            </button>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* CROSSMARK */}
                      <CollapsibleSection dashboardType="affiliate" id="browser-wallet" title="Browser Wallet" size="tall" icon={<img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" />} isOpen={openSections['browser-wallet']} onToggle={() => toggleSection('browser-wallet')}>
                        <div className="px-0 py-3">
                          <p className="text-zinc-400 text-sm mb-4">Crossmark browser extension for XRP Ledger.</p>
                          {loginMethod === 'crossmark' ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-400 text-sm"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Connected</div>
                              <button onClick={handleDisconnectWallet} className="text-zinc-400 hover:text-red-400 text-sm transition-colors">Disconnect</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={async () => {
                                try {
                                  const sdk = (window as any).xrpl?.crossmark;
                                  if (!sdk) { window.open('https://crossmark.io', '_blank'); return; }
                                  const response = await sdk.methods.signInAndWait();
                                  if (response?.response?.data?.address) {
                                    const newAddress = response.response.data.address;
                                    sessionStorage.setItem('walletAddress', newAddress);
                                    sessionStorage.setItem('loginMethod', 'crossmark');
                                    sessionStorage.removeItem('socialProvider');
                                    setWalletAddress(newAddress);
                                    setLoginMethod('crossmark');
                                    setSocialProvider(null);
                                    fetchDashboard(newAddress);
                                    fetchWalletStatus(newAddress);
                                  }
                                } catch (err) { console.error('Crossmark error:', err); }
                              }} className="w-full bg-white hover:bg-zinc-200 text-black py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" />Connect Browser Wallet</button>
                              <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="block text-center text-zinc-400 hover:text-zinc-300 text-sm mt-3">Get Crossmark →</a>
                            </>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* XAMAN */}
                      <CollapsibleSection dashboardType="affiliate" id="xaman-wallet" title="Manual Wallet" size="tall" icon={<img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-5 h-5 rounded" />} isOpen={openSections['xaman-wallet']} onToggle={() => toggleSection('xaman-wallet')}>
                        <div className="px-0 py-3">
                          {connectingXaman && xamanQR ? (
                            <div className="text-center py-4">
                              <p className="text-zinc-300 mb-4">Scan with Xaman app</p>
                              <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg max-w-[180px]" />
                              <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mb-4"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>Waiting...</div>
                              {xamanDeepLink && <a href={xamanDeepLink} className="text-sky-400 text-sm hover:underline block mb-4">Open in Xaman →</a>}
                              <button onClick={cancelXamanConnection} className="text-zinc-500 text-sm hover:text-white">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <p className="text-zinc-400 text-sm mb-4">Approve each transaction manually with push notifications.</p>
                              {loginMethod === 'xaman' ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-emerald-400 text-sm"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Connected</div>
                                  <button onClick={handleDisconnectWallet} className="text-zinc-400 hover:text-red-400 text-sm transition-colors">Disconnect</button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={connectXaman} disabled={connectingXaman} className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    {connectingXaman && !xamanQR ? (<><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>Connecting...</>) : 'Connect Manual Wallet'}
                                  </button>
                                  <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="block text-center text-zinc-400 hover:text-zinc-300 text-sm mt-3">Get Xaman →</a>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* NFC PAYMENT CARDS */}
                      <CollapsibleSection dashboardType="affiliate" id="payment-cards" title="Payment Cards" size="tall" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} isOpen={openSections['payment-cards']} onToggle={() => toggleSection('payment-cards')}>
                        {walletAddress ? <LinkNFCCard walletAddress={walletAddress} noBorder /> : <p className="text-zinc-500 text-sm p-4">Connect a wallet to link your NFC cards</p>}
                      </CollapsibleSection>
                    </div>

                    {/* MANAGE FUNDS - below payments */}
                    <div className="mt-6 pt-4 border-t border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-400 mb-4">Manage Funds</h3>
                      <div className="space-y-3">
                      <CollapsibleSection dashboardType="affiliate" id="top-up-inner" title="Top Up Wallet" size="tall" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>} isOpen={openSections['top-up-inner']} onToggle={() => toggleSection('top-up-inner')}>
                        <TopUpRLUSD walletAddress={walletAddress} xrpBalance={walletStatus.xrp_balance} rlusdBalance={walletStatus.rlusd_balance} showAmounts={showBalances} onToggleAmounts={() => setShowBalances(!showBalances)} onRefresh={() => fetchWalletStatus(walletAddress)} />
                      </CollapsibleSection>
                      <CollapsibleSection dashboardType="affiliate" id="withdraw" title="Withdraw" size="tall" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>} isOpen={openSections['withdraw']} onToggle={() => toggleSection('withdraw')}>
                        <WithdrawRLUSD walletAddress={walletAddress} rlusdBalance={walletStatus.rlusd_balance} loginMethod={loginMethod as 'xaman' | 'crossmark' | 'web3auth' | null} showAmounts={showBalances} onToggleAmounts={() => setShowBalances(!showBalances)} onRefresh={() => fetchWalletStatus(walletAddress)} />
                      </CollapsibleSection>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================= */}
            {/* VENDORS GROUP */}
            {/* ============================================================= */}
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Vendors</h3>
            
            {/* YOUR VENDORS */}
            {dashboardData && dashboardData.stores.length > 0 && (
              <div id="vendors" className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">My Affiliate Programs</h2>
                  <button 
  onClick={() => { setShowDiscover(!showDiscover); if (!showDiscover) fetchPublicStores(); }} 
  className="group relative"
>
  {showDiscover ? (
    <span className="text-zinc-400 hover:text-white text-sm transition-colors">Hide ✕</span>
  ) : (
    <svg 
      viewBox="0 0 180 42" 
      className="w-auto h-10 transition-all duration-300 hover:scale-105"
    >
      <defs>
        <linearGradient id="discoverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect 
        x="1" 
        y="1" 
        width="178" 
        height="40" 
        rx="8" 
        fill="rgba(24, 24, 27, 0.6)"
        stroke="url(#discoverGradient)"
        strokeWidth="1.5"
        className="transition-all duration-300 group-hover:fill-zinc-800/80"
      />
      
      <circle cx="15" cy="21" r="1.5" fill="#3b82f6" opacity="0.4" />
      <circle cx="165" cy="21" r="1.5" fill="#8b5cf6" opacity="0.4" />
      
      <text 
        x="35" 
        y="26" 
        fill="url(#discoverGradient)"
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="600" 
        fontSize="14"
        letterSpacing="0.5"
        filter="url(#glow)"
      >
        Discover More
      </text>
      
      <g transform="translate(145, 16)" className="transition-transform duration-300 group-hover:translate-x-1">
        <path 
          d="M0 5 L8 5 M5 2 L8 5 L5 8" 
          stroke="url(#discoverGradient)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  )}
</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dashboardData.stores.map((store, i) => (
                    <div 
  key={`${store.store_id}-${i}`} 
  className="group relative bg-zinc-900/70 border border-zinc-800 hover:border-sky-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)] hover:scale-[1.02]"
>
  {/* Gradient glow on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-purple-500/0 to-emerald-500/0 group-hover:from-sky-500/5 group-hover:via-purple-500/5 group-hover:to-emerald-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
  
  <div className="relative flex items-start gap-4 mb-4">
    {/* Store Logo */}
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
      {store.logo_url ? (
        <img src={store.logo_url} alt={store.store_name} className="w-full h-full rounded-xl object-cover" />
      ) : (
        <span className="text-2xl font-bold bg-gradient-to-br from-sky-400 to-purple-400 bg-clip-text text-transparent">
          {store.store_name.charAt(0)}
        </span>
      )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate group-hover:text-sky-400 transition-colors">
            {store.store_name}
          </h3>
          <p className="text-zinc-500 text-sm truncate">{store.store_url}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-emerald-400">{formatBalance(store.total_earned)}</p>
          <p className="text-zinc-500 text-sm">earned</p>
        </div>
      </div>
      
      {/* Level Badge */}
      <div className="flex items-center gap-2 mt-2">
        <div className="bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400">
          Level {store.level}
        </div>
        {store.commission_rates && store.commission_rates[0] && (
          <div className="text-zinc-500 text-xs">
            {store.commission_rates[0]}% commission
          </div>
        )}
      </div>
    </div>
  </div>
  
  {/* Referral Link Section */}
  <div className="relative bg-zinc-800/50 border border-zinc-700/50 group-hover:border-sky-500/30 rounded-lg p-3 transition-colors">
    {/* Gradient accent line */}
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/0 via-sky-500/50 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
    
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="flex-1 min-w-0">
        <p className="text-zinc-400 text-xs mb-1">Your Referral Link</p>
        <p className="text-sm font-mono truncate text-sky-400">{store.referral_link}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button 
          onClick={() => handleCopyLink(store.referral_link, store.referral_code)} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copiedCode === store.referral_code 
              ? 'bg-emerald-500 text-black scale-95' 
              : 'bg-zinc-700 hover:bg-zinc-600 text-white hover:scale-105'
          }`}
        >
          {copiedCode === store.referral_code ? '✓ Copied' : 'Copy'}
        </button>
        <button 
          onClick={() => { setQrUrl(store.referral_link); setQrStoreName(store.store_name); setShowQRModal(true); }} 
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
        >
          QR
        </button>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-xs">
      <p className="text-zinc-500">
        Code: <span className="font-mono text-zinc-300 bg-zinc-900/50 px-2 py-0.5 rounded">{store.referral_code}</span>
      </p>
    </div>
  </div>
</div>
                  ))}
                </div>
              </div>
            )}

            {/* DISCOVER VENDORS */}
            <div id="discover">
              {showDiscover && (
                <section className="mb-6">
<div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{dashboardData?.stores.length ? 'Discover More Vendors' : 'Join a Vendor to Start Earning'}</h2>
                    {dashboardData?.stores.length ? <button onClick={() => setShowDiscover(false)} className="text-zinc-400 hover:text-white text-sm">Close ✕</button> : null}
                  </div>
                  <div className="mb-4">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900/70 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500" />
                  </div>
                  {filteredStores.length === 0 ? (
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 text-center">
                      <p className="text-zinc-400">{publicStores.length === 0 ? 'Loading vendors...' : 'No vendors found matching your search.'}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredStores.map((store) => (
                        <div key={store.store_id} className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg">{store.store_name}</h3>
                            <p className="text-zinc-500 text-sm truncate">{store.store_url}</p>
                          </div>
                          <div className="flex items-center gap-4 mb-4 text-sm">
                            <div><span className="text-zinc-500">L1: </span><span className="text-emerald-400 font-medium">{store.commission_rates[0]}%</span></div>
                            <div><span className="text-zinc-500">Affiliates: </span><span className="text-white">{store.affiliates_count}</span></div>
                          </div>
                          {isJoined(store.store_id) ? (
                            <button disabled className="w-full bg-zinc-700 text-zinc-400 py-2 px-4 rounded-lg text-sm font-medium">✓ Already Joined</button>
                          ) : (
                            <button onClick={() => handleJoinStore(store.store_id)} disabled={joiningStore === store.store_id} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                              {joiningStore === store.store_id ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Joining...</span> : 'Join as Affiliate'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
              {(!dashboardData || dashboardData.stores.length === 0) && !showDiscover && (
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-8 text-center mb-6">
                  <p className="text-zinc-400 mb-4">You haven&apos;t joined any vendor programs yet.</p>
                  <button onClick={() => { setShowDiscover(true); fetchPublicStores(); }} className="bg-sky-600 hover:bg-sky-500 text-white py-3 px-6 rounded-lg font-medium transition-colors">Discover Vendors</button>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* HISTORY GROUP */}
            {/* ============================================================= */}
            {dashboardData && dashboardData.stores.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">History</h3>
                <CollapsibleSection dashboardType="affiliate" id="payouts" title="Recent Payouts" videoBg="/nebula-bgActivityButton.webm" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} isOpen={openSections['payouts']} onToggle={() => toggleSection('payouts')}>
                  <PayoutsTable payouts={dashboardData.recent_payouts} showBalances={showBalances} />
                </CollapsibleSection>
              </>
            )}

            {/* Danger Zone */}
            <div className="mt-4">
            <CollapsibleSection 
              dashboardType="affiliate"
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
              <div className="p-4">
                <p className="text-zinc-400 text-sm mb-4">
                  Permanently delete your affiliate account and all associated data including earnings history, referral links, and wallet connection. This action cannot be undone.
                </p>
                <button
  onClick={() => setShowDeleteModal(true)}
  disabled={loading}
                  className="bg-zinc-900/95 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Permanently Delete My Data
                </button>
              </div>
            </CollapsibleSection>
            </div>

          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
<DeleteConfirmModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={deleteAffiliateData}
  title="Delete All Data"
  description="This will permanently delete all your affiliate data, earnings history, referral links, and disconnect your wallet. This action cannot be undone."
  loading={deleting}
/>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Receive</h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-zinc-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Share your wallet address or QR code to receive XRP or RLUSD.</p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`} alt="Wallet QR Code" className="w-full max-w-[200px] mx-auto" />
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 mb-4">
              <p className="text-zinc-500 text-xs mb-1">Your Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(walletAddress); setCopiedAddress(true); setTimeout(() => setCopiedAddress(false), 2000); }} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${copiedAddress ? 'bg-emerald-500 text-black' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>{copiedAddress ? '✓ Copied!' : 'Copy Address'}</button>
          </div>
        </div>
      )}

      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} url={qrUrl} title="Share Referral Link" subtitle={qrStoreName} />
    </>
  );
}