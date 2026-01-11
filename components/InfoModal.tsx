'use client';

import { useState } from 'react';

interface InfoContent {
  title: string;
  what: string;
  why: string;
  how: string;
  tip: string;
}

interface InfoModalProps {
  content: InfoContent;
  isOpen: boolean;
  onClose: () => void;
}

const infoContent: Record<string, InfoContent> = {
  // Vendor Dashboard items
  'take-payment': {
    title: 'Take Payment',
    what: 'Accept contactless payments from customers using their NFC card or phone.',
    why: 'Fast, secure payments that automatically calculate and distribute affiliate commissions.',
    how: 'Tap the button, enter the amount, and have your customer tap their card or phone.',
    tip: 'Every payment builds your network and rewards your affiliates instantly!'
  },
  'signup-customer': {
    title: 'Sign Up Customer',
    what: 'Register new customers and link them to an NFC card for tap-to-pay.',
    why: 'Customers become affiliates who earn rewards and refer others to your store.',
    how: 'Click the button, have the customer enter their details, and tap their NFC card to link.',
    tip: 'Each customer you sign up can become your best promoter!'
  },
  'wallet-funding': {
    title: 'Top Up Wallet',
    what: 'Add RLUSD to your store wallet manually. Partner and affiliate wallets auto-top-up, but you can add funds anytime.',
    why: 'Your wallet needs funds to pay affiliate commissions. Affiliates and partner vendors have auto-top-up enabled by default.',
    how: 'For manual top-up: send RLUSD from an exchange or another wallet to your store wallet address. Open banking top-ups coming soon!',
    tip: 'Auto-top-up handles most cases - manual is here when you need extra control!'
  },
  'withdraw': {
    title: 'Withdraw',
    what: 'Send RLUSD from your store wallet to your personal wallet or exchange.',
    why: 'Take profits or move funds to where you need them.',
    how: 'Enter the destination address and amount, then confirm the transaction.',
    tip: 'Your earnings are always under your control!'
  },
  'payout-method': {
    title: 'Payout Method',
    what: 'How your store pays affiliate commissions - automatic or manual approval.',
    why: 'Auto-sign means 24/7 instant payouts. Manual means you approve each one.',
    how: 'Connect a wallet and enable auto-sign for the best affiliate experience.',
    tip: 'Instant payouts keep your affiliates motivated and engaged!'
  },
  'pending-customers': {
    title: 'Pending Customers',
    what: 'Customers who started signup but need wallet activation.',
    why: 'New wallets need a small XRP amount to activate on the blockchain.',
    how: 'Review pending customers and complete their activation when ready.',
    tip: 'Quick activations mean happy customers ready to spend!'
  },
  'earn-interest': {
    title: 'Earn Interest',
    what: 'Coming soon - earn yield on your RLUSD balance.',
    why: 'Make your idle funds work for you while waiting for payouts.',
    how: 'Simply hold RLUSD in your wallet and earn automatically.',
    tip: 'Your money grows even when you sleep!'
  },
  'auto-sign': {
    title: 'Auto-Sign',
    what: 'Automatic transaction signing for instant affiliate payouts.',
    why: 'No manual approval needed - commissions pay out 24/7 instantly.',
    how: 'Enable auto-sign with your wallet, set limits, and forget about it.',
    tip: 'Instant payouts = happy affiliates = more referrals!'
  },
  'commission-rates': {
    title: 'Commission Rates',
    what: 'Set how much affiliates earn at each level of your referral network.',
    why: 'Competitive rates attract more affiliates and drive more sales.',
    how: 'Set percentages for 5 levels - direct referrals earn most.',
    tip: 'Generous commissions build loyal, motivated promoters!'
  },
  'affiliate-link': {
    title: 'Affiliate Link',
    what: 'Your unique link that tracks referrals to your store.',
    why: 'Share this link so new affiliates join under your network.',
    how: 'Copy the link and share via social media, email, or messaging.',
    tip: 'Every share is a seed planted for future growth!'
  },
  'api-credentials': {
    title: 'API Credentials',
    what: 'Keys for integrating YesAllofUs with your website or app.',
    why: 'Automate payments and affiliate tracking on your own platform.',
    how: 'Copy your API key and secret, then follow our documentation.',
    tip: 'Integration unlocks the full power of automated affiliate marketing!'
  },
  'quick-links': {
    title: 'Quick Links',
    what: 'Helpful resources including documentation, terms, and plugins.',
    why: 'Everything you need to get the most from YesAllofUs.',
    how: 'Click any link to access guides, legal info, or integrations.',
    tip: 'Knowledge is power - explore and grow!'
  },
  'activity': {
    title: 'Activity',
    what: 'View your affiliates, transactions, and payment history.',
    why: 'Track performance and see your network growing.',
    how: 'Switch between tabs to see affiliates or recent payments.',
    tip: 'Watching your numbers grow is the best motivation!'
  },
  'danger-zone': {
    title: 'Danger Zone',
    what: 'Permanent actions like deleting your store.',
    why: 'Sometimes you need a fresh start or to close down.',
    how: 'Confirm carefully - these actions cannot be undone.',
    tip: 'We hope you never need this - but it is here if you do.'
  },
  
  // Milestone items (shared)
  'wallet_funded': {
    title: 'Wallet Funded',
    what: 'Your wallet has been activated on the XRP Ledger with XRP.',
    why: 'A funded wallet is required to hold RLUSD and process transactions.',
    how: 'This happened automatically when XRP was sent to your wallet address.',
    tip: 'Your wallet is live and ready for action!'
  },
  'trustline_set': {
    title: 'Trustline Set',
    what: 'Your wallet can now hold and receive RLUSD stablecoin.',
    why: 'RLUSD is used for all payments and commissions in the system.',
    how: 'The trustline was added when you set up your wallet.',
    tip: 'You are connected to the RLUSD payment network!'
  },
  'auto_sign_enabled': {
    title: 'Auto-Sign Enabled',
    what: 'Your wallet automatically signs transactions for instant payouts.',
    why: 'Affiliates receive commissions instantly without manual approval.',
    how: 'You enabled this by signing a transaction that authorizes the platform.',
    tip: 'Your affiliates love instant payments - great choice!'
  },
  'first_affiliate': {
    title: 'First Affiliate Joined',
    what: 'Someone has signed up as an affiliate for your store.',
    why: 'Affiliates promote your products and earn commission on sales.',
    how: 'They joined using your affiliate link or referral code.',
    tip: 'Your network is growing - every affiliate expands your reach!'
  },
  'first_payment_received': {
    title: 'First Payment Received',
    what: 'RLUSD has arrived in your store wallet.',
    why: 'This confirms your payment system is working correctly.',
    how: 'A customer made a purchase or you topped up manually.',
    tip: 'The money is flowing - your business is live!'
  },
  'first_payout_sent': {
    title: 'First Payout Sent',
    what: 'You have paid your first affiliate commission.',
    why: 'This proves your entire affiliate system is working end-to-end.',
    how: 'A sale was made through an affiliate link and commission was paid.',
    tip: 'You are building a team of motivated promoters!'
  },
  'first_partner_signed': {
    title: 'First Partner Signed Up',
    what: 'Another vendor joined using your referral code.',
    why: 'You earn commission when your referred vendors make sales.',
    how: 'They signed up with your store referral code.',
    tip: 'Vendor-to-vendor referrals multiply your earning potential!'
  },

  // Affiliate Dashboard nav items
  'earnings': {
    title: 'Total Earnings',
    what: 'Your total RLUSD earned from affiliate commissions.',
    why: 'Track your progress and see how your referrals are paying off.',
    how: 'Earnings accumulate automatically when customers you referred make purchases.',
    tip: 'Every purchase in your network earns you a commission!'
  },
  'wallet-status': {
    title: 'Wallet Status',
    what: 'Overview of your wallet balances and trustline status.',
    why: 'Know exactly how much XRP and RLUSD you have available.',
    how: 'Your wallet is automatically updated when transactions occur.',
    tip: 'A healthy wallet means you are ready to receive commissions!'
  },
  'top-up': {
    title: 'Top Up Wallet',
    what: 'Add funds to your wallet using card, bank transfer, or crypto swap.',
    why: 'Keep your wallet funded to cover transaction fees and receive payments.',
    how: 'Choose a payment method and follow the prompts to add funds.',
    tip: 'Card payments are the fastest way to get started!'
  },
  'payment-cards': {
    title: 'Payment Cards',
    what: 'Link NFC cards to your wallet for tap-to-pay purchases.',
    why: 'Use physical cards to make payments at participating vendors.',
    how: 'Hold your NFC card to your phone to link it to your account.',
    tip: 'NFC cards make paying as easy as a tap!'
  },
  'tap-to-pay': {
    title: 'Tap-to-Pay',
    what: 'Enable your phone to make contactless payments.',
    why: 'Pay at any participating vendor by tapping your phone.',
    how: 'Enable auto-sign and set a spending limit to activate tap-to-pay.',
    tip: 'No card needed - your phone is your wallet!'
  },
  'browser-wallet': {
    title: 'Browser Wallet',
    what: 'Connect Crossmark wallet for automatic transaction signing.',
    why: 'Crossmark enables instant payments without manual approval each time.',
    how: 'Install the Crossmark extension and connect to your account.',
    tip: 'Best for desktop users who want seamless payments!'
  },
  'xaman-wallet': {
    title: 'Manual Wallet',
    what: 'Use Xaman (formerly XUMM) to manually approve transactions.',
    why: 'Maximum security - you approve every transaction on your phone.',
    how: 'Scan QR codes with Xaman app to approve payments.',
    tip: 'Perfect for users who want full control over every transaction!'
  },
  'discover': {
    title: 'Discover Vendors',
    what: 'Find and join vendors to start earning affiliate commissions.',
    why: 'The more vendors you join, the more ways you can earn.',
    how: 'Browse available vendors and click Join to become their affiliate.',
    tip: 'Join vendors you actually shop at for natural referrals!'
  },
  'payouts': {
    title: 'Recent Payouts',
    what: 'History of commission payments you have received.',
    why: 'Track your earnings and see which referrals are performing best.',
    how: 'Payouts appear here automatically when commissions are paid.',
    tip: 'Watch your payouts grow as your network expands!'
  },
  
  // Customer milestone items
  'tap_pay_enabled': {
    title: 'Tap to Pay Enabled',
    what: 'Your phone can now make contactless payments.',
    why: 'Pay instantly at any participating vendor with just a tap.',
    how: 'You enabled auto-sign which allows automatic payment approval.',
    tip: 'Shopping just got a whole lot faster!'
  },
  'nfc_card_added': {
    title: 'NFC Card Linked',
    what: 'A physical payment card is linked to your account.',
    why: 'Use your card to pay at vendors even without your phone.',
    how: 'You tapped your NFC card to link it to your wallet.',
    tip: 'Your card is now a direct line to your RLUSD balance!'
  },
  'joined_affiliate': {
    title: 'Joined as Affiliate',
    what: 'You are now earning commissions from a vendor.',
    why: 'Every purchase made through your referrals earns you RLUSD.',
    how: 'You joined a vendor affiliate program.',
    tip: 'Share your link and watch the commissions roll in!'
  }
};

export function InfoButton({ sectionId, onClick }: { sectionId: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="p-1 text-zinc-500 hover:text-sky-400 transition-colors"
      title="Learn more"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    </button>
  );
}

export function InfoModal({ content, isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">{content.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide mb-1">What</p>
            <p className="text-zinc-300 text-sm">{content.what}</p>
          </div>
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">Why</p>
            <p className="text-zinc-300 text-sm">{content.why}</p>
          </div>
          <div>
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-wide mb-1">How</p>
            <p className="text-zinc-300 text-sm">{content.how}</p>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-emerald-300 text-sm">{content.tip}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export function useInfoModal() {
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const openInfo = (sectionId: string) => setActiveInfo(sectionId);
  const closeInfo = () => setActiveInfo(null);
  const getContent = () => activeInfo ? infoContent[activeInfo] : null;

  return { activeInfo, openInfo, closeInfo, getContent };
}

export { infoContent };