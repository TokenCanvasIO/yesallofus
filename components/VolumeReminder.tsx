'use client';

import { motion } from 'framer-motion';

interface VolumeReminderProps {
  className?: string;
}

export default function VolumeReminder({ className = '' }: VolumeReminderProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Animated Speaker */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Sound waves */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-4 top-1/2 -translate-y-1/2 border-2 border-purple-400 rounded-full"
              style={{
                width: 8 + i * 8,
                height: 8 + i * 8,
                borderRadius: '0 50% 50% 0',
                borderLeft: 'none',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1, 1.1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>

        {/* Speaker icon */}
        <motion.svg
          className="w-8 h-8 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6z"
          />
        </motion.svg>
      </div>

      {/* Label */}
      <motion.p
        className="text-purple-300 text-xs font-medium text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Turn volume above 50%
      </motion.p>
    </div>
  );
}