'use client';
import React, { useState, ReactNode } from 'react';

export default function AcceptableUsePolicy() {
  return (
    <div className="min-h-screen bg-white">

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Acceptable Use Policy</h1>
          <p className="text-slate-600">Last updated: 28 November 2025</p>
        </div>

        {/* Introduction */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-red-900 mb-3">⚠️ Zero Tolerance Policy</h2>
          <p className="text-red-800 text-sm">
            YesAllofUs has a zero tolerance policy for illegal activity, fraud, and abuse. Violations will result in immediate account termination and may be reported to law enforcement. We reserve the right to refuse service to anyone.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">

          {/* Purpose */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Purpose</h2>
            <p className="text-slate-700 mb-4">
              This Acceptable Use Policy (&quot;AUP&quot;) defines the rules and guidelines for using YesAllofUs. It is designed to protect our users, affiliates, and the broader community from harm. By using YesAllofUs, you agree to comply with this policy.
            </p>
            <p className="text-slate-700">
              This AUP is incorporated into and forms part of our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Prohibited Activities</h2>
            <p className="text-slate-700 mb-6">You may NOT use YesAllofUs for any of the following:</p>

            {/* Illegal Activities */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">🚫</span> Illegal Activities
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Money laundering</strong> or terrorist financing</li>
                <li><strong>Tax evasion</strong> or facilitating tax fraud</li>
                <li><strong>Selling illegal goods</strong> including drugs, weapons, counterfeit items, or stolen property</li>
                <li><strong>Human trafficking</strong> or exploitation of any kind</li>
                <li><strong>Child exploitation material</strong> (CSAM) — we report all instances to NCMEC/IWF</li>
                <li><strong>Illegal gambling</strong> or unlicensed gaming operations</li>
                <li><strong>Securities fraud</strong> or market manipulation</li>
                <li><strong>Intellectual property theft</strong> or piracy</li>
                <li>Any activity that violates applicable laws or regulations</li>
              </ul>
            </div>

            {/* Fraud & Deception */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">🚫</span> Fraud &amp; Deception
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Phishing</strong> or impersonating other businesses or individuals</li>
                <li><strong>Fake affiliate schemes</strong> or pyramid schemes</li>
                <li><strong>Click fraud</strong> or artificial inflation of referrals</li>
                <li><strong>Self-referrals</strong> or referring yourself under fake identities</li>
                <li><strong>Chargebacks fraud</strong> or disputing legitimate transactions</li>
                <li><strong>Misrepresenting products</strong> or making false claims</li>
                <li>Creating multiple accounts to circumvent limits or bans</li>
              </ul>
            </div>

            {/* Harmful Content */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">🚫</span> Harmful Content
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Hate speech</strong> or content promoting violence against protected groups</li>
                <li><strong>Harassment or bullying</strong> of any individual</li>
                <li><strong>Doxxing</strong> or sharing private information without consent</li>
                <li><strong>Revenge porn</strong> or non-consensual intimate images</li>
                <li><strong>Terrorism promotion</strong> or extremist content</li>
                <li><strong>Self-harm promotion</strong> or suicide encouragement</li>
                <li><strong>Animal cruelty</strong> content or promotion</li>
              </ul>
            </div>

            {/* Technical Abuse */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">🚫</span> Technical Abuse
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Hacking attempts</strong> or unauthorised access to systems</li>
                <li><strong>Malware distribution</strong> or virus spreading</li>
                <li><strong>DDoS attacks</strong> or intentional service disruption</li>
                <li><strong>Scraping beyond rate limits</strong> or data harvesting</li>
                <li><strong>Reverse engineering</strong> our software or API</li>
                <li><strong>Circumventing security measures</strong> or access controls</li>
                <li><strong>Exploiting vulnerabilities</strong> without responsible disclosure</li>
                <li><strong>API abuse</strong> or excessive automated requests</li>
              </ul>
            </div>

            {/* Spam & Abuse */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">🚫</span> Spam &amp; Abuse
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Spamming</strong> referral links or unsolicited marketing</li>
                <li><strong>Fake reviews</strong> or testimonials</li>
                <li><strong>Bot-generated traffic</strong> or artificial engagement</li>
                <li><strong>Cookie stuffing</strong> or affiliate fraud techniques</li>
                <li><strong>Domain squatting</strong> or typosquatting to capture traffic</li>
              </ul>
            </div>
          </section>

          {/* Restricted Businesses */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Restricted Business Categories</h2>
            <p className="text-slate-700 mb-4">
              The following business types require prior approval before using YesAllofUs. Contact us at <a href="mailto:mark@yesallofus.com" className="text-blue-600">mark@yesallofus.com</a> for review:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Requires Approval</h4>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• Adult content (legal, age-verified)</li>
                  <li>• CBD/hemp products (where legal)</li>
                  <li>• Cryptocurrency trading platforms</li>
                  <li>• NFT marketplaces</li>
                  <li>• Licensed gambling/gaming</li>
                  <li>• Firearms (where legal)</li>
                  <li>• Alcohol (where legal)</li>
                  <li>• Tobacco/vaping products</li>
                  <li>• Multi-level marketing</li>
                  <li>• High-risk supplements</li>
                </ul>
              </div>
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Why Approval?</h4>
                <p className="text-slate-600 text-sm">
                  These industries have additional legal requirements, age restrictions, or higher fraud risk. We review each case individually to ensure compliance and protect all parties.
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Approval is not guaranteed. Operating in these categories without approval will result in immediate termination.
                </p>
              </div>
            </div>
          </section>

          {/* Affiliate Conduct */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Affiliate Conduct Standards</h2>
            <p className="text-slate-700 mb-4">
              As a store using YesAllofUs, you are responsible for ensuring your affiliates comply with these standards:
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Affiliates MUST:</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Disclose their affiliate relationship in compliance with FTC guidelines</li>
              <li>Make honest and accurate claims about products</li>
              <li>Respect intellectual property rights</li>
              <li>Comply with all applicable advertising laws</li>
              <li>Use only approved marketing materials and claims</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Affiliates MUST NOT:</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Use spam or unsolicited marketing</li>
              <li>Make false or exaggerated claims</li>
              <li>Bid on brand keywords without permission</li>
              <li>Use cookie stuffing or click fraud</li>
              <li>Create fake reviews or testimonials</li>
              <li>Impersonate the brand or its employees</li>
            </ul>
          </section>

          {/* API Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">API Usage Guidelines</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Rate Limits</h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-700">Limit Type</th>
                  <th className="px-4 py-2 text-left text-slate-700">Limit</th>
                  <th className="px-4 py-2 text-left text-slate-700">Window</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-t">
                  <td className="px-4 py-2">Per IP Address</td>
                  <td className="px-4 py-2">60 requests</td>
                  <td className="px-4 py-2">1 minute</td>
                </tr>
                <tr className="border-t bg-slate-50">
                  <td className="px-4 py-2">Per Store (payouts)</td>
                  <td className="px-4 py-2">10 requests</td>
                  <td className="px-4 py-2">1 minute</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Daily Payout Volume</td>
                  <td className="px-4 py-2">$1,000 default</td>
                  <td className="px-4 py-2">24 hours</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">API Best Practices</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Use exponential backoff for retries</li>
              <li>Cache responses where appropriate</li>
              <li>Don&apos;t poll more frequently than necessary</li>
              <li>Handle rate limit responses (429) gracefully</li>
              <li>Use webhooks instead of polling when available</li>
              <li>Keep your API credentials secure</li>
            </ul>
          </section>

          {/* Reporting */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Reporting Violations</h2>
            <p className="text-slate-700 mb-4">
              If you become aware of any violation of this policy, please report it immediately:
            </p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:mark@yesallofus.com" className="text-blue-600">mark@yesallofus.com</a></p>
              <p className="text-slate-700 mt-2"><strong>Include:</strong></p>
              <ul className="list-disc pl-6 text-slate-600 text-sm mt-1">
                <li>Description of the violation</li>
                <li>Store name or wallet address involved</li>
                <li>Supporting evidence (screenshots, URLs, etc.)</li>
                <li>Your contact information (optional but helpful)</li>
              </ul>
            </div>
            <p className="text-slate-700 mt-4">
              We investigate all reports promptly and take action as appropriate. Reporters may remain anonymous.
            </p>
          </section>

          {/* Enforcement */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Enforcement</h2>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Actions We May Take</h3>
            <p className="text-slate-700 mb-4">Depending on the severity and nature of the violation, we may:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><strong>Issue a warning</strong> and request corrective action</li>
              <li><strong>Temporarily suspend</strong> your account pending investigation</li>
              <li><strong>Permanently terminate</strong> your account without refund</li>
              <li><strong>Withhold pending payouts</strong> where fraud is suspected</li>
              <li><strong>Report to law enforcement</strong> for illegal activity</li>
              <li><strong>Pursue legal action</strong> for damages caused</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Appeal Process</h3>
            <p className="text-slate-700 mb-4">
              If you believe an enforcement action was made in error, you may appeal by emailing <a href="mailto:mark@yesallofus.com" className="text-blue-600">mark@yesallofus.com</a> within 14 days. Include:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Your store ID</li>
              <li>The enforcement action taken</li>
              <li>Why you believe it was an error</li>
              <li>Any supporting evidence</li>
            </ul>
            <p className="text-slate-700 mt-4">
              We will review appeals within 7 business days. Our decision on appeal is final.
            </p>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
            <p className="text-slate-700">
              We may update this Acceptable Use Policy from time to time. Material changes will be communicated via email. Continued use of YesAllofUs after changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
            <p className="text-slate-700 mb-4">Questions about this policy?</p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700"><strong>General inquiries:</strong> <a href="mailto:mark@yesallofus.com" className="text-blue-600">mark@yesallofus.com</a></p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}