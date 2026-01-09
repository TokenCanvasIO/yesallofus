'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

interface StaffMember {
  staff_id: string;
  name: string;
  photo_url?: string;
  role: 'admin' | 'cashier' | 'manager';
  pin?: string;
  hourly_rate?: number;
  created_at: string;
  is_clocked_in?: boolean;
  current_shift_start?: string;
}

interface Shift {
  shift_id: string;
  staff_id: string;
  staff_name: string;
  clock_in: string;
  clock_out?: string;
  duration_minutes?: number;
  total_sales?: number;
  tips_earned?: number;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

function StaffPage() {
  const router = useRouter();
  
  // Auth
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  
  // Data
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<'staff' | 'shifts'>('staff');
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'cashier' | 'manager'>('cashier');
  const [formPin, setFormPin] = useState('');
  const [formHourlyRate, setFormHourlyRate] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load store data
  useEffect(() => {
    const stored = sessionStorage.getItem('vendorWalletAddress');
    const storeData = sessionStorage.getItem('storeData');
    
    if (!stored) {
      router.push('/dashboard');
      return;
    }
    
    setWalletAddress(stored);
    
    if (storeData) {
      const store = JSON.parse(storeData);
      setStoreId(store.store_id || null);
      setStoreName(store.store_name || 'Your Store');
    }
  }, [router]);

  // Fetch staff
  useEffect(() => {
    if (storeId && walletAddress) {
      fetchStaff();
      fetchShifts();
    }
  }, [storeId, walletAddress]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/staff?wallet_address=${walletAddress}`
      );
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff');
    }
    setLoading(false);
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/shifts?wallet_address=${walletAddress}&limit=50`
      );
      const data = await res.json();
      if (data.success) {
        setShifts(data.shifts || []);
      }
    } catch (err) {
      console.error('Failed to load shifts');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be less than 5MB');
    return;
  }

  setUploading(true);
  
