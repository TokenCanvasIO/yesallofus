'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WalletGuide() {
  const [activeTab, setActiveTab] = useState<'social' | 'xaman' | 'crossmark'>('social');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Hero */}
<header className="relative overflow-hidden border-b border-zinc-800/50">
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2" />

  <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
    <div className="inline-flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full px-4 py-1.5 mb-6">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      <span className="text-zinc-400 text-sm">Built on XRPL · Secured by Design</span>
    </div>
    
    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
      Get Started with YesAllofUs
    </h1>
    
    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
      To receive commissions, you'll need an Xaman wallet. Social Log in Coming Soon.
    </p>

    <div className="flex flex-wrap justify-center gap-4">
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-zinc-300 text-sm">Non-custodial</span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-zinc-300 text-sm">You control your keys</span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span className="text-zinc-300 text-sm">Fully auditable on-chain</span>
      </div>
    </div>
  </div>
</header>

{/* Xaman Setup Guide */}
<section className="bg-gradient-to-b from-zinc-900/50 to-transparent border-b border-zinc-800/50">
  <div className="max-w-4xl mx-auto px-6 py-16">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
        <span className="text-blue-400 text-sm font-medium">Recommended for Affiliates</span>
      </div>
      <h2 className="text-3xl font-bold mb-4">Set Up Your Xaman Wallet</h2>
      <p className="text-zinc-400 max-w-2xl mx-auto">
        Follow these steps to create your wallet and start receiving RLUSD commissions. Takes about 10 minutes.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* Left Column - Steps 1-3 */}
      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">1</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Download Xaman App</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Xaman (formerly XUMM) is free and available on iOS and Android. Download from the official app stores only.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://apps.apple.com/app/xumm/id1492302343"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.xrpllabs.xumm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">2</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Create Your Wallet</h3>
              <p className="text-zinc-400 text-sm mb-3">
                Open the app and tap "Create a new account". You'll be shown secret numbers - these are your recovery phrase.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-amber-400 text-xs font-medium">
                  ⚠️ Write down your secret numbers on paper. Never screenshot or share them. If you lose them, you lose access to your wallet forever. Never share these. If anyone gets access to this they can access your funds and you could lose everything.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">3</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Activate Your Wallet</h3>
              <p className="text-zinc-400 text-sm mb-3">
                Your wallet needs 1 XRP to activate (this is an XRPL requirement, not a fee). You can buy XRP from any exchange and send it to your new address. You wil need 0.5 XRP to cover future XRPl Ledger transaction fees.
              </p>
              <p className="text-zinc-500 text-xs">
                Popular exchanges: Coinbase, Kraken, Bitstamp, Uphold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Steps 4-5 */}
      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">4</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Add RLUSD Trustline</h3>
              <p className="text-zinc-400 text-sm mb-3">
                To receive RLUSD commissions, you need to add a trustline. This tells the XRP Ledger you accept RLUSD.
              </p>
              <a 
                href="https://yesallofus.com/trustline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm px-4 py-2 rounded-lg transition border border-emerald-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                RLUSD Trustline Guide
              </a>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">5</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Copy Your Wallet Address</h3>
              <p className="text-zinc-400 text-sm mb-3">
                In Xaman, tap on your account to see your wallet address. It starts with "r" and looks like: <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">rXXXXXXXX...</code>
              </p>
              <p className="text-zinc-500 text-xs">
                This is the address you'll paste when signing up as an affiliate on any store using YesAllofUs.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-emerald-400">You're Ready!</h3>
              <p className="text-zinc-400 text-sm">
                Your wallet is set up. Now you can sign up as an affiliate on any store using YesAllofUs and paste your wallet address to start earning commissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Official Link */}
    <div className="text-center">
      <p className="text-zinc-500 text-sm mb-3">Need more help? Visit the official Xaman documentation</p>
      <a 
        href="https://xaman.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition"
      >
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-6 h-6 rounded" />
        xaman.app
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</section>

      <main className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Wallet Options Tabs */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Connection Method</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Each option has different trade-offs between convenience and control. Pick what works for you.
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab('xaman')}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                activeTab === 'xaman'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg" />
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  Xaman
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">✓ Live</span>
                </div>
                <div className="text-zinc-500 text-sm">Mobile app</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex -space-x-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div className="w-7 h-7 bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  Social Login
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Coming Soon</span>
                </div>
                <div className="text-zinc-500 text-sm">No wallet needed</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('crossmark')}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                activeTab === 'crossmark'
                  ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/50 shadow-lg shadow-orange-500/10'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg" />
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  Crossmark
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Coming Soon</span>
                </div>
                <div className="text-zinc-500 text-sm">Browser extension</div>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
            
            {/* Social Login Tab */}
            {activeTab === 'social' && (
              <div className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Social Login</h3>
                        <p className="text-zinc-500">Powered by Web3Auth MPC</p>
                      </div>
                    </div>

                    <p className="text-zinc-300 mb-6 leading-relaxed">
                      No wallet app needed. No seed phrases to remember. Sign in with Google, Apple, Facebook, X, Discord, or GitHub — we create a real XRPL wallet for you instantly using Multi-Party Computation technology.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">We make it easy</div>
                          <div className="text-zinc-500 text-sm">If you can use Gmail, you can use YesAllofUs</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Automatic wallet creation</div>
                          <div className="text-zinc-500 text-sm">Real XRPL address created in seconds</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">24/7 automatic payouts</div>
                          <div className="text-zinc-500 text-sm">No browser session required — works while you sleep</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">We handle wallet activation</div>
                          <div className="text-zinc-500 text-sm">Your commissions auto-fund your wallet reserve</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button 
  disabled
  className="bg-zinc-700 text-zinc-400 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
>
  Sign Up with Social
  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded ml-2">Coming Soon</span>
</button>
                      <Link 
                        href="/docs/web3auth"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        Technical Docs →
                      </Link>
                    </div>
                  </div>

                  <div>
                    {/* How MPC Works */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        How Multi-Party Computation Works
                      </h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">1</div>
                          <div>
                            <div className="text-zinc-300 font-medium">Private key is never whole</div>
                            <div className="text-zinc-500">Your key is mathematically split into multiple encrypted shares</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">2</div>
                          <div>
                            <div className="text-zinc-300 font-medium">Distributed across nodes</div>
                            <div className="text-zinc-500">Shares stored on separate Web3Auth infrastructure nodes</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">3</div>
                          <div>
                            <div className="text-zinc-300 font-medium">Reconstructed only when signing</div>
                            <div className="text-zinc-500">Shares combine momentarily to sign, then split again</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">4</div>
                          <div>
                            <div className="text-zinc-300 font-medium">No single point of failure</div>
                            <div className="text-zinc-500">Compromising one node doesn't compromise your wallet</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Supported Providers */}
                    <div className="bg-zinc-800/50 rounded-xl p-6">
                      <h4 className="font-semibold mb-4">Supported Providers</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: 'Google', bg: 'bg-white', icon: <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                          { name: 'Apple', bg: 'bg-black', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
                          { name: 'Facebook', bg: 'bg-[#1877F2]', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                          { name: 'X', bg: 'bg-black', icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                          { name: 'Discord', bg: 'bg-[#5865F2]', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> },
                          { name: 'GitHub', bg: 'bg-[#24292e]', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
                          { name: 'Twitch', bg: 'bg-[#9146FF]', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg> },
                          { name: 'More', bg: 'bg-zinc-700', icon: <span className="text-white text-xs font-bold">+5</span> },
                        ].map((p) => (
                          <div key={p.name} className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 ${p.bg} rounded-xl flex items-center justify-center`}>
                              {p.icon}
                            </div>
                            <span className="text-zinc-500 text-xs">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Xaman Tab */}
{activeTab === 'xaman' && (
  <div className="p-8 md:p-12">
    <div className="grid lg:grid-cols-2 gap-12">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-12 h-12 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold">Xaman Wallet</h3>
            <p className="text-zinc-500">The recommended XRPL wallet</p>
          </div>
        </div>

        <p className="text-zinc-300 mb-6 leading-relaxed">
          Xaman (formerly XUMM) is the most trusted wallet for XRP Ledger. Your private keys stay on your phone, and you approve every transaction. Free to download and use.
        </p>

        {/* Step by step setup */}
        <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold mb-4 text-emerald-400">How to Get Started</h4>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold">1</div>
              <div>
                <div className="text-zinc-300 font-medium">Download Xaman</div>
                <div className="text-zinc-500">Available on iOS App Store and Google Play</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold">2</div>
              <div>
                <div className="text-zinc-300 font-medium">Create a new wallet</div>
                <div className="text-zinc-500">Follow the app instructions, save your secret numbers safely</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold">3</div>
              <div>
                <div className="text-zinc-300 font-medium">Activate your wallet</div>
                <div className="text-zinc-500">You need 10 XRP to activate (buy from any exchange)</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold">4</div>
              <div>
                <div className="text-zinc-300 font-medium">Add RLUSD trustline</div>
                <div className="text-zinc-500">Required to receive RLUSD commissions</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold">5</div>
              <div>
                <div className="text-zinc-300 font-medium">Copy your wallet address</div>
                <div className="text-zinc-500">Starts with "r" - paste this when signing up as affiliate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a 
            href="https://xaman.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Download Xaman →
          </a>
          <a 
            href="https://yesallofus.com/trustline"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            RLUSD Trustline Guide
          </a>
        </div>
      </div>

      <div>
        {/* Why Xaman */}
        <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Why Xaman?
          </h4>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-zinc-300">Keys stay on your phone</div>
                <div className="text-zinc-500">Your private keys are never shared</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-zinc-300">Trusted since 2018</div>
                <div className="text-zinc-500">The most popular XRPL wallet</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-zinc-300">iOS and Android</div>
                <div className="text-zinc-500">Works on any smartphone</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-zinc-300">Free to use</div>
                <div className="text-zinc-500">No subscription or fees from Xaman</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <h4 className="font-semibold mb-3 text-amber-400">Important</h4>
          <ul className="text-zinc-300 text-sm space-y-2">
            <li>• You need 10 XRP to activate your wallet</li>
            <li>• You need an RLUSD trustline to receive commissions</li>
            <li>• Never share your secret numbers with anyone</li>
            <li>• YesAllofUs will never ask for your private keys</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}

            {/* Crossmark Tab */}
            {activeTab === 'crossmark' && (
              <div className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-12 h-12 rounded-xl" />
                      <div>
                        <h3 className="text-2xl font-bold">Crossmark Wallet</h3>
                        <p className="text-zinc-500">Full automation, Auto-Sign control</p>
                      </div>
                    </div>

                    <p className="text-zinc-300 mb-6 leading-relaxed">
                      For high-volume stores that need instant, automated payouts. You add YesAllofUs as a signer with specific limits — payments process automatically without manual approval. Affiliates get paid in ~4 seconds.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Fully automatic payouts</div>
                          <div className="text-zinc-500 text-sm">No manual approval needed</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">You set the limits</div>
                          <div className="text-zinc-500 text-sm">Max per transaction and daily caps</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Uses XRPL SignerLists</div>
                          <div className="text-zinc-500 text-sm">Native multi-sig, not a proprietary system</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Revoke access anytime</div>
                          <div className="text-zinc-500 text-sm">Remove signer from your wallet instantly</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button 
  disabled
  className="bg-zinc-700 text-zinc-400 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
>
  Connect Crossmark
  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded ml-2">Coming Soon</span>
</button>
                      <a 
                        href="https://crossmark.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        Get Crossmark →
                      </a>
                    </div>
                  </div>

                  <div>
                    {/* SignerList Explainer */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        How SignerLists Work
                      </h4>
                      <div className="space-y-3 text-sm">
                        <p className="text-zinc-400">
                          XRPL's native multi-signature feature. You add our platform wallet as an authorized signer. We can then sign transactions on your behalf — but only RLUSD payments, and only within your limits.
                        </p>
                        <div className="bg-zinc-900/50 rounded-lg p-4 font-mono text-xs text-zinc-400">
                          <div className="text-orange-400">// Your wallet's SignerList</div>
                          <div>SignerQuorum: 1</div>
                          <div>SignerEntries: [</div>
                          <div className="pl-4">{"{"} Account: "YesAllofUs Platform" {"}"}</div>
                          <div>]</div>
                        </div>
                        <p className="text-zinc-500">
                          This is an XRPL primitive, not YesAllofUs code. Auditable on-chain. Revocable instantly.
                        </p>
                      </div>
                    </div>

                    {/* Best For */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                      <h4 className="font-semibold mb-3 text-orange-400">Best For</h4>
                      <ul className="text-zinc-300 text-sm space-y-2">
                        <li>• High-volume stores (50+ orders/day)</li>
                        <li>• Users comfortable with XRPL concepts</li>
                        <li>• Those who want instant affiliate payments</li>
                        <li>• Desktop-first workflow</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Comparison</h2>
            <p className="text-zinc-400">All three options at a glance</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        </div>
                      </div>
                      <span className="font-semibold">Social Login</span>
<span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded ml-1">Soon</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded-lg" />
                      <span className="font-semibold">Xaman</span>
<span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded ml-1">✓ Live</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded-lg" />
                      <span className="font-semibold">Crossmark</span>
<span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded ml-1">Soon</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Setup Time', social: '30 seconds', xaman: '~5 minutes', crossmark: '~5 minutes' },
                  { feature: 'Crypto Knowledge', social: 'None required', xaman: 'Basic', crossmark: 'Intermediate' },
                  { feature: 'Payout Mode', social: 'Automatic 24/7', xaman: 'Manual approval', crossmark: 'Automatic 24/7' },
                  { feature: 'Platform', social: 'Any browser', xaman: 'Mobile (iOS/Android)', crossmark: 'Desktop browser' },
                  { feature: 'Key Storage', social: 'MPC (distributed)', xaman: 'Your device only', crossmark: 'Your device only' },
                  { feature: 'Recovery', social: 'Social account', xaman: 'Seed phrase', crossmark: 'Seed phrase' },
                  { feature: 'Best For', social: 'Beginners', xaman: 'Security-first', crossmark: 'Power users' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-4 px-4 text-zinc-400">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-zinc-300">{row.social}</td>
                    <td className="py-4 px-4 text-center text-zinc-300">{row.xaman}</td>
                    <td className="py-4 px-4 text-center text-zinc-300">{row.crossmark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </main>
    </div>
  );
}