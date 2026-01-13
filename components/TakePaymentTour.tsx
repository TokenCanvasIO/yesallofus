'use client';
import { useEffect } from 'react';
import { useNextStep } from 'nextstepjs';

interface TakePaymentTourProps {
  run: boolean;
  onComplete: () => void;
}

export const tourSteps = [
  {
    tour: 'takePayment',
    steps: [
      {
        title: 'Welcome to Take Payment',
        content: 'This is your Point of Sale. Take payments from customers using NFC cards or QR codes. Let me show you around.',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Header Controls',
        content: 'Your quick access toolbar: Home button returns to dashboard, tap your logo to customize it for receipts and customer displays.',
        selector: '#tp-header',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Your Tools',
        content: 'Staff selector tracks who made each sale. Analytics shows your revenue. Pending payments shows unpaid links. Customer display opens a screen for customers. Receipts shows transaction history. The + button adds products to your catalog.',
        selector: '#tp-toolbar',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Payment Amount',
        content: 'The total amount to charge. This updates as you add items to the cart.',
        selector: '#tp-amount-display',
        side: 'bottom' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Products & Search',
        content: 'Search for products or tap them to add to the cart. Tap again to increase quantity. Add your first product using the + icon in the header.',
        selector: '#tp-products-area',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Tips',
        content: 'Enable tips to let customers add gratuity. Choose preset percentages or custom amounts.',
        selector: '#tp-tips-section',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Take Payment',
        content: 'Tap here when ready to collect payment. Shows QR code for scanning and enables NFC tap.',
        selector: '#tp-pay-btn',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Manual Entry',
        content: 'Enter a custom amount using the number pad instead of selecting products. Send Payment Link button will appear once you have items in your cart.',
        selector: '#tp-manual-btn',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'Live Conversion',
        content: 'See the real-time RLUSD conversion rate from CoinGecko Pro. This will appear once you add your first product.',
        selector: '#tp-footer',
        side: 'top' as const,
        showControls: true,
        showSkip: true,
      },
      {
        title: 'You\'re Ready!',
        content: 'That covers the basics. Add products, take payments, and grow your business with instant crypto settlements.',
        side: 'top' as const,
        showControls: true,
        showSkip: false,
      },
    ],
  },
];

export default function TakePaymentTour({ run, onComplete }: TakePaymentTourProps) {
  const { startNextStep, closeNextStep } = useNextStep();

  useEffect(() => {
    if (run) {
      console.log('Starting take payment tour...');
      try {
        closeNextStep();
      } catch (e) {
        // Ignore if no tour running
      }
      const timeout = setTimeout(() => {
        startNextStep('takePayment');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [run]);

  useEffect(() => {
    const handleComplete = () => {
      console.log('Take payment tour completed');
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