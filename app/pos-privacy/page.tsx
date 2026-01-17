'use client';
import React from 'react';

export default function POSPrivacy() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Privacy Notice</h1>
          <p className="text-slate-600 text-sm">Last updated: 17 January 2026</p>
        </div>

        {/* Plain English Summary */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10">
          <h2 className="font-semibold text-emerald-900 mb-2">Privacy at a Glance</h2>
          <ul className="text-emerald-800 text-sm space-y-1.5">
            <li>• We collect <strong>minimal data</strong> — only what&apos;s needed to process your payment</li>
            <li>• We <strong>never sell your data</strong> to anyone</li>
            <li>• Blockchain transactions are <strong>public</strong> — wallet addresses and amounts are visible</li>
            <li>• We recommend <strong>not storing large amounts</strong> in your payment wallet</li>
            <li>• You can request <strong>deletion</strong> of your account data (blockchain records are permanent)</li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-sm max-w-none">

          {/* 1. Who We Are */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p className="text-slate-700">
              YesAllofUs is a payment technology provider operated by Mark Flynn, based in Guernsey, Channel Islands. We are the data controller for personal data processed through our checkout service.
            </p>
          </section>

          {/* 2. Data We Collect */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Data We Collect</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">When you pay through our checkout:</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Data</th>
                  <th className="px-4 py-2 text-left text-slate-700">Why We Need It</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">Wallet address</td>
                  <td className="px-4 py-2">To process your payment and send receipts</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Email address</td>
                  <td className="px-4 py-2">To send transaction receipts (if provided)</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Name</td>
                  <td className="px-4 py-2">To personalise your account (if provided)</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Transaction details</td>
                  <td className="px-4 py-2">Order amounts, items, timestamps</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">We do NOT collect:</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Private keys or wallet seeds</li>
              <li>Bank account details</li>
              <li>Government ID or passport numbers</li>
              <li>Physical address (unless shipping is required by vendor)</li>
            </ul>
          </section>

          {/* 3. Blockchain Transparency */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Blockchain Transparency</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> The XRP Ledger is a public blockchain. Transaction data is permanent and visible to anyone.
              </p>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">What&apos;s publicly visible on the blockchain:</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-3">
              <li>Your wallet address</li>
              <li>Transaction amounts</li>
              <li>Transaction timestamps</li>
              <li>Recipient wallet addresses</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">What&apos;s NOT on the blockchain:</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Your name or email</li>
              <li>What you purchased</li>
              <li>Your identity</li>
            </ul>
            <p className="text-slate-700 mt-3">
              Wallet addresses are pseudonymous — they don&apos;t reveal your identity unless you publicly link them to yourself.
            </p>
          </section>

          {/* 4. How We Use Your Data */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li><strong>Process payments</strong> — execute transactions on the XRP Ledger</li>
              <li><strong>Send receipts</strong> — email confirmations of your purchases</li>
              <li><strong>Manage your account</strong> — affiliate programme, wallet connections</li>
              <li><strong>Prevent fraud</strong> — monitor for suspicious activity</li>
              <li><strong>Comply with law</strong> — respond to legal requirements</li>
            </ul>
          </section>

          {/* 5. Who We Share Data With */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Who We Share Data With</h2>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Recipient</th>
                  <th className="px-4 py-2 text-left text-slate-700">What Data</th>
                  <th className="px-4 py-2 text-left text-slate-700">Why</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">XRP Ledger</td>
                  <td className="px-4 py-2">Wallet addresses, amounts</td>
                  <td className="px-4 py-2">Payment processing</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Vendors</td>
                  <td className="px-4 py-2">Your wallet, order details</td>
                  <td className="px-4 py-2">Order fulfilment</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Firebase (Google)</td>
                  <td className="px-4 py-2">Account data</td>
                  <td className="px-4 py-2">Database hosting</td>
                </tr>
              </tbody>
            </table>
            
            <p className="text-slate-700 font-medium">We never sell your data to third parties.</p>
          </section>

          {/* 6. Data Retention */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. How Long We Keep Your Data</h2>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Data Type</th>
                  <th className="px-4 py-2 text-left text-slate-700">Retention</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">Account data</td>
                  <td className="px-4 py-2">Until you request deletion</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Transaction records</td>
                  <td className="px-4 py-2">7 years (legal requirement)</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Blockchain data</td>
                  <td className="px-4 py-2">Permanent (cannot be deleted)</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 7. Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p className="text-slate-700 mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li><strong>Access</strong> — request a copy of your data</li>
              <li><strong>Correct</strong> — fix inaccurate information</li>
              <li><strong>Delete</strong> — request removal of your account data</li>
              <li><strong>Export</strong> — receive your data in a portable format</li>
            </ul>
            <p className="text-slate-700 mt-3">
              Note: We cannot delete blockchain records — they are permanent by design.
            </p>
            <p className="text-slate-700 mt-3">
              To exercise these rights, email <a href="mailto:mark@yesallofus.com" className="text-blue-600 hover:underline">mark@yesallofus.com</a>.
            </p>
          </section>

          {/* 8. Security */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Security</h2>
            <p className="text-slate-700 mb-3">We protect your data with:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Encryption in transit (TLS 1.2+)</li>
              <li>Encryption at rest (AES-256)</li>
              <li>Access controls and monitoring</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                <strong>Your responsibility:</strong> Keep your wallet credentials secure. We recommend not storing large amounts in your payment wallet — transfer only what you need.
              </p>
            </div>
          </section>

          {/* 9. Cookies */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Cookies</h2>
            <p className="text-slate-700">
              We use only essential cookies required for the checkout to function. We do not use tracking, advertising, or analytics cookies.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
            <p className="text-slate-700 mb-3">For privacy questions:</p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700"><strong>YesAllofUs</strong></p>
              <p className="text-slate-700">Guernsey, Channel Islands</p>
              <p className="text-slate-700 mt-2">
                <strong>Email:</strong> <a href="mailto:mark@yesallofus.com" className="text-blue-600 hover:underline">mark@yesallofus.com</a>
              </p>
            </div>
          </section>

          {/* 11. Full Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Full Privacy Policy</h2>
            <p className="text-slate-700">
              This is a summary for checkout users. For the complete privacy policy covering all YesAllofUs services, see our <a href="/privacy" className="text-blue-600 hover:underline">full Privacy Policy</a>.
            </p>
          </section>

        </div>

        {/* Acceptance */}
        <div className="border-t border-slate-200 pt-6 mt-10">
          <p className="text-slate-600 text-sm">
            By using YesAllofUs checkout, you acknowledge this privacy notice.
          </p>
        </div>
      </main>
    </div>
  );
}