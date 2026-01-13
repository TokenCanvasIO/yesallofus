'use client';

import { useState, useEffect } from 'react';
import BackgroundVideo from './BackgroundVideo';

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
  showLogo?: boolean;
}

export default function LoginScreen({ 
  onLogin,
  requireTrustline = false,
  claimStore = null,
  referringStore = null,
  storagePrefix = 'affiliate',
  title = 'Members & Affiliate Dashboard',
  subtitle = 'Connect your wallet to view your earnings',
  showLogo = false
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
    if (!termsAccepted) return;
    
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
    if (!termsAccepted) return;
    
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
  <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative">
    {/* Background Video - same for both vendor and affiliate */}
    <BackgroundVideo 
      src="/affiliate-hq.webm"
      overlay={true}
    />
    
    <main className={`relative z-10 max-w-xl mx-auto px-6 pb-6 min-h-[calc(100vh-200px)] flex items-start justify-center pt-4 md:pt-8 ${storagePrefix === 'vendor' ? 'md:pt-12' : ''}`}>
      <div className="w-full">
        {/* Title - SVG Badge Style */}
        <div className="flex flex-col items-center mb-4 mt-2 md:mb-6 md:mt-4">
          <svg viewBox="0 0 280 85" className="w-72 h-auto">
            <defs>
              <linearGradient id="partnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Dynamic text - PARTNERS or MEMBERS */}
<text x="140" y="28" textAnchor="middle" fill="url(#partnerGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
  {storagePrefix === 'vendor' ? 'PARTNERS' : 'MEMBERS'}
</text>
            
            {/* DASHBOARD text */}
            <text x="140" y="48" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3">
              DASHBOARD
            </text>
            
            {/* Divider line */}
            <line x1="80" y1="60" x2="200" y2="60" stroke="#27272a" strokeWidth="1"/>
            
            {/* Subtitle */}
            <text x="140" y="76" textAnchor="middle" fill="#a1a1aa" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="10" letterSpacing="0.5">
              Sign in to manage your affiliate commissions
            </text>
          </svg>
        </div>

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
          
          {/* Login Options - 3 Column Grid */}
{connecting === 'none' && (
  <div className="space-y-4">

    {/* Terms Agreement - Above all cards */}
<label className="flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm text-zinc-400 hover:text-zinc-300 px-4 md:px-0">
  <input
    type="checkbox"
    checked={termsAccepted}
    onChange={(e) => setTermsAccepted(e.target.checked)}
    className="w-4 h-4 flex-shrink-0 md:inline hidden"
  />
  <span className="leading-tight text-center md:text-left">
    I agree to the{' '}
    <a href="/terms" target="_blank" className="text-sky-400 hover:underline">Terms of Service</a>
    {' '}and{' '}
    <a href="/privacy" target="_blank" className="text-sky-400 hover:underline">Privacy Policy</a>
    {' '}
    <input
      type="checkbox"
      checked={termsAccepted}
      onChange={(e) => setTermsAccepted(e.target.checked)}
      className="w-4 h-4 inline-block md:hidden align-middle"
    />
  </span>
</label>

    {/* 3 Column Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      
      <button
  onClick={connectXaman}
  disabled={!termsAccepted}
  className={`order-2 md:order-1 group relative bg-zinc-900 border rounded-xl p-4 transition-all ${
    termsAccepted
      ? 'border-zinc-800 hover:border-sky-500 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)] hover:scale-[1.02]'
      : 'border-zinc-800 opacity-50 cursor-not-allowed'
  }`}
>
        {/* Badge */}
        <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-semibold">
          LIVE
        </div>

        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl overflow-hidden">
          <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-full h-full object-cover" />
        </div>

        {/* Title */}
        <h3 className="font-bold text-center mb-2">Xaman</h3>
        <p className="text-zinc-500 text-xs text-center mb-4 min-h-[32px]">Mobile wallet with push notifications</p>

        {/* Expand Icon */}
        <div className="flex justify-center">
          <div
  onClick={(e) => {
    e.stopPropagation();
    // Toggle info modal
  }}
  className="text-zinc-500 hover:text-emerald-400 transition-colors p-2 cursor-pointer"
  title="Learn more"
  role="button"
  tabIndex={0}
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</div>
        </div>

        {/* Connect Button */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <span className="text-sm font-medium text-center block group-hover:text-emerald-400 transition-colors">
            Connect →
          </span>
        </div>
      </button>

      {/* CENTER: Web3Auth (Primary) */}
<button
  onClick={connectWeb3Auth}
  disabled={!termsAccepted}
  className={`order-1 md:order-2 group relative bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border-2 rounded-xl p-4 transition-all ${
    termsAccepted
      ? 'border-emerald-500/50 hover:border-emerald-500 hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)] hover:scale-[1.02]'
      : 'border-zinc-700 opacity-50 cursor-not-allowed'
  }`}
>
  {/* Badge */}
  <div className="absolute top-3 right-3 bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
    EASIEST
  </div>
  {/* Social Icons Stack */}
  <div className="flex justify-center -space-x-2 mb-4">
    {/* Google */}
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    </div>
    {/* Apple */}
    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    </div>
    {/* More Badge */}
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg">
      <span className="text-white text-[10px] font-bold">+10</span>
    </div>
  </div>
  {/* Title */}
  <h3 className="font-bold text-center mb-2">Social Login</h3>
  <p className="text-zinc-400 text-xs text-center mb-4 min-h-[32px]">Instant wallet with Google, Apple & more</p>

  {/* Expand Icon */}
  <div className="flex justify-center">
    <div
      onClick={(e) => {
        e.stopPropagation();
        // Toggle info modal
      }}
      className="text-zinc-500 hover:text-emerald-400 transition-colors p-2 cursor-pointer"
      title="Learn more"
      role="button"
      tabIndex={0}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>

  {/* Connect Button */}
  <div className="mt-4 pt-4 border-t border-zinc-800">
    <span className="text-sm font-medium text-center block group-hover:text-emerald-400 transition-colors">
      Connect →
    </span>
  </div>
</button>

      {/* RIGHT: Crossmark */}
      <button
  onClick={connectCrossmark}
  disabled={!termsAccepted}
  className={`order-3 group relative bg-zinc-900 border rounded-xl p-6 transition-all ${
    termsAccepted
      ? 'border-zinc-800 hover:border-sky-500 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)] hover:scale-[1.02]'
      : 'border-zinc-800 opacity-50 cursor-not-allowed'
  }`}
>
        {/* Badge */}
        <div className="absolute top-3 right-3 bg-violet-500/20 text-violet-400 text-[10px] px-2 py-0.5 rounded font-semibold">
          AUTO
        </div>

        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl overflow-hidden">
          <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-full h-full object-cover" />
        </div>

        {/* Title */}
        <h3 className="font-bold text-center mb-2">Crossmark</h3>
        <p className="text-zinc-500 text-xs text-center mb-4 min-h-[32px]">Browser extension with auto-sign</p>

        {/* Expand Icon */}
        <div className="flex justify-center">
          <div
  onClick={(e) => {
    e.stopPropagation();
    // Toggle info modal
  }}
  className="text-zinc-500 hover:text-sky-400 transition-colors p-2 cursor-pointer"
  title="Learn more"
  role="button"
  tabIndex={0}
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</div>
        </div>

        {/* Connect Button */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <span className="text-sm font-medium text-center block group-hover:text-sky-400 transition-colors">
            Connect →
          </span>
        </div>
      </button>
    </div>

    {/* Download Links */}
    <p className="text-zinc-500 text-xs text-center">
      New to crypto?{' '}
      <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Get Xaman</a>
      {' '}or{' '}
      <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Crossmark</a>
    </p>
  </div>
)}

{/* Back to Homepage */}
<a 
  href="/" 
  className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
  <span>Back to Homepage</span>
</a>

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

{/* YAOFUS Instant Badge - Footer */}
{/* YAOFUS Instant Badge - Footer */}
<footer className="relative z-10 py-4 -mt-8 flex flex-col items-center gap-0.5">
  <span className="text-zinc-500 text-[10px] font-medium tracking-wider">SECURE</span>
  <span className="text-base font-extrabold tracking-widest">
    <span className="text-emerald-500">Y</span>
    <span className="text-green-500">A</span>
    <span className="text-blue-500">O</span>
    <span className="text-indigo-500">F</span>
    <span className="text-violet-500">U</span>
    <span className="text-purple-500">S</span>
  </span>
  <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">LOGIN</span>
  <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
    <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
    <span>Powered by YesAllOfUs</span>
  </div>
</footer>
</div>
  );
}