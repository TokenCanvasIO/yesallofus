'use client';

import { useState, useEffect } from 'react';

interface LinkNFCCardProps {
  walletAddress: string;
  onCardLinked?: () => void;
}

export default function LinkNFCCard({ walletAddress, onCardLinked }: LinkNFCCardProps) {
  const [linkedCard, setLinkedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = 'https://api.dltpays.com/api/v1';

  // Check if wallet has a linked card
  useEffect(() => {
    checkLinkedCard();
  }, [walletAddress]);

  const checkLinkedCard = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/nfc/card-by-wallet/${walletAddress}`);
    if (!res.ok) {
      setLinkedCard(null);
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.success && data.card_uid) {
      setLinkedCard(data.card_uid);
    } else {
      setLinkedCard(null);
    }
  } catch (err) {
    console.error('Failed to check linked card:', err);
    setLinkedCard(null);
  }
  setLoading(false);
};

  const startNFCScan = async () => {
    setError(null);
    setSuccess(null);

    // Check if Web NFC is supported
    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device. Please use Chrome on Android.');
      return;
    }

    setScanning(true);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', async (event: any) => {
        const serialNumber = event.serialNumber;
        
        if (!serialNumber) {
          setError('Could not read card. Please try again.');
          setScanning(false);
          return;
        }

        // Format card UID (remove colons, uppercase)
        const cardUid = serialNumber.replace(/:/g, '').toUpperCase();
        
        // Link card to wallet
        await linkCard(cardUid);
        setScanning(false);
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading card. Please try again.');
        setScanning(false);
      });

    } catch (err: any) {
      console.error('NFC error:', err);
      if (err.name === 'NotAllowedError') {
        setError('NFC permission denied. Please allow NFC access.');
      } else if (err.name === 'NotSupportedError') {
        setError('NFC is not supported on this device.');
      } else {
        setError('Failed to start NFC scan. Make sure NFC is enabled.');
      }
      setScanning(false);
    }
  };

  const linkCard = async (cardUid: string) => {
    try {
      const res = await fetch(`${API_URL}/nfc/link-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          card_uid: cardUid
        })
      });

      const data = await res.json();

      if (data.success) {
        setLinkedCard(cardUid);
        setSuccess('Card linked successfully!');
        onCardLinked?.();
      } else {
        setError(data.error || 'Failed to link card');
      }
    } catch (err) {
      setError('Failed to link card. Please try again.');
    }
  };

  const unlinkCard = async () => {
    if (!confirm('Remove this card? You will need to tap it again to re-link.')) return;

    try {
      const res = await fetch(`${API_URL}/nfc/unlink-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress
        })
      });

      const data = await res.json();

      if (data.success) {
        setLinkedCard(null);
        setSuccess('Card removed successfully');
      } else {
        setError(data.error || 'Failed to remove card');
      }
    } catch (err) {
      setError('Failed to remove card. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400">Checking card status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">💳</div>
        <h3 className="text-lg font-bold">Payment Card</h3>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
          <p className="text-emerald-400 text-sm">{success}</p>
        </div>
      )}

      {/* Card Linked */}
      {linkedCard ? (
        <div>
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <div>
                <p className="text-emerald-400 font-medium">Card Linked</p>
                <p className="text-zinc-500 text-sm font-mono">
                  {linkedCard.slice(0, 4)}...{linkedCard.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={unlinkCard}
              className="text-zinc-400 hover:text-red-400 text-sm transition"
            >
              Remove
            </button>
          </div>
          <p className="text-zinc-500 text-sm">
            Tap your card at any YesAllOfUs vendor to pay instantly.
          </p>
        </div>
      ) : scanning ? (
        /* Scanning State */
        <div className="text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {/* Pulsing rings */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute inset-4 bg-emerald-500/40 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">💳</span>
            </div>
          </div>
          <p className="text-emerald-400 font-medium mb-2">Ready to scan</p>
          <p className="text-zinc-400 text-sm mb-4">Hold your NFC card near the back of your phone</p>
          <button
            onClick={() => setScanning(false)}
            className="text-zinc-500 hover:text-white text-sm transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* No Card - Show Add Button */
        <div>
          <p className="text-zinc-400 text-sm mb-4">
            Link an NFC card to pay at vendors by tapping your card.
          </p>
          <button
  onClick={startNFCScan}
  className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
>
            <span>📱</span>
            Add NFC Card
          </button>
          <p className="text-zinc-600 text-xs text-center mt-3">
            Requires Chrome on Android with NFC enabled
          </p>
        </div>
      )}
    </div>
  );
}