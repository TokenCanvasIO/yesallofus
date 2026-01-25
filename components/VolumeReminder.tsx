'use client';

import { motion } from 'framer-motion';

interface VolumeReminderProps {
  className?: string;
}

export default function VolumeReminder({ className = '' }: VolumeReminderProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Speaker with waves - fits space, facing UP */}
      <div className="relative w-24 h-32 flex flex-col items-center justify-end">
        {/* Sound waves going up */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 border-2 border-purple-500"
              style={{
                width: 30 + i * 20,
                height: 15 + i * 10,
                borderRadius: '50% 50% 0 0',
                borderBottom: 'none',
                bottom: i * 18,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -15],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Speaker icon pointing UP (rotate -90deg) */}
        <svg
          className="w-20 h-20 text-purple-500"
          style={{ transform: 'rotate(-90deg)' }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      </div>

      {/* Label below */}
      <p className="text-purple-500 text-sm font-semibold text-center mt-2">
        Turn volume above 50%
      </p>
    </div>
  );
}