'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PaymentDetails {
  payment_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  amount: number;
  currency: string;
  vendor_wallet: string;
}

interface SoundListenProps {
  onPaymentReceived: (payment: PaymentDetails, token: string) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

// Sound utilities - loaded dynamically
let soundUtils: any = null;

async function loadSoundUtils() {
  if (soundUtils) return soundUtils;
  if (typeof window === 'undefined') return null;
  soundUtils = await import('@/utils/soundPayment');
  return soundUtils;
}

export default function SoundListen({
  onPaymentReceived,
  onError,
  autoStart = false
}: SoundListenProps) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'received'>('idle');
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);
  const [supported, setSupported] = useState(true);

  // Check support on mount
  useEffect(() => {
    loadSoundUtils().then(utils => {
      if (utils && !utils.isSupported()) {
        setSupported(false);
      }
    });
  }, []);

  const handleTokenReceived = useCallback(async (token: string) => {
    try {
      setStatus('received');
      
      // Redeem token to get payment details
      const res = await fetch(`${API_URL}/sound-payment/redeem/${token}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to redeem token');
      }

      // Pass payment details to parent
      onPaymentReceived(data, token);

    } catch (error) {
      console.error('Token redeem error:', error);
      onError?.(String(error));
      setStatus('listening');
    }
  }, [onPaymentReceived, onError]);

  const startListen = async () => {
    try {
      const utils = await loadSoundUtils();
      if (!utils) {
        onError?.('Sound payment not available');
        return;
      }

      setListening(true);
      setStatus('listening');

      // Initialize sound system
      await utils.initSoundPayment();

      // Start listening
      const stop = await utils.startListening(
        handleTokenReceived,
        (error: string) => {
          onError?.(error);
          setStatus('idle');
          setListening(false);
        }
      );

      setStopFn(() => stop);

    } catch (error) {
      console.error('Listen error:', error);
      setStatus('idle');
      setListening(false);
      onError?.(String(error));
    }
  };

  const stopListen = () => {
    if (stopFn) {
      stopFn();
      setStopFn(null);
    }
    setListening(false);
    setStatus('idle');
  };

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && supported) {
      startListen();
    }
    return () => {
      loadSoundUtils().then(utils => {
        if (utils) utils.cleanup();
      });
      if (stopFn) stopFn();
    };
  }, [autoStart, supported]);

  if (!supported) {
    return null; // Don't show if not supported
  }

  return (
    <button
      onClick={listening ? stopListen : startListen}
      className={`w-full rounded-2xl p-6 transition-all ${
        status === 'received'
          ? 'bg-emerald-500/20 border-2 border-emerald-500'
          : status === 'listening'
          ? 'bg-purple-500/20 border-2 border-purple-500 animate-pulse'
          : 'bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
          status === 'received'
            ? 'bg-emerald-500/20'
            : status === 'listening'
            ? 'bg-purple-500/20'
            : 'bg-zinc-800'
        }`}>
          {status === 'received' ? (
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className={`w-8 h-8 ${status === 'listening' ? 'text-purple-400' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
        <p className="text-lg font-semibold mb-1">
          {status === 'received' ? 'Payment Found!' : status === 'listening' ? 'Listening...' : 'Listen for Payment'}
        </p>
        <p className="text-zinc-500 text-sm">
          {status === 'listening' ? 'Tap again to stop' : 'Receive payment via sound'}
        </p>
      </div>
    </button>
  );
}
