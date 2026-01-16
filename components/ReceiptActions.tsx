'use client';

import { useState } from 'react';
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
  storeLogo
}: ReceiptActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const printReceipt = async () => {
    let receiptData: any = null;
    
    if (receiptId) {
      try {
        const res = await fetch(`${API_URL}/receipts/${receiptId}`);
        const data = await res.json();
        if (data.success && data.receipt) {
          receiptData = data.receipt;
        }
      } catch (e) {
        console.error('Failed to fetch receipt:', e);
      }
    }

    const tip = receiptData?.tip_amount || tipAmount || 0;
    const finalItems = receiptData?.items || items || [{ name: 'Payment', quantity: 1, unit_price: amount }];
    const finalAmount = receiptData?.total || amount;
    const finalRlusd = receiptData?.amount_rlusd || rlusdAmount;
    const finalRate = receiptData?.conversion_rate || conversionRate;

    const settlementHtml = (finalRlusd && finalRate) ? `
      <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 3px solid #10b981;">
        <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 8px;">💱 SETTLEMENT DETAILS</div>
        <div style="font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666;">RLUSD Amount:</span>
            <span style="font-weight: 600;">${finalRlusd.toFixed(4)} RLUSD</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666;">Rate:</span>
            <span>£1 = ${finalRate.rlusd_gbp?.toFixed(4) || '~'} RLUSD</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Source:</span>
            <span>${finalRate.source || 'CoinGecko'}</span>
          </div>
        </div>
      </div>
    ` : '';

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${storeName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px dashed #ddd; }
          .store-logo { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; margin-bottom: 12px; }
          .store-name { font-size: 24px; font-weight: 700; color: #111; }
          .receipt-label { font-size: 12px; color: #666; margin-top: 4px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .item-name { color: #333; }
          .item-price { color: #111; font-weight: 500; }
          .tip-row { display: flex; justify-content: space-between; padding: 8px 0; color: #10b981; }
          .total-section { margin-top: 12px; padding-top: 12px; border-top: 2px solid #1a1a1a; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 16px; font-weight: 600; }
          .total-amount { font-size: 24px; font-weight: 700; color: #10b981; }
          .tx-section { margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
          .tx-label { font-size: 10px; color: #666; margin-bottom: 4px; }
          .tx-hash { font-size: 9px; font-family: monospace; word-break: break-all; color: #333; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .footer-text { color: #999; font-size: 11px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${storeLogo 
            ? `<img src="${storeLogo}" alt="${storeName}" class="store-logo">`
            : `<img src="https://yesallofus.com/dltpayslogo1.png" alt="YesAllOfUs" class="store-logo">`
          }
          <div class="store-name">${storeLogo ? storeName : 'YesAllOfUs'}</div>
          ${!storeLogo ? `<div class="receipt-label">${storeName}</div>` : ''}
        </div>
        ${finalItems.length > 0 ? `
          <div class="items">
            ${finalItems.map((item: any) => `
              <div class="item">
                <span class="item-name">${item.quantity}x ${item.name}</span>
                <span class="item-price">£${(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            ${tip > 0 ? `
              <div class="tip-row">
                <span>Tip</span>
                <span>£${tip.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        <div class="total-section">
          <span class="total-label">Total Paid</span>
          <span class="total-amount">£${finalAmount.toFixed(2)}</span>
        </div>
        ${settlementHtml}
        ${txHash ? `
          <div class="tx-section">
            <div class="tx-label">XRPL TRANSACTION</div>
            <div class="tx-hash">${txHash}</div>
          </div>
        ` : ''}
        <div class="footer">
          <div class="footer-text">Powered by YesAllOfUs</div>
          <div class="footer-text">${new Date().toLocaleString()}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

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
          onClick={printReceipt}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
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
      />
    </>
  );
}
