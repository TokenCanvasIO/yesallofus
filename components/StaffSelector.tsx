'use client';

import { useState, useEffect } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/safeStorage';
import { useRouter } from 'next/navigation';

interface StaffMember {
  staff_id: string;
  name: string;
  photo_url?: string;
  role: string;
  is_clocked_in?: boolean;
}

interface StaffSelectorProps {
  storeId: string;
  walletAddress: string;
  onStaffChange?: (staff: StaffMember | null) => void;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export default function StaffSelector({ storeId, walletAddress, onStaffChange }: StaffSelectorProps) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch staff list
  useEffect(() => {
    if (storeId && walletAddress) {
      fetchStaffList();
      // Load saved active staff from session
      const savedStaff = safeGetItem('activeStaff');
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        setActiveStaff(parsed);
        onStaffChange?.(parsed);
      }
    }
  }, [storeId, walletAddress]);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/staff?wallet_address=${walletAddress}`
      );
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff');
    }
    setLoading(false);
  };

  const selectStaff = (staff: StaffMember | null) => {
    setActiveStaff(staff);
    if (staff) {
      safeSetItem('activeStaff', JSON.stringify(staff));
    } else {
      safeRemoveItem('activeStaff');
    }
    onStaffChange?.(staff);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition cursor-pointer active:scale-95"
      >
        {activeStaff ? (
          <>
            {activeStaff.photo_url ? (
              <img src={activeStaff.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">
                {activeStaff.name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-white hidden sm:inline max-w-[80px] truncate">{activeStaff.name}</span>
            <span className="text-emerald-400 text-xs">●</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-zinc-400 hidden sm:inline">Staff</span>
          </>
        )}
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-zinc-800">
              <p className="text-xs text-zinc-500 px-2">Who's on register?</p>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-zinc-500 text-sm mb-2">No staff members</p>
                <button
                  onClick={() => { setShowDropdown(false); router.push('/staffpos'); }}
                  className="text-emerald-400 text-sm hover:underline cursor-pointer"
                >
                  + Add staff
                </button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {/* No one option */}
                <button
                  onClick={() => selectStaff(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition cursor-pointer ${
                    !activeStaff ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-zinc-400">No one</p>
                  </div>
                </button>

                {staffList.map((staff) => (
                  <button
                    key={staff.staff_id}
                    onClick={() => selectStaff(staff)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition cursor-pointer ${
                      activeStaff?.staff_id === staff.staff_id ? 'bg-zinc-800' : ''
                    }`}
                  >
                    {staff.photo_url ? (
                      <img src={staff.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm text-emerald-400">
                        {staff.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white">{staff.name}</p>
                      <p className="text-xs text-zinc-500">{staff.role}</p>
                    </div>
                    {staff.is_clocked_in ? (
                      <span className="text-emerald-400 text-xs">● On shift</span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Off</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-zinc-800">
              <button
                onClick={() => { setShowDropdown(false); router.push('/staffpos'); }}
                className="w-full text-center text-sm text-zinc-400 hover:text-white py-2 cursor-pointer"
              >
                Manage Staff →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}