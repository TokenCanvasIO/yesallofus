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
        {auth && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Auth</span>}
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
              <a href="#quick-start" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Quick Start (5 min)</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <a href="#integration-simple" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Simple (SDK)</a>
              <a href="#integration-full" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Full (API)</a>
              <a href="#wordpress" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">WordPress Plugin</a>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dashboard</h3>
              <a href="#wallet-setup" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Wallet Setup</a>
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
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Getting Started</h3>
              <NavLink href="#overview">Overview</NavLink>
              <NavLink href="#quick-start">Quick Start (5 min)</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <NavLink href="#integration-simple">Simple (SDK)</NavLink>
              <NavLink href="#integration-full">Full (API)</NavLink>
              <NavLink href="#wordpress">WordPress Plugin</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dashboard</h3>
              <NavLink href="#wallet-setup">Wallet Setup</NavLink>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Overview */}
          <Section id="overview" title="Overview">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Affiliate Payouts on XRPL</h3>
              <p className="text-slate-600 leading-relaxed">
                YesAllofUs pays your affiliates <strong>instantly in RLUSD</strong> when orders complete. 
                No waiting 30 days. No payment processing. Just instant, automatic commissions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl mb-3">⚡</div>
                <h4 className="font-semibold text-slate-900 mb-1">Simple Integration</h4>
                <p className="text-sm text-slate-600">Add one script tag. That&apos;s it. Works with any platform.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-3">💰</div>
                <h4 className="font-semibold text-slate-900 mb-1">5-Level MLM</h4>
                <p className="text-sm text-slate-600">Affiliates earn on their referrals&apos; referrals. Configurable rates.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-3">🔒</div>
                <h4 className="font-semibold text-slate-900 mb-1">Non-Custodial</h4>
                <p className="text-sm text-slate-600">You control your wallet. We never hold your funds.</p>
              </div>
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl mb-3">📊</div>
                <h4 className="font-semibold text-slate-900 mb-1">Real-Time Dashboard</h4>
                <p className="text-sm text-slate-600">Track affiliates, payouts, and earnings live.</p>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">Choose Your Integration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#integration-simple" className="p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:border-emerald-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded">RECOMMENDED</span>
                </div>
                <h4 className="font-semibold text-slate-900">Simple Integration (SDK)</h4>
                <p className="text-sm text-slate-600 mt-1">One script tag. No backend changes. 5 minutes.</p>
              </a>
              <a href="#integration-full" className="p-4 border border-slate-200 rounded-xl hover:border-slate-400 transition-colors">
                <h4 className="font-semibold text-slate-900">Full Integration (API)</h4>
                <p className="text-sm text-slate-600 mt-1">Backend integration. Auto-sign support. Full control.</p>
              </a>
            </div>
          </Section>

          {/* Quick Start */}
          <Section id="quick-start" title="Quick Start (5 minutes)">
            <Step number={1} title="Register Your Store">
              <p className="mb-3">Run the CLI tool - no installation required:</p>
              <CodeBlock title="Terminal">npx yesallofus</CodeBlock>
              <p className="text-sm text-slate-500">Follow the prompts. You&apos;ll get a dashboard link and API credentials.</p>
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

            <Step number={3} title="Add the SDK">
              <p className="mb-3">Add this script to your website (before <code>&lt;/body&gt;</code>):</p>
              <CodeBlock title="HTML">{`<script src="https://cdn.yesallofus.com/track.js" 
        data-store="YOUR_STORE_ID">
</script>`}</CodeBlock>
              <p className="text-sm text-slate-500">Replace <code>YOUR_STORE_ID</code> with your store ID from the dashboard.</p>
            </Step>

            <Step number={4} title="Trigger Payouts">
              <p className="mb-3">When an order completes, call the payout:</p>
              <CodeBlock title="JavaScript (Frontend)">{`// After successful payment
YesAllofUs.payout({
  order_id: "order_12345",
  order_total: 99.99
});`}</CodeBlock>
              <p className="text-sm text-slate-500">That&apos;s it! Affiliates get paid instantly in RLUSD.</p>
            </Step>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-8">
              <h4 className="font-semibold text-emerald-900 mb-2">✓ You&apos;re Done!</h4>
              <p className="text-emerald-800">
                Visitors with <code className="bg-emerald-100 px-1 rounded">?ref=CODE</code> are tracked automatically. 
                When they purchase, their referrer gets paid instantly.
              </p>
            </div>
          </Section>

          {/* Simple Integration */}
          <Section id="integration-simple" title="Simple Integration (SDK)">
            <p className="text-slate-600 mb-6">
              The SDK handles everything: referral tracking, cookie storage, and payout triggers. 
              No backend changes required.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">1. Add the Script</h3>
            <CodeBlock title="HTML">{`<!-- Add before </body> -->
<script src="https://cdn.yesallofus.com/track.js" 
        data-store="YOUR_STORE_ID">
</script>`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">2. Trigger Payout on Order Complete</h3>
            <Tabs tabs={[
              {
                id: 'js',
                label: 'JavaScript',
                content: (
                  <CodeBlock title="JavaScript">{`// Call this after successful payment
YesAllofUs.payout({
  order_id: "order_12345",      // Your unique order ID
  order_total: 99.99            // Order total in USD
});`}</CodeBlock>
                )
              },
              {
                id: 'react',
                label: 'React',
                content: (
                  <CodeBlock title="React">{`// In your success handler
const handlePaymentSuccess = (order) => {
  window.YesAllofUs?.payout({
    order_id: order.id,
    order_total: order.total
  });
};`}</CodeBlock>
                )
              },
              {
                id: 'nextjs',
                label: 'Next.js',
                content: (
                  <>
                    <CodeBlock title="app/layout.tsx">{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script 
          src="https://cdn.yesallofus.com/track.js"
          data-store="YOUR_STORE_ID"
        />
      </body>
    </html>
  );
}`}</CodeBlock>
                    <CodeBlock title="Payment Success Handler">{`// After payment completes
(window as any).YesAllofUs?.payout({
  order_id: order.id,
  order_total: order.total
});`}</CodeBlock>
                  </>
                )
              }
            ]} />

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">How It Works</h3>
            <ol className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Visitor arrives via <code className="bg-slate-100 px-1 rounded">yoursite.com/?ref=ABC123</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>SDK saves <code className="bg-slate-100 px-1 rounded">ABC123</code> to sessionStorage (persists during visit)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Visitor makes a purchase, you call <code className="bg-slate-100 px-1 rounded">YesAllofUs.payout()</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span>SDK sends order + ref code to YesAllofUs API</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">5</span>
                <span>Affiliate chain gets paid instantly in RLUSD</span>
              </li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-blue-900 mb-1">SDK Limitations</h4>
              <p className="text-sm text-blue-800">
                SDK integration uses the <strong>public endpoint</strong> which requires <strong>manual payout mode</strong> (Xaman). 
                For auto-sign (Crossmark), use the <a href="#integration-full" className="underline">Full API Integration</a>.
              </p>
            </div>
          </Section>

          {/* Full Integration */}
          <Section id="integration-full" title="Full Integration (API)">
            <p className="text-slate-600 mb-6">
              Backend integration gives you full control and supports auto-sign mode for instant, 
              approval-free payouts.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">1. Frontend: Capture Referral Code</h3>
            <CodeBlock title="JavaScript (add to your site)">{`// On page load - capture ref code from URL
const ref = new URLSearchParams(window.location.search).get('ref');
if (ref) {
  sessionStorage.setItem('_yesallofus_ref', ref);
}`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">2. Frontend: Send Ref Code with Order</h3>
            <CodeBlock title="JavaScript (in your checkout)">{`// When submitting order to your backend
const orderData = {
  items: cart.items,
  total: cart.total,
  // Include the referral code
  referral_code: sessionStorage.getItem('_yesallofus_ref') || null
};

fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify(orderData)
});`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-8 mb-3">3. Backend: Trigger Payout</h3>
            <Tabs tabs={[
              {
                id: 'node',
                label: 'Node.js',
                content: (
                  <CodeBlock title="Node.js">{`// After payment is verified
const response = await fetch('https://api.dltpays.com/api/v1/payout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_your_api_secret'  // From dashboard
  },
  body: JSON.stringify({
    order_id: order.id,
    order_total: order.total,
    referral_code: order.referral_code  // From frontend
  })
});

