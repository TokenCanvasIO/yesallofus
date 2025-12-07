'use client';
import { useState } from 'react';
import Link from "next/link";
import Logo from "./Logo";

interface HeaderProps {
  variant?: 'marketing' | 'dashboard';
  storeName?: string;
  walletAddress?: string;
  onSignOut?: () => void;
}

export default function Header({ variant = 'marketing', storeName, walletAddress, onSignOut }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Abbreviate wallet: rPZcr...VMaB
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  // Dashboard header
  if (variant === 'dashboard') {
    return (
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo + Store Name - hidden on dashboard since sidebar shows this */}
<div className="hidden">
  <Logo size={32} />
  <div className="hidden sm:block">
    <div className="font-semibold text-white text-sm leading-tight">{storeName || 'Dashboard'}</div>
    {shortWallet && (
      <div className="text-zinc-500 text-xs font-mono">{shortWallet}</div>
    )}
  </div>
</div>

          {/* Right: Wallet badge + Sign out */}
          <div className="flex items-center gap-3">
            {/* Mobile: Show wallet only */}
            <div className="sm:hidden flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-zinc-300 text-xs font-mono">{shortWallet}</span>
            </div>

            {/* Desktop: Full wallet badge */}
            <div className="hidden sm:flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-zinc-400 text-xs">Connected</span>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-zinc-500 hover:text-white text-sm transition px-3 py-1.5 hover:bg-zinc-800 rounded-lg"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Marketing header (original)
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