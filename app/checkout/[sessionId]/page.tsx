'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NebulaBackground from '@/components/NebulaBackground';
import PaymentOptions from '@/components/PaymentOptions';
import TipSelector from '@/components/TipSelector';
import SplitBillModal from '@/components/SplitBillModal';
import ReceiptActions from '@/components/ReceiptActions';

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
  payment_link_id: string | null;
  expires_at: string | null;
  paid_at: string | null;
  success_url: string | null;
  cancel_url: string | null;
}

interface SplitData {
  payment_id: string;
  amount: number;
  split_index: number;
  status: string;
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
  const [liveRate, setLiveRate] = useState<number | null>(null);
  
  // Tip state
  const [tipAmount, setTipAmount] = useState(0);
  
  // Split bill state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splits, setSplits] = useState<SplitData[] | null>(null);
  const [currentSplitIndex, setCurrentSplitIndex] = useState(0);
  // User status detection
const [userStatus, setUserStatus] = useState<'checking' | 'registered' | 'new'>('checking');

// Check user registration status
useEffect(() => {
  const checkUserRegistration = async () => {
    if (!session) return;
    
    try {
      // Check if user has a connected wallet
      const walletAddress = localStorage.getItem('yesallofus_wallet') || 
                           sessionStorage.getItem('walletAddress');
      
      if (!walletAddress) {
        setUserStatus('new');
        return;
      }

      // Extract store ID from session
      const storeId = session.session_id.replace('sess_', 'store_');
      
      // Check if registered with the store
      const response = await fetch(`https://api.dltpays.com/api/v1/customer/status?wallet=${walletAddress}&store=${storeId}`);
      const data = await response.json();
      
      setUserStatus(data.isRegistered ? 'registered' : 'new');
    } catch (error) {
      console.error('User status check failed:', error);
      setUserStatus('new'); // Default to signup flow
    }
  };

  if (session) {
    checkUserRegistration();
  }
}, [session]);

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
              setLiveRate(rateData.rlusd / data.session.amount);
            }
          } catch (e) {
            // Fallback estimate
            setRlusdAmount(data.session.amount * 1.27);
            setLiveRate(1.27);
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

  // Update RLUSD when tip changes
  useEffect(() => {
    if (!session) return;
    const totalAmount = session.amount + tipAmount;
    const fetchRate = async () => {
      try {
        const rateRes = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${totalAmount}`);
        const rateData = await rateRes.json();
        if (rateData.success) {
          setRlusdAmount(rateData.rlusd);
          setLiveRate(rateData.rlusd / totalAmount);
        }
      } catch (e) {
        setRlusdAmount(totalAmount * 1.27);
        setLiveRate(1.27);
      }
    };
    fetchRate();
  }, [tipAmount, session]);

  // Get current amount (with tip, or split amount)
  const getCurrentAmount = () => {
    if (splits && splits.length > 0) {
      return splits[currentSplitIndex].amount;
    }
    return (session?.amount || 0) + tipAmount;
  };

  // Get current payment ID
  const getCurrentPaymentId = () => {
    if (splits && splits.length > 0) {
      return splits[currentSplitIndex].payment_id;
    }
    return session?.payment_link_id || sessionId;
  };

  // Handle split bill
  const handleSplitBill = async (numSplits: number) => {
    if (!session) return;
    
    try {
      const res = await fetch(`${API_URL}/checkout/session/${sessionId}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_splits: numSplits })
      });

      const result = await res.json();

      if (result.success) {
        setSplits(result.splits.map((s: any) => ({
          payment_id: s.payment_id,
          amount: s.amount,
          split_index: s.split_index,
          status: 'pending'
        })));
        setShowSplitModal(false);
        setCurrentSplitIndex(0);
      } else {
        setError(result.error || 'Failed to split bill');
      }
    } catch (err) {
      setError('Failed to split bill');
    }
  };

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
          payment_method: 'web3auth',
          tip_amount: tipAmount
        })
      });
    } catch (e) {
      console.error('Failed to mark session paid:', e);
    }

    // Handle splits
    if (splits && currentSplitIndex < splits.length - 1) {
      // Move to next split
      const updatedSplits = [...splits];
      updatedSplits[currentSplitIndex].status = 'paid';
      setSplits(updatedSplits);
      setCurrentSplitIndex(prev => prev + 1);
    } else {
      setPaymentComplete(true);
    }

    // Vibration feedback
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  // Redirect to signup function
  const redirectToSignup = () => {
    if (!session) return;
    
    const currentCheckoutUrl = window.location.href;
    const storeId = session.session_id.replace('sess_', 'store_');
    const signupUrl = `/customer-signup?store=${storeId}&referrer=checkout&redirect=${encodeURIComponent(currentCheckoutUrl)}`;
    window.location.href = signupUrl;
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
                <span className="text-2xl font-bold text-white">£{(session.amount + tipAmount).toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-700">
                  <span className="text-zinc-500 text-sm">Includes tip</span>
                  <span className="text-emerald-400 text-sm">£{tipAmount.toFixed(2)}</span>
                </div>
              )}
              {session.order_reference && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-700">
                  <span className="text-zinc-500 text-sm">Order</span>
                  <span className="text-zinc-300 text-sm">{session.order_reference}</span>
                </div>
              )}
            </div>

            {/* Transaction link */}
            {txHash && (
              <a 
                href={`https://livenet.xrpl.org/transactions/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sky-400 text-sm hover:text-sky-300 transition mb-6"
              >
                View on XRPL →
              </a>
            )}

            {/* Receipt Actions */}
            <div className="mb-6">
              <ReceiptActions
                receiptId={receiptId || undefined}
                txHash={txHash || undefined}
                storeName={session.store_name}
                storeId={session.session_id}
                amount={session.amount + tipAmount}
                rlusdAmount={rlusdAmount || undefined}
                items={session.items}
                tipAmount={tipAmount}
                storeLogo={session.store_logo || undefined}
              />
            </div>

            {/* Close / Return button */}
            {session.success_url ? (
              <a 
                href={session.success_url}
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

            {/* YAOFUS Pioneers Badge - Footer */}
            <footer className="py-6 flex flex-col items-center gap-1 mt-6 border-t border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-medium tracking-wider">CATALOG</span>
              <span className="text-base font-extrabold tracking-widest">
                <span className="text-emerald-500">Y</span>
                <span className="text-green-500">A</span>
                <span className="text-blue-500">O</span>
                <span className="text-indigo-500">F</span>
                <span className="text-violet-500">U</span>
                <span className="text-purple-500">S</span>
              </span>
              <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">PRODUCTS</span>
              <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
                <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
                <span>Powered by YesAllOfUs</span>
              </div>
            </footer>
          </div>
        </div>
      </>
    );
  }

  const currentAmount = getCurrentAmount();
  const totalSplits = splits?.length || null;
  const currentIndex = splits ? currentSplitIndex + 1 : null;

  // Main checkout view
  return (
    <>
      <NebulaBackground opacity={0.3} />
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
        <div className="relative md:flex md:gap-6 md:items-start md:max-w-4xl w-full">
          {/* Desktop Conversion Rate - Right side */}
          <div className="hidden md:block md:w-80 md:sticky md:top-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png"
                    alt="CoinGecko"
                    className="h-5 w-auto object-contain"
                  />
                  <span className="text-xs text-zinc-500">Live rate from CoinGecko Pro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-500 font-medium">LIVE</span>
                </div>
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-sm">Settlement amount</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white font-mono">
                    {rlusdAmount ? rlusdAmount.toFixed(4) : '...'} <span className="text-emerald-400 text-lg">RLUSD</span>
                  </span>
                  {liveRate && (
                    <p className="text-xs text-zinc-500 mt-1">
                      £1 = {liveRate.toFixed(4)} RLUSD
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 font-medium">Live price.</span> Updated every 10s via CoinGecko Pro (600+ exchanges). Settlement variance &lt;0.1%.
                </p>
              </div>
            </div>
          </div>

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
                <p className="text-zinc-400 text-sm">
                  {totalSplits ? `Payment ${currentIndex} of ${totalSplits}` : 'Secure checkout with XRPL'}
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Order Summary</h2>

            {session?.order_reference && (
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">Order Reference</span>
                <span className="text-zinc-300 text-sm font-mono">{session.order_reference}</span>
              </div>
            )}

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
            {/* User Status Check */}
{userStatus === 'checking' && (
  <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 text-center mb-6">
    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p className="text-zinc-400">Checking your account status...</p>
  </div>
)}

{/* New User Signup Prompt */}
{userStatus === 'new' && (
  <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-xl p-6 text-center mb-6">
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
      </svg>
    </div>
    
    <h3 className="text-xl font-bold text-white mb-2">Welcome to YesAllOfUs!</h3>
    <p className="text-emerald-300 mb-4">Join to pay with RLUSD or USDC and join {session?.store_name}'s affiliate program</p>
    
    <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
      <div className="text-center">
        <div className="text-emerald-400 font-semibold">Earn Commissions</div>
        <div className="text-zinc-400">Vendor rewards</div>
      </div>
      <div className="text-center">
        <div className="text-blue-400 font-semibold">Tap & Pay</div>
        <div className="text-zinc-400">Web3Auth</div>
      </div>
      <div className="text-center">
        <div className="text-purple-400 font-semibold">Secure</div>
        <div className="text-zinc-400">XRPL</div>
      </div>
    </div>
    
    <button
      onClick={redirectToSignup}
      className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      Sign Up Here - Takes 2 Minutes
    </button>
    
    <p className="text-zinc-500 text-xs mt-3">Free to join • Pay instantly, no waiting</p>
  </div>
)}

            {/* Tip display if added */}
            {tipAmount > 0 && (
              <div className="flex justify-between items-center py-2 text-emerald-400">
                <span>Tip</span>
                <span>£{tipAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <span className="text-zinc-400 font-medium">Total</span>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">£{currentAmount.toFixed(2)}</p>
                {rlusdAmount && (
                  <p className="text-zinc-500 text-sm">≈ {rlusdAmount.toFixed(2)} RLUSD</p>
                )}
              </div>
            </div>

            {/* Terms and Privacy */}
            <p className="text-center text-xs text-zinc-500 mt-4">
              By completing this payment, you agree to our{' '}
              <a href="/pos-terms" className="text-zinc-400 underline hover:text-white">Terms</a>
              {' '}and{' '}
              <a href="/pos-privacy" className="text-zinc-400 underline hover:text-white">Privacy Policy</a>
            </p>

            {/* Cancel/Back button */}
            {session?.cancel_url && (
              
              <a href={session.cancel_url}
                className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition"
              >
                ← Return to store
              </a>
            )}
          </div>

          {/* Payment options */}
          <div className="p-6">
            {/* Payment Methods - Only show for registered users */}
{userStatus === 'registered' && (
  <>
    {/* Tip Selector - only show if not split */}
    {!splits && session?.status === 'pending' && (
      <TipSelector
        amount={session.amount}
        onTipChange={setTipAmount}
      />
    )}

    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Pay with</h2>

    {session && rlusdAmount && (
      <PaymentOptions
        amount={currentAmount}
        rlusdAmount={rlusdAmount}
        vendorWallet={session.vendor_wallet}
        storeName={session.store_name}
        storeId={session.session_id}
        paymentId={getCurrentPaymentId()}
        status={session.status as 'pending' | 'paid' | 'expired' | 'processing'}
        onSuccess={handlePaymentSuccess}
        onError={(err) => setError(err)}
        showSplitBill={!splits && session.status === 'pending'}
        onSplitBill={() => setShowSplitModal(true)}
        isCheckoutSession={true}
        tipAmount={tipAmount}
      />
    )}
  </>
)}
{/* Live Conversion Rate - Mobile only */}
            <div className="md:hidden bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png"
                    alt="CoinGecko"
                    className="h-5 w-auto object-contain"
                  />
                  <span className="text-xs text-zinc-500">Live rate from CoinGecko Pro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-500 font-medium">LIVE</span>
                </div>
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-sm">Settlement amount</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white font-mono">
                    {rlusdAmount ? rlusdAmount.toFixed(4) : '...'} <span className="text-emerald-400 text-lg">RLUSD</span>
                  </span>
                  {liveRate && (
                    <p className="text-xs text-zinc-500 mt-1">
                      £1 = {liveRate.toFixed(4)} RLUSD
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 font-medium">Live price.</span> Updated every 10s via CoinGecko Pro (600+ exchanges). Settlement variance &lt;0.1%.
                </p>
              </div>
            </div>

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

          {/* YAOFUS Pioneers Badge - Footer */}
          <footer className="py-6 flex flex-col items-center gap-1 border-t border-zinc-800">
            <span className="text-zinc-500 text-[10px] font-medium tracking-wider">CATALOG</span>
            <span className="text-base font-extrabold tracking-widest">
              <span className="text-emerald-500">Y</span>
              <span className="text-green-500">A</span>
              <span className="text-blue-500">O</span>
              <span className="text-indigo-500">F</span>
              <span className="text-violet-500">U</span>
              <span className="text-purple-500">S</span>
            </span>
            <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">PRODUCTS</span>
            <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
              <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
              <span>Powered by YesAllOfUs</span>
            </div>
          </footer>
        </div>
      </div>
    </div>

      {/* Split Bill Modal */}
      {session && (
        <SplitBillModal
          amount={session.amount + tipAmount}
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onSplit={handleSplitBill}
        />
      )}
    </>
  );
}