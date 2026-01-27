'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoveCloserAnimation from '@/components/MoveCloserAnimation';

interface SoundPaymentProps {
  paymentId: string;
  amount: number;
  storeName: string;
  tipAmount?: number;
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

export default function SoundPayment({
  paymentId,
  amount,
  storeName,
  tipAmount = 0,
  onSuccess,
  onError
}: SoundPaymentProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [status, setStatus] = useState<'idle' | 'active' | 'processing' | 'success' | 'error'>('idle');
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [listenState, setListenState] = useState<'idle' | 'ready' | 'sync' | 'receiving'>('idle');
  const [receivedChars, setReceivedChars] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);

  // Registration check removed - Web3Auth login handles this in handleReceive

  // Generate HMAC signature (for customer response)
  const generateSignature = async (paymentId: string, soundId: string, timestamp: string, secretKey: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(paymentId + soundId + timestamp);
    const keyData = encoder.encode(secretKey);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // SEND (POS) - Broadcast payment ID with auto-retry
  const handleSend = async () => {
    try {
      setStatus('active');
      setErrorMsg(null);

      // Save customer tip before processing
      if (tipAmount > 0) {
        try {
          await fetch(`https://api.dltpays.com/nfc/api/v1/payment-link/${paymentId}/tip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tip_amount: tipAmount })
          });
          console.log(`💰 Tip saved: £${tipAmount}`);
        } catch (tipErr) {
          console.warn('Could not save tip:', tipErr);
        }
      }

      const utils = await loadSoundUtils();
      if (!utils) throw new Error('Sound not available');

      await utils.initSoundPayment();
      await utils.warmupAudio();
      
      const shortToken = paymentId.slice(-4).toUpperCase();
      
      // Retry settings: each attempt is more robust
      const attempts = [
  { volume: 1.0, toneDuration: 0.08, silenceDuration: 0.03 },
  { volume: 1.0, toneDuration: 0.10, silenceDuration: 0.04 },
  { volume: 1.0, toneDuration: 0.12, silenceDuration: 0.05 },
];
      
      let paid = false;
      
      for (let attempt = 0; attempt < attempts.length && !paid; attempt++) {
        const settings = attempts[attempt];
        setAttempt(attempt + 1);
        console.log(`🔊 POS: Attempt ${attempt + 1}/${attempts.length}:`, shortToken, settings);
        
        await utils.broadcastToken(shortToken, settings);
        
        // Poll for 8 seconds before retrying
        const pollDuration = 8000;
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
      
      // All attempts failed
      if (!paid) {
        setErrorMsg('Sound payment unavailable - try Tap to Pay or QR');
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

  // RECEIVE (Customer) - Listen for payment ID, broadcast signed response
  const handleReceive = async () => {
    try {
      // Save customer tip before processing
      if (tipAmount > 0) {
        try {
          await fetch(`https://api.dltpays.com/nfc/api/v1/payment-link/${paymentId}/tip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tip_amount: tipAmount })
          });
          console.log(`💰 Tip saved: £${tipAmount}`);
        } catch (tipErr) {
          console.warn('Could not save tip:', tipErr);
        }
      }

      // Check if logged in, if not → login with Web3Auth
      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
      
      let wallet = sessionStorage.getItem('walletAddress');
      
      if (!wallet) {
        setStatus('processing');
        const result = await loginWithWeb3Auth();
        wallet = result?.address || sessionStorage.getItem('walletAddress');
      }
      
      if (!wallet) {
        setErrorMsg('Please login to pay');
        setStatus('error');
        return;
      }
      
      // Get sound_id from server using wallet
      const deviceRes = await fetch(`https://api.dltpays.com/nfc/api/v1/sound/device-by-wallet/${wallet}`);
      const deviceData = await deviceRes.json();
      
      if (!deviceData.success || !deviceData.sound_id) {
        setErrorMsg('Enable Tap-to-Pay in dashboard first');
        setStatus('error');
        return;
      }
      
      const soundId = deviceData.sound_id;

      const utils = await loadSoundUtils();
      if (!utils) throw new Error('Sound not available');

      if (status === 'active' && stopFn) {
        stopFn();
        setStopFn(null);
        setStatus('idle');
        return;
      }

      setStatus('active');
      setErrorMsg(null);
      await utils.initSoundPayment();
      await utils.warmupAudio();

      console.log('🔊 Customer: Listening for payment request...');

      const stop = await utils.startListening(
        async (token: string) => {
          // Received short token from POS (e.g. "A9F2")
          if (token.length >= 4) {
            console.log('🔊 Heard token:', token);
            stop();
            setStopFn(null);
            
            setStatus('processing');
            setListenState('idle');
            setReceivedChars('');
            
            try {
              // Call API directly - no broadcast back
              const res = await fetch(`https://api.dltpays.com/nfc/api/v1/p/${token}?sid=${soundId}`);
              const data = await res.json();
              
              if (!data.success) {
                throw new Error(data.error || 'Payment failed');
              }
              
              console.log('🔊 Payment complete:', data.tx_hash);
              setStatus('success');
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
              onSuccess?.(data.tx_hash);
              
              setTimeout(() => setStatus('idle'), 3000);
              
            } catch (err: any) {
              console.error('🔊 Payment error:', err);
              setErrorMsg(err.message || 'Payment failed');
              setStatus('error');
              onError?.(err.message || 'Payment failed');
            }
          }
        },
        (error: string) => {
          setErrorMsg(error);
          setStatus('error');
          setListenState('idle');
          onError?.(error);
        },
        (state: 'ready' | 'sync' | 'receiving', chars?: string) => {
          setListenState(state);
          if (chars) setReceivedChars(chars);
        }
      );

      setStopFn(() => stop);

    } catch (error: any) {
      console.error('Listen error:', error);
      setErrorMsg(error.message || 'Failed to listen');
      setStatus('error');
      onError?.(error.message || 'Failed to listen');
    }
  };