const result = await response.json();
// { success: true, payout_id: "payout_abc123", status: "queued" }`}</CodeBlock>
                )
              },
              {
                id: 'python',
                label: 'Python',
                content: (
                  <CodeBlock title="Python">{`import requests

# After payment is verified
response = requests.post(
    'https://api.dltpays.com/api/v1/payout',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_your_api_secret'
    },
    json={
        'order_id': order['id'],
        'order_total': order['total'],
        'referral_code': order.get('referral_code')
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
                  <CodeBlock title="PHP">{`<?php
// After payment is verified
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
        'referral_code' => $order['referral_code'] ?? null
    ])
]);

$response = curl_exec($ch);
$result = json_decode($response, true);
// ["success" => true, "payout_id" => "payout_abc123", "status" => "queued"]`}</CodeBlock>
                )
              }
            ]} />

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-emerald-900 mb-1">Auto-Sign Enabled?</h4>
              <p className="text-sm text-emerald-800">
                With auto-sign (Crossmark), payouts process instantly. No approval needed. 
                Without auto-sign (Xaman), you&apos;ll get a push notification to approve.
              </p>
            </div>
          </Section>

          {/* WordPress */}
          <Section id="wordpress" title="WordPress Plugin">
            <p className="text-slate-600 mb-6">
              Zero-code integration for WooCommerce stores. Automatic affiliate tracking and payouts.
            </p>

            <Step number={1} title="Download & Install">
              <p className="mb-3">Download from your dashboard or directly:</p>
              <CodeBlock>https://yesallofus.com/plugin/YesAllofUs.zip</CodeBlock>
              <p className="text-sm text-slate-500 mt-2">Upload via WordPress Admin → Plugins → Add New → Upload Plugin</p>
            </Step>

            <Step number={2} title="Configure">
              <p>Go to <strong>YesAllofUs → Settings</strong> and enter your API credentials from the dashboard.</p>
            </Step>

            <Step number={3} title="Done!">
              <p>The plugin automatically:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span>Tracks <code>?ref=CODE</code> visitors with 30-day cookies</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span>Triggers payouts when orders complete</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span>Shows affiliate signup forms via shortcode</li>
              </ul>
            </Step>

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

          {/* Wallet Setup */}
          <Section id="wallet-setup" title="Wallet Setup">
            <p className="text-slate-600 mb-6">
              Connect your XRPL wallet to pay affiliates. Choose based on your preference:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-10 h-10 rounded-lg" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Xaman (Mobile)</h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Manual Approval</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Approve each payout via push notification. Most secure option.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>✓ Push notifications for each payout</li>
                  <li>✓ Review before signing</li>
                  <li>✓ Works with SDK integration</li>
                </ul>
              </div>
              <div className="p-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-10 h-10 rounded-lg" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Crossmark (Browser)</h4>
                    <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">Auto-Sign</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Automatic payouts without approval. Fastest option.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>✓ Instant, automatic payouts</li>
                  <li>✓ No manual approval needed</li>
                  <li>✓ Requires API integration</li>
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

          {/* Payout Modes */}
          <Section id="payout-modes" title="Payout Modes">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Feature</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Manual (Xaman)</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold">Auto-Sign (Crossmark)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Approval</td>
                    <td className="px-4 py-3">Push notification each time</td>
                    <td className="px-4 py-3">None - instant</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Speed</td>
                    <td className="px-4 py-3">Depends on you</td>
                    <td className="px-4 py-3">~3 seconds</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">SDK Compatible</td>
                    <td className="px-4 py-3 text-emerald-600">✓ Yes</td>
                    <td className="px-4 py-3 text-slate-400">✗ API only</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Daily Limits</td>
                    <td className="px-4 py-3">Unlimited</td>
                    <td className="px-4 py-3">Configurable ($100-$50,000)</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Best For</td>
                    <td className="px-4 py-3">Low volume, maximum control</td>
                    <td className="px-4 py-3">High volume, hands-off</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">Switching Modes</h3>
            <p className="text-slate-600">
              You can switch between modes anytime from the dashboard. Revoking auto-sign takes effect immediately.
            </p>
          </Section>

          {/* API Reference - Payouts */}
          <Section id="api-payouts" title="API: Payouts">
            <Endpoint method="POST" path="/api/v1/payout" auth description="Trigger affiliate payout for an order. Requires API secret.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/payout
