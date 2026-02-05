'use client';
import { useState } from 'react';

export default function NFCPayment() {
  const [status, setStatus] = useState('idle');
  const [lastUID, setLastUID] = useState(null);
  const [error, setError] = useState(null);

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      // Fallback: try Web NFC or show manual option
      setError('Web NFC not supported. Use Chrome on Android, or tap to test manually.');
      return;
    }

    setStatus('scanning');
    setError(null);

    try {
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', async ({ serialNumber }) => {
        console.log('NFC UID:', serialNumber);
        setLastUID(serialNumber);
        setStatus('processing');

        // Validate NFC UID format before using in URL
        if (!/^[0-9A-Fa-f:]+$/.test(serialNumber)) {
          setError('Invalid NFC UID format');
          setStatus('idle');
          return;
        }
        // Call your API
        window.location.href = `https://api.dltpays.com/api/v1/nfc/tap/${encodeURIComponent(serialNumber)}`;
      });

      ndef.addEventListener('readingerror', () => {
        setError('Could not read NFC tag');
        setStatus('idle');
      });

    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  // Manual test for iPhone (Web NFC not supported on iOS Safari)
  const manualTest = () => {
    const uid = prompt('Enter NFC UID (or use test123):', '04:5B:07:0A:FD:75:80');
    if (uid) {
      // Validate NFC UID format before using in URL
      if (!/^[0-9A-Fa-f:]+$/.test(uid)) {
        setError('Invalid NFC UID format. Only hex characters and colons allowed.');
        return;
      }
      window.location.href = `https://api.dltpays.com/api/v1/nfc/tap/${encodeURIComponent(uid)}`;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">💳 Tap to Pay</h2>
      
      {status === 'idle' && (
        <>
          <p className="text-zinc-400 text-sm mb-4">
            Customer taps their card on your device to pay.
          </p>
          <button
            onClick={startNFCScan}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 rounded-xl transition text-lg mb-3"
          >
            📱 Start NFC Scan
          </button>
          <button
            onClick={manualTest}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition text-sm"
          >
            Manual Test (for demo)
          </button>
        </>
      )}

      {status === 'scanning' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-pulse">📱</div>
          <p className="text-emerald-400 font-semibold text-lg">Ready to scan...</p>
          <p className="text-zinc-500 text-sm mt-2">Hold card to back of phone</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-zinc-500 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-yellow-400 font-semibold">Processing payment...</p>
          <p className="text-zinc-500 text-sm mt-2">UID: {lastUID}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}