  const handleAction = () => {
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg(null);
      return;
    }
    if (mode === 'send') handleSend();
    else handleReceive();
  };

  const switchMode = (newMode: 'send' | 'receive') => {
    if (stopFn) stopFn();
    setStopFn(null);
    setStatus('idle');
    setErrorMsg(null);
    setMode(newMode);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-3">
          <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Sound Payment</h3>
      </div>

      {/* Mode Toggle - Large tap targets */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => switchMode('send')}
          className={`p-4 rounded-2xl border-2 transition-all ${
            mode === 'send'
              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
              : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
            </svg>
            <span className="text-base font-medium">Send</span>
          </div>
        </button>
        <button
          onClick={() => switchMode('receive')}
          className={`p-4 rounded-2xl border-2 transition-all ${
            mode === 'receive'
              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
              : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-base font-medium">Receive</span>
          </div>
        </button>
      </div>

      {/* Volume/Mic Reminder */}
      <div className={`flex items-center justify-center gap-2 mb-4 px-4 py-3 rounded-xl ${
        mode === 'send' ? 'bg-blue-500/10 text-blue-300' : 'bg-purple-500/10 text-purple-300'
      }`}>
        {mode === 'send' ? (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12l-4 4m4-4l4 4" />
            </svg>
            <span className="text-sm font-medium">Volume up to 50% or higher</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm font-medium">{isRegistered ? 'Allow microphone access' : 'Enable Tap-to-Pay first'}</span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-zinc-400 text-center mb-6 text-base">
        {mode === 'send'
          ? 'Send payment request to customer'
          : isRegistered ? 'Listen & pay instantly' : 'Set up Tap-to-Pay to use this'}
      </p>

      {/* Main Action Button */}
      <button
        onClick={handleAction}
        disabled={status === 'processing' || (mode === 'receive' && !isRegistered)}
        className={`w-full aspect-square max-h-48 rounded-3xl transition-all flex flex-col items-center justify-center gap-4 ${
          status === 'success'
            ? 'bg-emerald-500/20 border-2 border-emerald-500'
            : status === 'error'
            ? 'bg-red-500/20 border-2 border-red-500'
            : status === 'processing'
            ? 'bg-amber-500/10 border-2 border-amber-500'
            : status === 'active'
            ? mode === 'send'
              ? 'bg-blue-500/10 border-2 border-blue-500'
              : 'bg-purple-500/10 border-2 border-purple-500'
            : (mode === 'receive' && !isRegistered)
            ? 'bg-zinc-800/50 border-2 border-zinc-700 cursor-not-allowed'
            : 'bg-zinc-800 border-2 border-zinc-700 active:scale-95'
        }`}
      >
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-emerald-400">
              {mode === 'send' ? 'Payment Complete!' : 'Sent!'}
            </span>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-red-400">{errorMsg || 'Error'}</span>
            <span className="text-sm text-zinc-500">Tap to retry</span>
          </>
        ) : status === 'processing' ? (
          <>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="relative w-12 h-12 rounded-full bg-amber-500/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-300 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <span className="text-lg font-medium text-amber-400">
              {mode === 'send' ? 'Processing Payment...' : 'Sending...'}
            </span>
          </>
        ) : status === 'active' ? (
          <>
            {/* Animated sound waves */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full ${mode === 'send' ? 'bg-blue-500/20' : 'bg-purple-500/20'} animate-ping`} />
              <div className={`absolute inset-2 rounded-full ${mode === 'send' ? 'bg-blue-500/30' : 'bg-purple-500/30'} animate-pulse`} />
              <div className={`relative w-12 h-12 rounded-full ${mode === 'send' ? 'bg-blue-500/40' : 'bg-purple-500/40'} flex items-center justify-center`}>
                {mode === 'send' ? (
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
            </div>
           <span className={`text-lg font-medium ${mode === 'send' ? 'text-blue-400' : 'text-purple-400'}`}>
              {mode === 'send' 
                ? attempt === 1 ? 'Sending payment...' 
                  : attempt === 2 ? 'Trying again...'
                  : attempt === 3 ? 'One more try...'
                  : 'Sending...'
                : listenState === 'ready' ? 'Ready - listening...'
                  : listenState === 'sync' ? 'Heard signal...'
                  : listenState === 'receiving' ? `Receiving ${receivedChars}...`
                  : 'Starting...'}
            </span>
            <span className="text-sm text-zinc-500">Tap to cancel</span>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-full ${mode === 'send' ? 'bg-blue-500/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
              {mode === 'send' ? (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                </svg>
              ) : (
                <svg className={`w-8 h-8 ${isRegistered ? 'text-purple-400' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </div>
            <span className={`text-xl font-semibold ${(mode === 'receive' && !isRegistered) ? 'text-zinc-600' : 'text-white'}`}>
              {mode === 'send' ? 'Tap to Send' : isRegistered ? 'Tap to Listen' : 'Not Available'}
            </span>
          </>
        )}
      </button>

      {/* Move Closer Animation - shows when receiving and active */}
      {mode === 'receive' && status === 'active' && (
        <MoveCloserAnimation className="mt-6" />
      )}

      {/* Payment Info */}
      <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
        <p className="text-zinc-400 text-sm">{storeName}</p>
        <p className="text-2xl font-bold text-white mt-1">£{amount.toFixed(2)}</p>
      </div>
    </div>
  );
}