'use client';

import { useState, useEffect } from 'react';
import ReceiptActions from '@/components/ReceiptActions';

interface PaymentSuccessProps {
  storeName: string;
  storeId?: string;
  storeLogo?: string | null;
  amount: number;
  tip?: number;
  txHash?: string | null;
  receiptId?: string | null;
  rlusdAmount?: number | null;
  items?: any[];
  // ADD: conversionRate prop
  conversionRate?: {
    rlusd_gbp: number;
    source: string;
    captured_at: string;
  } | null;
  // For split bills
  splitAmount?: number | null;
  splitTip?: number | null;
  isSplit?: boolean;
  // For receipt authorization
  walletAddress?: string | null;
}

export default function PaymentSuccess({
  storeName,
  storeId,
  storeLogo,
  amount,
  tip = 0,
  txHash,
  receiptId,
  rlusdAmount,
  items = [],
  conversionRate,  // ADD: destructure conversionRate
  splitAmount,
  splitTip,
  isSplit = false,
  walletAddress
}: PaymentSuccessProps) {
  
  const [showSuccessVideo, setShowSuccessVideo] = useState(true);
  
  const displayAmount = isSplit && splitAmount ? splitAmount : amount;
  const displayTip = (isSplit && splitTip !== undefined ? splitTip : tip) || 0;

  // Hide success video after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccessVideo(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center">
        {/* Store Logo with Success Video Overlay */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {storeLogo ? (
            <img 
              src={storeLogo} 
              alt={storeName} 
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <img 
              src="https://yesallofus.com/dltpayslogo1.png" 
              alt="YesAllOfUs" 
              className="w-20 h-20 rounded-2xl"
            />
          )}
          {showSuccessVideo && (
            <video
              autoPlay
              muted
              playsInline
              onEnded={() => setShowSuccessVideo(false)}
              className="absolute inset-0 w-20 h-20 rounded-2xl object-cover"
            >
              <source src="/successmessage.webm" type="video/webm" />
            </video>
          )}
        </div>

        {/* Success Checkmark */}
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Text */}
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Payment Complete!</h1>
        <p className="text-xl text-zinc-400 mb-2">Thank you for shopping at</p>
        <p className="text-2xl font-bold mb-4">{storeName}</p>

        {/* Payment Summary */}
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-6">
          {isSplit ? (
            <>
              <div className="text-zinc-400 text-sm mb-2">Your payment:</div>
              <div className="text-2xl font-bold text-emerald-400">£{displayAmount.toFixed(2)}</div>
              {displayTip > 0 && (
                <div className="text-zinc-500 text-sm mt-1">
                  (£{(displayAmount - displayTip).toFixed(2)} + £{displayTip.toFixed(2)} tip)
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-zinc-400 text-sm mb-2">Amount paid:</div>
              <div className="text-2xl font-bold text-emerald-400">£{displayAmount.toFixed(2)}</div>
              {displayTip > 0 && (
                <div className="text-zinc-500 text-sm mt-1">Includes £{displayTip.toFixed(2)} tip</div>
              )}
            </>
          )}
        </div>

        {/* XRPL Link */}
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

        {/* Receipt Actions - Pass split-adjusted amount for split payments */}
        <ReceiptActions
          receiptId={receiptId || undefined}
          txHash={txHash || undefined}
          storeName={storeName}
          storeId={storeId}
          amount={displayAmount}
          rlusdAmount={rlusdAmount || undefined}
          items={items}
          tipAmount={displayTip}
          conversionRate={conversionRate || undefined}
          storeLogo={storeLogo || undefined}
          walletAddress={walletAddress || undefined}
          isSplit={isSplit}
        />

        {/* Footer Branding */}
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
    </div>
  );
}