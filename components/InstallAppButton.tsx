'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BrowserType = 'chrome' | 'edge' | 'brave' | 'safari' | 'firefox' | 'other';

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    // Detect browser
    if (ua.includes('Edg/')) {
      setBrowser('edge');
    } else if (ua.includes('Chrome') && !ua.includes('Edg/')) {
      setBrowser('chrome');
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      setBrowser('safari');
    } else if (ua.includes('Firefox')) {
      setBrowser('firefox');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    // Native prompt available - use it
    if (installPrompt) {
      setInstalling(true);
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstalling(false);
      return;
    }

    // No native prompt - show instructions modal
    setShowModal(true);
  };

  const getInstructions = () => {
    if (isIOS) {
      return {
        title: 'Install on iPhone/iPad',
        steps: [
          { text: 'Tap the share button', icon: 'share' },
          { text: 'Scroll & tap "Add to Home Screen"', icon: 'plus' },
          { text: 'Tap "Add"', icon: 'check' },
        ],
      };
    }

    if (browser === 'safari') {
      return {
        title: 'Install on Safari',
        steps: [
          { text: 'Click File in the menu bar', icon: 'menu' },
          { text: 'Click "Add to Dock"', icon: 'plus' },
          { text: 'Click "Add"', icon: 'check' },
        ],
      };
    }

    if (browser === 'firefox') {
      return {
        title: 'Install on Firefox',
        steps: [
          { text: 'Firefox has limited PWA support', icon: 'info' },
          { text: 'Try Chrome, Edge, or Safari instead', icon: 'browser' },
          { text: 'Or use our mobile app', icon: 'phone' },
        ],
      };
    }

    if (browser === 'edge') {
      return {
        title: 'Install on Edge',
        steps: [
          { text: 'Click ⋯ menu in the toolbar', icon: 'menu' },
          { text: 'Click Apps → Install this site', icon: 'plus' },
          { text: 'Click "Install"', icon: 'check' },
        ],
      };
    }

    // Chrome/other fallback
    return {
      title: 'Install App',
      steps: [
        { text: 'Click ⋮ menu in the toolbar', icon: 'menu' },
        { text: 'Click "Install YesAllOfUs"', icon: 'plus' },
        { text: 'Click "Install"', icon: 'check' },
      ],
    };
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'share':
        return (
          <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3 3h-2v6h-2V5H9l3-3zm-7 9v10h14V11h-2v8H7v-8H5z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'menu':
        return (
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );
      case 'browser':
        return (
          <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const instructions = getInstructions();

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        disabled={installing}
        className="group w-full mb-4 p-4 rounded-2xl border border-zinc-800/50 bg-gradient-to-r from-emerald-500/5 to-sky-500/5 hover:from-emerald-500/10 hover:to-sky-500/10 hover:border-emerald-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            {installing ? (
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
              </svg>
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="font-semibold text-white text-sm">Install App</p>
            <p className="text-zinc-500 text-xs">Add to home screen</p>
          </div>
          
          <svg className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>

      {/* Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{instructions.title}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {instructions.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50">
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300">{step.text}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    {getIcon(step.icon)}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}