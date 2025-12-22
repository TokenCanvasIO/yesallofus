'use client';

import { useEffect, useRef, useState } from 'react';

export default function DiscoverVendors() {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    'Intro',
    'How It Works',
    'Find Vendors',
    'Instant Payouts',
    'On-Chain Reputation',
    'Global Access',
    'Earning Potential',
    'Multi-Level',
    'Get Started'
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sectionElements = container.querySelectorAll('.scroll-section');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(sectionElements).indexOf(entry.target as Element);
            setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionElements.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2">
        {sections.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              const sectionElements = document.querySelectorAll('.scroll-section');
              sectionElements[i]?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`group flex items-center gap-3 transition-all ${
              activeSection === i ? 'opacity-100' : 'opacity-30 hover:opacity-60'
            }`}
          >
            <span className={`text-[10px] font-medium transition-all whitespace-nowrap ${
              activeSection === i ? 'text-emerald-400 translate-x-0 opacity-100' : 'text-zinc-500 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
            }`}>
              {label}
            </span>
            <div className={`w-2 h-2 rounded-full transition-all ${
              activeSection === i ? 'bg-emerald-400 scale-125' : 'bg-zinc-700'
            }`} />
          </button>
        ))}
      </div>

      <div ref={containerRef}>
        
        {/* ==================== SECTION 0: HERO ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">For Affiliates</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              Discover Vendors.<br />
              <span className="text-emerald-400">Earn Passive Income Instantly.</span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              Find products you believe in. Share your link. Get paid in 4 seconds — not 30 days. 
              No minimums. No bank account needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="/affiliate-dashboard"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Start Earning →
              </a>
              <a 
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelectorAll('.scroll-section')[1]?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-xl transition text-lg"
              >
                How It Works
              </a>
            </div>

            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <p className="text-zinc-600 text-sm mt-2">Scroll to explore</p>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 1: HOW IT WORKS ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/5 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Four Steps to <span className="text-emerald-400">Passive Income</span>
              </h2>
              <p className="text-zinc-400 text-lg">No experience needed. We handle wallet setup for you.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { 
                  num: '1', 
                  icon: '👤',
                  title: 'Sign Up', 
                  desc: 'Connect with Google, Apple, or any social account. We create your wallet automatically.' 
                },
                { 
                  num: '2', 
                  icon: '🔍',
                  title: 'Browse Vendors', 
                  desc: 'Explore the vendor directory in your dashboard. Find products that match your audience.' 
                },
                { 
                  num: '3', 
                  icon: '🔗',
                  title: 'Share Your Link', 
                  desc: 'Get your unique referral link. Share on social, email, or anywhere your audience lives.' 
                },
                { 
                  num: '4', 
                  icon: '💰',
                  title: 'Get Paid Instantly', 
                  desc: 'When someone buys, you get paid in 4 seconds. RLUSD lands in your wallet automatically.' 
                },
              ].map((step, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center relative">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-sm">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-zinc-500 text-sm">{step.desc}</p>
                  
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-zinc-700 text-2xl">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: FIND VENDORS ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Find Vendors in Your <span className="text-emerald-400">Dashboard</span>
              </h2>
              <p className="text-zinc-400 text-lg">Browse, filter, and connect with vendors looking for affiliates</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Instructions */}
              <div className="space-y-6">
                {[
                  { 
                    step: '1',
                    title: 'Go to Affiliate Dashboard', 
                    desc: 'Sign in and click "Discover Vendors" in the sidebar navigation.' 
                  },
                  { 
                    step: '2',
                    title: 'Browse the Directory', 
                    desc: 'See all vendors with their commission rates, products, and payout history.' 
                  },
                  { 
                    step: '3',
                    title: 'Click to Join', 
                    desc: 'Found a vendor you like? One click to get your referral link. No approval wait.' 
                  },
                  { 
                    step: '4',
                    title: 'Start Promoting', 
                    desc: 'Copy your link and share. Track clicks and earnings in real-time.' 
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Mock Dashboard Preview */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="text-zinc-600 text-xs ml-2">Affiliate Dashboard</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'TechGadgets Pro', rate: '15%', products: '24 products' },
                    { name: 'Fitness First', rate: '20%', products: '12 products' },
                    { name: 'Digital Courses', rate: '30%', products: '8 products' },
                  ].map((vendor, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold">
                          {vendor.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{vendor.name}</p>
                          <p className="text-zinc-500 text-xs">{vendor.products}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold">{vendor.rate}</p>
                        <p className="text-zinc-600 text-xs">commission</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                  <p className="text-zinc-600 text-xs">Click any vendor to get your link instantly</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: INSTANT PAYOUTS ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/10 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="text-emerald-400">4 Seconds</span> vs 30 Days
              </h2>
              <p className="text-zinc-400 text-lg">The moment someone buys, you get paid. Not next month. Now.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🐌</span>
                  <h3 className="font-bold text-xl text-red-400">Traditional Affiliates</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { time: 'Day 1', event: 'You make a sale' },
                    { time: 'Day 7', event: 'Still waiting...' },
                    { time: 'Day 30', event: 'Refund period ends' },
                    { time: 'Day 45', event: 'Payment "processed"' },
                    { time: 'Day 48', event: 'Maybe you get paid' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-red-500/10 pb-2 last:border-0">
                      <span className="text-zinc-500">{item.time}</span>
                      <span className="text-zinc-400">{item.event}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-red-500/20">
                  <p className="text-red-400 font-semibold">+ $25 minimum threshold</p>
                  <p className="text-red-400 font-semibold">+ PayPal fees eat your earnings</p>
                </div>
              </div>

              {/* YesAllofUs */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-bold text-xl text-emerald-400">YesAllofUs</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { time: 'Second 0', event: 'Customer clicks buy' },
                    { time: 'Second 2', event: 'Payment confirmed' },
                    { time: 'Second 4', event: 'RLUSD in your wallet', highlight: true },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-emerald-500/10 pb-2 last:border-0">
                      <span className="text-zinc-500">{item.time}</span>
                      <span className={item.highlight ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>{item.event}</span>
                    </div>
                  ))}
                  <div className="h-12" />
                  <div className="h-8" />
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold">✓ No minimum threshold</p>
                  <p className="text-emerald-400 font-semibold">✓ $0.0002 transaction fee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 4: ON-CHAIN REPUTATION ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-8">
              <span className="text-purple-400 text-sm font-medium">🔮 Coming Soon</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Vendor Reputation<br />
              <span className="text-emerald-400">Proven by Math</span>
            </h2>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              No more fake reviews. No more paid placements. Trust vendors based on their actual on-chain behavior.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { 
                  icon: '⏱️',
                  title: 'Payout Speed', 
                  desc: 'Average time from sale to affiliate payout. Verified on XRPL.',
                  metric: '~4 seconds'
                },
                { 
                  icon: '📊',
                  title: 'Consistency', 
                  desc: 'How reliable are their payouts? Calculated from transaction history.',
                  metric: '99.8%'
                },
                { 
                  icon: '💎',
                  title: 'Volume', 
                  desc: 'Total commissions paid to affiliates. Immutable, public record.',
                  metric: '$50,000+'
                },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{item.desc}</p>
                  <p className="text-emerald-400 font-bold">{item.metric}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="flex items-start gap-4 text-left">
                <span className="text-3xl">🛡️</span>
                <div>
                  <h4 className="font-bold mb-2">Why This Matters</h4>
                  <p className="text-zinc-400 text-sm">
                    Traditional affiliate networks let vendors buy rankings and fake reviews. 
                    With YesAllofUs, every payout is recorded on the XRP Ledger. Reputation is calculated from 
                    <strong className="text-white"> real transactions</strong>, not marketing budgets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 5: GLOBAL ACCESS ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-blue-950/5 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Earn From <span className="text-emerald-400">Anywhere</span>
              </h2>
              <p className="text-zinc-400 text-lg">No bank account. No borders. Just a wallet and a phone.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: World Map Concept */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 text-center">Same Speed. Everywhere.</h3>
                <div className="space-y-4">
                  {[
                    { city: 'London', flag: '🇬🇧' },
                    { city: 'Lagos', flag: '🇳🇬' },
                    { city: 'Manila', flag: '🇵🇭' },
                    { city: 'São Paulo', flag: '🇧🇷' },
                    { city: 'Mumbai', flag: '🇮🇳' },
                  ].map((loc, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{loc.flag}</span>
                        <span className="text-zinc-300">{loc.city}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">4 seconds</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800 mt-6 pt-6 text-center">
                  <p className="text-zinc-500 text-sm">Paid in RLUSD. $1 = $1. No volatility.</p>
                </div>
              </div>

              {/* Right: Benefits */}
              <div className="space-y-6">
                {[
                  { 
                    icon: '🏦',
                    title: 'No Bank Account Needed', 
                    desc: 'Traditional affiliates need PayPal or bank transfers. You just need a wallet — we create one for you.' 
                  },
                  { 
                    icon: '💵',
                    title: 'RLUSD Stablecoin', 
                    desc: 'Get paid in dollars that stay dollars. No crypto volatility. Cash out anytime.' 
                  },
                  { 
                    icon: '🌍',
                    title: 'Zero International Fees', 
                    desc: 'Traditional cross-border payments cost $25-50. XRPL costs $0.0002. Same speed worldwide.' 
                  },
                  { 
                    icon: '📱',
                    title: 'Mobile First', 
                    desc: 'Manage everything from your phone. Track earnings, find vendors, withdraw funds.' 
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 6: EARNING POTENTIAL ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your <span className="text-emerald-400">Earning</span> Potential
            </h2>
            <p className="text-zinc-400 text-lg mb-12">Real examples based on typical commission rates</p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { 
                  level: 'Starter',
                  sales: '5 sales/week',
                  avg: '$50 avg order',
                  rate: '15% commission',
                  monthly: '$150/mo',
                  color: 'zinc'
                },
                { 
                  level: 'Growing',
                  sales: '20 sales/week',
                  avg: '$75 avg order',
                  rate: '20% commission',
                  monthly: '$1,200/mo',
                  color: 'emerald'
                },
                { 
                  level: 'Pro',
                  sales: '50 sales/week',
                  avg: '$100 avg order',
                  rate: '25% commission',
                  monthly: '$5,000/mo',
                  color: 'purple'
                },
              ].map((tier, i) => (
                <div key={i} className={`bg-${tier.color === 'emerald' ? 'emerald-500/10 border-emerald-500/30' : 'zinc-900/50 border-zinc-800'} border rounded-2xl p-6`}>
                  <h3 className={`font-bold text-lg mb-4 ${tier.color === 'emerald' ? 'text-emerald-400' : tier.color === 'purple' ? 'text-purple-400' : 'text-zinc-300'}`}>
                    {tier.level}
                  </h3>
                  <div className="space-y-2 text-sm text-zinc-400 mb-4">
                    <p>{tier.sales}</p>
                    <p>{tier.avg}</p>
                    <p>{tier.rate}</p>
                  </div>
                  <p className={`text-2xl font-bold ${tier.color === 'emerald' ? 'text-emerald-400' : tier.color === 'purple' ? 'text-purple-400' : 'text-white'}`}>
                    {tier.monthly}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-zinc-500 text-sm">
              These are examples only. Your earnings depend on your audience, niche, and the vendors you promote.
            </p>
          </div>
        </section>

        {/* ==================== SECTION 7: MULTI-LEVEL ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-purple-950/5 to-[#0a0a0a]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-emerald-400">5 Levels</span> Deep
            </h2>
            <p className="text-zinc-400 text-lg mb-12">Refer other affiliates. Earn when they earn. Passive income.</p>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-md mx-auto mb-12">
              <div className="space-y-4">
                {[
                  { level: 'Level 1 (direct)', rate: '25%', desc: 'Your referrals' },
                  { level: 'Level 2', rate: '5%', desc: 'Their referrals' },
                  { level: 'Level 3', rate: '3%', desc: 'And so on...' },
                  { level: 'Level 4', rate: '2%', desc: '' },
                  { level: 'Level 5', rate: '1%', desc: '' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                    <div className="text-left">
                      <span className="text-zinc-300 font-medium">{item.level}</span>
                      {item.desc && <span className="text-zinc-600 text-sm ml-2">({item.desc})</span>}
                    </div>
                    <span className="text-emerald-400 font-bold">{item.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 max-w-lg mx-auto">
              <p className="text-zinc-300 text-sm">
                <strong className="text-emerald-400">Example:</strong> You refer Alice. Alice refers Bob. 
                When Bob makes a sale, both Alice <em>and</em> you get paid. Instantly. On-chain.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 8: CTA ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to earn<br /><span className="text-emerald-400">on your terms?</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-12">
              No minimums. No waiting. No bank account needed.<br />
              Just find vendors, share links, get paid.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a 
                href="/affiliate-dashboard"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Go to Affiliate Dashboard →
              </a>
              <a 
                href="/wallet-guide"
                className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-xl transition text-lg"
              >
                Wallet Guide
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { icon: '⚡', text: '4 second payouts' },
                { icon: '🔐', text: 'Non-custodial' },
                { icon: '🌍', text: 'Works worldwide' },
                { icon: '💵', text: 'RLUSD stablecoin' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-500">
                  <span>{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-800">
              <p className="text-zinc-600 text-sm mb-4">Are you a vendor looking to grow?</p>
              <a href="/" className="text-emerald-400 hover:text-emerald-300 transition">
                Learn how to list your products →
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}