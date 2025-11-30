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
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0d0d0d]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/dltpayslogo1.png" alt="YesAllofUs" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl hidden sm:inline">YesAllofUs</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/docs" className="text-zinc-400 hover:text-white text-sm transition">Docs</a>
            <a href="/#pricing" className="text-zinc-400 hover:text-white text-sm transition">Pricing</a>
          </nav>
        </div>
      </header>

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
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Wallet</h2>
        
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
            Before You Start
          </h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong className="text-white">Activated wallet</strong> — You need at least 10 XRP to activate your wallet</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong className="text-white">Reserve requirement</strong> — Each trustline locks 2 XRP as a reserve (released if you remove the trustline)</span>
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
              <span>Visit <a href="https://xrpscan.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">xrpscan.com</a></span>
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