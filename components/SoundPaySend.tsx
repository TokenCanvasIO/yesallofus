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
  items?: Array<{ name: string; quantity: number; unit_price: number }>;
  /** Callback when payment succeeds */
  onSuccess?: (txHash: string, receiptId?: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Button size - number (px), string (Tailwind class), or preset */
  size?: number | string | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom class name */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
}

type Status = 'idle' | 'creating' | 'active' | 'success' | 'error';

let soundUtils: any = null;

async function loadSoundUtils() {
  if (soundUtils) return soundUtils;
  if (typeof window === 'undefined') return null;
  soundUtils = await import('@/utils/soundPayment');
  return soundUtils;
}

export default function SoundPayButton({
  storeId,
  storeName,
  vendorWallet,
  amount,
  tipAmount = 0,
  items,
  onSuccess,
  onError,
  size = 'md',
  className = '',
  disabled = false,
}: SoundPayButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [attempt, setAttempt] = useState(0);

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
        // Custom Tailwind classes
        return { style: {}, className: size };
    }
  };

  const sizeConfig = getSizeStyle();
  const isFullWidth = size === 'full' || (typeof size === 'string' && size.includes('w-full'));

  const handleSend = async () => {
    if (status === 'active' || status === 'creating' || disabled) return;

    try {
      setStatus('creating');

      // 1. Create payment link first
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
        }),
      });
      
      const linkData = await linkRes.json();
      if (!linkData.success || !linkData.payment_id) {
        throw new Error(linkData.error || 'Failed to create payment');
      }

      const paymentId = linkData.payment_id;
      console.log('🔊 SoundPay: Created payment', paymentId);

      // 2. Initialize sound
      setStatus('active');
      setAttempt(0);

      const utils = await loadSoundUtils();
      if (!utils) throw new Error('Sound not available');

      await utils.initSoundPayment();
      await utils.warmupAudio();

      const shortToken = paymentId.slice(-4).toUpperCase();

      // 3. Broadcast with retries
      const attempts = [
        { volume: 0.4, toneDuration: 0.05, silenceDuration: 0.02 },
        { volume: 0.7, toneDuration: 0.08, silenceDuration: 0.03 },
        { volume: 1.0, toneDuration: 0.12, silenceDuration: 0.04 },
      ];

      let paid = false;

      for (let i = 0; i < attempts.length && !paid; i++) {
        const settings = attempts[i];
        setAttempt(i + 1);
        console.log(`🔊 SoundPay: Attempt ${i + 1}/${attempts.length}:`, shortToken, settings);

        await utils.broadcastToken(shortToken, settings);

        // Poll for 8 seconds before retrying
        const pollDuration = 8000;
        const pollStart = Date.now();

        while (Date.now() - pollStart < pollDuration && !paid) {
          try {
            const res = await fetch(`${API_URL}/payment-link/${paymentId}`);
            const data = await res.json();

            if (data.payment?.status === 'paid') {
              paid = true;
              setStatus('success');
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
              onSuccess?.(data.payment.tx_hash, data.payment.receipt_id);
              setTimeout(() => setStatus('idle'), 3000);
              return;
            }
          } catch (e) {
            console.warn('Poll error:', e);
          }
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      // All attempts failed
      if (!paid) {
        setStatus('error');
        onError?.('Sound payment failed after 3 attempts');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error: any) {
      console.error('SoundPay error:', error);
      setStatus('error');
      onError?.(error.message || 'Failed to send');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={disabled || status === 'active'}
      style={sizeConfig.style}
      className={`
        relative overflow-hidden rounded-2xl transition-all
        ${sizeConfig.className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
        ${status === 'success' ? 'ring-2 ring-emerald-500' : ''}
        ${status === 'error' ? 'ring-2 ring-red-500' : ''}
        ${status === 'active' || status === 'creating' ? 'ring-2 ring-purple-500' : ''}
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
          status === 'success'
            ? 'bg-emerald-900/70'
            : status === 'error'
            ? 'bg-red-900/70'
            : status === 'active' || status === 'creating'
            ? 'bg-purple-900/60'
            : 'bg-black/50'
        }`}
      />

      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center h-full ${isFullWidth ? 'flex-row gap-3' : 'flex-col'}`}>
        {status === 'success' ? (
          <>
            <svg
              className={isFullWidth ? 'w-6 h-6 text-emerald-400' : 'w-1/3 h-1/3 text-emerald-400'}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {isFullWidth && <span className="text-emerald-400 font-bold">Paid!</span>}
          </>
        ) : status === 'error' ? (
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
        ) : status === 'active' ? (
          <>
            {/* Pulsing animation */}
            {!isFullWidth && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2/3 h-2/3 rounded-full bg-purple-500/30 animate-ping" />
              </div>
            )}
            {isFullWidth ? (
              <>
                <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-purple-300 font-bold">
                  {attempt === 1 ? 'Sending...' : attempt === 2 ? 'Retrying...' : 'Final try...'}
                </span>
              </>
            ) : (
              <span className="text-purple-300 font-bold text-xs relative z-10">
                {attempt === 1 ? 'Sending' : attempt === 2 ? 'Retry' : 'Final'}
              </span>
            )}
          </>
        ) : (
          <>
            {isFullWidth ? (
              <>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                </svg>
                <span className="text-white font-bold">SoundPay</span>
                <span className="text-white/60 text-sm">Send</span>
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