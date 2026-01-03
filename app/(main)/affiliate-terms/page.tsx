'use client';
import React from 'react';

export default function AffiliateTerms() {
  return (
    <div className="min-h-screen bg-white">

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Affiliate Program Terms</h1>
          <p className="text-slate-600">Last updated: 29 November 2025</p>
        </div>

        {/* Plain English Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-blue-900 mb-3">📋 Plain English Summary</h2>
          <p className="text-blue-800 text-sm leading-relaxed mb-4">
            Before the legal language, here&apos;s what you&apos;re agreeing to in simple terms:
          </p>
          <ul className="text-blue-800 text-sm space-y-2">
            <li><strong>You earn commissions</strong> on sales you refer. The store sets the rates and commission levels — these vary by merchant.</li>
            <li><strong>Payments are instant</strong> in RLUSD to your XRPL wallet. You need an RLUSD trustline to receive payments.</li>
            <li><strong>Don&apos;t spam or cheat.</strong> No fake referrals, no bidding on the store&apos;s trademarks, no misleading claims.</li>
            <li><strong>You handle your own taxes.</strong> Commission payments are income — report them accordingly.</li>
            <li><strong>The store can remove you</strong> at any time for any reason. Earned commissions already paid are yours.</li>
            <li><strong>Payments are final.</strong> Blockchain transactions cannot be reversed.</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ol className="text-sm text-slate-600 space-y-2 columns-2">
            <li><a href="#relationship" className="hover:text-blue-600">1. The Relationship</a></li>
            <li><a href="#commission-structure" className="hover:text-blue-600">2. Commission Structure</a></li>
            <li><a href="#payments" className="hover:text-blue-600">3. How You Get Paid</a></li>
            <li><a href="#referral-link" className="hover:text-blue-600">4. Your Referral Link</a></li>
            <li><a href="#prohibited" className="hover:text-blue-600">5. Prohibited Activities</a></li>
            <li><a href="#responsibilities" className="hover:text-blue-600">6. Your Responsibilities</a></li>
            <li><a href="#merchant-rights" className="hover:text-blue-600">7. Merchant&apos;s Rights</a></li>
            <li><a href="#no-guarantees" className="hover:text-blue-600">8. No Guarantees</a></li>
            <li><a href="#termination" className="hover:text-blue-600">9. Termination</a></li>
            <li><a href="#liability" className="hover:text-blue-600">10. Limitation of Liability</a></li>
            <li><a href="#platform" className="hover:text-blue-600">11. YesAllofUs Platform</a></li>
            <li><a href="#changes" className="hover:text-blue-600">12. Changes to Terms</a></li>
            <li><a href="#contact" className="hover:text-blue-600">13. Contact</a></li>
          </ol>
        </div>

        {/* Terms Content */}
        <div className="prose prose-slate max-w-none">

          {/* 1. The Relationship */}
          <section id="relationship" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. The Relationship</h2>
            <p className="text-slate-700 mb-4">
              When you sign up as an affiliate, you are entering an agreement with the store (the &quot;Merchant&quot;), not with YesAllofUs. YesAllofUs provides the payment infrastructure — the Merchant sets the rules.
            </p>
            <p className="text-slate-700 mb-4">
              You are an independent contractor, not an employee of the Merchant or YesAllofUs.
            </p>
          </section>

          {/* 2. Commission Structure */}
          <section id="commission-structure" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Commission Structure</h2>
            <p className="text-slate-700 mb-4">
              Commission rates and levels are set by each Merchant and may vary. The Merchant determines:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>The commission percentage for direct referrals (Level 1)</li>
              <li>Whether multi-level commissions apply (Levels 2-5)</li>
              <li>The rates for each level, if applicable</li>
            </ul>
            <p className="text-slate-700 mb-4">
              The Merchant may change commission rates at any time. Check with the Merchant for their current rates.
            </p>
            <p className="text-slate-700 mb-4">
              Commissions are calculated on the order total and paid when the order is marked complete.
            </p>
          </section>

          {/* 3. How You Get Paid */}
          <section id="payments" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How You Get Paid</h2>
            <p className="text-slate-700 mb-4">
              Payments are made instantly in RLUSD on the XRP Ledger.
            </p>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Requirements</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>A valid XRPL wallet address</li>
              <li>An active RLUSD trustline to the issuer (rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De)</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> If your wallet lacks a trustline, payments will be skipped. Learn how to set up your RLUSD trustline: <a href="https://help.xaman.app/app/getting-started-with-xaman/how-to-create-a-rlusd-trust-line" target="_blank" rel="noopener noreferrer" className="text-amber-900 underline hover:no-underline">Xaman RLUSD Trustline Guide →</a>
              </p>
            </div>

            <p className="text-slate-700 mb-4">
              <strong>Payments are final.</strong> Once a transaction is recorded on the blockchain, it cannot be reversed.
            </p>
          </section>

          {/* 4. Your Referral Link */}
          <section id="referral-link" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Your Referral Link</h2>
            <p className="text-slate-700 mb-4">
              You receive a unique referral code and link. When someone clicks your link and makes a purchase within the cookie period (set by the Merchant, typically 30 days), you earn commission.
            </p>
            <p className="text-slate-700 mb-4">You may share your link via:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Social media</li>
              <li>Your website or blog</li>
              <li>Email to people who have opted in</li>
              <li>YouTube, podcasts, or other content</li>
            </ul>
          </section>

          {/* 5. Prohibited Activities */}
          <section id="prohibited" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Prohibited Activities</h2>
            <p className="text-slate-700 mb-4">You must not:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><strong>Spam</strong> — No unsolicited emails, DMs, or messages</li>
              <li><strong>Self-refer</strong> — No using your own link for personal purchases</li>
              <li><strong>Trademark bidding</strong> — No paid ads on the Merchant&apos;s brand name or variations</li>
              <li><strong>Cookie stuffing</strong> — No forcing cookies without genuine clicks</li>
              <li><strong>False claims</strong> — No misleading statements about products or earnings</li>
              <li><strong>Incentivised clicks</strong> — No paying people just to click your link</li>
              <li><strong>Fraud</strong> — No fake orders, chargebacks, or manipulation</li>
            </ul>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> Violation results in immediate termination and forfeiture of unpaid commissions.
              </p>
            </div>
          </section>

          {/* 6. Your Responsibilities */}
          <section id="responsibilities" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Responsibilities</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Disclose your affiliate relationship as required by UK regulations, local law enforcement agencies, or other applicable authorities in your jurisdiction</li>
              <li>Pay taxes on your commission income</li>
              <li>Keep your wallet address and trustline active</li>
              <li>Comply with all applicable laws in your jurisdiction</li>
            </ul>
          </section>

          {/* 7. Merchant's Rights */}
          <section id="merchant-rights" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Merchant&apos;s Rights</h2>
            <p className="text-slate-700 mb-4">The Merchant may:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Reject your application</li>
              <li>Terminate your affiliate status at any time</li>
              <li>Change commission rates or structure</li>
              <li>Withhold or reverse commissions on fraudulent or refunded orders</li>
              <li>Modify program terms with notice</li>
            </ul>
          </section>

          {/* 8. No Guarantees */}
          <section id="no-guarantees" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. No Guarantees</h2>
            <p className="text-slate-700 mb-4">
              Participation does not guarantee earnings. Your results depend on your efforts, audience, and market conditions.
            </p>
            <p className="text-slate-700 mb-4">
              YesAllofUs and the Merchant make no representations about potential income.
            </p>
          </section>

          {/* 9. Termination */}
          <section id="termination" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Termination</h2>
            <p className="text-slate-700 mb-4">
              Either you or the Merchant can end the relationship at any time.
            </p>
            <p className="text-slate-700 mb-4">On termination:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Your referral link stops working</li>
              <li>Pending commissions on completed orders will still be paid</li>
              <li>Commissions on future orders will not be paid</li>
            </ul>
          </section>

          {/* 10. Limitation of Liability */}
          <section id="liability" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-slate-700 mb-4">Neither the Merchant nor YesAllofUs is liable for:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Lost commissions due to technical issues</li>
              <li>Wallet or trustline problems on your end</li>
              <li>Changes in RLUSD value</li>
              <li>Orders that are refunded or charged back</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Maximum liability is limited to commissions actually earned but unpaid.
            </p>
          </section>

          {/* 11. YesAllofUs Platform */}
          <section id="platform" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. YesAllofUs Platform</h2>
            <p className="text-slate-700 mb-4">
              YesAllofUs provides the payment infrastructure. By participating in any affiliate program powered by YesAllofUs, you also agree to the <a href="/terms" className="text-blue-600 hover:underline">YesAllofUs Terms of Service</a>.
            </p>
            <p className="text-slate-700 mb-4">
              YesAllofUs is not a party to disputes between you and the Merchant.
            </p>
          </section>

          {/* 12. Changes to Terms */}
          <section id="changes" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to Terms</h2>
            <p className="text-slate-700 mb-4">
              These terms may be updated. Continued participation after changes constitutes acceptance.
            </p>
          </section>

          {/* 13. Contact */}
          <section id="contact" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact</h2>
            <p className="text-slate-700 mb-4">
              For questions about a specific affiliate program, contact the Merchant directly.
            </p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-2">For questions about the YesAllofUs platform:</p>
              <p className="text-slate-700">
                <strong>Email:</strong> <a href="mailto:mark@yesallofus.com" className="text-blue-600 hover:underline">mark@yesallofus.com</a>
              </p>
              <p className="text-slate-700">
                <strong>Website:</strong> <a href="https://YesAllofUs.com" className="text-blue-600 hover:underline">https://YesAllofUs.com</a>
              </p>
            </div>
          </section>

        </div>

        {/* Acceptance */}
        <div className="border-t border-slate-200 pt-8 mt-12">
          <p className="text-slate-600 text-sm">
            By registering as an affiliate, you acknowledge that you have read, understood, and agree to be bound by these Affiliate Program Terms.
          </p>
        </div>
      </main>
    </div>
  );
}