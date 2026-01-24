'use client';

import { useState, useEffect } from 'react';
import { startListening, initSoundPayment, isSupported, cleanup, warmupAudio } from '@/utils/soundPayment';
import NebulaBackground from '@/components/NebulaBackground';
import SoundPayInstructions from '@/components/SoundPayInstructions';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function SoundPaymentPage() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [listenState, setListenState] = useState<'idle' | 'ready' | 'sync' | 'receiving'>('idle');
  const [receivedChars, setReceivedChars] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);
  const [supported, setSupported] = useState(true);
  const [soundId, setSoundId] = useState<string | null>(null);

  // Check support and get sound_id on mount
  useEffect(() => {
    if (!isSupported()) {
      setSupported(false);
      return;
    }

    // Get wallet and sound_id
    const setupWallet = async () => {
      try {
        const { loginWithWeb3Auth } = await import('@/lib/web3auth');
        
        let wallet = sessionStorage.getItem('walletAddress');
        
        if (!wallet) {
          const result = await loginWithWeb3Auth();
          wallet = result?.address || sessionStorage.getItem('walletAddress');
        }
        
        if (!wallet) {
          setError('Please login to pay');
          return;
        }
        
        // Get sound_id from server using wallet
        const deviceRes = await fetch(`${API_URL}/sound/device-by-wallet/${wallet}`);
        const deviceData = await deviceRes.json();
        
        if (!deviceData.success || !deviceData.sound_id) {
          setError('Enable Tap-to-Pay in dashboard first');
          return;
        }
        
        setSoundId(deviceData.sound_id);
      } catch (err: any) {
        console.error('Setup error:', err);
        setError(err.message || 'Failed to setup');
      }
    };

    setupWallet();
    
    return () => {
      cleanup();
    };
  }, []);

  // Start listening
  const startListen = async () => {
    if (!soundId) {
      setError('Not ready - please wait or refresh');
      return;
    }

    try {
      setError(null);
      setStatus('listening');
      setListenState('idle');
      setReceivedChars('');
      
      await initSoundPayment();
      await warmupAudio();

      console.log('🔊 SoundPay: Listening for payment...');
      
      const stop = await startListening(
        async (token: string) => {
          if (token.length >= 4) {
            console.log('🔊 Heard token:', token);
            stop();
            setStopFn(null);
            
            setStatus('processing');
            setListenState('idle');
            setReceivedChars('');
            
            try {
              const res = await fetch(`${API_URL}/p/${token}?sid=${soundId}`);
              const data = await res.json();
              
              if (!data.success) {
                throw new Error(data.error || 'Payment failed');
              }
              
              console.log('🔊 Payment complete:', data.tx_hash);
              setTxHash(data.tx_hash);
              setStatus('success');
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
              
            } catch (err: any) {
              console.error('🔊 Payment error:', err);
              setError(err.message || 'Payment failed');
              setStatus('error');
            }
          }
        },
        (err) => {
          setError(err);
          setStatus('error');
          setListenState('idle');
        },
        (state: 'ready' | 'sync' | 'receiving', chars?: string) => {
          setListenState(state);
          if (chars) setReceivedChars(chars);
        }
      );
      
      setStopFn(() => stop);
    } catch (err: any) {
      console.error('Listen error:', err);
      setError(err.message || 'Failed to start listening');
      setStatus('error');
    }
  };

  // Stop listening
  const stopListen = () => {
    if (stopFn) {
      stopFn();
      setStopFn(null);
    }
    setStatus('idle');
    setListenState('idle');
    setReceivedChars('');
  };

  // Reset
  const reset = () => {
    setStatus('idle');
    setListenState('idle');
    setReceivedChars('');
    setError(null);
    setTxHash(null);
  };

  if (!supported) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Not Supported</h2>
          <p className="text-zinc-400">Your browser doesn't support audio features needed for SoundPay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NebulaBackground opacity={0.3} />
      <div className="max-w-md mx-auto p-4 pt-4 relative z-10">
        {/* Instructions Animation - Tappable */}
        {status === 'idle' && (
          <div className="mb-4 cursor-pointer" onClick={startListen}>
            <SoundPayInstructions mode="receive" />
          </div>
        )}

        {/* Mic Reminder */}
        {status === 'idle' && (
          <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-xs font-medium">Allow microphone access</span>
          </div>
        )}

        {/* Main Button */}
        {status === 'idle' && (
          <button
            onClick={startListen}
            disabled={!soundId}
            className={`w-full h-40 rounded-2xl font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
              soundId 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl font-bold">{soundId ? 'SoundPay' : 'Setting up...'}</span>
            {soundId && <span className="text-purple-200 text-sm">Pay Now</span>}
          </button>
        )}

        {/* LISTENING STATE */}
        {status === 'listening' && (
          <div className="space-y-6">
            <div className="bg-purple-500/10 border-2 border-purple-500 rounded-3xl p-8 text-center">
              {/* Animated icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                <div className="absolute inset-3 rounded-full bg-purple-500/30 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-purple-500/40 flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-purple-400 mb-2">
                {listenState === 'ready' ? 'Ready - Listening...'
                  : listenState === 'sync' ? 'Heard signal...'
                  : listenState === 'receiving' ? `Receiving ${receivedChars}...`
                  : 'Starting...'}
              </h2>
              <p className="text-zinc-400">Hold phone near sender device</p>
            </div>

            <button
              onClick={stopListen}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* PROCESSING STATE */}
        {status === 'processing' && (
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-amber-400 mb-2">Processing Payment...</h2>
            <p className="text-zinc-400">Please wait</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl p-8 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Paid!</h2>
              {txHash && (
                <a
                  href={`https://livenet.xrpl.org/transactions/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                >
                  View on XRPL →
                </a>
              )}
            </div>

            <button
              onClick={reset}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-xl transition"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-8 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Failed</h2>
              <p className="text-zinc-400">{error || 'Something went wrong'}</p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Error display when idle */}
        {status === 'idle' && error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* YAOFUS Pioneers Badge - Fixed at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1">
        <span className="text-zinc-500 text-[10px] font-medium tracking-wider">ULTRA</span>
        <span className="text-base font-extrabold tracking-widest">
          <span className="text-emerald-500">Y</span>
          <span className="text-green-500">A</span>
          <span className="text-blue-500">O</span>
          <span className="text-indigo-500">F</span>
          <span className="text-violet-500">U</span>
          <span className="text-purple-500">S</span>
        </span>
        <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">SoundPay</span>
        <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
          <span>Powered by YesAllOfUs</span>
        </div>
      </div>
    </div>
  );
}