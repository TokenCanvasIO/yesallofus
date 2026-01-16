'use client';

import { useState } from 'react';

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
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const sendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) return;
    
    setSendingEmail(true);
    try {
      let payload: any = {
        email: emailAddress,
        store_name: storeName,
        store_id: storeId,
        amount,
        tx_hash: txHash
      };

      if (receiptId) {
        const res = await fetch(`${API_URL}/receipts/${receiptId}`);
        const data = await res.json();
        if (data.success && data.receipt) {
          const r = data.receipt;
          payload = {
            email: emailAddress,
            store_name: r.store_name || storeName,
            store_id: r.store_id || storeId,
            amount: r.total,
            rlusd_amount: r.amount_rlusd,
            items: r.items,
            tip_amount: r.tip_amount,
            tx_hash: r.payment_tx_hash || txHash,
            receipt_number: r.receipt_number,
            conversion_rate: r.conversion_rate,
            rate_source: r.conversion_rate?.source,
            rate_timestamp: r.conversion_rate?.captured_at
          };
        }
      }

      await fetch(`${API_URL}/receipt/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailAddress('');
        setEmailSent(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setSendingEmail(false);
    }
  };

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
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Receipt
        </button>
        <button 
          onClick={printReceipt}
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Send Receipt</h3>
            </div>

            {emailSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-400 font-medium">Receipt sent!</p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4 transition"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setEmailAddress('');
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={sendingEmail || !emailAddress.includes('@')}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
