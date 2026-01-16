'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NebulaBackground from '@/components/NebulaBackground';
import PaymentOptions from '@/components/PaymentOptions';

const API_URL = 'https://api.dltpays.com/plugins/api/v1';

interface CheckoutSession {
  session_id: string;
  platform: string;
  store_name: string;
  store_logo: string | null;
  vendor_wallet: string;
  amount: number;
  currency: string;
  order_id: string | null;
  order_reference: string | null;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  status: string;
  tx_hash: string | null;
  receipt_id: string | null;
  expires_at: string | null;
  paid_at: string | null;
  success_url: string | null;
  cancel_url: string | null;
}

export default function CheckoutPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [rlusdAmount, setRlusdAmount] = useState<number | null>(null);

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_URL}/checkout/session/${sessionId}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Session not found');
          return;
        }

        setSession(data.session);

        // Check if already paid
        if (data.session.status === 'paid') {
          setPaymentComplete(true);
          setTxHash(data.session.tx_hash);
          setReceiptId(data.session.receipt_id);
        }

        // Check if expired
        if (data.session.status === 'expired') {
          setError('This checkout session has expired');
        }

        // Fetch RLUSD conversion
        if (data.session.status === 'pending') {
          try {
            const rateRes = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${data.session.amount}`);
            const rateData = await rateRes.json();
            if (rateData.success) {
              setRlusdAmount(rateData.rlusd);
            }
          } catch (e) {
            // Fallback estimate
            setRlusdAmount(data.session.amount * 1.27);
          }
        }
      } catch (err) {
        setError('Failed to load checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Handle successful payment
  const handlePaymentSuccess = async (hash: string, receipt?: string) => {
    setTxHash(hash);
    if (receipt) setReceiptId(receipt);

    // Mark session as paid
    try {
      await fetch(`${API_URL}/checkout/session/${sessionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hash: hash,
          payer_wallet: sessionStorage.getItem('walletAddress'),
          payment_method: 'web3auth'
        })
      });
    } catch (e) {
      console.error('Failed to mark session paid:', e);
    }

    setPaymentComplete(true);

    // Vibration feedback
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <NebulaBackground opacity={0.3} />
        <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <NebulaBackground opacity={0.3} />
        <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-400 mb-2">Checkout Error</h1>
            <p className="text-zinc-400">{error}</p>
          </div>
        </div>
      </>
    );
  }

  // Payment complete state
  if (paymentComplete && session) {
    return (
      <>
        <NebulaBackground opacity={0.3} />
        <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            {/* Store branding */}
            <div className="text-center mb-6">
              {session.store_logo ? (
                <img src={session.store_logo} alt={session.store_name} className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">{session.store_name.charAt(0)}</span>
                </div>
              )}
              <p className="text-zinc-400 text-sm">{session.store_name}</p>
            </div>

            {/* Success icon */}
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-emerald-400 text-center mb-2">Payment Complete!</h1>
            <p className="text-zinc-400 text-center mb-6">Thank you for your order</p>

            {/* Amount */}
            <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Amount paid</span>
                <span className="text-2xl font-bold text-white">£{session.amount.toFixed(2)}</span>
              </div>
              {session.order_reference && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-700">
                  <span className="text-zinc-500 text-sm">Order</span>
                  <span className="text-zinc-300 text-sm">{session.order_reference}</span>
                </div>
              )}
            </div>

            {/* Transaction link */}
            {txHash && (
              
               <a href={`https://livenet.xrpl.org/transactions/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sky-400 text-sm hover:text-sky-300 transition mb-6"
              >
                View on XRPL →
              </a>
            )}

            {/* Close / Return button */}
            {session.success_url ? (
              
              <a href={session.success_url}
                className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 rounded-xl text-center transition"
              >
                Return to Store
              </a>
            ) : (
              <button
                onClick={() => window.close()}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-xl transition"
              >
                Close
              </button>
            )}

            {/* Powered by footer */}
            <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
              <p className="text-zinc-600 text-xs mb-1">POWERED BY</p>
              <p className="text-sm font-bold tracking-wider">
                <span className="text-emerald-500">Y</span>
                <span className="text-green-500">A</span>
                <span className="text-blue-500">O</span>
                <span className="text-indigo-500">F</span>
                <span className="text-violet-500">U</span>
                <span className="text-purple-500">S</span>
              </p>
              <p className="text-zinc-600 text-xs mt-1">Secure payments on XRPL</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main checkout view
  return (
    <>
      <NebulaBackground opacity={0.3} />
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden">
          
          {/* Header with store branding */}
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              {session?.store_logo ? (
                <img src={session.store_logo} alt={session.store_name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-400">{session?.store_name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-white">{session?.store_name}</h1>
                <p className="text-zinc-400 text-sm">Secure checkout</p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Order Summary</h2>
            
            {session?.items && session.items.length > 0 ? (
              <div className="space-y-3 mb-4">
                {session.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="text-white">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-zinc-500 text-sm">Qty: {item.quantity}</p>
                      )}
                    </div>
                    <p className="text-zinc-300">£{(item.unit_price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-zinc-400">Payment to {session?.store_name}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <span className="text-zinc-400 font-medium">Total</span>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">£{session?.amount.toFixed(2)}</p>
                {rlusdAmount && (
                  <p className="text-zinc-500 text-sm">≈ {rlusdAmount.toFixed(2)} RLUSD</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment options */}
          <div className="p-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Pay with</h2>

            {session && rlusdAmount && (
              <PaymentOptions
                amount={session.amount}
                rlusdAmount={rlusdAmount}
                vendorWallet={session.vendor_wallet}
                storeName={session.store_name}
                storeId={session.session_id}
                paymentId={session.session_id}
                status={session.status as 'pending' | 'paid' | 'expired' | 'processing'}
                onSuccess={handlePaymentSuccess}
                onError={(err) => setError(err)}
              />
            )}

            {/* Security badges */}
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Encrypted</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-zinc-900/50 p-4 text-center border-t border-zinc-800">
            <p className="text-zinc-600 text-xs mb-1">POWERED BY</p>
            <p className="text-sm font-bold tracking-wider">
              <span className="text-emerald-500">Y</span>
              <span className="text-green-500">A</span>
              <span className="text-blue-500">O</span>
              <span className="text-indigo-500">F</span>
              <span className="text-violet-500">U</span>
              <span className="text-purple-500">S</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
