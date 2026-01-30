'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string, format: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

export default function BarcodeScanner({ onScan, onError, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    const scannerId = 'barcode-scanner-container';
    let mounted = true;

    const startScanner = async () => {
      try {
        // Create scanner instance
        const scanner = new Html5Qrcode(scannerId, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = scanner;

        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          throw new Error('No cameras found');
        }

        // Prefer back camera
        const backCamera = cameras.find(c =>
          c.label.toLowerCase().includes('back') ||
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('environment')
        );
        const cameraId = backCamera?.id || cameras[0].id;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777778,
          },
          (decodedText, result) => {
            // Prevent duplicate scans within 2 seconds
            if (decodedText === lastScanned) return;
            setLastScanned(decodedText);
            setTimeout(() => setLastScanned(null), 2000);

            // Vibrate on success
            if (navigator.vibrate) navigator.vibrate(100);

            // Play beep sound
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = 1800;
              oscillator.type = 'sine';
              gainNode.gain.value = 0.1;
              oscillator.start();
              oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
              // Audio not available
            }

            // Get format name
            const formatName = result.result.format?.formatName || 'Unknown';

            // Stop scanner and return result
            scanner.stop().then(() => {
              if (mounted) {
                onScan(decodedText, formatName);
              }
            }).catch(() => {});
          },
          () => {
            // Ignore scan failures (no barcode in frame)
          }
        );

        if (mounted) {
          setHasPermission(true);
          setIsStarting(false);
        }
      } catch (err: any) {
        console.error('Scanner error:', err);
        if (mounted) {
          setHasPermission(false);
          setIsStarting(false);
          if (err.message?.includes('Permission')) {
            onError?.('Camera permission denied. Please allow camera access.');
          } else if (err.message?.includes('NotFound') || err.message?.includes('No cameras')) {
            onError?.('No camera found on this device.');
          } else {
            onError?.(err.message || 'Failed to start camera');
          }
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, onError]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (barcode) {
      // Stop scanner if running
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      onScan(barcode, 'Manual');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[80] flex flex-col">
      {/* Header */}
      <div className="safe-area-top bg-black/80 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white font-bold text-lg">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera feed container */}
        <div
          id="barcode-scanner-container"
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Loading state */}
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Permission denied state */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 p-6">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Camera Access Required</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Please enable camera permissions in your browser settings to scan barcodes.
              </p>
              <button
                onClick={() => setShowManualInput(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl transition"
              >
                Enter Barcode Manually
              </button>
            </div>
          </div>
        )}

        {/* Scan overlay - only show when camera is active */}
        {hasPermission && !isStarting && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Scan window */}
            <div className="relative">
              {/* Clear window */}
              <div
                className="w-72 h-40 border-2 border-emerald-400 rounded-xl bg-transparent relative"
                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}
              >
                {/* Corner markers */}
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Scanning line animation */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400/80 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="safe-area-bottom bg-black/80 backdrop-blur">
        <div className="p-4 space-y-3">
          {/* Instructions */}
          <p className="text-zinc-400 text-sm text-center">
            Position the barcode within the frame
          </p>

          {/* Manual entry toggle */}
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full text-emerald-400 text-sm py-2 hover:text-emerald-300 transition"
          >
            {showManualInput ? 'Hide manual entry' : 'Enter barcode manually'}
          </button>

          {/* Manual entry form */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-xl transition"
              >
                Go
              </button>
            </form>
          )}

          {/* Supported formats info */}
          <p className="text-zinc-600 text-xs text-center">
            Supports EAN-13, UPC-A, Code 128, QR Code & more
          </p>
        </div>
      </div>
    </div>
  );
}
