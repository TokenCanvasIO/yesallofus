'use client';

import { useState, useEffect } from 'react';
import EmailReceiptModal from './EmailReceiptModal';

interface ReceiptActionsProps {
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
  storeLogo?: string;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function ReceiptActions({
  receiptId,
  txHash,
  storeName,
  storeId,
  amount,
  rlusdAmount,
  items,
  tipAmount,
  conversionRate,
  storeLogo,
}: ReceiptActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch receipt data when print preview is opened
  const openPrintPreview = async () => {
    setLoading(true);
    
    if (receiptId) {
      try {
        const res = await fetch(`${API_URL}/receipts/${receiptId}`);
        const data = await res.json();
        if (data.success && data.receipt) {
          setReceiptData(data.receipt);
          setLoading(false);
          setShowPrintPreview(true);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch receipt:', e);
      }
    }
    
    setLoading(false);
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const tip = receiptData?.tip_amount || tipAmount || 0;
  const finalItems = receiptData?.items || items || [{ name: 'Payment', quantity: 1, unit_price: amount }];
  const finalAmount = receiptData?.total || (amount + (tipAmount || 0));
  const finalRlusd = receiptData?.amount_rlusd || rlusdAmount;
  const finalRate = receiptData?.conversion_rate || conversionRate;
  const finalTxHash = receiptData?.tx_hash || txHash;

  return (
    <>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setShowEmailModal(true)}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Receipt
        </button>
        <button 
          onClick={openPrintPreview}
          disabled={loading}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          )}
          Print
        </button>
      </div>

      <EmailReceiptModal
  isOpen={showEmailModal}
  onClose={() => setShowEmailModal(false)}
  receiptId={receiptId}
  txHash={txHash}
  storeName={storeName}
  storeId={storeId}
  amount={amount}
  rlusdAmount={rlusdAmount}
  items={items}
  tipAmount={tipAmount}
  conversionRate={conversionRate}
/>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          {/* Print Actions - Hidden when printing */}
          <div className="no-print sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <h2 className="font-bold text-white">Print Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2 rounded-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowPrintPreview(false);
                    setReceiptData(null);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl transition text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Print Content */}
          <div className="max-w-md mx-auto bg-white text-black p-8 my-8 rounded-xl">
            {/* Header with dark banner */}
            <div className="text-center mb-6 pb-6 border-b-2 border-gray-200 bg-zinc-900 -mx-8 -mt-8 px-8 pt-8 pb-6 rounded-t-xl">
              {storeLogo ? (
                <img 
                  src={storeLogo} 
                  alt={storeName} 
                  className="w-16 h-16 rounded-xl object-cover mx-auto mb-3"
                />
              ) : (
                <img 
                  src="https://yesallofus.com/dltpayslogo1.png" 
                  alt="YesAllOfUs" 
                  className="w-16 h-16 rounded-xl object-cover mx-auto mb-3"
                />
              )}
              <h1 className="text-2xl font-bold mb-1 text-white">{storeName}</h1>
              {receiptData?.receipt_number && (
                <p className="text-sm text-zinc-400">Receipt #{receiptData.receipt_number}</p>
              )}
            </div>

            {/* Date */}
            <p className="text-sm text-gray-600 mb-6">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            {/* Items */}
            <div className="mb-6">
              {finalItems.filter((item: any) => item.name.toLowerCase() !== 'tip').map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity || 1} × £{(item.unit_price || item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    £{(item.line_total || (item.unit_price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Tip */}
              {tip > 0 && (
                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <div>
                      <p className="font-medium text-emerald-600">Tip</p>
                      <p className="text-sm text-gray-600">Thank you!</p>
                    </div>
                  </div>
                  <p className="font-semibold text-emerald-600">
                    £{tip.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t-2 border-black mb-6">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold text-emerald-600">
                £{finalAmount.toFixed(2)}
              </span>
            </div>

            {/* Settlement Details */}
            {finalRlusd && finalRate && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                <p className="text-xs font-semibold text-emerald-800 mb-2">💱 SETTLEMENT DETAILS</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Quoted:</span>
                    <span>£{finalAmount.toFixed(2)} GBP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Settled:</span>
                    <span className="font-semibold">{finalRlusd.toFixed(6)} RLUSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span>£1 = {(1 / finalRate.rlusd_gbp)?.toFixed(6) || 'N/A'} RLUSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate Source:</span>
                    <span>{finalRate.source || 'CoinGecko Pro API'}</span>
                  </div>
                  {finalRate.captured_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate Timestamp:</span>
                      <span className="text-xs text-gray-500">{new Date(finalRate.captured_at).toISOString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Hash */}
            {finalTxHash && (
              <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">XRPL TRANSACTION</p>
                <p className="text-xs font-mono break-all text-gray-700">{finalTxHash}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center gap-1">
                <span className="text-zinc-400 text-[9px] font-medium tracking-widest">RECEIPT</span>
                <span className="text-base font-extrabold tracking-widest">
                  <span className="text-emerald-500">Y</span>
                  <span className="text-green-500">A</span>
                  <span className="text-blue-500">O</span>
                  <span className="text-indigo-500">F</span>
                  <span className="text-violet-500">U</span>
                  <span className="text-purple-500">S</span>
                </span>
                <span className="text-zinc-500 text-[10px] font-semibold tracking-widest">INSTANT</span>
                <div className="flex items-center gap-2 mt-2">
                  <img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" className="w-4 h-4 rounded opacity-60" />
                  <span className="text-gray-400 text-xs">Powered by YesAllOfUs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .fixed {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}