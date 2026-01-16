'use client';

import { useState, useEffect } from 'react';
import InstantPay from './InstantPay';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PaymentOptionsProps {
  amount: number;
  rlusdAmount: number;
  vendorWallet: string;
  storeName: string;
  storeId: string;
  paymentId: string;
  status: 'pending' | 'paid' | 'expired' | 'processing';
  onSuccess: (txHash: string, receiptId?: string) => void;
  onError: (error: string) => void;
  showSplitBill?: boolean;
  onSplitBill?: () => void;
}

export default function PaymentOptions({
  amount,
  rlusdAmount,
  vendorWallet,
  storeName,
  storeId,
  paymentId,
  status,
  onSuccess,
  onError,
  showSplitBill = false,
  onSplitBill
}: PaymentOptionsProps) {
  // NFC state
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcController, setNfcController] = useState<AbortController | null>(null);
  const [processing, setProcessing] = useState(false);

  // Xaman state
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanPaymentId, setXamanPaymentId] = useState<string | null>(null);

  // Check NFC support on mount
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  // Poll for Xaman payment status
  useEffect(() => {
    if (!xamanPaymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.dltpays.com/api/v1/xaman/payment/poll/${xamanPaymentId}`);
        const data = await res.json();

        if (data.status === 'signed') {
          clearInterval(pollInterval);
          setXamanQR(null);
          setXamanPaymentId(null);
          
          // Mark payment as paid in our system
          const payRes = await fetch(`${API_URL}/payment-link/${paymentId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payer_wallet: 'xaman_payment', tx_hash: data.tx_hash })
          });
          const payData = await payRes.json();
          
          onSuccess(data.tx_hash, payData.receipt_id);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [xamanPaymentId, paymentId, onSuccess]);

  // Generate Xaman QR
  const generateXamanQR = async () => {
    try {
      const res = await fetch('https://api.dltpays.com/api/v1/xaman/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: rlusdAmount,
          vendor_wallet: vendorWallet,
          store_id: storeId,
          store_name: storeName
        })
      });

      const data = await res.json();
      if (data.success) {
        setXamanQR(data.qr_png);
        setXamanPaymentId(data.payment_id);
      } else {
        onError(data.error || 'Failed to create payment');
      }
    } catch (err) {
      onError('Failed to create payment request');
    }
  };

  // Stop NFC scan
  const stopNFCScan = () => {
    if (nfcController) {
      nfcController.abort();
      setNfcController(null);
    }
    setNfcScanning(false);
  };

  // Start NFC scan
  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      onError('NFC not supported on this device');
      return;
    }

    stopNFCScan();

    const controller = new AbortController();
    setNfcController(controller);
    setNfcScanning(true);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });

      ndef.addEventListener('reading', async (event: any) => {
        controller.abort();
        
        const uid = event.serialNumber?.replace(/:/g, '').toUpperCase();
        if (!uid) {
          onError('Could not read card');
          setNfcScanning(false);
          setNfcController(null);
          return;
        }

        setNfcScanning(false);
        setNfcController(null);
        setProcessing(true);

        try {
          const res = await fetch(`${API_URL}/payment-link/${paymentId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_uid: uid })
          });

          const result = await res.json();

          if (result.success) {
            onSuccess(result.tx_hash, result.receipt_id);
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          } else {
            onError(result.error || 'Payment failed');
          }
        } catch (err) {
          onError('Payment failed');
        } finally {
          setProcessing(false);
        }
      });

      ndef.addEventListener('readingerror', () => {
        onError('Error reading card');
        stopNFCScan();
      });

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        onError('NFC permission denied');
      } else if (err.name !== 'AbortError') {
        onError('Failed to start NFC');
      }
      stopNFCScan();
    }
  };

  // Already paid message
  if (status !== 'pending') {
    return (
      <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Payment Already Complete</h3>
        <p className="text-zinc-400">This payment has already been processed.</p>
      </div>
    );
  }

  // Processing overlay
  if (processing) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-white">Processing payment...</p>
      </div>
    );
  }

  // Xaman QR View
  if (xamanQR) {
    return (
      <div className="text-center">
        <div className="bg-white rounded-3xl p-6 mb-6 inline-block">
          <img
            src={xamanQR}
            alt="Scan with Xaman"
            className="w-56 h-56"
          />
        </div>
        <p className="text-xl font-semibold text-sky-400 mb-2">Scan with Xaman</p>
        <p className="text-zinc-500 mb-6">Open Xaman wallet and scan the QR code</p>
        
        <button
          onClick={() => {
            setXamanQR(null);
            setXamanPaymentId(null);
          }}
          className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl font-medium transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Main payment options view
  return (
    <div className="space-y-4">
      {/* InstantPay (Web3Auth/Biometrics) */}
      <InstantPay
        amount={amount}
        rlusdAmount={rlusdAmount}
        vendorWallet={vendorWallet}
        storeName={storeName}
        storeId={storeId}
        paymentId={paymentId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* NFC Tap to Pay */}
      {nfcSupported && (
        <button
          onClick={startNFCScan}
          disabled={nfcScanning}
          className="w-full"
        >
          <div className={`bg-zinc-900 rounded-2xl p-6 border-2 transition ${
            nfcScanning ? 'border-emerald-500' : 'border-zinc-800 hover:border-zinc-700'
          }`}>
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                nfcScanning ? 'bg-emerald-500/20 animate-pulse' : 'bg-zinc-800'
              }`}>
                <svg className={`w-8 h-8 ${nfcScanning ? 'text-emerald-400' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-1">
                {nfcScanning ? 'Tap your card now...' : 'Tap to Pay'}
              </p>
              <p className="text-zinc-500 text-sm">Hold your NFC card to your phone</p>
            </div>
          </div>
        </button>
      )}

      <div className="text-center text-zinc-500 my-2">or</div>

      {/* Xaman button */}
      <button 
        onClick={generateXamanQR}
        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center gap-3 transition"
      >
        <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded-lg" />
        <span className="font-medium">Pay with Xaman</span>
      </button>

      {/* Split bill button */}
      {showSplitBill && onSplitBill && (
        <button
          onClick={onSplitBill}
          className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-4 font-medium transition"
        >
          Split Bill
        </button>
      )}
    </div>
  );
}
