export default function WordPressGuide() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <main className="max-w-3xl mx-auto px-6 py-16">
        
        <a href="/" className="text-zinc-500 text-sm hover:text-white mb-8 inline-block">← Back</a>
        
        <h1 className="text-3xl font-bold mb-4">WordPress / WooCommerce Setup</h1>
        <p className="text-zinc-400 mb-12">Get instant affiliate payouts in under 5 minutes.</p>

        {/* Requirements */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Requirements</h2>
          <ul className="text-zinc-400 text-sm space-y-2">
            <li>✓ WordPress 5.0+</li>
            <li>✓ WooCommerce 5.0+</li>
            <li>✓ XRPL wallet (Xaman, Crossmark, or Web3Auth)</li>
            <li>✓ RLUSD balance for payouts</li>
          </ul>
        </section>

        {/* Step 1 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-sky-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">1</span>
            <h2 className="text-xl font-bold">Install the plugin</h2>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">Download and install:</p>
            <a 
              href="https://github.com/TokenCanvasIO/YesAllofUs-Wordpress/releases/download/v1.0.1/yesallofus.zip" 
              className="bg-sky-500 hover:bg-sky-400 text-black font-semibold px-4 py-2 rounded text-sm inline-block mb-4"
            >
              Download Plugin (.zip)
            </a>
            <p className="text-zinc-500 text-sm mb-4">Or install manually:</p>
            <ol className="text-zinc-400 text-sm space-y-2">
              <li>1. Go to WordPress Admin → Plugins → Add New</li>
              <li>2. Click "Upload Plugin"</li>
              <li>3. Select the .zip file</li>
              <li>4. Click "Install Now" then "Activate"</li>
            </ol>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-sky-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">2</span>
            <h2 className="text-xl font-bold">Connect your wallet</h2>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <ol className="text-zinc-400 text-sm space-y-3">
              <li>1. Go to WordPress Admin → YesAllofUs</li>
              <li>2. Click "Connect Wallet"</li>
              <li>3. Choose Xaman (mobile), Crossmark (browser), or Web3Auth (social login)</li>
              <li>4. Approve the connection in your wallet</li>
            </ol>
            
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-zinc-500 text-sm">
                <strong className="text-zinc-300">Xaman:</strong> Scan QR code with your phone. 
                You'll approve each payout manually via push notification.
              </p>
            </div>
            
            <div className="mt-3 p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-zinc-500 text-sm">
                <strong className="text-zinc-300">Crossmark:</strong> Connect via browser extension. 
                Set daily limits for automatic payouts.
              </p>
            </div>

            <div className="mt-3 p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-zinc-500 text-sm">
                <strong className="text-zinc-300">Web3Auth:</strong> Sign in with Google, Apple, or email. 
                No crypto wallet needed — we create one for you automatically. 
                Supports automatic payouts with no manual approval required.
              </p>
            </div>

            <p className="text-zinc-500 text-sm mt-4">
              <a href="/wallet-guide" className="text-sky-500 hover:underline">
                Not sure which to choose? Read the full comparison →
              </a>
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-sky-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">3</span>
            <h2 className="text-xl font-bold">Configure payouts (Crossmark & Web3Auth)</h2>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">
              If using Crossmark or Web3Auth for automatic payouts, set your limits:
            </p>
            <ol className="text-zinc-400 text-sm space-y-2">
              <li>1. Go to YesAllofUs → Settings</li>
              <li>2. Accept the auto-sign terms</li>
              <li>3. Set maximum single payout (e.g. $100)</li>
              <li>4. Set daily limit (e.g. $1,000)</li>
              <li>5. Click "Enable Auto-Sign"</li>
              <li>6. Approve the SignerList transaction in your wallet</li>
            </ol>
            
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>Web3Auth users:</strong> Auto-sign is enabled by default. Your wallet is created 
                with YesAllofUs as an authorised signer, so payouts happen instantly with no manual approval.
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Tip:</strong> Start with conservative limits. You can always increase later.
              </p>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-sky-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">4</span>
            <h2 className="text-xl font-bold">Add RLUSD to your wallet</h2>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet needs RLUSD to pay affiliates. You'll also need a small amount 
              of XRP for transaction fees (~0.00001 XRP per transaction).
            </p>
            <p className="text-zinc-400 text-sm mb-4">
              Get RLUSD from:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• <a href="https://uphold.com" className="text-sky-500 hover:underline">Uphold</a></li>
              <li>• <a href="https://gatehub.net" className="text-sky-500 hover:underline">GateHub</a></li>
              <li>• XRPL DEX (via Xaman or Crossmark)</li>
            </ul>
            
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-zinc-500 text-sm">
                <strong className="text-zinc-300">Web3Auth users:</strong> Your wallet address is shown in your dashboard. 
                Send RLUSD and XRP to this address from any exchange or wallet.
              </p>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-sky-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">5</span>
            <h2 className="text-xl font-bold">Register affiliates</h2>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">
              The plugin creates two shortcodes for your site:
            </p>
            
            <div className="bg-zinc-800 rounded-lg p-4 mb-4">
              <code className="text-green-400 text-sm">[dltpays_affiliate_signup]</code>
              <p className="text-zinc-500 text-sm mt-2">
                Signup form where affiliates enter their XRPL wallet address.
              </p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <code className="text-green-400 text-sm">[dltpays_affiliate_dashboard]</code>
              <p className="text-zinc-500 text-sm mt-2">
                Dashboard where affiliates see their referral link and earnings.
              </p>
            </div>
            
            <p className="text-zinc-400 text-sm mt-4">
              Add these to any page. When someone signs up, they get a unique referral link 
              like <code className="bg-zinc-800 px-2 py-1 rounded text-xs">yoursite.com?ref=ABC123</code>
            </p>
          </div>
        </section>

        {/* Step 6 */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-green-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">✓</span>
            <h2 className="text-xl font-bold">Done!</h2>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <p className="text-zinc-300 text-sm mb-4">
              When a customer visits via a referral link and completes an order:
            </p>
            <ol className="text-zinc-400 text-sm space-y-2">
              <li>1. Order status changes to "Completed"</li>
              <li>2. YesAllofUs calculates commission (default 25%)</li>
              <li>3. Payment triggers from your wallet</li>
              <li>4. Affiliate receives RLUSD in ~4 seconds</li>
            </ol>
            <p className="text-zinc-400 text-sm mt-4">
              All transactions are visible on the XRP Ledger. You can verify any payment 
              on <a href="https://xrpscan.com" className="text-sky-500 hover:underline">XRPScan</a>.
            </p>
          </div>
        </section>

        {/* Commission rates */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Commission structure</h2>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">
              YesAllofUs supports 5-level MLM commissions. Default rates:
            </p>
            <div className="grid grid-cols-5 gap-2 text-center text-sm mb-4">
              <div className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-500">Level 1</p>
                <p className="font-bold">25%</p>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-500">Level 2</p>
                <p className="font-bold">5%</p>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-500">Level 3</p>
                <p className="font-bold">3%</p>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-500">Level 4</p>
                <p className="font-bold">2%</p>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-500">Level 5</p>
                <p className="font-bold">1%</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm">
              Customize rates in YesAllofUs → Settings.
            </p>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Payout didn't trigger</h3>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Check order status is "Completed" (not "Processing")</li>
                <li>• Check referral code was captured (order meta: _dltpays_referral_code)</li>
                <li>• Check wallet has RLUSD balance</li>
                <li>• Check YesAllofUs → Settings shows "Connected"</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Wallet won't connect</h3>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• For Xaman: ensure push notifications are enabled</li>
                <li>• For Crossmark: check extension is installed and unlocked</li>
                <li>• For Web3Auth: try a different browser or clear cookies</li>
                <li>• Try refreshing the page and reconnecting</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Auto-sign not working</h3>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Check you've accepted the terms</li>
                <li>• Verify SignerList is set on your wallet (check XRPScan)</li>
                <li>• Ensure payout amount is within your limits</li>
                <li>• Web3Auth users: auto-sign is enabled by default — check RLUSD balance</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Need help?</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-4">
              Stuck? I'll help you get set up.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <a 
                href="mailto:mark@YesAllofUs.com" 
                className="text-sky-500 hover:underline text-sm"
              >
                mark@YesAllofUs.com
              </a>
              <a 
                href="https://x.com/YesAllofUs" 
                className="text-sky-500 hover:underline text-sm"
              >
                @YesAllofUs
              </a>
            </div>
            <p className="text-zinc-500 text-sm mt-4">
              <a href="https://calendly.com/tokencanvasio/30min" target="_blank" className="text-sky-500 hover:underline">Done-for-you setup</a>
              <span className="block sm:inline sm:ml-1">— I'll configure everything on a call.</span>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-zinc-800">
          <a 
            href="https://github.com/TokenCanvasIO/YesAllofUs-Wordpress/releases/latest/download/yesallofus.zip" 
            className="bg-sky-500 hover:bg-sky-400 text-black font-semibold px-6 py-3 rounded transition inline-block"
          >
            Download Plugin
          </a>
        </section>
      </main>
    </div>
  );
}