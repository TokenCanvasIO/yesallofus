'use client';

export default function Announcements() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📢</span>
            <h1 className="text-4xl font-bold">Announcements</h1>
          </div>
          <p className="text-zinc-400">Platform updates and news from YesAllofUs</p>
        </div>

        {/* Announcements Timeline */}
        <div className="space-y-8">

          {/* Web3Auth Announcement - NEW */}
          <article className="relative">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 ml-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-1 rounded">NEW</span>
                <span className="text-zinc-500 text-sm">December 2025</span>
              </div>
              <h2 className="text-xl font-bold mb-3">🔐 Social Login Now Available</h2>
              <div className="text-zinc-300 space-y-3">
                <p>
                  No wallet? No problem. Affiliates can now sign up with their existing social accounts — no crypto knowledge required.
                </p>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-[#24292e] rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-zinc-400 text-sm">Google, Apple, Facebook, X, Discord, GitHub & more</span>
                </div>
                <p><strong>How it works:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Sign in with any social account</li>
                  <li>Real XRPL wallet created automatically via Web3Auth MPC</li>
                  <li>Private keys split across nodes — never stored whole</li>
                  <li>0 XRP to start your wallet.</li>
                   <li>Commissions held until wallet is funded (~$1.50)</li>
                  <li>24/7 automatic payouts — no browser session needed</li>
                  <li>Export to Xaman anytime for full control</li>
                </ul>
                <p className="text-zinc-500 text-sm mt-4">
                  This removes the biggest barrier to affiliate adoption. Your affiliates don&apos;t need to understand crypto — they just sign in and earn.
                </p>
              </div>
            </div>
          </article>

          {/* Launch Announcement */}
          <article className="relative">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 ml-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-1 rounded">PINNED</span>
                <span className="text-zinc-500 text-sm">28 November 2025</span>
              </div>
              <h2 className="text-xl font-bold mb-3">🚀 YesAllofUs is Live</h2>
              <div className="text-zinc-300 space-y-3">
                <p>
                  YesAllofUs is now open. Instant affiliate commission payments on the XRP Ledger.
                </p>
                <p><strong>What&apos;s ready:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>WordPress/WooCommerce plugin</li>
                  <li>CLI tool — <code className="bg-zinc-800 px-1 rounded">npx YesAllofUs</code></li>
                  <li>Full REST API</li>
                  <li>Xaman wallet connection (mobile)</li>
                  <li>Crossmark wallet connection (browser)</li>
                  <li>Social login via Web3Auth (no wallet needed)</li>
                  <li>5-level commission structure</li>
                  <li>RLUSD payouts in ~4 seconds</li>
                </ul>
              </div>
            </div>
          </article>

          {/* What's Been Built */}
          <article className="relative">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 ml-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-sky-500/20 text-sky-400 text-xs font-semibold px-2 py-1 rounded">BUILT</span>
                <span className="text-zinc-500 text-sm">November 2025</span>
              </div>
              <h2 className="text-xl font-bold mb-3">✅ What&apos;s Been Built</h2>
              <div className="text-zinc-300 space-y-4">
                
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">WordPress Plugin</h3>
                  <p className="text-zinc-400 text-sm">
                    Full WooCommerce integration. Installs in minutes. Handles affiliate registration, 
                    referral tracking, and automatic commission payouts when orders complete.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">CLI Tool</h3>
                  <p className="text-zinc-400 text-sm">
                    Run <code className="bg-zinc-900 px-1 rounded">npx YesAllofUs</code> to register your store and get API credentials. 
                    No installation required.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Wallet Connections</h3>
                  <p className="text-zinc-400 text-sm">
                    Xaman (mobile), Crossmark (browser extension), and Social Login (Web3Auth) all working. 
                    Connect your XRPL wallet or create one instantly with a social account.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Web3Auth Integration</h3>
                  <p className="text-zinc-400 text-sm">
                    MPC-based wallet creation via social login. Affiliates sign up with Google, Apple, Facebook, X, Discord, or GitHub. 
                    No seed phrases. No wallet apps. Real XRPL addresses with 24/7 auto-sign capability.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Server Infrastructure</h3>
                  <p className="text-zinc-400 text-sm">
                    API servers running on DigitalOcean. Cloudflare for CDN and security. 
                    Redis for session management. PM2 for process management.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Security</h3>
                  <p className="text-zinc-400 text-sm">
                    High-level security for your XRP and data. 2FA authentication, advanced firewall protection, 
                    automated intrusion detection, and 24/7 monitoring. Servers hardened with SSH port changes, 
                    Fail2Ban protection, and automatic security updates.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Documentation</h3>
                  <p className="text-zinc-400 text-sm">
                    Full API docs, WordPress guide, FAQ, and legal pages (Terms, Privacy, Acceptable Use, Cookies).
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Booking System</h3>
                  <p className="text-zinc-400 text-sm">
                    Calendly integration for the done-for-you setup service. 
                    <a href="https://calendly.com/tokencanvasio/30min" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline ml-1">Book a call</a> and I&apos;ll get you set up personally.
                  </p>
                </div>

              </div>
            </div>
          </article>

          {/* What's In Progress */}
          <article className="relative">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 ml-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2 py-1 rounded">IN PROGRESS</span>
                <span className="text-zinc-500 text-sm">December 2025</span>
              </div>
              <h2 className="text-xl font-bold mb-3">🔨 What I&apos;m Working On</h2>
              <div className="text-zinc-300 space-y-4">

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Company Formation</h3>
                  <p className="text-zinc-400 text-sm">
                    Working with regulators in Guernsey to properly structure YesAllofUs. 
                    Making sure everything is compliant from day one.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Local Business Partnerships</h3>
                  <p className="text-zinc-400 text-sm">
                    Meeting with business leaders in Guernsey to build relationships and 
                    get YesAllofUs in front of the right people.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">XRPL Commons Residency</h3>
                  <p className="text-zinc-400 text-sm">
                    Meeting with XRPL Commons in Paris to discuss partnership opportunities 
                    and expanding YesAllofUs across the XRPL ecosystem.
                  </p>
                </div>

              </div>
            </div>
          </article>

          {/* Get In Touch */}
          <article className="relative">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 ml-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-zinc-700 text-zinc-300 text-xs font-semibold px-2 py-1 rounded">CONTACT</span>
              </div>
              <h2 className="text-xl font-bold mb-3">💬 Get In Touch</h2>
              <div className="text-zinc-300 space-y-3">
                <p>
                  Questions, feedback, or want to chat about integration?
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:mark@YesAllofUs.com" 
                    className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    mark@YesAllofUs.com
                  </a>
                  <a 
                    href="https://calendly.com/tokencanvasio/30min" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book a call
                  </a>
                </div>
              </div>
            </div>
          </article>

        </div>
      </main>
    </div>
  );
}