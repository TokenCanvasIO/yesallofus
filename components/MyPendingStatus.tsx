'use client';

import { useState, useEffect } from 'react';

const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PendingCustomer {
  id: string;
  name: string | null;
  email: string;
  card_uid: string;
  card_name: string | null;
  store_id: string | null;
  created_at: string | null;
}

export default function MyPendingStatus({ 
  walletAddress,
  email 
}: { 
  walletAddress?: string;
  email?: string;
}) {
  const [pending, setPending] = useState<PendingCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    if (!walletAddress && !email) {
      setLoading(false);
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (walletAddress) params.append('wallet_address', walletAddress);
      if (email) params.append('email', email);
      
      const res = await fetch(`${NFC_API_URL}/nfc/my-pending-status?${params}`);
      const data = await res.json();
      
      if (data.success && data.pending) {
        setPending(data.customer);
      } else {
        setPending(null);
      }
    } catch (err) {
      console.error('Failed to fetch pending status:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, [walletAddress, email]);

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !pending) {
      setMessage({ type: 'error', text: 'Please enter a valid email' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/pending/update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_uid: pending.card_uid,
          email: newEmail.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Welcome email sent to ${data.new_email}` });
        setEditing(false);
        setNewEmail('');
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update email' });
    }

    setUpdating(false);
  };

  const handleResendEmail = async () => {
    if (!pending) return;
    
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/pending/update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_uid: pending.card_uid,
          email: pending.email
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Welcome email resent to ${pending.email}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to resend email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to resend email' });
    }

    setUpdating(false);
  };

  // Don't show anything if not pending
  if (loading || !pending) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl">📧</div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-400">Complete Your Signup</h3>
          <p className="text-zinc-400 text-sm mt-1">
            Check your email ({pending.email}) for a welcome link to complete your account setup.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-zinc-500 text-xs block mb-1">New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateEmail}
              disabled={updating}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {updating ? 'Sending...' : 'Update & Send Email'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNewEmail('');
                setMessage(null);
              }}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleResendEmail}
            disabled={updating}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {updating ? 'Sending...' : 'Resend Welcome Email'}
          </button>
          <button
            onClick={() => {
              setEditing(true);
              setNewEmail(pending.email);
              setMessage(null);
            }}
            className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 px-4 rounded-lg text-sm transition"
          >
            Wrong Email? Update It
          </button>
        </div>
      )}

      {pending.card_name && (
        <p className="text-zinc-600 text-xs mt-3">
          Card: {pending.card_name}
        </p>
      )}
    </div>
  );
}