// src/components/PremiumFeature.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface PremiumFeatureProps {
  userTier: 'free' | 'premium';
  children: React.ReactNode;
  featureName: string;
}

export function PremiumFeature({ userTier, children, featureName }: PremiumFeatureProps) {
  if (userTier === 'premium') {
    // Authorized: Render the actual feature (e.g., the VisionUploader)
    return <>{children}</>;
  }

  // Unauthorized: Render the Upsell Overlay
  return (
    <div className="relative rounded-xl border border-gray-800 bg-gray-900/20 p-6 overflow-hidden">
      {/* Blur the actual content slightly in the background to tease the feature */}
      <div className="opacity-20 blur-sm pointer-events-none filter select-none">
        {children}
      </div>
      
      {/* The Upsell Call to Action */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/60 z-10 p-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Unlock {featureName}</h3>
        <p className="text-gray-400 text-sm mb-4 max-w-sm">
          Upgrade to NOTEacher Premium to instantly analyze handwritten math, generate dynamic graphs, and access the voice tutor.
        </p>
        <Link 
          href="/pricing" 
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}