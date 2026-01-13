'use client';

import { useEffect } from 'react';
import { useNextStep } from 'nextstepjs';

interface VendorDashboardTourProps {
  run: boolean;
  onComplete: () => void;
}

export const tourSteps = [
  {
    tour: 'vendorDashboard',
    steps: [
      {
        icon: null,
        title: 'Welcome to Your Vendor Dashboard',
        content: 'Manage your store, track sales, and grow your affiliate network. Let me show you around.',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: '← Sidebar Menu',
        content: 'Access all features from here. Look for the glowing tab on the left edge of your screen - tap it anytime to open the menu.',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Payout Method',
        content: 'Connect your wallet and set up how you pay affiliates. Choose between auto-sign for automatic payouts or manual approval.',
        selector: '#payout-method',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Take Payment',
        content: 'Your main POS button. Tap here to take payments from customers in person or generate payment links.',
        selector: '#take-payment-btn',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Top Up Wallet',
        content: 'Add funds to your wallet here. You need RLUSD to pay affiliate commissions.',
        selector: '#wallet-funding',
        side: 'left' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Withdraw Funds',
        content: 'Check your balance and withdraw RLUSD or XRP to another wallet.',
        selector: '#withdraw',
        side: 'left' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Pending Customers',
        content: 'See customers who signed up but haven\'t connected their wallets yet.',
        selector: '#pending-customers',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Commission Rates',
        content: 'Set how much affiliates earn at each level. Up to 5 levels of referral commissions.',
        selector: '#commission-rates',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Quick Links',
        content: 'Fast access to your most used features - Take Payment, Analytics, Receipts, Display mode, and Staff management.',
        selector: '#quick-links',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Affiliate Link',
        content: 'Share this link to recruit affiliates. They\'ll earn commissions when they refer customers.',
        selector: '#affiliate-link',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Activity',
        content: 'View your recent transactions, payouts, and store activity all in one place.',
        selector: '#activity',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'You\'re All Set!',
        content: 'That covers the basics. Use the sidebar menu to navigate, and check your progress to unlock all features.',
        side: 'top' as const,
        showControls: true,
        showSkip: false,
      },
    ],
  },
];

export default function VendorDashboardTour({ run, onComplete }: VendorDashboardTourProps) {
  const { startNextStep, closeNextStep } = useNextStep();

  useEffect(() => {
    if (run) {
      console.log('Starting vendor tour...');
      
      // On mobile, skip directly to step 2 (index 2) after welcome
      const isMobile = window.innerWidth < 640;
      
      try {
        closeNextStep();
      } catch (e) {
        // Ignore if no tour running
      }
      const timeout = setTimeout(() => {
        startNextStep('vendorDashboard');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [run]);

  useEffect(() => {
    const handleComplete = () => {
      console.log('Vendor tour completed');
      onComplete();
    };

    window.addEventListener('nextstep:complete', handleComplete);
    window.addEventListener('nextstep:skip', handleComplete);
    
    return () => {
      window.removeEventListener('nextstep:complete', handleComplete);
      window.removeEventListener('nextstep:skip', handleComplete);
    };
  }, [onComplete]);

  return null;
}