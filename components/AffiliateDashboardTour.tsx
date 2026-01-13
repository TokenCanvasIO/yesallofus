'use client';

import { useEffect } from 'react';
import { useNextStep } from 'nextstepjs';

interface AffiliateDashboardTourProps {
  run: boolean;
  onComplete: () => void;
  hasJoinedVendor?: boolean;
}

export const tourSteps = [
  {
    tour: 'affiliateDashboard',
    steps: [
      {
        icon: null,
        title: 'Welcome to YesAllOfUs',
        content: 'Your wallet for instant payments and rewards. Let me show you around - it only takes a minute.',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: '↑ Show Your Balances',
        content: 'Your balances are hidden for privacy. Tap the eye icon in the top right anytime to reveal or hide your amounts.',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Your Earnings',
        content: 'Track your total earnings here. Once you join vendor programs, you will see your commissions and active vendors.',
        selector: '#earnings',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Wallet Status',
        content: 'Check your XRP and RLUSD balances. You need XRP for fees and RLUSD for payments.',
        selector: '#wallet-balances',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Payment Methods',
        content: 'Connect a wallet to make payments. Use Tap-to-Pay for contactless NFC, Browser Wallet for Crossmark, or Manual Wallet for Xaman.',
        selector: '#tap-to-pay',
        side: 'left' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Top Up Your Wallet',
        content: 'Add funds to your wallet here. Expand this section to deposit XRP or RLUSD.',
        selector: '#top-up-inner',
        side: 'left' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Withdraw Funds',
        content: 'Send RLUSD or XRP to another wallet. Enter the amount and destination address, then confirm.',
        selector: '#withdraw',
        side: 'left' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'Find Vendors',
        content: 'Browse vendors to shop with or earn from. Join their affiliate programs to start earning commissions.',
        selector: '#vendors',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: null,
        title: 'You are Ready',
        content: 'That covers the basics. Use the menu to navigate, and check your progress to unlock all features.',
        side: 'top' as const,
        showControls: true,
        showSkip: false,
      },
    ],
  },
];

export default function AffiliateDashboardTour({ run, onComplete, hasJoinedVendor = false }: AffiliateDashboardTourProps) {
  const { startNextStep, closeNextStep } = useNextStep();

  // Start tour when run changes to true
  useEffect(() => {
    if (run) {
      console.log('Starting affiliate tour...');
      // Force close first, then start fresh
      try {
        closeNextStep();
      } catch (e) {
        // Ignore if no tour running
      }
      const timeout = setTimeout(() => {
        console.log('Calling startNextStep...');
        startNextStep('affiliateDashboard');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [run]);

  // Listen for tour completion
  useEffect(() => {
    const handleComplete = () => {
      console.log('Tour completed');
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