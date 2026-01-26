'use client';
import { useRouter } from 'next/navigation';
import StaffSelector from '@/components/StaffSelector';

interface TakePaymentHeaderProps {
  storeId: string | null;
  walletAddress: string | null;
  storeName: string;
  storeLogo: string | null;
  activeStaff: any | null;
  onStartTour: () => void;
  onShowLogoUpload: () => void;
  onShowStaffModal: () => void;
  onShowPendingPayments: () => void;
  onShowProductsManager: () => void;
  onStaffChange: (staff: any) => void;
}

export default function TakePaymentHeader({
  storeId,
  walletAddress,
  storeName,
  storeLogo,
  activeStaff,
  onStartTour,
  onShowLogoUpload,
  onShowStaffModal,
  onShowPendingPayments,
  onShowProductsManager,
  onStaffChange,
}: TakePaymentHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-violet-500/20 via-purple-600/15 via-purple-800/10 to-black/20 backdrop-blur border-b border-violet-500/20">
      <div className="max-w-lg mx-auto sm:max-w-none sm:mx-0 w-full px-4 py-3 flex items-center justify-between">
        {/* Left - Home and Tour buttons */}
        <div className="flex items-center">
          <button
            id="tp-home-btn"
            onClick={() => router.push('/dashboard')}
            className="text-zinc-400 hover:text-white transition p-2 active:scale-95 cursor-pointer"
            title="Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button
            onClick={onStartTour}
            className="text-zinc-400 hover:text-emerald-400 transition p-2 active:scale-95 cursor-pointer"
            title="Take Tour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>

        {/* Center - Logo and Store Name */}
        <div className="flex items-center gap-2 landscape:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <button
            id="tp-store-logo"
            onClick={onShowLogoUpload}
            className={`relative w-8 h-8 rounded-lg overflow-hidden transition flex-shrink-0 cursor-pointer ${
              storeLogo ? 'hover:opacity-80' : 'border border-zinc-700 hover:border-emerald-500'
            }`}
            title="Store logo"
          >
            {storeLogo ? (
              <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
          </button>
          <h1 className="text-lg font-bold truncate max-w-[120px] hidden landscape:block sm:block">{storeName}</h1>
        </div>

        {/* Right - Staff selector and icons */}
        <div id="tp-toolbar" className="flex items-center gap-1">
          {/* Staff Selector - Icon only on mobile, full on desktop */}
          {storeId && walletAddress && (
            <div id="tp-staff-selector" className="hidden lg:block">
              <StaffSelector
                storeId={storeId}
                walletAddress={walletAddress}
                onStaffChange={onStaffChange}
              />
            </div>
          )}
          {storeId && walletAddress && (
            <button
              onClick={onShowStaffModal}
              className="lg:hidden text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
              title={activeStaff?.name || 'Staff'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}

          {/* Analytics */}
          <div className="relative group">
            <button
              id="tp-analytics-btn"
              onClick={() => router.push('/analytics')}
              className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Analytics
            </span>
          </div>

          {/* Pending Payments */}
          <div className="relative group">
            <button
              id="tp-pending-btn"
              onClick={onShowPendingPayments}
              className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Pending Payments
            </span>
          </div>

          {/* Customer Display */}
          <div className="relative group">
            <button
              id="tp-display-btn"
              onClick={() => {
                const isPWA = window.matchMedia('(display-mode: standalone)').matches;
                if (isPWA) {
                  window.location.href = `/display?store=${storeId}`;
                } else {
                  window.open(`/display?store=${storeId}`, '_blank');
                }
              }}
              className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Customer Display
            </span>
          </div>

          {/* Receipts */}
          <div className="relative group">
            <button
              id="tp-receipts-btn"
              onClick={() => router.push('/receipts?from=take-payment')}
              className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Receipts
            </span>
          </div>

          {/* Add Products */}
          <div className="relative group">
            <button
              id="tp-products-btn"
              onClick={onShowProductsManager}
              className="text-zinc-400 hover:text-white transition p-2 active:scale-90 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Add Products
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}