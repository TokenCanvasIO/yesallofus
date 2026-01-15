'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InstantPay from '@/components/InstantPay';
import { QRCodeSVG } from 'qrcode.react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

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
  const [nfcController, setNfcController] = useState<AbortController | null>(null);

  // Live conversion state
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [rlusdAmount, setRlusdAmount] = useState<number | null>(null);
  const [priceAge, setPriceAge] = useState<number>(0);
// Split success message
  const [showToast, setShowToast] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Split share state
  const [copiedSplitId, setCopiedSplitId] = useState<string | null>(null);
  const [showSplitQR, setShowSplitQR] = useState<string | null>(null);
  const [showSplitEmailModal, setShowSplitEmailModal] = useState(false);
  const [splitEmailTarget, setSplitEmailTarget] = useState<SplitData | null>(null);
  const [splitEmailAddress, setSplitEmailAddress] = useState('');
  const [sendingSplitEmail, setSendingSplitEmail] = useState(false);

  // Print receipt

  const printReceipt = async () => {
  console.log('DEBUG printReceipt - receiptId:', receiptId);
  const items = payment?.items || [];
  const tip = payment?.tip || 0;
  
  // Fetch receipt data if available
  let receiptData = null;
  if (receiptId) {
    try {
      const res = await fetch(`https://api.dltpays.com/nfc/api/v1/receipts/${receiptId}`);
      const data = await res.json();
      if (data.success && data.receipt) {
        receiptData = data.receipt;
      }
    } catch (e) {
      console.error('Failed to fetch receipt for print:', e);
    }
  }
  
  // Build settlement details HTML if we have conversion data
  const settlementHtml = (receiptData?.amount_rlusd && receiptData?.conversion_rate) ? `
    <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 3px solid #10b981;">
      <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 8px;">💱 SETTLEMENT DETAILS</div>
      <div style="font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span style="color: #666;">Amount Quoted:</span>
          <span>£${(receiptData.total || payment?.amount || 0).toFixed(2)} GBP</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span style="color: #666;">Amount Settled:</span>
          <span style="font-weight: 600;">${receiptData.amount_rlusd.toFixed(6)} RLUSD</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span style="color: #666;">Exchange Rate:</span>
          <span>£1 = ${receiptData.conversion_rate.gbp_to_rlusd?.toFixed(6) || 'N/A'} RLUSD</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span style="color: #666;">Rate Source:</span>
          <span>${receiptData.conversion_rate.source || 'CoinGecko Pro API'}</span>
        </div>
        ${receiptData.conversion_rate.captured_at ? `
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span style="color: #666;">Rate Timestamp:</span>
          <span style="font-size: 11px; color: #888;">${new Date(receiptData.conversion_rate.captured_at).toISOString()}</span>
        </div>
        ` : ''}
      </div>
    </div>
  ` : '';

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${payment?.store_name || 'YesAllOfUs'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 400px; 
          margin: 0 auto; 
          padding: 30px 20px;
          color: #1a1a1a;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }
        .store-logo { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; margin: 0 auto 12px; display: block; }
        .store-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .receipt-label { font-size: 12px; color: #666; }
        .date { font-size: 12px; color: #666; margin-bottom: 20px; text-align: center; }
        .items { margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .item-name { font-weight: 500; }
        .item-qty { color: #666; font-size: 14px; }
        .item-price { font-weight: 600; }
        .tip-row { display: flex; justify-content: space-between; padding: 8px 0; color: #10b981; }
        .total-section { margin-top: 12px; padding-top: 12px; border-top: 2px solid #1a1a1a; display: flex; justify-content: space-between; align-items: center; }
        .total-label { font-size: 16px; font-weight: 600; }
        .total-amount { font-size: 24px; font-weight: 700; color: #10b981; }
        .tx-section { margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
        .tx-label { font-size: 10px; color: #666; margin-bottom: 4px; }
        .tx-hash { font-size: 9px; font-family: monospace; word-break: break-all; color: #333; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .footer-logo { width: 20px; height: 20px; border-radius: 4px; opacity: 0.6; }
        .footer-text { color: #999; font-size: 11px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        ${payment?.store_logo 
          ? `<img src="${payment.store_logo}" alt="${payment.store_name}" class="store-logo">`
          : `<img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="store-logo">`
        }
        <div class="store-name">${payment?.store_logo ? payment?.store_name : 'YesAllOfUs'}</div>
        ${!payment?.store_logo ? `<div class="receipt-label">${payment?.store_name}</div>` : ''}
        <div class="receipt-label">Receipt</div>
      </div>
      <div class="date">${new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}</div>
      ${items.length > 0 ? `
        <div class="items">
          ${items.map(item => {
            const price = item.price || item.unit_price || 0;
            const qty = item.quantity || 1;
            return `
              <div class="item">
                <div>
                  <div class="item-name">${item.name}</div>
                  <div class="item-qty">${qty} × £${price.toFixed(2)}</div>
                </div>
                <div class="item-price">£${(price * qty).toFixed(2)}</div>
              </div>
            `;
          }).join('')}
          ${tip > 0 ? `
            <div class="tip-row">
              <span>Tip</span>
              <span>£${tip.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      <div class="total-section">
        <span class="total-label">Total Paid</span>
        <span class="total-amount">£${(payment?.amount || 0).toFixed(2)}</span>
      </div>
      ${settlementHtml}
      ${txHash ? `
        <div class="tx-section">
          <div class="tx-label">Transaction ID (XRPL)</div>
          <div class="tx-hash">${txHash}</div>
        </div>
      ` : ''}
      <div class="footer">
        <span style="color: #71717a; font-size: 9px; font-weight: 500; letter-spacing: 1px;">RECEIPT</span>
        <span style="font-size: 16px; font-weight: 800; letter-spacing: 2px;">
          <span style="color: #10b981;">Y</span>
          <span style="color: #22c55e;">A</span>
          <span style="color: #3b82f6;">O</span>
          <span style="color: #6366f1;">F</span>
          <span style="color: #8b5cf6;">U</span>
          <span style="color: #a855f7;">S</span>
        </span>
        <span style="color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 1.5px;">INSTANT</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="footer-logo">
          <span class="footer-text">Powered by YesAllOfUs</span>
        </div>
      </div>
    </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};

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

// Check NFC support on mount
useEffect(() => {
  if ('NDEFReader' in window) {
    setNfcSupported(true);
  }
}, []);

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
          if (data.receipt_id) setReceiptId(data.receipt_id);
          setXamanQR(null);
          setXamanPaymentId(null);
          
          // Mark payment as paid in our system
          const payRes = await fetch(`${API_URL}/payment-link/${getCurrentPaymentId()}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payer_wallet: 'xaman_payment', tx_hash: data.tx_hash })
          });
          const payData = await payRes.json();
          if (payData.receipt_id) setReceiptId(payData.receipt_id);

          // Move to next split or show success
          if (splits && currentSplitIndex < splits.length - 1) {
            setCurrentSplitIndex(prev => prev + 1);
          } else {
            setAllPaid(true);
          }

          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else if (data.status === 'expired' || data.status === 'cancelled' || data.status === 'failed') {
          setError(data.message || `Payment ${data.status}`);
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

  // Stop NFC scan
  const stopNFCScan = () => {
    if (nfcController) {
      nfcController.abort();
      setNfcController(null);
    }
    setNfcScanning(false);
  };

  // Start NFC scan
  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      setError('NFC not supported on this device');
      return;
    }

    // Always abort any existing scan first
    stopNFCScan();

    const controller = new AbortController();
    setNfcController(controller);
    setNfcScanning(true);
    setError(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });

      ndef.addEventListener('reading', async (event: any) => {
        // Immediately abort to prevent duplicate reads
        controller.abort();
        
        const uid = event.serialNumber?.replace(/:/g, '').toUpperCase();
        if (!uid) {
          setError('Could not read card');
          setNfcScanning(false);
          setNfcController(null);
          return;
        }

        setNfcScanning(false);
        setNfcController(null);
        setProcessing(true);

        // Get the current payment ID at the moment of scan
        const currentPaymentId = splits && splits.length > 0 
          ? splits[currentSplitIndex]?.payment_id 
          : paymentId;
          
        // Check if this split is already paid
        if (splits && splits[currentSplitIndex]?.status === 'paid') {
          setError(null);
          setProcessing(false);
          return;
        }

        try {
          const res = await fetch(`${API_URL}/payment-link/${currentPaymentId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_uid: uid })
          });

          const result = await res.json();

          if (result.success) {
  setTxHash(result.tx_hash);
  setReceiptId(result.receipt_id);
  setError(null);
  
  // Mark current split as paid
  if (splits) {
    setSplits(prev => prev!.map((s, idx) => 
      idx === currentSplitIndex ? { ...s, status: 'paid' } : s
    ));
  }
  
  // Show success toast
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500);
  
  // Move to next split or show success
  if (splits && currentSplitIndex < splits.length - 1) {
    setTimeout(() => {
      setCurrentSplitIndex(prev => prev + 1);
    }, 800);
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
          setNfcScanning(false);
          setNfcController(null);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading card');
        stopNFCScan();
      });

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('NFC permission denied');
      } else if (err.name !== 'AbortError') {
        setError('Failed to start NFC');
      }
      stopNFCScan();
    }
  };

  // Handle split bill
const handleSplitBill = async () => {
  // Prevent if already split
  if (payment?.status === 'split' || splits) {
    setError('This bill has already been split');
    setShowSplitModal(false);
    return;
  }

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
            onClick={() => setShowEmailModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span>📧</span> Email Receipt
          </button>
          <button 
            onClick={printReceipt}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span>🖨️</span> Print
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col items-center gap-1">
          <span className="text-zinc-500 text-[10px] font-medium tracking-wider">RECEIPT</span>
          <span className="text-base font-extrabold tracking-widest">
            <span className="text-emerald-500">Y</span>
            <span className="text-green-500">A</span>
            <span className="text-blue-500">O</span>
            <span className="text-indigo-500">F</span>
            <span className="text-violet-500">U</span>
            <span className="text-purple-500">S</span>
          </span>
          <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">INSTANT</span>
          <div className="flex items-center gap-2 mt-2">
            <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" className="w-5 h-5 rounded opacity-60" />
            <span className="text-zinc-600 text-xs">Powered by YesAllOfUs</span>
          </div>
        </div>
      </div>
      
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Send Receipt</h3>
            <input
              type="email"
              placeholder="Your email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailAddress('');
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!emailAddress || !emailAddress.includes('@')) return;
                  setSendingEmail(true);
                  try {
                    await fetch('https://api.dltpays.com/nfc/api/v1/receipt/email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: emailAddress,
                        store_name: payment?.store_name,
                        store_id: payment?.store_id,
                        amount: payment?.amount,
                        items: [
                          ...(payment?.items || []),
                          ...(payment?.tip && payment.tip > 0 ? [{ name: 'Tip', quantity: 1, unit_price: payment.tip }] : [])
                        ],
                        tx_hash: txHash
                      })
                    });
                    setShowEmailModal(false);
                    setEmailAddress('');
                  } catch (err) {
                    console.error('Failed to send email');
                  }
                  setSendingEmail(false);
                }}
                disabled={sendingEmail}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {sendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  // Main payment view
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
<div className="text-center mb-6">
  {payment?.store_logo ? (
    <img 
      src={payment.store_logo} 
      alt={payment.store_name} 
      className="w-16 h-16 rounded-xl object-cover mx-auto mb-3"
    />
  ) : (
    <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-3">
      <span className="text-2xl">🏪</span>
    </div>
  )}
  <h1 className="text-xl font-bold">{payment?.store_name}</h1>
  {totalSplits && (
    <p className="text-emerald-400 text-sm font-medium">
      Payment {currentIndex} of {totalSplits}
    </p>
  )}
</div>

{/* Success Toast */}
{showToast && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg animate-pulse">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
    Payment successful!
  </div>
)}

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
            {error === 'INSUFFICIENT_FUNDS' ? (
              <>
                <p className="text-red-400 font-medium mb-2">Insufficient funds in your wallet</p>
                <p className="text-zinc-400 text-sm mb-3">Please top up your RLUSD balance to complete this payment.</p>
                <a href="/affiliate-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Top Up Wallet
                </a>
              </>
            ) : error === 'SELF_PAYMENT_NOT_ALLOWED' ? (
              <>
                <p className="text-red-400 font-medium mb-2">Cannot pay to your own wallet</p>
                <p className="text-zinc-400 text-sm">You're trying to pay with the same wallet that receives payments for this store.</p>
              </>
            ) : error === 'WALLET_NOT_READY' ? (
              <>
                <p className="text-red-400 font-medium mb-2">Wallet not ready for payments</p>
                <p className="text-zinc-400 text-sm mb-3">Your wallet needs to be set up to send RLUSD payments.</p>
                <a href="/affiliate-dashboard"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition"
                >
                  Set Up Wallet
                </a>
              </>
            ) : (
              <p className="text-red-400">{error}</p>
            )}
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
    {/* Instant Pay with Web3Auth/Biometrics */}
    <div className="mb-4">
      <InstantPay
  amount={currentAmount}
  rlusdAmount={rlusdAmount || currentAmount * 1.35}
  vendorWallet={payment?.vendor_wallet || ''}
  storeName={payment?.store_name || ''}
  storeId={payment?.store_id || ''}
  paymentId={getCurrentPaymentId()}
  onSuccess={(txHash, receiptId) => {
  console.log('DEBUG onSuccess:', { txHash, receiptId });
  setTxHash(txHash);
  if (receiptId) setReceiptId(receiptId);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000); // Hide after 3 seconds
  
  if (splits && currentSplitIndex < splits.length - 1) {
    setCurrentSplitIndex(prev => prev + 1);
  } else {
    setAllPaid(true);
  }
}}
  onError={(error) => setError(error)}
/>
    </div>

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
{!payment?.split_index && !splits && payment?.status === 'pending' && (
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
                <div className="space-y-3">
                  {splits.filter((_, idx) => idx > currentSplitIndex).map((split) => (
                    <div 
                      key={split.payment_id}
                      className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-zinc-400 text-sm">Person {split.split_index}</span>
                          <p className="text-xl font-bold text-emerald-400">£{split.amount.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => setShowSplitQR(split.payment_id)}
                          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition"
                          title="Show QR"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(`https://yesallofus.com/pay/${split.payment_id}`);
                            setCopiedSplitId(split.payment_id);
                            setTimeout(() => setCopiedSplitId(null), 2000);
                          }}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                            copiedSplitId === split.payment_id 
                              ? 'bg-emerald-500 text-black' 
                              : 'bg-zinc-800 hover:bg-zinc-700'
                          }`}
                        >
                          {copiedSplitId === split.payment_id ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSplitEmailTarget(split);
                            setShowSplitEmailModal(true);
                          }}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </button>
                        <button
                          onClick={() => shareLink(`https://yesallofus.com/pay/${split.payment_id}`, split.split_index, split.amount)}
                          className="bg-zinc-800 hover:bg-zinc-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
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
        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col items-center gap-1">
          <span className="text-zinc-500 text-[10px] font-medium tracking-wider">COMPLETE PAYMENT</span>
          <span className="text-base font-extrabold tracking-widest">
            <span className="text-emerald-500">Y</span>
            <span className="text-green-500">A</span>
            <span className="text-blue-500">O</span>
            <span className="text-indigo-500">F</span>
            <span className="text-violet-500">U</span>
            <span className="text-purple-500">S</span>
          </span>
          <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">INSTANT</span>
          <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
            <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Send Receipt</h3>
            <input
              type="email"
              placeholder="Your email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailAddress('');
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!emailAddress || !emailAddress.includes('@')) return;
                  setSendingEmail(true);
                  try {
                    await fetch('https://api.dltpays.com/nfc/api/v1/receipt/email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(
  receiptId
    ? await (async () => {
        const receiptRes = await fetch(`https://api.dltpays.com/nfc/api/v1/receipts/${receiptId}`);
        const receiptData = await receiptRes.json();
        if (receiptData.success && receiptData.receipt) {
          const r = receiptData.receipt;
          return {
            email: emailAddress,
            store_name: r.store_name || payment?.store_name,
            store_id: r.store_id || payment?.store_id,
            amount: r.total,
            rlusd_amount: r.amount_rlusd,
            items: r.items,
            tip_amount: r.tip_amount,
            tx_hash: r.payment_tx_hash || txHash,
            receipt_number: r.receipt_number,
            conversion_rate: r.conversion_rate,
            rate_source: r.conversion_rate?.source,
            rate_timestamp: r.conversion_rate?.captured_at
          };
        }
        return { email: emailAddress, store_name: payment?.store_name, store_id: payment?.store_id, amount: payment?.amount, tx_hash: txHash };
      })()
    : { email: emailAddress, store_name: payment?.store_name, store_id: payment?.store_id, amount: payment?.amount, tx_hash: txHash }
)
                    });
                    setShowEmailModal(false);
                    setEmailAddress('');
                  } catch (err) {
                    console.error('Failed to send email');
                  }
                  setSendingEmail(false);
                }}
                disabled={sendingEmail}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {sendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Split QR Modal */}
      {showSplitQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-4">Scan to Pay</h3>
            <div className="bg-white rounded-2xl p-4 mb-4 inline-block">
              <QRCodeSVG 
                value={`https://yesallofus.com/pay/${showSplitQR}`}
                size={200}
                level="M"
              />
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              {splits?.find(s => s.payment_id === showSplitQR)?.amount && 
                `£${splits.find(s => s.payment_id === showSplitQR)!.amount.toFixed(2)}`
              }
            </p>
            <button
              onClick={() => setShowSplitQR(null)}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Split Email Modal */}
      {showSplitEmailModal && splitEmailTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Send Payment Link</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Person {splitEmailTarget.split_index} · £{splitEmailTarget.amount.toFixed(2)}
            </p>
            <input
              type="email"
              placeholder="friend@email.com"
              value={splitEmailAddress}
              onChange={(e) => setSplitEmailAddress(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSplitEmailModal(false);
                  setSplitEmailAddress('');
                  setSplitEmailTarget(null);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!splitEmailAddress || !splitEmailAddress.includes('@')) return;
                  setSendingSplitEmail(true);
                  try {
                    await fetch(`${API_URL}/payment-link/send-email`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: splitEmailAddress,
                        payment_url: `https://yesallofus.com/pay/${splitEmailTarget.payment_id}`,
                        store_name: payment?.store_name,
                        amount: splitEmailTarget.amount
                      })
                    });
                    setShowSplitEmailModal(false);
                    setSplitEmailAddress('');
                    setSplitEmailTarget(null);
                  } catch (err) {
                    console.error('Failed to send email');
                  }
                  setSendingSplitEmail(false);
                }}
                disabled={sendingSplitEmail}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {sendingSplitEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}