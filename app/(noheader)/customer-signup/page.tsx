'use client';

import { useState, useEffect } from 'react';
import BackgroundVideo from '@/components/BackgroundVideo';
import LoginScreen from '@/components/LoginScreen'; // Fixed: Correct path to LoginScreen

const API_URL = 'https://api.dltpays.com/nfc/api/v1'; // Fixed: Use NFC API instead of main API

interface CustomerSignupProps {
  storeId?: string;
  storeName?: string;
  referrer?: 'checkout' | 'affiliate' | 'direct';
  redirectUrl?: string;
}

interface Store {
  store_id: string;
  store_name: string;
  logo_url?: string;
  store_url?: string;
}

export default function CustomerSignup({ 
  storeId, 
  storeName, 
  referrer = 'direct',
  redirectUrl 
}: CustomerSignupProps) {
  const [step, setStep] = useState<'welcome' | 'form' | 'wallet' | 'nfc' | 'success'>('welcome');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedStore: storeId || ''
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);

  // Check NFC support
  useEffect(() => {
    setNfcSupported('NDEFReader' in window);
  }, []);

  // Load stores for selection
  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await fetch(`https://api.dltpays.com/api/v1/stores/public`); // Use main API for stores
        const data = await res.json();
        if (data.success) {
          setStores(data.stores || []);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
      }
    };
    
    if (!storeId) {
      loadStores();
    }
  }, [storeId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.selectedStore) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError('');
    setStep('wallet');
  };

  const registerCustomer = async (walletAddr: string) => {
    setLoading(true);
    try {
      // For now, just proceed to next step since the API endpoint doesn't exist yet
      // TODO: Implement proper customer registration endpoint
      console.log('Customer signup data:', {
        wallet_address: walletAddr,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        store_id: formData.selectedStore,
        referrer
      });
      
      // Simulate successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(nfcSupported ? 'nfc' : 'success');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const linkNFCCard = async () => {
    setLoading(true);
    try {
      if ('NDEFReader' in window) {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener('reading', async ({ message, serialNumber }: any) => {
          try {
            const res = await fetch(`${API_URL}/nfc/link-card`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wallet_address: walletAddress,
                card_uid: serialNumber,
                card_name: 'My Payment Card'
              })
            });
            
            const data = await res.json();
            if (data.success) {
              setStep('success');
            } else {
              throw new Error(data.error);
            }
          } catch (err: any) {
            setError(err.message || 'Failed to link card');
          }
        });
        
        ndef.addEventListener('readingerror', () => {
          setError('Error reading NFC card. Try again.');
        });
      } else {
        // Fallback for browsers without NFC
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep('success');
      }
    } catch (err: any) {
      setError('NFC linking failed. You can skip this step.');
    }
    setLoading(false);
  };

  const getMotivationalMessage = () => {
    switch (referrer) {
      case 'checkout':
        return 'Complete your secure payment setup';
      case 'affiliate':
        return 'Join our affiliate rewards program';
      default:
        return 'Welcome to the future of payments';
    }
  };

  const selectedStoreData = stores.find(s => s.store_id === formData.selectedStore);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative flex flex-col overflow-x-hidden">
      {/* Background Video */}
      <BackgroundVideo 
        src="/affiliate-hq.webm"
        overlay={true}
      />
      
      <main className="relative z-10 w-full max-w-xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-full">
          
          {/* Welcome Step */}
          {step === 'welcome' && (
            <>
              {/* Title - SVG Badge Style */}
              <div className="flex flex-col items-center mb-4 mt-2 md:mb-6 md:mt-4">
                <svg viewBox="0 0 280 85" className="w-full max-w-72 h-auto">
                  <defs>
                    <linearGradient id="signupGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  
                  <text x="140" y="28" textAnchor="middle" fill="url(#signupGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
                    WELCOME
                  </text>
                  
                  <text x="140" y="48" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3">
                    TO YESALLOFUS
                  </text>
                  
                  <line x1="80" y1="60" x2="200" y2="60" stroke="#27272a" strokeWidth="1"/>
                  
                  <text x="140" y="76" textAnchor="middle" fill="#a1a1aa" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="10" letterSpacing="0.5">
                    {getMotivationalMessage()}
                  </text>
                </svg>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6 max-w-md mx-auto">
                {/* Benefits Preview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H4.5m2.25 0v3m0 0v.75A.75.75 0 016 10.5H4.5m0 0H3v.375C3 11.496 3.504 12 4.125 12h9.75c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H4.125z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-sm">Earn Rewards</p>
                    <p className="text-zinc-500 text-xs">Up to 25% commissions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-sm">NFC Payments</p>
                    <p className="text-zinc-500 text-xs">Tap to pay anywhere</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-sm">Secure</p>
                    <p className="text-zinc-500 text-xs">Blockchain protected</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setStep('form')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 rounded-xl transition"
                >
                  Get Started
                </button>
                
                <p className="text-zinc-500 text-xs mt-4 text-center">
                  Takes less than 2 minutes • Free to join
                </p>
              </div>
            </>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <>
              {/* Title */}
              <div className="flex flex-col items-center mb-4 mt-2 md:mb-6 md:mt-4">
                <svg viewBox="0 0 280 85" className="w-full max-w-72 h-auto">
                  <defs>
                    <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  
                  <text x="140" y="28" textAnchor="middle" fill="url(#formGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
                    SIGN UP
                  </text>
                  
                  <text x="140" y="48" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3">
                    DETAILS
                  </text>
                  
                  <line x1="80" y1="60" x2="200" y2="60" stroke="#27272a" strokeWidth="1"/>
                  
                  <text x="140" y="76" textAnchor="middle" fill="#a1a1aa" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="10" letterSpacing="0.5">
                    Tell us about yourself
                  </text>
                </svg>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="+44 7XXX XXXXXX"
                    />
                  </div>

                  {!storeId && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Select Store *</label>
                      <select
                        value={formData.selectedStore}
                        onChange={(e) => setFormData({...formData, selectedStore: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        required
                      >
                        <option value="">Choose a store...</option>
                        {stores.map(store => (
                          <option key={store.store_id} value={store.store_id}>
                            {store.store_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedStoreData && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        {selectedStoreData.logo_url && (
                          <img src={selectedStoreData.logo_url} alt={selectedStoreData.store_name} className="w-10 h-10 rounded-lg" />
                        )}
                        <div>
                          <p className="text-white font-medium">{selectedStoreData.store_name}</p>
                          <p className="text-emerald-400 text-sm">You'll earn rewards from purchases here</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-4 rounded-xl transition"
                  >
                    {loading ? 'Setting up...' : 'Continue'}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Wallet Step - Use existing LoginScreen */}
          {step === 'wallet' && (
            <LoginScreen
              onLogin={async (wallet: string, method: string) => {
                setWalletAddress(wallet);
                await registerCustomer(wallet);
              }}
              storagePrefix="affiliate"
              title="CONNECT WALLET"
              subtitle="Choose how you'd like to manage rewards"
              showLogo={false}
            />
          )}

          {/* NFC Step */}
          {step === 'nfc' && (
            <>
              {/* Title */}
              <div className="flex flex-col items-center mb-4 mt-2 md:mb-6 md:mt-4">
                <svg viewBox="0 0 280 85" className="w-full max-w-72 h-auto">
                  <defs>
                    <linearGradient id="nfcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  
                  <text x="140" y="28" textAnchor="middle" fill="url(#nfcGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
                    NFC CARD
                  </text>
                  
                  <text x="140" y="48" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3">
                    SETUP
                  </text>
                  
                  <line x1="80" y1="60" x2="200" y2="60" stroke="#27272a" strokeWidth="1"/>
                  
                  <text x="140" y="76" textAnchor="middle" fill="#a1a1aa" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="10" letterSpacing="0.5">
                    Link your tap-to-pay card
                  </text>
                </svg>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-md mx-auto">
                <div className="w-24 h-24 border-4 border-dashed border-purple-400/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Link Your NFC Card</h3>
                <p className="text-zinc-400 mb-6">Hold your NFC card near your device when ready</p>

                <button
                  onClick={linkNFCCard}
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition mb-4"
                >
                  {loading ? 'Linking Card...' : 'Link NFC Card'}
                </button>

                <button
                  onClick={() => setStep('success')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition"
                >
                  Skip for Now
                </button>

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              {/* Title */}
              <div className="flex flex-col items-center mb-4 mt-2 md:mb-6 md:mt-4">
                <svg viewBox="0 0 280 85" className="w-full max-w-72 h-auto">
                  <defs>
                    <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  
                  <text x="140" y="28" textAnchor="middle" fill="url(#successGradient)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="4">
                    SUCCESS
                  </text>
                  
                  <text x="140" y="48" textAnchor="middle" fill="#71717a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3">
                    COMPLETE
                  </text>
                  
                  <line x1="80" y1="60" x2="200" y2="60" stroke="#27272a" strokeWidth="1"/>
                  
                  <text x="140" y="76" textAnchor="middle" fill="#a1a1aa" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="10" letterSpacing="0.5">
                    Welcome aboard!
                  </text>
                </svg>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-emerald-400 mb-2">Welcome Aboard!</h3>
                <p className="text-zinc-400 mb-6">Your YesAllOfUs account is ready to earn rewards</p>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                  <h4 className="text-emerald-300 font-semibold mb-3">What's Next?</h4>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Secure checkout at participating stores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Find vendors and exclusive offers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Start earning up to 25% commission on referrals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Use your NFC card for instant payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Track earnings in your dashboard</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (referrer === 'checkout') {
                      window.location.href = redirectUrl || '/checkout';
                    } else {
                      // Go to affiliate dashboard with store parameter
                      window.location.href = `/affiliate-dashboard${formData.selectedStore ? `?store=${formData.selectedStore}` : ''}`;
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 rounded-xl transition"
                >
                  {referrer === 'checkout' ? 'Complete Payment' : 'Go to Dashboard'}
                </button>
              </div>
            </>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {['welcome', 'form', 'wallet', nfcSupported ? 'nfc' : null, 'success'].filter(Boolean).map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step === stepName 
                    ? 'bg-emerald-400 scale-125' 
                    : ['welcome', 'form', 'wallet', nfcSupported ? 'nfc' : null].filter(Boolean).indexOf(step) > index
                      ? 'bg-emerald-600' 
                      : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>

          {/* Back to Homepage */}
          <a 
            href="/" 
            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mt-8 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Homepage</span>
          </a>
        </div>
      </main>

      {/* YAOFUS Footer */}
      <footer className="relative z-10 py-4 flex flex-col items-center gap-0.5 mt-auto">
        <span className="text-zinc-500 text-[10px] font-medium tracking-wider">SECURE</span>
        <span className="text-base font-extrabold tracking-widest">
          <span className="text-emerald-500">Y</span>
          <span className="text-green-500">A</span>
          <span className="text-blue-500">O</span>
          <span className="text-indigo-500">F</span>
          <span className="text-violet-500">U</span>
          <span className="text-purple-500">S</span>
        </span>
        <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">SIGNUP</span>
        <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
          <span>Powered by YesAllOfUs</span>
        </div>
      </footer>
    </div>
  );
}