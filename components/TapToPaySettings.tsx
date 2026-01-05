'use client';

import { useState, useEffect } from 'react';

interface TapToPaySettingsProps {
  walletAddress: string;
  loginMethod: string | null;
  socialProvider?: string | null;
  onAutoSignEnabled?: () => void;
}

const API_URL = 'https://api.dltpays.com/api/v1';
const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function TapToPaySettings({ 
  walletAddress, 
  loginMethod, 
  socialProvider,
  onAutoSignEnabled 
}: TapToPaySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Customer limit is fixed at £25 until KYC
  const MAX_TRANSACTION = 25;

  // Check if auto-sign is enabled for this customer
  useEffect(() => {
    checkAutoSignStatus();
  }, [walletAddress]);

  const checkAutoSignStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${NFC_API_URL}/customer/autosign-status/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setAutoSignEnabled(data.auto_sign_enabled || false);
      }
    } catch (err) {
      console.error('Failed to check auto-sign status:', err);
    }
    setLoading(false);
  };

  // Enable auto-sign for Web3Auth
  const enableAutoSignWeb3Auth = async () => {
    if (!termsAccepted) return;
    
    setSettingUp(true);
    setError(null);
    setSuccess(null);

    try {
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();
      
      if (!web3auth || !web3auth.provider) {
        throw new Error('Web3Auth session not available. Please sign in again.');
      }

      // Get platform signer address from API
      const settingsRes = await fetch(`${NFC_API_URL}/customer/setup-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) {
        throw new Error(settingsData.error);
      }

      // Handle unfunded wallet
      if (settingsData.needs_funding) {
        throw new Error('Your wallet needs to be funded first. Please add at least 2 XRP.');
      }

      // If signer already exists, just verify
      if (settingsData.signer_exists) {
        setAutoSignEnabled(true);
        setSuccess('Tap-to-Pay is already enabled!');
        setSettingUp(false);
        return;
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) {
        throw new Error('Platform signer not configured');
      }

      // Build SignerListSet transaction
      const signerListSetTx = {
        TransactionType: 'SignerListSet',
        Account: walletAddress,
        SignerQuorum: 1,
        SignerEntries: [
          {
            SignerEntry: {
              Account: platformSignerAddress,
              SignerWeight: 1
            }
          }
        ]
      };

      // Sign and submit via Web3Auth
      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: {
          transaction: signerListSetTx
        }
      });

      console.log('SignerListSet result:', result);

      // Verify the setup
      const verifyRes = await fetch(`${NFC_API_URL}/customer/verify-autosign/${walletAddress}`);
      const verifyData = await verifyRes.json();

      if (!verifyData.auto_sign_enabled) {
        throw new Error('Signer setup failed. Please try again.');
      }

      setAutoSignEnabled(true);
      setSuccess('Tap-to-Pay enabled! You can now pay by tapping your NFC card.');
      setTermsAccepted(false);
      onAutoSignEnabled?.();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable Tap-to-Pay';
      setError(message);
    }
    setSettingUp(false);
  };

  // Enable auto-sign for Crossmark
  const enableAutoSignCrossmark = async () => {
    if (!termsAccepted) return;
    
    setSettingUp(true);
    setError(null);
    setSuccess(null);

    try {
      const sdk = (window as any).xrpl?.crossmark;
      if (!sdk) {
        throw new Error('Crossmark wallet not detected. Please install the browser extension.');
      }

      // Sign in to verify wallet
      const signIn = await sdk.methods.signInAndWait();
      if (!signIn.response?.data?.address) {
        throw new Error('Connection cancelled');
      }
      const address = signIn.response.data.address;

      if (address !== walletAddress) {
        throw new Error('Please connect with the same wallet address');
      }

      // Enable auto-sign on server
      const res = await fetch(`${NFC_API_URL}/customer/enable-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          max_transaction: MAX_TRANSACTION
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAutoSignEnabled(true);
      setSuccess('Tap-to-Pay enabled! You can now pay by tapping your NFC card.');
      setTermsAccepted(false);
      onAutoSignEnabled?.();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable Tap-to-Pay';
      setError(message);
    }
    setSettingUp(false);
  };

  // Revoke auto-sign
  const revokeAutoSign = async () => {
    if (!confirm('Disable Tap-to-Pay? You will need to set it up again to use NFC payments.')) return;

    setSettingUp(true);
    setError(null);

    try {
      const res = await fetch(`${NFC_API_URL}/customer/revoke-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });

      const data = await res.json();
      if (data.success) {
        setAutoSignEnabled(false);
        setSuccess('Tap-to-Pay disabled.');
      } else {
        throw new Error(data.error || 'Failed to disable');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disable Tap-to-Pay';
      setError(message);
    }
    setSettingUp(false);
  };

  // Determine if user can enable auto-sign
  const canEnableAutoSign = loginMethod === 'web3auth' || loginMethod === 'crossmark';
  const isXaman = loginMethod === 'xaman' || (!loginMethod && !canEnableAutoSign);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading Tap-to-Pay status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">⚡</div>
        <div>
          <h3 className="text-lg font-bold">Tap-to-Pay</h3>
          <p className="text-zinc-500 text-sm">Pay instantly by tapping your NFC card</p>
        </div>
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

      {/* Auto-sign enabled */}
      {autoSignEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <div>
                <p className="text-emerald-400 font-medium">Tap-to-Pay Enabled</p>
                <p className="text-zinc-500 text-sm">Max £{MAX_TRANSACTION} per transaction</p>
              </div>
            </div>
            <button
              onClick={revokeAutoSign}
              disabled={settingUp}
              className="text-zinc-400 hover:text-red-400 text-sm transition"
            >
              {settingUp ? 'Disabling...' : 'Disable'}
            </button>
          </div>

          <p className="text-zinc-500 text-sm">
            Tap your NFC card at any YesAllOfUs vendor to pay instantly.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              💡 <strong>Increase your limit:</strong> Complete KYC verification with TVVIN to increase your transaction limit. <span className="text-zinc-500">(Coming soon)</span>
            </p>
          </div>
        </div>
      ) : isXaman ? (
        /* Xaman user - show info message */
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 font-medium mb-2">ℹ️ Tap-to-Pay not available with Xaman</p>
            <p className="text-zinc-400 text-sm mb-3">
              To enable instant NFC payments, please sign in with:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• <strong className="text-white">Web3Auth</strong> (Google, Apple, etc.) - Recommended</li>
              <li>• <strong className="text-white">Crossmark</strong> browser extension</li>
            </ul>
          </div>

          <p className="text-zinc-500 text-sm">
            These options allow automatic payment signing without manual approval for each transaction.
          </p>
        </div>
      ) : (
        /* Web3Auth or Crossmark - show setup */
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 font-medium mb-2">⚡ Enable instant NFC payments</p>
            <p className="text-zinc-400 text-sm">
              Allow payments up to <strong className="text-white">£{MAX_TRANSACTION}</strong> per transaction when you tap your NFC card at any vendor.
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <p className="text-orange-400 text-sm font-bold mb-2">⚠️ Security Notice</p>
            <p className="text-orange-300/90 text-sm mb-2">
              Enabling Tap-to-Pay allows YesAllOfUs to automatically sign RLUSD transactions up to £{MAX_TRANSACTION} without manual approval.
            </p>
            <ul className="text-orange-300/80 text-xs space-y-1">
              <li>• Keep only small amounts in this wallet for daily spending</li>
              <li>• You can disable Tap-to-Pay at any time</li>
              <li>• Report lost/stolen cards immediately in your dashboard</li>
            </ul>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-zinc-300 text-sm">
              I understand the risks and agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a>
            </span>
          </label>

          {/* Enable Button */}
          {loginMethod === 'web3auth' ? (
            <button
              onClick={enableAutoSignWeb3Auth}
              disabled={!termsAccepted || settingUp}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                termsAccepted && !settingUp
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {settingUp ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                  Setting up...
                </>
              ) : (
                <>⚡ Connect to Tap-to-Pay</>
              )}
            </button>
          ) : (
            <button
              onClick={enableAutoSignCrossmark}
              disabled={!termsAccepted || settingUp}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                termsAccepted && !settingUp
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {settingUp ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                  Setting up...
                </>
              ) : (
                <>🔐 Connect to Tap-to-Pay</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}