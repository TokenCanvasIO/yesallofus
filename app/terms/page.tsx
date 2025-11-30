'use client';
import React, { useState, ReactNode } from 'react';

export default function TermsOfService() {
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
            <a href="/privacy" className="text-slate-600 hover:text-slate-900">Privacy</a>
            <a href="/acceptable-use" className="text-slate-600 hover:text-slate-900">Acceptable Use</a>
            <a href="/cookies" className="text-slate-600 hover:text-slate-900">Cookies</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600">Last updated: 28 November 2025</p>
        </div>

        {/* Plain English Summary */}
<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
  <h2 className="font-semibold text-blue-900 mb-3">📋 Plain English Summary</h2>
  <p className="text-blue-800 text-sm leading-relaxed mb-4">
    Before the legal language, here&apos;s what you&apos;re agreeing to in simple terms:
  </p>
  <ul className="text-blue-800 text-sm space-y-2">
    <li><strong>What YesAllofUs does:</strong> We provide software that triggers affiliate commission payments from YOUR wallet to affiliate wallets. We never hold or control your funds.</li>
    <li><strong>Your responsibility:</strong> You own your wallet, set your limits, and are responsible for ensuring you have sufficient funds and valid trustlines.</li>
    <li><strong>Our responsibility:</strong> We process payment instructions accurately, keep the service running, and protect your API credentials.</li>
    <li><strong>Not financial advice:</strong> YesAllofUs is software that triggers payments. We do not provide financial advice or hold customer funds.</li>
    <li><strong>Fees:</strong> We charge 2.9% (Free), 0.9% (Pro), or 0% (Enterprise) of each payout amount. No hidden fees.</li>
    <li><strong>You can leave anytime:</strong> Revoke our signer access from your wallet and your relationship with us ends. No lock-in.</li>
    <li><strong>We can terminate:</strong> If you violate these terms, use the service for illegal purposes, or don&apos;t pay subscription fees.</li>
  </ul>
</div>

        {/* Table of Contents */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ol className="text-sm text-slate-600 space-y-2 columns-2">
            <li><a href="#definitions" className="hover:text-blue-600">1. Definitions</a></li>
            <li><a href="#service-description" className="hover:text-blue-600">2. Service Description</a></li>
            <li><a href="#account-registration" className="hover:text-blue-600">3. Account Registration</a></li>
            <li><a href="#wallet-connection" className="hover:text-blue-600">4. Wallet Connection</a></li>
            <li><a href="#payment-processing" className="hover:text-blue-600">5. Payment Processing</a></li>
            <li><a href="#fees-billing" className="hover:text-blue-600">6. Fees and Billing</a></li>
            <li><a href="#your-obligations" className="hover:text-blue-600">7. Your Obligations</a></li>
            <li><a href="#prohibited-uses" className="hover:text-blue-600">8. Prohibited Uses</a></li>
            <li><a href="#intellectual-property" className="hover:text-blue-600">9. Intellectual Property</a></li>
            <li><a href="#data-privacy" className="hover:text-blue-600">10. Data and Privacy</a></li>
            <li><a href="#disclaimers" className="hover:text-blue-600">11. Disclaimers</a></li>
            <li><a href="#limitation-liability" className="hover:text-blue-600">12. Limitation of Liability</a></li>
            <li><a href="#indemnification" className="hover:text-blue-600">13. Indemnification</a></li>
            <li><a href="#termination" className="hover:text-blue-600">14. Termination</a></li>
            <li><a href="#dispute-resolution" className="hover:text-blue-600">15. Dispute Resolution</a></li>
            <li><a href="#general" className="hover:text-blue-600">16. General Provisions</a></li>
            <li><a href="#contact" className="hover:text-blue-600">17. Contact Information</a></li>
          </ol>
        </div>

        {/* Terms Content */}
        <div className="prose prose-slate max-w-none">
          
          {/* 1. Definitions */}
          <section id="definitions" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Definitions</h2>
            <p className="text-slate-700 mb-4">In these Terms of Service, the following definitions apply:</p>
            <dl className="space-y-4 text-slate-700">
              <div>
                <dt className="font-semibold">&quot;YesAllofUs,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;</dt>
                <dd className="ml-4">YesAllofUs, operated by Mark Flynn, a sole proprietorship registered in Guernsey, Channel Islands.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;Service&quot;</dt>
                <dd className="ml-4">The YesAllofUs affiliate commission payment platform, including the API, WordPress plugin, CLI tool, web dashboard, and all related documentation and support.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;You,&quot; &quot;your,&quot; or &quot;Store&quot;</dt>
                <dd className="ml-4">The individual or entity registering for and using the Service to process affiliate commission payments.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;Affiliate&quot;</dt>
                <dd className="ml-4">A third party registered through your Store to receive commission payments for referred sales.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;Wallet&quot;</dt>
                <dd className="ml-4">An XRP Ledger account that you own and control, connected to the Service via Xaman or Crossmark.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;RLUSD&quot;</dt>
                <dd className="ml-4">Ripple USD, a stablecoin issued on the XRP Ledger by Ripple (issuer address: rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De).</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;XRP Ledger&quot; or &quot;XRPL&quot;</dt>
                <dd className="ml-4">The decentralised blockchain network on which all payment transactions are executed and recorded.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;Multi-Sign&quot; or &quot;Auto-Sign&quot;</dt>
                <dd className="ml-4">The XRPL feature allowing you to authorise YesAllofUs to co-sign transactions from your Wallet within limits you specify.</dd>
              </div>
              <div>
                <dt className="font-semibold">&quot;Platform Fee&quot;</dt>
                <dd className="ml-4">The percentage fee charged by YesAllofUs on each payout processed through the Service.</dd>
              </div>
            </dl>
          </section>

          {/* 2. Service Description */}
          <section id="service-description" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Service Description</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.1 What YesAllofUs Does</h3>
            <p className="text-slate-700 mb-4">YesAllofUs provides software infrastructure that enables you to:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Register affiliate marketers with unique referral codes</li>
              <li>Track sales attributed to affiliate referrals</li>
              <li>Automatically calculate commission amounts based on your configured rates</li>
              <li>Trigger instant RLUSD payments from your Wallet to affiliate Wallets</li>
              <li>Maintain records of all transactions on the public XRP Ledger</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.2 What YesAllofUs Does NOT Do</h3>
            <p className="text-slate-700 mb-4">To be absolutely clear, YesAllofUs:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><strong>Does NOT hold, custody, or control your funds.</strong> All funds remain in your Wallet at all times until a payment is executed.</li>
              <li><strong>Does NOT have access to your private keys.</strong> We use XRPL&apos;s multi-signature feature, not key custody.</li>
              <li><strong>Does NOT act as a money transmitter or payment processor.</strong> We are software that facilitates peer-to-peer blockchain transactions.</li>
              <li><strong>Does NOT guarantee the value or stability of RLUSD.</strong> RLUSD is issued by Ripple, not YesAllofUs.</li>
              <li><strong>Does NOT provide tax, legal, or financial advice.</strong> You are responsible for your own compliance obligations.</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.3 Service Availability</h3>
            <p className="text-slate-700 mb-4">
              We aim to maintain 99.9% uptime for the YesAllofUs API. However, the Service depends on third-party infrastructure including the XRP Ledger network, Xaman/Crossmark wallet services, and cloud hosting providers. We are not liable for downtime caused by these external dependencies.
            </p>
          </section>

          {/* 3. Account Registration */}
          <section id="account-registration" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Account Registration</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.1 Eligibility</h3>
            <p className="text-slate-700 mb-4">To use YesAllofUs, you must:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Not be located in, or a resident of, any jurisdiction where the Service is prohibited</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.2 Registration Process</h3>
            <p className="text-slate-700 mb-4">
              When you register, you provide your store name, store URL, and email address. We generate unique API credentials (api_key and api_secret) for your account. You are responsible for keeping these credentials secure.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.3 Account Security</h3>
            <p className="text-slate-700 mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Keep your API credentials confidential and secure</li>
              <li>Not share your credentials with unauthorised parties</li>
              <li>Notify us immediately if you suspect unauthorised access</li>
              <li>Accept responsibility for all activity under your account</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">3.4 One Account Per Store</h3>
            <p className="text-slate-700 mb-4">
              Each store URL may only be registered once. If you attempt to register a URL that already exists, we will return your existing credentials rather than create a duplicate account.
            </p>
          </section>

          {/* 4. Wallet Connection */}
          <section id="wallet-connection" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Wallet Connection</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">4.1 Supported Wallets</h3>
            <p className="text-slate-700 mb-4">YesAllofUs supports connection via:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li><strong>Xaman (formerly XUMM):</strong> Mobile wallet with manual approval or push notification signing</li>
              <li><strong>Crossmark:</strong> Browser extension with automatic signing within configured limits</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">4.2 RLUSD Trustline Requirement</h3>
            <p className="text-slate-700 mb-4">
              To send or receive RLUSD payments, both your Wallet and your affiliates&apos; Wallets must have an active trustline to the RLUSD issuer (rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De). Payments to wallets without trustlines will be skipped.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">4.3 Auto-Sign Configuration</h3>
            <p className="text-slate-700 mb-4">If you enable Auto-Sign (multi-signature), you agree that:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>You are adding YesAllofUs as an authorised signer on your Wallet</li>
              <li>YesAllofUs may co-sign payment transactions within your configured limits</li>
              <li>You are responsible for setting appropriate daily and per-transaction limits</li>
              <li>You can revoke this permission at any time by removing our signer address from your Wallet</li>
              <li>Revocation takes effect immediately upon removal from the XRPL</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">4.4 Manual Approval Mode</h3>
            <p className="text-slate-700 mb-4">
              If you use Xaman without Auto-Sign, each payment requires your explicit approval via push notification. Payments not approved within 72 hours will expire and may be retried.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">4.5 Wallet Ownership</h3>
            <p className="text-slate-700 mb-4">
              By connecting a Wallet, you represent and warrant that you are the lawful owner of that Wallet and have full authority to authorise transactions from it.
            </p>
          </section>

          {/* 5. Payment Processing */}
          <section id="payment-processing" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Payment Processing</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.1 How Payments Work</h3>
            <p className="text-slate-700 mb-4">When an order completes on your store:</p>
            <ol className="list-decimal pl-6 text-slate-700 space-y-2 mb-4">
              <li>Your platform sends a payout request to YesAllofUs via API</li>
              <li>We calculate commissions based on your configured rates (default: 25%, 5%, 3%, 2%, 1% for 5 levels)</li>
              <li>We verify affiliate wallets have valid RLUSD trustlines</li>
              <li>We trigger payment transactions from your Wallet to affiliate Wallets</li>
              <li>We deduct our Platform Fee as a separate payment to YesAllofUs</li>
              <li>All transactions are recorded on the public XRP Ledger</li>
            </ol>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.2 Transaction Finality</h3>
            <p className="text-slate-700 mb-4">
              Once a payment transaction is validated on the XRP Ledger, it is final and irreversible. YesAllofUs cannot reverse, refund, or modify blockchain transactions. If you need to recover funds sent in error, you must contact the recipient directly.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.3 Insufficient Funds</h3>
            <p className="text-slate-700 mb-4">
              If your Wallet has insufficient RLUSD balance to complete a payout, the transaction will fail. You are responsible for maintaining adequate funds in your Wallet.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.4 Network Fees</h3>
            <p className="text-slate-700 mb-4">
              XRP Ledger transactions require a small amount of XRP for network fees (typically 0.00001-0.00002 XRP per transaction). Your Wallet must maintain a minimum XRP balance to cover these fees.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.5 Daily Limits</h3>
            <p className="text-slate-700 mb-4">
              Default daily payout limit is $1,000 USD equivalent. You may request limit increases by contacting support. Auto-Sign users may configure their own limits up to $50,000/day.
            </p>
          </section>

          {/* 6. Fees and Billing */}
          <section id="fees-billing" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Fees and Billing</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.1 Platform Fee Tiers</h3>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-700">
                    <th className="pb-2 font-semibold">Tier</th>
                    <th className="pb-2 font-semibold">Platform Fee</th>
                    <th className="pb-2 font-semibold">Monthly Subscription</th>
                    <th className="pb-2 font-semibold">Volume</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr>
                    <td className="py-2">Free</td>
                    <td className="py-2">2.9%</td>
                    <td className="py-2">$0</td>
                    <td className="py-2">Up to $25,000/month</td>
                  </tr>
                  <tr>
                    <td className="py-2">Pro</td>
                    <td className="py-2">0.9%</td>
                    <td className="py-2">$99</td>
                    <td className="py-2">$25,000-$250,000/month</td>
                  </tr>
                  <tr>
                    <td className="py-2">Enterprise</td>
                    <td className="py-2">0%</td>
                    <td className="py-2">$499</td>
                    <td className="py-2">$250,000+/month</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.2 How Fees Are Collected</h3>
            <p className="text-slate-700 mb-4">
              Platform Fees are deducted automatically from each payout as a separate RLUSD payment from your Wallet to the YesAllofUs wallet. You will see this as a distinct transaction on the XRP Ledger.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.3 Subscription Billing</h3>
            <p className="text-slate-700 mb-4">
              Pro and Enterprise subscription fees are billed monthly via PayPal or credit card. Subscriptions automatically renew unless cancelled before the renewal date.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.4 Referral Discounts</h3>
            <p className="text-slate-700 mb-4">
              Stores referred by existing YesAllofUs users receive a 50% discount on Platform Fees during their first month (e.g., 1.45% instead of 2.9% on Free tier).
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.5 No Hidden Fees</h3>
            <p className="text-slate-700 mb-4">
              We do not charge setup fees, integration fees, withdrawal fees, or any fees other than those explicitly stated above.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">6.6 Fee Changes</h3>
            <p className="text-slate-700 mb-4">
              We may modify our fees with 30 days&apos; written notice. Continued use of the Service after fee changes take effect constitutes acceptance of the new fees.
            </p>
          </section>

          {/* 7. Your Obligations */}
          <section id="your-obligations" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Obligations</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">7.1 Lawful Use</h3>
            <p className="text-slate-700 mb-4">You agree to use the Service only for lawful purposes and in compliance with all applicable laws, including but not limited to:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Anti-money laundering (AML) regulations</li>
              <li>Know Your Customer (KYC) requirements applicable to your business</li>
              <li>Tax laws in your jurisdiction</li>
              <li>Consumer protection laws</li>
              <li>Data protection regulations (GDPR, etc.)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">7.2 Accurate Information</h3>
            <p className="text-slate-700 mb-4">
              You agree to provide accurate, current, and complete information during registration and to update this information as necessary.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">7.3 Affiliate Management</h3>
            <p className="text-slate-700 mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Vetting affiliates before registering them</li>
              <li>Ensuring affiliates understand and agree to your affiliate program terms</li>
              <li>Handling disputes with affiliates directly</li>
              <li>Providing accurate commission rate information to affiliates</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">7.4 Tax Compliance</h3>
            <p className="text-slate-700 mb-4">
              You are solely responsible for determining and fulfilling your tax obligations. This includes issuing appropriate tax forms to affiliates (such as 1099s in the US) and reporting income to relevant tax authorities.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">7.5 Sufficient Funds</h3>
            <p className="text-slate-700 mb-4">
              You agree to maintain sufficient RLUSD and XRP balances in your connected Wallet to cover expected payouts and network fees.
            </p>
          </section>

          {/* 8. Prohibited Uses */}
          <section id="prohibited-uses" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Prohibited Uses</h2>
            <p className="text-slate-700 mb-4">You may not use YesAllofUs to:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Process payments for illegal goods or services</li>
              <li>Launder money or finance terrorism</li>
              <li>Evade taxes or facilitate tax evasion</li>
              <li>Operate unlicensed gambling or gaming services</li>
              <li>Sell illegal drugs, weapons, or controlled substances</li>
              <li>Distribute child exploitation material</li>
              <li>Engage in fraud, phishing, or deceptive practices</li>
              <li>Violate intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Reverse engineer or decompile our software</li>
              <li>Use automated tools to scrape or abuse our API beyond rate limits</li>
              <li>Resell or redistribute the Service without authorisation</li>
            </ul>
            <p className="text-slate-700 mb-4">
              See our <a href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</a> for detailed guidelines.
            </p>
          </section>

          {/* 9. Intellectual Property */}
          <section id="intellectual-property" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Intellectual Property</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">9.1 Our Intellectual Property</h3>
            <p className="text-slate-700 mb-4">
              YesAllofUs, including its name, logo, API, software, documentation, and all related materials, is owned by us and protected by intellectual property laws. You may not use our trademarks without prior written consent.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">9.2 License to Use</h3>
            <p className="text-slate-700 mb-4">
              We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service in accordance with these Terms. This license terminates automatically if you violate these Terms.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">9.3 Your Content</h3>
            <p className="text-slate-700 mb-4">
              You retain ownership of your store name, branding, and any content you provide. By using the Service, you grant us a license to display your store name in our records and communications as necessary to provide the Service.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">9.4 Feedback</h3>
            <p className="text-slate-700 mb-4">
              If you provide suggestions, ideas, or feedback about the Service, you grant us the right to use this feedback without compensation or attribution.
            </p>
          </section>

          {/* 10. Data and Privacy */}
          <section id="data-privacy" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Data and Privacy</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">10.1 Data We Collect</h3>
            <p className="text-slate-700 mb-4">We collect and process:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Registration information (store name, URL, email)</li>
              <li>Wallet addresses (public blockchain data)</li>
              <li>Transaction records (order IDs, amounts, timestamps)</li>
              <li>API usage data (for rate limiting and analytics)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">10.2 Blockchain Transparency</h3>
            <p className="text-slate-700 mb-4">
              All payment transactions are recorded on the public XRP Ledger. This means wallet addresses and transaction amounts are publicly visible. We cannot delete or modify blockchain data.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">10.3 Privacy Policy</h3>
            <p className="text-slate-700 mb-4">
              Our collection and use of personal data is governed by our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference.
            </p>
          </section>

          {/* 11. Disclaimers */}
          <section id="disclaimers" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Disclaimers</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm font-semibold mb-2">IMPORTANT: PLEASE READ CAREFULLY</p>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">11.1 Service Provided &quot;As Is&quot;</h3>
            <p className="text-slate-700 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">11.2 No Guarantee of Availability</h3>
            <p className="text-slate-700 mb-4">
              We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. The Service depends on third-party infrastructure that is outside our control.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">11.3 Cryptocurrency Risks</h3>
            <p className="text-slate-700 mb-4">You acknowledge and accept that:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Cryptocurrency values are volatile and may fluctuate significantly</li>
              <li>Blockchain transactions are irreversible</li>
              <li>You may lose access to funds if you lose your wallet credentials</li>
              <li>Regulatory changes may affect the availability or legality of cryptocurrency services</li>
              <li>The XRP Ledger is a decentralised network not controlled by YesAllofUs</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">11.4 Third-Party Services</h3>
            <p className="text-slate-700 mb-4">
              We are not responsible for the actions, content, or services of third parties, including Xaman, Crossmark, Ripple, or the XRP Ledger validators.
            </p>
          </section>

          {/* 12. Limitation of Liability */}
          <section id="limitation-liability" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Limitation of Liability</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">12.1 Cap on Liability</h3>
            <p className="text-slate-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, YesAllofUs&apos;S TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO YesAllofUs IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) £100.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">12.2 Exclusion of Certain Damages</h3>
            <p className="text-slate-700 mb-4">
              IN NO EVENT SHALL YesAllofUs BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">12.3 Specific Exclusions</h3>
            <p className="text-slate-700 mb-4">Without limiting the above, YesAllofUs shall not be liable for:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Payments sent to incorrect wallet addresses that you provided</li>
              <li>Losses due to your failure to secure your API credentials or wallet</li>
              <li>Losses due to XRP Ledger network issues or delays</li>
              <li>Losses due to changes in cryptocurrency values</li>
              <li>Losses due to regulatory actions or changes in law</li>
              <li>Actions or omissions of your affiliates</li>
            </ul>
          </section>

          {/* 13. Indemnification */}
          <section id="indemnification" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Indemnification</h2>
            <p className="text-slate-700 mb-4">
              You agree to indemnify, defend, and hold harmless YesAllofUs and its owner, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable law or regulation</li>
              <li>Your infringement of any third-party rights</li>
              <li>Disputes between you and your affiliates</li>
              <li>Your tax obligations or failure to comply with tax laws</li>
            </ul>
          </section>

          {/* 14. Termination */}
          <section id="termination" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Termination</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">14.1 Termination by You</h3>
            <p className="text-slate-700 mb-4">You may terminate your use of the Service at any time by:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Removing YesAllofUs as a signer from your Wallet (for Auto-Sign users)</li>
              <li>Disconnecting your Wallet from the Service</li>
              <li>Deleting your account via the API or by contacting support</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">14.2 Termination by Us</h3>
            <p className="text-slate-700 mb-4">We may suspend or terminate your access to the Service immediately if:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>You violate these Terms or our Acceptable Use Policy</li>
              <li>You fail to pay applicable subscription fees</li>
              <li>We are required to do so by law or regulatory authority</li>
              <li>We reasonably believe your account is being used for fraud or illegal activity</li>
              <li>You become insolvent or enter bankruptcy proceedings</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">14.3 Effect of Termination</h3>
            <p className="text-slate-700 mb-4">Upon termination:</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Your right to use the Service ends immediately</li>
              <li>Pending payouts may be cancelled</li>
              <li>Your API credentials will be deactivated</li>
              <li>We may retain records as required by law or for legitimate business purposes</li>
              <li>Provisions that by their nature should survive (including disclaimers, limitations of liability, and indemnification) will continue in effect</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">14.4 No Refunds</h3>
            <p className="text-slate-700 mb-4">
              Subscription fees are non-refundable. Platform Fees already collected are not refundable upon termination.
            </p>
          </section>

          {/* 15. Dispute Resolution */}
          <section id="dispute-resolution" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Dispute Resolution</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">15.1 Informal Resolution</h3>
            <p className="text-slate-700 mb-4">
              Before initiating formal proceedings, you agree to contact us at mark@YesAllofUs.com to attempt to resolve any dispute informally. We will make good faith efforts to resolve the matter within 30 days.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">15.2 Governing Law</h3>
            <p className="text-slate-700 mb-4">
              These Terms are governed by the laws of Guernsey, Channel Islands, without regard to conflict of law principles.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">15.3 Jurisdiction</h3>
            <p className="text-slate-700 mb-4">
              Any disputes not resolved informally shall be subject to the exclusive jurisdiction of the courts of Guernsey.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">15.4 Class Action Waiver</h3>
            <p className="text-slate-700 mb-4">
              You agree to resolve disputes with us on an individual basis and waive any right to participate in class actions or collective proceedings.
            </p>
          </section>

          {/* 16. General Provisions */}
          <section id="general" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">16. General Provisions</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.1 Entire Agreement</h3>
            <p className="text-slate-700 mb-4">
              These Terms, together with the Privacy Policy, Acceptable Use Policy, and Cookie Policy, constitute the entire agreement between you and YesAllofUs regarding the Service.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.2 Amendments</h3>
            <p className="text-slate-700 mb-4">
              We may modify these Terms at any time by posting updated Terms on our website. Material changes will be notified via email. Continued use of the Service after changes take effect constitutes acceptance.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.3 Severability</h3>
            <p className="text-slate-700 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.4 Waiver</h3>
            <p className="text-slate-700 mb-4">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.5 Assignment</h3>
            <p className="text-slate-700 mb-4">
              You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations without restriction.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.6 Force Majeure</h3>
            <p className="text-slate-700 mb-4">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, riots, government actions, or network failures.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">16.7 Language</h3>
            <p className="text-slate-700 mb-4">
              These Terms are written in English. Any translations are provided for convenience only. In case of conflict, the English version prevails.
            </p>
          </section>

          {/* 17. Contact Information */}
          <section id="contact" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">17. Contact Information</h2>
            <p className="text-slate-700 mb-4">For questions about these Terms or the Service, contact us:</p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700"><strong>YesAllofUs</strong></p>
              <p className="text-slate-700">Mark Flynn</p>
              <p className="text-slate-700">Guernsey, Channel Islands</p>
              <p className="text-slate-700 mt-2">
                <strong>Email:</strong> <a href="mailto:mark@YesAllofUs.com" className="text-blue-600 hover:underline">mark@YesAllofUs.com</a>
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
            By registering for an account or using the YesAllofUs Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
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