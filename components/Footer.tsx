'use client';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-zinc-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a href="/" className="flex items-center gap-3 mb-4">
              <img src="/mark.jpg" alt="Mark" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-white font-bold text-xl">A Product by YesAllofUs</span>
            </a>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Instant affiliate commissions on the XRP Ledger. Pay your affiliates in seconds, not months.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://x.com/YesAllofUs" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/yesallofus-saas-8a154139b/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="mailto:mark@yesallofus.com" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">Vendor</a></li>
              <li><a href="/affiliate-dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">Affilaites</a></li>
              <li><a href="/#how-it-works" className="text-zinc-400 hover:text-white transition-colors text-sm">How It Works</a></li>
              <li><a href="/#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/trustline" className="text-zinc-400 hover:text-white transition-colors text-sm">RLUSD Trustline</a></li>
              <li><a href="/guides/wordpress" className="text-zinc-400 hover:text-white transition-colors text-sm">WordPress Guide</a></li>
              <li><a href="/guides/wordpress" className="text-zinc-400 hover:text-white transition-colors text-sm">WooCommerce Setup</a></li>
              <li><a href="/docs" className="text-zinc-400 hover:text-white transition-colors text-sm">API Docs</a></li>
              <li><a href="/faq" className="text-zinc-400 hover:text-white transition-colors text-sm">FAQ</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Start Up</h3>
            <ul className="space-y-3">
              <li><a href="https://calendly.com/tokencanvasio/30min" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors text-sm">Book a Call</a></li>
              <li><a href="/announcements" className="text-zinc-400 hover:text-white transition-colors text-sm">📢 Announcements</a></li>
              <li><a href="/about" className="text-zinc-400 hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="mailto:mark@yesallofus.com" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="/affiliate-terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Affiliate Terms</a></li>
              <li><a href="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="/acceptable-use" className="text-zinc-400 hover:text-white transition-colors text-sm">Acceptable Use</a></li>
              <li><a href="/cookies" className="text-zinc-400 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">
              © 2025 YesAllofUs. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-zinc-600 text-sm">Built on</span>
              <a href="https://xrpl.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L3 5.5v13L12 24l9-5.5v-13L12 0zm0 2.3l6.5 4v2.7L12 13l-6.5-4V6.3L12 2.3zM5.5 11l6.5 4 6.5-4v2.7L12 17.7l-6.5-4V11z"/>
                </svg>
                <span className="text-sm font-medium">XRP Ledger</span>
              </a>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-500 text-sm">Guernsey, Channel Islands</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}