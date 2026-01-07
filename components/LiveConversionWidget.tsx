'use client';

import { useState, useEffect, useCallback } from 'react';

interface ConversionData {
  success: boolean;
  gbp: number;
  rlusd: number;
  rate: {
    rlusd_gbp: number;
    rlusd_usd: number;
    gbp_to_rlusd: number;
    source: string;
    source_url: string;
    aggregated_from: string;
  };
  timestamp: string;
  price_fetched_at: string;
  price_age_ms: number;
  compliance: {
    standard: string;
    data_source: string;
    manipulation_resistant: boolean;
    jurisdiction: string;
  };
}

interface LiveConversionWidgetProps {
  initialGbpAmount?: number;
  onConversionComplete?: (data: ConversionData) => void;
  compact?: boolean;
  showCompliance?: boolean;
}

export default function LiveConversionWidget({
  initialGbpAmount = 0,
  onConversionComplete,
  compact = false,
  showCompliance = true
}: LiveConversionWidgetProps) {
  const [gbpAmount, setGbpAmount] = useState(initialGbpAmount);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [priceAge, setPriceAge] = useState<number>(0);
  const [pulseActive, setPulseActive] = useState(false);

  // Fetch conversion
  const fetchConversion = useCallback(async (amount: number) => {
    if (amount <= 0) {
      setConversionData(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.dltpays.com/convert/gbp-to-rlusd?amount=${amount}&capture=true`
      );
      const data = await res.json();

      if (data.success) {
        setConversionData(data);
        setLastUpdate(new Date());
        setPriceAge(data.price_age_ms);
        setPulseActive(true);
        setTimeout(() => setPulseActive(false), 500);

        if (onConversionComplete) {
          onConversionComplete(data);
        }
      }
    } catch (err) {
      console.error('Conversion error:', err);
    }
    setIsLoading(false);
  }, [onConversionComplete]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (gbpAmount > 0) {
      fetchConversion(gbpAmount);
      const interval = setInterval(() => fetchConversion(gbpAmount), 10000);
      return () => clearInterval(interval);
    }
  }, [gbpAmount, fetchConversion]);

  // Update price age counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        setPriceAge(Date.now() - lastUpdate.getTime());
      }
    }, 100);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Format price age
  const formatPriceAge = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m`;
  };

  // Get freshness color
  const getFreshnessColor = (ms: number) => {
    if (ms < 5000) return '#10b981'; // Green - very fresh
    if (ms < 15000) return '#f59e0b'; // Amber - getting stale
    return '#ef4444'; // Red - stale
  };

  if (compact) {
    return (
      <div className="live-conversion-compact">
        <style jsx>{`
          .live-conversion-compact {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
            border: 1px solid #30363d;
            border-radius: 8px;
            font-family: 'SF Mono', 'Fira Code', monospace;
          }
          .gecko-icon {
            width: 20px;
            height: 20px;
          }
          .rate-display {
            color: #8cc63f;
            font-size: 13px;
            font-weight: 600;
          }
          .live-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}</style>
        <img 
          src="https://static.coingecko.com/s/coingecko-branding-guide-8447de673439420efa0ab1e0e03a1f8b0137c3f142f84f5c41b7fb3cc37eb605.png" 
          alt="CoinGecko" 
          className="gecko-icon"
        />
        <span className="rate-display">
          £1 = {conversionData ? conversionData.rate.gbp_to_rlusd.toFixed(4) : '...'} RLUSD
        </span>
        <div className="live-dot" />
      </div>
    );
  }

  return (
    <div className="live-conversion-widget">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .live-conversion-widget {
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(165deg, #0a0f0d 0%, #0d1810 50%, #081510 100%);
          border: 1px solid rgba(140, 198, 63, 0.2);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          max-width: 420px;
        }

        .live-conversion-widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8cc63f, transparent);
          opacity: 0.6;
        }

        .live-conversion-widget::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(140, 198, 63, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .coingecko-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .coingecko-logo {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 0 8px rgba(140, 198, 63, 0.3));
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .powered-by {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .coingecko-name {
          font-size: 14px;
          font-weight: 600;
          color: #8cc63f;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% { 
            opacity: 0.7; 
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }

        .live-text {
          font-size: 11px;
          font-weight: 600;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Conversion Display */
        .conversion-display {
          background: linear-gradient(135deg, rgba(140, 198, 63, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
          border: 1px solid rgba(140, 198, 63, 0.15);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .rate-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .currency-amount {
          font-family: 'JetBrains Mono', monospace;
        }

        .gbp-amount {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
        }

        .gbp-symbol {
          color: #6b7280;
        }

        .equals {
          font-size: 24px;
          color: #4b5563;
        }

        .rlusd-amount {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #8cc63f 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: transform 0.3s ease;
        }

        .rlusd-amount.pulse {
          animation: pricePulse 0.5s ease-out;
        }

        @keyframes pricePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .rlusd-label {
          font-size: 14px;
          color: #8cc63f;
          font-weight: 600;
        }

        /* Rate Details */
        .rate-details {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(140, 198, 63, 0.1);
        }

        .rate-item {
          text-align: center;
        }

        .rate-label {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .rate-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #d1d5db;
          font-weight: 500;
        }

        /* Freshness Indicator */
        .freshness-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .freshness-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .freshness-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .freshness-label {
          font-size: 12px;
          color: #9ca3af;
        }

        .freshness-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        /* Compliance Badge */
        .compliance-section {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .compliance-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .shield-icon {
          width: 16px;
          height: 16px;
          color: #3b82f6;
        }

        .compliance-title {
          font-size: 11px;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .compliance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .compliance-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .compliance-key {
          font-size: 9px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .compliance-value {
          font-size: 11px;
          color: #d1d5db;
          font-weight: 500;
        }

        /* Slippage Notice */
        .slippage-notice {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
          border: 1px solid rgba(251, 191, 36, 0.15);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .slippage-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          color: #fbbf24;
          opacity: 0.8;
        }

        .slippage-icon svg {
          width: 100%;
          height: 100%;
        }

        .slippage-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .slippage-title {
          font-size: 11px;
          font-weight: 600;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .slippage-text {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.5;
        }

        /* Footer */
        .widget-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(140, 198, 63, 0.1);
        }

        .exchanges-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(140, 198, 63, 0.1);
          border-radius: 12px;
        }

        .exchanges-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          color: #8cc63f;
        }

        .exchanges-label {
          font-size: 10px;
          color: #6b7280;
        }

        /* Loading State */
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 13, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(140, 198, 63, 0.2);
          border-top-color: #8cc63f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Input Section */
        .input-section {
          margin-bottom: 20px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-prefix {
          position: absolute;
          left: 16px;
          font-size: 24px;
          font-weight: 600;
          color: #6b7280;
          pointer-events: none;
        }

        .amount-input {
          width: 100%;
          padding: 16px 16px 16px 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(140, 198, 63, 0.2);
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .amount-input:focus {
          border-color: #8cc63f;
          box-shadow: 0 0 0 3px rgba(140, 198, 63, 0.1);
        }

        .amount-input::placeholder {
          color: #4b5563;
        }
      `}</style>

      {/* Header */}
      <div className="widget-header">
        <div className="coingecko-brand">
          <img
            src="https://static.coingecko.com/s/coingecko-branding-guide-8447de673439420efa0ab1e0e03a1f8b0137c3f142f84f5c41b7fb3cc37eb605.png"
            alt="CoinGecko"
            className="coingecko-logo"
          />
          <div className="brand-text">
            <span className="powered-by">Powered by</span>
            <span className="coingecko-name">CoinGecko Pro</span>
          </div>
        </div>
        <div className="live-indicator">
          <div 
            className="live-dot" 
            style={{ backgroundColor: getFreshnessColor(priceAge) }}
          />
          <span className="live-text">Live</span>
        </div>
      </div>

      {/* Input */}
      <div className="input-section">
        <div className="input-wrapper">
          <span className="currency-prefix">£</span>
          <input
            type="number"
            className="amount-input"
            value={gbpAmount || ''}
            onChange={(e) => setGbpAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Conversion Display */}
      {conversionData && (
        <>
          <div className="conversion-display">
            <div className="rate-row">
              <span className="currency-amount gbp-amount">
                <span className="gbp-symbol">£</span>
                {conversionData.gbp.toFixed(2)}
              </span>
              <span className="equals">=</span>
              <span className={`currency-amount rlusd-amount ${pulseActive ? 'pulse' : ''}`}>
                {conversionData.rlusd.toFixed(6)}
              </span>
              <span className="rlusd-label">RLUSD</span>
            </div>

            <div className="rate-details">
              <div className="rate-item">
                <div className="rate-label">Rate</div>
                <div className="rate-value">
                  £1 = {conversionData.rate.gbp_to_rlusd.toFixed(6)} RLUSD
                </div>
              </div>
              <div className="rate-item">
                <div className="rate-label">USD Peg</div>
                <div className="rate-value">
                  ${conversionData.rate.rlusd_usd.toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          {/* Freshness Bar */}
          <div className="freshness-bar">
            <div className="freshness-left">
              <div 
                className="freshness-dot" 
                style={{ backgroundColor: getFreshnessColor(priceAge) }}
              />
              <span className="freshness-label">Price Age</span>
            </div>
            <span 
              className="freshness-time"
              style={{ color: getFreshnessColor(priceAge) }}
            >
              {formatPriceAge(priceAge)}
            </span>
          </div>

          {/* Compliance Section */}
          {showCompliance && conversionData.compliance && (
            <div className="compliance-section">
              <div className="compliance-header">
                <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="compliance-title">Regulatory Compliance</span>
              </div>
              <div className="compliance-grid">
                <div className="compliance-item">
                  <span className="compliance-key">Standard</span>
                  <span className="compliance-value">{conversionData.compliance.standard}</span>
                </div>
                <div className="compliance-item">
                  <span className="compliance-key">Jurisdiction</span>
                  <span className="compliance-value">{conversionData.compliance.jurisdiction}</span>
                </div>
                <div className="compliance-item">
                  <span className="compliance-key">Data Source</span>
                  <span className="compliance-value">{conversionData.compliance.data_source}</span>
                </div>
                <div className="compliance-item">
                  <span className="compliance-key">Manipulation Resistant</span>
                  <span className="compliance-value">
                    {conversionData.compliance.manipulation_resistant ? '✓ Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slippage Disclaimer */}
          <div className="slippage-notice">
            <div className="slippage-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div className="slippage-content">
              <span className="slippage-title">Settlement Protection</span>
              <span className="slippage-text">
                Final settlement may vary by up to 0.3% from the quoted rate — this is standard practice 
                used by major payment providers including Visa, Mastercard, and institutional FX desks 
                to ensure reliable transaction completion.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="widget-footer">
            <div className="exchanges-badge">
              <span className="exchanges-count">600+</span>
              <span className="exchanges-label">exchanges aggregated</span>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && !conversionData && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}