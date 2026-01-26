'use client';

import { useState } from 'react';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface SoundPayButtonProps {
  /** Store ID */
  storeId: string;
  /** Store name for receipt */
  storeName: string;
  /** Vendor wallet address */
  vendorWallet: string;
  /** Payment amount in GBP */
  amount: number;
  /** Optional tip amount in GBP */
  tipAmount?: number;
  /** Optional cart items for receipt */
  items?: Array<{ name: string; quantity: number; unit_price: number; emoji?: string }>;
  /** Callback when payment link is created - triggers state change */
  onPaymentCreated?: (paymentId: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Button size - number (px), string (Tailwind class), or preset */
  size?: number | string | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom class name */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
}

type Status = 'idle' | 'creating' | 'error';

export default function SoundPayButton({
  storeId,
  storeName,
  vendorWallet,
  amount,
  tipAmount = 0,
  items,
  onPaymentCreated,
  onError,
  size = 'md',
  className = '',
  disabled = false,
}: SoundPayButtonProps) {
  const [status, setStatus] = useState<Status>('idle');

  // Determine size classes
  const getSizeStyle = (): { style: React.CSSProperties; className: string } => {
    if (typeof size === 'number') {
      return { style: { width: size, height: size }, className: '' };
    }
    switch (size) {
      case 'sm':
        return { style: {}, className: 'w-16 h-16' };
      case 'md':
        return { style: {}, className: 'w-24 h-24' };
      case 'lg':
        return { style: {}, className: 'w-32 h-32' };
      case 'xl':
        return { style: {}, className: 'w-40 h-40' };
      case 'full':
        return { style: {}, className: 'w-full h-14' };
      default:
        return { style: {}, className: size };
    }
  };

  const sizeConfig = getSizeStyle();
  const isFullWidth = size === 'full' || (typeof size === 'string' && size.includes('w-full'));

  const handleClick = async () => {
    if (status === 'creating' || disabled) return;

    try {
      setStatus('creating');

      // 1. Create payment link
      const totalAmount = amount + tipAmount;
      const paymentItems = items 
        ? [
            ...items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              line_total: item.unit_price * item.quantity
            })),
            ...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, unit_price: tipAmount, line_total: tipAmount }] : [])
          ]
        : [
            { name: 'Payment', quantity: 1, unit_price: amount, line_total: amount },
            ...(tipAmount > 0 ? [{ name: 'Tip', quantity: 1, unit_price: tipAmount, line_total: tipAmount }] : [])
          ];

      const linkRes = await fetch(`${API_URL}/payment-link/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    store_id: storeId,
    store_name: storeName,
    vendor_wallet: vendorWallet,
    amount: totalAmount,
    items: paymentItems,
    payment_type: 'soundpay',
  }),
});
      
      const linkData = await linkRes.json();
      if (!linkData.success || !linkData.payment_id) {
        throw new Error(linkData.error || 'Failed to create payment');
      }

      const paymentId = linkData.payment_id;
      console.log('🔊 SoundPay: Created payment', paymentId);

      // 2. Update display to soundpay status
      const displayCart = items ? items.map(item => ({
  name: item.name,
  quantity: item.quantity,
  price: item.unit_price,
  emoji: item.emoji || '📦'
})) : [];
      
      fetch(`${API_URL}/display/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          store_name: storeName,
          cart: displayCart,
          total: totalAmount,
          status: 'soundpay',
          tip: tipAmount,
          vendor_wallet: vendorWallet,
          payment_id: paymentId,
        }),
      }).catch(err => console.error('Display update failed:', err));

      // 3. Callback with payment ID - parent handles state change
      setStatus('idle');
      onPaymentCreated?.(paymentId);

    } catch (error: any) {
      console.error('SoundPay error:', error);
      setStatus('error');
      onError?.(error.message || 'Failed to create payment');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === 'creating'}
      style={sizeConfig.style}
      className={`
        relative overflow-hidden rounded-2xl transition-all
        ${sizeConfig.className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
        ${status === 'error' ? 'ring-2 ring-red-500' : ''}
        ${status === 'creating' ? 'ring-2 ring-purple-500' : ''}
        ${className}
      `}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/soundpay-button-bg.webm" type="video/webm" />
      </video>

      {/* Dark Overlay */}
      <div
        className={`absolute inset-0 transition-colors ${
          status === 'error'
            ? 'bg-red-900/50'
            : status === 'creating'
            ? 'bg-purple-900/40'
            : 'bg-black/30'
        }`}
      />

      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center h-full ${isFullWidth ? 'flex-row gap-3' : 'flex-col'}`}>
        {status === 'error' ? (
          <>
            <svg
              className={isFullWidth ? 'w-6 h-6 text-red-400' : 'w-1/3 h-1/3 text-red-400'}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isFullWidth && <span className="text-red-400 font-bold">Failed</span>}
          </>
        ) : status === 'creating' ? (
          <>
            {isFullWidth ? (
              <>
                <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-purple-300 font-bold">Preparing...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-purple-300 font-bold text-xs mt-1">Preparing</span>
              </>
            )}
          </>
        ) : (
          <>
            {isFullWidth ? (
              <>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
                </svg>
                <span className="text-white font-bold">SoundPay</span>
              </>
            ) : (
              <>
                <span className="text-white font-bold text-sm leading-tight">SoundPay</span>
                <span className="text-white/70 text-xs">Send</span>
              </>
            )}
          </>
        )}
      </div>
    </button>
  );
}