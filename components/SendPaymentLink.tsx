'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SendPaymentLinkProps {
  storeId: string;
  storeName: string;
  storeLogo: string | null;
  amount: number;
  items?: any[];
  onClose: () => void;
  onSuccess?: () => void;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function SendPaymentLink({ 
  storeId, 
  storeName, 
  storeLogo, 
  amount, 
  items,
  onClose,
  onSuccess 
}: SendPaymentLinkProps) {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // QR code display
  const [showQR, setShowQR] = useState(false);
  
  // Waiting state
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Create payment link
  const createPaymentLink = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/payment-link/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          amount: amount,
          items: items || [],
          currency: 'GBP'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
  setPaymentUrl(data.payment_url);
  setPaymentId(data.payment_id);
  
  // Update customer display
  const { updateCustomerDisplay } = await import('@/lib/customerDisplay');
  const cart = items?.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.unit_price || item.price,
    emoji: '💷'
  })) || [{ name: 'Payment', quantity: 1, price: amount, emoji: '💷' }];
  
  await updateCustomerDisplay(storeId, storeName, cart, amount, 'link_pending', null, 0);
} else {
        setError(data.error || 'Failed to create payment link');
      }
    } catch (err) {
      setError('Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyLink = async () => {
    if (!paymentUrl) return;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = paymentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Send via email
  const sendEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setSendingEmail(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/payment-link/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          payment_url: paymentUrl,
          store_name: storeName,
          store_logo: storeLogo,
          amount: amount
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setEmailSent(true);
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Poll for payment status when waiting
  useEffect(() => {
    if (!waitingForPayment || !paymentId) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/payment-link/${paymentId}`);
        const data = await res.json();
        
        if (data.status === 'paid' || data.status === 'complete') {
          setPaymentComplete(true);
          setWaitingForPayment(false);
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [waitingForPayment, paymentId, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Send Payment Link</h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-zinc-400 text-sm mb-1">Amount</p>
          <p className="text-4xl font-bold text-emerald-400">£{amount.toFixed(2)}</p>
          <p className="text-zinc-500 text-sm mt-1">{storeName}</p>
        </div>

        {/* Create Link Button (initial state) */}
        {!paymentUrl && !loading && (
          <button
            onClick={createPaymentLink}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition cursor-pointer"
          >
            Create Payment Link
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Payment Link Created */}
        {paymentUrl && !emailSent && !waitingForPayment && !paymentComplete && (
          <>
            {/* QR Code Display */}
            {showQR && paymentUrl && (
              <div className="mb-6">
                <div className="bg-white rounded-2xl p-4 mx-auto w-fit">
                  <QRCodeSVG 
                    value={paymentUrl}
                    size={192}
                    level="M"
                  />
                </div>
                <p className="text-zinc-500 text-xs text-center mt-2">
                  Customer scans this with their phone camera
                </p>
              </div>
            )}

            {/* Link Display */}
            <div className="bg-zinc-800 rounded-xl p-4 mb-4">
              <p className="text-zinc-400 text-xs mb-2">Payment Link</p>
              <p className="text-white text-sm break-all font-mono select-all">{paymentUrl}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Copy Button */}
              <button
                onClick={copyLink}
                className={`py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              {/* Show/Hide QR Button */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
            </div>

            {/* Quick Send Info */}
            <div className="bg-zinc-800/50 rounded-xl p-3 mb-4">
              <p className="text-zinc-400 text-xs text-center">
                📋 Copy link → Paste in WhatsApp, SMS, or any app
              </p>
            </div>

            {/* Wait for Payment Button */}
            <button
              onClick={() => setWaitingForPayment(true)}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Wait for Payment
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="text-zinc-500 text-sm">or send via email</span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            {/* Email Form */}
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-medium transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send via Email
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowEmailForm(false)}
                    className="py-3 rounded-xl font-medium transition bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={sendingEmail || !email}
                    className="py-3 rounded-xl font-bold transition bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Sending
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Waiting for Payment State */}
        {waitingForPayment && !paymentComplete && (
          <div className="flex flex-col items-center justify-center py-8">
            {/* YAOFU Badge */}
            <div className="mb-8">
              <svg viewBox="0 0 140 52" className="w-36 h-14">
                <text x="70" y="14" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="10" letterSpacing="1">
                  PARTNER
                </text>
                <text x="70" y="32" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="16" letterSpacing="3">
  <tspan fill="#10b981">Y</tspan>
  <tspan fill="#22c55e">A</tspan>
  <tspan fill="#3b82f6">O</tspan>
  <tspan fill="#6366f1">F</tspan>
  <tspan fill="#8b5cf6">U</tspan>
  <tspan fill="#a855f7">S</tspan>
</text>
                <text x="70" y="47" textAnchor="middle" fill="#52525b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="10" letterSpacing="1.5">
                  DISPLAY
                </text>
              </svg>
            </div>
            
            {/* Amount */}
            <p className="text-5xl font-bold text-emerald-400 mb-4">£{amount.toFixed(2)}</p>
            
            {/* Waiting Animation */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-zinc-400 text-lg">Waiting for payment...</p>
            </div>
            
            {/* Store Name */}
            <p className="text-zinc-500 text-sm mb-8">{storeName}</p>
            
            {/* Cancel Button */}
            <button
              onClick={() => setWaitingForPayment(false)}
              className="text-zinc-500 hover:text-white transition text-sm"
            >
              ← Back to link
            </button>
          </div>
        )}

        {/* Payment Complete State */}
        {paymentComplete && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-2">Payment Complete!</p>
            <p className="text-zinc-400 mb-6">£{amount.toFixed(2)}</p>
            <button
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl transition"
            >
              Done
            </button>
          </div>
        )}

        {/* Email Sent Success */}
        {emailSent && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-emerald-400 mb-2">Email Sent!</p>
            <p className="text-zinc-400">Payment link sent to {email}</p>
            
            <button
              onClick={onClose}
              className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-8 rounded-xl font-medium transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mt-4 text-center text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}