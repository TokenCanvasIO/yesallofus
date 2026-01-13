'use client';

import { NextStepProvider, NextStep } from 'nextstepjs';
import { tourSteps as affiliateTourSteps } from './AffiliateDashboardTour';
import { tourSteps as vendorTourSteps } from './VendorDashboardTour';
import TourCard from './TourCard';
import { tourSteps as takePaymentTourSteps } from './TakePaymentTour';

const allTourSteps = [...affiliateTourSteps, ...vendorTourSteps, ...takePaymentTourSteps];

export default function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep 
        steps={allTourSteps}
        cardComponent={TourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.8"
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}