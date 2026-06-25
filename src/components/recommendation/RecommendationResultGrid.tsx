'use client';

import React from 'react';
import { HerbalCandidate } from '@/lib/api/herbalRecommendation';
import { HerbalCandidateCard } from './HerbalCandidateCard';

interface RecommendationResultGridProps {
  candidates: HerbalCandidate[];
  onCardClick: (item: HerbalCandidate) => void;
}

function normalizeScientificName(value: string | null) {
  const authorSuffixes = new Set(['l', 'linn', 'linnaeus', 'roxb', 'roscoe', 'willd', 'nees', 'kunth', 'griff']);
  const parts = (value ?? '').toLowerCase().replace(/[.,()]/g, ' ').split(/\s+/).filter(Boolean);
  while (parts.length > 2 && authorSuffixes.has(parts[parts.length - 1])) parts.pop();
  return parts.join(' ');
}

function candidateKey(candidate: HerbalCandidate) {
  return candidate.canonical_key || normalizeScientificName(candidate.scientific_name) || candidate.herb_id || candidate.local_name.toLowerCase();
}

export function uniqueCandidates(candidates: HerbalCandidate[]) {
  const map = new Map<string, HerbalCandidate>();
  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    if (!map.has(key)) map.set(key, candidate);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0) ||
      (a.scientific_name || a.local_name).localeCompare(b.scientific_name || b.local_name)
  );
}

export function RecommendationResultGrid({
  candidates,
  onCardClick,
}: RecommendationResultGridProps) {
  const uniqs = uniqueCandidates(candidates);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
      {uniqs.map((plant, index) => (
        <HerbalCandidateCard
          key={`${candidateKey(plant)}-${index}`}
          candidate={plant}
          index={index}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
