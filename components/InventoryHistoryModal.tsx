'use client';

import { useState, useEffect } from 'react';

interface InventoryHistoryEntry {
  history_id: string;
  product_id: string;
  product_name?: string;
  previous_quantity: number;
  new_quantity: number;
  adjustment: number;
  reason: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

interface InventoryHistoryModalProps {
  storeId: string;
  walletAddress: string;
  productId?: string; // If provided, filter to this product only
  productName?: string;
  onClose: () => void;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

const reasonLabels: Record<string, { label: string; color: string; icon: string }> = {
  sale: { label: 'Sale', color: 'text-blue-400 bg-blue-500/20', icon: '🛒' },
  restock: { label: 'Restock', color: 'text-emerald-400 bg-emerald-500/20', icon: '📦' },
  adjustment: { label: 'Adjustment', color: 'text-amber-400 bg-amber-500/20', icon: '✏️' },
  return: { label: 'Return', color: 'text-purple-400 bg-purple-500/20', icon: '↩️' },
  damage: { label: 'Damage', color: 'text-red-400 bg-red-500/20', icon: '💔' },
  expired: { label: 'Expired', color: 'text-orange-400 bg-orange-500/20', icon: '⏰' },
  transfer: { label: 'Transfer', color: 'text-cyan-400 bg-cyan-500/20', icon: '🔄' },
  initial: { label: 'Initial Stock', color: 'text-zinc-400 bg-zinc-500/20', icon: '🆕' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function InventoryHistoryModal({
  storeId,
  walletAddress,
  productId,
  productName,
  onClose,
}: InventoryHistoryModalProps) {
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const url = productId
          ? `${API_URL}/store/${storeId}/inventory/history?wallet_address=${walletAddress}&product_id=${productId}&limit=50`
          : `${API_URL}/store/${storeId}/inventory/history?wallet_address=${walletAddress}&limit=100`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setHistory(data.history || []);
        } else {
          setError(data.error || 'Failed to load history');
        }
      } catch (err) {
        setError('Failed to connect to server');
      }
      setLoading(false);
    };

    fetchHistory();
  }, [storeId, walletAddress, productId]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Inventory History</h2>
            {productName && (
              <p className="text-zinc-500 text-sm">{productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-zinc-500">No inventory history yet</p>
              <p className="text-zinc-600 text-sm mt-1">Stock changes will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => {
                const reasonInfo = reasonLabels[entry.reason] || {
                  label: entry.reason,
                  color: 'text-zinc-400 bg-zinc-500/20',
                  icon: '📋',
                };
                const isPositive = entry.adjustment > 0;

                return (
                  <div
                    key={entry.history_id}
                    className="bg-zinc-800/50 hover:bg-zinc-800 rounded-xl p-3 transition"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${reasonInfo.color}`}>
                        <span className="text-lg">{reasonInfo.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {!productId && entry.product_name && (
                              <span className="font-medium truncate">{entry.product_name}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${reasonInfo.color}`}>
                              {reasonInfo.label}
                            </span>
                          </div>
                          <span className="text-zinc-500 text-xs flex-shrink-0">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-500 text-sm">
                            {entry.previous_quantity}
                          </span>
                          <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-white font-medium">
                            {entry.new_quantity}
                          </span>
                          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({isPositive ? '+' : ''}{entry.adjustment})
                          </span>
                        </div>

                        {entry.notes && (
                          <p className="text-zinc-500 text-xs mt-1 truncate">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
