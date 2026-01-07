'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PaymentData {
  payment_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  vendor_wallet: string;
  amount: number;
  currency: string;
  items: any[];
  tip: number;
  status: string;
  split_index: number | null;
  total_splits: number | null;
  expires_at: string | null;
  paid_at: string | null;
}

interface SplitData {
  payment_id: string;
  amount: number;
  split_index: number;
  status: string;
}

export default function PayPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Split bill state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splits, setSplits] = useState<SplitData[] | null>(null);
  const [currentSplitIndex, setCurrentSplitIndex] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [allPaid, setAllPaid] = useState(false);

  // Xaman QR state
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanPaymentId, setXamanPaymentId] = useState<string | null>(null);

  // NFC state
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);

  // Live conversion state
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [rlusdAmount, setRlusdAmount] = useState<number | null>(null);
  const [priceAge, setPriceAge] = useState<number>(0);

  // Fetch live conversion rate
  useEffect(() => {
    const fetchRate = async () => {
      const amount = getCurrentAmount();
      if (amount <= 0) return;
      
      try {
        const res = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${amount}&capture=true`);
        const data = await res.json();
        if (data.success) {
          setLiveRate(data.rate.gbp_to_rlusd);
          setRlusdAmount(data.rlusd);
          setPriceAge(data.price_age_ms);
        }
      } catch (err) {
        console.error('Rate fetch error:', err);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [payment, splits, currentSplitIndex]);

  // Convert GBP to RLUSD
  const convertGBPtoRLUSD = async (gbpAmount: number): Promise<number> => {
  try {
    const res = await fetch(`https://api.dltpays.com/convert/gbp-to-rlusd?amount=${gbpAmount}&capture=true`);
    const data = await res.json();
    if (data.success) {
      return data.rlusd;
    }
    throw new Error('Conversion failed');
  } catch (err) {
    console.error('Price conversion error:', err);
    // Fallback
    return Math.round(gbpAmount * 1.35 * 100) / 100;
  }
};

  // Fetch payment data
  useEffect(() => {
    if (!paymentId) return;

    const fetchPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/payment-link/${paymentId}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Payment not found');
          return;
        }

        setPayment(data.payment);
      } catch (err) {
        setError('Failed to load payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  // Poll for Xaman payment status
  useEffect(() => {
    if (!xamanPaymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.dltpays.com/api/v1/xaman/payment/poll/${xamanPaymentId}`);
        const data = await res.json();

        if (data.status === 'signed') {
          setTxHash(data.tx_hash);
          setXamanQR(null);
          setXamanPaymentId(null);
          
          // Mark payment as paid in our system
          await fetch(`${API_URL}/payment-link/${getCurrentPaymentId()}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payer_wallet: 'xaman_payment' })
          });

          // Move to next split or show success
          if (splits && currentSplitIndex < splits.length - 1) {
            setCurrentSplitIndex(prev => prev + 1);
          } else {
            setAllPaid(true);
          }

          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          setError(`Payment ${data.status}`);
          setXamanQR(null);
          setXamanPaymentId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [xamanPaymentId, splits, currentSplitIndex]);

  const getCurrentPaymentId = () => {
    if (splits && splits.length > 0) {
      return splits[currentSplitIndex].payment_id;
    }
    return paymentId;
  };

  const getCurrentAmount = () => {
    if (splits && splits.length > 0) {
      return splits[currentSplitIndex].amount;
    }
    return payment?.amount || 0;
  };

  // Generate Xaman QR
  const generateXamanQR = async () => {
    const amount = getCurrentAmount();
    const rlusdAmount = await convertGBPtoRLUSD(amount);

    try {
      const res = await fetch('https://api.dltpays.com/api/v1/xaman/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: rlusdAmount,
          vendor_wallet: payment?.vendor_wallet,
          store_id: payment?.store_id,
          store_name: payment?.store_name
        })
      });

      const data = await res.json();
      if (data.success) {
        setXamanQR(data.qr_png);
        setXamanPaymentId(data.payment_id);
      } else {
        setError(data.error || 'Failed to create payment');
      }
    } catch (err) {
      setError('Failed to create payment request');
    }
  };

  // Start NFC scan
  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      setError('NFC not supported on this device');
      return;
    }

    setNfcScanning(true);
    setError(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', async (event: any) => {
        const uid = event.serialNumber?.replace(/:/g, '').toUpperCase();
        if (!uid) {
          setError('Could not read card');
          setNfcScanning(false);
          return;
        }

        setNfcScanning(false);
        setProcessing(true);

        try {
          const res = await fetch(`${API_URL}/payment-link/${getCurrentPaymentId()}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_uid: uid })
          });

          const result = await res.json();

          if (result.success) {
            setTxHash(result.tx_hash);
            
            // Move to next split or show success
            if (splits && currentSplitIndex < splits.length - 1) {
              setCurrentSplitIndex(prev => prev + 1);
            } else {
              setAllPaid(true);
            }

            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          } else {
            setError(result.error || 'Payment failed');
          }
        } catch (err) {
          setError('Payment failed');
        } finally {
          setProcessing(false);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading card');
        setNfcScanning(false);
      });

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('NFC permission denied');
      } else {
        setError('Failed to start NFC');
      }
      setNfcScanning(false);
    }
  };

  // Handle split bill
  const handleSplitBill = async () => {
    setSplitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/payment-link/${paymentId}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_splits: splitCount })
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
    } finally {
      setSplitting(false);
    }
  };

  // Share link
  const shareLink = async (url: string, index: number, amount: number) => {
    const text = `Pay your share (${index}/${splits?.length}): £${amount.toFixed(2)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Split Bill Payment', text, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error state (no payment)
  if (error && !payment) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold mb-2">Payment Not Found</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  // Expired state
  if (payment?.status === 'expired') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold mb-2">Payment Expired</h1>
          <p className="text-zinc-400">This payment link has expired</p>
        </div>
      </div>
    );
  }

  // All paid success state
if (allPaid || payment?.status === 'paid') {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center">
        {payment?.store_logo ? (
          <img 
            src={payment.store_logo} 
            alt={payment.store_name} 
            className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6"
          />
        ) : (
          <img 
            src="https://yesallofus.com/dltpayslogo1.png" 
            alt="YesAllOfUs" 
            className="w-20 h-20 rounded-2xl mx-auto mb-6"
          />
        )}
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Payment Complete!</h1>
        <p className="text-xl text-zinc-400 mb-2">Thank you for shopping at</p>
        <p className="text-2xl font-bold mb-6">{payment?.store_name}</p>
        
        {txHash && (
          <a 
            href={`https://livenet.xrpl.org/transactions/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 text-sm underline block mb-6"
          >
            View on XRPL →
          </a>
        )}

        {/* Email & Print buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <button 
            onClick={() => {
              const email = prompt('Enter your email for receipt:');
              if (email && email.includes('@')) {
                fetch('https://api.dltpays.com/nfc/api/v1/receipt/email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: email,
                    store_name: payment?.store_name,
                    store_id: payment?.store_id,
                    amount: payment?.amount,
                    tx_hash: txHash
                  })
                }).then(() => alert('Receipt sent!')).catch(() => alert('Failed to send'));
              }
            }}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span>📧</span> Email Receipt
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span>🖨️</span> Print
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <img 
            src="https://yesallofus.com/dltpayslogo1.png" 
            alt="YesAllOfUs" 
            className="w-10 h-10 rounded-lg mx-auto mb-3"
          />
          <p className="text-zinc-500 text-sm">Thank you for using YesAllOfUs</p>
          <p className="text-emerald-400 text-sm font-medium">You are a pioneer!</p>
        </div>
      </div>
    </div>
  );
}

  // Main payment view (with splits support)
  const currentAmount = getCurrentAmount();
  const currentIndex = splits ? currentSplitIndex + 1 : (payment?.split_index || null);
  const totalSplits = splits?.length || payment?.total_splits || null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto p-6">
        {/* Store header */}
        <div className="flex items-center gap-4 mb-6">
          {payment?.store_logo ? (
            <img 
              src={payment.store_logo} 
              alt={payment.store_name} 
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{payment?.store_name}</h1>
            {totalSplits && (
              <p className="text-emerald-400 text-sm font-medium">
                Payment {currentIndex} of {totalSplits}
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mb-4">
          <p className="text-zinc-400 mb-2">Amount to pay</p>
          <p className="text-6xl font-bold text-emerald-400">
            £{currentAmount.toFixed(2)}
          </p>
        </div>

        {/* Live Conversion Rate - Powered by CoinGecko */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img 
                src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png" 
                alt="CoinGecko" 
                className="w-5 h-5"
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

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Processing overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl">Processing payment...</p>
            </div>
          </div>
        )}

        {/* Payment Options */}
        {!xamanQR ? (
          <>
            {/* NFC Tap Zone */}
            {nfcSupported && (
              <button
                onClick={startNFCScan}
                disabled={nfcScanning || processing}
                className="w-full mb-4"
              >
                <div className={`bg-zinc-900 rounded-2xl p-8 border-2 transition ${
                  nfcScanning ? 'border-emerald-500' : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                      nfcScanning ? 'bg-emerald-500/20 animate-pulse' : 'bg-zinc-800'
                    }`}>
                      <svg className={`w-10 h-10 ${nfcScanning ? 'text-emerald-400' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold mb-1">
                      {nfcScanning ? 'Tap your card now...' : 'Tap to Pay'}
                    </p>
                    <p className="text-zinc-500 text-sm">Hold your NFC card to your phone</p>
                  </div>
                </div>
              </button>
            )}

            <div className="text-center text-zinc-500 my-4">or</div>

            {/* Xaman button */}
            <button 
              onClick={generateXamanQR}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-5 flex items-center justify-center gap-3 transition mb-6"
            >
              <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded-lg" />
              <span className="font-medium">Pay with Xaman</span>
            </button>

            {/* Split bill button (only if not already split) */}
            {!payment?.split_index && !splits && (
              <button
                onClick={() => setShowSplitModal(true)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-4 font-medium transition mb-6"
              >
                Split Bill
              </button>
            )}

            {/* Share links for other splits */}
            {splits && splits.length > 1 && (
  <div className="border-t border-zinc-800 pt-6">
    <p className="text-zinc-400 text-sm mb-3">Share with friends:</p>
    <div className="space-y-2">
      {splits.filter((_, idx) => idx > currentSplitIndex).map((split) => (
                    <div 
                      key={split.payment_id}
                      className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-zinc-400 text-sm">Person {split.split_index}</span>
                        <p className="font-semibold">£{split.amount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => shareLink(`https://yesallofus.com/pay/${split.payment_id}`, split.split_index, split.amount)}
                        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Share
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* QR Code View */
          <div className="text-center">
            <div className="bg-white rounded-3xl p-6 mb-6 inline-block">
              <img 
                src={xamanQR} 
                alt="Scan with Xaman" 
                className="w-56 h-56"
              />
            </div>
            <p className="text-xl font-semibold text-sky-400 mb-2">Scan with Xaman</p>
            <p className="text-zinc-500 mb-6">Open Xaman wallet and scan the QR code</p>
            
            <button
              onClick={() => {
                setXamanQR(null);
                setXamanPaymentId(null);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl font-medium transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-600 text-sm">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded" />
          <span>Powered by YesAllOfUs</span>
        </div>
      </div>

      {/* Split Bill Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-6">Split Bill</h2>
            
            <p className="text-zinc-400 mb-4">How many people?</p>
            
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition"
              >
                −
              </button>
              <span className="text-5xl font-bold w-20 text-center">{splitCount}</span>
              <button
                onClick={() => setSplitCount(Math.min(100, splitCount + 1))}
                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition"
              >
                +
              </button>
            </div>

            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-zinc-400 mb-2">
                <span>Total</span>
                <span>£{payment?.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Each pays</span>
                <span className="text-emerald-400">
 £{((payment?.amount || 0) / splitCount).toFixed(3)}
</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSplitBill}
                disabled={splitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                {splitting ? 'Splitting...' : 'Split'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}