'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BrowserType = 'chrome' | 'edge' | 'brave' | 'safari' | 'firefox' | 'samsung' | 'other';
type DeviceType = 'ios' | 'android' | 'desktop';

export default function InstallPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect device
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setDevice('ios');
    } else if (/Android/.test(ua)) {
      setDevice('android');
    } else {
      setDevice('desktop');
    }

    // Detect browser
    if ((navigator as any).brave?.isBrave) {
      setBrowser('brave');
    } else if (ua.includes('Edg/')) {
      setBrowser('edge');
    } else if (ua.includes('Chrome') && !ua.includes('Edg/')) {
      setBrowser('chrome');
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      setBrowser('safari');
    } else if (ua.includes('Firefox')) {
      setBrowser('firefox');
    } else if (ua.includes('SamsungBrowser')) {
      setBrowser('samsung');
    }

    // Listen for install prompt (Chromium browsers)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    // If we have the native prompt, use it
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

    // Otherwise show instructions
    setShowInstructions(true);
  };

  const supportsNativePrompt = installPrompt !== null;

  // Get browser-specific instructions
  const getInstructions = () => {
    if (device === 'ios') {
      return {
        title: 'Install on iPhone/iPad',
        steps: [
          { text: 'Tap the Share button', icon: 'share' },
          { text: 'Scroll and tap "Add to Home Screen"', icon: 'plus' },
          { text: 'Tap "Add"', icon: 'check' },
        ],
      };
    }

    if (device === 'android') {
      if (browser === 'firefox') {
        return {
          title: 'Install on Android (Firefox)',
          steps: [
            { text: 'Tap the menu (⋮)', icon: 'menu' },
            { text: 'Tap "Install"', icon: 'plus' },
            { text: 'Confirm installation', icon: 'check' },
          ],
        };
      }
      return {
        title: 'Install on Android',
        steps: [
          { text: 'Tap the menu (⋮)', icon: 'menu' },
          { text: 'Tap "Add to Home Screen" or "Install App"', icon: 'plus' },
          { text: 'Tap "Install"', icon: 'check' },
        ],
      };
    }

    // Desktop
    if (browser === 'safari') {
      return {
        title: 'Install on Safari (Mac)',
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
          { text: 'Try opening in Chrome, Edge, or Brave', icon: 'browser' },
          { text: 'Or scan the QR code on mobile', icon: 'qr' },
        ],
      };
    }

    if (browser === 'edge') {
      return {
        title: 'Install on Edge',
        steps: [
          { text: 'Click the install icon in the address bar', icon: 'plus' },
          { text: 'Or click menu (⋯) → Apps → Install', icon: 'menu' },
          { text: 'Click "Install"', icon: 'check' },
        ],
      };
    }

    if (browser === 'brave') {
      return {
        title: 'Install on Brave',
        steps: [
          { text: 'Click the install icon in the address bar', icon: 'plus' },
          { text: 'Or click menu → "Install YesAllOfUs"', icon: 'menu' },
          { text: 'Click "Install"', icon: 'check' },
        ],
      };
    }

    // Chrome default
    return {
      title: 'Install App',
      steps: [
        { text: 'Click the install icon in the address bar', icon: 'plus' },
        { text: 'Or click menu (⋮) → "Install YesAllOfUs"', icon: 'menu' },
        { text: 'Click "Install"', icon: 'check' },
      ],
    };
  };

  const instructions = getInstructions();

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
      case 'browser':
        return (
          <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      case 'qr':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Already installed view
  if (isInstalled) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">You're All Set!</h1>
          <p className="text-zinc-400 mb-8">YesAllOfUs is installed on your device. Find it on your home screen.</p>
          
           <a href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition active:scale-95"
          >
            Open Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="p-6">
          <a href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </a>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 pb-12">
          <div className="w-full max-w-md">
            
            {/* Logo */}
<div className="relative mb-6">
  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
  <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
    <img 
      src="/dltpayslogo1.png" 
      alt="YesAllOfUs" 
      className="w-full h-full object-cover"
    />
  </div>
</div>

            {/* Title */}
<div className="text-center mb-6">
  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
    Get the App
  </h1>
  <p className="text-zinc-400">
    Install YesAllOfUs for the best experience
  </p>
</div>

            {/* QR Code - Desktop only */}
{device === 'desktop' && (
  <div className="flex flex-col items-center mb-6">
    <div className="bg-white p-3 rounded-xl mb-3">
      <QRCodeSVG 
        value="https://yesallofus.com/install"
        size={120}
        level="H"
        bgColor="#ffffff"
        fgColor="#0a0a0a"
      />
    </div>
    <p className="text-zinc-500 text-xs">Scan with your phone to install</p>
  </div>
)}

            {/* Install Button */}
<button
  onClick={handleInstall}
  disabled={installing}
  className="group w-full p-3 rounded-2xl border border-zinc-800/50 bg-gradient-to-r from-emerald-500/5 to-sky-500/5 hover:from-emerald-500/10 hover:to-sky-500/10 hover:border-emerald-500/30 transition-all duration-300 mb-6"
>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
      {installing ? (
        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
        </svg>
      )}
    </div>
    
    <div className="flex-1 text-left">
      <p className="font-semibold text-white text-sm">{installing ? 'Installing...' : 'Install App'}</p>
      <p className="text-zinc-500 text-xs">
        {supportsNativePrompt ? 'One tap install' : `Instructions for ${browser === 'other' ? 'your browser' : browser.charAt(0).toUpperCase() + browser.slice(1)}`}
      </p>
    </div>
    
    <svg className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  </div>
</button>

            {/* Features */}
<div className="grid gap-3">
  <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div>
      <p className="font-semibold text-sm">Lightning Fast</p>
      <p className="text-xs text-zinc-500">Instant access from your home screen</p>
    </div>
  </div>

  <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
    <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <p className="font-semibold text-sm">Native Experience</p>
      <p className="text-xs text-zinc-500">Works like a real app, no browser UI</p>
    </div>
  </div>

  <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <div>
      <p className="font-semibold text-sm">Stay Updated</p>
      <p className="text-xs text-zinc-500">Get notified on payments instantly</p>
    </div>
  </div>
</div>

          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-zinc-600 text-sm">
            No app store required • Instant install • Always up to date
          </p>
        </footer>

      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{instructions.title}</h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Steps */}
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

            {/* Footer */}
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}