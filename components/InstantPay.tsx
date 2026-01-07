'use client';

import { useState, useEffect } from 'react';

interface InstantPayProps {
  amount: number;
  rlusdAmount: number;
  vendorWallet: string;
  storeName: string;
  storeId: string;
  paymentId: string;
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
  const [step, setStep] = useState<'login' | 'setup' | 'ready'>('login');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  // Check if user is already logged in and set up
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = sessionStorage.getItem('walletAddress');
        const method = sessionStorage.getItem('loginMethod');
        
        if (stored && method === 'web3auth') {
          setWalletAddress(stored);
          
          // Check if auto-sign is enabled
          const res = await fetch(`${API_URL}/customer/autosign-status/${stored}`);
          const data = await res.json();
          
          if (data.auto_sign_enabled) {
            setStep('ready');
          } else {
            setStep('setup');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    
    checkSession();
  }, []);

  // Step 1: Login with Web3Auth
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
      
      // Check if already set up
      const res = await fetch(`${API_URL}/customer/autosign-status/${address}`);
      const data = await res.json();
      
      if (data.auto_sign_enabled) {
        setStep('ready');
      } else {
        setStep('setup');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message !== 'User closed the modal') {
        onError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Enable auto-sign
  const enableAutoSign = async () => {
    setLoading(true);
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Please sign in again');
      }

      // Enable auto-sign via SignerListSet or server registration
      const res = await fetch('https://api.dltpays.com/api/v1/customer/setup-autosign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wallet_address: walletAddress })
});
      
      const data = await res.json();
      
      if (data.success) {
        setStep('ready');
      } else {
        throw new Error(data.error || 'Failed to enable');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      onError(error.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Process payment
  const processPayment = async () => {
    if (!walletAddress) return;
    
    setPaying(true);
    
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Session expired. Please sign in again.');
      }

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

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: tx }
      }) as any;

      const txHash = result?.hash || result?.tx_hash || result?.result?.hash;
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      // Mark payment complete
      await fetch(`${API_URL}/payment-link/${paymentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payer_wallet: walletAddress,
          tx_hash: txHash
        })
      }).catch(() => {});
      
      onSuccess(txHash);
      
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  // STEP 1: Not logged in
  if (step === 'login') {
    return (
      <button
        onClick={login}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            Instant Pay with Biometrics
          </>
        )}
      </button>
    );
  }

  // STEP 2: Logged in but needs setup
  if (step === 'setup') {
    return (
      <button
        onClick={enableAutoSign}
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Enable Instant Payments (One-time)
          </>
        )}
      </button>
    );
  }

  // STEP 3: Ready to pay
  return (
    <button
      onClick={processPayment}
      disabled={paying}
      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:opacity-70 text-black font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25"
    >
      {paying ? (
        <>
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xl">Pay £{amount.toFixed(2)} Now</span>
        </>
      )}
    </button>
  );
}