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
  const [devicePair, setDevicePair] = useState(0);
  const totalSteps = 4;

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % totalSteps);
    }, 13500);
    
    return () => clearInterval(interval);
  }, [autoPlay]);

  // Cycle device pairs when on step 3 (device compatibility)
  useEffect(() => {
    if (currentStep !== 2) return;
    
    const deviceInterval = setInterval(() => {
      setDevicePair((prev) => (prev + 1) % 3);
    }, 4500);
    
    return () => clearInterval(deviceInterval);
  }, [currentStep]);

  const steps = mode === 'receive' 
    ? [
        { title: 'Tap to Listen', subtitle: 'Start receiving' },
        { title: 'Position Phone', subtitle: 'Hold near sender device' },
        { title: 'Works Everywhere', subtitle: 'Any device to any device' },
        { title: 'Payment Sent', subtitle: 'Automatic when sound heard' },
      ]
    : [
        { title: 'Wait for Receiver', subtitle: 'They tap Listen first' },
        { title: 'Position Devices', subtitle: 'Hold phones close together' },
        { title: 'Works Everywhere', subtitle: 'Any device to any device' },
        { title: 'Tap Send', subtitle: 'Broadcast payment sound' },
      ];

  return (
    <div className="w-full">
      {/* Animation Container */}
      <div className="relative w-full h-40 md:h-80 rounded-2xl overflow-hidden">
        
        {/* Ambient glow - subtle */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        {/* Scale wrapper for desktop/tablet */}
        <div className="absolute inset-0 md:scale-[2] md:origin-center">
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
                  className="relative w-14 h-24 bg-zinc-800 rounded-xl border-2 border-zinc-600 shadow-2xl"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-1 bg-zinc-700 rounded-full" />
                  
                  {/* Screen */}
                  <div className="absolute inset-1.5 top-4 bg-zinc-900 rounded-lg flex flex-col items-center justify-center gap-1">
                    {mode === 'receive' ? (
                      <>
                        {/* Mic icon */}
                        <motion.div
                          className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 6.75, repeat: Infinity }}
                        >
                          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </motion.div>
                        <span className="text-[7px] text-purple-300 font-medium">Listen</span>
                      </>
                    ) : (
                      <>
                        {/* Waiting indicator */}
                        <motion.div
                          className="flex gap-1"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 6.75, repeat: Infinity }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 rounded-full bg-blue-400"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 2.7, repeat: Infinity, delay: i * 0.675 }}
                            />
                          ))}
                        </motion.div>
                        <span className="text-[7px] text-blue-300 font-medium">Waiting</span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Tap finger */}
                {mode === 'receive' && (
                  <motion.div
                    className="absolute -bottom-2 -right-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [0.8, 1, 0.9, 1],
                      opacity: [0, 1, 1, 1],
                      y: [8, 0, 4, 0]
                    }}
                    transition={{ duration: 6.75, repeat: Infinity }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Position Phones - ORIGINAL VERTICAL LAYOUT */}
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
                  className="relative w-10 h-[72px] bg-zinc-800 rounded-lg border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 z-10"
                  animate={{ 
                    y: [0, 3, 0],
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Notch at TOP */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-zinc-700 rounded-full" />
                  {/* Screen */}
                  <div className="absolute inset-1 top-2.5 bg-purple-500/10 rounded flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 4.5, repeat: Infinity }}
                    >
                      <svg className="w-2 h-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[7px] text-purple-400 font-medium whitespace-nowrap">
                    Receiver
                  </div>
                </motion.div>

                {/* Sound waves in the gap */}
                <div className="relative h-2 w-full flex items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full border border-emerald-400"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ 
                        scale: [0.5, 1.5, 2],
                        opacity: [0.8, 0.4, 0],
                      }}
                      transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        delay: i * 1.125,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                {/* Sender Phone - BOTTOM half is the connection point */}
                <motion.div 
                  className="relative w-10 h-[72px] bg-zinc-800 rounded-lg border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.25 }}
                >
                  {/* Notch at TOP */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-zinc-700 rounded-full" />
                  {/* Screen */}
                  <div className="absolute inset-1 top-2.5 bg-blue-500/10 rounded flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 4.5, repeat: Infinity, delay: 1.35 }}
                    >
                      <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[7px] text-blue-400 font-medium whitespace-nowrap">
                    Sender
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Different Device Combinations - NEW */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-center gap-4">
                {/* Receiver Device */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`receiver-${devicePair}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Phone */}
                    {devicePair === 0 && (
                      <div className="w-8 h-14 bg-zinc-800 rounded-lg border-2 border-purple-500/50 flex items-center justify-center">
                        <div className="w-5 h-9 bg-purple-500/20 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Tablet */}
                    {devicePair === 1 && (
                      <div className="w-12 h-16 bg-zinc-800 rounded-lg border-2 border-purple-500/50 flex items-center justify-center">
                        <div className="w-9 h-12 bg-purple-500/20 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Phone again */}
                    {devicePair === 2 && (
                      <div className="w-8 h-14 bg-zinc-800 rounded-lg border-2 border-purple-500/50 flex items-center justify-center">
                        <div className="w-5 h-9 bg-purple-500/20 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Sound waves */}
                <div className="relative w-8 flex items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full border border-emerald-400"
                      animate={{ 
                        scale: [0.5, 1.5, 2],
                        opacity: [0.8, 0.4, 0],
                        x: [0, 8, 16]
                      }}
                      transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        delay: i * 1.125,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                {/* Sender Device */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`sender-${devicePair}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Laptop */}
                    {devicePair === 0 && (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-10 bg-zinc-800 rounded-t-lg border-2 border-b-0 border-blue-500/50 flex items-center justify-center">
                          <div className="w-12 h-7 bg-blue-500/20 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-20 h-1.5 bg-zinc-700 rounded-b-lg border-2 border-t-0 border-blue-500/50" />
                      </div>
                    )}
                    {/* Laptop */}
                    {devicePair === 1 && (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-10 bg-zinc-800 rounded-t-lg border-2 border-b-0 border-blue-500/50 flex items-center justify-center">
                          <div className="w-12 h-7 bg-blue-500/20 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-20 h-1.5 bg-zinc-700 rounded-b-lg border-2 border-t-0 border-blue-500/50" />
                      </div>
                    )}
                    {/* Tablet */}
                    {devicePair === 2 && (
                      <div className="w-12 h-16 bg-zinc-800 rounded-lg border-2 border-blue-500/50 flex items-center justify-center">
                        <div className="w-9 h-12 bg-blue-500/20 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment Complete */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
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
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10" />
                </motion.div>

                {/* Phone with success */}
                <motion.div 
                  className="relative w-14 h-24 bg-zinc-800 rounded-xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/30"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.35, delay: 0.9 }}
                >
                  {/* Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-1 bg-zinc-700 rounded-full" />
                  
                  {/* Screen */}
                  <div className="absolute inset-1.5 top-4 bg-emerald-500/10 rounded-lg flex flex-col items-center justify-center gap-1">
                    {/* Checkmark */}
                    <motion.div
                      className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 2.25, delay: 1.35 }}
                    >
                      <motion.svg 
                        className="w-4 h-4 text-emerald-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <motion.path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.8, delay: 2.25 }}
                        />
                      </motion.svg>
                    </motion.div>
                    <motion.span 
                      className="text-[7px] text-emerald-300 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.15 }}
                    >
                      Paid!
                    </motion.span>
                  </div>
                </motion.div>

                {/* Confetti particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'][i],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{ 
                      x: [0, (i % 2 ? 1 : -1) * (20 + i * 8)],
                      y: [0, -30 - i * 4, 15],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 4.5, delay: 1.8 + i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Step indicators and text */}
      {showSteps && (
        <div className="mt-3 text-center">
          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === i 
                    ? 'w-4 bg-purple-500' 
                    : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-white font-semibold text-xs">
                {steps[currentStep].title}
              </h3>
              <p className="text-zinc-500 text-[10px] mt-0.5">
                {steps[currentStep].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}