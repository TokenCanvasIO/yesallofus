'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://api.dltpays.com/api/v1';

// RLUSD is 5 chars, so must be hex-encoded (padded to 40 chars) for XRPL
const RLUSD_HEX = '524C555344000000000000000000000000000000';
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';

const TRUSTED_EXCHANGES = [
  'binance',
  'gdax',
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
  'bitvavo',
];

const FIAT_TARGETS = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'USDT', 'USDC'];

// Exchange logo URLs (using CoinGecko/public CDNs)
const EXCHANGE_LOGOS: Record<string, string> = {
  'Binance': 'https://assets.coingecko.com/markets/images/52/small/binance.jpg',
  'Coinbase Exchange': 'https://assets.coingecko.com/markets/images/23/small/Coinbase_Coin_Primary.png',
  'Kraken': 'https://assets.coingecko.com/markets/images/29/small/kraken.jpg',
  'KuCoin': 'https://assets.coingecko.com/markets/images/61/small/kucoin.png',
  'Bybit': 'https://assets.coingecko.com/markets/images/698/small/bybit_spot.png',
  'Bitstamp': 'https://assets.coingecko.com/markets/images/9/small/bitstamp.jpg',
  'Gemini': 'https://assets.coingecko.com/markets/images/50/small/gemini.png',
  'Crypto.com Exchange': 'https://assets.coingecko.com/markets/images/589/small/crypto_com.jpg',
  'Bitfinex': 'https://assets.coingecko.com/markets/images/4/small/bitfinex.jpg',
  'OKX': 'https://assets.coingecko.com/markets/images/96/small/okx.png',
  'Huobi': 'https://assets.coingecko.com/markets/images/25/small/huobi.jpg',
  'Gate.io': 'https://assets.coingecko.com/markets/images/60/small/gate_io.jpg',
  'Bitget': 'https://assets.coingecko.com/markets/images/540/small/bitget.png',
  'Bitvavo': 'https://assets.coingecko.com/markets/images/505/small/bitvavo.png',
  'Uphold': 'https://assets.coingecko.com/markets/images/410/small/uphold.png',
  'MoonPay': 'https://assets.coingecko.com/markets/images/540/small/moonpay.png',
  'Changelly': 'https://assets.coingecko.com/markets/images/103/small/changelly.png',
  'ChangeNOW': 'https://assets.coingecko.com/markets/images/364/small/changenow.png',
  'Transak': 'https://assets.coingecko.com/markets/images/741/small/transak.png',
  'Guardarian': 'https://assets.coingecko.com/markets/images/651/small/guardarian.png',
  'Simplex': 'https://assets.coingecko.com/markets/images/496/small/simplex.png',
  'ChangeHero': 'https://assets.coingecko.com/markets/images/363/small/changehero.png',
};

// Inline SVG components for payment methods
const GooglePayIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
  </svg>
);

const ApplePayIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.078 23.55c-.473-.316-.893-.703-1.244-1.15-.383-.463-.738-.95-1.064-1.454-.766-1.12-1.365-2.345-1.78-3.636-.5-1.502-.743-2.94-.743-4.347 0-1.57.34-2.94 1.002-4.09.49-.9 1.22-1.653 2.1-2.182.85-.53 1.84-.82 2.84-.84.35 0 .73.05 1.13.15.29.08.64.21 1.07.37.55.21.85.34.95.37.32.12.59.17.8.17.16 0 .39-.05.645-.13.145-.05.42-.14.81-.31.386-.14.692-.26.935-.35.37-.11.728-.21 1.05-.26.39-.06.777-.08 1.148-.05.71.05 1.36.2 1.94.42 1.02.41 1.843 1.05 2.457 1.96-.26.16-.5.346-.725.55-.487.43-.9.94-1.23 1.505-.43.77-.65 1.64-.644 2.52.015 1.083.29 2.035.84 2.86.387.6.904 1.114 1.534 1.536.31.21.582.355.84.45-.12.375-.252.74-.405 1.1-.347.807-.76 1.58-1.25 2.31-.432.63-.772 1.1-1.03 1.41-.402.48-.79.84-1.18 1.097-.43.285-.935.436-1.452.436-.35.015-.7-.03-1.034-.127-.29-.095-.576-.202-.856-.323-.293-.134-.596-.248-.905-.34-.38-.1-.77-.148-1.164-.147-.4 0-.79.05-1.16.145-.31.088-.61.196-.907.325-.42.175-.695.29-.855.34-.324.096-.656.154-.99.175-.52 0-1.004-.15-1.486-.45zm6.854-18.46c-.68.34-1.326.484-1.973.436-.1-.646 0-1.31.27-2.037.24-.62.56-1.18 1-1.68.46-.52 1.01-.95 1.63-1.26.66-.34 1.29-.52 1.89-.55.08.68 0 1.35-.25 2.07-.228.64-.568 1.23-1 1.76-.435.52-.975.95-1.586 1.26z"/>
  </svg>
);

