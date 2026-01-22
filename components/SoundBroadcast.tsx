'use client';

import { useState } from 'react';
import { broadcastToken, initSoundPayment } from '@/utils/soundPayment';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface SoundBroadcastProps {
  paymentId: string;
  storeId: string;
  apiSecret: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function SoundBroadcast({
  paymentId,
  storeId,
  apiSecret,
  amount,
  onSuccess,
  onError
}: SoundBroadcastProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'broadcasting' | 'sent'>('idle');

  const handleBroadcast = async () => {
    try {
      setBroadcasting(true);
      setStatus('broadcasting');

      // Initialize sound system
      await initSoundPayment();

      // Get token from backend
      const res = await fetch(`${API_URL}/sound-payment/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, store_id: storeId, api_secret: apiSecret })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get token');
      }

      // Broadcast the token
      await broadcastToken(data.token);

      setStatus('sent');
      onSuccess?.();

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error('Broadcast error:', error);
      setStatus('idle');
      onError?.(String(error));
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <button
      onClick={handleBroadcast}
      disabled={broadcasting}
      className={`w-full rounded-2xl p-6 transition-all ${
        status === 'sent'
          ? 'bg-emerald-500/20 border-2 border-emerald-500'
          : status === 'broadcasting'
          ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse'
          : 'bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
          status === 'sent'
            ? 'bg-emerald-500/20'
            : status === 'broadcasting'
            ? 'bg-blue-500/20'
            : 'bg-zinc-800'
        }`}>
          {status === 'sent' ? (
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className={`w-8 h-8 ${status === 'broadcasting' ? 'text-blue-400' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
            </svg>
          )}
        </div>
        <p className="text-lg font-semibold mb-1">
          {status === 'sent' ? 'Sent!' : status === 'broadcasting' ? 'Broadcasting...' : 'Broadcast Payment'}
        </p>
        <p className="text-zinc-500 text-sm">
          {status === 'sent' ? 'Waiting for customer' : `£${amount.toFixed(2)} via sound`}
        </p>
      </div>
    </button>
  );
}
