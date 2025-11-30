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
                    Xaman (mobile) and Crossmark (browser extension) both working. 
                    Connect your XRPL wallet to send commissions.
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
                <span className="text-zinc-500 text-sm">November 2025</span>
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