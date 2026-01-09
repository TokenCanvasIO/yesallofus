'use client';

import { useState, useEffect } from 'react';

interface PendingPayment {
  payment_id: string;
  amount: number;
  status: string;
  created_at: string;
  expires_at: string;
}

interface PendingPaymentsProps {
  storeId: string;
  onClose: () => void;
  onPaymentComplete?: (paymentId: string) => void;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function PendingPayments({ storeId, onClose, onPaymentComplete }: PendingPaymentsProps) {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending payments
  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/store/${storeId}/pending-payments`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchPendingPayments, 3000);
    return () => clearInterval(interval);
  }, [storeId]);

  // Check for completed payments
  useEffect(() => {
    const completed = payments.find(p => p.status === 'paid' || p.status === 'complete');
    if (completed && onPaymentComplete) {
      onPaymentComplete(completed.payment_id);
    }
  }, [payments, onPaymentComplete]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Less than 1 min';
    return `${minutes} min left`;
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'paid' || p.status === 'complete');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Payment Links</h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : pendingPayments.length === 0 && completedPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-zinc-400">No payment links</p>
              <p className="text-zinc-600 text-sm mt-1">Create a payment link to see it here</p>
            </div>
          ) : (
            <>
              {/* Pending */}
              {pendingPayments.length > 0 && (
                <div className="mb-6">
                  <p className="text-zinc-500 text-xs font-medium mb-2 uppercase tracking-wider">
                    Waiting for Payment ({pendingPayments.length})
                  </p>
                  <div className="space-y-2">
                    {pendingPayments.map((payment) => (
                      <div 
                        key={payment.payment_id}
                        className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xl font-bold text-white">£{payment.amount.toFixed(2)}</p>
                          <p className="text-zinc-500 text-xs">
                            Created {formatTime(payment.created_at)} · {getTimeRemaining(payment.expires_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="text-amber-500 text-sm font-medium">Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed (last 5) */}
              {completedPayments.length > 0 && (
                <div>
                  <p className="text-zinc-500 text-xs font-medium mb-2 uppercase tracking-wider">
                    Recently Completed
                  </p>
                  <div className="space-y-2">
                    {completedPayments.slice(0, 5).map((payment) => (
                      <div 
                        key={payment.payment_id}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xl font-bold text-emerald-400">£{payment.amount.toFixed(2)}</p>
                          <p className="text-zinc-500 text-xs">
                            Paid at {formatTime(payment.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400 text-sm font-medium">Paid</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={fetchPendingPayments}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
