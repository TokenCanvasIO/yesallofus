'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

// Trusted exchanges - only show these
const TRUSTED_EXCHANGES = [
  'binance',
  'gdax', // Coinbase
  'kraken',
  'kucoin',
  'bybit_spot',
  'bitstamp',
  'gemini',
  'crypto_com',
  'bitfinex',
  'okex',
  'huobi',
  'gate',
  'bitget',
  'bitvavo'
];

// Fiat and stablecoin currencies we care about
const FIAT_TARGETS = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'USDT', 'USDC'];

interface Exchange {
  name: string;
  url: string;
  target: string;
  price: number;
}

interface WalletFundingProps {
  walletAddress: string;
  onFunded?: () => void;
  onTrustlineSet?: () => void;
}

export default function WalletFunding({ walletAddress, onFunded, onTrustlineSet }: WalletFundingProps) {
  const [status, setStatus] = useState<'checking' | 'unfunded' | 'funded_no_trustline' | 'ready'>('checking');
  const [xrpBalance, setXrpBalance] = useState(0);
  const [rlusdBalance, setRlusdBalance] = useState(0);
  const [hasTrustline, setHasTrustline] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [settingTrustline, setSettingTrustline] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [showExchanges, setShowExchanges] = useState(false);
  const [loadingExchanges, setLoadingExchanges] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      checkWalletStatus();
      fetchExchanges();
    }
  }, [walletAddress]);

  const fetchExchanges = async () => {
    setLoadingExchanges(true);
    try {
      const res = await fetch('https://tokencanvas.io/api/coingecko/coins/ripple/tickers');
      const data = await res.json();
      
      if (data.tickers) {
        const filtered = data.tickers
          .filter((t: any) => 
            TRUSTED_EXCHANGES.includes(t.market.identifier) && 
            FIAT_TARGETS.includes(t.target) &&
            t.trade_url
          )
          .map((t: any) => ({
            name: t.market.name,
            url: t.trade_url,
            target: t.target,
            price: t.last
          }))
          // Remove duplicates (same exchange, same fiat)
          .filter((exchange: Exchange, index: number, self: Exchange[]) => 
            index === self.findIndex(e => e.name === exchange.name && e.target === exchange.target)
          )
          // Sort by exchange name
          .sort((a: Exchange, b: Exchange) => a.name.localeCompare(b.name));
        
        setExchanges(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch exchanges:', err);
    }
    setLoadingExchanges(false);
  };

  const checkWalletStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/wallet/status/${walletAddress}`);
      const data = await res.json();

      if (data.success) {
        setXrpBalance(data.xrp_balance || 0);
        setRlusdBalance(data.rlusd_balance || 0);
        setHasTrustline(data.rlusd_trustline || false);

        if (!data.funded) {
          setStatus('unfunded');
        } else if (!data.rlusd_trustline) {
          setStatus('funded_no_trustline');
          onFunded?.();
        } else {
          setStatus('ready');
          onFunded?.();
          onTrustlineSet?.();
        }
      }
    } catch (err) {
      console.error('Failed to check wallet status:', err);
    }
    setChecking(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setTrustline = async () => {
    setSettingTrustline(true);
    try {
      // For Web3Auth, we sign via the browser
      const { getWeb3Auth } = await import('@/lib/web3auth');
      const web3auth = await getWeb3Auth();

      if (!web3auth?.provider) {
        throw new Error('Web3Auth not connected. Please refresh and try again.');
      }

      const trustlineTx = {
        TransactionType: 'TrustSet',
        Account: walletAddress,
        LimitAmount: {
          currency: 'RLUSD',
          issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
          value: '1000000'
        }
      };

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: trustlineTx }
      });

      console.log('Trustline set:', result);

      // Re-check status
      await checkWalletStatus();
    } catch (err: any) {
      console.error('Failed to set trustline:', err);
      alert(err.message || 'Failed to set trustline');
    }
    setSettingTrustline(false);
  };

  // UNFUNDED STATE
  if (status === 'unfunded') {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💰</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-orange-400 mb-2">Activate Your Wallet</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet needs at least <strong className="text-white">1 XRP</strong> to be activated on the XRP Ledger.
              Send XRP from an exchange or another wallet.
            </p>

            {/* Wallet Address */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-4">
              <p className="text-zinc-500 text-xs mb-2">Your wallet address:</p>
              <div className="flex items-center gap-2">
                <code className="text-emerald-400 text-sm font-mono flex-1">
                  {walletAddress.substring(0, 8)}...{walletAddress.slice(-6)}
                </code>
                <button
                  onClick={copyAddress}
                  className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-sm transition shrink-0"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-lg p-4 w-fit mx-auto mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${walletAddress}`}
                alt="Wallet QR Code"
                className="w-32 h-32"
              />
            </div>

            {/* Buy XRP Dropdown */}
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <p className="text-zinc-500 text-xs mb-3">Buy XRP from an exchange:</p>
              
              <div className="relative">
                <button
                  onClick={() => setShowExchanges(!showExchanges)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <img src="/XRP-logo.webp" alt="XRP" className="w-5 h-5" />
                  <span>Buy XRP Now</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showExchanges ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showExchanges && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                    {loadingExchanges ? (
                      <div className="p-4 text-center text-zinc-400">
                        <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin inline-block mr-2"></span>
                        Loading exchanges...
                      </div>
                    ) : exchanges.length > 0 ? (
                      exchanges.map((exchange, i) => (
                        
                          key={`${exchange.name}-${exchange.target}-${i}`}
                          href={exchange.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-3 hover:bg-zinc-700 transition border-b border-zinc-700 last:border-0"
                        >
                          <span className="text-white font-medium">{exchange.name}</span>
                          <span className="text-zinc-400 text-sm">
                            XRP/{exchange.target}
                          </span>
                        </a>
                      ))
                    ) : (
                      <div className="p-4 text-center text-zinc-400">
                        No exchanges available
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-zinc-600 text-xs mt-3 text-center">
                Buy XRP on any exchange, then withdraw to your wallet address above.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={checkWalletStatus}
              disabled={checking}
              className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {checking ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Checking...
                </span>
              ) : (
                '🔄 I\'ve sent XRP - Check again'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FUNDED BUT NO TRUSTLINE
  if (status === 'funded_no_trustline') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">✅</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Wallet Activated!</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet has <strong className="text-white">{xrpBalance.toFixed(2)} XRP</strong>.
              Now you need to enable <strong className="text-white">RLUSD</strong> to receive and send stablecoin payments.
            </p>

            <div className="bg-zinc-900/50 rounded-lg p-4 mb-4">
              <p className="text-zinc-500 text-xs mb-2">What is a trustline?</p>
              <p className="text-zinc-400 text-sm">
                A trustline lets your wallet hold RLUSD (Ripple's USD stablecoin). 
                This is a one-time setup that costs ~0.2 XRP in reserve.
              </p>
            </div>

            <button
              onClick={setTrustline}
              disabled={settingTrustline}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {settingTrustline ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Setting up RLUSD...
                </span>
              ) : (
                '🔓 Enable RLUSD Trustline'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // READY STATE
  if (status === 'ready') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🎉</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-emerald-400 mb-2">Wallet Ready!</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet is fully set up and ready to process affiliate payouts.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <p className="text-zinc-500 text-xs">XRP Balance</p>
                <p className="text-white font-bold">{xrpBalance.toFixed(2)} XRP</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <p className="text-zinc-500 text-xs">RLUSD Balance</p>
                <p className="text-emerald-400 font-bold">${rlusdBalance.toFixed(2)}</p>
              </div>
            </div>

            {rlusdBalance < 10 && (
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  💡 You'll need RLUSD to pay affiliate commissions. 
                  <a 
                    href="https://xrpl.org/decentralized-exchange.html" 
                    target="_blank" 
                    className="underline ml-1"
                  >
                    Swap XRP → RLUSD on the DEX
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CHECKING STATE
  return (
    <div className="bg-zinc-900/50 rounded-xl p-6">
      <div className="flex items-center justify-center gap-3">
        <span className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
        <span className="text-zinc-400">Checking wallet status...</span>
      </div>
    </div>
  );
}