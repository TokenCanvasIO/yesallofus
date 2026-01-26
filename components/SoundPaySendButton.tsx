'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface SoundPaySendButtonProps {
  className?: string;
  /** Payment ID to broadcast (last 4 chars used) */
  paymentId: string;
  /** Store ID for payment verification */
  storeId?: string;
  /** Callback when payment succeeds */
  onSuccess?: (txHash: string, receiptId?: string, rlusdAmount?: number) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

type Status = 'idle' | 'active' | 'success' | 'error';

let soundUtils: any = null;

async function loadSoundUtils() {
  if (soundUtils) return soundUtils;
  if (typeof window === 'undefined') return null;
  soundUtils = await import('@/utils/soundPayment');
  return soundUtils;
}

export default function SoundPaySendButton({ 
  className = '',
  paymentId,
  storeId = '',
  onSuccess,
  onError,
}: SoundPaySendButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [attempt, setAttempt] = useState(0);

  const handleSend = async () => {
    if (status === 'active') return;

    try {
      setStatus('active');
      setAttempt(0);

      const utils = await loadSoundUtils();
      if (!utils) throw new Error('Sound not available');

      await utils.initSoundPayment();
      await utils.warmupAudio();

      const shortToken = paymentId.slice(-4).toUpperCase();

      const attempts = [
        { volume: 1.0, toneDuration: 0.08, silenceDuration: 0.03 },
        { volume: 1.0, toneDuration: 0.10, silenceDuration: 0.04 },
        { volume: 1.0, toneDuration: 0.12, silenceDuration: 0.05 },
      ];

      let paid = false;

      for (let i = 0; i < attempts.length && !paid; i++) {
        const settings = attempts[i];
        setAttempt(i + 1);
        console.log(`🔊 SoundPay: Attempt ${i + 1}/${attempts.length}:`, shortToken, settings);

        await utils.broadcastToken(shortToken, settings);

        const pollDuration = i === attempts.length - 1 ? 11000 : 8000;
        const pollStart = Date.now();

        while (Date.now() - pollStart < pollDuration && !paid) {
          try {
            const res = await fetch(`${API_URL}/payment-link/${paymentId}`);
            const data = await res.json();

            if (data.payment?.status === 'paid') {
              paid = true;
              setStatus('success');
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
              onSuccess?.(data.payment.tx_hash, data.payment.receipt_id, data.payment.rlusd_amount);
              return;
            }
          } catch (e) {
            console.warn('Poll error:', e);
          }
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      if (!paid) {
        setStatus('error');
        onError?.('Sound payment failed after 3 attempts');
      }
    } catch (error: any) {
      console.error('SoundPay error:', error);
      setStatus('error');
      onError?.(error.message || 'Failed to send');
    }
  };

  // IDLE STATE
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center">
        <button 
          onClick={handleSend}
          className={`flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 bg-sky-500/20 rounded-full cursor-pointer relative ${className}`}
        >
          <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 bg-sky-500/10 rounded-full animate-pulse"></div>
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 text-sky-400 relative z-10"
            style={{ transform: 'rotate(-90deg)' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p className="text-2xl sm:text-3xl font-bold text-sky-400 mb-2 mt-5">SoundPay</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Tap to send payment</p>
      </div>
    );
  }

  // ACTIVE STATE
  if (status === 'active') {
    return (
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 bg-sky-500/20 rounded-full relative ${className}`}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-500/50"
              initial={{ width: 60, height: 60, opacity: 0.8 }}
              animate={{ 
                width: [60, 200],
                height: [60, 200],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
            />
          ))}
          <motion.div
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-500/30 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
            </svg>
          </motion.div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-sky-400 mb-2 mt-5">
          {attempt === 1 ? 'Sending...' : attempt === 2 ? 'Retrying...' : 'Final attempt...'}
        </p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Hold phone near speaker</p>
      </div>
    );
  }

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 bg-emerald-500/20 rounded-full relative ${className}`}>
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </svg>
          </motion.div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2 mt-5">Complete!</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Payment received</p>
      </div>
    );
  }

  // ERROR STATE
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center">
        <button 
          onClick={handleSend}
          className={`flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 bg-red-500/20 rounded-full cursor-pointer relative ${className}`}
        >
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 bg-red-500/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        </button>
        <p className="text-2xl sm:text-3xl font-bold text-red-400 mb-2 mt-5">Failed</p>
        <p className="text-zinc-500 text-base sm:text-lg text-center">Tap to try again</p>
      </div>
    );
  }

  return null;
}