'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide on dashboard pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/affiliate-dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur border-b border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-bold text-xl hidden sm:inline text-white">YesAllofUs</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/docs" className="text-zinc-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-zinc-800/50">
            Docs
          </Link>
          <button
  onClick={() => {
    if (pathname === '/' || pathname === '/home') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/home#pricing';
    }
  }}
  className="text-zinc-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
>
  Pricing
</button>
          <Link href="/affiliate-dashboard" className="text-zinc-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-zinc-800/50">
  Affiliates
</Link>
          
          {/* Resources Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
            >
              Resources
              <svg 
                className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {resourcesOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#141414] border border-zinc-800 rounded-xl shadow-xl shadow-black/20 overflow-hidden">
                {/* Interactive Page */}
                <Link 
                  href="/resources"
                  onClick={() => setResourcesOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition border-b border-zinc-800/50"
                >
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Interactive Guide</p>
                    <p className="text-zinc-500 text-xs">Explore costs & savings</p>
                  </div>
                </Link>

                {/* PDF Downloads */}
                <div className="px-4 py-2">
                  <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">Download PDFs</p>
                </div>
                
                <a 
                  href="/pdfs/YesAllofUs-Cost-Comparison.pdf"
                  download
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition"
                >
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                    <span className="text-xs">📊</span>
                  </div>
                  <span className="text-zinc-300 text-sm">Cost Comparison</span>
                  <svg className="w-4 h-4 text-zinc-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                
                <a 
                  href="/pdfs/YesAllofUs-Savings-Calculator.pdf"
                  download
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition"
                >
                  <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center">
                    <span className="text-xs">🧮</span>
                  </div>
                  <span className="text-zinc-300 text-sm">Savings Calculator</span>
                  <svg className="w-4 h-4 text-zinc-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                
                <a 
                  href="/pdfs/YesAllofUs-One-Pager.pdf"
                  download
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition"
                >
                  <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                    <span className="text-xs">📋</span>
                  </div>
                  <span className="text-zinc-300 text-sm">One-Pager</span>
                  <svg className="w-4 h-4 text-zinc-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-lg text-sm transition ml-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Store Login
          </Link>
        </nav>

        {/* Mobile hamburger button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-zinc-800">
          <nav className="flex flex-col px-6 py-4 space-y-1">
            <Link 
              href="/docs" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition py-3 border-b border-zinc-800/50"
            >
              Docs
            </Link>
            <Link 
              href="/#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition py-3 border-b border-zinc-800/50"
            >
              Pricing
            </Link>
            <Link 
              href="/discover-vendors" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition py-3 border-b border-zinc-800/50"
            >
              Affiliates
            </Link>
            
            {/* Mobile Resources Section */}
            <div className="py-3 border-b border-zinc-800/50">
              <p className="text-zinc-600 text-xs uppercase tracking-wider mb-3">Resources</p>
              <div className="space-y-2">
                <Link 
                  href="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-zinc-300 hover:text-white text-sm transition py-2"
                >
                  <span>📄</span>
                  Interactive Guide
                </Link>
                <a 
                  href="/pdfs/YesAllofUs-Cost-Comparison.pdf"
                  download
                  className="flex items-center gap-3 text-zinc-400 hover:text-white text-sm transition py-2"
                >
                  <span>📊</span>
                  Cost Comparison PDF
                </a>
                <a 
                  href="/pdfs/YesAllofUs-Savings-Calculator.pdf"
                  download
                  className="flex items-center gap-3 text-zinc-400 hover:text-white text-sm transition py-2"
                >
                  <span>🧮</span>
                  Savings Calculator PDF
                </a>
                <a 
                  href="/pdfs/YesAllofUs-One-Pager.pdf"
                  download
                  className="flex items-center gap-3 text-zinc-400 hover:text-white text-sm transition py-2"
                >
                  <span>📋</span>
                  One-Pager PDF
                </a>
              </div>
            </div>

            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-3 rounded-lg text-sm transition mt-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Store Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}