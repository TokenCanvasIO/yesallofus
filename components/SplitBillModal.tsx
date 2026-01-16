'use client';

import { useState } from 'react';

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

  const eachPays = amount / splitCount;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Split Bill</h2>
        </div>
        
        <p className="text-zinc-400 mb-4">How many people?</p>
        
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
            className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-5xl font-bold w-20 text-center">{splitCount}</span>
          <button
            onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
            className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-zinc-400 mb-2">
            <span>Total</span>
            <span>£{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Each pays</span>
            <span className="text-emerald-400">£{eachPays.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={splitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black py-4 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {splitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Splitting...
              </>
            ) : (
              'Split'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
