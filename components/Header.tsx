'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/docs" className="text-zinc-400 hover:text-white text-sm transition">Docs</Link>
          <Link href="/#pricing" className="text-zinc-400 hover:text-white text-sm transition">Pricing</Link>
          <Link href="/affiliate-dashboard" className="text-zinc-400 hover:text-white text-sm transition">Affiliates</Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
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
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link 
              href="/docs" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition"
            >
              Docs
            </Link>
            <Link 
              href="/#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition"
            >
              Pricing
            </Link>
            <Link 
              href="/affiliate-dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-sm transition"
            >
              Affiliates
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-3 rounded-lg text-sm transition"
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