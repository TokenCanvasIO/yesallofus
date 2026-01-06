'use client';

import { useState, useEffect } from 'react';

interface Card {
  card_uid: string;
  card_uid_display: string;
  card_name: string | null;
  linked_at: string | null;
}

interface LinkNFCCardProps {
  walletAddress: string;
  onCardLinked?: () => void;
}

export default function LinkNFCCard({ walletAddress, onCardLinked }: LinkNFCCardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const API_URL = 'https://api.dltpays.com/api/v1';
  const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

  // Load all linked cards
  useEffect(() => {
    fetchCards();
  }, [walletAddress]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${NFC_API_URL}/nfc/cards-by-wallet/${walletAddress}`);
      if (!res.ok) {
        setCards([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.cards) {
        setCards(data.cards);
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setCards([]);
    }
    setLoading(false);
  };

  const startNFCScan = async () => {
    setError(null);
    setSuccess(null);

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

        const cardUid = serialNumber.replace(/:/g, '').toUpperCase();
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
      const res = await fetch(`${NFC_API_URL}/nfc/link-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          card_uid: cardUid
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Card linked successfully!');
        await fetchCards();
        onCardLinked?.();
      } else {
        setError(data.error || 'Failed to link card');
      }
    } catch (err) {
      setError('Failed to link card. Please try again.');
    }
  };

  const unlinkCard = async (cardUid: string, cardName: string | null) => {
    const displayName = cardName || `Card ...${cardUid.slice(-4)}`;
    if (!confirm(`Remove "${displayName}"? You will need to tap it again to re-link.`)) return;

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/unlink-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          card_uid: cardUid
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Card removed successfully');
        await fetchCards();
      } else {
        setError(data.error || 'Failed to remove card');
      }
    } catch (err) {
      setError('Failed to remove card. Please try again.');
    }
  };

  const startEditing = (card: Card) => {
    setEditingCard(card.card_uid);
    setEditName(card.card_name || '');
  };

  const saveCardName = async (cardUid: string) => {
    try {
      const res = await fetch(`${NFC_API_URL}/nfc/card/${cardUid}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          card_name: editName.trim() || null
        })
      });

      const data = await res.json();

      if (data.success) {
        setEditingCard(null);
        setEditName('');
        await fetchCards();
      } else {
        setError(data.error || 'Failed to update card name');
      }
    } catch (err) {
      setError('Failed to update card name. Please try again.');
    }
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setEditName('');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <div>
        <h2 className="text-lg font-bold">Payment Cards</h2>
        <p className="text-zinc-500 text-sm">{cards.length} card{cards.length !== 1 ? 's' : ''} linked</p>
      </div>
    </div>
        {cards.length > 0 && cards.length < 5 && !scanning && (
          <button
            onClick={startNFCScan}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <span>+</span>
            Add Card
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="text-red-400/60 hover:text-red-400 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
          <p className="text-emerald-400 text-sm">{success}</p>
          <button 
            onClick={() => setSuccess(null)} 
            className="text-emerald-400/60 hover:text-emerald-400 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cards List */}
      {cards.length > 0 && (
        <div className="space-y-3 mb-4">
          {cards.map((card) => (
            <div 
              key={card.card_uid}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4"
            >
              {editingCard === card.card_uid ? (
                /* Editing Mode */
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., Puffin Bus Card"
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCardName(card.card_uid);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <button
                    onClick={() => saveCardName(card.card_uid)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 px-3 rounded-lg transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-zinc-400 hover:text-white text-sm py-2 px-3 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-lg">✓</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          {card.card_name || 'Unnamed Card'}
                        </p>
                        <button
                          onClick={() => startEditing(card)}
                          className="text-zinc-500 hover:text-white transition"
                          title="Edit name"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-zinc-500 text-sm font-mono">
  {card.card_uid.slice(0, 4)}...{card.card_uid.slice(-4)}
  {card.linked_at && (
    <span className="font-sans ml-2">· Added {formatDate(card.linked_at)}</span>
  )}
</p>
                    </div>
                  </div>
<button
  onClick={() => unlinkCard(card.card_uid, card.card_name)}
  className="text-zinc-500 hover:text-red-400 text-sm transition self-end sm:self-auto"
>
  Remove
</button>
</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scanning State */}
      {scanning && (
        <div className="text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
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
      )}

      {/* No Cards - Show Add Button */}
      {cards.length === 0 && !scanning && (
        <div>
          <p className="text-zinc-400 text-sm mb-4">
            Link an NFC card to pay at vendors by tapping your card. You can add up to 5 cards.
          </p>
          <button
  onClick={startNFCScan}
  className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
  Add NFC Card
</button>
<p className="text-zinc-500 text-sm text-center mt-3">
  Requires Chrome on Android with NFC enabled
</p>
        </div>
      )}

      {/* Max cards reached */}
      {cards.length >= 5 && !scanning && (
        <p className="text-zinc-500 text-sm text-center">
          Maximum 5 cards reached. Remove a card to add another.
        </p>
      )}

      {/* Help text */}
      {cards.length > 0 && !scanning && (
        <p className="text-zinc-600 text-xs mt-4">
          Tap your card at any YesAllOfUs vendor to pay instantly.
        </p>
      )}
    </div>
  );
}