'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// Team members data - add more members here
const teamMembers = [
  {
    id: 'mark',
    name: 'Mark Flynn',
    role: 'Founder & Technical Lead',
    image: '/mark.jpg', // Add your headshot to public folder
    bullets: [
      'Self-taught dev: 0 → production in 6 months',
      '10 years entrepreneurship',
      'Licensed Social Worker & VIG Practitioner',
    ],
    extra: 'Family legacy: Sister (Real Lives mental health) · Brother-in-law (GeoSLAM £22M exit to FARO)',
    note: 'First male practitioner for children in care, Guernsey',
  },
  // ADD MORE TEAM MEMBERS HERE:
  // {
  //   id: 'member2',
  //   name: 'Name Here',
  //   role: 'Role Here',
  //   image: '/member2.jpg',
  //   bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'],
  //   extra: 'Additional info',
  //   note: 'Notable achievement',
  // },
];

const partnerships = [
  {
    id: 'tvvin',
    abbrev: 'TV',
    name: 'TVVIN',
    description: 'VASP license holder · Tokenized asset platform',
    colorClass: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'identity',
    abbrev: 'ID',
    name: 'Digital Identity Partner',
    description: '40k lines · Trust scoring · Privacy-first KYC',
    colorClass: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'xrpl',
    abbrev: 'XC',
    name: 'XRPL Commons',
    description: 'Ecosystem support · Potential £200k grant',
    colorClass: 'bg-emerald-500/20 text-emerald-400',
  },
];

