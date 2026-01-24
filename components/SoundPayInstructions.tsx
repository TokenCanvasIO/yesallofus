'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SoundPayInstructionsProps {
  mode?: 'send' | 'receive';
  autoPlay?: boolean;
  showSteps?: boolean;
}

export default function SoundPayInstructions({ 
  mode = 'receive', 
  autoPlay = true,
  showSteps = true 
}: SoundPayInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % totalSteps);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoPlay]);

  const steps = mode === 'receive' 
    ? [
        { title: 'Tap to Listen', subtitle: 'Start receiving' },
        { title: 'Position Phone', subtitle: 'Hold near sender device' },
        { title: 'Payment Sent', subtitle: 'Automatic when sound heard' },
      ]
    : [
        { title: 'Wait for Receiver', subtitle: 'They tap Listen first' },
        { title: 'Position Devices', subtitle: 'Hold phones close together' },
        { title: 'Tap Send', subtitle: 'Broadcast payment sound' },
      ];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Animation Container */}
      <div className="relative h-56 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Tap to Listen / Wait for Receiver */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Phone */}
                <motion.div 
                  className="relative w-20 h-36 bg-zinc-800 rounded-2xl border-2 border-zinc-600 shadow-2xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-zinc-700 rounded-full" />
                  
                  {/* Screen */}
                  <div className="absolute inset-2 top-5 bg-zinc-900 rounded-xl flex flex-col items-center justify-center gap-2">
                    {mode === 'receive' ? (
                      <>
                        {/* Mic icon */}
                        <motion.div
                          className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </motion.div>
                        <span className="text-[8px] text-purple-300 font-medium">Listen</span>
                      </>
                    ) : (
                      <>
                        {/* Waiting indicator */}
                        <motion.div
                          className="flex gap-1"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-blue-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </motion.div>
                        <span className="text-[8px] text-blue-300 font-medium">Waiting</span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Tap finger */}
                {mode === 'receive' && (
                  <motion.div
                    className="absolute -bottom-4 -right-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [0.8, 1, 0.9, 1],
                      opacity: [0, 1, 1, 1],
                      y: [10, 0, 5, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Position Phones */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Vertical stack - receiver TOP near sender BOTTOM */}
              <div className="relative flex flex-col items-center">
                
                {/* Receiver Phone - positioned with TOP near sender's bottom */}
                <motion.div 
                  className="relative w-14 h-24 bg-zinc-800 rounded-xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 z-10"
                  animate={{ 
                    y: [0, 4, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Notch at TOP */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-zinc-700 rounded-full" />
                  {/* Screen */}
                  <div className="absolute inset-1.5 top-3.5 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg className="w-2.5 h-2.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-[8px] text-purple-400 font-medium whitespace-nowrap">
                    Receiver
                  </div>
                  {/* Arrow pointing to TOP of receiver */}
                  <motion.div 
                    className="absolute -right-8 top-2 text-purple-400"
                    animate={{ x: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.div>
                </motion.div>

                {/* Sound waves in the gap */}
                <div className="relative h-4 w-full flex items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full border border-emerald-400"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ 
                        scale: [0.5, 1.5, 2],
                        opacity: [0.8, 0.4, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                {/* Sender Phone - BOTTOM half is the connection point */}
                <motion.div 
                  className="relative w-14 h-24 bg-zinc-800 rounded-xl border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  {/* Notch at TOP */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-zinc-700 rounded-full" />
                  {/* Screen */}
                  <div className="absolute inset-1.5 top-3.5 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    >
                      <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[8px] text-blue-400 font-medium whitespace-nowrap">
                    Sender
                  </div>
                  {/* Arrow pointing to BOTTOM of sender */}
                  <motion.div 
                    className="absolute -right-8 bottom-2 text-blue-400"
                    animate={{ x: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.div>
                </motion.div>

                {/* Instruction callout */}
                <motion.div
                  className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col items-start gap-0.5"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-[7px] text-emerald-400 font-medium">TOP</span>
                  <div className="w-px h-6 bg-gradient-to-b from-emerald-500/50 to-transparent ml-1" />
                  <span className="text-[7px] text-emerald-400 font-medium">BOTTOM</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Complete */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Success burst */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10" />
                </motion.div>

                {/* Phone with success */}
                <motion.div 
                  className="relative w-20 h-36 bg-zinc-800 rounded-2xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/30"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-zinc-700 rounded-full" />
                  
                  {/* Screen */}
                  <div className="absolute inset-2 top-5 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center gap-2">
                    {/* Checkmark */}
                    <motion.div
                      className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <motion.svg 
                        className="w-6 h-6 text-emerald-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <motion.path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                        />
                      </motion.svg>
                    </motion.div>
                    <motion.span 
                      className="text-[8px] text-emerald-300 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Paid!
                    </motion.span>
                  </div>
                </motion.div>

                {/* Confetti particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'][i],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{ 
                      x: [0, (i % 2 ? 1 : -1) * (30 + i * 10)],
                      y: [0, -40 - i * 5, 20],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators and text */}
      {showSteps && (
        <div className="mt-4 text-center">
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === i 
                    ? 'w-6 bg-purple-500' 
                    : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-white font-semibold text-sm">
                {steps[currentStep].title}
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                {steps[currentStep].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}