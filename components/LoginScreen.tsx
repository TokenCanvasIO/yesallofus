'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

interface LoginScreenProps {
  onLogin: (
    wallet: string, 
    method: 'xaman' | 'crossmark' | 'web3auth', 
    extras?: {
      socialProvider?: string;
    }
  ) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState<'none' | 'xaman' | 'crossmark' | 'google'>('none');
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);

  // Complete customer signup from email link
  const completeCustomerSignup = async (wallet: string) => {
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

  // Handle store auto-join from URL params
  const handleStoreAutoJoin = async (wallet: string) => {
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
          
          sessionStorage.setItem('walletAddress', data.wallet_address);
          sessionStorage.setItem('loginMethod', 'xaman');
          
          setConnecting('none');
          setXamanQR(null);
          setLoginId(null);
          
          onLogin(data.wallet_address, 'xaman');
          
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
  }, [loginId, connecting, onLogin]);

  const connectXaman = async () => {
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
      
      await handleStoreAutoJoin(address);
      await completeCustomerSignup(address);
      
      sessionStorage.setItem('walletAddress', address);
      sessionStorage.setItem('loginMethod', 'crossmark');
      
      onLogin(address, 'crossmark');
      
    } catch (err) {
      setError('Failed to connect Crossmark. Please try again.');
    }
    setConnecting('none');
  };

  const connectGoogle = async () => {
    setConnecting('google');
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
      
      sessionStorage.setItem('walletAddress', address);
      sessionStorage.setItem('loginMethod', 'web3auth');
      sessionStorage.setItem('socialProvider', provider);
      
      onLogin(address, 'web3auth', { socialProvider: provider });
      
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

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" />
      
      <main className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold mb-4">Members & Affiliate Dashboard</h1>
          <p className="text-zinc-400 mb-8">Connect your wallet to view your earnings</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Xaman QR Screen */}
          {connecting === 'xaman' && xamanQR && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto mb-6">
              <p className="text-zinc-300 mb-4">Scan with Xaman app</p>
              <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg" />
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                Waiting for signature...
              </div>
              {xamanDeepLink && (
                <a href={xamanDeepLink} className="text-sky-400 text-sm hover:underline block mb-4">
                  Open in Xaman app →
                </a>
              )}
              <button onClick={cancelXamanLogin} className="text-zinc-500 text-sm hover:text-white">
                ← Back
              </button>
            </div>
          )}
          
          {/* Login Options */}
          {connecting === 'none' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-zinc-300 mb-6">
                Connect your wallet to see your commissions across all vendors.
              </p>
              
              <div className="space-y-4">
                {/* Web3Auth - Social Login */}
                <button
                  onClick={connectGoogle}
                  disabled={connecting !== 'none'}
                  className="w-full bg-white hover:bg-gray-100 text-black py-4 px-6 rounded-lg flex items-center gap-4 font-medium transition-colors text-left"
                >
                  <div className="flex -space-x-1">
                    {/* Google */}
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-zinc-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    {/* Apple */}
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-zinc-600">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    {/* More */}
                    <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center border border-zinc-500">
                      <span className="text-white text-[9px] font-bold">+10</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Continue with Social</div>
                    <div className="text-zinc-500 text-sm">Google, Apple, X, Discord & more</div>
                  </div>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-zinc-900 px-4 text-zinc-500">or use wallet</span>
                  </div>
                </div>

                {/* Crossmark - Browser Wallet */}
                <button
                  onClick={connectCrossmark}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 px-6 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold">Browser Wallet</div>
                      <div className="text-zinc-400 text-sm">Crossmark extension</div>
                    </div>
                  </div>
                </button>

                {/* Xaman - Mobile Wallet */}
                <button
                  onClick={connectXaman}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 px-6 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-semibold">Xaman Wallet</div>
                      <div className="text-zinc-400 text-sm">Mobile wallet app</div>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-zinc-500 text-xs mt-6">
                Don&apos;t have a wallet? Get <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Xaman</a> or <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Crossmark</a>
              </p>
            </div>
          )}
          
          {/* Connecting States */}
          {(connecting === 'crossmark' || connecting === 'google') && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-zinc-400">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting{connecting === 'google' ? ' with Social' : ' to Crossmark'}...</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}