  // Compress the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    // Max 200x200 for staff photos
    const maxSize = 200;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);
    
    // Convert to compressed JPEG
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
    setFormPhoto(compressedBase64);
    setUploading(false);
  };
  
  img.src = URL.createObjectURL(file);
};

  const resetForm = () => {
    setFormName('');
    setFormRole('cashier');
    setFormPin('');
    setFormHourlyRate('');
    setFormPhoto(null);
    setEditingStaff(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormPin(member.pin || '');
    setFormHourlyRate(member.hourly_rate?.toString() || '');
    setFormPhoto(member.photo_url || null);
    setShowAddModal(true);
  };

  const saveStaff = async () => {
    if (!formName.trim()) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingStaff 
        ? `${API_URL}/store/${storeId}/staff/${editingStaff.staff_id}`
        : `${API_URL}/store/${storeId}/staff`;
      
      const res = await fetch(endpoint, {
        method: editingStaff ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          name: formName.trim(),
          role: formRole,
          pin: formPin || null,
          hourly_rate: formHourlyRate ? parseFloat(formHourlyRate) : null,
          photo_url: formPhoto
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchStaff();
        setShowAddModal(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (err) {
      alert('Failed to save staff member');
    }
    setSaving(false);
  };

  const deleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/staff/${staffId}?wallet_address=${walletAddress}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        fetchStaff();
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const clockIn = async (staffId: string) => {
    try {
      const res = await fetch(`${API_URL}/store/${storeId}/staff/${staffId}/clock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const data = await res.json();
      if (data.success) {
        fetchStaff();
        fetchShifts();
      }
    } catch (err) {
      alert('Failed to clock in');
    }
  };

  const clockOut = async (staffId: string) => {
    try {
      const res = await fetch(`${API_URL}/store/${storeId}/staff/${staffId}/clock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const data = await res.json();
      if (data.success) {
        fetchStaff();
        fetchShifts();
      }
    } catch (err) {
      alert('Failed to clock out');
    }
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const getShiftDuration = (clockIn: string, clockOut?: string) => {
    const start = new Date(clockIn).getTime();
    const end = clockOut ? new Date(clockOut).getTime() : Date.now();
    return Math.floor((end - start) / 60000);
  };

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400',
    manager: 'bg-blue-500/20 text-blue-400',
    cashier: 'bg-emerald-500/20 text-emerald-400'
  };
return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
  onClick={() => router.push('/take-payment')}
  className="text-zinc-400 hover:text-white transition p-2 cursor-pointer active:scale-95"
  title="Take Payment"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
</button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-zinc-400 hover:text-white transition p-2 cursor-pointer active:scale-95"
              title="Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
          
          <h1 className="text-lg font-bold">Staff</h1>
          
          <button
            onClick={openAddModal}
            className="text-zinc-400 hover:text-white transition p-2 cursor-pointer active:scale-95"
            title="Add Staff"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-8 flex-1">
        
        {/* Tabs */}
        <div className="flex gap-2 py-6">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer active:scale-95 ${
              activeTab === 'staff'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Staff ({staff.length})
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer active:scale-95 ${
              activeTab === 'shifts'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Shifts
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-zinc-500">Loading...</p>
          </div>
        )}

        {/* Staff Tab */}
        {!loading && activeTab === 'staff' && (
          <>
            {staff.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-zinc-400 mb-2">No staff members yet</p>
                <button
                  onClick={openAddModal}
                  className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  + Add your first staff member
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.staff_id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Photo */}
                      <div className="relative">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {member.is_clocked_in && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                            <span className="text-[10px]">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{member.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[member.role]}`}>
                            {member.role}
                          </span>
                        </div>
                        {member.is_clocked_in && member.current_shift_start && (
                          <p className="text-emerald-400 text-sm">
                            On shift · {formatDuration(getShiftDuration(member.current_shift_start))}
                          </p>
                        )}
                        {!member.is_clocked_in && (
                          <p className="text-zinc-500 text-sm">Off duty</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {member.is_clocked_in ? (
                          <button
                            onClick={() => clockOut(member.staff_id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer active:scale-95"
                          >
                            Clock Out
                          </button>
                        ) : (
                          <button
                            onClick={() => clockIn(member.staff_id)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer active:scale-95"
                          >
                            Clock In
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-zinc-400 hover:text-white p-2 transition cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Shifts Tab */}
        {!loading && activeTab === 'shifts' && (
          <>
            {shifts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-zinc-400">No shifts recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div
                    key={shift.shift_id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{shift.staff_name}</p>
                      <p className="text-zinc-500 text-sm">{formatDate(shift.clock_in)}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400">
                          {formatTime(shift.clock_in)} → {shift.clock_out ? formatTime(shift.clock_out) : <span className="text-emerald-400">Active</span>}
                        </span>
                        <span className="text-zinc-500">
                          {shift.duration_minutes 
                            ? formatDuration(shift.duration_minutes)
                            : formatDuration(getShiftDuration(shift.clock_in))
                          }
                        </span>
                      </div>
                      {(shift.total_sales !== undefined && shift.total_sales > 0) && (
                        <span className="text-emerald-400 font-medium">
                          £{shift.total_sales.toFixed(2)} sales
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        </main>

      {/* YAOFUS Pioneers Badge - Footer */}
      <footer className="py-6 flex flex-col items-center gap-1">
        <span className="text-zinc-500 text-[10px] font-medium tracking-wider">STAFF</span>
        <span className="text-base font-extrabold tracking-widest">
          <span className="text-emerald-500">Y</span>
          <span className="text-green-500">A</span>
          <span className="text-blue-500">O</span>
          <span className="text-indigo-500">F</span>
          <span className="text-violet-500">U</span>
          <span className="text-purple-500">S</span>
        </span>
        <span className="text-zinc-600 text-[10px] font-semibold tracking-wider">INSTANT</span>
        <div className="flex items-center gap-2 mt-2 text-zinc-600 text-sm">
          <img src="https://yesallofus.com/dltpayslogo1.png" alt="" className="w-5 h-5 rounded opacity-60" />
          <span>Powered by YesAllOfUs</span>
        </div>
      </footer>
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-zinc-400 hover:text-white p-2 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Photo */}
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  {formPhoto ? (
  <div className="relative">
    <img
      src={formPhoto}
      alt="Staff photo"
      className="w-24 h-24 rounded-full object-cover"
    />
    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition">
      <span className="text-white text-sm">Change</span>
    </div>
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormPhoto(null); }}
      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400 cursor-pointer"
    >
      ✕
    </button>
  </div>
) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center transition">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-zinc-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-zinc-500 text-xs">Add photo</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Staff name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Role</label>
                <div className="flex gap-2">
                  {(['cashier', 'manager', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition cursor-pointer active:scale-95 ${
                        formRole === role
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">PIN (optional)</label>
                <input
                  type="password"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-digit PIN"
                  maxLength={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 tracking-widest"
                />
                <p className="text-zinc-600 text-xs mt-1">For clock in verification</p>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Hourly Rate (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">£</span>
                  <input
                    type="number"
                    value={formHourlyRate}
                    onChange={(e) => setFormHourlyRate(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {editingStaff && (
                  <button
                    onClick={() => {
                      deleteStaff(editingStaff.staff_id);
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-xl transition cursor-pointer active:scale-95"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStaff}
                  disabled={saving || !formName.trim()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {saving ? 'Saving...' : editingStaff ? 'Save' : 'Add Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <StaffPage />
    </Suspense>
  );
}