'use client';

import React, { useState, ReactNode } from 'react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
    >
      <span className="font-medium text-slate-900">{question}</span>
      <svg
        className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && (
      <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    // Getting Started
    {
      category: 'Getting Started',
      items: [
        {
          question: 'What is YesAllofUs?',
          answer: (
            <>
              <p className="mb-2">YesAllofUs is an affiliate commission payment platform built on the XRP Ledger. It allows you to pay affiliate commissions instantly in RLUSD (Ripple&apos;s stablecoin) when a sale completes — no more monthly payout spreadsheets or 30-60 day delays.</p>
              <p>We support 5-level MLM commission structures, WordPress/WooCommerce integration, and two wallet connection methods (Xaman and Crossmark).</p>
            </>
          )
        },
        {
          question: 'How do I get started?',
          answer: (
            <>
              <p className="mb-2">The fastest way is to run our CLI tool:</p>
              <code className="bg-slate-100 px-2 py-1 rounded text-sm block mb-2">npx YesAllofUs</code>
              <p className="mb-2">This will guide you through:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Registering your store</li>
                <li>Getting your API credentials</li>
                <li>Connecting your wallet</li>
              </ol>
              <p className="mt-2">Alternatively, if you use WordPress/WooCommerce, you can install our plugin which handles registration automatically.</p>
            </>
          )
        },
        {
          question: 'Is YesAllofUs free?',
          answer: (
            <>
              <p className="mb-2">Yes! We have a free tier with no monthly fees. Here&apos;s our pricing:</p>
              <ul className="space-y-1">
                <li><strong>Free:</strong> 2.9% per payout, $0/month</li>
                <li><strong>Pro:</strong> 0.9% per payout, $99/month</li>
                <li><strong>Enterprise:</strong> 0% per payout, $499/month</li>
              </ul>
              <p className="mt-2">No setup fees, no hidden charges, no credit card required to start.</p>
            </>
          )
        },
        {
          question: 'What countries do you support?',
          answer: (
            <>
              <p className="mb-2">YesAllofUs works globally wherever the XRP Ledger is accessible. Since payments are in RLUSD (a stablecoin), affiliates receive the same value regardless of their location.</p>
              <p>However, you are responsible for ensuring your use of the service complies with the laws of your jurisdiction. Some countries have restrictions on cryptocurrency usage.</p>
            </>
          )
        },
      ]
    },
    // Wallets & Payments
    {
      category: 'Wallets & Payments',
      items: [
        {
          question: 'What is RLUSD?',
          answer: (
            <>
              <p className="mb-2">RLUSD is Ripple USD — a stablecoin issued by Ripple on the XRP Ledger. It&apos;s pegged 1:1 to the US dollar and backed by dollar deposits and short-term US Treasury bonds.</p>
              <p>We use RLUSD because it provides stable value (unlike volatile cryptocurrencies), instant settlement (~4 seconds), and near-zero transaction fees.</p>
            </>
          )
        },
        {
          question: 'What wallets do you support?',
          answer: (
            <>
              <p className="mb-2">We support two wallet options:</p>
              <ul className="space-y-2">
                <li><strong>Xaman (mobile):</strong> Scan a QR code to connect. Supports manual approval via push notifications or automatic payments.</li>
                <li><strong>Crossmark (browser extension):</strong> Click to connect from your desktop browser. Supports automatic payments within your set limits.</li>
              </ul>
              <p className="mt-2">Both wallets are self-custodial — you always control your private keys.</p>
            </>
          )
        },
        {
          question: 'What is an RLUSD trustline and why do I need one?',
          answer: (
            <>
              <p className="mb-2">On the XRP Ledger, you need to explicitly &quot;trust&quot; an issuer before you can hold their token. This is called a trustline. Think of it as opting-in to receive a particular currency.</p>
              <p className="mb-2">Both you (the store) and your affiliates need RLUSD trustlines to send and receive commission payments.</p>
              <p>To add a trustline, use your wallet app (Xaman or Crossmark) to add the RLUSD issuer: <code className="bg-slate-100 px-1 rounded text-xs">rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De</code></p>
            </>
          )
        },
        {
          question: 'How fast are payments?',
          answer: (
            <>
              <p>Payments settle on the XRP Ledger in approximately 3-5 seconds. Once validated, they&apos;re final and irreversible — affiliates see the funds in their wallet almost instantly.</p>
            </>
          )
        },
        {
          question: 'Can payments be reversed or refunded?',
          answer: (
            <>
              <p className="mb-2">No. Blockchain transactions are final and irreversible once confirmed. YesAllofUs cannot reverse, modify, or recover payments.</p>
              <p>If you send a payment in error, you&apos;ll need to contact the recipient directly to request they return the funds.</p>
            </>
          )
        },
        {
          question: 'What happens if my wallet has insufficient funds?',
          answer: (
            <>
              <p>The payment will fail with an &quot;insufficient balance&quot; error. You&apos;ll need to add RLUSD to your wallet and retry the payout. We recommend keeping a buffer in your wallet to avoid failed payments.</p>
            </>
          )
        },
      ]
    },
    // Auto-Sign & Security
    {
      category: 'Auto-Sign & Security',
      items: [
        {
          question: 'What is Auto-Sign?',
          answer: (
            <>
              <p className="mb-2">Auto-Sign uses XRPL&apos;s multi-signature feature to allow YesAllofUs to automatically sign payment transactions on your behalf — without you having to approve each one manually.</p>
              <p className="mb-2">You add YesAllofUs as a &quot;signer&quot; on your wallet with weight 1 and set a quorum of 1. This means either you OR YesAllofUs can sign transactions.</p>
              <p>You control the limits (daily max, per-transaction max) and can revoke access anytime by removing the signer from your wallet.</p>
            </>
          )
        },
        {
          question: 'Does YesAllofUs have access to my private keys?',
          answer: (
            <>
              <p className="mb-2"><strong>No, never.</strong> We use XRPL&apos;s multi-signature feature, not key custody.</p>
              <p>Your private keys stay in your wallet (Xaman or Crossmark). YesAllofUs only has permission to co-sign transactions — we cannot access your keys, drain your wallet, or act outside the signer permissions you&apos;ve configured.</p>
            </>
          )
        },
        {
          question: 'Can YesAllofUs drain my wallet?',
          answer: (
            <>
              <p className="mb-2">No. Even with Auto-Sign enabled:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>We can only send payments to registered affiliates for valid orders</li>
                <li>We respect your daily and per-transaction limits</li>
                <li>Every transaction is logged publicly on the XRP Ledger</li>
                <li>You can revoke our signer access at any moment</li>
              </ul>
              <p className="mt-2">We&apos;re software that triggers payments — we don&apos;t have custody or control of your funds.</p>
            </>
          )
        },
        {
          question: 'How do I revoke Auto-Sign access?',
          answer: (
            <>
              <p className="mb-2">Go to your wallet app (Xaman or Crossmark) → Settings → Signers → Remove the YesAllofUs signer address.</p>
              <p>Revocation takes effect immediately once the transaction is confirmed on the XRP Ledger. No need to contact us — you&apos;re in full control.</p>
            </>
          )
        },
        {
          question: 'What happens if I use Manual mode instead of Auto-Sign?',
          answer: (
            <>
              <p className="mb-2">In Manual mode (Xaman only), each payment requires your explicit approval via push notification in the Xaman app.</p>
              <p>This gives you maximum control but requires you to be available to approve payouts. Payments not approved within 72 hours will expire and may be retried.</p>
            </>
          )
        },
      ]
    },
    // Affiliates & Commissions
    {
      category: 'Affiliates & Commissions',
      items: [
        {
          question: 'How do commission levels work?',
          answer: (
            <>
              <p className="mb-2">YesAllofUs supports 5-level MLM commissions. Default rates are:</p>
              <ul className="space-y-1">
                <li>Level 1 (direct referrer): 25%</li>
                <li>Level 2: 5%</li>
                <li>Level 3: 3%</li>
                <li>Level 4: 2%</li>
                <li>Level 5: 1%</li>
              </ul>
              <p className="mt-2">You can customize these rates when registering your store. Rates are percentages of the order total.</p>
            </>
          )
        },
        {
          question: 'Can I change commission rates after setup?',
          answer: (
            <>
              <p>Currently, commission rates are set at registration. Contact us at <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a> if you need to change them.</p>
            </>
          )
        },
        {
          question: 'How do affiliates sign up?',
          answer: (
            <>
              <p className="mb-2">Affiliates register through your store using the shortcode <code className="bg-slate-100 px-1 rounded">[dltpays_affiliate_signup]</code> (WordPress) or via your custom integration using our API.</p>
              <p>They provide their XRP Ledger wallet address and receive a unique referral code they can share.</p>
            </>
          )
        },
        {
          question: 'What if an affiliate does not have a RLUSD trustline?',
          answer: (
            <>
              <p>Their commission payment will be skipped with a &quot;no trustline&quot; note. The payment isn&apos;t lost — they need to add an RLUSD trustline to their wallet, and future payments will work. Past skipped payments are not automatically retried.</p>
            </>
          )
        },
        {
          question: 'How long do referral cookies last?',
          answer: (
            <>
              <p>The default cookie duration is 30 days. If a visitor clicks an affiliate link and purchases within 30 days, the affiliate gets credit. You can configure this duration in the WordPress plugin settings.</p>
            </>
          )
        },
      ]
    },
    // WordPress & Integration
    {
      category: 'WordPress & Integration',
      items: [
        {
          question: 'Does YesAllofUs work with WooCommerce?',
          answer: (
            <>
              <p className="mb-2">Yes! Our WordPress plugin integrates seamlessly with WooCommerce. When an order is marked as &quot;completed,&quot; commissions are automatically triggered.</p>
              <p>The plugin handles referral tracking, affiliate registration, and payment triggering — all automatically.</p>
            </>
          )
        },
        {
          question: 'Can I use YesAllofUs without WordPress?',
          answer: (
            <>
              <p className="mb-2">Absolutely. YesAllofUs has a full REST API that works with any platform:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Shopify (via webhook)</li>
                <li>Custom e-commerce platforms</li>
                <li>SaaS applications</li>
                <li>Mobile apps</li>
                <li>Any platform that can make HTTP requests</li>
              </ul>
              <p className="mt-2">See our <a href="/docs" className="text-blue-600">API documentation</a> for integration details.</p>
            </>
          )
        },
        {
          question: 'How do I test the integration?',
          answer: (
            <>
              <p className="mb-2">We recommend:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Register a test affiliate with a wallet you control</li>
                <li>Create a small test order ($1-5)</li>
                <li>Mark the order as complete</li>
                <li>Verify the commission appears in your wallet</li>
              </ol>
              <p className="mt-2">All payments are real (there&apos;s no &quot;sandbox&quot;), so use small amounts for testing.</p>
            </>
          )
        },
      ]
    },
    // Billing & Fees
    {
      category: 'Billing & Fees',
      items: [
        {
          question: 'How are platform fees collected?',
          answer: (
            <>
              <p>Platform fees are deducted automatically as a separate RLUSD payment from your wallet to YesAllofUs when each payout is processed. You&apos;ll see this as a distinct transaction on the XRP Ledger.</p>
            </>
          )
        },
        {
          question: 'Are there any hidden fees?',
          answer: (
            <>
              <p>No. We charge only:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Platform fee (2.9%, 0.9%, or 0% depending on tier)</li>
                <li>Monthly subscription (Pro: $99, Enterprise: $499)</li>
              </ul>
              <p className="mt-2">No setup fees, no integration fees, no withdrawal fees, no minimum volumes.</p>
            </>
          )
        },
        {
          question: 'What about XRP network fees?',
          answer: (
            <>
              <p>XRP Ledger transactions require a tiny amount of XRP for network fees (typically 0.00001-0.00002 XRP, less than $0.01). Your wallet needs a small XRP balance to cover these. This goes to the network, not YesAllofUs.</p>
            </>
          )
        },
        {
          question: 'Do you offer refunds?',
          answer: (
            <>
              <p>Monthly subscription fees are non-refundable. Platform fees are collected at the time of each payout and cannot be refunded after the blockchain transaction is confirmed.</p>
            </>
          )
        },
      ]
    },
    // Troubleshooting
    {
      category: 'Troubleshooting',
      items: [
        {
          question: 'My wallet connection isn&apos;t working',
          answer: (
            <>
              <p className="mb-2">Try these steps:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Ensure your wallet app (Xaman/Crossmark) is up to date</li>
                <li>Check that you&apos;re on a supported browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Disable any ad blockers temporarily</li>
                <li>Clear your browser&apos;s local storage and try again</li>
                <li>For Xaman: Ensure push notifications are enabled in the app</li>
              </ol>
              <p className="mt-2">If issues persist, email <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a> with your store ID.</p>
            </>
          )
        },
        {
          question: 'Payouts are failing with &quot;insufficient balance&quot;',
          answer: (
            <>
              <p className="mb-2">Your wallet needs:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Enough RLUSD to cover all commission payments + platform fee</li>
                <li>A small XRP balance for network fees (at least 10 XRP recommended)</li>
              </ul>
              <p className="mt-2">Add funds to your wallet and retry the payout.</p>
            </>
          )
        },
        {
          question: 'An affiliate says they didn&apos;t receive payment',
          answer: (
            <>
              <p className="mb-2">Check the following:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Verify the affiliate&apos;s wallet has an RLUSD trustline</li>
                <li>Check the payout status in your dashboard</li>
                <li>Look up the transaction on an XRP Ledger explorer (e.g., xrpscan.com)</li>
              </ol>
              <p className="mt-2">If the transaction shows as successful on the ledger, the affiliate definitely received the funds — they may need to check their wallet&apos;s RLUSD balance specifically.</p>
            </>
          )
        },
        {
          question: 'I&apos;m getting rate limited (429 errors)',
          answer: (
            <>
              <p className="mb-2">Our rate limits are:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>60 requests per minute per IP</li>
                <li>10 payout requests per minute per store</li>
              </ul>
              <p className="mt-2">Implement exponential backoff in your integration. If you need higher limits for a legitimate use case, contact us.</p>
            </>
          )
        },
      ]
    },
    // Account & Support
    {
      category: 'Account & Support',
      items: [
        {
          question: 'How do I delete my account?',
          answer: (
            <>
              <p className="mb-2">You can delete your account via the API:</p>
              <code className="bg-slate-100 px-2 py-1 rounded text-sm block mb-2">DELETE /api/v1/store</code>
              <p className="mb-2">With body: <code className="bg-slate-100 px-1 rounded text-xs">{`{"confirm": "PERMANENTLY DELETE"}`}</code></p>
              <p>This removes all your data (except blockchain transactions, which are immutable). Don&apos;t forget to remove YesAllofUs as a signer from your wallet first.</p>
            </>
          )
        },
        {
          question: 'How do I contact support?',
          answer: (
            <>
              <p className="mb-2">Email <a href="mailto:mark@YesAllofUs.com" className="text-blue-600">mark@YesAllofUs.com</a> for:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Technical support</li>
                <li>Account issues</li>
                <li>Feature requests</li>
                <li>Integration help</li>
              </ul>
              <p className="mt-2">For the done-for-you setup service (£499), <a href="https://calendly.com/tokencanvasio/30min" className="text-blue-600" target="_blank">book a call</a>.</p>
            </>
          )
        },
        {
          question: 'Is there an SLA or uptime guarantee?',
          answer: (
            <>
              <p>We aim for 99.9% uptime but don&apos;t offer a formal SLA at this time. The service depends on third-party infrastructure (XRP Ledger, Xaman, Crossmark, cloud providers) that is outside our control.</p>
            </>
          )
        },
      ]
    },
  ];

  let globalIndex = 0;

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
            <a href="/docs" className="text-slate-600 hover:text-slate-900">Docs</a>
            <a href="/#get-started" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Get Started</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-600">Everything you need to know about YesAllofUs</p>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-slate-900 mb-4">Jump to section</h2>
          <div className="flex flex-wrap gap-2">
            {faqs.map((section) => (
              <a
                key={section.category}
                href={`#${section.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {section.category}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        {faqs.map((section) => {
          const sectionStartIndex = globalIndex;
          return (
            <section
              key={section.category}
              id={section.category.toLowerCase().replace(/\s+/g, '-')}
              className="mb-12 scroll-mt-24"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => {
                  const currentGlobalIndex = globalIndex++;
                  return (
                    <FAQItem
                      key={itemIndex}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openIndex === currentGlobalIndex}
                      onClick={() => setOpenIndex(openIndex === currentGlobalIndex ? null : currentGlobalIndex)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Still have questions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Still have questions?</h2>
          <p className="text-blue-800 mb-4">We&apos;re here to help.</p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:mark@YesAllofUs.com"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email Support
            </a>
            <a
              href="https://calendly.com/tokencanvasio/30min"
              target="_blank"
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Book a Call
            </a>
          </div>
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