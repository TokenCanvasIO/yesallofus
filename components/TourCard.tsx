'use client';

import type { CardComponentProps } from 'nextstepjs';

export default function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  // Safety check - if step is undefined, return null
  if (!step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">
          {currentStep + 1} of {totalSteps}
        </span>
        {step.showSkip && (
          <button
            onClick={skipTour}
            className="text-xs text-zinc-500 hover:text-white"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Title */}
      <h3 className="text-white text-base font-semibold mb-2">{step.title}</h3>

      {/* Content */}
      <p className="text-zinc-400 text-sm leading-relaxed mb-5">
        {step.content}
      </p>

      {/* Navigation */}
      {step.showControls && (
        <div className="flex gap-3">
          {!isFirst && (
            <button
              onClick={prevStep}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium"
            >
              Back
            </button>
          )}
          <button
            onClick={isLast ? skipTour : nextStep}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-semibold"
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      )}

      {arrow}
    </div>
  );
}