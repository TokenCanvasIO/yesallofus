'use client';

import { useState, useEffect } from 'react';

const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface PendingCustomer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  card_uid: string;
  card_name: string | null;
  created_at: string | null;
}

export default function PendingCustomers({ 
  storeId, 
  walletAddress 
}: { 
  storeId: string; 
  walletAddress: string | null;
}) {
  const [customers, setCustomers] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCustomers = async () => {
    if (!storeId || !walletAddress) return;
    
    try {
      const res = await fetch(
        `${NFC_API_URL}/store/${storeId}/pending-customers?wallet_address=${walletAddress}`
      );
      const data = await res.json();
      
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending customers:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [storeId, walletAddress]);

  const handleUpdateEmail = async (customer: PendingCustomer) => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/pending/update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_uid: customer.card_uid,
          email: newEmail.trim(),
          store_id: storeId
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Welcome email sent to ${data.new_email}` });
        setEditingId(null);
        setNewEmail('');
        fetchCustomers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update email' });
    }

    setUpdating(false);
  };

  const handleResendEmail = async (customer: PendingCustomer) => {
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${NFC_API_URL}/nfc/pending/update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_uid: customer.card_uid,
          email: customer.email,
          store_id: storeId
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Welcome email resent to ${customer.email}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to resend email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to resend email' });
    }

    setUpdating(false);
  };

  if (loading) {
    return (
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
        <h2 className="text-lg font-bold mb-4">Pending Customers</h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
<div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Pending Customers</h2>
        <span className="text-zinc-500 text-sm">{customers.length} pending</span>
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

      {customers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-zinc-400">No pending customers</p>
          <p className="text-zinc-600 text-sm mt-1">
            Customers who scan their NFC card will appear here until they complete signup
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div 
              key={customer.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {customer.name || 'No name'}
                    </span>
                    {customer.card_name && (
                      <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                        {customer.card_name}
                      </span>
                    )}
                  </div>
                  
                  {editingId === customer.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="New email address"
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateEmail(customer)}
                          disabled={updating}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {updating ? 'Sending...' : 'Update & Send'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setNewEmail('');
                          }}
                          className="text-zinc-400 hover:text-white text-sm px-3 py-1.5 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-zinc-400 text-sm truncate">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-zinc-500 text-xs">{customer.phone}</p>
                      )}
                    </>
                  )}
                </div>

                {editingId !== customer.id && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setEditingId(customer.id);
                        setNewEmail(customer.email);
                        setMessage(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      Edit Email
                    </button>
                    <button
                      onClick={() => handleResendEmail(customer)}
                      disabled={updating}
                      className="text-xs text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-center justify-between">
                <span className="text-zinc-600 text-xs font-mono">
                  {customer.card_uid.slice(0, 4)}...{customer.card_uid.slice(-4)}
                </span>
                {customer.created_at && (
                  <span className="text-zinc-600 text-xs">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchCustomers}
        className="w-full mt-4 text-zinc-500 hover:text-zinc-300 text-sm transition"
      >
        ↻ Refresh
      </button>
    </div>
  );
}