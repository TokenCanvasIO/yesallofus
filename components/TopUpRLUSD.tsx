'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TopUpRLUSDProps {
  walletAddress: string;
  xrpBalance: number;
  rlusdBalance: number;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  onRefresh?: () => void;
}

export default function TopUpRLUSD({
  walletAddress,
  xrpBalance,
  rlusdBalance,
  showAmounts,
  onToggleAmounts,
  onRefresh,
}: TopUpRLUSDProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'swap'>('card');
  const [showQR, setShowQR] = useState(false);

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Top Up RLUSD</h2>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleAmounts}
            className="text-zinc-400 hover:text-white p-1"
            title={showAmounts ? 'Hide balances' : 'Show balances'}
          >
            {showAmounts ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>

          {onRefresh && (
            <button onClick={onRefresh} className="text-zinc-400 hover:text-white p-1" title="Refresh">
            </button>
          )}

          <div className="text-right">
            <p className="text-zinc-500 text-xs">Current Balance</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white font-bold">
                {showAmounts ? `${xrpBalance.toFixed(2)} XRP` : '••••••'}
              </span>
              <span className="text-emerald-400 font-bold">
                {showAmounts ? `$${rlusdBalance.toFixed(2)} RLUSD` : '••••••'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low balance warning */}
      {rlusdBalance < 10 && showAmounts && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <p className="text-yellow-400 text-sm">
            Warning: Low balance — add RLUSD to continue paying affiliate commissions
          </p>
        </div>
      )}

      {/* Wallet address section */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-6">
        <p className="text-zinc-500 text-xs mb-2">Your payout wallet:</p>
        <div className="flex items-center gap-3">
          <code className="text-emerald-400 text-sm font-mono flex-1">
            {walletAddress.substring(0, 8)}...{walletAddress.slice(-6)}
          </code>
          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded text-xs"
          >
            {showQR ? 'Hide QR' : 'QR'}
          </button>
          <button
            onClick={copyAddress}
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded text-xs"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {showQR && (
          <div className="mt-4 text-center">
            <div className="inline-block bg-white p-4 rounded-lg">
              <QRCodeSVG value={walletAddress} size={180} level="M" />
            </div>
            <p className="text-zinc-500 text-xs mt-3 block">
              Scan to send XRP or RLUSD
            </p>
            <code className="text-emerald-400 text-xs font-mono mt-2 block">
              {walletAddress}
            </code>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Buy with Card
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'swap'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Swap XRP to RLUSD
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
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
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

              <div className="flex gap-2 mt-3">
                {option.methods.map((m) => (
                  <span key={m} className="text-xs bg-zinc-700 px-2 py-1 rounded">
                    {m === 'visa' && 'Visa'}
                    {m === 'mastercard' && 'Mastercard'}
                    {m === 'googlepay' && 'Google Pay'}
                    {m === 'applepay' && 'Apple Pay'}
                  </span>
                ))}
              </div>
            </a>
          ))}

          <p className="text-xs text-zinc-500">
            RLUSD is sent directly to the wallet address shown above.
          </p>
        </div>
      )}

      {/* Swap Tab */}
      {activeTab === 'swap' && (
        <div className="space-y-5">
          {xrpBalance > 1.5 && showAmounts && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-emerald-400 text-sm">
                You have <strong>{xrpBalance.toFixed(2)} XRP</strong> ready to swap
              </p>
            </div>
          )}

          {xrpBalance <= 1.5 && showAmounts && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                Warning: Low XRP — send more XRP first, then swap to RLUSD
              </p>
            </div>
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
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
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

          <div className="border-t border-zinc-800 pt-5">
            <p className="text-xs text-zinc-500 mb-3">For larger amounts — centralized exchanges:</p>
            <div className="flex flex-wrap gap-3">
              {cexOptions.map((ex) => (
                <a
                  key={ex.name}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition"
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