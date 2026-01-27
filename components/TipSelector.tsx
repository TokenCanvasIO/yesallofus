'use client';

import { useState } from 'react';

interface TipSelectorProps {
  amount: number;
  onTipChange: (tip: number) => void;
}

export default function TipSelector({ amount, onTipChange }: TipSelectorProps) {
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');

  const tipOptions = [
    { label: 'No tip', percent: 0 },
    { label: '10%', percent: 10 },
    { label: '15%', percent: 15 },
    { label: '20%', percent: 20 },
  ];

  const handleTipSelect = (percent: number) => {
    setSelectedPercent(percent);
    setCustomTip('');
    const tipAmount = (amount * percent) / 100;
    onTipChange(tipAmount);
  };

  const handleCustomTip = (value: string) => {
    setCustomTip(value);
    setSelectedPercent(null);
    const tipAmount = parseFloat(value) || 0;
    onTipChange(tipAmount);
  };

  const currentTip = selectedPercent !== null 
    ? (amount * selectedPercent) / 100 
    : parseFloat(customTip) || 0;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="text-sm text-zinc-400">Add a tip?</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {tipOptions.map((option) => (
          <button
            key={option.percent}
            onClick={() => handleTipSelect(option.percent)}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition ${
              selectedPercent === option.percent
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">£</span>
        <input
  type="number"
  placeholder="Custom amount"
  value={customTip}
  onChange={(e) => {
    setCustomTip(e.target.value);
    setSelectedPercent(null);
  }}
  onBlur={(e) => {
    const tipAmount = parseFloat(e.target.value) || 0;
    onTipChange(tipAmount);
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      const tipAmount = parseFloat(customTip) || 0;
      onTipChange(tipAmount);
      (e.target as HTMLInputElement).blur();
    }
  }}
  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm transition"
  min="0"
  step="0.01"
/>
      </div>

      {currentTip > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Tip amount</span>
          <span className="text-emerald-400 font-bold">£{currentTip.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
