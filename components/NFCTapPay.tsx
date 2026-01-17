// components/NFCTapPay.tsx
'use client';

import { useState, useEffect } from 'react';

const PLUGINS_API_URL = 'https://api.dltpays.com/plugins/api/v1';
const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface NFCTapPayProps {
  amount: number;
  storeId: string;
  paymentId: string;
  onSuccess: (txHash: string, receiptId?: string) => void;
  onError: (error: string) => void;
  onNotRegistered: () => void; // Redirect to signup
  isCheckoutSession?: boolean;
  tipAmount?: number;
}

export default function NFCTapPay({
  amount,
  storeId,
  paymentId,
  onSuccess,
  onError,
  onNotRegistered,
  isCheckoutSession = false,
  tipAmount = 0
}: NFCTapPayProps) {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcController, setNfcController] = useState<AbortController | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setNfcSupported('NDEFReader' in window);
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);

  const getPayEndpoint = () => {
    if (isCheckoutSession) {
      return `${PLUGINS_API_URL}/checkout/session/${storeId}/pay`;
    }
    return `${NFC_API_URL}/payment-link/${paymentId}/pay`;
  };

  const stopNFCScan = () => {
    if (nfcController) {
      nfcController.abort();
      setNfcController(null);
    }
    setNfcScanning(false);
  };

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
          const res = await fetch(getPayEndpoint(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_uid: uid, tip_amount: tipAmount, split_payment_id: paymentId })
          });

          const result = await res.json();

          if (result.success) {
            onSuccess(result.tx_hash, result.receipt_id);
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          } else {
            // Check for not registered errors
            if (result.error?.includes('not found') || 
                result.error?.includes('not linked') ||
                result.error?.includes('not registered') ||
                result.error?.includes('Card not recognized')) {
              onNotRegistered();
            } else {
              onError(result.error || 'Payment failed');
            }
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

  // Don't render if not Android or NFC not supported
  if (!isAndroid || !nfcSupported) {
    return null;
  }

  if (processing) {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-emerald-400">Processing...</span>
      </div>
    );
  }

  return (
    <button
      onClick={startNFCScan}
      disabled={nfcScanning}
      className={`flex-1 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
        nfcScanning 
          ? 'bg-emerald-600 text-white animate-pulse' 
          : 'bg-emerald-500 hover:bg-emerald-400 text-white'
      }`}
    >
      {nfcScanning ? 'Tap Card Now...' : 'Pay Now'}
    </button>
  );
}