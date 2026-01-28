'use client';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/walletAuth';

interface Card {
  card_uid: string;
  card_uid_display: string;
  card_name: string | null;
  linked_at: string | null;
}

interface LinkNFCCardProps {
  walletAddress: string;
  onCardLinked?: () => void;
  noBorder?: boolean;
}

export default function LinkNFCCard({ walletAddress, onCardLinked, noBorder = false }: LinkNFCCardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [nfcSupported, setNfcSupported] = useState(true);
  const [soundRegistered, setSoundRegistered] = useState(false);
  const [nfcController, setNfcController] = useState<AbortController | null>(null);

  const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

  // Check NFC support on mount
  useEffect(() => {
    setNfcSupported('NDEFReader' in window);
  }, []);

  // Load all linked cards + auto-register sound device
  useEffect(() => {
    fetchCards();
    
    // Auto-register sound device if wallet exists and not already registered
    if (walletAddress) {
      const existingSoundId = localStorage.getItem('yesallofus_sound_id');
      if (!existingSoundId) {
        const soundId = 'snd_' + Math.random().toString(36).slice(2,6);
        const secretKey = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        
        localStorage.setItem('yesallofus_sound_id', soundId);
        localStorage.setItem('yesallofus_sound_secret', secretKey);
        
        fetch(`${NFC_API_URL}/sound/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: walletAddress,
            sound_id: soundId,
            secret_key: secretKey
          })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            console.log('🔊 Sound device registered:', soundId);
            setSoundRegistered(true);
          }
        }).catch(err => {
          console.warn('Sound registration failed:', err);
        });
      } else {
        console.log('🔊 Sound device already registered:', existingSoundId);
        setSoundRegistered(true);
      }
    }
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

  // Stop any existing NFC scan
  const stopNFCScan = () => {
    if (nfcController) {
      nfcController.abort();
      setNfcController(null);
    }
    setScanning(false);
  };

  const startNFCScan = async () => {
    setError(null);
    setSuccess(null);

    if (!('NDEFReader' in window)) {
      setError('Your browser doesn\'t support NFC. Please open this page in Chrome on Android.');
      return;
    }

    // Abort any existing scan first
    stopNFCScan();

    const controller = new AbortController();
    setNfcController(controller);
    setScanning(true);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });

      ndef.addEventListener('reading', async (event: any) => {
        // Abort to prevent duplicate reads
        controller.abort();
        setNfcController(null);

        const serialNumber = event.serialNumber;

        if (!serialNumber) {
          setError('Could not read card. Please try again.');
          setScanning(false);
          return;
        }

        const cardUid = serialNumber.replace(/:/g, '').toUpperCase();
        await linkCard(cardUid);
        setScanning(false);
      }, { signal: controller.signal });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading card. Please try again.');
        stopNFCScan();
      }, { signal: controller.signal });

    } catch (err: any) {
      console.error('NFC error:', err);
      if (err.name === 'AbortError') {
        // User cancelled - ignore
        return;
      }
      if (err.name === 'NotAllowedError') {
        setError('NFC permission denied. Please allow NFC access.');
      } else if (err.name === 'NotSupportedError') {
        setError('NFC is not supported on this device.');
      } else {
        setError('Failed to start NFC scan. Make sure NFC is enabled.');
      }
      stopNFCScan();
    }
  };

  const linkCard = async (cardUid: string) => {
    try {
      // Use authenticated fetch for protected endpoint
      const res = await authenticatedFetch(walletAddress, `${NFC_API_URL}/nfc/link-card`, {
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
        // Auto-open edit mode for naming
        setEditingCard(cardUid.toLowerCase().replace(/:/g, ''));
        setEditName('');
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
      // Use authenticated fetch for protected endpoint
      const res = await authenticatedFetch(walletAddress, `${NFC_API_URL}/nfc/unlink-card`, {
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
        setSuccess('Card name saved!');
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
      <div className={noBorder ? "p-4" : "bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6"}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={noBorder ? "p-4" : "bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 mt-6"}>
      {/* Browser Warning - Show if NFC not supported */}
      {!nfcSupported && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div>
              <p className="text-amber-400 font-medium text-sm">Browser not supported</p>
              <p className="text-amber-400/80 text-sm mt-1">NFC card linking requires <strong>Chrome</strong> on Android. Open this page in Chrome to add cards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - only show if not noBorder (since CollapsibleSection has its own header) */}
      {!noBorder && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
              <h2 className="text-lg font-bold">Payment Cards</h2>
              <p className="text-zinc-500 text-sm">{cards.length} card{cards.length !== 1 ? 's' : ''} linked</p>
            </div>
          </div>
          {cards.length > 0 && cards.length < 5 && !scanning && nfcSupported && (
            <button
              onClick={startNFCScan}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition flex items-center gap-1"
            >
              <span>+</span>
              Add
            </button>
          )}
        </div>
      )}

      {/* Card count for noBorder mode */}
      {noBorder && cards.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-zinc-500 text-sm">{cards.length} card{cards.length !== 1 ? 's' : ''} linked</p>
          {cards.length < 5 && !scanning && nfcSupported && (
            <button
              onClick={startNFCScan}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition flex items-center gap-1"
            >
              <span>+</span>
              Add
            </button>
          )}
        </div>
      )}

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
                /* Editing Mode - FIXED FOR MOBILE */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., My Black Card"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCardName(card.card_uid);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCardName(card.card_uid)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
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
            onClick={stopNFCScan}
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
          {nfcSupported ? (
            <>
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
            </>
          ) : (
            <div className="w-full bg-zinc-800 text-zinc-400 font-medium py-4 rounded-xl flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Open in Chrome to add cards
            </div>
          )}
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

      {/* Sound Payment Status */}
      {soundRegistered && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Sound Payment</p>
              <p className="text-emerald-400 text-xs">Ready</p>
            </div>
            <span className="ml-auto text-emerald-400">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}