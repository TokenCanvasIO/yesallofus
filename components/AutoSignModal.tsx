'use client';

import { useState } from 'react';
import { getAuthHeaders } from '@/lib/walletAuth';

// L7: Map technical errors to user-friendly messages
const sanitizeError = (error: string): string => {
  if (error.includes('tec') || error.includes('tem') || error.includes('tef')) {
    return 'Transaction failed. Please try again.';
  }
  if (error.includes('timeout') || error.includes('Timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (error.includes('network') || error.includes('Network') || error.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  if (error.includes('User rejected') || error.includes('user rejected')) {
    return 'Setup cancelled.';
  }
  // Avoid exposing internal errors
  if (error.length > 100 || error.includes('Error:') || error.includes('at ')) {
    return 'Setup failed. Please try again.';
  }
  return error;
};

interface AutoSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AutoSignModal({ 
  isOpen, 
  onClose, 
  onSuccess
}: AutoSignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'setup'>('login');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const loginAndSetup = async () => {
    setLoading(true);
    setError(null);
    setProgress('Signing in...');

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth) {
        throw new Error('Failed to initialize login');
      }

      // Check if already logged in
      if (!web3auth.connected) {
        await web3auth.connect();
      }

      if (!web3auth.provider) {
        throw new Error('Login failed');
      }

      // Get wallet address
      const accounts = await web3auth.provider.request({
        method: 'xrpl_getAccounts'
      }) as string[];
      
      const wallet = accounts?.[0];
      if (!wallet) {
        throw new Error('No wallet found');
      }

      setWalletAddress(wallet);
      setStep('setup');
      setProgress('Checking wallet status...');

      // Check wallet status (funded + trustline)
      const statusRes = await fetch(`https://api.dltpays.com/nfc/api/v1/nfc/customer/autosign-status/${wallet}`);
      const statusData = await statusRes.json();

      if (statusData.wallet_not_funded) {
        throw new Error('Your wallet needs funding. Please add at least 2 XRP first.');
      }

      if (statusData.auto_sign_enabled) {
        // Already set up!
        setProgress('Already set up!');
        setTimeout(() => onSuccess(), 500);
        return;
      }

      // Get platform signer
      setProgress('Preparing tap-to-pay...');
      const settingsRes = await fetch('https://api.dltpays.com/nfc/api/v1/nfc/customer/setup-autosign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders(wallet)) },
        body: JSON.stringify({ wallet_address: wallet })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) throw new Error(settingsData.error);
      
      if (settingsData.signer_exists) {
        await fetch('https://api.dltpays.com/nfc/api/v1/nfc/customer/enable-autosign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders(wallet)) },
          body: JSON.stringify({ wallet_address: wallet, max_transaction: 25 })
        });
        onSuccess();
        return;
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) throw new Error('Platform signer not configured');

      setProgress('Confirm in your wallet...');
      
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: wallet,
        SignerQuorum: 1,
        SignerEntries: [{ SignerEntry: { Account: platformSignerAddress, SignerWeight: 1 } }]
      };
      
      await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: signerListSetTx }
      });

      setProgress('Verifying setup...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const verifyRes = await fetch(`https://api.dltpays.com/nfc/api/v1/nfc/customer/autosign-status/${wallet}`);
      const verifyData = await verifyRes.json();
      
      if (verifyData.auto_sign_enabled) {
        setProgress('Success! Tap your card again.');
        setTimeout(() => onSuccess(), 1500);
      } else {
        throw new Error('Setup failed. Please try again.');
      }

    } catch (err: any) {
      console.error('AutoSign setup error:', err);
      // L7: Sanitize error to prevent info disclosure
      setError(sanitizeError(err.message || 'Failed to set up wallet'));
      setStep('login');
    }
    setLoading(false);
    setProgress(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Wallet Not Set Up</h2>
          <p className="text-zinc-400 text-sm">
            {step === 'login' 
              ? 'Sign in to enable tap-to-pay for your NFC card.'
              : 'Setting up tap-to-pay...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {progress && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-amber-400 text-sm">{progress}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={loginAndSetup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {step === 'login' ? 'Sign In & Enable Tap-to-Pay' : 'Enable Tap-to-Pay'}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-zinc-500 text-xs text-center mt-4">
          This authorizes automatic payments up to £25 per transaction.
        </p>
      </div>
    </div>
  );
}
