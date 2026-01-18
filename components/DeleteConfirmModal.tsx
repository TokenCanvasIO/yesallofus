'use client';
import { useState } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Data',
  description = 'This will permanently delete all your data. This action cannot be undone.',
  confirmText = 'DELETE',
  loading = false
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const handleClose = () => {
    setStep('warning');
    setInputValue('');
    onClose();
  };

  const handleProceed = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (inputValue === confirmText) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl shadow-red-500/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/10 border-b border-red-500/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-red-400 text-sm">This action is irreversible</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'warning' ? (
            <>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-zinc-300 text-sm leading-relaxed">{description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>All affiliate connections removed</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Earnings history deleted</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Wallet disconnected</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>NFC cards unlinked</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium py-3 rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-zinc-400 text-sm mb-4">
                Type <span className="text-red-400 font-mono font-bold">{confirmText}</span> to confirm deletion:
              </p>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                placeholder={confirmText}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-red-500/50 rounded-xl px-4 py-3 text-white font-mono text-center text-lg tracking-widest placeholder:text-zinc-600 outline-none transition mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={inputValue !== confirmText || loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}