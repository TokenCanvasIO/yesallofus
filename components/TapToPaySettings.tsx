'use client';

import { useState, useEffect, useCallback } from 'react';

interface TapToPaySettingsProps {
  walletAddress: string;
  loginMethod: string | null;
  socialProvider?: string | null;
  onAutoSignEnabled?: () => void;
}

const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1/nfc';

// Register sound device for sound payments
const registerSoundDevice = async (wallet: string) => {
  try {
    // Check if already registered
    const existingId = localStorage.getItem('yesallofus_sound_id');
    if (existingId) {
      console.log('🔊 Sound device already registered:', existingId);
      return;
    }
    const soundId = 'snd_' + crypto.randomUUID().slice(0,8);
    const secretKey = crypto.randomUUID();
    localStorage.setItem('yesallofus_sound_id', soundId);
    localStorage.setItem('yesallofus_sound_secret', secretKey);
    await fetch('https://api.dltpays.com/nfc/api/v1/sound/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: wallet, sound_id: soundId, secret_key: secretKey })
    });
    console.log('🔊 Sound device registered:', soundId);
  } catch (err) {
    console.warn('Sound registration failed:', err);
  }
};

export default function TapToPaySettings({ 
  walletAddress, 
  loginMethod, 
  socialProvider,
  onAutoSignEnabled 
}: TapToPaySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [walletNotFunded, setWalletNotFunded] = useState(false);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  
  // Customer limit is fixed at £25 until KYC
  const MAX_TRANSACTION = 25;

  // Check if auto-sign is enabled for this customer (from XRPL - source of truth)
  const checkAutoSignStatus = useCallback(async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${NFC_API_URL}/customer/autosign-status/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        // API now checks XRPL as source of truth
        setAutoSignEnabled(data.auto_signing_enabled || data.auto_sign_enabled || false);
        setWalletNotFunded(data.wallet_not_funded || false);
        setSignerAddress(data.signer_address || null);
      }
    } catch (err) {
      console.error('Failed to check auto-sign status:', err);
    }
    setLoading(false);
  }, [walletAddress]);

  useEffect(() => {
    checkAutoSignStatus();
  }, [checkAutoSignStatus]);

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
        setWalletNotFunded(true);
        throw new Error('Your wallet needs to be funded first. Please add at least 2 XRP.');
      }

      // If signer already exists, just verify
      if (settingsData.signer_exists) {
        setAutoSignEnabled(true);

      // Register sound device for sound payments
      try {
        const soundId = 'snd_' + crypto.randomUUID().slice(0,8);
        const secretKey = crypto.randomUUID();
        localStorage.setItem('yesallofus_sound_id', soundId);
        localStorage.setItem('yesallofus_sound_secret', secretKey);
        await fetch('https://api.dltpays.com/nfc/api/v1/sound/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress, sound_id: soundId, secret_key: secretKey })
        });
        console.log('🔊 Sound device registered:', soundId);
      } catch (soundErr) {
        console.warn('Sound registration failed:', soundErr);
      }
        setSuccess('Tap-and-Pay is already enabled!');
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

      // Wait for ledger and verify
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkAutoSignStatus();

      setAutoSignEnabled(true);

      // Register sound device for sound payments
      try {
        const soundId = 'snd_' + crypto.randomUUID().slice(0,8);
        const secretKey = crypto.randomUUID();
        localStorage.setItem('yesallofus_sound_id', soundId);
        localStorage.setItem('yesallofus_sound_secret', secretKey);
        await fetch('https://api.dltpays.com/nfc/api/v1/sound/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress, sound_id: soundId, secret_key: secretKey })
        });
        console.log('🔊 Sound device registered:', soundId);
      } catch (soundErr) {
        console.warn('Sound registration failed:', soundErr);
      }
      setSuccess('Tap-and-Pay enabled! You can now pay by tapping your NFC card or using sound payments.');
      await registerSoundDevice(walletAddress);
      setTermsAccepted(false);
      onAutoSignEnabled?.();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable Tap-and-Pay';
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

      if (settingsData.needs_funding) {
        setWalletNotFunded(true);
        throw new Error('Your wallet needs to be funded first. Please add at least 2 XRP.');
      }

      if (settingsData.signer_exists) {
        setAutoSignEnabled(true);

      // Register sound device for sound payments
      try {
        const soundId = 'snd_' + crypto.randomUUID().slice(0,8);
        const secretKey = crypto.randomUUID();
        localStorage.setItem('yesallofus_sound_id', soundId);
        localStorage.setItem('yesallofus_sound_secret', secretKey);
        await fetch('https://api.dltpays.com/nfc/api/v1/sound/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress, sound_id: soundId, secret_key: secretKey })
        });
        console.log('🔊 Sound device registered:', soundId);
      } catch (soundErr) {
        console.warn('Sound registration failed:', soundErr);
      }
        setSuccess('Tap-and-Pay is already enabled!');
        setSettingUp(false);
        return;
      }

      const platformSignerAddress = settingsData.platform_signer_address;
      if (!platformSignerAddress) {
        throw new Error('Platform signer not configured');
      }

      // Build and sign SignerListSet with Crossmark
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

      const result = await sdk.methods.signAndSubmitAndWait(signerListSetTx);
      console.log('Crossmark SignerListSet result:', result);

      // Wait and verify
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkAutoSignStatus();

      setAutoSignEnabled(true);

      // Register sound device for sound payments
      try {
        const soundId = 'snd_' + crypto.randomUUID().slice(0,8);
        const secretKey = crypto.randomUUID();
        localStorage.setItem('yesallofus_sound_id', soundId);
        localStorage.setItem('yesallofus_sound_secret', secretKey);
        await fetch('https://api.dltpays.com/nfc/api/v1/sound/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress, sound_id: soundId, secret_key: secretKey })
        });
        console.log('🔊 Sound device registered:', soundId);
      } catch (soundErr) {
        console.warn('Sound registration failed:', soundErr);
      }
      setSuccess('Tap-and-Pay enabled! You can now pay by tapping your NFC card or using sound payments.');
      await registerSoundDevice(walletAddress);
      setTermsAccepted(false);
      onAutoSignEnabled?.();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable Tap-and-Pay';
      setError(message);
    }
    setSettingUp(false);
  };

  // ============================================================
  // FIXED: Revoke auto-sign - now removes signer from XRPL
  // ============================================================
  const revokeAutoSign = async () => {
    if (!confirm('Disable Tap-and-Pay?\n\nThis will remove the auto-sign permission from the XRP Ledger. You will need to set it up again to use NFC payments.')) {
      return;
    }

    setRevoking(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Check with API if revoke is needed
      const revokeRes = await fetch(`${NFC_API_URL}/customer/revoke-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const revokeData = await revokeRes.json();

      if (!revokeData.success) {
        throw new Error(revokeData.error || 'Revoke request failed');
      }

      // Already revoked on XRPL
      if (revokeData.already_revoked) {
        setAutoSignEnabled(false);
        setSuccess('Tap-and-Pay has been disabled.');
        setRevoking(false);
        return;
      }

      // Step 2: Need to sign transaction to remove signer from XRPL
      if (revokeData.needs_signature) {
        // Build the revoke transaction (SignerListSet with SignerQuorum: 0)
        const revokeTx = {
          TransactionType: 'SignerListSet',
          Account: walletAddress,
          SignerQuorum: 0,
        };

        let txHash: string | null = null;

        // Sign based on login method
        if (loginMethod === 'web3auth') {
          const { getWeb3Auth } = await import('@/lib/web3auth');
          const web3auth = await getWeb3Auth();

          if (!web3auth || !web3auth.provider) {
            throw new Error('Web3Auth session expired. Please sign in again.');
          }

          const result = await web3auth.provider.request({
            method: 'xrpl_submitTransaction',
            params: { transaction: revokeTx }
          });

          txHash = (result as any)?.result?.hash || (result as any)?.hash || null;

        } else if (loginMethod === 'crossmark') {
          const sdk = (window as any).xrpl?.crossmark;
          if (!sdk) {
            throw new Error('Crossmark wallet not detected.');
          }

          const result = await sdk.methods.signAndSubmitAndWait(revokeTx);
          txHash = result?.response?.data?.resp?.result?.hash || null;

        } else {
          throw new Error('Please use Web3Auth or Crossmark to disable Tap-and-Pay');
        }

        // Step 3: Confirm revoke with backend
        await fetch(`${NFC_API_URL}/customer/confirm-revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: walletAddress,
            tx_hash: txHash
          })
        });

        // Wait for ledger and refresh status
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkAutoSignStatus();

        setSuccess('Tap-and-Pay disabled successfully.');
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disable Tap-and-Pay';
      setError(message);
      console.error('Revoke error:', err);
    }
    setRevoking(false);
  };

  // Determine if user can enable auto-sign
  const canEnableAutoSign = loginMethod === 'web3auth' || loginMethod === 'crossmark';
  const isXaman = loginMethod === 'xaman' || (!loginMethod && !canEnableAutoSign);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400">Loading Tap-and-Pay status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${autoSignEnabled ? '' : 'grayscale opacity-50'}`}>⚡</div>
          <div>
            <h3 className="text-lg font-bold">Tap-and-Pay</h3>
            <p className="text-zinc-500 text-sm">Pay instantly by tapping your NFC card</p>
          </div>
        </div>
        {/* Status Badge */}
        {autoSignEnabled && (
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ✓ ENABLED
          </div>
        )}
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

      {/* Wallet not funded warning */}
      {walletNotFunded && !autoSignEnabled && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400">⚠️</span>
            <div>
              <p className="text-amber-400 font-medium text-sm">Wallet Not Activated</p>
              <p className="text-amber-400/70 text-xs mt-1">
                Your wallet needs at least 2 XRP to enable Tap-and-Pay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-sign enabled */}
      {autoSignEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <div>
                <p className="text-emerald-400 font-medium">Tap-and-Pay Active</p>
                <p className="text-zinc-500 text-sm">Max £{MAX_TRANSACTION} per transaction</p>
              </div>
            </div>
          </div>

          {/* Signer info */}
          {signerAddress && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-zinc-500 text-xs mb-1">Platform Signer (on XRPL)</p>
              <p className="text-zinc-400 text-xs font-mono truncate">{signerAddress}</p>
            </div>
          )}

          <p className="text-zinc-500 text-sm">
            Tap your NFC card at any YesAllOfUs vendor to pay instantly.
          </p>

          {/* REVOKE BUTTON */}
          <button
            onClick={revokeAutoSign}
            disabled={revoking}
            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 
                       text-red-400 rounded-lg font-semibold transition-all disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {revoking ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Signing transaction...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Disable Tap-and-Pay
              </>
            )}
          </button>

          <p className="text-zinc-600 text-xs text-center">
            This will remove the signer from your wallet on the XRP Ledger
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
            <p className="text-amber-400 font-medium mb-2">ℹ️ Tap-and-Pay not available with Xaman</p>
            <p className="text-zinc-400 text-sm mb-3">
              To enable instant NFC payments, please sign in with:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• <strong className="text-white">Social Login</strong> (Google, Apple, etc.) - Recommended</li>
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
              Enabling Tap-and-Pay adds YesAllOfUs as a signer on your wallet, allowing automatic RLUSD transactions up to £{MAX_TRANSACTION}.
            </p>
            <ul className="text-orange-300/80 text-xs space-y-1">
              <li>• Keep only small amounts in this wallet for daily spending</li>
              <li>• You can disable Tap-and-Pay at any time</li>
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
              disabled={!termsAccepted || settingUp || walletNotFunded}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                termsAccepted && !settingUp && !walletNotFunded
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {settingUp ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                  Signing transaction...
                </>
              ) : (
                <>⚡ Enable Tap-and-Pay</>
              )}
            </button>
          ) : (
            <button
              onClick={enableAutoSignCrossmark}
              disabled={!termsAccepted || settingUp || walletNotFunded}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                termsAccepted && !settingUp && !walletNotFunded
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {settingUp ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                  Signing transaction...
                </>
              ) : (
                <>🔐 Enable Tap-and-Pay</>
              )}
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={checkAutoSignStatus}
            className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm transition"
          >
            ↻ Refresh status
          </button>
        </div>
      )}
    </div>
  );
}