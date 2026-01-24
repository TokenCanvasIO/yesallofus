'use client';

import { motion } from 'framer-motion';

interface MoveCloserAnimationProps {
  className?: string;
}

export default function MoveCloserAnimation({ className = '' }: MoveCloserAnimationProps) {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 min-h-[280px] py-6 ${className}`}>
      {/* Main animation area */}
      <div className="relative flex flex-col items-center justify-center flex-1 w-full">
        
        {/* Sound waves emanating upward */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 rounded-full border border-purple-500/60"
              style={{ width: 40 + i * 20, height: 20 + i * 10 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: [30, -30, -90],
                scale: [0.8, 1, 1.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.35,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Phone moving down (suggesting "bring closer") */}
        <motion.div
          className="relative z-10 mt-8"
          animate={{ 
            y: [0, 20, 0],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Phone body */}
          <div className="relative w-28 h-52 bg-zinc-800/80 rounded-3xl border-2 border-purple-500/50 shadow-xl shadow-purple-500/30 backdrop-blur-sm">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-zinc-700 rounded-full" />
            
            {/* Screen */}
            <div className="absolute inset-3 top-7 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
              {/* Mic icon pulsing */}
              <motion.div
                className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </motion.div>
            </div>
            
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-600 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Instruction text */}
      <motion.p 
        className="text-zinc-400 text-base mt-8 text-center font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Hold phone near sender device
      </motion.p>
    </div>
  );
}