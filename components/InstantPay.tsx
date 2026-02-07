'use client';
import { useState, useEffect } from 'react';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { refreshWalletAuth, getWalletAuthHeadersAsync } from '@/lib/walletAuth';
import AutoSignModal from './AutoSignModal';

const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';
const PLUGINS_API_URL = 'https://api.dltpays.com/plugins/api/v1';

// L7: Map technical errors to user-friendly messages
const sanitizeError = (error: string): string => {
  // Known error codes that should pass through
  if (['INSUFFICIENT_FUNDS', 'SELF_PAYMENT_NOT_ALLOWED', 'WALLET_NOT_READY'].includes(error)) {
    return error;
  }
  // Map technical errors to friendly messages
  if (error.includes('tec') || error.includes('tem') || error.includes('tef')) {
    return 'Transaction failed. Please try again.';
  }
  if (error.includes('timeout') || error.includes('Timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (error.includes('network') || error.includes('Network') || error.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  // Avoid exposing internal errors
  if (error.length > 100 || error.includes('Error:') || error.includes('at ')) {
    return 'Payment failed. Please try again.';
  }
  return error;
};

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
  const [showAutoSignModal, setShowAutoSignModal] = useState(false);

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
        const stored = safeGetItem('walletAddress');
        const method = safeGetItem('loginMethod');
        
        if (stored && method === 'web3auth') {
          setWalletAddress(stored);
          await refreshWalletAuth(stored);
          const headers = await getWalletAuthHeadersAsync(stored);
          const res = await fetch(`${NFC_API_URL}/nfc/customer/autosign-status/${stored}`, { headers });
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

  const processPaymentWithWallet = async (wallet: string) => {
    // Check for self-payment
    if (wallet.toLowerCase() === vendorWallet.toLowerCase()) {
      onError('SELF_PAYMENT_NOT_ALLOWED');
      return;
    }

    // Check if wallet is ready (funded + RLUSD enabled)
    try {
      const statusRes = await fetch(`${NFC_API_URL}/wallet/status/${wallet}`);
      if (!statusRes.ok) {
        console.warn('Wallet status check failed:', statusRes.status);
      }
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
      // Call backend to process payment using signer list authority
      const res = await fetch(getPayEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_wallet: wallet,
          tip_amount: tipAmount
        })
      });

      if (!res.ok) {
        throw new Error(`Payment request failed: ${res.status}`);
      }

      const result = await res.json();

      if (!result.success) {
        if (result.error === 'NO_SIGNER_AUTHORITY') {
          setStep('setup');
          return;
        }
        throw new Error(result.error || 'Payment failed');
      }

      onSuccess(result.tx_hash, result.receipt_id);
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
        errorMsg.includes('not enough') ||
        errorMsg.includes('NO_SIGNER_AUTHORITY')
      ) {
        if (errorMsg.includes('NO_SIGNER_AUTHORITY')) {
          setStep('setup');
          return;
        }
        onError('INSUFFICIENT_FUNDS');
      } else {
        // L7: Sanitize error to prevent info disclosure
        onError(sanitizeError(errorMsg));
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
      
      safeSetItem('walletAddress', address);
      safeSetItem('loginMethod', 'web3auth');
      safeSetItem('socialProvider', provider);
      
      setWalletAddress(address);

      await refreshWalletAuth(address);
      const headers = await getWalletAuthHeadersAsync(address);
      const res = await fetch(`${NFC_API_URL}/nfc/customer/autosign-status/${address}`, { headers });
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
        // L7: Sanitize error to prevent info disclosure
        onError(sanitizeError(errorMsg));
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
      safeSetItem('walletAddress', address);
      safeSetItem('loginMethod', 'web3auth');
      
      setWalletAddress(address);

      // Check auto-sign status before allowing payment
      await refreshWalletAuth(address);
      const headers = await getWalletAuthHeadersAsync(address);
      const res = await fetch(`${NFC_API_URL}/nfc/customer/autosign-status/${address}`, { headers });
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
        setStep('reauth');
        setLoading(false);
        return;
      }

      // Get platform signer address
      const res = await fetch('https://api.dltpays.com/nfc/api/v1/nfc/customer/setup-autosign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // If signer already exists, just proceed
      if (data.signer_exists || data.auto_sign_enabled) {
        setStep('ready');
        return;
      }

      const platformSignerAddress = data.platform_signer_address;
      if (!platformSignerAddress) throw new Error('Platform signer not configured');

      // Build and sign SignerListSet transaction
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: walletAddress,
        SignerQuorum: 1,
        SignerEntries: [{ SignerEntry: { Account: platformSignerAddress, SignerWeight: 1 } }]
      };
      
      await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: signerListSetTx }
      });

      // Verify setup worked
      await new Promise(resolve => setTimeout(resolve, 2000));
      const verifyRes = await fetch(`https://api.dltpays.com/nfc/api/v1/nfc/customer/autosign-status/${walletAddress}`);
      const verifyData = await verifyRes.json();
      
      if (verifyData.auto_sign_enabled) {
        setStep('ready');
      } else {
        throw new Error('Setup failed. Please try again.');
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
    if (!walletAddress || paying) return;
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

  // STEP 2: Logged in but needs setup - show modal
  if (step === 'setup') {
    return (
      <>
        <AutoSignModal
          isOpen={true}
          onClose={() => setStep('login')}
          onSuccess={() => {
            setStep('ready');
            if (walletAddress) {
              setTimeout(() => processPaymentWithWallet(walletAddress), 500);
            }
          }}
        />
        <button
          disabled={true}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-50 text-black font-bold py-5 rounded-2xl transition flex items-center justify-center gap-3"
        >
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Setting up wallet...
        </button>
      </>
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