const VisaIcon = () => (
  <svg className="w-6 h-4" viewBox="0 0 48 16" fill="none">
    <path d="M17.545 1.027L11.636 14.973H7.91L5.036 3.927c-.173-.673-.327-.918-.855-1.2C3.29 2.254 1.827 1.782 0 1.473l.091-.446h6.182c.836 0 1.545.554 1.709 1.509l1.527 8.127 3.782-9.636h3.254zM34.727 10.218c.014-3.6-4.982-3.8-4.945-5.409.009-.491.473-.991 1.491-1.127.5-.064 1.882-.118 3.454.618l.618-2.873a9.46 9.46 0 00-3.273-.6c-3.455 0-5.882 1.836-5.909 4.464-.027 1.945 1.736 3.027 3.064 3.673 1.363.664 1.818 1.09 1.818 1.681-.009.909-1.091 1.309-2.1 1.327-1.764.027-2.782-.473-3.6-.855l-.636 2.973c.818.373 2.327.7 3.891.718 3.673 0 6.073-1.818 6.127-4.59zM44.145 14.973H47.2L44.527 1.027H41.6c-.709 0-1.309.409-1.573 1.045l-5.545 13.9h3.873l.764-2.118h4.727l.3 2.119zm-4.118-5.027l1.945-5.364 1.118 5.364h-3.063zM25.636 1.027l-2.836 13.946h-3.509l2.836-13.946h3.509z" fill="#1A1F71"/>
  </svg>
);

const MastercardIcon = () => (
  <svg className="w-6 h-4" viewBox="0 0 48 30" fill="none">
    <circle cx="18" cy="15" r="12" fill="#EB001B"/>
    <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
    <path d="M24 5.6c2.8 2.2 4.6 5.6 4.6 9.4s-1.8 7.2-4.6 9.4c-2.8-2.2-4.6-5.6-4.6-9.4s1.8-7.2 4.6-9.4z" fill="#FF5F00"/>
  </svg>
);

interface Exchange {
  name: string;
  url: string;
  target: string;
  price: number;
  supportsGooglePay: boolean;
  supportsApplePay: boolean;
  supportsVisa: boolean;
  supportsMastercard: boolean;
  logoUrl?: string;
}

interface WalletFundingProps {
  walletAddress: string;
  onFunded?: () => void;
  onTrustlineSet?: () => void;
}

