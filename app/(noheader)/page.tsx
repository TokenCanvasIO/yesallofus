'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState<'partner' | 'member' | 'affiliate' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelection = async (userType: 'partner' | 'member' | 'affiliate') => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Privacy Policy to continue');
      return;
    }
    
    setIsLoading(userType);
    setError(null);
    
    try {
      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
      const result = await loginWithWeb3Auth();
      
      if (!result) {
        setError('Login cancelled');
        setIsLoading(null);
        return;
      }
      
      const address = typeof result === 'string' ? result : result.address;
      const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
      
      if (!address) {
        throw new Error('No wallet found');
      }

      // Set common session data
      sessionStorage.setItem('loginMethod', 'web3auth');
      sessionStorage.setItem('socialProvider', provider);
      sessionStorage.setItem('walletAddress', address);

      if (userType === 'partner') {
        // Partner (Vendor) - go to vendor dashboard
        sessionStorage.setItem('vendorWalletAddress', address);
        router.push('/dashboard');
      } else {
        // Member or Affiliate - go to affiliate dashboard
        router.push('/home');
      }
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-12">
            <img 
              src="https://yesallofus.com/dltpayslogo1.png" 
              alt="YesAllOfUs" 
              className="w-16 h-16 rounded-xl mb-3"
            />
            <span className="text-3xl font-bold">YesAllOfUs</span>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <p className="text-zinc-400 text-sm mb-4 text-center">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              <button
  onClick={() => router.push('/dashboard')}
  disabled={isLoading !== null}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isLoading === 'partner'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/5'
                } disabled:opacity-50`}
              >
                {isLoading === 'partner' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="font-semibold text-sm">Connecting...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">🏪</div>
                    <p className="font-semibold text-sm">Partner</p>
                    <p className="text-zinc-500 text-xs mt-1">Accept payments</p>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleSelection('member')}
                disabled={isLoading !== null}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isLoading === 'member'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/5'
                } disabled:opacity-50`}
              >
                {isLoading === 'member' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="font-semibold text-sm">Connecting...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">👤</div>
                    <p className="font-semibold text-sm">Member</p>
                    <p className="text-zinc-500 text-xs mt-1">Pay & earn</p>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleSelection('affiliate')}
                disabled={isLoading !== null}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isLoading === 'affiliate'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/5'
                } disabled:opacity-50`}
              >
                {isLoading === 'affiliate' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="font-semibold text-sm">Connecting...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">💰</div>
                    <p className="font-semibold text-sm">Affiliate</p>
                    <p className="text-zinc-500 text-xs mt-1">Earn commissions</p>
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push('/home')}
                disabled={isLoading !== null}
                className="p-5 rounded-2xl border-2 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="text-3xl mb-2">🌐</div>
                <p className="font-semibold text-sm">Enter Site</p>
                <p className="text-zinc-500 text-xs mt-1">Explore</p>
              </button>
            </div>
          </div>

          {/* Terms Checkbox with Disclaimer */}
          <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-zinc-400 text-sm">
                I agree to the{' '}
                <a href="/terms" className="text-emerald-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs leading-relaxed">
                By signing in, a secure wallet will be created for you using your social account (Google, Apple, etc.). 
                This wallet is non-custodial — only you have access to your funds. 
                YesAllOfUs cannot access, freeze, or control your wallet.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Powered By */}
          <div className="text-center">
            <p className="text-zinc-600 text-xs">Powered by Web3Auth · XRPL · RLUSD</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-zinc-600 text-sm">© 2026 YesAllOfUs. All rights reserved.</p>
      </footer>
    </div>
  );
}