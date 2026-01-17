'use client';
import React from 'react';

export default function POSTerms() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Terms</h1>
          <p className="text-slate-600 text-sm">Last updated: 17 January 2026</p>
        </div>

        {/* Plain English Summary */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10">
          <h2 className="font-semibold text-emerald-900 mb-2">Quick Summary</h2>
          <ul className="text-emerald-800 text-sm space-y-1.5">
            <li>• You&apos;re paying with <strong>RLUSD stablecoin</strong> on the XRP Ledger</li>
            <li>• Payments are <strong>instant and final</strong> — they cannot be reversed</li>
            <li>• For refunds or product issues, <strong>contact the vendor directly</strong></li>
            <li>• This service is currently available to <strong>Guernsey residents only</strong> as part of a pilot</li>
            <li>• Transactions under £100 do not require additional verification</li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-sm max-w-none">

          {/* 1. About This Service */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. About This Service</h2>
            <p className="text-slate-700 mb-3">
              YesAllofUs provides payment processing technology that enables you to pay vendors using RLUSD (Ripple USD stablecoin) on the XRP Ledger. When you complete a payment through our checkout, you are:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-3">
              <li>Sending RLUSD directly from your wallet to the vendor&apos;s wallet</li>
              <li>Joining the vendor&apos;s affiliate program (if applicable)</li>
              <li>Agreeing to these payment terms</li>
            </ul>
            <p className="text-slate-700">
              YesAllofUs is operated by Mark Flynn, based in Guernsey, Channel Islands.
            </p>
          </section>

          {/* 2. Payment Finality */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Payment Finality</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ All payments are final and irreversible once confirmed on the XRP Ledger.
              </p>
            </div>
            <p className="text-slate-700 mb-3">
              Unlike card payments, blockchain transactions cannot be reversed, cancelled, or charged back. Once you approve a payment:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>The transaction is recorded permanently on the public XRP Ledger</li>
              <li>YesAllofUs cannot reverse or modify the transaction</li>
              <li>The vendor receives payment within seconds</li>
            </ul>
          </section>

          {/* 3. Refunds and Disputes */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Refunds and Disputes</h2>
            <p className="text-slate-700 mb-3">
              <strong>YesAllofUs is a payment processor, not the seller.</strong> For any issues with:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-3">
              <li>Product quality or defects</li>
              <li>Non-delivery or shipping issues</li>
              <li>Refund requests</li>
              <li>Order cancellations</li>
            </ul>
            <p className="text-slate-700">
              <strong>Contact the vendor directly.</strong> The vendor is solely responsible for their products, services, and refund policies. If a vendor agrees to a refund, they will send RLUSD back to your wallet as a separate transaction.
            </p>
          </section>

          {/* 4. Currency and Conversion */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Currency and Conversion</h2>
            <p className="text-slate-700 mb-3">
              Prices are displayed in GBP (£) and converted to RLUSD at checkout using live exchange rates from CoinGecko Pro (aggregating 600+ exchanges).
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>We aim for less than 0.1% variance between the quoted and settled amount</li>
              <li>The final RLUSD amount is locked when you approve the transaction</li>
              <li>RLUSD is a stablecoin pegged to the US Dollar, issued by Ripple</li>
              <li>YesAllofUs does not guarantee the value or stability of RLUSD</li>
            </ul>
          </section>

          {/* 5. Eligibility */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Eligibility</h2>
            <p className="text-slate-700 mb-3">
              This payment service is currently available as a pilot programme:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li><strong>Geographic restriction:</strong> Available to Guernsey residents only</li>
              <li><strong>Age requirement:</strong> You must be at least 18 years old</li>
              <li><strong>Transaction limit:</strong> Individual transactions under £100 do not require additional verification</li>
            </ul>
          </section>

          {/* 6. Your Wallet */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Wallet</h2>
            <p className="text-slate-700 mb-3">
              When you pay through YesAllofUs checkout, you connect a cryptocurrency wallet. You are responsible for:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-3">
              <li>Maintaining sufficient RLUSD balance to complete payments</li>
              <li>Keeping your wallet credentials secure</li>
              <li>Ensuring your wallet has an active RLUSD trustline</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Security tip:</strong> Do not store large amounts in your payment wallet. Transfer only what you need for purchases.
              </p>
            </div>
          </section>

          {/* 7. What We're Not Responsible For */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. What We&apos;re Not Responsible For</h2>
            <p className="text-slate-700 mb-3">
              YesAllofUs is not liable for:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>The quality, safety, or legality of products or services sold by vendors</li>
              <li>Vendor delivery, shipping, or fulfilment</li>
              <li>Vendor refund policies or disputes</li>
              <li>Loss of wallet access or credentials</li>
              <li>XRP Ledger network issues or delays</li>
              <li>Fluctuations in cryptocurrency values</li>
              <li>Payments sent to incorrect wallet addresses</li>
            </ul>
          </section>

          {/* 8. Data We Collect */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Data We Collect</h2>
            <p className="text-slate-700 mb-3">
              When you complete a payment, we collect and store:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-3">
              <li><strong>Wallet address</strong> — your public XRP Ledger address</li>
              <li><strong>Email address</strong> — if you provide it for receipts</li>
              <li><strong>Name</strong> — if you provide it during signup</li>
              <li><strong>Transaction details</strong> — amounts, timestamps, vendor information</li>
            </ul>
            <p className="text-slate-700 mb-3">
              All transactions are recorded on the public XRP Ledger. Wallet addresses and transaction amounts are publicly visible on the blockchain.
            </p>
            <p className="text-slate-700">
              See our full <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> for details.
            </p>
          </section>

          {/* 9. Affiliate Programme */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Affiliate Programme</h2>
            <p className="text-slate-700 mb-3">
              When you sign up to pay a vendor, you may automatically join their affiliate programme. This means:
            </p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>You may earn commission by referring others to that vendor</li>
              <li>Commission rates are set by each vendor</li>
              <li>Commissions are paid in RLUSD to your wallet</li>
              <li>You are responsible for any tax obligations on earnings</li>
            </ul>
          </section>

          {/* 10. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to These Terms</h2>
            <p className="text-slate-700">
              We may update these terms from time to time. Continued use of the payment service after changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* 11. Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact</h2>
            <p className="text-slate-700 mb-3">
              For questions about these payment terms:
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700"><strong>YesAllofUs</strong></p>
              <p className="text-slate-700">Guernsey, Channel Islands</p>
              <p className="text-slate-700 mt-2">
                <strong>Email:</strong> <a href="mailto:mark@yesallofus.com" className="text-blue-600 hover:underline">mark@yesallofus.com</a>
              </p>
            </div>
          </section>

          {/* 12. Governing Law */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. Governing Law</h2>
            <p className="text-slate-700">
              These terms are governed by the laws of Guernsey, Channel Islands.
            </p>
          </section>

        </div>

        {/* Acceptance */}
        <div className="border-t border-slate-200 pt-6 mt-10">
          <p className="text-slate-600 text-sm">
            By completing a payment through YesAllofUs checkout, you acknowledge that you have read, understood, and agree to these Payment Terms.
          </p>
        </div>
      </main>
    </div>
  );
}