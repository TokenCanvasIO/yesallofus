'use client';

import { useEffect, useState, useRef } from 'react';

interface NebulaBackgroundProps {
  opacity?: number;
  blur?: number;
}

const VIDEOS = ['/nebula-bg.webm'];
const CYCLE_DURATION = 60000; // 1 minute

export default function NebulaBackground({ opacity = 0.4, blur = 0 }: NebulaBackgroundProps) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      
      setTimeout(() => {
        setCurrentVideo(prev => (prev + 1) % VIDEOS.length);
        setFading(false);
      }, 1000); // 1s fade transition
      
    }, CYCLE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Play video when source changes
  useEffect(() => {
  if (videoRef.current) {
    videoRef.current.load();
    videoRef.current.playbackRate = 0.3;
    videoRef.current.play().catch(() => {});
  }
}, [currentVideo]);

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ 
          opacity: fading ? 0 : opacity,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        <source src={VIDEOS[currentVideo]} type="video/webm" />
<source src="/nebula-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}