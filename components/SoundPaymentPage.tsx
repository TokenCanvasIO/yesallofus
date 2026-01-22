'use client';

import { useState, useEffect } from 'react';
import { startListening, initSoundPayment, isSupported, cleanup } from '@/utils/soundPayment';
import InstantPay from '@/components/InstantPay';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PaymentDetails {
  payment_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  amount: number;
  currency: string;
  vendor_wallet: string;
  rlusd_amount?: number;
}

export default function SoundPaymentPage() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'received' | 'paying' | 'success' | 'error'>('idle');
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);
  const [supported, setSupported] = useState(true);

  // Check support on mount
  useEffect(() => {
    if (!isSupported()) {
      setSupported(false);
    }
    
    return () => {
      cleanup();
    };
  }, []);

  // Handle token received from sound
  const handleTokenReceived = async (receivedToken: string) => {
    try {
      console.log('🎵 Token received:', receivedToken);
      setToken(receivedToken);
      setStatus('received');
      
      // Stop listening
      if (stopFn) {
        stopFn();
        setStopFn(null);
      }

      // Redeem token to get payment details
      const res = await fetch(`${API_URL}/sound-payment/redeem/${receivedToken}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get payment details');
      }

      console.log('💰 Payment details:', data);
      setPayment({
        payment_id: data.payment_id,
        store_id: data.store_id,
        store_name: data.store_name,
        store_logo: data.store_logo,
        amount: data.amount,
        currency: data.currency || 'GBP',
        vendor_wallet: data.vendor_wallet,
        rlusd_amount: data.rlusd_amount || data.amount
      });
      setStatus('paying');

    } catch (err: any) {
      console.error('Token redeem error:', err);
      setError(err.message || 'Failed to process payment');
      setStatus('error');
    }
  };

  // Start listening for sound payments
  const startListen = async () => {
    try {
      setError(null);
      setStatus('listening');
      
      await initSoundPayment();
      
      const stop = await startListening(
        handleTokenReceived,
        (err) => {
          setError(err);
          setStatus('error');
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
  };

  // Handle payment success
  const handlePaymentSuccess = (hash: string, receiptId?: string) => {
    console.log('✅ Payment success:', hash);
    setTxHash(hash);
    setStatus('success');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  };

  // Handle payment error
  const handlePaymentError = (err: string) => {
    console.error('Payment error:', err);
    if (err === 'INSUFFICIENT_FUNDS') {
      setError('Insufficient funds in your wallet');
    } else if (err === 'WALLET_NOT_READY') {
      setError('Please set up your wallet first');
    } else if (err === 'SELF_PAYMENT_NOT_ALLOWED') {
      setError('Cannot pay yourself');
    } else {
      setError(err);
    }
    setStatus('error');
  };

  // Reset to try again
  const reset = () => {
    setStatus('idle');
    setPayment(null);
    setToken(null);
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
          <h2 className="text-xl font-bold mb-2">Sound Payment Not Supported</h2>
          <p className="text-zinc-400">Your browser doesn't support audio features needed for sound payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto p-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Sound Payment</h1>
          <p className="text-zinc-400">Pay by listening to the vendor's device</p>
        </div>

        {/* IDLE STATE - Ready to listen */}
        {status === 'idle' && (
          <div className="space-y-6">
            <button
              onClick={startListen}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-6 rounded-2xl transition flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xl">Start Listening</span>
              <span className="text-purple-200 text-sm">Tap to receive payment via sound</span>
            </button>
          </div>
        )}

        {/* LISTENING STATE */}
        {status === 'listening' && (
          <div className="space-y-6">
            <div className="bg-purple-500/10 border-2 border-purple-500 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-400 mb-2">Listening...</h2>
              <p className="text-zinc-400 mb-4">Hold your phone near the vendor's device</p>
              
              {/* Sound wave animation */}
              <div className="flex items-center justify-center gap-1 h-8 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={stopListen}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* RECEIVED STATE - Got token, loading payment details */}
        {status === 'received' && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Payment Found!</h2>
            <p className="text-zinc-400">Loading payment details...</p>
            <div className="mt-4">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}

        {/* PAYING STATE - Show InstantPay */}
        {status === 'paying' && payment && (
          <div className="space-y-6">
            {/* Payment details card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {/* Store info */}
              <div className="flex items-center gap-4 mb-6">
                {payment.store_logo ? (
                  <img src={payment.store_logo} alt={payment.store_name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-zinc-500">{payment.store_name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{payment.store_name}</h2>
                  <p className="text-zinc-400 text-sm">Sound Payment</p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-4 border-t border-zinc-800">
                <p className="text-zinc-400 text-sm mb-1">Amount to pay</p>
                <p className="text-4xl font-bold text-white">
                  £{payment.amount.toFixed(2)}
                </p>
                {payment.rlusd_amount && (
                  <p className="text-zinc-500 text-sm mt-1">
                    ≈ {payment.rlusd_amount.toFixed(2)} RLUSD
                  </p>
                )}
              </div>
            </div>

            {/* InstantPay button */}
            <InstantPay
              amount={payment.amount}
              rlusdAmount={payment.rlusd_amount || payment.amount}
              vendorWallet={payment.vendor_wallet}
              storeName={payment.store_name}
              storeId={payment.store_id}
              paymentId={payment.payment_id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <button
              onClick={reset}
              className="w-full text-zinc-500 hover:text-zinc-300 font-medium py-3 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Payment Complete!</h2>
              {payment && (
                <p className="text-zinc-300 text-lg mb-4">
                  £{payment.amount.toFixed(2)} paid to {payment.store_name}
                </p>
              )}
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
            <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Payment Failed</h2>
              <p className="text-zinc-400">{error || 'Something went wrong'}</p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}