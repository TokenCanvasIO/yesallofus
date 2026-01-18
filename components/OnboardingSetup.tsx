'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import SuccessMessage from './SuccessMessage';

interface OnboardingSetupProps {
  walletAddress: string | null;
  walletStatus: {
    funded: boolean;
    xrp_balance: number;
    rlusd_trustline: boolean;
    usdc_trustline?: boolean;
    rlusd_balance: number;
    usdc_balance?: number;
  } | null;
  autoSignEnabled: boolean;
  loginMethod: 'xaman' | 'crossmark' | 'web3auth' | null;
  onSetupComplete: () => void;
  onRefreshWallet: () => void;
onSetupStatusChange?: (isComplete: boolean) => void;
}

// USDC on XRPL
const USDC_CURRENCY = '5553444300000000000000000000000000000000';
const USDC_ISSUER = 'rcEGREd8NmkKRE8GE424sksyt1tJVFZwu';

// RLUSD on XRPL
const RLUSD_CURRENCY = '524C555344000000000000000000000000000000';
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';

export default function OnboardingSetup({
  walletAddress,
  walletStatus,
  autoSignEnabled,
  loginMethod,
  onSetupComplete,
  onRefreshWallet,
onSetupStatusChange
}: OnboardingSetupProps) {
  const [settingUp, setSettingUp] = useState(false);
  const [setupProgress, setSetupProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
const [xamanQR, setXamanQR] = useState<string | null>(null);
const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
const [loginId, setLoginId] = useState<string | null>(null);
const [connectingXaman, setConnectingXaman] = useState(false);

  // Determine current step
  const getOnboardingStep = () => {
  if (!walletAddress) return 'connect_wallet';
  if (!walletStatus) return 'loading';
  if (!walletStatus.funded || walletStatus.xrp_balance < 1.5) return 'fund_wallet';
    if (!walletStatus.rlusd_trustline || !walletStatus.usdc_trustline) return 'add_trustlines';
    if (!autoSignEnabled && loginMethod === 'web3auth') return 'enable_autopay';
    return 'complete';
  };

  const currentStep = getOnboardingStep();

// Notify parent of setup status
useEffect(() => {
  onSetupStatusChange?.(currentStep === 'complete');
}, [currentStep, onSetupStatusChange]);

// Auto-refresh wallet status
useEffect(() => {
  if (currentStep !== 'add_trustlines') return;
  
  const interval = setInterval(() => {
    onRefreshWallet();
  }, 10000);
  
  return () => clearInterval(interval);
}, [currentStep, onRefreshWallet]);

// Xaman polling
useEffect(() => {
  if (!loginId || !connectingXaman) return;
  
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`https://api.dltpays.com/api/v1/xaman/login/poll/${loginId}`);
      const data = await res.json();
      
      if (data.status === 'signed' && data.wallet_address) {
        clearInterval(interval);
        
        sessionStorage.setItem('walletAddress', data.wallet_address);
        sessionStorage.setItem('loginMethod', 'xaman');
        
        setConnectingXaman(false);
        setXamanQR(null);
        setLoginId(null);
        
        window.location.reload();
        
      } else if (data.status === 'expired' || data.status === 'cancelled') {
        clearInterval(interval);
        setError(data.status === 'expired' ? 'QR code expired. Please try again.' : 'Login cancelled.');
        setConnectingXaman(false);
        setXamanQR(null);
        setLoginId(null);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, 3000);

  const timeout = setTimeout(() => {
    clearInterval(interval);
    if (connectingXaman) {
      setError('Connection timed out. Please try again.');
      setConnectingXaman(false);
      setXamanQR(null);
      setLoginId(null);
    }
  }, 300000);

  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}, [loginId, connectingXaman]);

  const copyAddress = () => {
  if (!walletAddress) return;
  navigator.clipboard.writeText(walletAddress);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

  const handleRefresh = async () => {
  setRefreshing(true);
  await onRefreshWallet();
  setTimeout(() => setRefreshing(false), 1000);
};

// Xaman login
const connectXaman = async () => {
  setConnectingXaman(true);
  setError(null);
  
  try {
    const res = await fetch('https://api.dltpays.com/api/v1/xaman/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await res.json();
    
    if (data.error) {
      setError(data.error);
      setConnectingXaman(false);
      return;
    }
    
    setXamanQR(data.qr_png);
    setXamanDeepLink(data.deep_link);
    setLoginId(data.login_id);
  } catch (err) {
    setError('Failed to connect. Please try again.');
    setConnectingXaman(false);
  }
};

const cancelXamanLogin = () => {
  setConnectingXaman(false);
  setXamanQR(null);
  setXamanDeepLink(null);
  setLoginId(null);
};

  // Setup trustlines - Web3Auth automatic
  const setupTrustlinesWeb3Auth = async () => {
    if (!walletAddress || loginMethod !== 'web3auth') return;
    
    setSettingUp(true);
    setError(null);
    setSetupProgress('Connecting to wallet...');

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      const walletStatusRes = await fetch(`https://api.dltpays.com/api/v1/wallet/status/${walletAddress}`);
      const walletStatusData = await walletStatusRes.json();

      if (!walletStatusData.rlusd_trustline) {
        setSetupProgress('Adding RLUSD trustline...');
        const rlusdTrustlineTx = {
          TransactionType: 'TrustSet',
          Account: walletAddress,
          LimitAmount: {
            currency: RLUSD_CURRENCY,
            issuer: RLUSD_ISSUER,
            value: '1000000',
          },
        };
        await web3auth.provider.request({
          method: 'xrpl_submitTransaction',
          params: { transaction: rlusdTrustlineTx },
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!walletStatusData.usdc_trustline) {
        setSetupProgress('Adding USDC trustline...');
        const usdcTrustlineTx = {
          TransactionType: 'TrustSet',
          Account: walletAddress,
          LimitAmount: {
            currency: USDC_CURRENCY,
            issuer: USDC_ISSUER,
            value: '1000000',
          },
        };
        await web3auth.provider.request({
          method: 'xrpl_submitTransaction',
          params: { transaction: usdcTrustlineTx },
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setSetupProgress('Trustlines added ✓');
      onRefreshWallet();
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add trustlines';
      setError(message);
    }
    
    setSettingUp(false);
    setSetupProgress(null);
  };

  // Setup trustlines - Crossmark
  const setupTrustlinesCrossmark = async (currency: 'rlusd' | 'usdc') => {
  if (!walletAddress || loginMethod !== 'crossmark') return;
  
  setSettingUp(true);
  setError(null);
  setSetupProgress(`Opening Crossmark for ${currency.toUpperCase()}...`);

  try {
    const sdk = (window as any).xrpl?.crossmark;
    if (!sdk) {
      window.open('https://crossmark.io', '_blank');
      throw new Error('Crossmark not detected. Please install Crossmark and refresh.');
    }

      const trustlineConfig = currency === 'rlusd' 
        ? { currency: RLUSD_CURRENCY, issuer: RLUSD_ISSUER }
        : { currency: USDC_CURRENCY, issuer: USDC_ISSUER };

      const response = await sdk.methods.signAndSubmitAndWait({
  TransactionType: 'TrustSet',
  Account: walletAddress,
  LimitAmount: {
    currency: trustlineConfig.currency,
    issuer: trustlineConfig.issuer,
    value: '1000000',
  },
});

if (response?.response?.data?.resp?.result?.validated) {
        setSetupProgress(`${currency.toUpperCase()} trustline added ✓`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onRefreshWallet();
      } else {
        throw new Error('Transaction was not validated');
      }
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add trustline';
      setError(message);
    }
    
    setSettingUp(false);
    setSetupProgress(null);
  };

  // Setup trustlines - Xaman (opens deep link)
  const setupTrustlinesXaman = (currency: 'rlusd' | 'usdc') => {
    const trustlineConfig = currency === 'rlusd' 
      ? { currency: 'RLUSD', issuer: RLUSD_ISSUER }
      : { currency: USDC_CURRENCY, issuer: USDC_ISSUER };

    // Xaman deep link for TrustSet
    const xamanUrl = `https://xumm.app/detect/xapp:xumm.tangem-cards?tx=${encodeURIComponent(JSON.stringify({
      TransactionType: 'TrustSet',
      LimitAmount: {
        currency: trustlineConfig.currency,
        issuer: trustlineConfig.issuer,
        value: '1000000',
      },
    }))}`;
    
    window.open(xamanUrl, '_blank');
  };

  // Enable auto-pay (Web3Auth only)
  const enableAutoPay = async () => {
    if (!walletAddress || loginMethod !== 'web3auth') return;
    
    setSettingUp(true);
    setError(null);
    setSetupProgress('Preparing Tap-to-Pay...');

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      const settingsRes = await fetch('https://api.dltpays.com/nfc/api/v1/customer/setup-autosign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) throw new Error(settingsData.error);
      
      if (settingsData.signer_exists || settingsData.auto_sign_enabled) {
        onSetupComplete();
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
        onSetupComplete();
      } else {
        throw new Error('Auto-sign setup failed. Please try again.');
      }
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable Tap-to-Pay';
      setError(message);
    }
    
    setSettingUp(false);
    setSetupProgress(null);
  };

  // Show success message when complete
if (currentStep === 'complete') {
  return (
    <SuccessMessage 
      walletAddress={walletAddress || undefined} 
      loginMethod={loginMethod} 
    />
  );
}

  // Loading state
  if (currentStep === 'loading' || !walletStatus) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading wallet status...</span>
        </div>
      </div>
    );
  }

  // Step completion status
  const steps = [
  {
    id: 0,
    name: 'Connect Wallet',
    complete: !!walletAddress,
    active: currentStep === 'connect_wallet'
  },
  { 
    id: 1, 
    name: 'Fund Wallet', 
    complete: walletAddress && walletStatus ? walletStatus.funded && walletStatus.xrp_balance >= 1.5 : false,
    active: currentStep === 'fund_wallet'
  },
    { 
      id: 2, 
      name: 'Add Trustlines', 
      complete: walletStatus.rlusd_trustline && walletStatus.usdc_trustline,
      active: currentStep === 'add_trustlines'
    },
    { 
      id: 3, 
      name: loginMethod === 'web3auth' ? 'Enable Tap-to-Pay' : 'Ready!', 
      complete: loginMethod !== 'web3auth' || autoSignEnabled,
      active: currentStep === 'enable_autopay'
    },
  ];

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20 border border-amber-500/20 rounded-2xl overflow-hidden mb-6 shadow-xl shadow-amber-500/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Complete Your Setup</h2>
              <p className="text-zinc-400 text-sm">3 quick steps to start earning</p>
            </div>
          </div>
          <button
  onClick={handleRefresh}
  disabled={refreshing}
  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm font-medium text-zinc-300"
>
  <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
  {refreshing ? 'Checking...' : 'Refresh'}
</button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.complete 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' 
                    : step.active 
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 animate-pulse' 
                      : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step.complete ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
                <span className={`text-xs mt-2 ${step.active ? 'text-amber-400 font-medium' : step.complete ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${
                  step.complete ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400/70 text-xs mt-1 hover:text-red-400 transition">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        {/* STEP 0: Connect Wallet */}
{currentStep === 'connect_wallet' && (
  <div className="space-y-5">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
        <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
        <p className="text-zinc-400">Link an XRP wallet to receive payments</p>
      </div>
    </div>

    {/* Xaman QR Display */}
    {connectingXaman && xamanQR ? (
      <div className="bg-zinc-800/50 rounded-xl p-6">
        <p className="text-zinc-300 mb-4 text-center">Scan with Xaman app</p>
        <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg max-w-[200px]" />
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
          Waiting for signature...
        </div>
        {xamanDeepLink && (
          <a href={xamanDeepLink} className="text-sky-400 text-sm hover:underline block text-center mb-4">
            Open in Xaman app →
          </a>
        )}
        <button onClick={cancelXamanLogin} className="text-zinc-500 text-sm hover:text-white w-full text-center">
          ← Back
        </button>
      </div>
    ) : (
      <div className="grid gap-3">
        <button
          onClick={async () => {
            try {
              const sdk = (window as any).xrpl?.crossmark;
              if (!sdk) { window.open('https://crossmark.io', '_blank'); return; }
              const response = await sdk.methods.signInAndWait();
              if (response?.response?.data?.address) {
                sessionStorage.setItem('walletAddress', response.response.data.address);
                sessionStorage.setItem('loginMethod', 'crossmark');
                window.location.reload();
              }
            } catch (err) { console.error('Crossmark error:', err); }
          }}
          className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl transition"
        >
          <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg" />
          <div className="text-left">
            <p className="text-white font-medium">Crossmark</p>
            <p className="text-zinc-500 text-sm">Browser extension</p>
          </div>
        </button>

        <button
        onClick={connectXaman}
        disabled={connectingXaman}
        className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl transition w-full"
      >
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg" />
        <div className="text-left">
          <p className="text-white font-medium">Xaman (Xumm)</p>
          <p className="text-zinc-500 text-sm">Mobile wallet</p>
        </div>
      </button>

      <button
        onClick={async () => {
          try {
            const { loginWithWeb3Auth } = await import('@/lib/web3auth');
            const result = await loginWithWeb3Auth();
            if (result) {
              const address = typeof result === 'string' ? result : result.address;
              const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
              sessionStorage.setItem('walletAddress', address);
              sessionStorage.setItem('loginMethod', 'web3auth');
              sessionStorage.setItem('socialProvider', provider);
              window.location.reload();
            }
          } catch (err) { console.error('Social login error:', err); }
        }}
        className="flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 hover:border-emerald-500 p-4 rounded-xl transition w-full"
      >
        <div className="flex -space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
            <span className="text-white text-[10px] font-bold">+10</span>
          </div>
        </div>
        <div className="text-left">
          <p className="text-white font-medium">Social Login</p>
          <p className="text-zinc-500 text-sm">Tap and Pay with Google, Apple & more</p>
        </div>
      </button>
    </div>
    )}
  </div>
)}
        {/* STEP 1: Fund Wallet */}
        {currentStep === 'fund_wallet' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add XRP to Activate</h3>
                <p className="text-zinc-400">Send at least 1.5 XRP to fund your wallet</p>
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Current Balance</p>
                  <p className="text-2xl font-bold text-white mt-1">{walletStatus.xrp_balance.toFixed(4)} <span className="text-zinc-400 text-lg">XRP</span></p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  walletStatus.xrp_balance >= 1.5 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {walletStatus.xrp_balance >= 1.5 ? 'Funded' : `Need ${(1.5 - walletStatus.xrp_balance).toFixed(2)} more`}
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-zinc-800/30 rounded-xl p-4 space-y-3">
              <p className="text-zinc-400 text-sm">Send XRP to this address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-zinc-900 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm break-all">
                  {walletAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className={`p-3 rounded-lg transition ${copied ? 'bg-emerald-500 text-black' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              
              {showQR && (
                <div className="flex justify-center pt-2">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG value={walletAddress || ''} size={180} level="M" />
                  </div>
                </div>
              )}
            </div>

            {/* Buy XRP Options */}
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Need XRP? Buy with card:</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://guardarian.com/buy-xrp?address=${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <img src="/guardarian-blue.svg" alt="Guardarian" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Guardarian</p>
                    <p className="text-zinc-500 text-xs">No KYC small amounts</p>
                  </div>
                </a>
                <a
                  href="https://global.transak.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <img src="/transak.svg" alt="Transak" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Transak</p>
                    <p className="text-zinc-500 text-xs">Global coverage</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-300 text-sm">
                1.5 XRP covers the XRPL base reserve (1 XRP) plus trustline reserves. Keep at least 1.2 XRP to stay active.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Add Trustlines */}
        {currentStep === 'add_trustlines' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enable Stablecoins</h3>
                <p className="text-zinc-400">Add trustlines to receive RLUSD & USDC payments</p>
              </div>
            </div>

            {/* Trustline Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* RLUSD Card */}
              <div className={`rounded-xl p-4 border transition-all ${
                walletStatus.rlusd_trustline 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
                    <span className="font-semibold text-white">RLUSD</span>
                  </div>
                  {walletStatus.rlusd_trustline ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-zinc-600 rounded-full"></div>
                  )}
                </div>
                <p className="text-zinc-400 text-xs">Ripple USD Stablecoin</p>
                {walletStatus.rlusd_trustline ? (
                  <p className="text-emerald-400 text-sm mt-2 font-medium">Active</p>
                ) : (
                  loginMethod === 'crossmark' && (
                    <button
                      onClick={() => setupTrustlinesCrossmark('rlusd')}
                      disabled={settingUp}
                      className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Add RLUSD
                    </button>
                  )
                )}
                {!walletStatus.rlusd_trustline && loginMethod === 'xaman' && (
                  <button
                    onClick={() => setupTrustlinesXaman('rlusd')}
                    className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium py-2 rounded-lg transition"
                  >
                    Add RLUSD
                  </button>
                )}
              </div>

              {/* USDC Card */}
              <div className={`rounded-xl p-4 border transition-all ${
                walletStatus.usdc_trustline 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">$</div>
                    <span className="font-semibold text-white">USDC</span>
                  </div>
                  {walletStatus.usdc_trustline ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-zinc-600 rounded-full"></div>
                  )}
                </div>
                <p className="text-zinc-400 text-xs">Circle USD Stablecoin</p>
                {walletStatus.usdc_trustline ? (
                  <p className="text-emerald-400 text-sm mt-2 font-medium">Active</p>
                ) : (
                  loginMethod === 'crossmark' && (
                    <button
                      onClick={() => setupTrustlinesCrossmark('usdc')}
                      disabled={settingUp}
                      className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Add USDC
                    </button>
                  )
                )}
                {!walletStatus.usdc_trustline && loginMethod === 'xaman' && (
  
   <a href="https://xumm.app"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2 rounded-lg transition block text-center"
  >
    Add in Xaman →
  </a>
)}
              </div>
            </div>

            {/* Web3Auth: Single button for both */}
            {loginMethod === 'web3auth' && (!walletStatus.rlusd_trustline || !walletStatus.usdc_trustline) && (
              <button
                onClick={setupTrustlinesWeb3Auth}
                disabled={settingUp}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {settingUp ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    {setupProgress || 'Setting up...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                    Add Both Trustlines
                  </>
                )}
              </button>
            )}

            {/* Skip option for Xaman users - USDC only */}
{loginMethod === 'xaman' && walletStatus.rlusd_trustline && !walletStatus.usdc_trustline && (
  <div className="mt-4 pt-4 border-t border-zinc-800">
    <p className="text-zinc-500 text-sm text-center mb-3">
      Add trustlines manually in your Xaman wallet, or skip for now
    </p>
    <button
      onClick={onSetupComplete}
      className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition"
    >
      Skip for Now →
    </button>
  </div>
)}

            {/* Progress indicator for Crossmark/Xaman */}
            {settingUp && loginMethod !== 'web3auth' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <span className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></span>
                <span className="text-amber-400">{setupProgress || 'Processing...'}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Enable Auto-Pay (Web3Auth only) */}
        {currentStep === 'enable_autopay' && loginMethod === 'web3auth' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enable Tap-to-Pay</h3>
                <p className="text-zinc-400">Final step - enable instant NFC payments</p>
              </div>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4">
              <p className="text-zinc-300 text-sm leading-relaxed">
                Sign once to authorize automatic payments when you tap your NFC card at participating vendors. 
                You control the spending limit.
              </p>
            </div>

            <button
              onClick={enableAutoPay}
              disabled={settingUp}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {settingUp ? (
                <>
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  {setupProgress || 'Setting up...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Complete Setup
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}