export default function TeamAskPage() {
  const router = useRouter();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = teamMembers.length + 1; // +1 for partnerships slide

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Pause auto-play when user interacts
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % totalSlides);
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

      {/* Navigation - Left Arrow (page nav) */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-10 md:w-20 z-30 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowLeftArrow(true)}
        onMouseLeave={() => setShowLeftArrow(false)}
        onClick={() => router.push('/solution')}
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

      {/* Navigation - Right Arrow (page nav - loops back to cover) */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-10 md:w-20 z-30 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowRightArrow(true)}
        onMouseLeave={() => setShowRightArrow(false)}
        onClick={() => router.push('/cover')}
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
          The Team &{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">The Ask</span>
        </h1>
      </div>

      {/* Main Content */}
      <div className="absolute top-16 md:top-28 bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 z-10 flex flex-col md:flex-row gap-4 md:gap-6 overflow-y-auto md:overflow-visible">
        
        {/* Left Column - Team Carousel */}
        <div className="md:flex-1 flex flex-col gap-3 md:gap-4 relative">
          <h2 className="text-emerald-400 text-base md:text-xl font-semibold">The Team</h2>
          
          {/* Carousel Container */}
          <div className="relative flex-1 min-h-[380px] md:min-h-0">
            
            {/* Carousel Navigation - Left */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all shadow-lg"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Carousel Navigation - Right */}
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all shadow-lg"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slides Container */}
            <div className="h-full overflow-hidden mx-10">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Team Member Slides */}
                {teamMembers.map((member) => (
                  <div key={member.id} className="w-full flex-shrink-0 h-full flex flex-col gap-3 px-1">
                    {/* Member Card */}
                    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 flex-1">
                      <div className="flex gap-4">
                        {/* Profile Image */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-400 to-blue-400 relative">
                          <Image 
                            src={member.image} 
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-base md:text-lg font-semibold">{member.name}</p>
                          <p className="text-emerald-400 text-xs md:text-sm">{member.role}</p>
                          <div className="mt-3 space-y-1.5 text-zinc-400 text-xs md:text-sm">
                            {member.bullets.map((bullet, idx) => (
                              <p key={idx}>• {bullet}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                      {(member.extra || member.note) && (
                        <div className="mt-4 pt-3 border-t border-zinc-700/50">
                          {member.extra && (
                            <p className="text-zinc-400 text-xs md:text-sm">{member.extra}</p>
                          )}
                          {member.note && (
                            <p className="text-zinc-500 text-xs mt-1">{member.note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Partnerships Slide */}
                <div className="w-full flex-shrink-0 h-full flex flex-col gap-3 px-1">
                  <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 flex-1">
                    <h3 className="text-blue-400 text-sm md:text-base font-semibold mb-3">Strategic Partnerships</h3>
                    <div className="space-y-3">
                      {partnerships.map((partner) => (
                        <div key={partner.id} className="bg-zinc-700/30 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${partner.colorClass}`}>
                              {partner.abbrev}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{partner.name}</p>
                              <p className="text-zinc-500 text-xs">{partner.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Advisory */}
                    <h3 className="text-purple-400 text-sm md:text-base font-semibold mt-5 mb-2">Advisory (Forming)</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-zinc-700/50 rounded-full text-zinc-400 text-xs">Regulatory Compliance</span>
                      <span className="px-3 py-1.5 bg-zinc-700/50 rounded-full text-zinc-400 text-xs">Fintech Scaling</span>
                      <span className="px-3 py-1.5 bg-zinc-700/50 rounded-full text-zinc-400 text-xs">XRPL Ecosystem</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-3">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === idx 
                      ? 'bg-emerald-400 w-6' 
                      : 'bg-zinc-600 hover:bg-zinc-500 w-2'
                  }`}
                />
              ))}
            </div>

            {/* Auto-play indicator */}
            {isAutoPlaying && totalSlides > 1 && (
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Auto-scroll</span>
                </div>
              </div>
            )}
          </div>

          {/* Guernsey flag video - desktop only */}
          <div className="hidden md:block mt-auto pt-2">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-20 h-auto rounded-lg opacity-80"
            >
              <source src="/guernsey-flag.webm" type="video/webm" />
            </video>
          </div>
        </div>

        {/* Right Column - The Ask */}
        <div className="md:flex-1 flex flex-col gap-3 md:gap-4 md:overflow-y-auto md:pr-2" style={{ scrollbarWidth: 'thin' }}>
          <h2 className="text-blue-400 text-base md:text-xl font-semibold">The Ask</h2>
          
          {/* Raise Card */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-emerald-500/30">
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-1">Raising</p>
              <p className="text-white text-3xl md:text-4xl font-bold">£200k</p>
              <p className="text-emerald-400 text-sm mt-1">Pre-seed at £2M pre-money</p>
              <p className="text-zinc-500 text-xs mt-1">10% dilution</p>
            </div>
          </div>

          {/* Use of Funds */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <h3 className="text-white text-sm md:text-base font-semibold mb-3">Use of Funds</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 text-right">
                  <span className="text-emerald-400 text-sm md:text-base font-bold">£100k</span>
                </div>
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-zinc-400 text-xs w-32">24-mo founder runway</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 text-right">
                  <span className="text-blue-400 text-sm md:text-base font-bold">£60k</span>
                </div>
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-zinc-400 text-xs w-32">XRPL developer hire</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 text-right">
                  <span className="text-purple-400 text-sm md:text-base font-bold">£20k</span>
                </div>
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-zinc-400 text-xs w-32">Merchant onboarding</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 text-right">
                  <span className="text-pink-400 text-sm md:text-base font-bold">£20k</span>
                </div>
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-zinc-400 text-xs w-32">Regulatory & legal</span>
              </div>
            </div>
          </div>

          {/* Why £2M Valuation */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-5">
            <h3 className="text-white text-sm md:text-base font-semibold mb-2">Why £2M Valuation</h3>
            <div className="space-y-1 text-zinc-400 text-xs">
              <p>• <span className="text-emerald-400">First-mover moat</span> — Only regulated retail crypto POS</p>
              <p>• <span className="text-blue-400">Working product</span> — 443+ live transactions</p>
              <p>• <span className="text-purple-400">Regulatory pathway</span> — GFSC Innovation Sandbox</p>
              <p>• <span className="text-pink-400">Viral mechanics</span> — 5-level commission automation</p>
              <p>• <span className="text-emerald-400">Exportable</span> — 50+ jurisdictions addressable</p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-700/50">
              <p className="text-zinc-500 text-xs">
                <span className="text-zinc-400">Comparables:</span> Stripe $20M seed (2011) · Square $40M seed (2010)
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 border border-zinc-700/50">
            <p className="text-zinc-400 text-xs">
              <span className="text-white font-medium">Timeline:</span> Close by March 2026 — aligns with Innovation Sandbox approval & XRPL Commons residency
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 border border-emerald-500/20 mt-auto">
            <div className="text-center">
              <p className="text-white text-sm md:text-base font-semibold mb-1">Let's Talk</p>
              <a 
                href="mailto:mark@yesallofus.com" 
                className="text-emerald-400 text-sm md:text-base hover:text-emerald-300 transition-colors"
              >
                mark@yesallofus.com
              </a>
              <p className="text-zinc-500 text-xs mt-2">Mark Flynn · Guernsey, Channel Islands</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}