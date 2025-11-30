'use client';
import React, { useState, ReactNode } from 'react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/dltpayslogo1.png" alt="YesAllofUs" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-slate-900">YesAllofUs</span>
          </a>
          <nav className="flex gap-6 text-sm">
            <a href="/terms" className="text-slate-600 hover:text-slate-900">Terms</a>
            <a href="/privacy" className="text-slate-600 hover:text-slate-900">Privacy</a>
            <a href="/acceptable-use" className="text-slate-600 hover:text-slate-900">Acceptable Use</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
          <p className="text-slate-600">Last updated: 28 November 2025</p>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-blue-900 mb-3">🍪 Cookie Summary</h2>
          <ul className="text-blue-800 text-sm space-y-2">
            <li><strong>We use minimal cookies:</strong> Only essential cookies required for the service to function.</li>
            <li><strong>No tracking cookies:</strong> We don&apos;t use Google Analytics, Facebook Pixel, or any advertising trackers.</li>
            <li><strong>No third-party marketing:</strong> Your browsing data isn&apos;t shared with advertisers.</li>
            <li><strong>You&apos;re in control:</strong> You can disable cookies in your browser settings.</li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">

          {/* What are Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What Are Cookies?</h2>
            <p className="text-slate-700 mb-4">
              Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, like your preferences or login status.
            </p>
            <p className="text-slate-700">
              Cookies can be &quot;session&quot; cookies (deleted when you close your browser) or &quot;persistent&quot; cookies (remain until they expire or you delete them).
            </p>
          </section>

          {/* Cookies We Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies We Use</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Essential Cookies</h3>
            <p className="text-slate-700 mb-4">
              These cookies are strictly necessary for the website to function. They cannot be disabled.
            </p>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-6">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Cookie Name</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                  <th className="px-4 py-2 text-left text-slate-700">Duration</th>
                  <th className="px-4 py-2 text-left text-slate-700">Type</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">dltpays_ref</td>
                  <td className="px-4 py-2">Stores affiliate referral code for commission attribution</td>
                  <td className="px-4 py-2">30 days</td>
                  <td className="px-4 py-2">First-party</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2 font-mono text-xs">dltpays_session</td>
                  <td className="px-4 py-2">Maintains your session state during wallet connection</td>
                  <td className="px-4 py-2">Session</td>
                  <td className="px-4 py-2">First-party</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">__cf_bm</td>
                  <td className="px-4 py-2">Cloudflare bot management (security)</td>
                  <td className="px-4 py-2">30 minutes</td>
                  <td className="px-4 py-2">Third-party</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Cookies We DON&apos;T Use</h3>
            <p className="text-slate-700 mb-4">We do not use:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Analytics cookies</strong> — No Google Analytics, Mixpanel, or similar</li>
              <li><strong>Advertising cookies</strong> — No Facebook Pixel, Google Ads, or retargeting</li>
              <li><strong>Social media cookies</strong> — No Facebook, Twitter, or LinkedIn tracking</li>
              <li><strong>Personalisation cookies</strong> — No behavioural profiling</li>
            </ul>
          </section>

          {/* Local Storage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Local Storage &amp; Session Storage</h2>
            <p className="text-slate-700 mb-4">
              In addition to cookies, we use browser storage for temporary data:
            </p>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Key</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                  <th className="px-4 py-2 text-left text-slate-700">Storage Type</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">dltpays_store_id</td>
                  <td className="px-4 py-2">Remembers your store during wallet connection flow</td>
                  <td className="px-4 py-2">Session Storage</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2 font-mono text-xs">dltpays_connection_id</td>
                  <td className="px-4 py-2">Tracks pending Xaman connection for polling</td>
                  <td className="px-4 py-2">Session Storage</td>
                </tr>
              </tbody>
            </table>
            <p className="text-slate-700">
              Session storage is automatically cleared when you close your browser tab.
            </p>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
            <p className="text-slate-700 mb-4">
              Some third-party services we use may set their own cookies:
            </p>

            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Cloudflare</h4>
                <p className="text-slate-600 text-sm">CDN and security services. May set cookies for bot protection and performance.</p>
                <p className="text-slate-500 text-xs mt-1">
                  <a href="https://www.cloudflare.com/cookie-policy/" className="text-blue-600" target="_blank">Cloudflare Cookie Policy →</a>
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">PayPal (Subscription Payments)</h4>
                <p className="text-slate-600 text-sm">If you pay for a subscription, PayPal may set cookies during checkout.</p>
                <p className="text-slate-500 text-xs mt-1">
                  <a href="https://www.paypal.com/uk/webapps/mpp/ua/cookie-full" className="text-blue-600" target="_blank">PayPal Cookie Policy →</a>
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Calendly (Booking Calls)</h4>
                <p className="text-slate-600 text-sm">If you book a setup call, Calendly may set cookies on their domain.</p>
                <p className="text-slate-500 text-xs mt-1">
                  <a href="https://calendly.com/privacy" className="text-blue-600" target="_blank">Calendly Privacy Policy →</a>
                </p>
              </div>
            </div>
          </section>

          {/* WordPress Plugin */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">WordPress Plugin Cookies</h2>
            <p className="text-slate-700 mb-4">
              If you install the YesAllofUs WordPress plugin, it sets the following cookie on your store&apos;s visitors:
            </p>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Cookie Name</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                  <th className="px-4 py-2 text-left text-slate-700">Duration</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">dltpays_ref</td>
                  <td className="px-4 py-2">Stores the affiliate referral code when a visitor arrives via an affiliate link (?ref=CODE). Used to attribute commissions when the visitor makes a purchase.</td>
                  <td className="px-4 py-2">30 days (configurable)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-slate-700">
              As a store owner using YesAllofUs, you should update your own cookie policy to disclose this cookie to your customers.
            </p>
          </section>

          {/* Managing Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Managing Cookies</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Browser Settings</h3>
            <p className="text-slate-700 mb-4">
              You can control cookies through your browser settings. Here&apos;s how:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600" target="_blank">Google Chrome →</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-blue-600" target="_blank">Mozilla Firefox →</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-blue-600" target="_blank">Apple Safari →</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600" target="_blank">Microsoft Edge →</a></li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Consequences of Disabling Cookies</h3>
            <p className="text-slate-700 mb-4">If you disable cookies:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Referral tracking won&apos;t work</strong> — Affiliate commissions may not be attributed correctly</li>
              <li><strong>Wallet connection may fail</strong> — Session data is needed for the connection flow</li>
              <li><strong>Security features may be impacted</strong> — Cloudflare bot protection relies on cookies</li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Do Not Track</h2>
            <p className="text-slate-700">
              Some browsers send a &quot;Do Not Track&quot; (DNT) signal. Since we don&apos;t use tracking or advertising cookies, our practices are the same whether or not you have DNT enabled.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Updates to This Policy</h2>
            <p className="text-slate-700">
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-700 mb-4">Questions about our use of cookies?</p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a></p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2025 YesAllofUs. All rights reserved.</p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="/terms" className="hover:text-slate-900">Terms</a>
            <a href="/privacy" className="hover:text-slate-900">Privacy</a>
            <a href="/acceptable-use" className="hover:text-slate-900">Acceptable Use</a>
            <a href="/cookies" className="hover:text-slate-900">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}