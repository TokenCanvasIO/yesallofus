'use client';
import React, { useState } from 'react';

export default function TrustlineGuide() {
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Required for Affiliates
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Set Up Your RLUSD Trustline</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            To receive instant commission payments, your wallet needs an RLUSD trustline. This one-time setup takes about 2 minutes.
          </p>
        </div>

        {/* What is a Trustline */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            What is a Trustline?
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            A trustline is your permission to hold a specific token on the XRP Ledger. Think of it like opening a specific currency account at a bank. Without an RLUSD trustline, your wallet cannot receive RLUSD payments — they&apos;ll simply fail.
          </p>
        </div>

        {/* RLUSD Details Box */}
        <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/30 rounded-xl p-6 mb-12">
          <h3 className="font-semibold text-white mb-4">RLUSD Token Details</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/20 rounded-lg p-4">
              <div>
                <p className="text-zinc-400 text-sm">Currency Code</p>
                <p className="font-mono text-lg text-white">RLUSD</p>
              </div>
              <button
                onClick={() => handleCopy('RLUSD', 'currency')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copiedText === 'currency' 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                {copiedText === 'currency' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/20 rounded-lg p-4">
              <div>
                <p className="text-zinc-400 text-sm">Issuer Address</p>
                <p className="font-mono text-sm sm:text-base text-white break-all">rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De</p>
              </div>
              <button
                onClick={() => handleCopy('rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De', 'issuer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                  copiedText === 'issuer' 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                {copiedText === 'issuer' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mt-4">
            RLUSD is issued by Ripple — the official stablecoin backed 1:1 by USD reserves.
          </p>
        </div>

        {/* Wallet Tabs */}
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Wallet. Coming Soon.</h2>

        {/* Web3Auth Social Login - Full Width */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 border-b border-indigo-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
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
                  <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Social Login
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Automatic</span>
                  </h3>
                  <p className="text-zinc-400 text-sm">Google, Apple, Facebook, X, Discord, GitHub</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-emerald-300 font-semibold">No manual trustline setup required!</p>
                  <p className="text-zinc-400 text-sm mt-1">When you sign up with a social account, we handle everything automatically.</p>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-white mb-4">How It Works</h4>
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-zinc-300"><strong className="text-white">Sign up with any social account</strong></p>
                  <p className="text-zinc-500 text-sm">Google, Apple, Facebook, X, Discord, or GitHub</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-zinc-300"><strong className="text-white">YesAllofUs engine enables the Ledger to set up your XRPL wallet automatically</strong></p>
                  <p className="text-zinc-500 text-sm">A real wallet address is generated instantly using Web3Auth MPC technology</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-zinc-300"><strong className="text-white">Commissions are held in pending balance</strong></p>
                  <p className="text-zinc-500 text-sm">Your earnings accumulate until you reach the activation threshold (~$1.50)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="text-zinc-300"><strong className="text-white">Your commission funds your wallet & the Ledger adds the trustline</strong></p>
                  <p className="text-zinc-500 text-sm">Once threshold is reached, the ledger activates your wallet and sets up the RLUSD trustline automatically</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
                <div>
                  <p className="text-zinc-300"><strong className="text-white">Pending balance released + future payouts instant</strong></p>
                  <p className="text-zinc-500 text-sm">Your held commissions are paid out, and all future earnings arrive in ~4 seconds</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
              <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Why the 1.50 XRP threshold?
              </h5>
              <p className="text-zinc-400 text-sm">
                New XRPL wallets require a minimum reserve of ~1 XRP to activate, plus ~0.2 XRP for each trustline. 
                Instead of asking you to fund this yourself, we cover it from your first commissions plus transaction fees to help you start. 
                You don&apos;t pay anything — it just means your first few dollars are held briefly until the we can tell the ledger to activate your wallet.
              </p>
            </div>

            <a 
              href="/affiliate-dashboard"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <span>Sign Up with Social Login</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-zinc-800"></div>
          <span className="text-zinc-500 text-sm">Or use your own wallet</span>
          <div className="flex-1 h-px bg-zinc-800"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Xaman Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Xaman</h3>
                  <p className="text-zinc-400 text-sm">Mobile Wallet (iOS & Android)</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-zinc-300">Open Xaman and tap the <strong className="text-white">+</strong> button on your home screen</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-zinc-300">Search for <strong className="text-white">&quot;RLUSD&quot;</strong> in the token list</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-zinc-300">Tap <strong className="text-white">Add</strong> and confirm the trustline transaction</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-zinc-300">Sign with your passcode or biometrics</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="https://help.xaman.app/app/getting-started-with-xaman/how-to-create-a-rlusd-trust-line"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <span>View Official Xaman Guide</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
                <p className="text-zinc-500 text-xs text-center mt-3">
                  Don&apos;t have Xaman? <a href="https://xaman.app" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Download here →</a>
                </p>
              </div>
            </div>
          </div>

          {/* Crossmark Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Crossmark</h3>
                  <p className="text-zinc-400 text-sm">Browser Extension</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-zinc-300">Open Crossmark and click <strong className="text-white">Assets</strong> or the <strong className="text-white">+</strong> icon</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-zinc-300">Select <strong className="text-white">Add Custom Asset</strong></p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div className="text-zinc-300">
                    <p className="mb-1">Enter the token details:</p>
                    <ul className="text-sm space-y-1 text-zinc-400">
                      <li>• Currency: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400">RLUSD</code></li>
                      <li>• Issuer: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400 text-xs">rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De</code></li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-zinc-300">Review and <strong className="text-white">Sign</strong> the TrustSet transaction</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="https://crossmark.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <span>Get Crossmark Extension</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
                <p className="text-zinc-500 text-xs text-center mt-3">
                  Works with Chrome, Firefox, Brave & Edge
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Box */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-12">
          <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Before You Start (Xaman & Crossmark Only)
          </h3>
          <p className="text-zinc-400 text-sm mb-4">These requirements apply only if you&apos;re using your own wallet. Social login handles this automatically.</p>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong className="text-white">Activated wallet</strong> — You need at least 1 XRP to activate your wallet</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong className="text-white">Reserve requirement</strong> — Each trustline locks 0.2 XRP as a reserve (released if you remove the trustline)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong className="text-white">Transaction fee</strong> — A tiny fee (~0.00001 XRP) is required to set the trustline</span>
            </li>
          </ul>
        </div>

        {/* Verification Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            How to Verify Your Trustline
          </h3>
          <p className="text-zinc-300 mb-4">
            After setting up, you can verify your trustline is active:
          </p>
          <ol className="space-y-2 text-zinc-300 mb-4">
  <li className="flex items-start gap-2">
    <span className="text-zinc-500">1.</span>
    <span>Visit <a href="https://xrpl.org/docs/references/protocol/transactions/types/trustset" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">xrpl.org trustline docs</a></span>
  </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-500">2.</span>
              <span>Enter your wallet address in the search bar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-500">3.</span>
              <span>Click the <strong className="text-white">Assets</strong> tab</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-500">4.</span>
              <span>You should see <strong className="text-white">RLUSD</strong> listed with a balance of 0</span>
            </li>
          </ol>
          <p className="text-zinc-500 text-sm">
            A balance of 0 is normal — it just means your trustline is set up and ready to receive payments.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Common Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">What happens if I don&apos;t have a trustline?</h4>
              <p className="text-zinc-400 text-sm">Your commission payments will fail and be skipped. The merchant won&apos;t be charged, but you won&apos;t receive your earnings until you set up the trustline.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">What if I use social login — do I need to do anything?</h4>
              <p className="text-zinc-400 text-sm">No! When you sign up with Google, Apple, or other social accounts, we handle wallet creation, funding, and trustline setup automatically. Your first ~$1.50 in commissions are held to cover the wallet activation, then everything flows instantly after that.</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">Is RLUSD safe?</h4>
              <p className="text-zinc-400 text-sm">RLUSD is issued by Ripple and is backed 1:1 by US dollar deposits held in regulated financial institutions. It&apos;s designed to maintain a stable $1 value.</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">Can I remove the trustline later?</h4>
              <p className="text-zinc-400 text-sm">Yes, but only if your RLUSD balance is zero. Removing the trustline releases the 2 XRP reserve back to your available balance.</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">Why RLUSD instead of XRP?</h4>
              <p className="text-zinc-400 text-sm">RLUSD is a stablecoin pegged to the US dollar, so your commissions maintain their value. XRP is volatile — a $10 commission could be worth $8 or $12 an hour later.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
  <h4 className="font-semibold text-white mb-2">Can I switch from social login to my own wallet later?</h4>
  <p className="text-zinc-400 text-sm">Yes! You can create your own wallet with Xaman or Crossmark anytime and update your wallet address in your affiliate dashboard. Your future commissions will be paid to your new address.</p>
</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Earn?</h2>
          <p className="text-zinc-400 mb-6">Once your trustline is set up, you&apos;re ready to receive instant commissions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/affiliate-dashboard"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Go to Affiliate Dashboard
            </a>
            <a 
              href="/"
              className="border border-zinc-600 hover:border-zinc-400 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Learn More About YesAllofUs
            </a>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 text-zinc-400">Official Resources</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="https://help.xaman.app/app/getting-started-with-xaman/how-to-create-a-rlusd-trust-line" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Xaman Help Center →</a>
            <a href="https://xrpl.org/trust-lines-and-issuing.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">XRPL Documentation →</a>
            <a href="https://ripple.com/solutions/stablecoin/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">About RLUSD →</a>
          </div>
        </div>
      </main>
    </div>
  );
}