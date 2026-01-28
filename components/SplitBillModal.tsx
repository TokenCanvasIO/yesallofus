'use client';

import { useState } from 'react';
import NebulaBackground from '@/components/NebulaBackground';

interface SplitBillModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSplit: (numSplits: number) => Promise<void>;
}

export default function SplitBillModal({ amount, isOpen, onClose, onSplit }: SplitBillModalProps) {
  const [splitCount, setSplitCount] = useState(2);
  const [splitting, setSplitting] = useState(false);

  if (!isOpen) return null;

  const handleSplit = async () => {
    setSplitting(true);
    try {
      await onSplit(splitCount);
    } finally {
      setSplitting(false);
    }
  };

  // Calculate split amounts with proper rounding - first person absorbs remainder
  const baseAmount = Math.floor((amount * 100) / splitCount) / 100;
  const remainder = Math.round((amount - baseAmount * splitCount) * 100) / 100;
  const firstPersonPays = Math.round((baseAmount + remainder) * 100) / 100;
  const hasRemainder = remainder >= 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <NebulaBackground opacity={0.5} />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-black/50">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Split the Bill</h2>
          <p className="text-zinc-500 text-sm mt-1">Divide payment between friends</p>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
            className="w-16 h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition flex items-center justify-center group"
          >
            <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-6xl font-bold text-white">{splitCount}</span>
            <p className="text-zinc-500 text-sm mt-1">people</p>
          </div>

          <button
            onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
            className="w-16 h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition flex items-center justify-center group"
          >
            <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-center text-zinc-400 mb-3">
            <span>Total bill</span>
            <span className="font-medium">£{amount.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent mb-3" />
          {hasRemainder ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">1st person pays</span>
                <span className="text-xl font-bold text-emerald-400">£{firstPersonPays.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">{splitCount - 1} others pay</span>
                <span className="text-lg font-semibold text-emerald-400/80">£{baseAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Each person pays</span>
              <span className="text-2xl font-bold text-emerald-400">£{baseAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-4 rounded-xl font-medium transition text-zinc-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={splitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black py-4 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            {splitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Split Bill
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
