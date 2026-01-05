'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';
const NFC_API_URL = 'https://api.dltpays.com/nfc/api/v1';

interface WalletSettingsProps {
  walletAddress: string;
  loginMethod: string | null;
  socialProvider?: string | null;
  onWalletChange?: (newWallet: string, newMethod: string) => void;
  onDisconnect?: () => void;
}

// Social provider icon component
const SocialIcon = ({ provider, size = 'md' }: { provider: string | null; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  
  switch (provider?.toLowerCase()) {
    case 'google':
      return (
        <div className={`${sizeClasses} bg-white rounded-lg flex items-center justify-center`}>
          <svg className={iconSize} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      );
    case 'apple':
      return (
        <div className={`${sizeClasses} bg-black rounded-lg flex items-center justify-center border border-zinc-700`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
      );
    case 'github':
      return (
        <div className={`${sizeClasses} bg-[#24292e] rounded-lg flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </div>
      );
    case 'discord':
      return (
        <div className={`${sizeClasses} bg-[#5865F2] rounded-lg flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
      );
    case 'twitter':
      return (
        <div className={`${sizeClasses} bg-black rounded-lg flex items-center justify-center border border-zinc-700`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      );
    case 'facebook':
      return (
        <div className={`${sizeClasses} bg-[#1877F2] rounded-lg flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${sizeClasses} bg-zinc-700 rounded-lg flex items-center justify-center`}>
          <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
  }
};

export default function WalletSettings({ 
  walletAddress, 
  loginMethod, 
  socialProvider,
  onWalletChange,
  onDisconnect 
}: WalletSettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  
  // Auto-sign state
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  const [autoSignTermsAccepted, setAutoSignTermsAccepted] = useState(false);
  const [settingUpAutoSign, setSettingUpAutoSign] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  
  // Limits - £25 max single payout cap for customers
  const [maxSinglePayout, setMaxSinglePayout] = useState(25);
  const [dailyLimit, setDailyLimit] = useState(100);
  
  // Wallet status
  const [walletFunded, setWalletFunded] = useState(false);
  const [hasTrustline, setHasTrustline] = useState(false);
  
  // Xaman connection state
  const [connectingXaman, setConnectingXaman] = useState(false);
  const [xamanQR, setXamanQR] = useState<string | null>(null);
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null);
  const [loginId, setLoginId] = useState<string | null>(null);

  // Check wallet and auto-sign status on mount
  useEffect(() => {
    if (walletAddress) {
      checkWalletStatus();
      checkAutoSignStatus();
    }
  }, [walletAddress]);

  // Poll for Xaman login
  useEffect(() => {
    if (!loginId || !connectingXaman) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/xaman/login/poll/${loginId}`);
        const data = await res.json();

        if (data.status === 'signed' && data.wallet_address) {
          clearInterval(interval);
          setConnectingXaman(false);
          setXamanQR(null);
          setLoginId(null);
          
          // Update to Xaman wallet
          sessionStorage.setItem('walletAddress', data.wallet_address);
          sessionStorage.setItem('loginMethod', 'xaman');
          sessionStorage.removeItem('socialProvider');
          
          if (onWalletChange) {
            onWalletChange(data.wallet_address, 'xaman');
          }
        } else if (data.status === 'expired' || data.status === 'cancelled') {
          clearInterval(interval);
          setError(data.status === 'expired' ? 'QR code expired. Please try again.' : 'Connection cancelled.');
          setConnectingXaman(false);
          setXamanQR(null);
          setLoginId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loginId, connectingXaman, onWalletChange]);

  const checkWalletStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/wallet/status/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setWalletFunded(data.funded);
        setHasTrustline(data.rlusd_trustline);
      }
    } catch (err) {
      console.error('Failed to check wallet status:', err);
    }
  };

  const checkAutoSignStatus = async () => {
    try {
      // Check if signer is set up for this wallet
      const res = await fetch(`${NFC_API_URL}/customer/autosign-status/${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setAutoSignEnabled(data.auto_signing_enabled);
        if (data.max_single_payout) setMaxSinglePayout(data.max_single_payout);
        if (data.daily_limit) setDailyLimit(data.daily_limit);
      }
    } catch (err) {
      console.error('Failed to check auto-sign status:', err);
    }
  };

  // =========================================================================
  // SETUP AUTO-SIGN (Web3Auth) - Signs SignerListSet transaction
  // =========================================================================
  const setupAutoSignWeb3Auth = async () => {
    if (!walletAddress) return;

    setSettingUpAutoSign(true);
    setError(null);

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
        body: JSON.stringify({ 
          wallet_address: walletAddress,
          max_single_payout: maxSinglePayout,
          daily_limit: dailyLimit
        })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.error) {
        throw new Error(settingsData.error);
      }

      // Handle unfunded wallet
      if (settingsData.needs_funding) {
        setError('Your wallet needs to be funded first. Please add at least 2 XRP.');
        setSettingUpAutoSign(false);
        return;
      }

      // If signer already exists, just verify
      if (settingsData.signer_exists) {
        setAutoSignEnabled(true);
        setAutoSignTermsAccepted(false);
        setSettingUpAutoSign(false);
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

      if (!verifyData.auto_signing_enabled) {
        throw new Error('Signer setup failed. Please try again.');
      }

      setAutoSignEnabled(true);
      setAutoSignTermsAccepted(false);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable auto-sign';
      setError(message);
    }
    setSettingUpAutoSign(false);
  };

  // =========================================================================
  // REVOKE AUTO-SIGN
  // =========================================================================
  const revokeAutoSign = async () => {
    setShowRevokeModal(false);
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${NFC_API_URL}/customer/revoke-autosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress
        })
      });

      const data = await res.json();
      if (data.success) {
        setAutoSignEnabled(false);
      } else {
        setError(data.error || 'Failed to revoke auto-sign');
      }
    } catch (err) {
      setError('Failed to revoke auto-sign');
    }
    setLoading(false);
  };

  // =========================================================================
  // SWITCH TO XAMAN (Manual payments)
  // =========================================================================
  const switchToXaman = async () => {
    setConnectingXaman(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/xaman/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setConnectingXaman(false);
        return;
      }

      setXamanQR(data.qr_png);
      setXamanDeepLink(data.deep_link);
      setLoginId(data.login_id);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setConnectingXaman(false);
    }
  };

  const cancelXamanConnection = () => {
    setConnectingXaman(false);
    setXamanQR(null);
    setXamanDeepLink(null);
    setLoginId(null);
  };

  const abbreviateWallet = (addr: string) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : '';

  // Eye icon component
  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      )}
    </svg>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Payment Settings</h2>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          title={showAmounts ? 'Hide amounts' : 'Show amounts'}
        >
          <EyeIcon open={showAmounts} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 text-xs mt-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* ============================================================= */}
      {/* XAMAN QR CONNECTION SCREEN */}
      {/* ============================================================= */}
      {connectingXaman && xamanQR && (
        <div className="text-center">
          <p className="text-zinc-300 mb-4">Scan with Xaman app to switch to manual payments</p>
          <img src={xamanQR} alt="Xaman QR" className="mx-auto mb-4 rounded-lg max-w-[200px]" />
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Waiting for signature...
          </div>
          {xamanDeepLink && (
            <a href={xamanDeepLink} className="text-sky-400 text-sm hover:underline block mb-4">
              Open in Xaman app →
            </a>
          )}
          <button onClick={cancelXamanConnection} className="text-zinc-500 text-sm hover:text-white">
            ← Cancel
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* CURRENT STATUS */}
      {/* ============================================================= */}
      {!connectingXaman && (
        <>
          {/* Auto-sign enabled */}
          {autoSignEnabled ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {loginMethod === 'web3auth' ? (
                    <SocialIcon provider={socialProvider || null} />
                  ) : loginMethod === 'xaman' ? (
                    <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                  ) : (
                    <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-8 h-8 rounded" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 text-sm" style={{ textShadow: '0 0 8px rgba(34,197,94,0.9)' }}>●</span>
                      <span className="text-green-500 text-sm font-medium">Auto-Pay Active</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRevokeModal(true)}
                  disabled={loading}
                  className="text-zinc-400 hover:text-red-400 text-sm transition-colors whitespace-nowrap"
                >
                  Revoke Auto-Pay
                </button>
              </div>

              {/* Current limits display */}
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-zinc-400 text-sm mb-2">Current Limits</p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-zinc-500">Max per tap: </span>
                    <span className="text-white font-medium">{showAmounts ? `£${maxSinglePayout}` : '••••'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Daily limit: </span>
                    <span className="text-white font-medium">{showAmounts ? `£${dailyLimit}` : '••••'}</span>
                  </div>
                </div>
              </div>

              {/* Option to switch to manual */}
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-zinc-400 text-sm mb-2">Prefer manual approval?</p>
                <button
                  onClick={switchToXaman}
                  className="text-sky-400 hover:text-sky-300 text-sm"
                >
                  Switch to Xaman for manual payments →
                </button>
              </div>
            </div>
          ) : loginMethod === 'xaman' ? (
            /* Xaman connected - manual mode */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-8 h-8 rounded" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-sm" style={{ textShadow: '0 0 8px rgba(16,185,129,0.9)' }}>●</span>
                      <span className="text-emerald-500 text-sm font-medium">Manual Mode (Xaman)</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  📱 You'll receive a push notification in Xaman to approve each payment.
                </p>
              </div>

              {/* Can't enable auto-sign with Xaman - need Web3Auth */}
              <p className="text-zinc-500 text-xs">
                To enable auto-pay, sign in with a social account (Google, Apple, etc.) instead.
              </p>
            </div>
          ) : (
            /* Web3Auth connected but auto-sign not enabled - show setup */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <SocialIcon provider={socialProvider || null} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-sm" style={{ textShadow: '0 0 8px rgba(234,179,8,0.9)' }}>●</span>
                      <span className="text-yellow-500 text-sm font-medium">Setup Required</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-mono">{abbreviateWallet(walletAddress)}</p>
                  </div>
                </div>
              </div>

              {/* Wallet not ready warning */}
              {!walletFunded && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium">⚠️ Wallet Not Funded</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    Your wallet needs at least 2 XRP to enable auto-pay. Fund your wallet first.
                  </p>
                </div>
              )}

              {walletFunded && !hasTrustline && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm font-medium">⚠️ RLUSD Trustline Required</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    Add the RLUSD trustline to receive payments.
                  </p>
                </div>
              )}

              {/* Auto-sign setup section */}
              {walletFunded && hasTrustline && (
                <>
                  <h3 className="text-md font-semibold text-white">Enable Auto-Pay</h3>
                  <p className="text-zinc-400 text-sm">
                    Automatically approve tap-to-pay transactions up to your set limits.
                  </p>

                  {/* Security Notice */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-orange-400 text-sm font-bold mb-2">⚠️ Security Notice</p>
                    <p className="text-orange-300/90 text-sm mb-2">
                      Auto-pay allows YesAllofUs to process RLUSD payments from your wallet automatically.
                    </p>
                    <ul className="text-orange-300/80 text-xs space-y-1">
                      <li>• Payments are capped at £25 per transaction</li>
                      <li>• You can set a daily spending limit</li>
                      <li>• Revoke anytime from this settings page</li>
                    </ul>
                  </div>

                  {/* Limits */}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-zinc-400 text-xs block mb-1">Max per tap (£)</label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={maxSinglePayout}
                        onChange={(e) => setMaxSinglePayout(Math.min(25, parseInt(e.target.value) || 25))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                      <p className="text-zinc-600 text-xs mt-1">Max £25</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-zinc-400 text-xs block mb-1">Daily limit (£)</label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(parseInt(e.target.value) || 100)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSignTermsAccepted}
                      onChange={(e) => setAutoSignTermsAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-zinc-300 text-sm">
                      I understand that enabling auto-pay allows automatic transactions up to my set limits. I can revoke this at any time.
                    </span>
                  </label>

                  {/* Setup Button */}
                  <button
                    onClick={setupAutoSignWeb3Auth}
                    disabled={!autoSignTermsAccepted || settingUpAutoSign}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      autoSignTermsAccepted
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {settingUpAutoSign ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                        Setting up...
                      </span>
                    ) : (
                      '🔐 Enable Auto-Pay'
                    )}
                  </button>
                </>
              )}

              {/* Option to use Xaman instead */}
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-zinc-400 text-sm mb-2">Prefer manual approval for each payment?</p>
                <button
                  onClick={switchToXaman}
                  className="text-sky-400 hover:text-sky-300 text-sm"
                >
                  Switch to Xaman wallet →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Revoke Auto-Pay Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRevokeModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            {/* Icon */}
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-white text-center mb-2">Disable Auto-Pay?</h3>
            <p className="text-zinc-400 text-center mb-6">
              You will need to manually approve each payment with Xaman. You can re-enable auto-pay anytime.
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={revokeAutoSign}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable Auto-Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}