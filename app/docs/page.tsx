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
              <NavLink href="#quick-start">Quick Start</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <NavLink href="#wordpress">WordPress (Zero Code)</NavLink>
              <NavLink href="#sdk-tracking">SDK Tracking</NavLink>
              <NavLink href="#backend-integration">Backend Integration</NavLink>
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
          <Section id="wallet-setup" title="Wallet Setup">
            <p className="text-slate-600 mb-6">
              Connect your XRPL wallet to pay affiliates. Choose based on your preference:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-slate-900 font-bold">X</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Xaman (Mobile)</h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Manual Approval</span>
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
              <div className="p-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
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
                    <td className="px-4 py-3">Depends on your approval</td>
                    <td className="px-4 py-3">~3-5 seconds</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Max Single Payout</td>
                    <td className="px-4 py-3">Unlimited</td>
                    <td className="px-4 py-3">Configurable ($1-$10,000)</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Daily Limit</td>
                    <td className="px-4 py-3">Unlimited</td>
                    <td className="px-4 py-3">Configurable ($10-$50,000)</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">Best For</td>
                    <td className="px-4 py-3">Low volume, maximum control</td>
                    <td className="px-4 py-3">High volume, hands-off</td>
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