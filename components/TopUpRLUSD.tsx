'use client';

import { useState } from 'react';

interface TopUpRLUSDProps {
  walletAddress: string;
  xrpBalance: number;
  rlusdBalance: number;
  showAmounts: boolean;
}

export default function TopUpRLUSD({ walletAddress, xrpBalance, rlusdBalance, showAmounts }: TopUpRLUSDProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'swap'>('card');

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct RLUSD purchase options (card/Google Pay/Apple Pay)
  const cardOptions = [
    {
      name: 'Guardarian',
      url: `https://guardarian.com/buy-rlusd?address=${walletAddress}`,
      description: 'No KYC for small amounts',
      methods: ['visa', 'mastercard', 'googlepay', 'applepay'],
      logo: '/guardarian-blue.svg',
    },
    {
      name: 'Transak',
      url: `https://global.transak.com/?cryptoCurrencyCode=RLUSD&walletAddress=${walletAddress}`,
      description: 'Global coverage',
      methods: ['visa', 'mastercard', 'googlepay', 'applepay'],
      logo: '/transak.svg',
    },
  ];

  // XRP to RLUSD swap options (DEX)
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
  logo: '/Sologeniclogo1.png',
},
  ];

  // CEX options for larger trades
  const cexOptions = [
    {
      name: 'Bitstamp',
      url: 'https://www.bitstamp.net/markets/xrp/rlusd/',
      description: 'EU/US regulated, low fees',
      logo: '/Bitstamp.png',
    },
    {
      name: 'Uphold',
      url: 'https://uphold.com',
      description: 'Instant conversions',
      logo: '/uphold.svg',
    },
    {
      name: 'Bitrue',
      url: 'https://www.bitrue.com',
      description: 'XRPL native support',
      logo: '/Bitruewhitelogo-2.png',
    },
    {
      name: 'MEXC',
      url: 'https://www.mexc.com',
      description: 'High liquidity',
      logo: '/mexc-global-logo.png',
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-bold">💰 Top Up RLUSD</h2>
  <div className="text-right">
    <p className="text-zinc-500 text-xs">Current Balance</p>
    <div className="flex items-center gap-3">
      <p className="text-white font-bold">{showAmounts ? `${xrpBalance.toFixed(2)} XRP` : '••••'}</p>
      <p className="text-emerald-400 font-bold">{showAmounts ? `$${rlusdBalance.toFixed(2)} RLUSD` : '••••'}</p>
    </div>
  </div>
</div>

      {rlusdBalance < 10 && showAmounts && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
    <p className="text-yellow-400 text-sm">
      ⚠️ Low balance — add RLUSD to pay affiliate commissions
    </p>
  </div>
)}

      {/* Wallet Address */}
      <div className="bg-zinc-800 rounded-lg p-3 mb-4">
        <p className="text-zinc-500 text-xs mb-1">Your payout wallet:</p>
        <div className="flex items-center gap-2">
          <code className="text-emerald-400 text-sm font-mono flex-1">
  {walletAddress.substring(0, 8)}...{walletAddress.slice(-6)}
</code>
          <button
            onClick={copyAddress}
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-xs transition shrink-0"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
            activeTab === 'card'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          💳 Buy with Card
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
            activeTab === 'swap'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          🔄 Swap XRP → RLUSD
        </button>
      </div>

      {/* Card Purchase Tab */}
      {activeTab === 'card' && (
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm mb-3">
            Buy RLUSD directly with Visa, Mastercard, Google Pay, or Apple Pay:
          </p>

          {cardOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <img
                    src={option.logo}
                    alt={option.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-medium">{option.name}</p>
                  <p className="text-zinc-500 text-xs">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Payment method icons */}
                <div className="flex gap-1">
                  {option.methods.includes('visa') && (
                    <span className="text-xs bg-zinc-700 px-1.5 py-0.5 rounded">Visa</span>
                  )}
                  {option.methods.includes('googlepay') && (
                    <span className="text-xs bg-zinc-700 px-1.5 py-0.5 rounded">GPay</span>
                  )}
                  {option.methods.includes('applepay') && (
                    <span className="text-xs bg-zinc-700 px-1.5 py-0.5 rounded">Apple</span>
                  )}
                </div>
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}

          <p className="text-zinc-600 text-xs mt-2">
            RLUSD will be sent directly to your wallet address above.
          </p>
        </div>
      )}

      {/* Swap Tab */}
      {activeTab === 'swap' && (
        <div className="space-y-4">
          {/* Current XRP balance notice */}
          {xrpBalance > 1.5 && showAmounts && (
  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
    <p className="text-emerald-400 text-sm">
      ✓ You have <strong>{xrpBalance.toFixed(2)} XRP</strong> available to swap
    </p>
  </div>
)}

{xrpBalance <= 1.5 && showAmounts && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
    <p className="text-yellow-400 text-sm">
      ⚠️ You have <strong>{xrpBalance.toFixed(2)} XRP</strong> — send more XRP first, then swap to RLUSD
    </p>
  </div>
)}

          <p className="text-zinc-400 text-sm">
            Swap XRP to RLUSD on the XRPL DEX (3-5 second settlement):
          </p>

          {/* DEX Options */}
<div className="space-y-2">
  {swapOptions.map((option) => (
    <a
      key={option.name}
      href={option.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between p-3 rounded-lg transition ${
        option.recommended
          ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'
          : 'bg-zinc-800 hover:bg-zinc-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {option.logo && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
            <img
              src={option.logo}
              alt={option.name}
              className="w-6 h-6 object-contain"
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{option.name}</p>
            {option.recommended && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-xs">{option.description}</p>
        </div>
      </div>
      <svg
        className="w-5 h-5 text-zinc-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </a>
  ))}
</div>

          {/* CEX Options for larger trades */}
<div className="border-t border-zinc-800 pt-4 mt-4">
  <p className="text-zinc-500 text-xs mb-3">
    For larger trades (centralized exchanges):
  </p>
  <div className="flex flex-wrap gap-2">
    {cexOptions.map((option) => (
      <a
        key={option.name}
        href={option.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition flex items-center gap-2"
      >
        {option.logo && (
          <img
            src={option.logo}
            alt={option.name}
            className="w-4 h-4 object-contain"
          />
        )}
        <span>{option.name}</span>
      </a>
    ))}
  </div>
</div>

          {/* How to swap instructions */}
          <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
            <p className="text-zinc-400 text-sm font-medium mb-2">How to swap:</p>
            <ol className="text-zinc-500 text-xs space-y-1 list-decimal list-inside">
  <li>Click a Exchange link above</li>
  <li>Connect any XRPL wallet (or use your existing exchange account)</li>
  <li>Enter the amount of XRP to swap</li>
  <li>Send the RLUSD to your payout wallet address above</li>
</ol>
          </div>
        </div>
      )}
    </div>
  );
}