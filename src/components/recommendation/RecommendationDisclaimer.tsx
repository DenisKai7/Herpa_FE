'use client';

import React from 'react';
import { Info } from 'lucide-react';

const medicalDisclaimer = 'Informasi ini bersifat edukatif dan bukan diagnosis atau pengganti tenaga kesehatan.';

export function RecommendationDisclaimer() {
  return (
    <div className="w-full max-w-xl mx-auto mt-8 flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
      <Info className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-[11px] leading-relaxed font-semibold">PENTING / DISCLAIMER MEDIS</p>
        <p className="text-[10px] leading-relaxed opacity-90">{medicalDisclaimer}</p>
      </div>
    </div>
  );
}
