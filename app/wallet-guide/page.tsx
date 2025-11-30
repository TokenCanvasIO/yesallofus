export default function WalletGuide() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <main className="max-w-3xl mx-auto px-6 py-16">
        
        <a href="/" className="text-zinc-500 text-sm hover:text-white mb-8 inline-block">← Back</a>
        
        <h1 className="text-3xl font-bold mb-4">Wallet Connection Guide</h1>
        <p className="text-zinc-400 mb-12">Two options. Both secure. Different trade-offs.</p>

        {/* Xaman */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="bg-zinc-800 rounded-lg px-3 py-1 text-sm">Xaman</span>
            <span className="text-zinc-500 text-sm font-normal">Mobile app</span>
          </h2>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">How it works</h3>
            <p className="text-zinc-400 text-sm mb-4">
              When an order completes, YesAllofUs sends a push notification to your phone. 
              You open Xaman, review the payment details, and approve or reject.
            </p>
            <p className="text-zinc-400 text-sm">
              Nothing happens without your explicit approval. Every. Single. Time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Pros</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>✓ Maximum control</li>
                <li>✓ Review every payment before it sends</li>
                <li>✓ No auto-signing = no risk of unauthorized payments</li>
                <li>✓ Works on mobile</li>
              </ul>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <h4 className="text-zinc-400 font-medium mb-2">Cons</h4>
              <ul className="text-zinc-500 text-sm space-y-1">
                <li>○ Manual approval needed for each payout</li>
                <li>○ Affiliates wait until you approve</li>
                <li>○ Not ideal if you have high volume</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Best for</h3>
            <p className="text-zinc-400 text-sm">
              Low volume stores. People who want maximum control. 
              Anyone uncomfortable with auto-signing.
            </p>
          </div>
        </section>

        {/* Crossmark */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="bg-zinc-800 rounded-lg px-3 py-1 text-sm">Crossmark</span>
            <span className="text-zinc-500 text-sm font-normal">Browser extension</span>
          </h2>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">How it works</h3>
            <p className="text-zinc-400 text-sm mb-4">
              You add YesAllofUs as a "signer" on your wallet with specific limits. 
              When an order completes, YesAllofUs automatically triggers the payment — 
              no manual approval needed.
            </p>
            <p className="text-zinc-400 text-sm">
              Payments are instant. Affiliates get paid in ~4 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Pros</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>✓ Fully automatic payouts</li>
                <li>✓ Affiliates paid instantly</li>
                <li>✓ Set your own daily limits</li>
                <li>✓ Revoke access anytime</li>
              </ul>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <h4 className="text-zinc-400 font-medium mb-2">Cons</h4>
              <ul className="text-zinc-500 text-sm space-y-1">
                <li>○ Requires trusting YesAllofUs as a signer</li>
                <li>○ Desktop only (browser extension)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Best for</h3>
            <p className="text-zinc-400 text-sm">
              Higher volume stores. Anyone who wants true instant payouts. 
              People comfortable with XRPL SignerLists.
            </p>
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Wallet security</h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">YesAllofUs never holds your private keys</h3>
              <p className="text-zinc-400 text-sm">
                Your keys stay in your wallet (Xaman or Crossmark). YesAllofUs only has 
                permission to request transactions — never to access your keys directly.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Daily limits protect you (Crossmark)</h3>
              <p className="text-zinc-400 text-sm">
                You set the maximum single payout and daily total. Even if something 
                went wrong, payouts are capped at your limits.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Revoke anytime</h3>
              <p className="text-zinc-400 text-sm">
                With Crossmark, you can remove YesAllofUs as a signer at any time from 
                your wallet settings. Instant. No questions asked.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">100% transparent</h3>
              <p className="text-zinc-400 text-sm">
                Every payment is recorded on the XRP Ledger. You, your affiliates, 
                and anyone else can verify every transaction publicly.
              </p>
            </div>
          </div>
        </section>

        {/* Risks */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Honest risks</h2>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <h3 className="text-yellow-400 font-semibold mb-3">With Crossmark auto-signing</h3>
            <ul className="text-zinc-400 text-sm space-y-3">
              <li>
                <strong className="text-zinc-300">If YesAllofUs were compromised:</strong> An attacker 
                could trigger payments up to your daily limit. Mitigation: set conservative limits, 
                monitor your wallet, revoke immediately if suspicious.
              </li>
              <li>
                <strong className="text-zinc-300">If you set limits too high:</strong> A bug or 
                attack could drain more than intended. Mitigation: start with low limits, 
                increase as you build trust.
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-4">
            <h3 className="font-semibold mb-3">With Xaman manual approval</h3>
            <p className="text-zinc-400 text-sm">
              Minimal risk. Nothing happens without your explicit approval. 
              The only downside is speed — affiliates wait for you to approve.
            </p>
          </div>
        </section>

        {/* Server Security */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Server security</h2>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4">What we do</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li className="text-green-400">✓ API hosted on DigitalOcean (NYC) with firewall</li>
              <li className="text-green-400">✓ HTTPS everywhere — all traffic encrypted</li>
              <li className="text-green-400">✓ Rate limiting — 60 requests/min per IP, 10 payouts/min per store</li>
              <li className="text-green-400">✓ Input validation on all endpoints</li>
              <li className="text-green-400">✓ Redis locks prevent duplicate payments</li>
              <li className="text-green-400">✓ No passwords stored — wallet-based auth only</li>
              <li className="text-green-400">✓ API secrets hashed, never logged</li>
              <li className="text-green-400">✓ Balance checks before every payout</li>
              <li className="text-green-400">✓ Daily limits enforced server-side</li>
            </ul>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4">What we don't do (yet)</h3>
            <ul className="text-zinc-500 text-sm space-y-2">
              <li>○ SOC2 certification — we're a solo operation</li>
              <li>○ Penetration testing by third party</li>
              <li>○ Multi-region failover</li>
              <li>○ 24/7 monitoring team</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <h3 className="text-yellow-400 font-semibold mb-3">Honest assessment</h3>
            <p className="text-zinc-400 text-sm mb-4">
              This is indie software built by one developer. It's not bank-grade. 
              I've built in sensible protections, but I'm not pretending to be enterprise security.
            </p>
            <p className="text-zinc-300 text-sm font-medium mb-3">
              If you're doing $10k+/month in payouts, you should:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• Set conservative daily limits</li>
              <li>• Monitor your wallet regularly</li>
              <li>• Keep only working capital in your connected wallet</li>
              <li>• Understand you're trusting me and my code</li>
            </ul>
            <p className="text-zinc-500 text-sm mt-4">
              I'm building in public. The code works. But "trust" takes time to earn.
            </p>
          </div>
        </section>

        {/* Recommendation */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">My recommendation</h2>
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-6">
            <p className="text-zinc-300 text-sm mb-4">
              <strong>Start with Xaman</strong> if you're new to this. Get comfortable 
              with how payouts work. See the transactions on the ledger.
            </p>
            <p className="text-zinc-300 text-sm">
              <strong>Switch to Crossmark</strong> when you want instant payouts and 
              you trust the system. Set conservative limits at first.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-zinc-800">
          <p className="text-zinc-400 mb-6">Ready to connect?</p>
          <a 
            href="/#get-started" 
            className="bg-sky-500 hover:bg-sky-400 text-black font-semibold px-6 py-3 rounded transition inline-block"
          >
            Get started
          </a>
        </section>

      </main>

      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">Built on XRPL · Powered by RLUSD</p>
          <div className="flex gap-6 text-zinc-600 text-sm">
            <a href="/docs" className="hover:text-white">Docs</a>
            <a href="/wallet-guide" className="hover:text-white">Security</a>
            <a href="https://x.com/YesAllofUs" className="hover:text-white">X</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
