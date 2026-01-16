'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NebulaBackground from '@/components/NebulaBackground';
import InstantPay from '@/components/InstantPay';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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

  // Check if user is logged in
  useEffect(() => {
    const stored = sessionStorage.getItem('walletAddress');
    const method = sessionStorage.getItem('loginMethod');
    if (stored && method === 'web3auth') {
      setIsLoggedIn(true);
      setWalletAddress(stored);
    }
  }, []);

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

            {/* Already logged in - show InstantPay */}
            {isLoggedIn && session && rlusdAmount && (
              <InstantPay
                amount={session.amount}
                rlusdAmount={rlusdAmount}
                vendorWallet={session.vendor_wallet}
                storeName={session.store_name}
                storeId={session.session_id}
                paymentId={session.session_id}
                onSuccess={handlePaymentSuccess}
                onError={(err) => setError(err)}
              />
            )}

            {/* Not logged in - show signup prompt */}
            {!isLoggedIn && session && (
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    try {
                      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
                      const result = await loginWithWeb3Auth();
                      if (!result) return;
                      const address = typeof result === 'string' ? result : result.address;
                      const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
                      sessionStorage.setItem('walletAddress', address);
                      sessionStorage.setItem('loginMethod', 'web3auth');
                      sessionStorage.setItem('socialProvider', provider);
                      setWalletAddress(address);
                      setIsLoggedIn(true);
                    } catch (err) {
                      console.error('Login error:', err);
                      setError('Failed to connect wallet');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-black font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Pay with RLUSD on XRPL
                </button>
                
                <p className="text-center text-zinc-500 text-sm">
                  Sign in with Google, Apple, or social account to pay instantly
                </p>

                <div className="flex justify-center gap-4 pt-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-zinc-700">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                </div>
              </div>
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
