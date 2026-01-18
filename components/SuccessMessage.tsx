'use client';

import { useEffect, useState } from 'react';

interface SuccessMessageProps {
  walletAddress?: string;
  loginMethod?: 'xaman' | 'crossmark' | 'web3auth' | null;
}

export default function SuccessMessage({ walletAddress, loginMethod }: SuccessMessageProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

 // Auto-hide after 5 seconds
useEffect(() => {
  const timer = setTimeout(() => setDismissed(true), 5000);
  return () => clearTimeout(timer);
}, []);

  if (dismissed) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl mb-6 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.4)' }}
      >
        <source src="/successmessage.webm" type="video/webm" />
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 p-8 flex flex-col items-center justify-center min-h-[280px]">
        {/* Animated Checkmark - Click to dismiss */}
        <button 
          onClick={() => setDismissed(true)}
          className="mb-6 hover:scale-110 transition-transform cursor-pointer"
          title="Click to dismiss"
        >
          <svg className="w-20 h-20" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#successGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-[draw-circle_0.6s_ease-out_forwards]"
              style={{
                strokeDasharray: 283,
                strokeDashoffset: 283,
                animation: 'draw-circle 0.6s ease-out forwards'
              }}
            />
            {/* Checkmark */}
            <path
              d="M30 52 L45 67 L72 35"
              fill="none"
              stroke="url(#successGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: 80,
                animation: 'draw-check 0.4s ease-out 0.5s forwards'
              }}
            />
          </svg>
        </button>

        {/* Success Text */}
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Setup Complete!</h2>
        <p className="text-zinc-300 text-center mb-4">Your wallet is ready to receive payments</p>

        {/* Wallet Badge */}
        {walletAddress && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
            {loginMethod === 'xaman' && (
              <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-5 h-5 rounded" />
            )}
            {loginMethod === 'crossmark' && (
              <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" />
            )}
            {loginMethod === 'web3auth' && (
              <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-sky-500 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            )}
            <code className="text-emerald-400 text-sm font-mono">
              {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
            </code>
          </div>
        )}

        {/* Features Ready */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            RLUSD Ready
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            USDC Ready
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tap-to-Pay
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}