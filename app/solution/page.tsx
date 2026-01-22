'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Image from 'next/image';

const milestoneDetails = {
  q1: {
    title: "Q1 2026 — Prove",
    color: "emerald",
    details: [
      { label: "GFSC Engagement", value: "Submit Innovation Sandbox application, attend consultation sessions" },
      { label: "Target Merchants", value: "5 Guernsey-based retailers (cafes, boutiques, service providers)" },
      { label: "XRPL Commons", value: "Begin 3-month residency in Paris, access to £200k non-dilutive funding pool" },
      { label: "KPIs", value: "100+ transactions, <3s avg settlement, 99.9% uptime" },
      { label: "Risk Mitigation", value: "Manual KYC for pilot merchants, daily reconciliation checks" },
    ]
  },
  q2: {
    title: "Q2 2026 — Scale Locally",
    color: "blue",
    details: [
      { label: "Merchant Target", value: "50 active merchants across Guernsey retail sector" },
      { label: "Volume Goal", value: "£50k+ monthly transaction volume processed" },
      { label: "Affiliate Launch", value: "5-deep commission structure live, first affiliate payouts within 30 seconds" },
      { label: "Compliance", value: "Full GFSC reporting integration, automated AML monitoring via Chainalysis" },
      { label: "Tech Milestone", value: "WordPress/WooCommerce plugin public release" },
    ]
  },
  q3: {
    title: "Q3 2026 — Export Framework",
    color: "purple",
    details: [
      { label: "Merchant Scale", value: "100 merchants (pilot 'Excellent' target achieved)" },
      { label: "Expansion", value: "Jersey FSC and Isle of Man FSA licensing applications submitted" },
      { label: "RWA Integration", value: "Tokenised gold/commodity yield products accessible via wallet" },
      { label: "Partnerships", value: "2-3 strategic announcements (payment providers, e-commerce platforms)" },
      { label: "Revenue", value: "£5k+ monthly platform fees, break-even trajectory" },
    ]
  },
  q4: {
    title: "Q4 2026 — Growth Phase",
    color: "pink",
    details: [
      { label: "Merchant Network", value: "500+ merchants across Channel Islands" },
      { label: "Monthly Volume", value: "£500k+ TPV, 10,000+ transactions/month" },
      { label: "Multi-Jurisdiction", value: "Live operations in Guernsey, Jersey, Isle of Man" },
      { label: "Funding", value: "Seed round discussions at £1.2-2M valuation (partnership dependent)" },
      { label: "UK/EU Roadmap", value: "FCA sandbox application, EU MiCA compliance assessment" },
    ]
  }
};

