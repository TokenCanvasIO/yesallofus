'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CoverPage() {
  const router = useRouter();
  const [showRightArrow, setShowRightArrow] = useState(false);

  return (
    <div className="min-h-screen h-screen relative overflow-hidden">
      
      {/* Gradient border frame */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-blue-400 to-purple-400"></div>
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-emerald-400 via-blue-400 to-purple-400"></div>
      </div>

      {/* Navigation - Right Arrow */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-10 lg:w-20 z-30 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowRightArrow(true)}
        onMouseLeave={() => setShowRightArrow(false)}
        onClick={() => router.push('/problem-opportunity')}
      >
        <svg 
          className={`w-6 h-6 lg:w-10 lg:h-10 text-white transition-opacity duration-300 opacity-50 lg:opacity-0 ${showRightArrow ? 'lg:opacity-70 lg:hover:opacity-100' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      {/* Background - yaofus-landing screenshot */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/yaofus-landing.png')" }}
      />

      {/* Title - ALL SCREENS */}
      <div className="absolute top-4 lg:top-12 left-0 right-0 text-center z-10 px-4">
        <h1 className="text-white text-lg md:text-2xl lg:text-4xl xl:text-5xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          A New POS{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Ready</span>
          {' '}to Disrupt
          <span className="hidden lg:inline"> the High Street</span>
        </h1>
      </div>

      {/* ===== DESKTOP ONLY - Cards on sides ===== */}
      
      {/* Left cards - desktop only */}
      <div className="hidden lg:flex absolute left-[calc(2rem+50px)] xl:left-[calc(3rem+50px)] top-[calc(38%-15px)] flex-col gap-4 z-10">
        
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 w-[220px] h-[150px] text-center flex flex-col justify-center">
          <p className="text-zinc-400 text-sm mb-2">Guernsey Retail Market</p>
          <p className="text-white text-3xl font-bold mb-1">£348m</p>
          <p className="text-emerald-400 text-base font-medium">We Start Here</p>
          <p className="text-zinc-500 text-[10px] mt-2">States of Guernsey 2023</p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 w-[220px] h-[150px] text-center flex flex-col justify-center">
          <p className="text-zinc-400 text-sm mb-2">Card Fees Lost Annually</p>
          <p className="text-white text-3xl font-bold mb-1">£10m+</p>
          <p className="text-emerald-400 text-base font-medium">We Keep It Local</p>
          <p className="text-zinc-500 text-[10px] mt-2">Stays on the island</p>
        </div>

      </div>

      {/* Right cards - desktop only */}
      <div className="hidden lg:flex absolute right-[calc(2rem+50px)] xl:right-[calc(3rem+50px)] top-[calc(38%-15px)] flex-col gap-4 z-10">
        
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 w-[220px] h-[150px] text-center flex flex-col justify-center">
          <p className="text-zinc-400 text-sm mb-2">Global E-Commerce 2026</p>
          <p className="text-white text-3xl font-bold mb-1">$6.9tn</p>
          <p className="text-emerald-400 text-base font-medium">Ready to Scale</p>
          <p className="text-zinc-500 text-[10px] mt-2">Shopify Global Report 2026</p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 w-[220px] h-[150px] text-center flex flex-col justify-center">
          <p className="text-zinc-400 text-sm mb-2">Projected by 2030</p>
          <p className="text-white text-3xl font-bold mb-1">$80tn+</p>
          <p className="text-emerald-400 text-base font-medium">Exponential Growth</p>
          <p className="text-zinc-500 text-[10px] mt-2">Industry Forecasts</p>
        </div>

      </div>

      {/* Guernsey flag video - desktop only */}
      <div className="hidden lg:block absolute bottom-6 left-8 z-10">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-24 h-auto rounded-lg opacity-80"
        >
          <source src="/guernsey-flag.webm" type="video/webm" />
        </video>
      </div>

      {/* Subheader - desktop only */}
      <div className="hidden lg:block absolute bottom-14 lg:bottom-16 xl:bottom-18 left-0 right-0 text-center z-10 px-4">
        <p className="text-zinc-300 text-xl lg:text-2xl xl:text-3xl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          0.5% Fees and Affiliate Commission Growth Engine for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">Everyone</span>
        </p>
      </div>

    </div>
  );
}