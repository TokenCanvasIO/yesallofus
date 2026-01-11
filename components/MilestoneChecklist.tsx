'use client';

import { useState, useEffect } from 'react';

interface Milestone {
  id: string;
  label: string;
  icon: React.ReactNode;
  timestamp: string | null;
}

interface MilestoneChecklistProps {
  type?: 'vendor' | 'customer';
  storeId: string;
  walletAddress: string;
  autoSignEnabled?: boolean;
  // Direct status props for customer milestones (auto-sync from parent)
  walletFunded?: boolean;
  trustlineSet?: boolean;
  tapPayEnabled?: boolean;
  nfcCardAdded?: boolean;
  joinedAffiliate?: boolean;
  onMilestoneAchieved?: (milestone: string) => void;
  onInfoClick?: (milestoneId: string) => void;
  onDismiss?: () => void;
}

const API_URL = 'https://api.dltpays.com/api/v1';

export default function MilestoneChecklist({ 
  type = 'vendor',
  storeId, 
  walletAddress,
  autoSignEnabled,
  walletFunded,
  trustlineSet,
  tapPayEnabled,
  nfcCardAdded,
  joinedAffiliate,
  onMilestoneAchieved,
  onInfoClick,
  onDismiss
}: MilestoneChecklistProps) {
  const [milestones, setMilestones] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Vendor milestones
  const vendorMilestoneConfig: Milestone[] = [
    {
      id: 'wallet_funded',
      label: 'Wallet funded',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'trustline_set',
      label: 'Trustline set',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'auto_sign_enabled',
      label: 'Auto-sign enabled',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'first_affiliate',
      label: 'First affiliate joined',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'first_payment_received',
      label: 'First payment received',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'first_payout_sent',
      label: 'First payout sent',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'first_partner_signed',
      label: 'First partner signed up',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      timestamp: null
    }
  ];

  // Customer/Affiliate milestones
  const customerMilestoneConfig: Milestone[] = [
    {
      id: 'wallet_funded',
      label: 'Wallet funded',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'trustline_set',
      label: 'Trustline set',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'tap_pay_enabled',
      label: 'Tap to pay enabled',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'nfc_card_added',
      label: 'NFC card linked',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      timestamp: null
    },
    {
      id: 'joined_affiliate',
      label: 'Joined as affiliate',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      timestamp: null
    }
  ];

  const milestoneConfig = type === 'customer' ? customerMilestoneConfig : vendorMilestoneConfig;
  const storageKey = type === 'customer' ? `milestones_collapsed_customer_${walletAddress}` : `milestones_collapsed_${storeId}`;
  const dismissKey = type === 'customer' ? `milestones_dismissed_customer_${walletAddress}` : `milestones_dismissed_${storeId}`;

  // For customer type, build milestones from props (auto-sync)
  useEffect(() => {
    // Check if collapsed preference
    const collapsed = localStorage.getItem(storageKey);
    if (collapsed === 'true') {
      setIsExpanded(false);
    }
    
    if (type === 'customer') {
      // Build milestones from props - no API call needed
      const now = new Date().toISOString();
      const customerMilestones: Record<string, string | null> = {
        wallet_funded: walletFunded ? now : null,
        trustline_set: trustlineSet ? now : null,
        tap_pay_enabled: tapPayEnabled ? now : null,
        nfc_card_added: nfcCardAdded ? now : null,
        joined_affiliate: joinedAffiliate ? now : null,
      };
      setMilestones(customerMilestones);
      setLoading(false);
    } else {
      // Vendor - fetch from API
      fetchMilestones();
    }
  }, [storeId, walletAddress, autoSignEnabled, type, walletFunded, trustlineSet, tapPayEnabled, nfcCardAdded, joinedAffiliate]);

  const fetchMilestones = async () => {
    try {
      const endpoint = `${API_URL}/store/${storeId}/milestones`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setMilestones(data.milestones);
      }
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    }
    setLoading(false);
  };

  // Calculate completed count
  const completed = Object.values(milestones).filter(v => v !== null).length;
  const total = milestoneConfig.length;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(storageKey, (!newState).toString());
  };

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, 'true');
    onDismiss?.();
  };

  const progressPercent = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 text-zinc-500">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
          Loading progress...
        </div>
      </div>
    );
  }

  // Complete and collapsed - minimal bar
  if (isComplete && !isExpanded) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-400 font-medium">All milestones complete!</span>
          <span className="text-emerald-400/60 text-sm">{completed}/{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleExpand}
            className="p-1.5 text-zinc-500 hover:text-emerald-400 transition"
            title="Expand"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 transition"
            title="Hide permanently"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Collapsed state (not complete)
  if (!isExpanded) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-medium">Your Progress</span>
            <span className="text-zinc-500 text-sm">{completed}/{total}</span>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <div className="h-2 bg-zinc-800 rounded-full flex-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-zinc-500 text-sm">{progressPercent}%</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={handleToggleExpand}
              className="p-1.5 text-zinc-500 hover:text-white transition"
              title="Expand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition"
              title="Hide progress"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Your Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm">{completed}/{total}</span>
          <button
            onClick={handleToggleExpand}
            className="p-1.5 text-zinc-500 hover:text-white transition"
            title="Collapse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          {isComplete && (
            <button
              onClick={handleDismiss}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition"
              title="Hide permanently"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-3">
        {milestoneConfig.map((m) => {
          const isComplete = !!milestones[m.id];
          return (
            <div 
              key={m.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition group ${
                isComplete ? 'bg-emerald-500/10' : 'bg-zinc-800/50'
              }`}
            >
              <div className={`${isComplete ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {isComplete ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  m.icon
                )}
              </div>
              <span className={`flex-1 text-sm ${isComplete ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {m.label}
              </span>
              {onInfoClick && (
                <button
                  onClick={() => onInfoClick(m.id)}
                  className="p-1 text-zinc-600 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Learn more"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}