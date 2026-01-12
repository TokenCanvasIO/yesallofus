'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InstallAppButton from '@/components/InstallAppButton';
import BackgroundVideo from '@/components/BackgroundVideo';

export default function WelcomePage() {
  const router = useRouter();
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState<'partner' | 'member' | 'affiliate' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelection = async (userType: 'partner' | 'member' | 'affiliate') => {
    
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

      sessionStorage.setItem('loginMethod', 'web3auth');
      sessionStorage.setItem('socialProvider', provider);
      sessionStorage.setItem('walletAddress', address);

      if (userType === 'partner') {
        sessionStorage.setItem('vendorWalletAddress', address);
        router.push('/dashboard');
      } else {
        router.push('/affiliate-dashboard');
      }
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      setIsLoading(null);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="font-medium text-sm text-emerald-400">Connecting...</p>
    </div>
  );

  return (
  <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
    {/* Background Video */}
    <BackgroundVideo src="/affiliate-hq.webm" overlay={true} />
    
    {/* Custom animations */}
    <style jsx global>{`
        @keyframes breathe {
  0%, 100% { transform: scale(1.2); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
          @keyframes shine {
  0%, 90%, 100% { opacity: 0; }
  95% { opacity: 1; }
}
.logo-container {
  position: relative;
  overflow: hidden;
}
.logo-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 12s ease-in-out infinite;
}
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}
      </style>
      
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-2 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-emerald-500/40 blur-2xl rounded-full animate-breathe scale-150" />
              <div className="logo-container rounded-2xl">
  <img 
    src="https://yesallofus.com/dltpayslogo1.png" 
    alt="YesAllOfUs" 
    className="w-16 h-16 rounded-2xl relative z-10"
  />
</div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">YesAllOfUs</h1>
            <div className="mt-2 mb-1">
              <svg viewBox="0 0 160 28" className="w-36 h-7 mx-auto">
                <defs>
                  <linearGradient id="yaofuWelcomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="40%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <text x="80" y="20" textAnchor="middle" fill="url(#yaofuWelcomeGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="6">
                  YAOFUS
                </text>
              </svg>
            </div>
            <p className="text-zinc-500 text-sm mt-1">Tap. Pay. Earn.</p>
          </div>

          {/* User Type Selection */}
<div className="mb-6">
  
  {/* Install App Button */}
<InstallAppButton />
  
  <div className="grid grid-cols-2 gap-2">
              {/* Partner */}
              <button
                onClick={() => router.push('/dashboard')}
                disabled={isLoading !== null}
                className={`group p-4 rounded-2xl border transition-all duration-300 animate-fade-in-up delay-100 ${
                  isLoading === 'partner'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-transparent bg-zinc-800/30 hover:border-emerald-500/50 hover:bg-zinc-800/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                } disabled:opacity-50`}
              >
                {isLoading === 'partner' ? <LoadingSpinner /> : (
                  <>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-xs text-white">Partner</p>
<p className="text-zinc-500 text-[10px] mt-0.5">Accept payments</p>
                  </>
                )}
              </button>
              
              {/* Member */}
              <button
                onClick={() => handleSelection('member')}
                disabled={isLoading !== null}
                className={`group p-4 rounded-2xl border transition-all duration-300 animate-fade-in-up delay-200 ${
                  isLoading === 'member'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-transparent bg-zinc-800/30 hover:border-sky-500/50 hover:bg-zinc-800/50 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]'
                } disabled:opacity-50`}
              >
                {isLoading === 'member' ? <LoadingSpinner /> : (
                  <>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm text-white">Member</p>
                    <p className="text-zinc-500 text-xs mt-1">Tap & earn</p>
                  </>
                )}
              </button>
              
              {/* Affiliate */}
              <button
                onClick={() => handleSelection('affiliate')}
                disabled={isLoading !== null}
                className={`group p-4 rounded-2xl border transition-all duration-300 animate-fade-in-up delay-300 ${
                  isLoading === 'affiliate'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-transparent bg-zinc-800/30 hover:border-amber-500/50 hover:bg-zinc-800/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]'
                } disabled:opacity-50`}
              >
                {isLoading === 'affiliate' ? <LoadingSpinner /> : (
                  <>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm text-white">Affiliate</p>
                    <p className="text-zinc-500 text-xs mt-1">Discover, share & earn</p>
                  </>
                )}
              </button>
              
              {/* Explore */}
              <button
                onClick={() => router.push('/home')}
                disabled={isLoading !== null}
                className="group p-6 rounded-2xl border border-transparent bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50 hover:shadow-[0_0_30px_-5px_rgba(161,161,170,0.2)] transition-all duration-300 animate-fade-in-up delay-400 disabled:opacity-50"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <p className="font-semibold text-sm text-white">Explore</p>
                <p className="text-zinc-500 text-xs mt-1">View site</p>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-zinc-600 text-xs">
              Powered by <span className="text-zinc-500">Web3Auth</span> · <span className="text-zinc-500">XRPL</span> · <span className="text-zinc-500">RLUSD</span>
            </p>
          </div>
        </div>
        
      </main>

      <footer className="-mt-1 py-1 px-3 text-center relative z-10">
        <p className="text-zinc-700 text-xs">© 2025 YesAllOfUs. All rights reserved.</p>
      </footer>
    </div>
  );
}