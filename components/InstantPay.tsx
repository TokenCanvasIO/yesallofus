'use client';
import { useState, useEffect } from 'react';

const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';
const PLUGINS_API_URL = 'https://api.dltpays.com/plugins/api/v1';

interface InstantPayProps {
  amount: number;
  rlusdAmount: number;
  vendorWallet: string;
  storeName: string;
  storeId: string;
  paymentId: string;
  onSuccess: (txHash: string, receiptId?: string) => void;
  onError: (error: string) => void;
  isCheckoutSession?: boolean;
  tipAmount?: number;
}

export default function InstantPay({
  amount,
  rlusdAmount,
  vendorWallet,
  storeName,
  storeId,
  paymentId,
  onSuccess,
  onError,
  isCheckoutSession = false,
  tipAmount = 0
}: InstantPayProps) {
  const [step, setStep] = useState<'login' | 'setup' | 'reauth' | 'ready'>('login');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  // Helper function to get the correct pay endpoint
  const getPayEndpoint = () => {
    if (isCheckoutSession) {
      // For checkout sessions, use the plugins API with session ID (storeId contains session_id)
      return `${PLUGINS_API_URL}/checkout/session/${storeId}/pay`;
    }
    // For regular payment links, use NFC API
    return `${NFC_API_URL}/payment-link/${paymentId}/pay`;
  };

  // Check if user is already logged in and set up
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = sessionStorage.getItem('walletAddress');
        const method = sessionStorage.getItem('loginMethod');
        
        if (stored && method === 'web3auth') {
          setWalletAddress(stored);
          const res = await fetch(`${NFC_API_URL}/customer/autosign-status/${stored}`);
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

  // Helper to convert string to hex (browser-safe)
  const toHex = (str: string) => {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  };

  // Process payment with wallet address
  const processPaymentWithWallet = async (wallet: string) => {
    // Check for self-payment
    if (wallet.toLowerCase() === vendorWallet.toLowerCase()) {
      onError('SELF_PAYMENT_NOT_ALLOWED');
      return;
    }

    // Check if wallet is ready (funded + RLUSD enabled)
    try {
      const statusRes = await fetch(`${NFC_API_URL}/wallet/status/${wallet}`);
      const statusData = await statusRes.json();

      if (statusData.success && (!statusData.funded || !statusData.rlusd_trustline)) {
        onError('WALLET_NOT_READY');
        return;
      }
    } catch (err) {
      console.error('Wallet status check failed:', err);
    }

    setPaying(true);
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        // Session expired - need to re-login
        setStep('reauth');
        setPaying(false);
        return;
      }

      const tx = {
        TransactionType: 'Payment',
        Account: wallet,
        Destination: vendorWallet,
        Amount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: parseFloat(rlusdAmount.toFixed(6)).toString()
        },
        Memos: [{
          Memo: {
            MemoType: toHex('payment'),
            MemoData: toHex(`Payment to ${storeName}`)
          }
        }]
      };

      console.log('Submitting tx:', JSON.stringify(tx, null, 2));

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: tx }
      }) as any;

      console.log('Transaction result:', JSON.stringify(result, null, 2));

      const engineResult = result?.result?.engine_result || 
        result?.engine_result || 
        result?.meta?.TransactionResult ||
        result?.result?.meta?.TransactionResult ||
        result?.result?.result?.engine_result;

      console.log('Engine result:', engineResult);

      if (engineResult && engineResult !== 'tesSUCCESS') {
        console.error('Transaction failed with:', engineResult);
        if (engineResult === 'tecUNFUNDED_PAYMENT' || engineResult === 'tecPATH_DRY' || engineResult === 'tecPATH_PARTIAL') {
          throw new Error('INSUFFICIENT_FUNDS');
        }
        throw new Error(`Transaction failed: ${engineResult}`);
      }

      const txHash = result?.hash || 
        result?.tx_hash || 
        result?.result?.hash ||
        result?.result?.tx_json?.hash ||
        result?.tx_blob?.hash ||
        result?.response?.hash ||
        result?.txHash;

      if (!txHash) {
        console.error('Full result object:', JSON.stringify(result, null, 2));
        throw new Error('Transaction failed - no hash returned');
      }

      let receiptId: string | undefined;
      try {
        const payRes = await fetch(getPayEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payer_wallet: wallet,
            tx_hash: txHash,
            tip_amount: tipAmount,
            split_payment_id: paymentId
          })
        });
        const payData = await payRes.json();
        receiptId = payData.receipt_id;
      } catch (e) {
        console.error('Failed to mark payment:', e);
      }

      onSuccess(txHash, receiptId);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.message || error.toString() || 'Payment failed';
      
      if (
        errorMsg.includes('tecUNFUNDED_PAYMENT') ||
        errorMsg.includes('tecPATH_PARTIAL') ||
        errorMsg.includes('tecPATH_DRY') ||
        errorMsg.includes('insufficient') ||
        errorMsg.includes('Insufficient') ||
        errorMsg.includes('unfunded') ||
        errorMsg.includes('balance') ||
        errorMsg.includes('not enough')
      ) {
        onError('INSUFFICIENT_FUNDS');
      } else {
        onError(errorMsg);
      }
    } finally {
      setPaying(false);
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

      const res = await fetch(`${NFC_API_URL}/customer/autosign-status/${address}`);
      const data = await res.json();
      
      if (data.auto_sign_enabled) {
        setStep('ready');
        setTimeout(() => {
          processPaymentWithWallet(address);
        }, 500);
      } else {
        setStep('setup');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.message || error.toString() || 'Login failed';
      
      if (
        errorMsg.includes('tecUNFUNDED_PAYMENT') ||
        errorMsg.includes('tecPATH_PARTIAL') ||
        errorMsg.includes('tecPATH_DRY') ||
        errorMsg.includes('insufficient') ||
        errorMsg.includes('Insufficient')
      ) {
        onError('INSUFFICIENT_FUNDS');
      } else {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-authenticate and continue
  const reauth = async () => {
    setLoading(true);
    try {
      const { loginWithWeb3Auth } = await import('@/lib/web3auth');
      const result = await loginWithWeb3Auth();
      
      if (!result) {
        setLoading(false);
        return;
      }

      const address = typeof result === 'string' ? result : result.address;
      sessionStorage.setItem('walletAddress', address);
      sessionStorage.setItem('loginMethod', 'web3auth');
      
      setWalletAddress(address);
      setStep('ready');
      
      // Auto-trigger payment
      setTimeout(() => {
        processPaymentWithWallet(address);
      }, 500);
    } catch (error: any) {
      console.error('Reauth error:', error);
      onError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Enable auto-sign
  const enableAutoSign = async () => {
    setLoading(true);
    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        // Session expired - need to re-login first
        setStep('reauth');
        setLoading(false);
        return;
      }

      const res = await fetch('https://api.dltpays.com/nfc/api/v1/customer/setup-autosign', {
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

  // Process payment
  const processPayment = async () => {
    if (!walletAddress) return;
    await processPaymentWithWallet(walletAddress);
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

  // STEP 2.5: Session expired - need to re-login (friendly message)
  if (step === 'reauth') {
    return (
      <div className="space-y-3">
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sky-400 text-sm">Session expired. Please sign in again to continue.</p>
        </div>
        <button
          onClick={reauth}
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </>
          )}
        </button>
      </div>
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