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
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              Built on XRPL. Turn your affiliate program into a global machine.
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-xl mx-auto">
              Pay anyone, anywhere, instantly in RLUSD. No bank accounts. $1 minimums (yes, really). Just a wallet and a phone.
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
      Plenty of affiliate software. Plenty of crypto rails. Nobody built the bridge.
    </p>
  </div>
  
  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center md:text-left">
      <div className="text-2xl mb-3">🔌</div>
      <h3 className="font-bold mb-2">Built for affiliate payouts</h3>
      <p className="text-zinc-400 text-sm">
        Not a generic payment rail. Purpose-built for e-commerce stores paying affiliates. WooCommerce plugin. 5-tier MLM logic. Store dashboards.
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center md:text-left">
      <div className="text-2xl mb-3">⚡</div>
      <h3 className="font-bold mb-2">Instant & automatic</h3>
      <p className="text-zinc-400 text-sm">
        Sale happens → affiliates paid. 4 seconds. No batching. No manual runs. No "payments processed on the 15th."
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center md:text-left">
      <div className="text-2xl mb-3">🔐</div>
      <h3 className="font-bold mb-2">Non-custodial</h3>
      <p className="text-zinc-400 text-sm">
        Your wallet. Your keys. We never touch your funds. You grant permission to trigger payments within limits you set. Revoke anytime.
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center md:text-left">
      <div className="text-2xl mb-3">🌐</div>
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
  <div className="grid md:grid-cols-2 gap-8">
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
        <span className="font-semibold">Xaman</span>
        <span className="text-zinc-500 text-sm">Mobile</span>
      </div>
      <p className="text-zinc-400 mb-6">Approve each payout via push notification. Maximum control.</p>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li>✓ Manual approval for every payment</li>
        <li>✓ See exactly what's being sent</li>
        <li>✓ Best for lower volume</li>
      </ul>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
        <span className="font-semibold">Crossmark</span>
        <span className="text-zinc-500 text-sm">Browser</span>
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