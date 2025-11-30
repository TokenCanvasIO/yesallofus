'use client';

import React, { useState, ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
}

const CodeBlock = ({ children }: CodeBlockProps) => (
  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-700">
    <code>{children}</code>
  </pre>
);

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

export default function DLTPaysDocs() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Getting Started</h3>
              <NavLink href="#overview">Overview</NavLink>
              <NavLink href="#quick-start">Quick Start</NavLink>
              <NavLink href="#authentication">Authentication</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integration</h3>
              <NavLink href="#wordpress">WordPress Plugin</NavLink>
              <NavLink href="#wallets">Wallet Connection</NavLink>
              <NavLink href="#webhooks">Webhooks</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">API Reference</h3>
              <NavLink href="#api-stores">Stores</NavLink>
              <NavLink href="#api-payouts">Payouts</NavLink>
              <NavLink href="#api-affiliates">Affiliates</NavLink>
              <NavLink href="#api-xaman">Xaman</NavLink>
              <NavLink href="#api-autosign">Auto-Sign</NavLink>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Concepts</h3>
              <NavLink href="#commission-system">Commission System</NavLink>
              <NavLink href="#chain-b">Chain B (Store Referrals)</NavLink>
              <NavLink href="#rate-limits">Rate Limits</NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Overview */}
          <Section id="overview" title="Overview">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What is YesAllofUs?</h3>
              <p className="text-slate-600 leading-relaxed">
                YesAllofUs is a <strong>zero-fee affiliate commission platform</strong> built on the XRP Ledger. 
                Pay affiliates instantly in <strong>RLUSD</strong> (Ripple&apos;s stablecoin) with 5-level MLM support, 
                automatic payouts, and WordPress/WooCommerce integration.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-slate-900">Instant Payouts</h4>
                <p className="text-sm text-slate-600">Commissions paid in seconds via XRPL</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-semibold text-slate-900">5-Level MLM</h4>
                <p className="text-sm text-slate-600">Configurable commission rates per level</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">🆓</div>
                <h4 className="font-semibold text-slate-900">2.9% Platform Fee</h4>
                <p className="text-sm text-slate-600">Free tier available, Pro at 0.9%</p>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">How It Works</h3>
            <ol className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span><strong>Register your store</strong> via CLI or API — get API credentials instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span><strong>Connect your wallet</strong> using Xaman (mobile) or Crossmark (browser)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span><strong>Install the plugin</strong> or integrate via API — commissions flow automatically</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span><strong>Affiliates get paid</strong> instantly when orders complete</span>
              </li>
            </ol>
          </Section>

          {/* Quick Start */}
          <Section id="quick-start" title="Quick Start">
            <h3 className="font-semibold text-slate-900 mb-3">Option 1: CLI Tool (Recommended)</h3>
            <p className="text-slate-600 mb-4">The fastest way to get started. No installation required.</p>
            <CodeBlock>npx yesallofus</CodeBlock>
            <p className="text-sm text-slate-500 mt-2 mb-4">Follow the interactive prompts to register and configure your store.</p>
            
            <p className="text-slate-600 mb-4">After registration, you&apos;ll receive a unique dashboard URL to connect your wallet:</p>
            <CodeBlock>https://yesallofus.com/dashboard?claim=YOUR_CLAIM_TOKEN</CodeBlock>
            <p className="text-sm text-slate-500 mt-2 mb-6">Use Chrome or Brave for best experience (required for Crossmark wallet).</p>

            <h3 className="font-semibold text-slate-900 mb-3">Option 2: API Registration</h3>
            <CodeBlock>{`curl -X POST https://api.dltpays.com/api/v1/store/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "store_name": "My Store",
    "store_url": "https://mystore.com",
    "email": "admin@mystore.com"
  }'`}</CodeBlock>
            
            <p className="text-slate-600 mt-4 mb-2">Response:</p>
            <CodeBlock>{`{
  "success": true,
  "store_id": "store_abc123def456",
  "api_key": "pk_abc123def456",
  "api_secret": "sk_xyz789ghi012",
  "store_referral_code": "A1B2C3D4",
  "claim_token": "abc123def456..."
}`}</CodeBlock>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> Save your <code className="bg-amber-100 px-1 rounded">api_secret</code> securely. 
                It cannot be retrieved later and is required for authenticated API calls.
              </p>
            </div>
          </Section>

          {/* Authentication */}
          <Section id="authentication" title="Authentication">
            <p className="text-slate-600 mb-4">
              Authenticated endpoints require a Bearer token using your <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">api_secret</code>:
            </p>
            <CodeBlock>Authorization: Bearer sk_your_api_secret_here</CodeBlock>
            
            <div className="mt-6 p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Authentication Methods</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-600">Bearer Token</td>
                    <td className="py-2 text-slate-600">Most endpoints — uses api_secret</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-600">store_id</td>
                    <td className="py-2 text-slate-600">Public endpoints like wallet connection</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-slate-600">None</td>
                    <td className="py-2 text-slate-600">Health check, referral lookup</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* WordPress */}
          <Section id="wordpress" title="WordPress Plugin">
            <p className="text-slate-600 mb-4">
              The YesAllofUs WordPress plugin provides seamless WooCommerce integration with automatic affiliate tracking and commission payouts.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Installation</h3>
            <ol className="space-y-2 text-slate-600 mb-6">
              <li>1. Download the plugin from <a href="https://yesallofus.com/plugin" className="text-blue-600 hover:underline">yesallofus.com/plugin</a></li>
              <li>2. Upload to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">/wp-content/plugins/</code></li>
              <li>3. Activate in WordPress admin</li>
              <li>4. Navigate to <strong>YesAllofUs → Settings</strong></li>
            </ol>

            <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
            <ul className="space-y-2 text-slate-600 mb-6">
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>Auto-registers with YesAllofUs on activation</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>Xaman &amp; Crossmark wallet connection</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>30-day referral cookie tracking</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>Automatic commission on order completion</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>Webhook status updates</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-3">Shortcodes</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <code className="text-blue-600 font-mono">[yesallofus_affiliate_signup]</code>
                <p className="text-sm text-slate-600 mt-1">Displays affiliate registration form with wallet input</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <code className="text-blue-600 font-mono">[yesallofus_affiliate_dashboard]</code>
                <p className="text-sm text-slate-600 mt-1">Shows affiliate&apos;s referral link, earnings, and stats</p>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Referral Tracking</h3>
            <p className="text-slate-600 mb-2">Visitors arriving with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">?ref=CODE</code> are tracked via cookie:</p>
            <CodeBlock>https://yourstore.com/?ref=ABC123</CodeBlock>
          </Section>

          {/* Wallets */}
          <Section id="wallets" title="Wallet Connection">
            <p className="text-slate-600 mb-6">
              Connect your XRPL wallet to receive affiliate commissions. Two wallet options are supported:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-5 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/xamanlogo.png" alt="Xaman" className="w-8 h-8 rounded" />
                  <h4 className="font-semibold text-slate-900">Xaman (Mobile)</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">Scan QR code to connect. Supports push notifications for manual approval mode.</p>
                <ol className="text-sm text-slate-600 space-y-1">
                  <li>1. Click &quot;Connect Xaman&quot;</li>
                  <li>2. Scan QR with Xaman app</li>
                  <li>3. Approve the sign-in request</li>
                </ol>
              </div>
              <div className="p-5 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
                  <h4 className="font-semibold text-slate-900">Crossmark (Browser)</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">Browser extension for desktop users. Requires Chrome or Brave.</p>
                <ol className="text-sm text-slate-600 space-y-1">
                  <li>1. Install Crossmark extension</li>
                  <li>2. Click &quot;Connect Crossmark&quot;</li>
                  <li>3. Approve in extension popup</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-1">RLUSD Trustline Required</h4>
              <p className="text-sm text-blue-800">
                Your wallet must have an RLUSD trustline to receive commissions. 
                Add trustline to issuer: <code className="bg-blue-100 px-1 rounded">rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De</code>
              </p>
            </div>
          </Section>

          {/* Webhooks */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-slate-600 mb-4">
              YesAllofUs sends webhook notifications to your store when payout status changes.
            </p>

            <h3 className="font-semibold text-slate-900 mb-3">Endpoint</h3>
            <CodeBlock>POST https://yourstore.com/wp-json/yesallofus/v1/webhook</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Payload</h3>
            <CodeBlock>{`{
  "payout_id": "payout_abc123",
  "status": "paid",
  "order_id": "wc_12345",
  "tx_hashes": [
    {
      "wallet": "rAffiliateWallet123...",
      "amount": 25.00,
      "tx_hash": "ABC123DEF456...",
      "payment_index": 0
    }
  ]
}`}</CodeBlock>

            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Signature Verification</h3>
            <p className="text-slate-600 mb-2">Verify the webhook using HMAC-SHA256:</p>
            <CodeBlock>{`$signature = $_SERVER['HTTP_X_DLTPAYS_SIGNATURE'];
$payload = file_get_contents('php://input');
$expected = hash_hmac('sha256', $payload, $api_secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}`}</CodeBlock>
          </Section>

          {/* API Reference - Stores */}
          <Section id="api-stores" title="API: Stores">
            <Endpoint method="POST" path="/api/v1/store/register" description="Register a new store. Returns API credentials and claim token.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request Body</h5>
              <CodeBlock>{`{
  "store_name": "My Store",
  "store_url": "https://...",
  "email": "admin@store.com",
  "commission_rates": [25,5,3,2,1],
  "payout_mode": "auto",
  "referred_by_store": "A1B2C3D4"
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/stats" auth description="Get store statistics and configuration.">
              <CodeBlock>{`{
  "store_id": "store_abc123",
  "store_name": "My Store",
  "xaman_connected": true,
  "wallet_address": "rWallet123...",
  "affiliates_count": 42,
  "total_paid": 1234.56
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/:store_id/affiliates" description="Get all affiliates for a store. Requires wallet query param for verification.">
              <CodeBlock>{`GET /api/v1/store/store_abc123/affiliates?wallet=rWallet123...

{
  "success": true,
  "affiliates": [
    {
      "affiliate_id": "aff_xyz789",
      "wallet": "rAffWallet...",
      "referral_code": "ABC123",
      "total_earned": 150.00,
      "level": 1,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/:store_id/payouts" description="Get all payouts for a store. Requires wallet query param for verification.">
              <CodeBlock>{`GET /api/v1/store/store_abc123/payouts?wallet=rWallet123...

{
  "success": true,
  "payouts": [
    {
      "payout_id": "payout_abc123",
      "order_id": "wc_12345",
      "order_total": 99.99,
      "payments": [...],
      "tx_hashes": [...],
      "paid_at": "2025-01-15T10:30:00Z",
      "auto_signed": true
    }
  ]
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/by-claim/:token" description="Look up store by claim token (used in dashboard flow).">
              <CodeBlock>{`{ "success": true, "store": { "store_id": "store_abc123", "store_name": "My Store" } }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/store/claim" description="Attach wallet to store using claim token (one-time use).">
              <CodeBlock>{`{
  "claim_token": "abc123def456...",
  "wallet_address": "rWallet123...",
  "wallet_type": "crossmark"
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/store/save-wallet" auth description="Save wallet address (Crossmark connection).">
              <CodeBlock>{`{ "wallet_address": "rWallet123..." }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/lookup-referral/:code" description="Look up store by referral code.">
              <CodeBlock>{`{ "store_id": "store_abc123", "store_name": "Partner Store" }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="DELETE" path="/api/v1/store" auth description="Permanently delete store and all data.">
              <CodeBlock>{`{ "confirm": "PERMANENTLY DELETE" }`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* API Reference - Payouts */}
          <Section id="api-payouts" title="API: Payouts">
            <Endpoint method="POST" path="/api/v1/payout" auth description="Submit a payout request. Triggers affiliate commission calculation and payment.">
              <h5 className="font-semibold text-slate-700 text-sm mb-2">Request Body</h5>
              <CodeBlock>{`{
  "order_id": "wc_12345",
  "order_total": 99.99,
  "referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "success": true,
  "payout_id": "payout_abc123",
  "payments_count": 3,
  "status": "queued"
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/payout/:payout_id/approve" auth description="Manually approve a pending payout (manual mode only).">
              <p className="text-sm text-slate-600">Triggers Xaman push notification for wallet signature.</p>
            </Endpoint>
          </Section>

          {/* API Reference - Affiliates */}
          <Section id="api-affiliates" title="API: Affiliates">
            <Endpoint method="POST" path="/api/v1/affiliate/register" auth description="Register a new affiliate for your store.">
              <CodeBlock>{`{
  "wallet": "rAffiliateWallet...",
  "parent_referral_code": "ABC123"
}`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "affiliate_id": "aff_xyz789",
  "referral_code": "DEF456",
  "level": 2
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/affiliate/dashboard/:wallet" description="Get affiliate dashboard data across all stores.">
              <CodeBlock>{`{
  "success": true,
  "wallet": "rAffWallet...",
  "total_earned": 250.00,
  "stores": [...],
  "recent_payouts": [...]
}`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* API Reference - Xaman */}
          <Section id="api-xaman" title="API: Xaman Wallet">
            <Endpoint method="POST" path="/api/v1/xaman/login" description="Initiate Xaman login (for affiliate dashboard). Returns QR code.">
              <CodeBlock>{`{
  "success": true,
  "login_id": "login_xyz789",
  "qr_png": "https://xumm.app/sign/...",
  "deep_link": "xumm://...",
  "expires_in": 300
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/xaman/login/poll/:login_id" description="Poll login status. Call every 3-5 seconds.">
              <CodeBlock>{`{ "status": "signed", "wallet_address": "rWallet123..." }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/xaman/connect" description="Initiate Xaman wallet connection for store. Returns QR code.">
              <CodeBlock>{`{ "store_id": "store_abc123" }`}</CodeBlock>
              <h5 className="font-semibold text-slate-700 text-sm mt-4 mb-2">Response</h5>
              <CodeBlock>{`{
  "connection_id": "conn_xyz789",
  "qr_png": "https://xumm.app/sign/...",
  "deep_link": "xumm://...",
  "expires_in": 300
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/xaman/poll/:connection_id" description="Poll connection status. Call every 3-5 seconds.">
              <CodeBlock>{`{ "status": "connected", "wallet_address": "rWallet123..." }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/xaman/disconnect" auth description="Disconnect Xaman wallet from store.">
              <p className="text-sm text-slate-600">Requires Bearer token authentication.</p>
            </Endpoint>
          </Section>

          {/* API Reference - Auto-Sign */}
          <Section id="api-autosign" title="API: Auto-Sign">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-indigo-900 mb-1">What is Auto-Sign?</h4>
              <p className="text-sm text-indigo-800">
                Auto-sign enables automatic commission payouts without manual wallet approval. 
                Uses XRPL multi-sign: you add YesAllofUs as a signer with weight 1.
              </p>
            </div>

            <Endpoint method="POST" path="/api/v1/store/enable-autosign" description="Enable auto-sign for a store (after Crossmark signature).">
              <CodeBlock>{`{
  "store_id": "store_abc123",
  "wallet_address": "rWallet123...",
  "daily_limit": 1000,
  "max_single_payout": 100
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/store/revoke-autosign" description="Disable auto-sign (immediate effect).">
              <CodeBlock>{`{ "store_id": "store_abc123", "wallet_address": "rWallet123..." }`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/api/v1/store/autosign-settings" auth description="Update auto-sign limits and accept terms.">
              <CodeBlock>{`{
  "auto_sign_terms_accepted": true,
  "auto_sign_max_single_payout": 100,
  "auto_sign_daily_limit": 1000
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/api/v1/store/autosign-settings" auth description="Get current auto-sign settings.">
              <CodeBlock>{`{
  "success": true,
  "auto_signing_enabled": true,
  "auto_sign_max_single_payout": 100,
  "auto_sign_daily_limit": 1000,
  "platform_signer_address": "rQsRwh841n8DDwx4Bs2KZ4fHPKSt7VeULH"
}`}</CodeBlock>
            </Endpoint>
          </Section>

          {/* Commission System */}
          <Section id="commission-system" title="Commission System">
            <h3 className="font-semibold text-slate-900 mb-3">Chain A: Customer Affiliates</h3>
            <p className="text-slate-600 mb-4">
              5-level MLM commission structure. When a customer purchases via an affiliate link, 
              commissions are calculated up the referral chain:
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Level</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Default Rate</th>
                    <th className="px-4 py-2 text-left text-slate-700 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">Level 1</td>
                    <td className="px-4 py-2 font-mono text-slate-800">25%</td>
                    <td className="px-4 py-2">Direct referrer</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">Level 2</td>
                    <td className="px-4 py-2 font-mono text-slate-800">5%</td>
                    <td className="px-4 py-2">Referrer&apos;s referrer</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">Level 3</td>
                    <td className="px-4 py-2 font-mono text-slate-800">3%</td>
                    <td className="px-4 py-2">3rd level up</td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">Level 4</td>
                    <td className="px-4 py-2 font-mono text-slate-800">2%</td>
                    <td className="px-4 py-2">4th level up</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">Level 5</td>
                    <td className="px-4 py-2 font-mono text-slate-800">1%</td>
                    <td className="px-4 py-2">5th level up</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg mb-6">
              <p className="text-sm text-slate-600">
                <strong>Example:</strong> $100 order with referral code → 
                L1 gets $25, L2 gets $5, L3 gets $3, L4 gets $2, L5 gets $1 = $36 total commissions
              </p>
            </div>

            <h3 className="font-semibold text-slate-900 mb-3">Platform Fee</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Tier</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Fee</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Price</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Free</td>
                  <td className="px-4 py-2 font-mono text-slate-800">2.9%</td>
                  <td className="px-4 py-2">$0/month</td>
                  <td className="px-4 py-2">Under $3,400/month in commissions</td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">Pro</td>
                  <td className="px-4 py-2 font-mono text-slate-800">0.9%</td>
                  <td className="px-4 py-2">$99/month</td>
                  <td className="px-4 py-2">$3,400 - $50,000/month</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Enterprise</td>
                  <td className="px-4 py-2 font-mono text-slate-800">0%</td>
                  <td className="px-4 py-2">$499/month</td>
                  <td className="px-4 py-2">Over $50,000/month</td>
                </tr>
              </tbody>
            </table>
            
            <div className="p-4 bg-slate-50 rounded-lg mt-4">
              <p className="text-sm text-slate-600">
                <strong>Tip:</strong> At $3,400/month in commissions, Pro tier saves you money (2.9% = $98.60 vs $99 flat). 
                At $50,000/month, Enterprise pays for itself. Upgrades are manual — contact <a href="mailto:mark@yesallofus.com" className="text-blue-600 hover:underline">mark@yesallofus.com</a> when you&apos;re ready.
              </p>
            </div>
          </Section>

          {/* Chain B */}
          <Section id="chain-b" title="Chain B: Store Referrals">
            <p className="text-slate-600 mb-4">
              Earn commissions by referring other stores to YesAllofUs! When stores you refer process payments, 
              you earn a percentage of their platform fees.
            </p>

            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-6">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Level</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Rate</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Level 1</td>
                  <td className="px-4 py-2 font-mono text-slate-800">25%</td>
                  <td className="px-4 py-2">Direct store referral</td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">Level 2</td>
                  <td className="px-4 py-2 font-mono text-slate-800">5%</td>
                  <td className="px-4 py-2">Store referred by your referral</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Level 3-5</td>
                  <td className="px-4 py-2 font-mono text-slate-800">3%, 2%, 1%</td>
                  <td className="px-4 py-2">Deeper levels</td>
                </tr>
              </tbody>
            </table>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Example:</strong> You refer Store B. Store B processes $1,000 in orders with 2.9% fee = $29. 
                You earn 25% of $29 = <strong>$7.25</strong> paid instantly in RLUSD.
              </p>
            </div>
          </Section>

          {/* Rate Limits */}
          <Section id="rate-limits" title="Rate Limits">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Scope</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Limit</th>
                  <th className="px-4 py-2 text-left text-slate-700 font-semibold">Window</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Per IP</td>
                  <td className="px-4 py-2 font-mono text-slate-800">60 requests</td>
                  <td className="px-4 py-2">1 minute</td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">Per Store (payouts)</td>
                  <td className="px-4 py-2 font-mono text-slate-800">10 requests</td>
                  <td className="px-4 py-2">1 minute</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-900">Daily Payout Limit</td>
                  <td className="px-4 py-2 font-mono text-slate-800">$1,000</td>
                  <td className="px-4 py-2">24 hours (configurable)</td>
                </tr>
              </tbody>
            </table>
            
            <p className="text-sm text-slate-500 mt-4">
              Rate limit exceeded returns <code className="bg-slate-100 px-1.5 rounded">429 Too Many Requests</code>.
            </p>
          </Section>

          {/* Health Check */}
          <Section id="health" title="Health Check">
            <Endpoint method="GET" path="/health" description="Check API status and service health.">
              <CodeBlock>{`{
  "status": "healthy",
  "version": "3.1.1",
  "redis": "connected",
  "xaman": true
}`}</CodeBlock>
            </Endpoint>
          </Section>
        </main>
      </div>
    </div>
  );
}