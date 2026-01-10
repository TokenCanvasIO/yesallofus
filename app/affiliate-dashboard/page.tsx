'use client';

import { useState, useEffect, useRef } from 'react';
import PayoutsTable from '@/components/PayoutsTable';
import DashboardHeader from "@/components/DashboardHeader";
import QRCodeModal from '@/components/QRCodeModal';
import LinkNFCCard from '@/components/LinkNFCCard';
import TapToPaySettings from '@/components/TapToPaySettings';
import LoginScreen from '@/components/LoginScreen';
import MyPendingStatus from '@/components/MyPendingStatus';
import EarnInterest from '@/components/EarnInterest';
import TopUpRLUSD from '@/components/TopUpRLUSD';
import WithdrawRLUSD from '@/components/WithdrawRLUSD';

const API_URL = 'https://api.dltpays.com/api/v1';

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

interface WalletStatus {
  funded: boolean;
  xrp_balance: number;
  rlusd_trustline: boolean;
  rlusd_balance: number;
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

// Eye icon component
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

// Social provider icon
const SocialIcon = ({ provider, size = 'sm' }: { provider: string; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  
  switch (provider?.toLowerCase()) {
    case 'google':
      return (
        <div className={`${sizeClasses} bg-white rounded-full flex items-center justify-center`}>
          <svg className={iconSize} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      );
    case 'apple':
      return (
        <div className={`${sizeClasses} bg-black rounded-full flex items-center justify-center border border-zinc-700`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
      );
    case 'github':
      return (
        <div className={`${sizeClasses} bg-[#24292e] rounded-full flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </div>
      );
    case 'discord':
      return (
        <div className={`${sizeClasses} bg-[#5865F2] rounded-full flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
      );
    case 'twitter':
      return (
        <div className={`${sizeClasses} bg-black rounded-full flex items-center justify-center border border-zinc-700`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      );
    case 'facebook':
      return (
        <div className={`${sizeClasses} bg-[#1877F2] rounded-full flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${sizeClasses} bg-zinc-700 rounded-full flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrStoreName, setQrStoreName] = useState('');

   // Wallet refresh
  const [refreshingWallet, setRefreshingWallet] = useState(false);
  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState<'XRP' | 'RLUSD'>('RLUSD');
  const [withdrawing, setWithdrawing] = useState(false);

  // Add auto sign
const [autoSignEnabled, setAutoSignEnabled] = useState(false);
const [settingUpAutoSign, setSettingUpAutoSign] = useState(false);
const [showAutoSignPrompt, setShowAutoSignPrompt] = useState(false);
  
  // Ref to prevent double registration
  const registeringRef = useRef(false);

  // At the TOP of the component, save URL params before they get lost
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const storeId = urlParams.get('store');
  const join = urlParams.get('join');
  
  // Save params for after login
  if (email && join === '1') {
    sessionStorage.setItem('pendingSignup', JSON.stringify({ email, storeId }));
  }
}, []);

    // Update completeCustomerSignup to check sessionStorage
const completeCustomerSignup = async (wallet: string) => {
  // First check URL params
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get('email');
  let storeId = urlParams.get('store');
  let join = urlParams.get('join');
  
  // If not in URL, check sessionStorage (saved before login)
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
      body: JSON.stringify({
        email: email,
        wallet_address: wallet,
        store_id: storeId || null
      })
    });
    
    const data = await res.json();
    
    if (data.success && data.card_linked) {
      console.log('✅ NFC card linked to wallet:', data.card_uid);
    }
    
    // Clean up
    sessionStorage.removeItem('pendingSignup');
    
    // Clean up URL params
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('email');
    newUrl.searchParams.delete('store');
    newUrl.searchParams.delete('join');
    window.history.replaceState({}, '', newUrl.toString());
    
  } catch (err) {
    console.error('Failed to complete customer signup:', err);
  }
};

// Check auto-sign status after login
const checkAutoSignStatus = async (wallet: string, method: string) => {
  if (method !== 'web3auth') return;
  
  try {
    const res = await fetch(`https://api.dltpays.com/nfc/api/v1/customer/autosign-status/${wallet}`);
    const data = await res.json();
    if (data.success) {
      setAutoSignEnabled(data.auto_signing_enabled);
      if (!data.auto_signing_enabled) {
        setShowAutoSignPrompt(true);
      }
    }
  } catch (err) {
    console.error('Failed to check auto-sign status:', err);
  }
};

// Setup auto-sign for Web3Auth users
const setupAutoSignWeb3Auth = async () => {
  if (!walletAddress) return;

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
      console.log('Setting up RLUSD for wallet...');
      
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
      
      console.log('RLUSD enabled successfully');
      // Wait for ledger
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get platform signer address from API
    const settingsRes = await fetch(`https://api.dltpays.com/nfc/api/v1/customer/setup-autosign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress })
    });
    const settingsData = await settingsRes.json();
    
    if (settingsData.error) {
      throw new Error(settingsData.error);
    }

    // If signer already exists, we're done
    if (settingsData.signer_exists || settingsData.auto_sign_enabled) {
      setAutoSignEnabled(true);
      setShowAutoSignPrompt(false);
      setSettingUpAutoSign(false);
      return;
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
};

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('walletAddress');
    const storedMethod = sessionStorage.getItem('loginMethod');
    const storedProvider = sessionStorage.getItem('socialProvider');
    const storedLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (storedLoggedIn === 'true') {
      setIsLoggedIn(true);
    }
    
    if (stored) {
      setWalletAddress(stored);
      setIsLoggedIn(true);
      if (storedMethod) setLoginMethod(storedMethod);
      if (storedProvider) setSocialProvider(storedProvider);
      
      // Complete customer signup if coming from email link
      completeCustomerSignup(stored);
      
      Promise.all([
        fetchDashboard(stored),
        fetchWalletStatus(stored)
      ]);
      
      // Check auto-sign status for Web3Auth users on page load
      if (storedMethod === 'web3auth') {
        checkAutoSignStatus(stored, storedMethod);
      }
    } else {
      setLoading(false);
    }
    
    // Interval to check for wallet changes (e.g., from another tab)
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

  // API calls
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

  // Handlers
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
  
  // Complete customer signup if from email link
  completeCustomerSignup(wallet);
  
  fetchDashboard(wallet);
  fetchWalletStatus(wallet);
  
  // Check auto-sign status for Web3Auth users
checkAutoSignStatus(wallet, method);
};

  // Sign out - exits dashboard completely
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

  // Disconnect wallet - stays on dashboard
  const handleDisconnectWallet = () => {
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('loginMethod');
    sessionStorage.removeItem('socialProvider');
    setWalletAddress('');
    setLoginMethod(null);
    setSocialProvider(null);
    // Keep isLoggedIn true, keep dashboard visible
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

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid address and amount');
      return;
    }

    setWithdrawing(true);
    setError('');

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        setError('Please reconnect your wallet');
        setWithdrawing(false);
        return;
      }

      const tx: any = {
        TransactionType: 'Payment',
        Account: walletAddress,
        Destination: withdrawAddress,
      };

      if (withdrawCurrency === 'XRP') {
        tx.Amount = Math.floor(parseFloat(withdrawAmount) * 1_000_000).toString();
      } else {
        tx.Amount = {
          currency: 'RLUSD',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: withdrawAmount
        };
      }

      await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: tx }
      });

      await fetchWalletStatus(walletAddress);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      alert(`Successfully sent ${withdrawAmount} ${withdrawCurrency}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    }
    setWithdrawing(false);
  };

  // Helpers
  const formatBalance = (amount: number, prefix = '$') => showBalances ? `${prefix}${amount.toFixed(2)}` : '****';
  const formatXRP = (amount: number) => showBalances ? `${amount.toFixed(2)} XRP` : '****';
  const abbreviateWallet = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const isJoined = (storeId: string) => dashboardData?.stores.some(s => s.store_id === storeId) || false;
  const filteredStores = publicStores.filter(s => 
    s.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.store_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xaman connection
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

  // Poll for Xaman login
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
          
          // Update to Xaman wallet
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
      const headerOffset = 80; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setSidebarOpen(false);
  };

// Navigation icon component
const NavIcon = ({ name }: { name: string }) => {
  const iconClass = "w-5 h-5";
  
  switch (name) {
    case 'earnings':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'wallet':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'card':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'tap':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'settings':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'store':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'search':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'history':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'logout':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case 'crossmark':
      return (
        <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" />
      );
    case 'xaman':
      return (
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-5 h-5 rounded" />
      );
    default:
      return null;
  }
};

  const navItems = [
    { id: 'earnings', label: 'Total Earnings', icon: 'earnings' },
    { id: 'wallet-status', label: 'Wallet Status', icon: 'wallet', show: !!walletStatus },
    { id: 'top-up', label: 'Top Up Wallet', icon: 'wallet', show: !!walletStatus },
    { id: 'withdraw', label: 'Withdraw', icon: 'wallet', show: !!walletStatus },
    { id: 'payment-cards', label: 'Payment Cards', icon: 'card' },
    { id: 'tap-to-pay', label: 'Tap-to-Pay', icon: 'tap' },
    { id: 'browser-wallet', label: 'Browser Wallet', icon: 'crossmark' },
    { id: 'xaman-wallet', label: 'Manual Wallet', icon: 'xaman' },
    { id: 'earn-interest', label: (<span className="flex items-center gap-2">Earn Interest<span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full">Soon</span></span>), icon: 'earnings' },
    { id: 'discover', label: 'Discover Vendors', icon: 'search' },
    { id: 'payouts', label: 'Recent Payouts', icon: 'history', show: dashboardData && dashboardData.stores.length > 0 },
  ].filter(item => item.show !== false);

  // RENDER: Loading
  if (loading) {
    return (
      <>
        <DashboardHeader />
        <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // RENDER: Login screen (only if not logged in)
  if (!isLoggedIn) {
    return (
      <>
        <DashboardHeader />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  // RENDER: Main dashboard (stays visible even if wallet disconnected)
  return (
    <>
      <DashboardHeader 
        walletAddress={walletAddress} 
        onSignOut={handleSignOut}
        showBalances={showBalances}
        onToggleBalances={() => setShowBalances(!showBalances)}
      />
      
      <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-3 left-4 z-50 text-zinc-400 hover:text-white p-2 bg-zinc-900/80 rounded-lg backdrop-blur"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:rounded-tr-2xl lg:rounded-br-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-zinc-800">
            {/* Wallet Connection Display */}
            <div className="bg-zinc-800/50 rounded-lg p-3">
              {loginMethod === 'web3auth' && (
                <div className="flex items-center gap-3">
                  <SocialIcon provider={socialProvider || 'google'} size="md" />
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{socialProvider || 'Social'} Login</p>
                    <p className="text-zinc-500 text-xs font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
              )}
              {loginMethod === 'crossmark' && (
                <div className="flex items-center gap-3">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded-lg" />
                  <div>
                    <p className="text-white text-sm font-medium">Browser Wallet</p>
                    <p className="text-zinc-500 text-xs font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
              )}
              {loginMethod === 'xaman' && (
                <div className="flex items-center gap-3">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded-lg" />
                  <div>
                    <p className="text-white text-sm font-medium">Xaman Wallet</p>
                    <p className="text-zinc-500 text-xs font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              >
                <NavIcon name={item.icon} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 pt-6 border-t border-zinc-800 bg-zinc-900">
            {/* YAOFU Dashboard SVG */}
            <div className="mb-3 flex justify-center">
              <svg viewBox="0 0 140 48" className="w-32 h-12">
                <defs>
                  <linearGradient id="yaofuGradientAffiliate" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="40%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <text x="70" y="12" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="9" letterSpacing="1">
                  MEMBER
                </text>
                <text x="70" y="28" textAnchor="middle" fill="url(#yaofuGradientAffiliate)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="14" letterSpacing="3">
                  YAOFUS
                </text>
                <text x="70" y="43" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="10" letterSpacing="1.5">
                  DASHBOARD
                </text>
              </svg>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition">
              <NavIcon name="logout" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen pt-3 lg:pt-0">
  <div className="max-w-3xl lg:max-w-none mx-auto px-6 lg:px-4 pb-8 pt-0">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* PENDING SIGNUP STATUS */}
<MyPendingStatus 
  walletAddress={walletAddress} 
  email={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('email') || undefined}
/>
{/* AUTO-SIGN SETUP PROMPT - Show if Web3Auth but not auto-sign enabled */}
{loginMethod === 'web3auth' && showAutoSignPrompt && !autoSignEnabled && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-2xl">⚡</div>
      <div>
        <h3 className="text-lg font-bold text-amber-400">Enable Tap-to-Pay</h3>
        <p className="text-zinc-400 text-sm">One more step to enable instant NFC payments</p>
      </div>
    </div>
    
    <p className="text-zinc-300 text-sm mb-4">
      Sign once to enable automatic payments when you tap your NFC card. Without this, payments will fail.
    </p>
    
    <button
      onClick={setupAutoSignWeb3Auth}
      disabled={settingUpAutoSign}
      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
    >
      {settingUpAutoSign ? (
        <>
          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
          Setting up...
        </>
      ) : (
        '🔐 Enable Tap-to-Pay Now'
      )}
    </button>
  </div>
)}
            {/* 1. TOTAL EARNED */}
<div id="earnings">
  {dashboardData && dashboardData.stores.length > 0 ? (
    <div className="bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 rounded-xl p-6 mb-6">
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
    <button
      onClick={() => {
  setShowDiscover(true);
  fetchPublicStores();
  setTimeout(() => {
    scrollToSection('discover');
  }, 100);
}}
      className="w-full bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 rounded-xl p-6 mb-6 text-left hover:border-emerald-400/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-400 font-bold text-lg mb-1">🚀 Join the Affiliate Program</p>
          <p className="text-zinc-300 text-sm mb-2">Earn commissions 5 levels deep into the chain</p>
          <p className="text-zinc-500 text-sm">Build passive income by referring customers to your favourite vendors</p>
        </div>
        <div className="text-emerald-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>
  )}
</div>

            {/* ============================================================ */}
{/* FIX: WALLET STATUS SECTION WITH PROPER SPACING               */}
{/* Replace the wallet-status section in AffiliateDashboard.tsx  */}
{/* ============================================================ */}

{/* 2. WALLET STATUS */}
<div id="wallet-status">
  {walletStatus && (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
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
          <button
            onClick={() => fetchWalletStatus(walletAddress, true)}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Refresh"
            disabled={refreshingWallet}
          >
            <svg className={`w-5 h-5 ${refreshingWallet ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={() => setShowBalances(!showBalances)} className="text-zinc-400 hover:text-white transition-colors p-1">
            <EyeIcon open={showBalances} />
          </button>
        </div>
      </div>
      
      {/* Balance Grid - ADD mb-4 for spacing below */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-zinc-500 text-xs mb-1">XRP Balance</p>
          <p className={`text-lg font-bold ${walletStatus.funded ? 'text-white' : 'text-orange-400'}`}>
            {walletStatus.funded ? formatXRP(walletStatus.xrp_balance) : 'Not Funded'}
          </p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">RLUSD Trustline</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${walletStatus.rlusd_trustline ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
            <span className={walletStatus.rlusd_trustline ? 'text-emerald-400 text-sm' : 'text-orange-400 text-sm'}>
              {walletStatus.rlusd_trustline ? 'Set' : 'Not Set'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">RLUSD Balance</p>
          <p className="text-lg font-bold text-white">{formatBalance(walletStatus.rlusd_balance)}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">Pending</p>
          {walletStatus.pending_commissions ? (
            <div>
              <p className="text-lg font-bold text-amber-400">{formatBalance(walletStatus.pending_commissions.total)}</p>
              <p className="text-zinc-500 text-xs">{showBalances ? `$${walletStatus.pending_commissions.until_payout.toFixed(2)} until payout` : ''}</p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">None</p>
          )}
        </div>
      </div>

      {/* Web3Auth Actions */}
      {loginMethod === 'web3auth' && (
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-zinc-800/50 rounded-lg p-3">
              <p className="text-zinc-500 text-xs mb-1">Your Wallet</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{abbreviateWallet(walletAddress)}</span>
                <button onClick={handleCopyAddress} className={`p-1.5 rounded transition-colors ${copiedAddress ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}>
                  {copiedAddress ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReceiveModal(true)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                Receive
              </button>
              <button onClick={() => setShowWithdrawModal(true)} disabled={!walletStatus?.funded} className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {!walletStatus.funded && (
        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <p className="text-orange-400 text-sm">💡 Your wallet is not funded yet. Commissions will accumulate until you reach {walletStatus.pending_commissions?.threshold || 1.2} XRP, then we&apos;ll activate your wallet automatically.</p>
        </div>
      )}
      {walletStatus.funded && !walletStatus.rlusd_trustline && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-amber-400 text-sm">⚠️ Set up your RLUSD trustline to receive instant commission payments. <a href="https://xrpl.services/?issuer=rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De&currency=RLUSD&limit=10000000" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-amber-300">Set trustline →</a></p>
        </div>
      )}
    </div>
  )}
</div>

{/* TOP UP WALLET */}
            {walletStatus && (
              <div id="top-up" className="mb-6">
                <TopUpRLUSD
                  walletAddress={walletAddress}
                  xrpBalance={walletStatus.xrp_balance}
                  rlusdBalance={walletStatus.rlusd_balance}
                  showAmounts={showBalances}
                  onToggleAmounts={() => setShowBalances(!showBalances)}
                  onRefresh={() => fetchWalletStatus(walletAddress)}
                />
              </div>
            )}

            {/* WITHDRAW */}
            {walletStatus && (
              <div id="withdraw" className="mb-6">
                <WithdrawRLUSD
                  walletAddress={walletAddress}
                  rlusdBalance={walletStatus.rlusd_balance}
                  showAmounts={showBalances}
                  onToggleAmounts={() => setShowBalances(!showBalances)}
                  onRefresh={() => fetchWalletStatus(walletAddress)}
                />
              </div>
            )}

            {/* 3. NFC PAYMENT CARDS */}
            <div id="payment-cards">
              {walletAddress ? (
                <LinkNFCCard walletAddress={walletAddress} />
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">💳</div>
                    <div>
                      <h3 className="text-lg font-bold">Link NFC Cards</h3>
                      <p className="text-zinc-500 text-sm">Connect a wallet to link your NFC cards</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. TAP-TO-PAY WALLET (Web3Auth) */}
<div id="tap-to-pay">
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex -space-x-2">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-900">
          <span className="text-zinc-300 text-xs font-bold">+10</span>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">Tap-to-Pay Wallet</h2>
        <p className="text-zinc-400 text-sm">Enable instant NFC payments</p>
      </div>
    </div>

    {/* £25 Limit Notice */}
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-zinc-300 text-sm">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Auto-pay limit: <strong className="text-white">£25</strong> per transaction (no KYC required)
        </span>
      </div>
    </div>

    {loginMethod === 'web3auth' ? (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Connected via {socialProvider || 'Social'}
        </div>
        <button
          onClick={handleDisconnectWallet}
          className="text-zinc-400 hover:text-red-400 text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-2">
          <p className="text-blue-400 text-sm">
            ⚡ Connect with a social account to enable <strong>Tap-to-Pay</strong> - pay instantly by tapping your NFC card at any vendor.
          </p>
        </div>
        <button
          onClick={async () => {
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
            } catch (err) {
              console.error('Web3Auth error:', err);
            }
          }}
          className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Connect to Tap-to-Pay
        </button>
        <p className="text-zinc-500 text-xs text-center">
          Google, Apple, Discord, X and more
        </p>
      </div>
    )}
  </div>
</div>

            {/* 5. BROWSER WALLET (Crossmark) */}
            <div id="browser-wallet">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-12 h-12 rounded-lg" />
                  <div>
                    <h2 className="text-xl font-bold">Browser Wallet</h2>
                    <p className="text-zinc-400 text-sm">Receive commissions via Crossmark</p>
                  </div>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <p className="text-zinc-300 text-sm mb-3">
                    Crossmark is a browser extension wallet for the XRP Ledger. Use it to receive your affiliate commissions directly in your browser.
                  </p>
                  <ul className="text-zinc-400 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Instant commission payouts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Secure browser extension
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      No mobile app needed
                    </li>
                  </ul>
                </div>

                {loginMethod === 'crossmark' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Connected
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="text-zinc-400 hover:text-red-400 text-sm transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={async () => {
  try {
    const sdk = (window as any).xrpl?.crossmark;
    if (!sdk) {
      window.open('https://crossmark.io', '_blank');
      return;
    }
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
  } catch (err) {
    console.error('Crossmark error:', err);
  }
}}
                      className="w-full bg-white hover:bg-zinc-200 text-black py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Connect to Browser Wallet
                    </button>
                    <a 
                      href="https://crossmark.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-300 text-sm"
                    >
                      Don't have it? Get Crossmark →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 6. XAMAN WALLET (Manual Wallet) */}
            <div id="xaman-wallet">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-12 h-12 rounded-lg" />
                  <div>
                    <h2 className="text-xl font-bold">Manual Wallet</h2>
                    <p className="text-zinc-400 text-sm">Xaman - approve each transaction manually</p>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                {/* Xaman QR Code Display */}
                {connectingXaman && xamanQR && (
                  <div className="text-center py-4">
                    <p className="text-zinc-300 mb-4">Scan with Xaman app to connect</p>
                    <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg max-w-[200px]" />
                    <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mb-4">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Waiting for signature...
                    </div>
                    {xamanDeepLink && (
                      <a href={xamanDeepLink} className="text-sky-400 text-sm hover:underline block mb-4">
                        Open in Xaman app →
                      </a>
                    )}
                    <button onClick={cancelXamanConnection} className="text-zinc-500 text-sm hover:text-white">
                      ← Cancel
                    </button>
                  </div>
                )}

                {!connectingXaman && (
                  <>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <p className="text-zinc-300 text-sm mb-3">
                        Xaman (formerly XUMM) is the most popular mobile wallet for the XRP Ledger. Approve each transaction manually with push notifications.
                      </p>
                      <ul className="text-zinc-400 text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500">✓</span>
                          Full control over every transaction
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500">✓</span>
                          Push notifications for payments
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500">✓</span>
                          Most secure option
                        </li>
                      </ul>
                    </div>

                    {loginMethod === 'xaman' ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          Connected
                        </div>
                        <button
                          onClick={handleDisconnectWallet}
                          className="text-zinc-400 hover:text-red-400 text-sm transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={connectXaman}
                          disabled={connectingXaman}
                          className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {connectingXaman && !xamanQR ? (
                            <>
                              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                              Connecting...
                            </>
                          ) : (
                            'Connect to Manual Wallet'
                          )}
                        </button>
                        <a 
                          href="https://xaman.app" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-300 text-sm"
                        >
                          Don't have it? Get Xaman App →
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* EARN INTEREST - NOW OUTSIDE THE WALLET STATUS CARD WITH PROPER SPACING */}
<div id="earn-interest" className="mb-6">
  <EarnInterest />
</div>

            {/* 7. YOUR VENDORS */}
            <div id="vendors">
              {dashboardData && dashboardData.stores.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Your Vendors</h2>
                    <button onClick={() => { setShowDiscover(!showDiscover); if (!showDiscover) fetchPublicStores(); }} className="text-sky-400 hover:text-sky-300 text-sm">
                      {showDiscover ? 'Hide' : 'Discover Vendors →'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.stores.map((store, i) => (
                      <div key={`${store.store_id}-${i}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{store.store_name}</h3>
                            <p className="text-zinc-500 text-sm">{store.store_url}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-emerald-400">{formatBalance(store.total_earned)}</p>
                            <p className="text-zinc-500 text-sm">earned</p>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-zinc-400 text-xs mb-1">Your Referral Link</p>
                              <p className="text-sm font-mono truncate">{store.referral_link}</p>
                            </div>
                            <button onClick={() => handleCopyLink(store.referral_link, store.referral_code)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copiedCode === store.referral_code ? 'bg-emerald-500 text-black' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
                              {copiedCode === store.referral_code ? '✓ Copied' : 'Copy'}
                            </button>
                            <button onClick={() => { setQrUrl(store.referral_link); setQrStoreName(store.store_name); setShowQRModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                              QR
                            </button>
                          </div>
                          <p className="text-zinc-500 text-xs mt-2">Code: <span className="font-mono text-zinc-300">{store.referral_code}</span> · Level {store.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 6. DISCOVER VENDORS */}
            <div id="discover">
              {showDiscover && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{dashboardData?.stores.length ? 'Discover More Vendors' : 'Join a Vendor to Start Earning'}</h2>
                    {dashboardData?.stores.length ? <button onClick={() => setShowDiscover(false)} className="text-zinc-400 hover:text-white text-sm">Close ✕</button> : null}
                  </div>
                  <div className="mb-4">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500" />
                  </div>
                  {filteredStores.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                      <p className="text-zinc-400">{publicStores.length === 0 ? 'Loading vendors...' : 'No vendors found matching your search.'}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredStores.map((store) => (
                        <div key={store.store_id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
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
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <p className="text-zinc-400 mb-4">You haven&apos;t joined any vendor programs yet.</p>
                  <button onClick={() => { setShowDiscover(true); fetchPublicStores(); }} className="bg-sky-600 hover:bg-sky-500 text-white py-3 px-6 rounded-lg font-medium transition-colors">Discover Vendors</button>
                </div>
              )}
            </div>

            {/* 7. RECENT PAYOUTS */}
            <div id="payouts">
              {dashboardData && dashboardData.stores.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Recent Payouts</h2>
                  <PayoutsTable payouts={dashboardData.recent_payouts} showBalances={showBalances} />
                </section>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Receive</h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-zinc-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Share your wallet address or QR code to receive XRP or RLUSD.</p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`} alt="Wallet QR Code" className="w-full max-w-[200px] mx-auto" />
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 mb-4">
              <p className="text-zinc-500 text-xs mb-1">Your Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(walletAddress); setCopiedAddress(true); setTimeout(() => setCopiedAddress(false), 2000); }} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${copiedAddress ? 'bg-emerald-500 text-black' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
              {copiedAddress ? '✓ Copied!' : 'Copy Address'}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Withdraw</h3>
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawAddress(''); setError(''); }} className="text-zinc-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setWithdrawCurrency('RLUSD')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${withdrawCurrency === 'RLUSD' ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>RLUSD</button>
              <button onClick={() => setWithdrawCurrency('XRP')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${withdrawCurrency === 'XRP' ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>XRP</button>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
              <p className="text-zinc-500 text-xs">Available</p>
              <p className="text-lg font-bold">{withdrawCurrency === 'XRP' ? `${walletStatus?.xrp_balance.toFixed(2)} XRP` : `$${walletStatus?.rlusd_balance.toFixed(2)} RLUSD`}</p>
            </div>
            <div className="mb-4">
              <label className="text-zinc-500 text-xs mb-1 block">Amount</label>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder={`0.00 ${withdrawCurrency}`} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500" />
            </div>
            <div className="mb-4">
              <label className="text-zinc-500 text-xs mb-1 block">Destination Address</label>
              <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="rXXXX..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono text-sm" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}
            <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || !withdrawAddress} className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {withdrawing ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Sending...</> : `Send ${withdrawCurrency}`}
            </button>
          </div>
        </div>
      )}

      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} url={qrUrl} title="Share Referral Link" subtitle={qrStoreName} />
    </>
  );
}