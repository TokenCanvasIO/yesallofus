'use client';

export default function RLUSDCommissions() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">

      <main className="max-w-6xl mx-auto px-6">
        
        {/* Hero */}
        <section className="pt-20 md:pt-25 pb-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium">Payouts in 4 seconds, not 30 days</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              Pay affiliates in RLUSD.<br />
              <span className="text-emerald-400">Instantly.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
              Stop managing payout runs. Stop paying international fees. Commission hits your affiliate's wallet the second the sale completes.
            </p>
            <a 
              href="#get-started" 
              className="inline-flex items-center gap-3 bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded-lg text-lg transition group"
            >
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <p className="text-zinc-500 text-sm mt-4">Free up to $25k/month • No contracts • Cancel anytime</p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-t border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">4s</p>
              <p className="text-zinc-500 text-sm mt-1">Average payout time</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">$0</p>
              <p className="text-zinc-500 text-sm mt-1">International fees</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">190+</p>
              <p className="text-zinc-500 text-sm mt-1">Countries supported</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">5</p>
              <p className="text-zinc-500 text-sm mt-1">Levels of commissions</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 border-t border-zinc-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-zinc-400 text-lg">Set up once. Payouts happen automatically forever.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-emerald-400 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Connect your wallet</h3>
                <p className="text-zinc-400">
                  Use Xaman or Crossmark. Fund it with RLUSD. Set your daily limits. You stay in control.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-zinc-800"></div>
            </div>
            
            <div className="relative">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-emerald-400 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Set commission rates</h3>
                <p className="text-zinc-400">
                  Configure up to 5 levels. Direct affiliates, their referrals, and beyond. You decide who earns what.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-zinc-800"></div>
            </div>
            
            <div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-emerald-400 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Sales trigger payouts</h3>
                <p className="text-zinc-400">
                  Order completes → YesAllofUs calculates commissions → RLUSD lands in affiliate wallets. 4 seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="py-20 border-t border-zinc-800">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">5-level MLM commissions</h2>
              <p className="text-zinc-400 mb-6">
                Reward your best affiliates for building teams. When they recruit other affiliates, everyone earns. You set the rates.
              </p>
              <p className="text-zinc-400 mb-8">
                Incentivise growth. Let your affiliates become your sales force.
              </p>
              <a 
                href="#get-started" 
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition"
              >
                Set up your commission structure
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">1</div>
                    <span className="font-medium">Direct referral</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">25%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-zinc-300">Level 2</span>
                  </div>
                  <span className="text-zinc-300 font-bold text-xl">5%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-zinc-300">Level 3</span>
                  </div>
                  <span className="text-zinc-300 font-bold text-xl">3%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center font-bold text-sm">4</div>
                    <span className="text-zinc-300">Level 4</span>
                  </div>
                  <span className="text-zinc-300 font-bold text-xl">2%</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center font-bold text-sm">5</div>
                    <span className="text-zinc-300">Level 5</span>
                  </div>
                  <span className="text-zinc-300 font-bold text-xl">1%</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm">Example rates. Fully configurable per store.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Access */}
        <section className="py-20 border-t border-zinc-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your affiliates are everywhere</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              An affiliate in Lagos gets paid the same speed as one in London. No bank transfers. No PayPal holds. No international fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Traditional affiliate payouts</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-zinc-400">Monthly or quarterly payout runs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-zinc-400">$25-50 per international wire</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-zinc-400">PayPal holds and disputes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-zinc-400">Spreadsheets and manual calculations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-zinc-400">Can't pay affiliates in some countries</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-zinc-900/50 border border-emerald-500/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">YesAllofUs</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-zinc-300">Instant — 4 seconds after sale</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-zinc-300">~$0.0002 per transaction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-zinc-300">Direct to wallet, no intermediary</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-zinc-300">Automatic calculation and distribution</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-zinc-300">190+ countries, same speed</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why RLUSD */}
        <section className="py-20 border-t border-zinc-800 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why RLUSD?</h2>
            <p className="text-zinc-400 text-lg mb-8">
              RLUSD is a stablecoin issued by Ripple. $1 = $1. No volatility. Your affiliates get exactly what they earned, not a fluctuating crypto balance.
            </p>
            <div className="inline-flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4">
              <div className="text-left">
                <p className="text-zinc-500 text-sm">You pay</p>
                <p className="text-2xl font-bold">$47.50 RLUSD</p>
              </div>
              <div className="text-zinc-600">=</div>
              <div className="text-left">
                <p className="text-zinc-500 text-sm">They receive</p>
                <p className="text-2xl font-bold text-emerald-400">$47.50 USD value</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm mt-6">
              Settled on the XRP Ledger. Public, verifiable, instant.
            </p>
          </div>
        </section>

        {/* Security */}
        <section className="py-20 border-t border-zinc-800 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Your wallet. Your keys. Your limits.</h2>
            <p className="text-zinc-400 text-lg">
              YesAllofUs never holds your funds. You grant permission to trigger payments within limits you set. Revoke anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-semibold text-lg">Xaman</span>
                <span className="text-zinc-500 text-sm">Mobile</span>
              </div>
              <p className="text-zinc-400 mb-6">Approve each payout via push notification. Maximum control.</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Manual approval for every payment</li>
                <li>✓ See exactly what's being sent</li>
                <li>✓ Best for lower volume stores</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-semibold text-lg">Crossmark</span>
                <span className="text-zinc-500 text-sm">Browser</span>
              </div>
              <p className="text-zinc-400 mb-6">Automatic payouts within limits you set. Hands-off.</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Set max per transaction</li>
                <li>✓ Set daily limit</li>
                <li>✓ Best for high volume stores</li>
              </ul>
            </div>
          </div>
          
          <p className="text-zinc-500 text-sm mt-8">
            Every transaction is public on the XRP Ledger. Anyone can verify. Nothing hidden.
          </p>
        </section>

        {/* Pricing */}
        <section className="py-20 border-t border-zinc-800 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-12">Percentage of commissions paid, not sales. Start free.</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Free</h3>
              <p className="text-zinc-500 text-sm mb-6">Up to $25k/month</p>
              <p className="text-5xl font-bold mb-2">2.9%</p>
              <p className="text-zinc-500 text-sm">per payout</p>
            </div>
            <div className="bg-zinc-900 border border-emerald-500/50 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h3 className="font-bold text-xl mb-1">Pro</h3>
              <p className="text-zinc-500 text-sm mb-6">$25k–$250k/month</p>
              <p className="text-5xl font-bold mb-2">0.9%</p>
              <p className="text-zinc-500 text-sm">+ $99/mo</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Enterprise</h3>
              <p className="text-zinc-500 text-sm mb-6">$250k+/month</p>
              <p className="text-5xl font-bold mb-2">Flat</p>
              <p className="text-zinc-500 text-sm">$499/mo</p>
            </div>
          </div>
          
          <p className="text-zinc-500 text-sm mt-8">
            That's 2.9% of the commission, not the sale. $100 order, $25 commission = $0.73 fee.
          </p>
        </section>

        {/* Get Started */}
        <section id="get-started" className="py-20 border-t border-zinc-800 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get started</h2>
            <p className="text-zinc-400 text-lg mb-10">
              Pick your path. Be live in minutes.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="/guides/wordpress" 
                className="bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-6 rounded-xl transition text-center group"
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-bold">WordPress</div>
                <div className="text-sm text-zinc-600 mt-1">Install plugin, done</div>
              </a>
              
              <a 
                href="/docs" 
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-semibold px-6 py-6 rounded-xl transition text-center group"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-bold">API / Developer</div>
                <div className="text-sm text-zinc-500 mt-1">npx yesallofus</div>
              </a>
              
              <a 
                href="https://calendly.com/tokencanvasio/30min" 
                target="_blank"
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-semibold px-6 py-6 rounded-xl transition text-center group"
              >
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-bold">Done for you</div>
                <div className="text-sm text-zinc-500 mt-1">£499 — I'll set it up</div>
              </a>
            </div>
            
            <p className="text-zinc-600 text-sm mt-10">
              Questions? <a href="mailto:mark@yesallofus.com" className="text-zinc-400 hover:text-white">mark@yesallofus.com</a>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}