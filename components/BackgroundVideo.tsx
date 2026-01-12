'use client';

import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  src: string;
  overlay?: boolean;
}

export default function BackgroundVideo({ 
  src, 
  overlay = true 
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4; // 40% speed (60% slower)
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute min-w-full min-h-full w-full h-full object-cover"
      >
        <source src={src} type="video/webm" />
      </video>
      {overlay && <div className="absolute inset-0 bg-black/40" />}
    </div>
  );
}
