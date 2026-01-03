'use client';

import React, { useState, ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  title?: string;
}

const CodeBlock = ({ children, title }: CodeBlockProps) => (
  <div className="rounded-lg overflow-hidden border border-slate-700 mb-4">
    {title && (
      <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-700">
        {title}
      </div>
    )}
    <pre className="bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm font-mono">
      <code>{children}</code>
    </pre>
  </div>
);

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
}

const Step = ({ number, title, children }: StepProps) => (
  <div className="flex gap-4 mb-8">
    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
      {number}
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <div className="text-slate-600">{children}</div>
    </div>
  </div>
);

interface TabsProps {
  tabs: { id: string; label: string; content: ReactNode }[];
}

const Tabs = ({ tabs }: TabsProps) => {
  const [active, setActive] = useState(tabs[0].id);
  
  return (
    <div className="mb-8">
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              active === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find(t => t.id === active)?.content}
    </div>
  );
};

interface EndpointProps {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  auth?: boolean;
  description: string;
  children?: ReactNode;
}

const Endpoint = ({ method, path, auth, description, children }: EndpointProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500',
    POST: 'bg-blue-500',
    DELETE: 'bg-red-500'
  };
  
  return (
    <div className="border border-slate-200 rounded-lg mb-4 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className={`${methodColors[method]} text-white text-xs font-bold px-2 py-1 rounded`}>
          {method}
        </span>
        <code className="text-slate-800 font-mono text-sm flex-1">{path}</code>
        {auth && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Auth Required</span>}
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <p className="text-slate-600 mb-4">{description}</p>
          {children}
        </div>
      )}
    </div>
  );
};

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

const Section = ({ id, title, children }: SectionProps) => (
  <section id={id} className="mb-16 scroll-mt-24">
    <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">{title}</h2>
    {children}
  </section>
);

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <a 
    href={href} 
    className="block py-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium"
  >
    {children}
  </a>
);

