'use client';

import { useEffect, useRef, useState } from 'react';

export default function Press() {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    'Overview',
    'The Story',
    'Timeline',
    'Key Facts',
    'Media Kit',
    'Contact'
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
        
        {/* ==================== SECTION 0: OVERVIEW ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 pt-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full px-4 py-1.5 mb-8">
              <span className="text-zinc-400 text-sm font-medium">📰 Press & Media</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
              YesAllofUs
            </h1>
            
            <p className="text-2xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Instant affiliate commission payouts on the XRP Ledger.
            </p>

            <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-12">
              A non-custodial payments solution that pays affiliates in 4 seconds, not 30 days. 
              Built in Guernsey. Powered by RLUSD.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">4 sec</p>
                <p className="text-zinc-500 text-sm">Payout speed</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-white">$0</p>
                <p className="text-zinc-500 text-sm">Monthly fee</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-zinc-500 text-sm">Pilot vendors</p>
              </div>
            </div>

            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 1: THE STORY ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/5 to-[#0a0a0a]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                The <span className="text-emerald-400">Story</span>
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
              <img 
                src="/mark.jpg" 
                alt="Mark Flynn" 
                className="w-32 h-32 rounded-full object-cover border-2 border-zinc-800"
              />
              <div>
                <h3 className="text-xl font-bold mb-2">Mark Flynn</h3>
                <p className="text-emerald-400 mb-4">Founder · Family Therapist → Developer</p>
                <p className="text-zinc-400">
                  Based in Guernsey, Channel Islands
                </p>
              </div>
            </div>

            <div className="space-y-6 text-zinc-300">
              <p className="text-lg">
                Mark spent years as a family therapist working with children in care. 
                That work taught him one thing: <strong className="text-white">connection matters</strong>. 
                People thrive when they're part of something, when they're not left behind.
              </p>
              
              <p className="text-lg">
                In June 2025, with no coding experience, he started building. Six months later, 
                he'd shipped three production platforms on the XRP Ledger — including one ranking 
                #7 on Google for its keyword.
              </p>

              <p className="text-lg">
                YesAllofUs is the next step: <strong className="text-white">real infrastructure for real businesses</strong>. 
                A system where the affiliate in Lagos gets paid the same speed as the one in London. 
                No bank account required. No 30-day wait. No minimum threshold.
              </p>

              <blockquote className="border-l-4 border-emerald-500 pl-6 py-2 my-8">
                <p className="text-xl italic text-zinc-300">
                  "YesAllofUs means everyone gets their share. All of us."
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: TIMELINE ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="text-emerald-400">Timeline</span>
              </h2>
            </div>

            <div className="space-y-0">
              {[
                { 
                  date: 'June 2025', 
                  title: 'Started coding', 
                  desc: 'No prior programming experience. AI as engineering partner.',
                  highlight: false
                },
                { 
                  date: 'June – Nov 2025', 
                  title: 'Built 3 production platforms', 
                  desc: 'TokenCanvas.io, XRP3D.ai, XRPMemeCoins.com — all on XRPL.',
                  highlight: false
                },
                { 
                  date: 'Nov 29, 2025', 
                  title: 'YesAllofUs goes live', 
                  desc: 'Instant affiliate payouts on the XRP Ledger.',
                  highlight: true
                },
                { 
                  date: 'Dec 1, 2025', 
                  title: 'XRPL Commons takes notice', 
                  desc: 'Within 36 hours of launch, approached by XRPL Commons.',
                  highlight: true
                },
                { 
                  date: 'Dec 10, 2025', 
                  title: 'Paris meeting', 
                  desc: 'Flew to Paris for XRPL Commons discussions.',
                  highlight: false
                },
                { 
                  date: 'Dec 11, 2025', 
                  title: 'Guernsey meetings', 
                  desc: 'Met with business leaders and financial regulators.',
                  highlight: false
                },
                { 
                  date: 'Q1 2026', 
                  title: 'Incorporation', 
                  desc: 'YesAllofUs Ltd to be registered in Guernsey.',
                  highlight: false
                },
                { 
                  date: 'April 2026', 
                  title: 'XRPL Commons Residency', 
                  desc: 'Target start date for the residency program.',
                  highlight: true
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.highlight ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                    {i < 7 && <div className="w-0.5 h-full bg-zinc-800 min-h-[80px]" />}
                  </div>
                  
                  {/* Content */}
                  <div className="pb-8">
                    <p className={`text-sm font-medium mb-1 ${item.highlight ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {item.date}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-zinc-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Regulatory note */}
            <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm">
                In December 2025, YesAllofUs was presented to Guernsey financial regulators as a potential 
                growth solution for an emerging institutional initiative. Further details will be announced in 2026.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: KEY FACTS ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-zinc-900/50 to-[#0a0a0a]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Key <span className="text-emerald-400">Facts</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Founded', value: 'November 2025' },
                { label: 'Headquarters', value: 'Guernsey, Channel Islands' },
                { label: 'Founder', value: 'Mark Flynn' },
                { label: 'Status', value: 'Live with pilot vendors' },
                { label: 'Technology', value: 'XRP Ledger (XRPL)' },
                { label: 'Currency', value: 'RLUSD (Ripple stablecoin)' },
                { label: 'Payout Speed', value: '3-5 seconds' },
                { label: 'Custody', value: 'Non-custodial' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-zinc-800">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* What it does */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {[
                { 
                  icon: '⚡', 
                  title: 'Instant Payouts', 
                  desc: 'Affiliates paid in 4 seconds, not 30-90 days' 
                },
                { 
                  icon: '🔐', 
                  title: 'Non-Custodial', 
                  desc: 'Merchants control their own wallets and funds' 
                },
                { 
                  icon: '🌍', 
                  title: 'Global Access', 
                  desc: 'No bank account required. Works anywhere.' 
                },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Current status */}
            <div className="mt-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-emerald-400 mb-2">Current Status</h3>
              <p className="text-zinc-300 text-sm">
                YesAllofUs is live with 3 pilot vendors using the Xaman push notification commission solution. 
                The system is fully compliant and operational, processing instant affiliate payouts on the XRP Ledger.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 4: MEDIA KIT ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Media <span className="text-emerald-400">Kit</span>
              </h2>
              <p className="text-zinc-400">Download assets for press coverage</p>
            </div>

            {/* Logo Downloads */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">Logos</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* SVG */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="h-24 flex items-center justify-center mb-4 bg-zinc-800 rounded-lg">
                    <img src="/favicon.svg" alt="YesAllofUs Logo" className="h-12" />
                  </div>
                  <p className="font-medium mb-1">Logo (SVG)</p>
                  <p className="text-zinc-500 text-sm mb-4">Vector, scalable</p>
                  <a 
                    href="/press/logo.svg" 
                    download
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition w-full"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>

                {/* PNG Dark */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="h-24 flex items-center justify-center mb-4 bg-white rounded-lg">
                    <img src="/favicon.svg" alt="YesAllofUs Logo" className="h-12" />
                  </div>
                  <p className="font-medium mb-1">Logo (PNG)</p>
                  <p className="text-zinc-500 text-sm mb-4">For light backgrounds</p>
                  <a 
                    href="/press/logo-dark.png" 
                    download
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition w-full"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>

                {/* PNG Light */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="h-24 flex items-center justify-center mb-4 bg-zinc-800 rounded-lg">
                    <img src="/favicon.svg" alt="YesAllofUs Logo" className="h-12" />
                  </div>
                  <p className="font-medium mb-1">Logo (PNG)</p>
                  <p className="text-zinc-500 text-sm mb-4">For dark backgrounds</p>
                  <a 
                    href="/press/logo-light.png" 
                    download
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition w-full"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Emerald', hex: '#10B981', class: 'bg-emerald-500' },
                  { name: 'Dark', hex: '#0A0A0A', class: 'bg-[#0a0a0a] border border-zinc-700' },
                  { name: 'Zinc 900', hex: '#18181B', class: 'bg-zinc-900' },
                  { name: 'White', hex: '#FFFFFF', class: 'bg-white' },
                ].map((color, i) => (
                  <div key={i} className="text-center">
                    <div className={`h-16 rounded-lg mb-2 ${color.class}`} />
                    <p className="font-medium text-sm">{color.name}</p>
                    <p className="text-zinc-500 text-xs">{color.hex}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Boilerplate */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Boilerplate</h3>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  <strong className="text-white">YesAllofUs</strong> is an instant affiliate commission platform built on the XRP Ledger. Founded in 2025 by Mark Flynn in Guernsey, Channel Islands, the platform enables merchants to pay affiliates in seconds rather than the traditional 30-90 day wait. Using RLUSD stablecoin and non-custodial wallet technology, YesAllofUs provides global access to affiliate earnings without requiring a bank account. The platform is currently live with pilot vendors and working towards XRPL Commons residency in 2025, and cementing its place as providing key software infrastructure for a critically important - newly forming - institution in the Channel Islands.
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("YesAllofUs is an instant affiliate commission platform built on the XRP Ledger. Founded in 2025 by Mark Flynn in Guernsey, Channel Islands, the platform enables merchants to pay affiliates in seconds rather than the traditional 30-90 day wait. Using RLUSD stablecoin and non-custodial wallet technology, YesAllofUs provides global access to affiliate earnings without requiring a bank account. The platform is currently live with pilot vendors and working towards XRPL Commons residency in 2025.");
                  }}
                  className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to clipboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 5: CONTACT ==================== */}
        <section className="scroll-section min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0a0a] via-emerald-950/5 to-[#0a0a0a]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Press <span className="text-emerald-400">Contact</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-12">
              For press inquiries, interviews, or additional information
            </p>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
              <div className="flex flex-col items-center gap-4">
                <img 
                  src="/mark.jpg" 
                  alt="Mark Flynn" 
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">Mark Flynn</h3>
                  <p className="text-zinc-400">Founder, YesAllofUs</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:mark@yesallofus.com" 
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                mark@yesallofus.com
              </a>
              <a 
                href="https://x.com/YesAllofUs" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 px-6 py-3 rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @YesAllofUs
              </a>
            </div>

            <p className="text-zinc-600 text-sm mt-12">
              Response time: Usually within 24 hours
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}