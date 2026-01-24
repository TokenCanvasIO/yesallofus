'use client';

import { useState } from 'react';

interface SoundPayProps {
  paymentId: string;
  amount: number;
  storeName: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

let soundUtils: any = null;

async function loadSoundUtils() {
  if (soundUtils) return soundUtils;
  if (typeof window === 'undefined') return null;
  soundUtils = await import('@/utils/soundPayment');
  return soundUtils;
}

export default function SoundPay({
  paymentId,
  amount,
  storeName,
  onSuccess,
  onError
}: SoundPayProps) {
  const [status, setStatus] = useState<'idle' | 'active' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const handleSend = async () => {
    if (status === 'active') return;
    
    try {
      setStatus('active');
      setErrorMsg(null);
      setAttempt(0);

      const utils = await loadSoundUtils();
      if (!utils) throw new Error('Sound not available');

      await utils.initSoundPayment();
      await utils.warmupAudio();
      
      const shortToken = paymentId.slice(-4).toUpperCase();
      
      // Retry settings: each attempt is more robust
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
        
        const pollDuration = 9000;
        const pollStart = Date.now();
        
        while (Date.now() - pollStart < pollDuration && !paid) {
          try {
            const res = await fetch(`https://api.dltpays.com/nfc/api/v1/payment-link/${paymentId}`);
            const data = await res.json();
            
            if (data.payment?.status === 'paid') {
              paid = true;
              setStatus('success');
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
              onSuccess?.(data.payment.tx_hash);
              setTimeout(() => setStatus('idle'), 3000);
              return;
            }
          } catch (e) {
            console.warn('Poll error:', e);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      if (!paid) {
        setErrorMsg('Sound payment unavailable');
        setStatus('error');
        onError?.('Sound payment failed after 3 attempts');
      }

    } catch (error: any) {
      console.error('Send error:', error);
      setErrorMsg(error.message || 'Failed to send');
      setStatus('error');
      onError?.(error.message || 'Failed to send');
    }
  };

  const handleAction = () => {
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg(null);
      return;
    }
    handleSend();
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      {/* Header with Icon */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-3">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">SoundPay</h3>
        <p className="text-zinc-400 text-sm mt-1">Send payment via sound</p>
      </div>

      {/* Volume Reminder */}
      <div className="flex items-center justify-center gap-2 mb-4 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-300">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12l-4 4m4-4l4 4" />
        </svg>
        <span className="text-sm font-medium">Turn volume up</span>
      </div>

      {/* Main Action Button */}
      <button
        onClick={handleAction}
        disabled={status === 'active'}
        className={`w-full aspect-square max-h-44 rounded-3xl transition-all flex flex-col items-center justify-center gap-3 ${
          status === 'success'
            ? 'bg-emerald-500/20 border-2 border-emerald-500'
            : status === 'error'
            ? 'bg-red-500/20 border-2 border-red-500'
            : status === 'active'
            ? 'bg-blue-500/10 border-2 border-blue-500'
            : 'bg-zinc-800 border-2 border-zinc-700 active:scale-95'
        }`}
      >
        {status === 'success' ? (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-emerald-400">Paid!</span>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-base font-semibold text-red-400">{errorMsg || 'Failed'}</span>
            <span className="text-xs text-zinc-500">Tap to retry</span>
          </>
        ) : status === 'active' ? (
          <>
            {/* Animated sound waves */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-blue-500/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                </svg>
              </div>
            </div>
            <span className="text-base font-medium text-blue-400">
              {attempt === 1 ? 'Sending...' 
                : attempt === 2 ? 'Trying again...'
                : attempt === 3 ? 'One more try...'
                : 'Sending...'}
            </span>
            <span className="text-xs text-zinc-500">Keep devices close</span>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Send</span>
          </>
        )}
      </button>

      {/* Payment Info */}
      <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm">{storeName}</p>
        <p className="text-xl font-bold text-white mt-1">£{amount.toFixed(2)}</p>
      </div>
    </div>
  );
}