export default function YesAllofUsDocs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(true);
  const navRef = React.useRef<HTMLElement>(null);
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current || !navRef.current) return;
      
      const mainRect = mainRef.current.getBoundingClientRect();
      const navHeight = navRef.current.offsetHeight;
      const topOffset = 96;
      const buffer = 150;
      
      // Check if we've scrolled past where nav should stop
      const shouldStop = mainRect.bottom < navHeight + topOffset + buffer;
      setIsStuck(!shouldStop);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto">
          <nav className="p-6 pt-16 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Getting Started</h3>
              <a href="#overview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Overview</a>
              <a href="#quick-start" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Quick Start</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <a href="#wordpress" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">WordPress (Zero Code)</a>
              <a href="#sdk-tracking" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">SDK Tracking</a>
              <a href="#backend-integration" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Backend Integration</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Wallet Options</h3>
              <a href="#wallet-setup" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Xaman & Crossmark</a>
              <a href="#web3auth" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Social Login (Web3Auth)</a>
              <a href="#payout-modes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Payout Modes</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">API Reference</h3>
              <a href="#api-payouts" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Payouts</a>
              <a href="#api-affiliates" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Affiliates</a>
              <a href="#api-stores" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Stores</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reference</h3>
              <a href="#commission-system" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Commission Rates</a>
              <a href="#webhooks" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Webhooks</a>
              <a href="#errors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Error Codes</a>
            </div>
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:flex lg:gap-12">
        {/* Sidebar - Fixed position */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          {/* Placeholder to maintain layout spacing */}
        </aside>
        
        {/* Fixed sidebar navigation */}
        <nav 
          ref={navRef}
          className={`hidden lg:block w-64 max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6 z-40 fixed top-24 transition-opacity duration-200 ${isStuck ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ left: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))' }}
        >
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Getting Started</h3>
              <NavLink href="#overview">Overview</NavLink>
              <NavLink href="#quick-start">Quick Start</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <NavLink href="#wordpress">WordPress (Zero Code)</NavLink>
              <NavLink href="#sdk-tracking">SDK Tracking</NavLink>
              <NavLink href="#backend-integration">Backend Integration</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Wallet Options</h3>
              <NavLink href="#wallet-setup">Xaman & Crossmark</NavLink>
              <NavLink href="#web3auth">Social Login (Web3Auth)</NavLink>
              <NavLink href="#payout-modes">Payout Modes</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">API Reference</h3>
              <NavLink href="#api-payouts">Payouts</NavLink>
              <NavLink href="#api-affiliates">Affiliates</NavLink>
              <NavLink href="#api-stores">Stores</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reference</h3>
              <NavLink href="#commission-system">Commission Rates</NavLink>
              <NavLink href="#webhooks">Webhooks</NavLink>
              <NavLink href="#errors">Error Codes</NavLink>
            </div>
          </nav>

        {/* Main Content */}
        <main ref={mainRef} className="flex-1 min-w-0">
          {/* Overview */}
          <Section id="overview" title="Overview">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Affiliate Payouts on XRPL</h3>
              <p className="text-slate-600 leading-relaxed">
                YesAllofUs pays your affiliates <strong>instantly in RLUSD</strong> when orders complete. 
                No waiting 30 days. No payment processing. Just instant, automatic commissions settled in 3-5 seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl mb-3">⚡</div>
                <h4 className="font-semibold text-slate-900 mb-1">3-5 Second Settlement</h4>
                <p className="text-sm text-slate-600">Affiliates see RLUSD in their wallet seconds after purchase.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-3">💰</div>
                <h4 className="font-semibold text-slate-900 mb-1">5-Level MLM</h4>
                <p className="text-sm text-slate-600">Affiliates earn on their referrals&apos; referrals. Configurable rates.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-3">🔒</div>
                <h4 className="font-semibold text-slate-900 mb-1">Non-Custodial</h4>
                <p className="text-sm text-slate-600">You control your wallet. We never hold your funds or private keys.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl mb-3">🌍</div>
                <h4 className="font-semibold text-slate-900 mb-1">Global Reach</h4>
                <p className="text-sm text-slate-600">Pay anyone, anywhere. No bank account needed. $1 minimum.</p>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">Choose Your Integration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#wordpress" className="p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:border-emerald-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded">ZERO CODE</span>
                </div>
                <h4 className="font-semibold text-slate-900">WordPress / WooCommerce</h4>
                <p className="text-sm text-slate-600 mt-1">Install plugin, connect wallet. Done.</p>
              </a>
              <a href="#backend-integration" className="p-4 border border-slate-200 rounded-xl hover:border-slate-400 transition-colors">
                <h4 className="font-semibold text-slate-900">Any Platform (API)</h4>
                <p className="text-sm text-slate-600 mt-1">SDK tracks referrals, your backend triggers payouts.</p>
              </a>
            </div>
          </Section>

          {/* Quick Start */}
          <Section id="quick-start" title="Quick Start">
            <Step number={1} title="Register Your Store">
              <p className="mb-3">Run the CLI tool - no installation required:</p>
              <CodeBlock title="Terminal">npx yesallofus</CodeBlock>
              <p className="text-sm text-slate-500">Follow the prompts. You&apos;ll get a dashboard URL and API credentials.</p>
            </Step>

            <Step number={2} title="Connect Your Wallet">
              <p className="mb-3">Open your dashboard link and connect with Xaman (mobile) or Crossmark (browser).</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Required:</strong> Your wallet needs an RLUSD trustline. 
                  Issuer: <code className="bg-amber-100 px-1 rounded">rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De</code>
                </p>
              </div>
            </Step>

            <Step number={3} title="Integrate">
              <p className="mb-3">Choose your integration method:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">WordPress</h4>
                  <p className="text-sm text-slate-600">Install plugin → enter credentials → done</p>
                  <a href="#wordpress" className="text-sm text-blue-600 hover:underline">See WordPress guide →</a>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Custom Platform</h4>
                  <p className="text-sm text-slate-600">Add SDK → call API on payment success</p>
                  <a href="#backend-integration" className="text-sm text-blue-600 hover:underline">See API integration →</a>
                </div>
              </div>
            </Step>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-8">
              <h4 className="font-semibold text-emerald-900 mb-2">✓ That&apos;s It!</h4>
              <p className="text-emerald-800">
                Visitors with <code className="bg-emerald-100 px-1 rounded">?ref=CODE</code> are tracked automatically. 
                When they purchase, their referrer gets paid instantly in RLUSD.
              </p>
            </div>
          </Section>

          {/* WordPress */}
          <Section id="wordpress" title="WordPress / WooCommerce">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-emerald-800 font-medium">Zero code required. The plugin handles everything automatically.</p>
            </div>

            <Step number={1} title="Download & Install">
              <p className="mb-3">Download from your dashboard or directly:</p>
              <CodeBlock>https://yesallofus.com/plugin/YesAllofUs.zip</CodeBlock>
              <p className="text-sm text-slate-500 mt-2">Upload via WordPress Admin → Plugins → Add New → Upload Plugin</p>
            </Step>

            <Step number={2} title="Enter API Credentials">
              <p>Go to <strong>YesAllofUs → Settings</strong> and enter your <code>api_secret</code> from the CLI registration.</p>
            </Step>

            <Step number={3} title="Connect Wallet">
              <p>Click &quot;Connect Xaman&quot; or &quot;Connect Crossmark&quot; to link your payout wallet.</p>
            </Step>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">How It Works</h3>
            <ol className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Visitor arrives via <code className="bg-slate-100 px-1 rounded">yourstore.com/?ref=ABC123</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>Plugin stores <code className="bg-slate-100 px-1 rounded">ABC123</code> in a 30-day cookie</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Visitor makes purchase, order status becomes &quot;Completed&quot;</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span>Plugin calls YesAllofUs API with order details + referral code</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">5</span>
                <span>Affiliate chain gets paid instantly in RLUSD (3-5 seconds)</span>
              </li>
            </ol>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">Shortcodes</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-4">
                <code className="text-blue-600 font-mono text-sm">[yesallofus_affiliate_signup]</code>
                <span className="text-slate-600 text-sm">Affiliate registration form</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-4">
                <code className="text-blue-600 font-mono text-sm">[yesallofus_affiliate_dashboard]</code>
                <span className="text-slate-600 text-sm">Affiliate stats & referral link</span>
              </div>
            </div>
          </Section>

          {/* SDK Tracking */}
          <Section id="sdk-tracking" title="SDK Tracking">
            <p className="text-slate-600 mb-6">
              The SDK tracks referral codes only. Payouts are triggered securely from your backend. 
              This is the recommended approach for non-WordPress platforms.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Add the Tracking Script</h3>
            <Tabs tabs={[
              {
                id: 'html',
                label: 'HTML',
                content: (
                  <CodeBlock title="Add before </body>">{`<script src="https://yesallofus.com/js/track.js"></script>`}</CodeBlock>
                )
              },
              {
                id: 'nextjs',
                label: 'Next.js',
                content: (
                  <CodeBlock title="app/layout.tsx">{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script 
          src="https://yesallofus.com/js/track.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`}</CodeBlock>
                )
              },
              {
                id: 'react',
                label: 'React',
                content: (
                  <CodeBlock title="index.html or useEffect">{`// Option 1: Add to public/index.html
<script src="https://yesallofus.com/js/track.js"></script>

// Option 2: Load dynamically
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://yesallofus.com/js/track.js';
  document.body.appendChild(script);
}, []);`}</CodeBlock>
                )
              }
            ]} />

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">Read the Referral Code</h3>
            <CodeBlock title="At checkout / payment">{`// Get the tracked referral code
const referralCode = window.YesAllofUs?.getReferralCode();

// Send to your backend with the order
fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cart.items,
    total: cart.total,
    referral_code: referralCode  // Include this!
  })
});`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">What the SDK Does</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Captures <code className="bg-slate-100 px-1 rounded">?ref=CODE</code> from URL</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Stores in cookie for 30 days</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Falls back to sessionStorage</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Exposes <code className="bg-slate-100 px-1 rounded">YesAllofUs.getReferralCode()</code></li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-blue-900 mb-1">Security Note</h4>
              <p className="text-sm text-blue-800">
                The SDK does <strong>not</strong> trigger payouts. That happens securely from your backend 
                using your API secret. See <a href="#backend-integration" className="underline">Backend Integration</a>.
              </p>
            </div>
          </Section>

          {/* Backend Integration */}
          <Section id="backend-integration" title="Backend Integration">
            <p className="text-slate-600 mb-6">
              After payment is verified on your backend, call the YesAllofUs API to trigger affiliate payouts.
              This ensures payouts only happen for legitimate purchases.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Trigger Payout After Payment</h3>
            <Tabs tabs={[
              {
                id: 'node',
                label: 'Node.js',
                content: (
                  <CodeBlock title="After payment verification">{`// Your payment success handler
async function handlePaymentSuccess(order, referralCode) {
  // Only trigger if there's a referral
  if (!referralCode) return;
  
  const response = await fetch('https://api.dltpays.com/api/v1/payout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk_your_api_secret'
    },
    body: JSON.stringify({
      order_id: order.id,
      order_total: order.total,
      referral_code: referralCode
    })
  });

  const result = await response.json();
  // { success: true, payout_id: "payout_abc123", status: "queued" }
}`}</CodeBlock>
                )
              },
              {
                id: 'python',
                label: 'Python',
                content: (
                  <CodeBlock title="After payment verification">{`import requests

def handle_payment_success(order, referral_code):
    if not referral_code:
        return
    
    response = requests.post(
        'https://api.dltpays.com/api/v1/payout',
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk_your_api_secret'
        },
        json={
            'order_id': order['id'],
            'order_total': order['total'],
            'referral_code': referral_code
        }
    )
    
    result = response.json()
    # { "success": True, "payout_id": "payout_abc123", "status": "queued" }`}</CodeBlock>
                )
              },
              {
                id: 'php',
                label: 'PHP',
                content: (
                  <CodeBlock title="After payment verification">{`<?php
function handle_payment_success($order, $referral_code) {
    if (empty($referral_code)) return;
    
    $ch = curl_init('https://api.dltpays.com/api/v1/payout');
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer sk_your_api_secret'
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'order_id' => $order['id'],
            'order_total' => $order['total'],
            'referral_code' => $referral_code
        ])
    ]);
    
    $response = curl_exec($ch);
    $result = json_decode($response, true);
    // ["success" => true, "payout_id" => "payout_abc123"]
}`}</CodeBlock>
                )
              }
            ]} />

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-emerald-900 mb-1">What Happens Next?</h4>
              <p className="text-sm text-emerald-800">
                <strong>Manual mode (Xaman):</strong> You receive a push notification to approve.<br/>
                <strong>Auto mode (Crossmark):</strong> Payout processes instantly, no approval needed.
              </p>
            </div>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">Complete Flow Diagram</h3>
            <div className="bg-slate-50 rounded-lg p-6 font-mono text-sm">
              <pre className="text-slate-700 whitespace-pre-wrap">{`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Visitor    │     │  Your Site   │     │  YesAllofUs  │
│   Browser    │     │   Backend    │     │     API      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  ?ref=ABC123       │                    │
       │───────────────────>│                    │
       │                    │                    │
       │  SDK stores cookie │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  Checkout + pay    │                    │
       │───────────────────>│                    │
       │                    │                    │
       │                    │  POST /payout      │
       │                    │  + referral_code   │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  { payout_id }     │
       │                    │<───────────────────│
       │                    │                    │
       │                    │    ┌───────────────┴──────────────┐
       │                    │    │  Affiliate receives RLUSD    │
       │                    │    │  in 3-5 seconds              │
       │                    │    └──────────────────────────────┘`}</pre>
            </div>
          </Section>

          {/* Wallet Setup */}
          <Section id="wallet-setup" title="Wallet Setup: Xaman & Crossmark">
            <p className="text-slate-600 mb-6">
              Connect your XRPL wallet to pay affiliates. Choose based on your preference:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-slate-900 font-bold">X</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Xaman (Mobile)</h4>
                    <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">✓ Live</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Approve each payout via push notification on your phone.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>✓ Push notifications for each payout</li>
                  <li>✓ Review before signing</li>
                  <li>✓ Maximum control</li>
                </ul>
              </div>
              <div className="p-6 border-2 border-slate-200 bg-slate-50 rounded-xl opacity-60">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 bg-slate-400 rounded-lg flex items-center justify-center text-white font-bold">C</div>
    <div>
      <h4 className="font-semibold text-slate-900">Crossmark (Browser)</h4>
      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Automatic payouts without approval. Fastest option.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>✓ Instant, automatic payouts</li>
                  <li>✓ No manual approval needed</li>
                  <li>✓ Configurable daily limits</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚠️ RLUSD Trustline Required</h4>
              <p className="text-sm text-amber-800 mb-2">
                Your wallet must have an RLUSD trustline to send commissions. Add trustline to:
              </p>
              <code className="block bg-amber-100 px-3 py-2 rounded text-sm font-mono text-amber-900">
                rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De
              </code>
            </div>
          </Section>

          {/* Web3Auth Social Login */}
          <Section id="web3auth" title="Social Login (Web3Auth)">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-8 border border-slate-200 opacity-60">
  <div className="flex items-center gap-3 mb-3">
    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">Coming Soon</span>
                <h3 className="text-xl font-semibold text-slate-900">No Wallet? No Problem.</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Affiliates can sign up with Google, Apple, Facebook, X, Discord, or GitHub. 
                We create a real XRPL wallet for them automatically using Web3Auth&apos;s Multi-Party Computation (MPC) technology.
              </p>
            </div>

            <h3 className="font-semibold text-slate-900 mb-4">How It Works</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">1</div>
                  <div>
                    <div className="font-medium text-slate-900">Affiliate clicks &quot;Sign Up&quot;</div>
                    <div className="text-sm text-slate-500">Chooses their preferred social provider</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">2</div>
                  <div>
                    <div className="font-medium text-slate-900">Web3Auth creates MPC wallet</div>
                    <div className="text-sm text-slate-500">Private key split across distributed nodes</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">3</div>
                  <div>
                    <div className="font-medium text-slate-900">Real XRPL address generated</div>
                    <div className="text-sm text-slate-500">Native <code className="bg-slate-100 px-1 rounded">r...</code> address, not a wrapper</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">4</div>
                  <div>
                    <div className="font-medium text-slate-900">Automatic SignerList setup</div>
                    <div className="text-sm text-slate-500">Enables 24/7 payouts without browser session</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-3">Supported Providers</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">Google</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">Apple</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">Facebook</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">X</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">Discord</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-[#24292e] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">GitHub</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-[#9146FF] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500">Twitch</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-slate-600 text-xs font-bold">+5</span>
                    </div>
                    <span className="text-xs text-slate-500">More</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-4">Multi-Party Computation (MPC) Security</h3>
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <p className="text-slate-600 mb-4">
                Web3Auth uses MPC to split private keys across multiple nodes. The full key is <strong>never</strong> assembled 
                in one place — it&apos;s reconstructed momentarily only when signing transactions.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-slate-900">No single point of failure</div>
                    <div className="text-sm text-slate-500">Compromising one node doesn&apos;t expose the key</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-slate-900">Non-custodial</div>
                    <div className="text-sm text-slate-500">YesAllofUs never has access to full private keys</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-slate-900">Social recovery</div>
                    <div className="text-sm text-slate-500">Lost access? Re-authenticate with same social account</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <div>
                    <div className="flex items-start gap-3">
  <span className="text-emerald-500 mt-0.5">✓</span>
  <div>
    <div className="font-medium text-slate-900">Upgrade anytime</div>
    <div className="text-sm text-slate-500">Switch to Xaman or Crossmark from your dashboard</div>
  </div>
</div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-4">Pending Commissions System</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <p className="text-slate-700 mb-4">
                New XRPL wallets need ~1 XRP to activate. Until then, commissions are held in a <strong>pending balance</strong>.
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-xs">1</div>
                  <span className="text-slate-600">Affiliate earns commission → stored in pending balance</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-xs">2</div>
                  <span className="text-slate-600">When pending ≥ 1 XRP → The Ledger completes wallet activation</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-xs">3</div>
                  <span className="text-slate-600">RLUSD trustline auto-added → pending balance released</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-xs">4</div>
                  <span className="text-slate-600">Future commissions paid instantly</span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-4">24/7 Auto-Sign via SignerList</h3>
            <p className="text-slate-600 mb-4">
              Social login wallets automatically add our platform as an authorized signer. This enables instant payouts 
              without requiring the affiliate to be logged in.
            </p>
            <CodeBlock title="SignerList Configuration">{`// Automatically configured on wallet creation
{
  "TransactionType": "SignerListSet",
  "SignerQuorum": 1,
  "SignerEntries": [
    {
      "SignerEntry": {
        "Account": "rQsRwh841n8DDwx4Bs2KZ4fHPKSt7VeULH",  // YesAllofUs platform
        "SignerWeight": 1
      }
    }
  ]
}`}</CodeBlock>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>User control:</strong> Affiliates can revoke auto-sign permissions anytime from their dashboard, 
                or export their private key to manage the wallet directly in Xaman.
              </p>
            </div>
          </Section>

          {/* Payout Modes */}
          <Section id="payout-modes" title="Payout Modes">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Feature</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Manual (Xaman)</th>
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">Auto-Sign (Crossmark) <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">Soon</span></th>
<th className="px-4 py-3 text-left text-slate-400 font-semibold">Social Login <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">Soon</span></th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Approval</td>
                    <td className="px-4 py-3">Push notification each time</td>
                    <td className="px-4 py-3">None - instant</td>
                    <td className="px-4 py-3">None - instant</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Speed</td>
                    <td className="px-4 py-3">Depends on your approval</td>
                    <td className="px-4 py-3">~3-5 seconds</td>
                    <td className="px-4 py-3">~3-5 seconds</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Crypto Knowledge</td>
                    <td className="px-4 py-3">Basic (seed phrase)</td>
                    <td className="px-4 py-3">Intermediate</td>
                    <td className="px-4 py-3">None required</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Key Storage</td>
                    <td className="px-4 py-3">Your device only</td>
                    <td className="px-4 py-3">Your device only</td>
                    <td className="px-4 py-3">MPC (distributed)</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Best For</td>
                    <td className="px-4 py-3">Security-conscious users</td>
                    <td className="px-4 py-3">High volume, hands-off</td>
                    <td className="px-4 py-3">Beginners, mass onboarding</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">Auto-Sign Security</h3>
            <p className="text-slate-600 mb-4">
              Auto-sign uses XRPL&apos;s native SignerList feature. You add our platform as an authorized signer 
              with configurable limits. You can revoke anytime from your dashboard.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>Platform Signer Address:</strong><br/>
                <code className="text-blue-600">rQsRwh841n8DDwx4Bs2KZ4fHPKSt7VeULH</code>
              </p>
            </div>
          </Section>

          {/* API Reference - Payouts */}
          <Section id="api-payouts" title="API: Payouts">
            <div className="bg-slate-800 text-slate-100 rounded-lg p-4 mb-6 font-mono text-sm">
              Base URL: <span className="text-emerald-400">https://api.dltpays.com/api/v1</span>
            </div>

            <Endpoint method="POST" path="/payout" auth description="Trigger affiliate payout for an order. This is the primary endpoint for backend integrations.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/payout
Authorization: Bearer sk_your_api_secret
Content-Type: application/json

{
  "order_id": "order_12345",
  "order_total": 99.99,
  "referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response (201 Created)</h5>
              <CodeBlock>{`{
  "success": true,
  "payout_id": "payout_abc123def456",
  "payments_count": 3,
  "status": "queued"
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-600">
                <strong>Status flow:</strong> queued → processing → paid (or failed)
              </div>
            </Endpoint>

            <Endpoint method="POST" path="/intent" auth description="Generate a signed intent token for secure SDK usage. Token expires in 5 minutes.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/intent
Authorization: Bearer sk_your_api_secret
Content-Type: application/json

{
  "order_id": "order_12345",
  "amount": 99.99
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 300
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                Intent tokens allow auto-sign stores to accept SDK-triggered payouts securely. 
                The token contains the order details signed by your API secret.
              </div>
            </Endpoint>

            <Endpoint method="POST" path="/payout/:id/approve" auth description="Manually approve a pending payout. Only needed if payout is in pending_manual status.">
              <CodeBlock>{`POST /api/v1/payout/payout_abc123/approve
Authorization: Bearer sk_your_api_secret`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* API Reference - Affiliates */}
          <Section id="api-affiliates" title="API: Affiliates">
            <Endpoint method="POST" path="/affiliate/register" auth description="Register a new affiliate for your store. Requires API authentication.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/affiliate/register
Authorization: Bearer sk_your_api_secret
Content-Type: application/json

{
  "wallet": "rAffiliateWallet123...",
  "parent_referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response (201 Created)</h5>
              <CodeBlock>{`{
  "success": true,
  "affiliate_id": "aff_xyz789",
  "referral_code": "DEF456",
  "level": 2
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/affiliate/register-public" description="Public affiliate registration. No auth required - for affiliate signup forms.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/affiliate/register-public
Content-Type: application/json

{
  "store_id": "store_abc123",
  "wallet": "rAffiliateWallet123...",
  "parent_referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "affiliate_id": "aff_xyz789",
  "referral_code": "DEF456",
  "referral_link": "https://yourstore.com?ref=DEF456",
  "level": 2
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Requirement:</strong> Wallet must have an RLUSD trustline before registration.
              </div>
            </Endpoint>

            <Endpoint method="GET" path="/affiliate/dashboard/:wallet" description="Get affiliate earnings across all stores they're registered with.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "wallet": "rAffiliateWallet123...",
  "total_earned": 250.00,
  "stores": [
    {
      "store_id": "store_abc123",
      "store_name": "Example Store",
      "referral_code": "DEF456",
      "referral_link": "https://example.com?ref=DEF456",
      "total_earned": 250.00,
      "level": 2
    }
  ],
  "recent_payouts": [
    {
      "store_name": "Example Store",
      "order_id": "order_123",
      "amount": 25.00,
      "tx_hash": "ABC123...",
      "paid_at": "2025-01-15T10:30:00Z"
    }
  ]
}`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* API Reference - Stores */}
          <Section id="api-stores" title="API: Stores">
            <Endpoint method="POST" path="/store/register" description="Register a new store. Returns API credentials. Usually done via CLI.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/store/register
Content-Type: application/json

{
  "store_name": "My Store",
  "store_url": "https://mystore.com",
  "email": "admin@mystore.com",
  "commission_rates": [25, 5, 3, 2, 1],
  "referred_by_store": "A1B2C3D4"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response (201 Created)</h5>
              <CodeBlock>{`{
  "success": true,
  "store_id": "store_abc123def456",
  "api_key": "pk_abc123def456",
  "api_secret": "sk_xyz789ghi012",
  "store_referral_code": "A1B2C3D4",
  "claim_token": "abc123..."
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <strong>Important:</strong> Save the <code>api_secret</code> immediately. It cannot be retrieved later.
              </div>
            </Endpoint>

            <Endpoint method="GET" path="/store/stats" auth description="Get store statistics including affiliate count and total paid.">
              <CodeBlock>{`GET /api/v1/store/stats
Authorization: Bearer sk_your_api_secret

{
  "store_id": "store_abc123",
  "store_name": "My Store",
  "status": "active",
  "xaman_connected": true,
  "push_enabled": true,
  "wallet_address": "rWallet123...",
  "payout_mode": "auto",
  "auto_signing_enabled": true,
  "affiliates_count": 42,
  "total_paid": 1234.56,
  "daily_paid": 89.00,
  "daily_limit": 1000
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/store/settings" description="Update store settings including commission rates and limits.">
              <CodeBlock>{`POST /api/v1/store/settings
Content-Type: application/json

{
  "store_id": "store_abc123",
  "wallet_address": "rWallet123...",
  "commission_rates": [20, 5, 3, 2, 1],
  "daily_limit": 2000,
  "auto_sign_max_single_payout": 200
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/store/:store_id/affiliates" description="Get all affiliates for a store. Requires wallet verification.">
              <CodeBlock>{`GET /api/v1/store/store_abc123/affiliates?wallet=rWallet123...

{
  "success": true,
  "affiliates": [
    {
      "affiliate_id": "aff_xyz",
      "wallet": "rAffiliate...",
      "referral_code": "ABC123",
      "total_earned": 150.00,
      "level": 1,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/store/:store_id/payouts" description="Get payment history for a store. Requires wallet verification.">
              <CodeBlock>{`GET /api/v1/store/store_abc123/payouts?wallet=rWallet123...

{
  "success": true,
  "payouts": [
    {
      "payout_id": "payout_abc",
      "order_id": "order_123",
      "order_total": 100.00,
      "payments": [...],
      "tx_hashes": [...],
      "paid_at": "2025-01-15T10:30:00Z",
      "auto_signed": true
    }
  ]
}`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* Commission System */}
          <Section id="commission-system" title="Commission Rates">
            <h3 className="font-semibold text-slate-900 mb-3">Affiliate Commissions (Default)</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Level</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Rate</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Example ($100 order)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2">Level 1 (Direct referrer)</td>
                    <td className="px-4 py-2 font-mono">25%</td>
                    <td className="px-4 py-2 font-mono">$25.00</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2">Level 2</td>
                    <td className="px-4 py-2 font-mono">5%</td>
                    <td className="px-4 py-2 font-mono">$5.00</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2">Level 3</td>
                    <td className="px-4 py-2 font-mono">3%</td>
                    <td className="px-4 py-2 font-mono">$3.00</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2">Level 4</td>
                    <td className="px-4 py-2 font-mono">2%</td>
                    <td className="px-4 py-2 font-mono">$2.00</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2">Level 5</td>
                    <td className="px-4 py-2 font-mono">1%</td>
                    <td className="px-4 py-2 font-mono">$1.00</td>
                  </tr>
                  <tr className="border-t border-slate-200 bg-emerald-50">
                    <td className="px-4 py-2 font-semibold">Total</td>
                    <td className="px-4 py-2 font-mono font-semibold">36%</td>
                    <td className="px-4 py-2 font-mono font-semibold">$36.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mb-8">Rates are configurable in your dashboard. Total cannot exceed 100%.</p>

            <h3 className="font-semibold text-slate-900 mb-3">Platform Fee</h3>
            <p className="text-slate-600 mb-4">Fee is calculated on <strong>commissions paid</strong>, not order total.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Tier</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Fee Rate</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-900 font-medium">Free</td>
                    <td className="px-4 py-2 font-mono">2.9%</td>
                    <td className="px-4 py-2">$0</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 text-slate-900 font-medium">Pro</td>
                    <td className="px-4 py-2 font-mono">0.9%</td>
                    <td className="px-4 py-2">$99</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-900 font-medium">Enterprise</td>
                    <td className="px-4 py-2 font-mono">0%</td>
                    <td className="px-4 py-2">$499</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Referred stores get 50% fee discount in their first month (1.45% instead of 2.9%).
            </p>
          </Section>

          {/* Webhooks */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-slate-600 mb-4">
              Receive notifications when payout status changes. For WordPress, the plugin handles this automatically.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Webhook Payload</h3>
            <CodeBlock>{`POST https://yoursite.com/webhooks/yesallofus
X-DLTPays-Signature: abc123...
Content-Type: application/json

{
  "payout_id": "payout_abc123",
  "status": "paid",
  "order_id": "order_12345",
  "tx_hashes": [
    {
      "wallet": "rAffiliate...",
      "amount": 25.00,
      "tx_hash": "ABC123DEF456..."
    }
  ]
}`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Verify Signature</h3>
            <CodeBlock title="Node.js">{`const crypto = require('crypto');

function verifyWebhook(payload, signature, apiSecret) {
  const expected = crypto
    .createHmac('sha256', apiSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</CodeBlock>
          </Section>

          {/* Error Codes */}
          <Section id="errors" title="Error Codes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Code</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Meaning</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Solution</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono">400</td>
                    <td className="px-4 py-2">Bad Request</td>
                    <td className="px-4 py-2">Check required fields and formats</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-mono">401</td>
                    <td className="px-4 py-2">Unauthorized</td>
                    <td className="px-4 py-2">Check API secret in Authorization header</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono">403</td>
                    <td className="px-4 py-2">Forbidden</td>
                    <td className="px-4 py-2">Wallet mismatch or auto-sign blocked</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-mono">404</td>
                    <td className="px-4 py-2">Not Found</td>
                    <td className="px-4 py-2">Store, affiliate, or referral code doesn&apos;t exist</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono">409</td>
                    <td className="px-4 py-2">Conflict</td>
                    <td className="px-4 py-2">Order already processed (idempotent - this is OK)</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-mono">429</td>
                    <td className="px-4 py-2">Rate Limited</td>
                    <td className="px-4 py-2">Slow down (60/min per IP, 10/min per store)</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono">503</td>
                    <td className="px-4 py-2">Service Unavailable</td>
                    <td className="px-4 py-2">Beta full or service maintenance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Support */}
          <Section id="support" title="Support">
            <div className="grid md:grid-cols-2 gap-6">
              <a href="mailto:mark@yesallofus.com" className="p-6 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                <div className="text-2xl mb-2">📧</div>
                <h4 className="font-semibold text-slate-900">Email Support</h4>
                <p className="text-sm text-slate-600 mt-1">mark@yesallofus.com</p>
              </a>
              <a href="https://twitter.com/YesAllofUs" className="p-6 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
                <div className="text-2xl mb-2">𝕏</div>
                <h4 className="font-semibold text-slate-900">Twitter</h4>
                <p className="text-sm text-slate-600 mt-1">@YesAllofUs</p>
              </a>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}