Authorization: Bearer sk_your_api_secret
Content-Type: application/json

{
  "order_id": "order_12345",
  "order_total": 99.99,
  "referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "payout_id": "payout_abc123def456",
  "payments_count": 3,
  "status": "queued"
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-600">
                <strong>Status values:</strong> queued → processing → paid (or failed)
              </div>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/payout/public" description="Public payout endpoint for SDK. No auth required. Manual mode only.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request</h5>
              <CodeBlock>{`POST /api/v1/payout/public
Content-Type: application/json

{
  "store_id": "store_abc123",
  "order_id": "order_12345",
  "order_total": 99.99,
  "referral_code": "ABC123"
}`}</CodeBlock>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Note:</strong> This endpoint is blocked for auto-sign stores (security). Use <code>/api/v1/payout</code> with API secret instead.
              </div>
            </Endpoint>
          </Section>

          {/* API Reference - Affiliates */}
          <Section id="api-affiliates" title="API: Affiliates">
            <Endpoint method="POST" path="/api/v1/affiliate/register" auth description="Register a new affiliate for your store.">
              <CodeBlock>{`POST /api/v1/affiliate/register
Authorization: Bearer sk_your_api_secret

{
  "wallet": "rAffiliateWallet123...",
  "parent_referral_code": "ABC123"  // Optional - links to parent
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "affiliate_id": "aff_xyz789",
  "referral_code": "DEF456",
  "referral_link": "https://yourstore.com?ref=DEF456",
  "level": 2
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/affiliate/register-public" description="Public affiliate registration. No auth required.">
              <CodeBlock>{`POST /api/v1/affiliate/register-public

{
  "store_id": "store_abc123",
  "wallet": "rAffiliateWallet123...",
  "parent_referral_code": "ABC123"
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/affiliate/dashboard/:wallet" description="Get affiliate earnings across all stores.">
              <CodeBlock>{`GET /api/v1/affiliate/dashboard/rAffiliateWallet123

{
  "success": true,
  "wallet": "rAffiliateWallet123...",
  "total_earned": 250.00,
  "stores": [
    {
      "store_id": "store_abc123",
      "store_name": "Example Store",
      "referral_code": "DEF456",
      "total_earned": 250.00
    }
  ],
  "recent_payouts": [...]
}`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* API Reference - Stores */}
          <Section id="api-stores" title="API: Stores">
            <Endpoint method="POST" path="/api/v1/store/register" description="Register a new store. Returns API credentials.">
              <CodeBlock>{`POST /api/v1/store/register

{
  "store_name": "My Store",
  "store_url": "https://mystore.com",
  "email": "admin@mystore.com",
  "commission_rates": [25, 5, 3, 2, 1],  // Optional
  "referred_by_store": "A1B2C3D4"        // Optional
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "store_id": "store_abc123def456",
  "api_key": "pk_abc123def456",
  "api_secret": "sk_xyz789ghi012",  // Save this! Not retrievable later
  "store_referral_code": "A1B2C3D4",
  "claim_token": "abc123..."        // Use to connect wallet via dashboard
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/stats" auth description="Get store statistics.">
              <CodeBlock>{`GET /api/v1/store/stats
Authorization: Bearer sk_your_api_secret

{
  "store_id": "store_abc123",
  "store_name": "My Store",
  "wallet_address": "rWallet123...",
  "xaman_connected": true,
  "auto_signing_enabled": false,
  "affiliates_count": 42,
  "total_paid": 1234.56,
  "daily_paid": 89.00,
  "daily_limit": 1000
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/store/regenerate-secret" description="Generate new API secret. Invalidates old one.">
              <CodeBlock>{`POST /api/v1/store/regenerate-secret

{
  "store_id": "store_abc123",
  "wallet_address": "rWallet123..."  // Must match connected wallet
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
                    <td className="px-4 py-2">Level 1 (Direct)</td>
                    <td className="px-4 py-2 font-mono">20%</td>
                    <td className="px-4 py-2 font-mono">$20.00</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2">Level 2</td>
                    <td className="px-4 py-2 font-mono">4%</td>
                    <td className="px-4 py-2 font-mono">$4.00</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2">Level 3</td>
                    <td className="px-4 py-2 font-mono">2%</td>
                    <td className="px-4 py-2 font-mono">$2.00</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2">Level 4</td>
                    <td className="px-4 py-2 font-mono">0%</td>
                    <td className="px-4 py-2 font-mono">$0.00</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2">Level 5</td>
                    <td className="px-4 py-2 font-mono">1%</td>
                    <td className="px-4 py-2 font-mono">$1.00</td>
                  </tr>
                  <tr className="border-t border-slate-200 bg-emerald-50">
                    <td className="px-4 py-2 font-semibold">Total</td>
                    <td className="px-4 py-2 font-mono font-semibold">27%</td>
                    <td className="px-4 py-2 font-mono font-semibold">$27.00</td>
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
          </Section>

          {/* Webhooks */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-slate-600 mb-4">
              Receive notifications when payout status changes. Configure your endpoint in the dashboard.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Payload</h3>
            <CodeBlock>{`POST https://yoursite.com/webhooks/yesallofus
X-YesAllofUs-Signature: sha256=abc123...

{
  "event": "payout.completed",
  "payout_id": "payout_abc123",
  "order_id": "order_12345",
  "status": "paid",
  "payments": [
    {
      "wallet": "rAffiliate...",
      "amount": 20.00,
      "tx_hash": "ABC123..."
    }
  ]
}`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Verify Signature</h3>
            <CodeBlock title="Node.js">{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
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
                    <td className="px-4 py-2 font-mono">401</td>
                    <td className="px-4 py-2">Unauthorized</td>
                    <td className="px-4 py-2">Check API secret in Authorization header</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-mono">404</td>
                    <td className="px-4 py-2">Not Found</td>
                    <td className="px-4 py-2">Store, affiliate, or referral code doesn&apos;t exist</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono">409</td>
                    <td className="px-4 py-2">Conflict</td>
                    <td className="px-4 py-2">Order already processed (idempotent)</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-mono">429</td>
                    <td className="px-4 py-2">Rate Limited</td>
                    <td className="px-4 py-2">Slow down requests (60/min per IP)</td>
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