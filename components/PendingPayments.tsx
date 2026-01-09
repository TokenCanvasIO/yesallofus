'use client';

import { useState, useEffect } from 'react';

interface PaymentItem {
  name: string;
  quantity: number;
  price?: number;
  unit_price?: number;
  line_total?: number;
}

interface PendingPayment {
  payment_id: string;
  amount: number;
  status: string;
  created_at: string;
  expires_at: string;
  items?: PaymentItem[];
  tip?: number;
  currency?: string;
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch pending payments
  const fetchPendingPayments = async () => {
    setRefreshing(true);
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
      setRefreshing(false);
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
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 30) return 'Active';
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    if (minutes < 1) return 'Less than 1 min';
    return `${minutes} min left`;
  };

  const getShortRef = (paymentId: string) => {
    // Extract last 6 chars for display: pay_abc123xyz → xyz
    return paymentId.slice(-6).toUpperCase();
  };

  const copyPaymentLink = async (paymentId: string) => {
    const url = `https://yesallofus.com/pay/${paymentId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(paymentId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sharePaymentLink = async (payment: PendingPayment) => {
    const url = `https://yesallofus.com/pay/${payment.payment_id}`;
    const text = `Payment request for £${payment.amount.toFixed(2)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Payment Link', text, url });
      } catch (err) {
        // User cancelled or not supported
        await copyPaymentLink(payment.payment_id);
      }
    } else {
      await copyPaymentLink(payment.payment_id);
    }
  };

  const getItemPrice = (item: PaymentItem) => {
    return item.price || item.unit_price || 0;
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
                        className="bg-zinc-800 rounded-xl overflow-hidden"
                      >
                        {/* Main row */}
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-750 transition"
                          onClick={() => setExpandedId(expandedId === payment.payment_id ? null : payment.payment_id)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Expand arrow */}
                            <svg 
                              className={`w-4 h-4 text-zinc-500 transition-transform ${expandedId === payment.payment_id ? 'rotate-90' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-white">£{payment.amount.toFixed(2)}</p>
                                <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded font-mono">
                                  #{getShortRef(payment.payment_id)}
                                </span>
                              </div>
                              <p className="text-zinc-500 text-xs">
                                {formatTime(payment.created_at)} · {getTimeRemaining(payment.expires_at)}
                                {payment.items && payment.items.length > 0 && (
                                  <span> · {payment.items.length} item{payment.items.length !== 1 ? 's' : ''}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>

                        {/* Expanded details */}
                        {expandedId === payment.payment_id && (
                          <div className="px-4 pb-4 border-t border-zinc-700">
                            {/* Items list */}
                            {payment.items && payment.items.length > 0 ? (
                              <div className="mt-3 space-y-2">
                                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Order Items</p>
                                {payment.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-zinc-300">
                                      {item.quantity}× {item.name}
                                    </span>
                                    <span className="text-zinc-400">
                                      £{(getItemPrice(item) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                                {payment.tip && payment.tip > 0 && (
                                  <div className="flex justify-between text-sm pt-1 border-t border-zinc-700">
                                    <span className="text-zinc-300">Tip</span>
                                    <span className="text-emerald-400">£{payment.tip.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-3">
                                <p className="text-zinc-500 text-sm">No items recorded</p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPaymentLink(payment.payment_id);
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                                  copiedId === payment.payment_id
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                                }`}
                              >
                                {copiedId === payment.payment_id ? (
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
                                    Copy Link
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sharePaymentLink(payment);
                                }}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancellingId(payment.payment_id);
                                }}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
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
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl overflow-hidden"
                      >
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedId(expandedId === payment.payment_id ? null : payment.payment_id)}
                        >
                          <div className="flex items-center gap-3">
                            <svg 
                              className={`w-4 h-4 text-emerald-500 transition-transform ${expandedId === payment.payment_id ? 'rotate-90' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-emerald-400">£{payment.amount.toFixed(2)}</p>
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                                  #{getShortRef(payment.payment_id)}
                                </span>
                              </div>
                              <p className="text-zinc-500 text-xs">
                                Paid at {formatTime(payment.created_at)}
                                {payment.items && payment.items.length > 0 && (
                                  <span> · {payment.items.length} item{payment.items.length !== 1 ? 's' : ''}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Expanded details for completed */}
                        {expandedId === payment.payment_id && payment.items && payment.items.length > 0 && (
                          <div className="px-4 pb-4 border-t border-emerald-500/20">
                            <div className="mt-3 space-y-2">
                              <p className="text-emerald-500/70 text-xs font-medium uppercase tracking-wider">Order Items</p>
                              {payment.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-zinc-300">
                                    {item.quantity}× {item.name}
                                  </span>
                                  <span className="text-zinc-400">
                                    £{(getItemPrice(item) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              {payment.tip && payment.tip > 0 && (
                                <div className="flex justify-between text-sm pt-1 border-t border-emerald-500/20">
                                  <span className="text-zinc-300">Tip</span>
                                  <span className="text-emerald-400">£{payment.tip.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
            disabled={refreshing}
            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-xs text-center">
            <p className="text-white font-medium mb-4">Cancel this payment link?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-3 rounded-xl font-medium transition"
              >
                Keep
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${API_URL}/payment-link/${cancellingId}/cancel`, {
                      method: 'POST'
                    });
                    fetchPendingPayments();
                  } catch (err) {
                    console.error('Failed to cancel:', err);
                  }
                  setCancellingId(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}