export default function TractionRoadmapPage() {
  const router = useRouter();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

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
        onClick={() => router.push('/problem-opportunity')}
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
        onClick={() => router.push('/team')}
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

      {/* Title */}
      <div className="absolute top-4 md:top-10 left-0 right-0 text-center z-10 px-4">
        <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Traction &{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Roadmap</span>
        </h1>
      </div>

      {/* Main Content - Scrollable on mobile */}
      <div className="absolute top-16 md:top-32 bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 z-10 flex flex-col md:flex-row gap-4 md:gap-8 overflow-y-auto md:overflow-visible">
        
        {/* Left Column - Current Status & Images */}
        <div className="md:flex-1 flex flex-col gap-3 md:gap-4">
          <h2 className="text-emerald-400 text-base md:text-xl font-semibold">Current Status</h2>
          
          {/* Status Card */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <div className="space-y-2 md:space-y-3 text-zinc-300 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-xs">Product:</span>
                <span className="text-xs">✓ Live NFC tap-to-pay, 443 transactions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-xs">Regulatory:</span>
                <span className="text-xs">✓ GFSC pathway (Q1 2026)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-xs">Ecosystem:</span>
                <span className="text-xs">✓ XRPL Commons residency (April 2026)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-xs">Validation:</span>
                <span className="text-xs">✓ First POS, no wallet/crypto knowledge needed</span>
              </div>
            </div>
          </div>

          {/* Photo Album - Two Images at a Time Swipe */}
          <div className="relative min-h-[200px] md:min-h-[300px] md:flex-1">
            {/* Scroll Left Button */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollLeft(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-black/90 rounded-full p-2 md:p-3 transition-all shadow-lg"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Scroll Right Button */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollRight(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-black/90 rounded-full p-2 md:p-3 transition-all shadow-lg"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Two-Image Swipe Container */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Page 1: Images 1 & 2 */}
              <div className="flex-shrink-0 w-full flex gap-2 md:gap-4 justify-center items-center snap-center px-8 md:px-12 py-2">
                <div className="w-1/2 max-w-[140px] md:max-w-[200px]">
                  <Image 
                    src="/Paying-2.jpg" 
                    alt="Pre-payment screen"
                    width={400}
                    height={700}
                    className="rounded-xl md:rounded-2xl shadow-2xl object-cover w-full h-auto"
                  />
                </div>
                <div className="w-1/2 max-w-[140px] md:max-w-[200px]">
                  <Image 
                    src="/payment-processing-notification.jpg" 
                    alt="Payment notification"
                    width={400}
                    height={700}
                    className="rounded-xl md:rounded-2xl shadow-2xl object-cover w-full h-auto"
                  />
                </div>
              </div>
              
              {/* Page 2: Images 3 & 4 */}
              <div className="flex-shrink-0 w-full flex gap-2 md:gap-4 justify-center items-center snap-center px-8 md:px-12 py-2">
                <div className="w-1/2 max-w-[140px] md:max-w-[200px]">
                  <Image 
                    src="/payment-complete.jpg" 
                    alt="Payment complete"
                    width={400}
                    height={700}
                    className="rounded-xl md:rounded-2xl shadow-2xl object-cover w-full h-auto"
                  />
                </div>
                <div className="w-1/2 max-w-[140px] md:max-w-[200px]">
                  <Image 
                    src="/receipt-items.jpg" 
                    alt="Receipt with items"
                    width={400}
                    height={700}
                    className="rounded-xl md:rounded-2xl shadow-2xl object-cover w-full h-auto"
                  />
                </div>
              </div>
            </div>
            
            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
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

        {/* Right Column - Roadmap (Scrollable) */}
        <div className="md:flex-1 flex flex-col gap-2 md:gap-3 md:overflow-y-auto md:pr-2" style={{ scrollbarWidth: 'thin' }}>
          <h2 className="text-blue-400 text-base md:text-xl font-semibold sticky top-0 bg-transparent">12-Month Milestones</h2>
          
          {/* Q1 2026 */}
          <div 
            onClick={() => setActiveModal('q1')}
            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-400"></div>
              <p className="text-white text-xs md:text-base font-semibold">Q1 2026 — Prove</p>
              <svg className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-4 md:pl-5">
              <p>• GFSC Digital Finance Consultation</p>
              <p>• First Guernsey merchants onboarded</p>
              <p>• XRPL Commons residency begins</p>
            </div>
          </div>

          {/* Q2 2026 */}
          <div 
            onClick={() => setActiveModal('q2')}
            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-400"></div>
              <p className="text-white text-xs md:text-base font-semibold">Q2 2026 — Scale Locally</p>
              <svg className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-4 md:pl-5">
              <p>• 50 merchants target</p>
              <p>• Affiliate network proof-of-concept</p>
              <p>• 5-deep commission automation</p>
            </div>
          </div>

          {/* Q3 2026 */}
          <div 
            onClick={() => setActiveModal('q3')}
            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-400"></div>
              <p className="text-white text-xs md:text-base font-semibold">Q3 2026 — Export Framework</p>
              <svg className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-4 md:pl-5">
              <p>• 100 merchants target</p>
              <p>• Jersey/Isle of Man expansion</p>
              <p>• RWA bridge integration</p>
            </div>
          </div>

          {/* Q4 2026 */}
          <div 
            onClick={() => setActiveModal('q4')}
            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-pink-400"></div>
              <p className="text-white text-xs md:text-base font-semibold">Q4 2026 — Growth Phase</p>
              <svg className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="space-y-1 text-zinc-400 text-xs pl-4 md:pl-5">
              <p>• 500+ merchants</p>
              <p>• Multi-jurisdiction operations</p>
              <p>• Seed raise discussion</p>
            </div>
          </div>

          {/* Exit Note */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-zinc-700/50">
            <p className="text-zinc-400 text-xs">
              <span className="text-white font-medium">Exit:</span> Stripe/Square/Revolut acquisition target
            </p>
          </div>
        </div>

      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-zinc-900 rounded-2xl p-5 md:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-zinc-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  activeModal === 'q1' ? 'bg-emerald-400' :
                  activeModal === 'q2' ? 'bg-blue-400' :
                  activeModal === 'q3' ? 'bg-purple-400' :
                  'bg-pink-400'
                }`}></div>
                <h3 className="text-white text-lg md:text-xl font-bold">
                  {milestoneDetails[activeModal as keyof typeof milestoneDetails]?.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {milestoneDetails[activeModal as keyof typeof milestoneDetails]?.details.map((item, index) => (
                <div key={index} className="border-l-2 border-zinc-700 pl-4">
                  <p className={`text-sm font-semibold mb-1 ${
                    activeModal === 'q1' ? 'text-emerald-400' :
                    activeModal === 'q2' ? 'text-blue-400' :
                    activeModal === 'q3' ? 'text-purple-400' :
                    'text-pink-400'
                  }`}>{item.label}</p>
                  <p className="text-zinc-300 text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className={`mt-6 w-full py-2 rounded-lg font-medium text-white transition-all ${
                activeModal === 'q1' ? 'bg-emerald-500 hover:bg-emerald-600' :
                activeModal === 'q2' ? 'bg-blue-500 hover:bg-blue-600' :
                activeModal === 'q3' ? 'bg-purple-500 hover:bg-purple-600' :
                'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}