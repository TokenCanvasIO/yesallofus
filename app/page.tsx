'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [betaStatus, setBetaStatus] = useState({ spots_remaining: 5, beta_open: true });
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('');

  useEffect(() => {
    fetch('https://api.dltpays.com/api/v1/beta/status')
      .then(res => res.json())
      .then(data => setBetaStatus(data))
      .catch(() => {});
  }, []);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setWaitlistStatus('loading');
    try {
      const res = await fetch('https://api.dltpays.com/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setWaitlistStatus('success');
        setEmail('');
      } else {
        setWaitlistStatus('error');
      }
    } catch {
      setWaitlistStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      {/* Beta Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/30 py-3 px-6 text-center">
        {betaStatus.beta_open ? (
          <p className="text-emerald-400 text-sm">
            <span>🤝</span> <strong>Beta:</strong> {betaStatus.spots_remaining} spots left. I'm onboarding each store personally.
          </p>
        ) : waitlistStatus === 'success' ? (
          <p className="text-emerald-400 text-sm">✓ You're on the list.</p>
        ) : (
          <form onSubmit={handleWaitlist} className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-emerald-400 text-sm">Beta full —</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-zinc-800 border border-zinc-600 rounded px-3 py-1 text-sm text-white w-48"
              required
            />
            <button 
              type="submit" 
              disabled={waitlistStatus === 'loading'}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 py-1 rounded text-sm"
            >
              {waitlistStatus === 'loading' ? '...' : 'Join'}
            </button>
          </form>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-6">
        
        {/* Hero */}
<section className="py-10 md:py-10">
  <div className="max-w-3xl mx-auto text-center">
    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
      Turn your affiliate program into a global growth machine.
    </h1>
    <p className="text-xl text-zinc-400 mb-8 max-w-xl mx-auto">
      Pay affiliates instantly in RLUSD — not in 30 days. Free to join. No subscriptions. No bank accounts. No minimums.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="#get-started" 
        className="bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-3 rounded text-center transition"
      >
        Start free
      </a>
      <a 
        href="#how-it-works" 
        className="border border-zinc-700 hover:border-zinc-500 px-6 py-3 rounded text-center transition"
      >
        How it works
      </a>
    </div>
  </div>
</section>

        {/* The point */}
<section className="py-16 border-t border-zinc-800">
  <div className="grid md:grid-cols-3 gap-8 text-center">
    <div>
      <p className="text-zinc-500 text-sm mb-2">Payout speed</p>
      <p className="text-2xl font-semibold text-emerald-400">4 seconds</p>
      <p className="text-zinc-500 text-sm mt-2">Not 30 days</p>
    </div>
    <div>
  <p className="text-zinc-500 text-sm mb-2">$1 product sale</p>
  <p className="text-2xl font-semibold text-emerald-400">5 affiliates paid</p>
  <p className="text-zinc-500 text-sm mt-2">Micro-commissions, finally possible</p>
</div>
    <div>
      <p className="text-zinc-500 text-sm mb-2">International fees</p>
      <p className="text-2xl font-semibold text-emerald-400">$0</p>
      <p className="text-zinc-500 text-sm mt-2">Not $25-50 per wire</p>
    </div>
  </div>
</section>

        {/* Global access */}
<section className="py-20 border-t border-zinc-800">
  <div className="grid md:grid-cols-2 gap-12 items-center px-4 md:px-0">
    <div className="text-center md:text-left">
      <h2 className="text-3xl font-bold mb-6">Your affiliates are everywhere.</h2>
      <p className="text-zinc-400 mb-4">
        An affiliate in Lagos gets paid the same speed as one in London. No bank account. No minimum threshold. Just a wallet and a phone.
      </p>
      <p className="text-zinc-400">
        $15/month is survival wages in some countries. Your affiliate program just became their path to 3x that.
      </p>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">London</span>
          <span className="text-emerald-400">4 seconds</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Lagos</span>
          <span className="text-emerald-400">4 seconds</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Manila</span>
          <span className="text-emerald-400">4 seconds</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">São Paulo</span>
          <span className="text-emerald-400">4 seconds</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 mt-6 pt-6">
        <p className="text-zinc-500 text-sm">Paid in RLUSD. $1 = $1. No volatility.</p>
      </div>
    </div>
  </div>
</section>

       {/* Why we're different */}
<section className="py-20 border-t border-zinc-800">
  <div className="text-center mb-12">
    <p className="text-emerald-400 text-sm font-semibold mb-4">Why this exists</p>
    <h2 className="text-3xl font-bold mb-4">Four things. No one else combines them.</h2>
    <p className="text-zinc-400 max-w-xl mx-auto">
      Plenty of affiliate software. Plenty of rails. Nobody built on XRPL or built the bridge.
    </p>
  </div>
  
  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <div className="text-2xl mb-3">🔌</div>
      <h3 className="font-bold mb-2">Built for affiliate payouts</h3>
      <p className="text-zinc-400 text-sm">
        Not a generic payment rail. Purpose-built for e-commerce stores paying affiliates. WooCommerce plugin. 5-tier MLM logic. Store dashboards.
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <div className="text-2xl mb-3">⚡</div>
      <h3 className="font-bold mb-2">Instant & automatic</h3>
      <p className="text-zinc-400 text-sm">
        Sale happens → affiliates paid. 4 seconds. No batching. No manual runs. No "payments processed on the 15th. Save a fortune"
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <div className="text-2xl mb-3">🔐</div>
      <h3 className="font-bold mb-2">Non-custodial</h3>
      <p className="text-zinc-400 text-sm">
        Your wallet. Your keys. We never touch your funds. You grant permission to trigger payments within limits you set. Revoke anytime.
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <img src="/XRP-logo.webp" alt="XRPL" className="w-8 h-8 mb-3 mx-auto" />
      <h3 className="font-bold mb-2">XRPL + RLUSD native</h3>
      <p className="text-zinc-400 text-sm">
        Built on the XRP Ledger. Paid in RLUSD stablecoin. $1 = $1. Near-zero fees. Settlement in seconds, not days.
      </p>
    </div>
  </div>
  
  <p className="text-zinc-500 text-sm text-center mt-8 max-w-2xl mx-auto">
    Traditional affiliate platforms make you wait 30 days for a wire transfer. Crypto gateways don't understand commission structures. We built what should have existed.
  </p>
</section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 border-t border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-zinc-400 mb-12">Two minutes to set up. Then it runs itself.</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <p className="text-zinc-500 text-sm mb-4">WordPress / WooCommerce</p>
              <ol className="space-y-3 text-zinc-300">
                <li>1. Install the plugin</li>
                <li>2. Connect your wallet</li>
                <li>3. Set commission rates</li>
              </ol>
              <p className="text-zinc-500 text-sm mt-6">That's it. Payouts happen automatically.</p>
              <a href="/guides/wordpress" className="inline-block mt-6 text-white hover:text-zinc-300 transition">
                WordPress guide →
              </a>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <p className="text-zinc-500 text-sm mb-4">Any platform</p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm mb-4">
                <span className="text-zinc-500">$</span> npx yesallofus
              </div>
              <p className="text-zinc-400 text-sm">
                Creates your account. Returns API keys. Add one snippet to your checkout. Done.
              </p>
              <a href="/docs" className="inline-block mt-6 text-white hover:text-zinc-300 transition">
                API docs →
              </a>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
  <div className="flex flex-col items-center">
              <div className="text-3xl">🤝</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Want me to set it up?</h3>
                <p className="text-zinc-400 mb-4">
                  30-minute call. Any platform. I'll get you live.
                </p>
                <p className="mb-4">
                  <span className="text-zinc-500 line-through">£999</span>
                  <span className="text-white font-bold ml-2">£499</span>
                  <span className="text-zinc-500 text-sm ml-2">— first 5 stores</span>
                </p>
                <a href="https://calendly.com/tokencanvasio/30min" target="_blank" className="text-white hover:text-zinc-300 transition">
                  Book a call →
                </a>
              </div>
            </div>
          </div>
        </section>

       {/* Security */}
<section className="py-20 border-t border-zinc-800 text-center">
  <h2 className="text-3xl font-bold mb-4">Your wallet. Your keys. Your limits.</h2>
  <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
    YesAllofUs never holds your funds. You grant permission to trigger payments. Set daily limits. Revoke anytime.
  </p>
  
  {/* Web3Auth - Full Width */}
  <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-8 mb-8 opacity-50">
    <div className="flex items-center justify-center gap-3 mb-4">
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
        <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
        <div className="w-8 h-8 bg-[#24292e] rounded-full flex items-center justify-center border-2 border-zinc-900">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
      </div>
      <span className="font-semibold text-xl">Social Login</span>
      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Coming Soon</span>
    </div>
    <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
      No wallet app needed. No seed phrases. Sign in with Google, Apple, Facebook, X, Discord, or GitHub — we create a real XRPL wallet for you automatically using Web3Auth MPC technology.
    </p>
    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="text-2xl mb-2">🪄</div>
        <div className="font-medium text-zinc-200">5 Minute Set up</div>
        <div className="text-zinc-500 text-sm">If you use socials, you can use this</div>
      </div>
      <div className="text-center">
        <div className="text-2xl mb-2">🏦</div>
        <div className="font-medium text-zinc-200">MPC security</div>
        <div className="text-zinc-500 text-sm">Bank-grade key security</div>
      </div>
      <div className="text-center">
        <div className="text-2xl mb-2">⚡</div>
        <div className="font-medium text-zinc-200">24/7 auto payouts</div>
        <div className="text-zinc-500 text-sm">Works while you sleep</div>
      </div>
    </div>
  </div>

  {/* Xaman & Crossmark */}
  <div className="grid md:grid-cols-2 gap-8">
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
        <span className="font-semibold">Xaman</span>
<span className="text-zinc-500 text-sm">Mobile</span>
<span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">✓ Live</span>
      </div>
      <p className="text-zinc-400 mb-6">Approve each payout via push notification. Maximum control.</p>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li>✓ Manual approval for every payment</li>
        <li>✓ See exactly what's being sent</li>
        <li>✓ Best for lower volume</li>
      </ul>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 opacity-50">
  <div className="flex items-center justify-center gap-3 mb-4">
    <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
    <span className="font-semibold">Crossmark</span>
    <span className="text-zinc-500 text-sm">Browser</span>
    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Coming Soon</span>
  </div>
      <p className="text-zinc-400 mb-6">Automatic payouts within limits you set. Hands-off.</p>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li>✓ Revoke permission anytime</li>
        <li>✓ Set max per transaction</li>
        <li>✓ Set daily limit</li>
      </ul>
    </div>
  </div>
  
  <p className="text-zinc-500 text-sm mt-8 text-center">
    Every transaction is public on the XRP Ledger. Anyone can verify. Nothing hidden.
  </p>
</section>

        {/* Multi-level */}
        <section className="py-20 border-t border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">Five levels deep. All instant.</h2>
          <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
            Affiliates refer affiliates. Everyone gets paid the moment the sale happens. You set the rates.
          </p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-lg mx-auto">
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Level 1 (direct)</span>
                <span className="text-white">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Level 2</span>
                <span className="text-white">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Level 3</span>
                <span className="text-white">3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Level 4</span>
                <span className="text-white">2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Level 5</span>
                <span className="text-white">1%</span>
              </div>
            </div>
            <div className="border-t border-zinc-800 mt-6 pt-6">
              <p className="text-zinc-500 text-sm">Default rates. Fully configurable.</p>
            </div>
          </div>
        </section>

       {/* Refer stores */}
<section className="py-20 border-t border-zinc-800">
  <div className="grid md:grid-cols-2 gap-12 items-center">
    <div className="text-center md:text-left max-w-md mx-auto md:mx-0 md:max-w-none">
      <h2 className="text-3xl font-bold mb-4">Refer other stores.</h2>
      <p className="text-zinc-400 mb-4">
        Know someone who should use this? Give them your referral code. You earn 25% of their platform fees. Forever.
      </p>
      <p className="text-zinc-400">
        They get 50% off their first month. You get passive income every time they pay affiliates.
      </p>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center md:text-left max-w-md mx-auto md:mx-0 md:max-w-none">
      <p className="text-zinc-500 text-sm mb-2">Vendor B processes $10k in commissions</p>
      <p className="text-zinc-500 text-sm mb-2">Platform fee: $290</p>
      <p className="text-2xl font-semibold text-emerald-400">You earn: $72.50</p>
      <p className="text-zinc-500 text-sm mt-4">Every month. Automatically.</p>
    </div>
  </div>
</section>

        {/* Reputation */}
        <section className="py-20 border-t border-zinc-800 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-emerald-400 text-sm font-semibold mb-4">Coming soon</p>
            <h2 className="text-3xl font-bold mb-4">Your reputation. On-chain.</h2>
            <p className="text-zinc-400 mb-6">
              Every payout builds a verifiable history. Transaction volume. Success rate. Consistency. All recorded. All portable. All yours.
            </p>
            <p className="text-zinc-400 mb-6">
              We're building merchant reputation scores that DeFi protocols can read. Undercollateralized lending reputation building based on your actual track record, not your paperwork.
            </p>
            <p className="text-zinc-500 text-sm italic">
              Own your reputation. Built on your hard work. Proven on-chain.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 border-t border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">Pricing</h2>
          <p className="text-zinc-400 mb-12">Percentage of commissions paid, not sales. Start free.</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold mb-1">Free</h3>
              <p className="text-zinc-500 text-sm mb-6">Up to $25k/month</p>
              <p className="text-4xl font-bold mb-1">2.9%</p>
              <p className="text-zinc-500 text-sm">per payout</p>
            </div>
            <div className="bg-zinc-900 border border-white/20 rounded-xl p-6">
              <h3 className="font-bold mb-1">Pro</h3>
              <p className="text-zinc-500 text-sm mb-6">$25k–$250k/month</p>
              <p className="text-4xl font-bold mb-1">0.9%</p>
              <p className="text-zinc-500 text-sm">+ $99/mo</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold mb-1">Enterprise</h3>
              <p className="text-zinc-500 text-sm mb-6">$250k+/month</p>
              <p className="text-4xl font-bold mb-1">Flat</p>
              <p className="text-zinc-500 text-sm">$499/mo</p>
            </div>
          </div>
          
          <p className="text-zinc-500 text-sm mt-8">
            That's 2.9% of the commission, not the sale. $100 order, $25 commission = $0.73 fee.
          </p>
        </section>

        {/* CTA */}
        <section id="get-started" className="py-20 border-t border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">No more payment spreadsheets.</h2>
<p className="text-zinc-400 mb-8">Let the Ledger take care of it. It's automatic.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/guides/wordpress" 
              className="bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded transition text-center"
            >
              WordPress
            </a>
            <a 
              href="/docs" 
              className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded transition text-center"
            >
              API / Developer
            </a>
            <a 
              href="https://calendly.com/tokencanvasio/30min" 
              target="_blank"
              className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded transition text-center"
            >
              Done for you — £499
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}