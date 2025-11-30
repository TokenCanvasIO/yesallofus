'use client';
import React, { useState, ReactNode } from 'react';

export default function PrivacyPolicy() {
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
            <a href="/acceptable-use" className="text-slate-600 hover:text-slate-900">Acceptable Use</a>
            <a href="/cookies" className="text-slate-600 hover:text-slate-900">Cookies</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: 28 November 2025</p>
        </div>

        {/* Plain English Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-green-900 mb-3">🔒 Privacy at a Glance</h2>
          <ul className="text-green-800 text-sm space-y-2">
            <li><strong>We collect minimal data:</strong> Just what&apos;s needed to run the service (email, store URL, wallet addresses).</li>
            <li><strong>We never sell your data:</strong> Your information is never sold to third parties. Period.</li>
            <li><strong>Blockchain is public:</strong> Wallet addresses and transactions are visible on the XRP Ledger — that&apos;s how blockchain works.</li>
            <li><strong>You can delete your account:</strong> Request deletion and we&apos;ll remove your data (except blockchain records, which are immutable).</li>
            <li><strong>We use minimal cookies:</strong> Only essential cookies for the service to function. No tracking or advertising cookies.</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ol className="text-sm text-slate-600 space-y-2 columns-2">
            <li><a href="#who-we-are" className="hover:text-blue-600">1. Who We Are</a></li>
            <li><a href="#data-we-collect" className="hover:text-blue-600">2. Data We Collect</a></li>
            <li><a href="#how-we-use" className="hover:text-blue-600">3. How We Use Your Data</a></li>
            <li><a href="#legal-basis" className="hover:text-blue-600">4. Legal Basis for Processing</a></li>
            <li><a href="#data-sharing" className="hover:text-blue-600">5. Data Sharing</a></li>
            <li><a href="#blockchain-data" className="hover:text-blue-600">6. Blockchain Data</a></li>
            <li><a href="#data-retention" className="hover:text-blue-600">7. Data Retention</a></li>
            <li><a href="#your-rights" className="hover:text-blue-600">8. Your Rights</a></li>
            <li><a href="#data-security" className="hover:text-blue-600">9. Data Security</a></li>
            <li><a href="#international" className="hover:text-blue-600">10. International Transfers</a></li>
            <li><a href="#children" className="hover:text-blue-600">11. Children&apos;s Privacy</a></li>
            <li><a href="#changes" className="hover:text-blue-600">12. Changes to This Policy</a></li>
            <li><a href="#contact" className="hover:text-blue-600">13. Contact Us</a></li>
          </ol>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">

          {/* 1. Who We Are */}
          <section id="who-we-are" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Who We Are</h2>
            <p className="text-slate-700 mb-4">
              YesAllofUs is operated by Mark Flynn, a sole proprietorship based in Guernsey, Channel Islands. We are the data controller for the personal data processed through our service.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700"><strong>Data Controller:</strong> Mark Flynn (YesAllofUs)</p>
              <p className="text-slate-700"><strong>Location:</strong> Guernsey, Channel Islands</p>
              <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a></p>
            </div>
          </section>

          {/* 2. Data We Collect */}
          <section id="data-we-collect" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.1 Information You Provide</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Data Type</th>
                  <th className="px-4 py-2 text-left text-slate-700">Examples</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">Account Information</td>
                  <td className="px-4 py-2">Store name, store URL, email address</td>
                  <td className="px-4 py-2">Account creation and communication</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Wallet Addresses</td>
                  <td className="px-4 py-2">XRP Ledger addresses (public keys)</td>
                  <td className="px-4 py-2">Processing payments</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Affiliate Data</td>
                  <td className="px-4 py-2">Wallet addresses, referral codes</td>
                  <td className="px-4 py-2">Commission tracking and payments</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Payment Information</td>
                  <td className="px-4 py-2">PayPal email (for subscriptions)</td>
                  <td className="px-4 py-2">Subscription billing</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Data Type</th>
                  <th className="px-4 py-2 text-left text-slate-700">Examples</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">API Usage Data</td>
                  <td className="px-4 py-2">Endpoints called, timestamps, IP addresses</td>
                  <td className="px-4 py-2">Rate limiting, security, debugging</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Transaction Records</td>
                  <td className="px-4 py-2">Order IDs, amounts, payout status</td>
                  <td className="px-4 py-2">Service delivery, record keeping</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Device Information</td>
                  <td className="px-4 py-2">Browser type, operating system</td>
                  <td className="px-4 py-2">Compatibility, troubleshooting</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Log Data</td>
                  <td className="px-4 py-2">Error logs, access logs</td>
                  <td className="px-4 py-2">Debugging, security monitoring</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.3 Information We Do NOT Collect</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Private keys or wallet seeds</li>
              <li>Personal identification documents</li>
              <li>Social Security or national ID numbers</li>
              <li>Banking details (other than PayPal for subscriptions)</li>
              <li>Biometric data</li>
              <li>Health or medical information</li>
            </ul>
          </section>

          {/* 3. How We Use Your Data */}
          <section id="how-we-use" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Data</h2>
            <p className="text-slate-700 mb-4">We use your personal data for the following purposes:</p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.1 Service Delivery</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Creating and managing your account</li>
              <li>Processing affiliate commission payments</li>
              <li>Connecting your wallet to the service</li>
              <li>Sending transaction notifications</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.2 Communication</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Responding to support requests</li>
              <li>Sending service updates and announcements</li>
              <li>Notifying you of changes to our terms or policies</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.3 Security and Fraud Prevention</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Monitoring for suspicious activity</li>
              <li>Enforcing rate limits</li>
              <li>Preventing abuse of the service</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.4 Service Improvement</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Analysing usage patterns to improve the service</li>
              <li>Debugging technical issues</li>
              <li>Developing new features</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.5 Legal Compliance</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Complying with applicable laws and regulations</li>
              <li>Responding to lawful requests from authorities</li>
              <li>Establishing, exercising, or defending legal claims</li>
            </ul>
          </section>

          {/* 4. Legal Basis for Processing */}
          <section id="legal-basis" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-slate-700 mb-4">Under GDPR and similar privacy laws, we process your data based on:</p>

            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Legal Basis</th>
                  <th className="px-4 py-2 text-left text-slate-700">Applies To</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Contract Performance</td>
                  <td className="px-4 py-2">Processing payments, managing your account, delivering the service you signed up for</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2 font-medium">Legitimate Interests</td>
                  <td className="px-4 py-2">Security monitoring, fraud prevention, service improvement, analytics</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Legal Obligation</td>
                  <td className="px-4 py-2">Complying with tax laws, responding to legal requests, maintaining required records</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2 font-medium">Consent</td>
                  <td className="px-4 py-2">Marketing communications (where applicable)</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5. Data Sharing */}
          <section id="data-sharing" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.1 We Share Data With:</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Recipient</th>
                  <th className="px-4 py-2 text-left text-slate-700">Data Shared</th>
                  <th className="px-4 py-2 text-left text-slate-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">XRP Ledger</td>
                  <td className="px-4 py-2">Wallet addresses, transaction amounts</td>
                  <td className="px-4 py-2">Payment execution (public blockchain)</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Xaman/Crossmark</td>
                  <td className="px-4 py-2">Store name (in signing requests)</td>
                  <td className="px-4 py-2">Wallet connection</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Firebase (Google)</td>
                  <td className="px-4 py-2">Account data, transaction records</td>
                  <td className="px-4 py-2">Database hosting</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">DigitalOcean</td>
                  <td className="px-4 py-2">Server logs</td>
                  <td className="px-4 py-2">Infrastructure hosting</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">PayPal</td>
                  <td className="px-4 py-2">Email, subscription amount</td>
                  <td className="px-4 py-2">Subscription billing</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.2 We Do NOT:</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Sell your personal data to third parties</li>
              <li>Share your data with advertisers</li>
              <li>Use your data for profiling or targeted advertising</li>
              <li>Share your data with data brokers</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.3 Legal Disclosures</h3>
            <p className="text-slate-700 mb-4">
              We may disclose your data if required by law, court order, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>
          </section>

          {/* 6. Blockchain Data */}
          <section id="blockchain-data" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Blockchain Data</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> The XRP Ledger is a public blockchain. Transactions recorded on it are permanent, transparent, and cannot be deleted or modified by anyone, including YesAllofUs.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.1 What&apos;s Public on the Blockchain</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Wallet addresses (sender and recipient)</li>
              <li>Transaction amounts</li>
              <li>Transaction timestamps</li>
              <li>Transaction memos (containing order IDs)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.2 What&apos;s NOT on the Blockchain</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Your name or email address</li>
              <li>Your store name or URL</li>
              <li>Any personal identification</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.3 Wallet Address Pseudonymity</h3>
            <p className="text-slate-700 mb-4">
              While wallet addresses are public, they are pseudonymous — they don&apos;t inherently reveal your identity. However, if you publicly associate your wallet address with your identity (e.g., on social media), that connection becomes public.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section id="data-retention" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Data Retention</h2>

            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Data Type</th>
                  <th className="px-4 py-2 text-left text-slate-700">Retention Period</th>
                  <th className="px-4 py-2 text-left text-slate-700">Reason</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">Account Data</td>
                  <td className="px-4 py-2">Until deletion requested + 30 days</td>
                  <td className="px-4 py-2">Service delivery</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Transaction Records</td>
                  <td className="px-4 py-2">7 years</td>
                  <td className="px-4 py-2">Tax and legal compliance</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">API Logs</td>
                  <td className="px-4 py-2">90 days</td>
                  <td className="px-4 py-2">Debugging, security</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Support Communications</td>
                  <td className="px-4 py-2">2 years</td>
                  <td className="px-4 py-2">Service quality</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Blockchain Data</td>
                  <td className="px-4 py-2">Permanent</td>
                  <td className="px-4 py-2">Immutable by design</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 8. Your Rights */}
          <section id="your-rights" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Your Rights</h2>
            <p className="text-slate-700 mb-4">Under GDPR and similar laws, you have the following rights:</p>

            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right of Access</h4>
                <p className="text-slate-600 text-sm">Request a copy of the personal data we hold about you.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Rectification</h4>
                <p className="text-slate-600 text-sm">Request correction of inaccurate or incomplete data.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Erasure (&quot;Right to be Forgotten&quot;)</h4>
                <p className="text-slate-600 text-sm">Request deletion of your data. Note: This does not apply to blockchain data, which is immutable.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Restrict Processing</h4>
                <p className="text-slate-600 text-sm">Request that we limit how we use your data.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Data Portability</h4>
                <p className="text-slate-600 text-sm">Receive your data in a structured, machine-readable format.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Object</h4>
                <p className="text-slate-600 text-sm">Object to processing based on legitimate interests.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800">Right to Withdraw Consent</h4>
                <p className="text-slate-600 text-sm">Withdraw consent for processing that relies on consent.</p>
              </div>
            </div>

            <p className="text-slate-700 mt-6">
              To exercise any of these rights, contact us at <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a>. We will respond within 30 days.
            </p>
          </section>

          {/* 9. Data Security */}
          <section id="data-security" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Data Security</h2>
            <p className="text-slate-700 mb-4">We implement appropriate technical and organisational measures to protect your data:</p>

            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Encryption in Transit:</strong> All API communications use TLS 1.2+</li>
              <li><strong>Encryption at Rest:</strong> Database data is encrypted using AES-256</li>
              <li><strong>Access Controls:</strong> API credentials are hashed; only you know your api_secret</li>
              <li><strong>Rate Limiting:</strong> Protection against brute force and DDoS attacks</li>
              <li><strong>Regular Backups:</strong> Data is backed up daily with encrypted storage</li>
              <li><strong>Monitoring:</strong> We monitor for unauthorised access attempts</li>
            </ul>

            <p className="text-slate-700 mt-4">
              Despite our efforts, no system is 100% secure. If you discover a security vulnerability, please report it to <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a>.
            </p>
          </section>

          {/* 10. International Transfers */}
          <section id="international" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. International Data Transfers</h2>
            <p className="text-slate-700 mb-4">
              YesAllofUs is based in Guernsey, Channel Islands. Your data may be transferred to and processed in:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><strong>United States:</strong> Google Firebase (database), DigitalOcean (servers)</li>
              <li><strong>European Union:</strong> Some server locations</li>
              <li><strong>Globally:</strong> XRP Ledger nodes are distributed worldwide</li>
            </ul>
            <p className="text-slate-700">
              Where data is transferred outside Guernsey/EU, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses or adequacy decisions.
            </p>
          </section>

          {/* 11. Children's Privacy */}
          <section id="children" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-slate-700 mb-4">
              YesAllofUs is not intended for use by anyone under 18 years of age. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it.
            </p>
          </section>

          {/* 12. Changes */}
          <section id="changes" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Posting the updated policy on our website</li>
              <li>Updating the &quot;Last updated&quot; date at the top</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
          </section>

          {/* 13. Contact */}
          <section id="contact" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Us</h2>
            <p className="text-slate-700 mb-4">For privacy-related questions or to exercise your rights:</p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700"><strong>YesAllofUs</strong></p>
              <p className="text-slate-700">Mark Flynn</p>
              <p className="text-slate-700">Guernsey, Channel Islands</p>
              <p className="text-slate-700 mt-2">
                <strong>Email:</strong> <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a>
              </p>
            </div>
            <p className="text-slate-700 mt-4">
              If you&apos;re not satisfied with our response, you have the right to lodge a complaint with a data protection authority.
            </p>
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