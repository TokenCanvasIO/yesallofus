'use client';

import { useState, useEffect } from 'react';

interface InstantPayProps {
  amount: number;           // GBP amount
  rlusdAmount: number;      // RLUSD amount (converted)
  vendorWallet: string;
  storeName: string;
  storeId: string;
  paymentId: string;        // For marking payment complete
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function InstantPay({
  amount,
  rlusdAmount,
  vendorWallet,
  storeName,
  storeId,
  paymentId,
  onSuccess,
  onError
}: InstantPayProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Check if user is already logged in via Web3Auth
  useEffect(() => {
    const checkSession = async () => {
      const stored = sessionStorage.getItem('walletAddress');
      const method = sessionStorage.getItem('loginMethod');
      
      if (stored && method === 'web3auth') {
        setWalletAddress(stored);
        setIsLoggedIn(true);
        await checkAutoSignStatus(stored);
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);

  // Check if auto-sign is enabled for this wallet
  const checkAutoSignStatus = async (wallet: string) => {
    try {
      const res = await fetch(`${API_URL}/customer/autosign-status/${wallet}`);
      const data = await res.json();
      setAutoSignEnabled(data.auto_sign_enabled || false);
    } catch (error) {
      console.error('Auto-sign check error:', error);
      setAutoSignEnabled(false);
    }
  };

  // Login with Web3Auth
  const login = async () => {
    setLoading(true);
    try {
      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
      const result = await loginWithWeb3Auth();
      
      if (!result) {
        setLoading(false);
        return;
      }
      
      const address = typeof result === 'string' ? result : result.address;
      const provider = typeof result === 'string' ? 'google' : (result.provider || 'google');
      
      sessionStorage.setItem('walletAddress', address);
      sessionStorage.setItem('loginMethod', 'web3auth');
      sessionStorage.setItem('socialProvider', provider);
      
      setWalletAddress(address);
      setIsLoggedIn(true);
      await checkAutoSignStatus(address);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message !== 'User closed the modal') {
        onError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Process instant payment via Web3Auth
  const processPayment = async () => {
    if (!walletAddress || !autoSignEnabled) return;
    
    setPaying(true);
    
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      // Create payment transaction
      const tx = {
        TransactionType: 'Payment',
        Account: walletAddress,
        Destination: vendorWallet,
        Amount: {
          currency: 'RLUSD',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: rlusdAmount.toString()
        },
        Memos: [{
          Memo: {
            MemoType: Buffer.from('payment', 'utf8').toString('hex').toUpperCase(),
            MemoData: Buffer.from(`Payment to ${storeName}`, 'utf8').toString('hex').toUpperCase()
          }
        }]
      };

      // Sign and submit via Web3Auth (triggers biometric)
      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: tx }
      }) as any;

      const txHash = result?.hash || result?.tx_hash || result?.result?.hash;
      
      if (!txHash) {
        throw new Error('Transaction failed - no hash returned');
      }
      
      // Mark payment as paid in our system
      await fetch(`${API_URL}/payment-link/${paymentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payer_wallet: walletAddress,
          tx_hash: txHash
        })
      }).catch(() => {}); // Non-critical
      
      onSuccess(txHash);
      
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  // Loading state
  if (loading) {
    return null;
  }

  // Not logged in - show login button
  if (!isLoggedIn) {
    return (
      <button
        onClick={login}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
        Instant Pay with Biometrics
      </button>
    );
  }

  // Logged in but auto-sign not enabled
  if (!autoSignEnabled) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">Instant Pay Available</p>
            <p className="text-zinc-500 text-sm">Enable biometric payments first</p>
          </div>
        </div>
        <a
          href="/affiliate-dashboard"
          target="_blank"
          className="block w-full bg-violet-600 hover:bg-violet-500 text-white text-center font-medium py-3 rounded-xl transition"
        >
          Enable in Dashboard
        </a>
      </div>
    );
  }

  // Ready for instant payment
  return (
    <button
      onClick={processPayment}
      disabled={paying}
      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-70 text-white font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
    >
      {paying ? (
        <>
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <span className="text-xl">Instant Pay £{amount.toFixed(2)}</span>
        </>
      )}
    </button>
  );
}