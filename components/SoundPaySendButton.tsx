'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface SoundPaySendButtonProps {
  className?: string;
  /** Payment ID to broadcast (last 4 chars used) */
  paymentId: string;
  /** Callback when payment succeeds */
  onSuccess?: (txHash: string, receiptId?: string) => void;
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

      // Broadcast with retries
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
      }
    } catch (error: any) {
      console.error('SoundPay error:', error);
      setStatus('error');
      onError?.(error.message || 'Failed to send');
    }
  };

  // IDLE STATE - Phone animation with "Tap to Send"
  if (status === 'idle') {
    return (
      <button 
        onClick={handleSend}
        className={`flex flex-col items-center justify-center flex-1 min-h-[280px] py-6 cursor-pointer ${className}`}
      >
        {/* Main animation area */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full">
          {/* Sound waves emanating upward */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 rounded-full border border-purple-500/60"
                style={{ width: 40 + i * 20, height: 20 + i * 10 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  y: [30, -30, -90],
                  scale: [0.8, 1, 1.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Phone moving down */}
          <motion.div
            className="relative z-10 mt-8"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Phone body */}
            <div className="relative w-28 h-52 bg-zinc-800/80 rounded-3xl border-2 border-purple-500/50 shadow-xl shadow-purple-500/30 backdrop-blur-sm">
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-zinc-700 rounded-full" />
              {/* Screen */}
              <div className="absolute inset-3 top-7 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                {/* Mic icon pulsing */}
                <motion.div
                  className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </motion.div>
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-600 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Instruction text */}
        <motion.p 
          className="text-purple-400 text-lg mt-8 text-center font-bold"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to Send Sound
        </motion.p>
        <p className="text-zinc-500 text-sm mt-2">Customer holds phone near</p>
      </button>
    );
  }

  // ACTIVE STATE - Broadcasting animation
  if (status === 'active') {
    return (
      <div className={`flex flex-col items-center justify-center flex-1 min-h-[280px] py-6 ${className}`}>
        {/* Main animation area */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full">
          {/* Pulsing rings outward */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-500/50"
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

          {/* Center speaker icon */}
          <motion.div
            className="relative z-10 w-24 h-24 rounded-full bg-purple-500/30 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
            </svg>
          </motion.div>
        </div>

        {/* Status text */}
        <motion.p 
          className="text-purple-400 text-lg mt-8 text-center font-bold"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {attempt === 1 ? 'Sending...' : attempt === 2 ? 'Retrying...' : 'Final try...'}
        </motion.p>
        <p className="text-zinc-500 text-sm mt-2">Hold phone near this device</p>
      </div>
    );
  }

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <div className={`flex flex-col items-center justify-center flex-1 min-h-[280px] py-6 ${className}`}>
        <motion.div
          className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <p className="text-emerald-400 text-2xl mt-6 font-bold">Payment Complete!</p>
        <p className="text-zinc-500 text-sm mt-2">Thank you</p>
      </div>
    );
  }

  // ERROR STATE
  if (status === 'error') {
    return (
      <button 
        onClick={handleSend}
        className={`flex flex-col items-center justify-center flex-1 min-h-[280px] py-6 cursor-pointer ${className}`}
      >
        <motion.div
          className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>
        <p className="text-red-400 text-2xl mt-6 font-bold">Failed</p>
        <motion.p 
          className="text-zinc-400 text-sm mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Tap to try again
        </motion.p>
      </button>
    );
  }

  return null;
}