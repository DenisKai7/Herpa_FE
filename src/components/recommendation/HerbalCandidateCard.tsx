'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HerbalCandidate,
  VerificationSource,
} from '@/lib/api/herbalRecommendation';
import {
  getRelevanceBadgeText,
  getRelevanceLevel,
  getRelevancePercent,
  getDataStatusLabel,
  getSafetyLabelV2,
  getEvidenceLabelV2,
  getSymptomPercent,
} from '@/lib/herbalRecommendationNormalize';

interface HerbalCandidateCardProps {
  candidate: HerbalCandidate;
  index: number;
  onClick: (item: HerbalCandidate) => void;
}

function plantIcon(candidate: HerbalCandidate) {
  const name = candidate.local_name.toLowerCase();
  if (name.includes('jahe')) return '🫚';
  if (name.includes('kunyit') || name.includes('temu')) return '🟨';
  if (name.includes('jeruk')) return '🍋';
  if (name.includes('daun')) return '🍃';
  return '🌿';
}

function getVerificationSourceFromCandidate(candidate: HerbalCandidate): VerificationSource {
  const vs = candidate.overall_verification_status;
  if (vs === 'fully_verified') return 'knowledge_graph';
  if (vs === 'source_verified') return 'trusted_source';
  if (vs === 'fully_graph_verified' || vs === 'graph_and_model_verified') return 'graph_and_model';
  if (vs === 'model_assisted_limited') return 'model_assisted';
  if (vs === ('graph_verified' as string)) return 'graph_verified';
  if (vs === ('graph_model_verified' as string)) return 'graph_model_verified';
  return 'unavailable';
}

function renderVerificationBadge(source: VerificationSource, candidate?: HerbalCandidate) {
  const styles: Record<string, string> = {
    knowledge_graph: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40',
    trusted_source: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
    graph_and_model: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40',
    model_assisted: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40',
    safety_rule: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40',
    unavailable: 'bg-gray-100 dark:bg-gray-950/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800/40',
    graph_verified: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40',
    graph_model_verified: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40',
  };
  const labels: Record<string, string> = {
    knowledge_graph: 'Terverifikasi Knowledge Graph',
    trusted_source: 'Sumber Tepercaya',
    graph_and_model: 'Knowledge Graph + Validasi AI',
    model_assisted: 'Panduan umum berbantuan AI',
    safety_rule: 'Aturan keselamatan',
    unavailable: candidate ? getDataStatusLabel(candidate) : 'Data masih terbatas',
    graph_verified: 'Terverifikasi Knowledge Graph',
    graph_model_verified: 'Knowledge Graph + Validasi AI',
  };
  return (
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full border', styles[source] || styles.unavailable)}>
      {labels[source] || (candidate ? getDataStatusLabel(candidate) : 'Data masih terbatas')}
    </span>
  );
}

function renderRelevanceBadge(candidate: HerbalCandidate) {
  const level = getRelevanceLevel(candidate);
  const styles: Record<string, string> = {
    high: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40',
    medium: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40',
    low: 'bg-gray-100 dark:bg-gray-950/40 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800/40',
    unknown: 'bg-gray-100 dark:bg-gray-950/40 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800/40',
  };
  return (
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full border', styles[level] ?? styles.unknown)}>
      {getRelevanceBadgeText(candidate)}
    </span>
  );
}

function renderSafetyStatusBadge(candidate: HerbalCandidate) {
  const status = candidate.safety_status ?? 'unknown';
  const styles: Record<string, string> = {
    safe: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',
    eligible: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',
    caution: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300',
    conditional: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300',
    unsafe: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',
    excluded: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',
    unknown: 'bg-slate-100 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300',
  };
  return (
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full', styles[status] ?? styles.unknown)}>
      {getSafetyLabelV2(candidate)}
    </span>
  );
}

function uniqueText(values?: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values ?? []) {
    const text = typeof value === 'string'
      ? value.trim()
      : typeof value === 'object' && value !== null
        ? String((value as Record<string, unknown>).name ?? (value as Record<string, unknown>).title ?? '').trim()
        : String(value ?? '').trim();
    const key = text.toLowerCase().replace(/\s+/g, ' ');

    if (!text || seen.has(key)) continue;

    seen.add(key);
    result.push(text);
  }

  return result;
}

function getMatchedSymptomSummary(candidate: HerbalCandidate): string | null {
  const symptoms = uniqueText(candidate.matched_symptoms?.length ? candidate.matched_symptoms : candidate.related_symptoms).slice(0, 3);
  if (symptoms.length > 0) return `Cocok untuk: ${symptoms.join(', ')}`;

  const reason = candidate.match_reasons?.find((item) => item?.trim());
  if (reason) return reason;

  return candidate.explanation || candidate.reason || null;
}

export function HerbalCandidateCard({ candidate, index, onClick }: HerbalCandidateCardProps) {
  const vs = getVerificationSourceFromCandidate(candidate);
  const symptomSummary = getMatchedSymptomSummary(candidate);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Card Header (Icon, Name, Scientific Name) */}
        <div className="flex items-start gap-4">
          <div className="text-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-850 h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
            {plantIcon(candidate)}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base pr-4">
              {candidate.local_name}
            </h4>
            <p className="text-xs text-gray-400 italic font-medium truncate pr-4">
              {candidate.scientific_name || 'Nama ilmiah belum tersedia'}
            </p>
          </div>
        </div>

        {/* Badges Container */}
        <div className="flex flex-wrap gap-1.5">
          {renderRelevanceBadge(candidate)}
          {renderSafetyStatusBadge(candidate)}
          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
            {getEvidenceLabelV2(candidate)}
          </span>
        </div>

        {symptomSummary && (
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 font-semibold line-clamp-2">
            {symptomSummary}
          </p>
        )}

        {/* Verification Status */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
          <span className="font-semibold">Status Verifikasi</span>
          {renderVerificationBadge(vs, candidate)}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase">
          <span className="flex items-center gap-1">
            Relevansi: {getRelevancePercent(candidate)}%
          </span>
          {getSymptomPercent(candidate) > 0 && (
            <span className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-4">
              Gejala Cocok: {getSymptomPercent(candidate)}%
            </span>
          )}
        </div>
        <button
          onClick={() => onClick(candidate)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          Detail
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
