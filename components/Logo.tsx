'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Logo({ size = 40 }: { size?: number }) {
  const [use3D, setUse3D] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if device can handle 3D
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const hasGoodCPU = navigator.hardwareConcurrency > 4;
    
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    setUse3D(isDesktop && hasWebGL && hasGoodCPU);
    setChecked(true);
  }, []);

  // Show static logo until check completes (prevents flash)
  if (!checked) {
    return (
      <Image 
        src="/dltpayslogo1.png" 
        alt="YesAllofUs" 
        width={size} 
        height={size} 
        className="rounded-lg"
      />
    );
  }

  if (use3D) {
    return (
      <div style={{ width: size, height: size }}>
        {/* @ts-ignore - model-viewer is a web component */}
        <model-viewer
          src="https://arweave.net/hdTXnxScjddEJr4FIvLpfeC1ZaAOwIr5bANUZ9zDC9c"
          auto-rotate
          rotation-per-second="30deg"
          disable-zoom
          disable-tap
          disable-pan
          interaction-prompt="none"
          style={{ 
            width: '100%', 
            height: '100%',
            '--poster-color': 'transparent'
          }}
        />
      </div>
    );
  }

  return (
    <Image 
      src="/dltpayslogo1.png" 
      alt="YesAllofUs" 
      width={size} 
      height={size} 
      className="rounded-lg"
    />
  );
}