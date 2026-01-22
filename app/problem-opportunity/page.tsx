'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function ProblemOpportunityPage() {
  const router = useRouter();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
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
      
      {/* Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />

      {/* Navigation - Left Arrow */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-10 md:w-20 z-30 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowLeftArrow(true)}
        onMouseLeave={() => setShowLeftArrow(false)}
        onClick={() => router.push('/cover')}
      >
        <svg 
          className={`w-6 h-6 md:w-10 md:h-10 text-white transition-opacity duration-300 ${showLeftArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 md:opacity-0'} opacity-50 md:opacity-0`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>

      {/* Navigation - Right Arrow */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-10 md:w-20 z-30 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowRightArrow(true)}
        onMouseLeave={() => setShowRightArrow(false)}
        onClick={() => router.push('/solution')}
      >
        <svg 
          className={`w-6 h-6 md:w-10 md:h-10 text-white transition-opacity duration-300 ${showRightArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 md:opacity-0'} opacity-50 md:opacity-0`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Pre-payment image top right - hidden on mobile */}
      <div className="hidden md:block absolute top-4 right-8 z-10 w-56 md:w-72">
        <Image 
          src="/pre-payment.jpg" 
          alt="NFC tap-to-pay demo"
          width={936}
          height={508}
          className="rounded-2xl shadow-2xl"
        />
      </div>

      {/* Main Content - Scrollable */}
      <div className="absolute top-4 md:top-32 bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 z-10 flex flex-col md:flex-row gap-3 md:gap-8 overflow-y-auto md:overflow-visible">
        
        {/* Left Column - Problems */}
        <div className="md:flex-1 flex flex-col gap-2 md:gap-4">
          <h2 className="text-red-400 text-base md:text-xl font-semibold">The Problems We Solve</h2>
          
          {/* Problem Card 1 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Merchants Bleeding on Fees</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• Card processors take 2-3% every transaction</p>
              <p>• Small businesses lose £10k-50k/year</p>
              <p>• Chargebacks cost time + money</p>
            </div>
          </div>

          {/* Problem Card 2 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Small Merchants Locked Out</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• 25M+ stores earn under £1k/year</p>
              <p>• Affiliate platforms charge £50-500/month</p>
              <p>• Net-30/60 payouts exclude small brands</p>
            </div>
          </div>

          {/* Problem Card 3 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Wealth Creation Gated</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• Tokenised assets only for institutions</p>
              <p>• Retail excluded from yield</p>
              <p>• High minimums in traditional finance</p>
            </div>
          </div>

          {/* Video - Hidden on mobile */}
          <div className="hidden md:block mt-auto">
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
        </div>

        {/* Right Column - Opportunity */}
        <div className="md:flex-1 flex flex-col gap-2 md:gap-4">
          <h2 className="text-emerald-400 text-base md:text-xl font-semibold">The YesAllOfUs Opportunity</h2>
          
          {/* Opportunity Card 1 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">First-Mover Moat</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• First POS, no wallet/crypto knowledge</p>
              <p>• GFSC pathway (Q1 2026)</p>
              <p>• Globally exportable with XRPL Commons</p>
            </div>
          </div>

          {/* Opportunity Card 2 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Unlocking the Long-Tail</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• First 5-deep instant commission on XRPL</p>
              <p>• Zero subscription — pay on success</p>
              <p>• Opens to 25M+ underserved stores</p>
            </div>
          </div>

          {/* Opportunity Card 3 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Viral Growth Engine</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• 5-level affiliate automation</p>
              <p>• Every customer = promoter</p>
              <p>• Network effects drive adoption</p>
            </div>
          </div>

          {/* Opportunity Card 4 */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white text-xs md:text-base font-semibold">Superior Economics</p>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-6 md:pl-7">
              <p>• XRPL: 3-5 seconds, &lt;£0.01 fees</p>
              <p>• 99.5% cheaper than cards</p>
              <p>• Everyone profits</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}