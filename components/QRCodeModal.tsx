'use client';
import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  subtitle?: string;
}

export default function QRCodeModal({ isOpen, onClose, url, title = "Share Your Link", subtitle }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: "svg",
      data: url,
      image: "/dltpayslogo1.png",
      dotsOptions: {
        color: "#10b981",
        type: "rounded"
      },
      cornersSquareOptions: {
        color: "#059669",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#047857",
        type: "dot"
      },
      backgroundOptions: {
        color: "#18181b"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.4
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [isOpen, url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({
        name: "yesallofus-qr",
        extension: "png"
      });
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const text = encodeURIComponent("Join me on YesAllofUs and start earning!");
    
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=Join%20YesAllofUs&body=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-zinc-800 rounded-xl p-4 mb-4 flex justify-center">
          <div ref={qrRef} className="rounded-lg overflow-hidden" />
        </div>

        {/* URL Display */}
        <div className="bg-zinc-800 rounded-lg p-3 mb-4">
          <p className="text-zinc-500 text-xs mb-1">Your Link</p>
          <p className="text-sm font-mono text-emerald-400 break-all">{url}</p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors mb-4 ${
            copied
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          }`}
        >
          {copied ? '✓ Copied to Clipboard!' : 'Copy Link'}
        </button>

        {/* Share Buttons */}
        <div className="mb-4">
          <p className="text-zinc-500 text-xs mb-3 text-center">Share via</p>
          <div className="flex justify-center gap-3">
            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            {/* Twitter/X */}
            <button
              onClick={() => handleShare('twitter')}
              className="w-12 h-12 bg-black hover:bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center transition-colors"
              title="Share on X"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare('facebook')}
              className="w-12 h-12 bg-[#1877F2] hover:bg-[#166fe5] rounded-full flex items-center justify-center transition-colors"
              title="Share on Facebook"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram')}
              className="w-12 h-12 bg-[#0088cc] hover:bg-[#007ab8] rounded-full flex items-center justify-center transition-colors"
              title="Share on Telegram"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>

            {/* Email */}
            <button
              onClick={() => handleShare('email')}
              className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors"
              title="Share via Email"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR Code
        </button>
      </div>
    </div>
  );
}