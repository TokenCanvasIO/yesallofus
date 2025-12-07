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

export default function AffiliateDashboard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [publicStores, setPublicStores] = useState<PublicStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [showDiscover, setShowDiscover] = useState(false);
  const [joiningStore, setJoiningStore] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalances, setShowBalances] = useState(false);
  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState<'XRP' | 'RLUSD'>('RLUSD');
  const [withdrawing, setWithdrawing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const registeringRef = useRef(false);
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
    
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem('walletAddress');
      if (stored && stored !== walletAddress) {
        setWalletAddress(stored);
        fetchDashboard(stored);
        fetchWalletStatus(stored);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    const stored = sessionStorage.getItem('walletAddress');
    const storedLoginMethod = sessionStorage.getItem('loginMethod');
    const storedSocialProvider = sessionStorage.getItem('socialProvider'); 
    if (stored) {
      setWalletAddress(stored);
      if (storedLoginMethod) setLoginMethod(storedLoginMethod);
      if (storedSocialProvider) setSocialProvider(storedSocialProvider); 
      await Promise.all([
        fetchDashboard(stored),
        fetchWalletStatus(stored)
      ]);
    } else {
      setLoading(false);
    }
  };

  const fetchWalletStatus = async (wallet: string) => {
    try {
      const response = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${wallet}`);
      const data = await response.json();
      if (data.success) {
        setWalletStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet status:', err);
    }
  };

  const fetchPublicStores = async () => {
    try {
      const response = await fetch('https://api.dltpays.com/api/v1/stores/public');
      const data = await response.json();
      if (data.success) {
        setPublicStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
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
      const response = await fetch('https://api.dltpays.com/api/v1/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          wallet: walletAddress
        })
      });
      
      const data = await response.json();
      
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

  const handleCopyLink = (referralLink: string, code: string) => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('connectedWallet');
    sessionStorage.removeItem('loginMethod');
    sessionStorage.removeItem('socialProvider');
    setWalletAddress('');
    setDashboardData(null);
    setWalletStatus(null);
    setError('');
    setLoading(false);
    setShowDiscover(false);
    setShowBalances(false);
    setLoginMethod(null);
    setSocialProvider(null);
  };

  // Format balance - hidden or visible
  const formatBalance = (amount: number, prefix: string = '$') => {
    if (!showBalances) return '****';
    return `${prefix}${amount.toFixed(2)}`;
  };

  const formatXRP = (amount: number) => {
    if (!showBalances) return '****';
    return `${amount.toFixed(2)} XRP`;
  };

  const [connecting, setConnecting] = useState<'none' | 'xaman' | 'crossmark' | 'google'>('none');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);

  useEffect(() => {
    if (!loginId || connecting !== 'xaman') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.dltpays.com/api/v1/xaman/login/poll/${loginId}`);
        const data = await res.json();
        
        if (data.status === 'signed' && data.wallet_address) {
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
          await Promise.all([
            fetchDashboard(data.wallet_address),
            fetchWalletStatus(data.wallet_address)
          ]);
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
      await Promise.all([
        fetchDashboard(address),
        fetchWalletStatus(address)
      ]);
    } catch (err) {
      setError('Failed to connect Crossmark. Please try again.');
    }
    setConnecting('none');
  };

  const connectGoogle = async () => {
  setConnecting('google');
  setError('');
  
  try {
    const result = await loginWithWeb3Auth();
    
    if (!result) {
      setError('Login cancelled');
      setConnecting('none');
      return;
    }
    
    // Destructure address and provider from result
    const address = typeof result === 'string' ? result : result.address;
    const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
    
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
    sessionStorage.setItem('loginMethod', 'web3auth');
    sessionStorage.setItem('socialProvider', provider);  // Store provider
    setWalletAddress(address);
    setLoginMethod('web3auth');
    setSocialProvider(provider);  // Set state
    await Promise.all([
      fetchDashboard(address),
      fetchWalletStatus(address)
    ]);
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

  const filteredStores = publicStores.filter(store => 
    store.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.store_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isJoined = (storeId: string) => {
    return dashboardData?.stores.some(s => s.store_id === storeId) || false;
  };

  // Eye icon component
  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      )}
    </svg>
  );
  // Social provider icon component
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
    case 'apple':
      return (
        <div className={`${sizeClasses} bg-black rounded-full flex items-center justify-center border border-zinc-700`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
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

  // Abbreviated wallet display
  const abbreviateWallet = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy wallet address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid address and amount');
      return;
    }

    setWithdrawing(true);
    setError('');

    try {
      // Get Web3Auth instance and sign transaction
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        setError('Please reconnect your wallet');
        setWithdrawing(false);
        return;
      }

      const amountDrops = withdrawCurrency === 'XRP' 
        ? Math.floor(parseFloat(withdrawAmount) * 1_000_000).toString()
        : undefined;

      const tx: any = {
        TransactionType: 'Payment',
        Account: walletAddress,
        Destination: withdrawAddress,
      };

      if (withdrawCurrency === 'XRP') {
        tx.Amount = amountDrops;
      } else {
        tx.Amount = {
          currency: 'RLUSD',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: withdrawAmount
        };
      }

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: tx }
      });

      console.log('Withdraw result:', result);
      
      // Refresh wallet status
      await fetchWalletStatus(walletAddress);
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setError('');
      
      // Show success (could add a toast here)
      alert(`Successfully sent ${withdrawAmount} ${withdrawCurrency}!`);
    } catch (err: any) {
      console.error('Withdraw error:', err);
      setError(err.message || 'Failed to send transaction');
    }
    
    setWithdrawing(false);
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
            
            {connecting === 'xaman' && xamanQR && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto mb-6">
                <p className="text-zinc-300 mb-4">Scan with Xaman app</p>
                <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg" />
                <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  Waiting for signature...
                </div>
                <a href={xamanDeepLink || '#'} className="text-sky-400 text-sm hover:underline block mb-4">
                  Open in Xaman app →
                </a>
                <button onClick={cancelXamanLogin} className="text-zinc-500 text-sm hover:text-white">
                  ← Back
                </button>
              </div>
            )}
            
            {connecting === 'none' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-zinc-300 mb-6">
                  Connect your wallet to see your commissions across all vendors.
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
  <div className="flex -space-x-1.5">
    {/* Google */}
    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-zinc-300">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    </div>
    {/* Apple */}
    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border border-zinc-700">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    </div>
    {/* Facebook */}
    <div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center border border-[#1877F2]">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </div>
    {/* X */}
    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border border-zinc-700">
      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
    {/* More */}
    <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center border border-zinc-500">
      <span className="text-white text-[8px] font-bold">+8</span>
    </div>
  </div>
  Continue with Social
</button>

                <p className="text-zinc-500 text-xs mt-6">
                  Don&apos;t have a wallet? Get <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Xaman</a> or <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Crossmark</a>
                </p>
              </div>
            )}
            
            {(connecting === 'crossmark' || connecting === 'google') && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-zinc-400">
                  <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting{connecting === 'google' ? ' with Google' : ' to Crossmark'}...</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
              <p className="text-zinc-400">Track your earnings across all vendors</p>
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

        {/* Wallet Status Card */}
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
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title={showBalances ? 'Hide balances' : 'Show balances'}
              >
                <EyeIcon open={showBalances} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* XRP Balance */}
              <div>
                <p className="text-zinc-500 text-xs mb-1">XRP Balance</p>
                <p className={`text-lg font-bold ${walletStatus.funded ? 'text-white' : 'text-orange-400'}`}>
                  {walletStatus.funded ? formatXRP(walletStatus.xrp_balance) : 'Not Funded'}
                </p>
              </div>
              
              {/* RLUSD Trustline */}
              <div>
                <p className="text-zinc-500 text-xs mb-1">RLUSD Trustline</p>
                <div className="flex items-center gap-2">
                  {walletStatus.rlusd_trustline ? (
                    <>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-emerald-400 text-sm">Set</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-orange-400 text-sm">Not Set</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* RLUSD Balance */}
              <div>
                <p className="text-zinc-500 text-xs mb-1">RLUSD Balance</p>
                <p className="text-lg font-bold text-white">
                  {formatBalance(walletStatus.rlusd_balance)}
                </p>
              </div>
              
              {/* Pending Commissions */}
              <div>
                <p className="text-zinc-500 text-xs mb-1">Pending</p>
                {walletStatus.pending_commissions ? (
                  <div>
                    <p className="text-lg font-bold text-amber-400">
                      {formatBalance(walletStatus.pending_commissions.total)}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {showBalances ? `$${walletStatus.pending_commissions.until_payout.toFixed(2)} until payout` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">None</p>
                )}
              </div>
            </div>

            {/* Web3Auth Actions - Receive/Withdraw */}
            {loginMethod === 'web3auth' && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Wallet Address with Copy */}
                  <div className="flex-1 bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Your Wallet</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{abbreviateWallet(walletAddress)}</span>
                      <button
                        onClick={handleCopyAddress}
                        className={`p-1.5 rounded transition-colors ${copiedAddress ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}
                        title="Copy address"
                      >
                        {copiedAddress ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReceiveModal(true)}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      Receive
                    </button>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={!walletStatus?.funded}
                      className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Warnings */}
            {!walletStatus.funded && (
              <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-400 text-sm">
                  💡 Your wallet is not funded yet. Commissions will accumulate until you reach ${walletStatus.pending_commissions?.threshold || 1.5} XRP, then we&apos;ll activate your wallet automatically.
                </p>
              </div>
            )}
            
            {walletStatus.funded && !walletStatus.rlusd_trustline && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-amber-400 text-sm">
                  ⚠️ Set up your RLUSD trustline to receive instant commission payments. 
                  <a href="https://xrpl.services/?issuer=rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De&currency=RLUSD&limit=10000000" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="underline ml-1 hover:text-amber-300">
                    Set trustline →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && dashboardData.stores.length > 0 && (
          <>
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 rounded-xl p-6 mb-8">
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

            {/* Your Vendors */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Vendors</h2>
                <button
                  onClick={() => {
                    setShowDiscover(!showDiscover);
                    if (!showDiscover) fetchPublicStores();
                  }}
                  className="text-sky-400 hover:text-sky-300 text-sm"
                >
                  {showDiscover ? 'Hide' : 'Discover Vendors →'}
                </button>
              </div>
              
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
                          {formatBalance(store.total_earned)}
                        </p>
                        <p className="text-zinc-500 text-sm">earned</p>
                      </div>
                    </div>
                    
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
            </section>

            {/* Recent Payouts */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Recent Payouts</h2>
              <PayoutsTable payouts={dashboardData.recent_payouts} />
            </section>
          </>
        )}

        {/* Discover Vendors Section */}
        {showDiscover && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {dashboardData?.stores.length ? 'Discover More Vendors' : 'Join a Vendor to Start Earning'}
              </h2>
              {dashboardData?.stores.length ? (
                <button
                  onClick={() => setShowDiscover(false)}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  Close ✕
                </button>
              ) : null}
            </div>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            
            {filteredStores.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <p className="text-zinc-400">
                  {publicStores.length === 0 ? 'Loading vendors...' : 'No vendors found matching your search.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredStores.map((store) => (
                  <div 
                    key={store.store_id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg">{store.store_name}</h3>
                      <p className="text-zinc-500 text-sm truncate">{store.store_url}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-zinc-500">L1: </span>
                        <span className="text-emerald-400 font-medium">{store.commission_rates[0]}%</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Affiliates: </span>
                        <span className="text-white">{store.affiliates_count}</span>
                      </div>
                    </div>
                    
                    {isJoined(store.store_id) ? (
                      <button
                        disabled
                        className="w-full bg-zinc-700 text-zinc-400 py-2 px-4 rounded-lg text-sm font-medium"
                      >
                        ✓ Already Joined
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinStore(store.store_id)}
                        disabled={joiningStore === store.store_id}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {joiningStore === store.store_id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Joining...
                          </span>
                        ) : (
                          'Join as Affiliate'
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Show discover button if no vendors */}
        {(!dashboardData || dashboardData.stores.length === 0) && !showDiscover && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400 mb-4">You haven&apos;t joined any vendor programs yet.</p>
            <button
              onClick={() => {
                setShowDiscover(true);
                fetchPublicStores();
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Discover Vendors
            </button>
          </div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Receive</h3>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-zinc-400 text-sm mb-4">
                Share your wallet address or QR code to receive XRP or RLUSD.
              </p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
                  alt="Wallet QR Code"
                  className="w-full max-w-[200px] mx-auto"
                />
              </div>

              {/* Address */}
              <div className="bg-zinc-800 rounded-lg p-3 mb-4">
                <p className="text-zinc-500 text-xs mb-1">Your Address</p>
                <p className="font-mono text-sm break-all">{walletAddress}</p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  setCopiedAddress(true);
                  setTimeout(() => setCopiedAddress(false), 2000);
                }}
                className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                  copiedAddress 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
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
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setWithdrawAddress('');
                    setError('');
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Currency Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setWithdrawCurrency('RLUSD')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    withdrawCurrency === 'RLUSD'
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  RLUSD
                </button>
                <button
                  onClick={() => setWithdrawCurrency('XRP')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    withdrawCurrency === 'XRP'
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  XRP
                </button>
              </div>

              {/* Available Balance */}
              <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <p className="text-zinc-500 text-xs">Available</p>
                <p className="text-lg font-bold">
                  {withdrawCurrency === 'XRP' 
                    ? `${walletStatus?.xrp_balance.toFixed(2)} XRP`
                    : `$${walletStatus?.rlusd_balance.toFixed(2)} RLUSD`
                  }
                </p>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-zinc-500 text-xs mb-1 block">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`0.00 ${withdrawCurrency}`}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Destination Address */}
              <div className="mb-4">
                <label className="text-zinc-500 text-xs mb-1 block">Destination Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="rXXXX..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || !withdrawAddress}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {withdrawing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  `Send ${withdrawCurrency}`
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}