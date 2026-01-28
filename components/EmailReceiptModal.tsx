'use client';

import { useState } from 'react';

interface EmailReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId?: string;
  txHash?: string;
  storeName: string;
  storeId?: string;
  amount: number;
  rlusdAmount?: number;
  items?: Array<{ name: string; quantity: number; unit_price: number }>;
  tipAmount?: number;
  conversionRate?: {
    rlusd_gbp: number;
    source: string;
    captured_at: string;
  };
  walletAddress?: string;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

// Email validation regex
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function EmailReceiptModal({
  isOpen,
  onClose,
  receiptId,
  txHash,
  storeName,
  storeId,
  amount,
  rlusdAmount,
  items,
  tipAmount,
  conversionRate,
  walletAddress
}: EmailReceiptModalProps) {
  const [emailAddress, setEmailAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!emailAddress || !isValidEmail(emailAddress)) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError(null);

    try {
      let payload: any = {
  email: emailAddress,
  store_name: storeName,
  store_id: storeId,
  amount,
  rlusd_amount: rlusdAmount,
  items: items || [],
  tip_amount: tipAmount || 0,
  tx_hash: txHash,
  conversion_rate: conversionRate
};

      if (receiptId) {
        const url = walletAddress
          ? `${API_URL}/receipts/${receiptId}?wallet_address=${walletAddress}`
          : `${API_URL}/receipts/${receiptId}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch receipt: ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.receipt) {
          const r = data.receipt;
          payload = {
            email: emailAddress,
            store_name: r.store_name || storeName,
            store_id: r.store_id || storeId,
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
      }

      const emailRes = await fetch(`${API_URL}/receipt/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!emailRes.ok) {
        throw new Error(`Failed to send email: ${emailRes.status}`);
      }

      setSent(true);
      setTimeout(() => {
        onClose();
        setEmailAddress('');
        setSent(false);
      }, 2000);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmailAddress('');
    setError(null);
    setSent(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-black/50">
        
        {sent ? (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Receipt Sent!</h2>
            <p className="text-zinc-400">Check your inbox at</p>
            <p className="text-emerald-400 font-medium mt-1">{emailAddress}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Email Receipt</h2>
              <p className="text-zinc-500 text-sm mt-1">Get a copy of your receipt</p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-zinc-400 text-sm mb-2">Email address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            {/* Receipt Preview */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Receipt for</span>
                <span className="text-white font-medium">{storeName}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-zinc-500">Amount</span>
                <span className="text-emerald-400 font-bold">£{amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 rounded-xl font-medium transition text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !emailAddress}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black py-4 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
