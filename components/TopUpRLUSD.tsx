'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TopUpRLUSDProps {
  walletAddress: string;
  xrpBalance: number;
  rlusdBalance: number;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  onRefresh?: () => Promise<void>;
  walletType?: 'xaman' | 'crossmark' | 'web3auth' | null;
}

export default function TopUpRLUSD({
  walletAddress,
  xrpBalance,
  rlusdBalance,
  showAmounts,
  onToggleAmounts,
  onRefresh,
  walletType,
}: TopUpRLUSDProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'swap'>('card');
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardOptions = [
    {
      name: 'Guardarian',
      url: `https://guardarian.com/buy-rlusd?address=${walletAddress}`,
      description: 'No KYC for small amounts',
      methods: ['visa', 'mastercard', 'googlepay', 'applepay'] as const,
      logo: '/guardarian-blue.svg',
    },
    {
      name: 'Transak',
      url: 'https://global.transak.com/',
      description: 'Global coverage',
      methods: ['visa', 'mastercard', 'googlepay', 'applepay'] as const,
      logo: '/transak.svg',
    },
  ];

  const swapOptions = [
    {
      name: 'XPMarket DEX',
      url: 'https://xpmarket.com/dex/XRP/RLUSD-rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
      description: 'Best liquidity, easy UI',
      recommended: true,
      logo: '/XPMarketLogo.png',
    },
    {
      name: 'Magnetic X',
      url: 'https://xmagnetic.org/dex/RLUSD%2BrMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De_XRP%2BXRP',
      description: 'Real-time spread analysis',
      recommended: false,
      logo: '/XMagneticWhitelogo.png',
    },
    {
      name: 'Sologenic DEX',
      url: 'https://sologenic.org',
      description: 'AMM liquidity pools',
      recommended: false,
      logo: '/Sologeniclogo1.svg',
    },
  ];

  const cexOptions = [
    { name: 'Bitstamp', url: 'https://www.bitstamp.net/markets/xrp/rlusd/', logo: '/Bitstamp.png' },
    { name: 'Uphold', url: 'https://uphold.com', logo: '/uphold.svg' },
    { name: 'Bitrue', url: 'https://www.bitrue.com', logo: '/Bitruewhitelogo-2.png' },
    { name: 'MEXC', url: 'https://www.mexc.com', logo: '/mexc-global-logo.png' },
  ];

  return (
    <div className="space-y-6">
      {/* Low RLUSD balance warning */}
      {rlusdBalance < 10 && showAmounts && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm">
            Warning: Low balance — add RLUSD to continue paying affiliate commissions
          </p>
        </div>
      )}

      {/* Wallet address & controls */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          {walletType === 'xaman' && (
            <img src="/XamanWalletlogo.jpeg" alt="Xaman" className="w-5 h-5 rounded" />
          )}
          {walletType === 'crossmark' && (
            <img src="/CrossmarkWalletlogo.jpeg" alt="Crossmark" className="w-5 h-5 rounded" />
          )}
          <p className="text-zinc-500 text-xs">Your payout wallet:</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <code className="text-emerald-400 text-sm font-mono flex-1 min-w-0 truncate">
            {walletAddress?.substring(0, 8)}...{walletAddress?.slice(-6)}
          </code>

          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded text-xs transition"
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>

          <button
            onClick={copyAddress}
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded text-xs transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {showQR && (
          <div className="mt-5 text-center">
            <div className="inline-block bg-white p-4 rounded-lg">
              <QRCodeSVG value={walletAddress} size={180} level="M" />
            </div>
            <p className="text-zinc-500 text-xs mt-3">
              Scan to send XRP or RLUSD
            </p>
            <code className="text-emerald-400 text-xs font-mono mt-2 block break-all">
              {walletAddress}
            </code>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('card')}
          className={`py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Buy with Card
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'swap'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          XRP → RLUSD
        </button>
      </div>

      {/* Card Tab */}
      {activeTab === 'card' && (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">
            Buy RLUSD instantly with card or mobile payment:
          </p>

          {cardOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                    <img
                      src={option.logo}
                      alt={option.name}
                      className="max-w-full max-h-full object-contain p-1"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{option.name}</p>
                    <p className="text-xs text-zinc-400">{option.description}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {option.methods.map((method) => (
                  <span key={method} className="text-xs bg-zinc-700 px-2 py-1 rounded">
                    {method === 'visa' && 'Visa'}
                    {method === 'mastercard' && 'Mastercard'}
                    {method === 'googlepay' && 'Google Pay'}
                    {method === 'applepay' && 'Apple Pay'}
                  </span>
                ))}
              </div>
            </a>
          ))}

          <p className="text-xs text-zinc-500 pt-2">
            RLUSD is sent directly to the wallet address shown above.
          </p>
        </div>
      )}

      {/* Swap Tab */}
      {activeTab === 'swap' && (
        <div className="space-y-5">
          {showAmounts && (
            <>
              {xrpBalance > 1.5 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <p className="text-emerald-400 text-sm">
                    You have <strong>{xrpBalance.toFixed(2)} XRP</strong> ready to swap
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    Warning: Low XRP — send more XRP first, then swap to RLUSD
                  </p>
                </div>
              )}
            </>
          )}

          <p className="text-zinc-400 text-sm">Swap on XRPL DEX (3–5 s settlement):</p>

          <div className="space-y-3">
            {swapOptions.map((option) => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-lg transition ${
                  option.recommended
                    ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {option.logo && (
                    <img
                      src={option.logo}
                      alt={option.name}
                      className="w-10 h-10 object-contain rounded bg-white p-1"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{option.name}</span>
                      {option.recommended && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{option.description}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>

          {/* CEX section */}
          <div className="border-t border-zinc-800 pt-5">
            <p className="text-xs text-zinc-500 mb-3">For larger amounts — centralized exchanges:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cexOptions.map((ex) => (
                <a
                  key={ex.name}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-xs transition"
                >
                  {ex.logo && <img src={ex.logo} alt={ex.name} className="w-5 h-5 object-contain" />}
                  <span>{ex.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 text-sm">
            <p className="font-medium text-zinc-300 mb-2">How to swap:</p>
            <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
              <li>Click one of the links above</li>
              <li>Connect your XRPL wallet</li>
              <li>Swap XRP to RLUSD</li>
              <li>Send RLUSD to the payout address shown at the top</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}