'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Resources() {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    'Intro',
    'The Problem',
    'Traditional Costs',
    'YesAllofUs Solution',
    'Savings by Revenue',
    'Cash Flow',
    'How It Works',
    'Features',
    'Integration',
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
        
        {/* ==================== SECTION 0: INTRO ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">The Complete Guide to Affiliate Payouts</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              Why <span className="text-emerald-400">Instant Payouts</span><br />Change Everything
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              Scroll to discover the true cost of traditional affiliate platforms, calculate your savings, and see how YesAllofUs works.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4">
                <p className="text-zinc-500 text-sm">Document 1</p>
                <p className="font-semibold">Cost Comparison</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4">
                <p className="text-zinc-500 text-sm">Document 2</p>
                <p className="font-semibold">Savings Calculator</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4">
                <p className="text-zinc-500 text-sm">Document 3</p>
                <p className="font-semibold">Overview</p>
              </div>
            </div>

            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <p className="text-zinc-600 text-sm mt-2">Scroll to explore</p>
            </div>
          </div>
        </section>

        {/* ==================== DOCUMENT 1: COST COMPARISON ==================== */}
        
        {/* Section 1: The Problem */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-red-950/5 to-[#0a0a0a]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 mb-8">
              <span className="text-red-400 text-sm font-medium">📄 Document 1: Cost Comparison</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1]">
              <span className="text-zinc-500">You make</span>{' '}
              <span className="text-white">$1,000</span>
              <br />
              <span className="text-zinc-500">You keep</span>{' '}
              <span className="text-red-400">$152</span>
            </h2>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              For micro-vendors, traditional affiliate platforms cost more than the revenue they help generate. 
              The "Total Cost of Ownership" becomes a net loss.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-zinc-500 text-sm mb-2">Traditional Platform Costs</p>
                <p className="text-4xl font-bold text-red-400">84.8%</p>
                <p className="text-zinc-500 text-sm mt-2">of revenue eaten by fees</p>
              </div>
              <div className="text-4xl text-zinc-600">→</div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <p className="text-zinc-500 text-sm mb-2">YesAllofUs Costs</p>
                <p className="text-4xl font-bold text-emerald-400">1.09%</p>
                <p className="text-zinc-500 text-sm mt-2">of revenue</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Traditional Costs Breakdown */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-red-400">Traditional</span> Platform Costs
              </h2>
              <p className="text-zinc-400">What you're really paying for the "privilege" of growing</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Shopify */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 px-6 py-4 border-b border-zinc-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="text-xl">🛒</span> Shopify + App
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: 'Platform Fee', value: '$39/mo', sub: '$468/yr' },
                    { label: 'Affiliate App', value: '$29-49/mo', sub: '$348/yr' },
                    { label: 'Transaction Fee', value: '2.9% + $0.30', sub: '~$32/yr' },
                    { label: 'Success Fee', value: '1-10.5%', sub: 'Variable' },
                    { label: 'PayPal Payout', value: '~3.4%', sub: '~$3.40/yr' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-400 text-sm">{item.label}</span>
                      <div className="text-right">
                        <span className="text-white font-medium text-sm">{item.value}</span>
                        <span className="text-zinc-600 text-xs ml-2">({item.sub})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WooCommerce */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/10 px-6 py-4 border-b border-zinc-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="text-xl">🔌</span> WooCommerce
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: 'Hosting', value: '$20/mo', sub: '$240/yr' },
                    { label: 'Affiliate Plugin', value: '$15-25/mo', sub: '$180/yr' },
                    { label: 'Transaction Fee', value: '2.9% + $0.30', sub: '~$32/yr' },
                    { label: 'Success Fee', value: '0%', sub: '$0' },
                    { label: 'PayPal Payout', value: '~3.4%', sub: '~$3.40/yr' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-400 text-sm">{item.label}</span>
                      <div className="text-right">
                        <span className="text-white font-medium text-sm">{item.value}</span>
                        <span className="text-zinc-600 text-xs ml-2">({item.sub})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-amber-400 mb-1">The Small Merchant Reality</h4>
                  <p className="text-zinc-300 text-sm">
                    Annual revenue of <strong>$1,000</strong> with traditional costs of <strong>$700-1,200/year</strong> means 
                    the merchant pays more in fees than they earn in profit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: YesAllofUs Solution */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/10 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-emerald-400">YesAllofUs</span> vs Traditional
              </h2>
              <p className="text-zinc-400">Side-by-side comparison on a $100 sale with 10% commission</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-6 text-red-400 font-medium">Traditional</th>
                    <th className="text-center py-4 px-6 text-emerald-400 font-medium bg-emerald-500/5">YesAllofUs</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Monthly Subscription', trad: '$49-128+', yes: '$0' },
                    { feature: 'Setup Cost', trad: 'Time + Fees', yes: '$0' },
                    { feature: 'Commission Fee', trad: '0-10%', yes: '2.9%' },
                    { feature: 'Payout Speed', trad: '30-60 days', yes: '4 seconds', highlight: true },
                    { feature: 'Payout Fee', trad: '$0.25-1.00', yes: '$0.0002' },
                    { feature: 'Accounting', trad: 'Manual CSV', yes: 'Real-time Ledger' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                      <td className="py-3 px-6 text-zinc-300 text-sm">{row.feature}</td>
                      <td className="py-3 px-6 text-center text-red-400 text-sm">{row.trad}</td>
                      <td className={`py-3 px-6 text-center bg-emerald-500/5 ${row.highlight ? 'text-emerald-400 font-bold' : 'text-emerald-400'} text-sm`}>{row.yes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ==================== DOCUMENT 2: SAVINGS CALCULATOR ==================== */}

        {/* Section 4: Savings by Revenue */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6">
                <span className="text-emerald-400 text-sm font-medium">📄 Document 2: Savings Calculator</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your <span className="text-emerald-400">Savings</span> by Revenue
              </h2>
              <p className="text-zinc-400">See how much you keep with YesAllofUs</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Annual Revenue</th>
                    <th className="text-center py-4 px-6 text-red-400 font-medium">Traditional</th>
                    <th className="text-center py-4 px-6 text-emerald-400 font-medium">YesAllofUs</th>
                    <th className="text-center py-4 px-6 text-emerald-400 font-medium">You Save</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rev: '$1,000', trad: '$848', yes: '$10.90', save: '$837' },
                    { rev: '$5,000', trad: '$896', yes: '$22.50', save: '$873' },
                    { rev: '$10,000', trad: '$944', yes: '$37', save: '$907' },
                    { rev: '$25,000', trad: '$1,088', yes: '$80', save: '$1,008' },
                    { rev: '$50,000', trad: '$1,328', yes: '$152', save: '$1,176' },
                    { rev: '$100,000', trad: '$1,808', yes: '$295', save: '$1,513' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                      <td className="py-3 px-6 text-white font-semibold">{row.rev}</td>
                      <td className="py-3 px-6 text-center">
                        <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-sm">{row.trad}</span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-sm">{row.yes}</span>
                      </td>
                      <td className="py-3 px-6 text-center text-emerald-400 font-bold">{row.save}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Big Number */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <p className="text-zinc-400 mb-2">For a $1,000/year merchant</p>
              <p className="text-5xl md:text-6xl font-bold text-emerald-400 mb-2">$837</p>
              <p className="text-zinc-400">saved annually</p>
            </div>
          </div>
        </section>

        {/* Section 5: Cash Flow */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-zinc-900/50 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The <span className="text-emerald-400">Cash Flow</span> Advantage
              </h2>
              <p className="text-zinc-400">Beyond cost savings — instant payouts change everything</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional Timeline */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 text-red-400">Traditional Timeline</h3>
                <div className="space-y-4">
                  {[
                    { day: 'Day 1', event: 'Sale made' },
                    { day: 'Day 30', event: 'Refund period ends' },
                    { day: 'Day 45', event: 'Payout processed' },
                    { day: 'Day 48', event: 'Affiliate receives $' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-500">{item.day}</span>
                      <span className="text-zinc-300">{item.event}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-red-500/20">
                    <span className="text-red-400 font-bold">Total wait: 48+ days</span>
                  </div>
                </div>
              </div>

              {/* YesAllofUs Timeline */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 text-emerald-400">YesAllofUs Timeline</h3>
                <div className="space-y-4">
                  {[
                    { day: 'Second 0', event: 'Sale made' },
                    { day: 'Second 4', event: 'Affiliate receives RLUSD', highlight: true },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-500">{item.day}</span>
                      <span className={item.highlight ? 'text-emerald-400 font-medium' : 'text-zinc-300'}>{item.event}</span>
                    </div>
                  ))}
                  <div className="h-16" />
                  <div className="h-8" />
                  <div className="pt-4 border-t border-emerald-500/20">
                    <span className="text-emerald-400 font-bold">Total wait: 4 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DOCUMENT 3: ONE-PAGER ==================== */}

        {/* Section 6: How It Works */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
                <span className="text-purple-400 text-sm font-medium">📄 Document 3: Overview</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How <span className="text-emerald-400">YesAllofUs</span> Works
              </h2>
              <p className="text-zinc-400">4 simple steps to instant affiliate payouts</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { num: '1', title: 'Customer Clicks', desc: 'Affiliate link tracked' },
                { num: '2', title: 'Purchase Made', desc: 'Order completes in your store' },
                { num: '3', title: 'Instant Payout', desc: 'RLUSD sent in 4 seconds' },
                { num: '4', title: 'On-Chain Record', desc: 'Immutable, transparent' },
              ].map((step, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 font-bold">
                    {step.num}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-zinc-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Features */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-purple-950/5 to-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for <span className="text-emerald-400">Modern</span> Commerce
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* For Merchants */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 text-emerald-400">For Merchants</h3>
                <ul className="space-y-4">
                  {[
                    '$0 monthly subscription',
                    'Only pay when you earn',
                    '5-level MLM structure',
                    'Full control over rates',
                    'Real-time ledger exports',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Affiliates */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 text-emerald-400">For Affiliates</h3>
                <ul className="space-y-4">
                  {[
                    'Get paid in 4 seconds',
                    'RLUSD (stable value)',
                    'No payout minimums',
                    'Earn from your network',
                    'Transparent on-chain',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vendor Referral */}
            <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
              <h3 className="font-bold text-lg mb-3">Vendor-to-Vendor Referrals</h3>
              <p className="text-zinc-400 text-sm">
                Vendors earn <span className="text-emerald-400 font-semibold">lifetime commissions</span> when they refer other vendors. 
                Every sale the referred vendor makes, you earn. Forever.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Integration */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Easy <span className="text-emerald-400">Integration</span>
              </h2>
              <p className="text-zinc-400">2 minutes to set up. Then it runs itself.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'WooCommerce', sub: 'Plugin install', time: '2 minutes' },
                { title: 'CLI Tool', sub: 'npx yesallofus', time: '2 minutes' },
                { title: 'REST API', sub: 'Any platform', time: 'Full docs' },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm mb-3">{item.sub}</p>
                  <span className="text-emerald-400 text-sm">{item.time}</span>
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="mt-12 text-center">
              <h3 className="font-semibold mb-6 text-zinc-400">Trust & Compliance</h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {[
                  'Working with GFSC (Guernsey)',
                  'XRPL Commons Residency',
                  'All transactions on-chain',
                  'Non-custodial',
                ].map((item, i) => (
                  <span key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 text-zinc-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: CTA */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/10 to-[#0a0a0a]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop paying for the privilege of growing.
            </h2>
            <p className="text-xl text-zinc-400 mb-12">
              Get started in 2 minutes. No credit card. No subscription.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="/dashboard"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Start Free →
              </a>
              <a 
                href="https://calendly.com/tokencanvasio/30min"
                target="_blank"
                className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-xl transition text-lg"
              >
                Book a Call
              </a>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 inline-block mb-12">
              <p className="text-zinc-500 text-sm mb-1">Or use the CLI</p>
              <code className="text-emerald-400 font-mono">npx yesallofus</code>
            </div>

            {/* Download PDFs */}
            <div className="border-t border-zinc-800 pt-12">
              <p className="text-zinc-500 text-sm mb-6">Download these resources as PDFs</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/pdfs/YesAllofUs-Cost-Comparison.pdf" download className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition">
                  📄 Cost Comparison
                </a>
                <a href="/pdfs/YesAllofUs-Savings-Calculator.pdf" download className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition">
                  📄 Savings Calculator
                </a>
                <a href="/pdfs/YesAllofUs-One-Pager.pdf" download className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition">
                  📄 One-Pager
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}