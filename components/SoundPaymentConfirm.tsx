'use client';

import { useState } from 'react';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PaymentDetails {
  payment_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  amount: number;
  currency: string;
  vendor_wallet: string;
}

interface SoundPaymentConfirmProps {
  payment: PaymentDetails;
  token: string;
  customerWallet: string;
  tipAmount?: number;
  onConfirm: (txHash: string, receiptId?: string) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

export default function SoundPaymentConfirm({
  payment,
  token,
  customerWallet,
  onConfirm,
  onCancel,
  tipAmount = 0,
  onError
}: SoundPaymentConfirmProps) {
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setProcessing(true);

      // First verify the token and mark as used
      const verifyRes = await fetch(`${API_URL}/sound-payment/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, customer_wallet: customerWallet })
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Token verification failed');
      }

      // Now process the actual payment using existing endpoint
      const payRes = await fetch(`${API_URL}/payment-link/${payment.payment_id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payer_wallet: customerWallet,
          tip_amount: tipAmount,
          payment_type: 'sound'
        })
      });

      const payData = await payRes.json();

      if (!payData.success) {
        throw new Error(payData.error || 'Payment failed');
      }

      onConfirm(payData.tx_hash, payData.receipt_id);

    } catch (error) {
      console.error('Payment error:', error);
      onError?.(String(error));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-3xl p-6 max-w-sm w-full">
        {/* Store Logo/Name */}
        <div className="text-center mb-6">
          {payment.store_logo ? (
            <img
              src={payment.store_logo}
              alt={payment.store_name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">{payment.store_name.charAt(0)}</span>
            </div>
          )}
          <h2 className="text-xl font-bold">{payment.store_name}</h2>
        </div>

        {/* Amount */}
        <div className="bg-zinc-800 rounded-2xl p-4 mb-6 text-center">
          <p className="text-zinc-400 text-sm mb-1">Amount to pay</p>
          <p className="text-4xl font-bold text-white">
            £{payment.amount.toFixed(2)}
          </p>
        </div>

        {/* Sound Payment Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-zinc-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
          </svg>
          <span className="text-sm">Received via Sound</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-4 font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl py-4 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Paying...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}