export default function WalletFunding({
  walletAddress,
  onFunded,
  onTrustlineSet,
}: WalletFundingProps) {
  const [status, setStatus] = useState<'checking' | 'unfunded' | 'funded_no_trustline' | 'ready'>('checking');
  const [xrpBalance, setXrpBalance] = useState(0);
  const [rlusdBalance, setRlusdBalance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [settingTrustline, setSettingTrustline] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [showExchanges, setShowExchanges] = useState(false);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  // Re-authentication modal state
const [showReauthModal, setShowReauthModal] = useState(false);
const [reauthing, setReauthing] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      checkWalletStatus();
      fetchExchanges();
    }
  }, [walletAddress]);

  const getManualExchanges = (): Exchange[] => [
    {
      name: 'Uphold',
      url: 'https://uphold.com/assets/crypto/buy-xrp',
      target: 'USD',
      price: 0,
      supportsGooglePay: true,
      supportsApplePay: true,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['Uphold'],
    },
    {
      name: 'MoonPay',
      url: 'https://www.moonpay.com/buy/xrp',
      target: 'USD',
      price: 0,
      supportsGooglePay: true,
      supportsApplePay: true,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['MoonPay'],
    },
    {
      name: 'Changelly',
      url: 'https://changelly.com/buy/xrp',
      target: 'USD',
      price: 0,
      supportsGooglePay: false,
      supportsApplePay: false,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['Changelly'],
    },
    {
      name: 'ChangeNOW',
      url: 'https://changenow.io/buy/ripple',
      target: 'USD',
      price: 0,
      supportsGooglePay: false,
      supportsApplePay: false,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['ChangeNOW'],
    },
    {
      name: 'Transak',
      url: 'https://global.transak.com/?cryptoCurrencyCode=XRP',
      target: 'USD',
      price: 0,
      supportsGooglePay: true,
      supportsApplePay: true,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['Transak'],
    },
    {
      name: 'Guardarian',
      url: 'https://guardarian.com/buy-xrp',
      target: 'USD',
      price: 0,
      supportsGooglePay: false,
      supportsApplePay: true,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['Guardarian'],
    },
    {
      name: 'Simplex',
      url: 'https://www.simplex.com/',
      target: 'USD',
      price: 0,
      supportsGooglePay: false,
      supportsApplePay: true,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['Simplex'],
    },
    {
      name: 'ChangeHero',
      url: 'https://changehero.io/buy/xrp',
      target: 'USD',
      price: 0,
      supportsGooglePay: false,
      supportsApplePay: false,
      supportsVisa: true,
      supportsMastercard: true,
      logoUrl: EXCHANGE_LOGOS['ChangeHero'],
    },
  ];

  const fetchExchanges = async () => {
    setLoadingExchanges(true);
    try {
      const res = await fetch('/api/exchanges');
      const data = await res.json();

      const manualExchanges = getManualExchanges();

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
            price: t.last,
            supportsGooglePay: false,
            supportsApplePay: false,
            supportsVisa: true,
            supportsMastercard: true,
            logoUrl: EXCHANGE_LOGOS[t.market.name] || null,
          }))
          .filter((exchange: Exchange, index: number, self: Exchange[]) =>
            index === self.findIndex((e) => e.name === exchange.name && e.target === exchange.target)
          )
          .sort((a: Exchange, b: Exchange) => a.name.localeCompare(b.name));

        setExchanges([...manualExchanges, ...filtered]);
      } else {
        setExchanges(manualExchanges);
      }
    } catch (err) {
      console.error('Failed to fetch exchanges:', err);
      setExchanges(getManualExchanges());
    } finally {
      setLoadingExchanges(false);
    }
  };

  const checkWalletStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/wallet/status/${walletAddress}`);
      const data = await res.json();

      if (data.success) {
        setXrpBalance(data.xrp_balance || 0);
        setRlusdBalance(data.rlusd_balance || 0);

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
    } finally {
      setChecking(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setTrustline = async () => {
  setSettingTrustline(true);
  try {
    const { getWeb3Auth } = await import('@/lib/web3auth');
    const web3auth = await getWeb3Auth();

    // Check if Web3Auth session is still active
    if (!web3auth?.connected || !web3auth?.provider) {
      setSettingTrustline(false);
      setShowReauthModal(true);
      return;
    }

      // Use hex-encoded RLUSD currency code (required for 5-char currency names)
      const trustlineTx = {
        TransactionType: 'TrustSet' as const,
        Account: walletAddress,
        LimitAmount: {
          currency: RLUSD_HEX,
          issuer: RLUSD_ISSUER,
          value: '1000000',
        },
      };

      const result = await web3auth.provider.request({
        method: 'xrpl_submitTransaction',
        params: { transaction: trustlineTx },
      });

      console.log('Trustline set:', result);
      await checkWalletStatus();
    } catch (err: any) {
      console.error('Failed to set trustline:', err);
      alert(err.message || 'Failed to set trustline');
    } finally {
      setSettingTrustline(false);
    }
  };

  const handleReauthAndRetry = async () => {
  setReauthing(true);
  try {
    const { getWeb3Auth } = await import('@/lib/web3auth');
    const web3auth = await getWeb3Auth();
    
    if (web3auth) {
      const provider = await web3auth.connect();
      
      // Only proceed if we got a provider back
      if (provider) {
        setShowReauthModal(false);
        // Small delay then retry
        setTimeout(() => setTrustline(), 500);
      } else {
        throw new Error('No provider returned');
      }
    }
  } catch (err) {
    console.error('Re-auth failed:', err);
    alert('Failed to reconnect. Please try again.');
  }
  setReauthing(false);
};

  // Loading state
  if (status === 'checking') {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <span className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
          <span className="text-zinc-400">Checking wallet status...</span>
        </div>
      </div>
    );
  }

  // Unfunded wallet
  if (status === 'unfunded') {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💰</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Activate Your Wallet</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet needs at least <strong className="text-white">1.5 XRP</strong> to be activated on the XRP Ledger
              and set up the RLUSD trustline.
              Send XRP from an exchange or another wallet.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-blue-400 text-sm">
                <strong>Why 1.5 XRP?</strong> 1 XRP activates your wallet + 0.2 XRP reserves the RLUSD trustline + buffer for transaction fees.
              </p>
            </div>

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

            <div className="bg-white rounded-lg p-4 w-fit mx-auto mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${walletAddress}`}
                alt="Wallet QR Code"
                className="w-32 h-32"
              />
            </div>

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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
                    {loadingExchanges ? (
                      <div className="p-4 text-center text-zinc-400">
                        <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin inline-block mr-2"></span>
                        Loading exchanges...
                      </div>
                    ) : exchanges.length > 0 ? (
                      exchanges.map((exchange, i) => (
                        <a
                          key={`${exchange.name}-${exchange.target}-${i}`}
                          href={exchange.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-3 hover:bg-zinc-700 transition border-b border-zinc-700 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {/* Exchange Logo */}
                            {exchange.logoUrl ? (
                              <img 
                                src={exchange.logoUrl} 
                                alt={exchange.name} 
                                className="w-6 h-6 rounded-full object-cover bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-bold text-white">
                                {exchange.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-white font-medium">{exchange.name}</span>
                            
                            {/* Payment Method Icons */}
                            <div className="flex items-center gap-1 ml-2">
                              {exchange.supportsGooglePay && (
                                <span title="Google Pay" className="opacity-70 hover:opacity-100">
                                  <GooglePayIcon />
                                </span>
                              )}
                              {exchange.supportsApplePay && (
                                <span title="Apple Pay" className="opacity-70 hover:opacity-100 text-white">
                                  <ApplePayIcon />
                                </span>
                              )}
                              {exchange.supportsVisa && (
                                <span title="Visa" className="opacity-70 hover:opacity-100">
                                  <VisaIcon />
                                </span>
                              )}
                              {exchange.supportsMastercard && (
                                <span title="Mastercard" className="opacity-70 hover:opacity-100">
                                  <MastercardIcon />
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-zinc-400 text-sm">XRP/{exchange.target}</span>
                        </a>
                      ))
                    ) : (
                      <div className="p-4 text-center text-zinc-400">No exchanges available</div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-zinc-600 text-xs mt-3 text-center">
                Buy at least 1.5 XRP on any exchange, then withdraw to your wallet address above.
              </p>
            </div>

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
                "🔄 I've sent XRP - Check again"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Funded but no trustline
  if (status === 'funded_no_trustline') {
    // Check if they have enough for trustline (need 0.2 XRP reserve + some for fees)
    const needsMoreXrp = xrpBalance < 1.2;
    
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

            {needsMoreXrp && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm font-bold mb-1">⚠️ Need More XRP</p>
                <p className="text-yellow-300/80 text-sm">
                  Setting up a trustline requires 0.2 XRP reserve. You currently have {xrpBalance.toFixed(2)} XRP.
                  Please add at least {(1.3 - xrpBalance).toFixed(2)} more XRP to proceed.
                </p>
              </div>
            )}

            <div className="bg-zinc-900/50 rounded-lg p-4 mb-4">
              <p className="text-zinc-500 text-xs mb-2">What is a trustline?</p>
              <p className="text-zinc-400 text-sm">
                A trustline lets your wallet hold RLUSD (Ripple USD stablecoin). This is a one-time setup that costs ~0.2 XRP in reserve.
              </p>
            </div>

            <button
              onClick={setTrustline}
              disabled={settingTrustline || needsMoreXrp}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingTrustline ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Setting up RLUSD...
                </span>
              ) : needsMoreXrp ? (
                '⚠️ Add more XRP first'
              ) : (
                '🔓 Enable RLUSD Trustline'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready state
  if (status === 'ready') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🎉</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-emerald-400 mb-2">Wallet Ready!</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Your wallet is fully set up and ready to receive affiliate payouts.
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
                  💡 You need RLUSD to pay affiliate commissions.{' '}
                  <a href="https://xrpl.org/decentralized-exchange.html" target="_blank" rel="noopener noreferrer" className="underline ml-1">
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

  {/* Re-authentication Modal */}
  if (showReauthModal) {
    return (
      <>
        {/* Show the current funding status underneath */}
        {status === 'funded_no_trustline' && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-4 opacity-50">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Wallet Activated!</h3>
                <p className="text-zinc-400 text-sm">
                  Your wallet has <strong className="text-white">{xrpBalance.toFixed(2)} XRP</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal Overlay */}
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">Session Expired</h3>
              <p className="text-zinc-400 mb-4">
                For your security, social login sessions expire after you close the browser or after some time passes.
              </p>
              <p className="text-zinc-400 mb-6">
                Please sign in again with the <strong className="text-white">same social account</strong> to set up the RLUSD trustline.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleReauthAndRetry}
                  disabled={reauthing}
                  className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {reauthing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Connecting...
                    </>
                  ) : (
                    '🔑 Sign In Again'
                  )}
                </button>
                
                <button
                  onClick={() => setShowReauthModal(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-zinc-500 text-xs mt-4">
                Your wallet address and XRP balance are safe — we just need to reconnect to sign the trustline transaction.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}