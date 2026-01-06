'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

interface LoginScreenProps {
  onLogin: (
    wallet: string, 
    method: 'xaman' | 'crossmark' | 'web3auth', 
    extras?: {
      socialProvider?: string;
      xamanUserToken?: string;
    }
  ) => void;
  // Vendor-specific props
  requireTrustline?: boolean;
  claimStore?: { store_name: string } | null;
  referringStore?: { store_name: string; store_id: string } | null;
  storagePrefix?: 'vendor' | 'affiliate';
  title?: string;
  subtitle?: string;
}

export default function LoginScreen({ 
  onLogin,
  requireTrustline = false,
  claimStore = null,
  referringStore = null,
  storagePrefix = 'affiliate',
  title = 'Members & Affiliate Dashboard',
  subtitle = 'Connect your wallet to view your earnings'
}: LoginScreenProps) {
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState<'none' | 'xaman' | 'crossmark' | 'web3auth'>('none');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [trustlineConfirmed, setTrustlineConfirmed] = useState(!requireTrustline);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Storage keys based on prefix
  const walletKey = storagePrefix === 'vendor' ? 'vendorWalletAddress' : 'walletAddress';
  const methodKey = storagePrefix === 'vendor' ? 'vendorLoginMethod' : 'loginMethod';

  // Complete customer signup from email link (affiliate only)
  const completeCustomerSignup = async (wallet: string) => {
    if (storagePrefix !== 'affiliate') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const storeId = urlParams.get('store');
    const join = urlParams.get('join');
    
    if (email && join === '1') {
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
        
        // Clean up URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('email');
        newUrl.searchParams.delete('join');
        window.history.replaceState({}, '', newUrl.toString());
        
      } catch (err) {
        console.error('Failed to complete customer signup:', err);
      }
    }
  };

  // Handle store auto-join from URL params (affiliate only)
  const handleStoreAutoJoin = async (wallet: string) => {
    if (storagePrefix !== 'affiliate') return;
    
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('store');
    
    if (storeId) {
      const parentRef = params.get('ref') || '';
      try {
        await fetch(`${API_URL}/affiliate/register-public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            store_id: storeId, 
            wallet: wallet,
            parent_referral_code: parentRef
          })
        });
        window.history.replaceState({}, '', window.location.pathname);
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error('Failed to auto-join store:', err);
      }
    }
  };

  // Xaman polling
  useEffect(() => {
    if (!loginId || connecting !== 'xaman') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/xaman/login/poll/${loginId}`);
        const data = await res.json();
        
        if (data.status === 'signed' && data.wallet_address) {
          clearInterval(interval);
          
          await handleStoreAutoJoin(data.wallet_address);
          await completeCustomerSignup(data.wallet_address);
          
          sessionStorage.setItem(walletKey, data.wallet_address);
          sessionStorage.setItem(methodKey, 'xaman');
          
          setConnecting('none');
          setXamanQR(null);
          setLoginId(null);
          
          onLogin(data.wallet_address, 'xaman', { xamanUserToken: data.xaman_user_token });
          
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          clearInterval(interval);
          setError(data.status === 'expired' ? 'QR code expired. Please try again.' : 'Login cancelled.');
          setConnecting('none');
          setXamanQR(null);
          setLoginId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    // Clean up after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (connecting === 'xaman') {
        setError('Connection timed out. Please try again.');
        setConnecting('none');
        setXamanQR(null);
        setLoginId(null);
      }
    }, 300000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [loginId, connecting, onLogin, walletKey, methodKey]);

  const connectXaman = async () => {
    if (requireTrustline && !trustlineConfirmed) return;
    
    setConnecting('xaman');
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/xaman/login`, {
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
    if (requireTrustline && !trustlineConfirmed) return;
    
    setConnecting('crossmark');
    setError('');
    
    try {
      const sdk = (window as any).xrpl?.crossmark;
      if (!sdk) {
        setError('Crossmark not installed. Please install the browser extension.');
        setConnecting('none');
        return;
      }
      
      const res = await sdk.methods.signInAndWait();
      const address = res.response?.data?.address;
      
      if (!address) {
        throw new Error('Connection cancelled');
      }
      
      // Save to Firebase for vendor
      if (storagePrefix === 'vendor') {
        await fetch(`${API_URL}/store/save-crossmark-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: address, store_id: null })
        });
      }
      
      await handleStoreAutoJoin(address);
      await completeCustomerSignup(address);
      
      sessionStorage.setItem(walletKey, address);
      sessionStorage.setItem(methodKey, 'crossmark');
      
      onLogin(address, 'crossmark');
      
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setError('Failed to connect Crossmark. Please try again.');
      }
    }
    setConnecting('none');
  };

  const connectWeb3Auth = async () => {
    if (!termsAccepted) return;
    
    setConnecting('web3auth');
    setError('');
    
    try {
      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
      const result = await loginWithWeb3Auth();
      
      if (!result) {
        setError('Login cancelled');
        setConnecting('none');
        return;
      }
      
      const address = typeof result === 'string' ? result : result.address;
      const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
      
      await handleStoreAutoJoin(address);
      await completeCustomerSignup(address);
      
      sessionStorage.setItem(walletKey, address);
      sessionStorage.setItem(methodKey, 'web3auth');
      sessionStorage.setItem('socialProvider', provider);
      
      onLogin(address, 'web3auth', { socialProvider: provider });
      
    } catch (err: any) {
      console.error('Web3Auth error:', err);
      if (!err.message?.includes('cancelled') && !err.message?.includes('closed')) {
        setError('Failed to connect. Please try again.');
      }
    }
    setConnecting('none');
  };

  const cancelXamanLogin = () => {
    setConnecting('none');
    setXamanQR(null);
    setXamanDeepLink(null);
    setLoginId(null);
  };

  // Check if wallet options should be enabled
  const walletOptionsEnabled = !requireTrustline || trustlineConfirmed;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <main className="max-w-xl mx-auto px-6 py-16 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">{title}</h1>
          <p className="text-zinc-400 mb-8 text-center">{subtitle}</p>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Claim Store Banner (vendor only) */}
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

          {/* Referral Store Banner (vendor only) */}
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
          
          {/* Xaman QR Screen */}
          {connecting === 'xaman' && xamanQR && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
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
          )}
          
          {/* Login Options */}
          {connecting === 'none' && (
            <div className="space-y-4">
              
              {/* Social Login (Web3Auth) - Primary Option */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
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
                    {/* More */}
                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <span className="text-zinc-400 text-xs font-bold">+10</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Continue with Social</span>
                    <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Easiest</span>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm mb-4">
                  Get an XRPL wallet instantly using Google, Apple, X, Discord and more. Payouts process automatically.
                </p>

                {/* How It Works Info Box */}
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
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-zinc-300 text-sm">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a>
                  </span>
                </label>

                <button
                  onClick={connectWeb3Auth}
                  disabled={!termsAccepted}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    termsAccepted
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Sign in with Social Account
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-zinc-500 text-sm">or use a crypto wallet</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              {/* Trustline Confirmation (vendor only) */}
              {requireTrustline && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-3">⚠️ Wallet Requirements</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Your wallet must have an <strong className="text-white">RLUSD trustline</strong> to receive commission payments.
                  </p>
                  <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustlineConfirmed}
                      onChange={(e) => setTrustlineConfirmed(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-zinc-300 text-sm">
                      I confirm my wallet has an RLUSD trustline enabled
                    </span>
                  </label>
                </div>
              )}

              {/* Xaman Wallet */}
              <button
                onClick={connectXaman}
                disabled={!walletOptionsEnabled}
                className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition ${
                  walletOptionsEnabled
                    ? 'border-zinc-800 hover:border-sky-500 cursor-pointer'
                    : 'border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Xaman Wallet</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">✓ Live</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Mobile wallet - approve each payout via push notification</p>
                  </div>
                </div>
              </button>

              {/* Crossmark Wallet */}
              <button
                onClick={connectCrossmark}
                disabled={!walletOptionsEnabled}
                className={`w-full bg-zinc-900 border rounded-xl p-6 text-left transition ${
                  walletOptionsEnabled
                    ? 'border-zinc-800 hover:border-sky-500 cursor-pointer'
                    : 'border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <div className="font-semibold">Crossmark Wallet</div>
                    <p className="text-zinc-400 text-sm">Browser extension - enable auto-sign for automatic payouts</p>
                  </div>
                </div>
              </button>

              {/* Help Text */}
              <p className="text-zinc-500 text-xs text-center">
                Don't have a wallet? Get{' '}
                <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Xaman</a>
                {' '}or{' '}
                <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Crossmark</a>
              </p>

              {/* Comparison Table */}
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
                        <td className="py-2">Social account</td>
                        <td className="py-2 text-emerald-400">You hold keys</td>
                        <td className="py-2 text-emerald-400">You hold keys</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Connecting States */}
          {(connecting === 'crossmark' || connecting === 'web3auth') && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <div className="flex items-center justify-center gap-2 text-zinc-400">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting{connecting === 'web3auth' ? ' with Social' : ' to Crossmark'}...</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}