'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HerbalCandidate,
  HerbEnrichmentDetail,
  dedupeSources,
} from '@/lib/api/herbalRecommendation';
import { formatSafetyFieldStatus } from '@/lib/herbalRecommendationNormalize';
import { DetailTab } from '@/hooks/useHerbalRecommendation';

const emptyText = 'Informasi belum tersedia pada knowledge graph.';

interface HerbalDetailTabsProps {
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  candidate: HerbalCandidate;
  detail: HerbEnrichmentDetail | null;
  detailLoading: boolean;
  detailError?: string;
}

function asArray<T>(value?: T[] | null): T[] {
  return Array.isArray(value) ? value : [];
}

function textFromUnknown(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    return String(item.name ?? item.title ?? item.description ?? item.claim ?? item.condition ?? item.substance ?? '');
  }
  return String(value);
}

function itemKey(prefix: string, item: unknown, index: number) {
  if (typeof item === 'object' && item !== null) {
    const record = item as Record<string, unknown>;
    return String(record.id ?? record.method_id ?? record.usage_rule_id ?? record.claim_id ?? `${prefix}-${index}`);
  }
  return `${prefix}-${index}-${String(item)}`;
}

export function HerbalDetailTabs({
  activeTab,
  setActiveTab,
  candidate,
  detail,
  detailLoading,
  detailError,
}: HerbalDetailTabsProps) {
  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'tradisional', label: 'Penggunaan Tradisional' },
    { id: 'pengolahan', label: 'Cara Pengolahan' },
    { id: 'aturan', label: 'Aturan Pakai' },
    { id: 'peringatan', label: 'Peringatan' },
    { id: 'sumber', label: 'Sumber' },
    { id: 'lanjutan', label: 'Lanjutan' },
  ];

  // Helper arrays merging analyze fields and details fields
  const mergeArr = (field: keyof HerbalCandidate | keyof HerbEnrichmentDetail) => {
    const fromCand = candidate[field as keyof HerbalCandidate];
    const fromDetail = detail ? detail[field as keyof HerbEnrichmentDetail] : null;
    return [
      ...asArray(fromCand as any),
      ...asArray(fromDetail as any),
    ].map(textFromUnknown).filter(Boolean);
  };

  const plantParts = [
    ...asArray(candidate.plant_parts),
    ...asArray(candidate.enrichment?.plant_parts),
    ...(detail ? asArray(detail.plant_parts) : []),
  ].map(textFromUnknown).filter(Boolean);

  const relatedSymptoms = [
    ...asArray(candidate.matched_symptoms),
    ...asArray(candidate.related_symptoms),
    ...asArray(candidate.enrichment?.related_symptoms).flatMap((symptom) => [symptom.name, ...(symptom.aliases ?? [])]),
    ...(detail ? asArray(detail.related_symptoms).flatMap((symptom) => [symptom.name, ...(symptom.aliases ?? [])]) : []),
  ].map(textFromUnknown).filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Tab Header Buttons */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-150 dark:border-gray-800 pb-3 mb-4 shrink-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap cursor-pointer',
              activeTab === tab.id
                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50'
            )}
          >
            {tab.id === 'peringatan' && (candidate.contraindications?.length || candidate.drug_interactions?.length || candidate.risk_groups?.length) ? (
              <span className="flex items-center gap-1.5">
                {tab.label}
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </span>
            ) : (
              tab.label
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels with Lazy Load State */}
      <div className="flex-1 overflow-y-auto pr-1">
        {detailLoading && (
          <div className="flex items-center justify-center py-10 gap-2.5 text-xs text-green-600 dark:text-green-400">
            <span className="animate-spin text-lg">&#9696;</span>
            Memuat detail dari knowledge graph...
          </div>
        )}

        {detailError && (
          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900/40 rounded-2xl mb-4 leading-relaxed">
            Gagal memperkaya data dari knowledge graph: {detailError} (Menampilkan data ringkasan keluhan)
          </div>
        )}

        {/* Tab 1: Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Deskripsi Botani</h5>
              <p className="leading-relaxed bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                {candidate.enrichment?.description || detail?.description || 'Deskripsi botani belum tersedia.'}
              </p>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Bagian yang Digunakan</h5>
              {plantParts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {plantParts.map((part) => (
                    <span key={part} className="px-3 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-800/40 text-green-700 dark:text-green-300 rounded-full font-semibold">
                      {part}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Gejala Terkait</h5>
              {relatedSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {relatedSymptoms.map((symptom) => (
                    <span key={symptom} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Tradisional */}
        {activeTab === 'tradisional' && (
          <div className="space-y-4 text-xs">
            <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Catatan Penggunaan Tradisional</h5>
            {mergeArr('traditional_uses').length > 0 ? (
              <ul className="space-y-2.5">
                {mergeArr('traditional_uses').map((item, idx) => (
                  <li key={itemKey('trad', item, idx)} className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {textFromUnknown(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
            )}
          </div>
        )}

        {/* Tab 3: Pengolahan */}
        {activeTab === 'pengolahan' && (
          <div className="space-y-4 text-xs">
            <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Metode Pengolahan Rumah Tangga</h5>
            {mergeArr('preparation_methods').length > 0 ? (
              <ul className="space-y-3">
                {mergeArr('preparation_methods').map((item, idx) => (
                  <li key={itemKey('prep', item, idx)} className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {textFromUnknown(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
            )}
          </div>
        )}

        {/* Tab 4: Aturan Pakai */}
        {activeTab === 'aturan' && (
          <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Panduan Penggunaan Ramuan</h5>
              {mergeArr('usage_guidelines').length > 0 ? (
                <ul className="space-y-2.5">
                  {mergeArr('usage_guidelines').map((item, idx) => (
                    <li key={itemKey('usage', item, idx)} className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 leading-relaxed font-medium">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Petunjuk Dosis Klinis</h5>
              {mergeArr('clinical_guidelines').length > 0 ? (
                <ul className="space-y-2.5">
                  {mergeArr('clinical_guidelines').map((item, idx) => (
                    <li key={itemKey('clinical', item, idx)} className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Peringatan */}
        {activeTab === 'peringatan' && (
          <div className="space-y-6 text-xs">
            {/* Contraindications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Kontraindikasi</h5>
                {candidate.field_verifications?.find(f => f.field_name === 'contraindications') && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {candidate.field_verifications.find(f => f.field_name === 'contraindications')?.verification_source === 'graph_verified' ? 'Terverifikasi' : 'Validasi AI'}
                  </span>
                )}
              </div>
              {mergeArr('contraindications').length > 0 ? (
                <ul className="space-y-2">
                  {mergeArr('contraindications').map((item, idx) => (
                    <li key={itemKey('contra', item, idx)} className="p-3 bg-red-50/10 dark:bg-red-950/10 border border-red-200 dark:border-red-950/40 text-red-700 dark:text-red-300 rounded-2xl leading-relaxed font-semibold">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300">
                  Status Kontraindikasi: <span className="font-bold">{formatSafetyFieldStatus(candidate.contraindication_status?.status)}</span>
                </div>
              )}
            </div>

            {/* Drug Interactions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Interaksi Obat Medis</h5>
                {candidate.field_verifications?.find(f => f.field_name === 'drug_interactions') && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {candidate.field_verifications.find(f => f.field_name === 'drug_interactions')?.verification_source === 'graph_verified' ? 'Terverifikasi' : 'Validasi AI'}
                  </span>
                )}
              </div>
              {mergeArr('drug_interactions').length > 0 ? (
                <ul className="space-y-2">
                  {mergeArr('drug_interactions').map((item, idx) => (
                    <li key={itemKey('drug', item, idx)} className="p-3 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded-2xl leading-relaxed font-medium">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300">
                  Status Interaksi Obat: <span className="font-bold">{formatSafetyFieldStatus(candidate.interaction_status?.status)}</span>
                </div>
              )}
            </div>

            {/* Population Risks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Kelompok Berisiko Tinggi</h5>
                {candidate.field_verifications?.find(f => f.field_name === 'population_risks') && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {candidate.field_verifications.find(f => f.field_name === 'population_risks')?.verification_source === 'graph_verified' ? 'Terverifikasi' : 'Validasi AI'}
                  </span>
                )}
              </div>
              {mergeArr('risk_groups').length > 0 ? (
                <ul className="space-y-2">
                  {mergeArr('risk_groups').map((item, idx) => (
                    <li key={itemKey('pop', item, idx)} className="p-3 bg-orange-50/20 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/40 text-orange-800 dark:text-orange-300 rounded-2xl leading-relaxed font-medium">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300">
                  Status Kelompok Rentan: <span className="font-bold">{formatSafetyFieldStatus(candidate.risk_group_status?.status)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Sumber */}
        {activeTab === 'sumber' && (
          <div className="space-y-4 text-xs">
            <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Sumber Informasi & Rujukan Ilmiah</h5>
            {[
              ...(candidate.evidence_sources ?? []).map((source) => source as Record<string, unknown>),
              ...(candidate.sources ?? []).map((source) => ({
                source_id: source.source_id,
                title: source.title,
                identifier: source.identifier,
                year: source.year,
                url: source.url,
              })),
              ...asArray(candidate.traditional_uses).flatMap((item) => typeof item === 'object' ? (item.sources ?? []) : []),
              ...asArray(candidate.enrichment?.traditional_uses).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.preparation_methods).flatMap((item) => 'sources' in item ? (item.sources ?? []) : []),
              ...asArray(candidate.enrichment?.preparation_methods).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.usage_guidelines).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.enrichment?.usage_guidelines).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.safety_warnings).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.enrichment?.safety_warnings).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.clinical_guidelines).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.enrichment?.clinical_guidelines).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.claims).flatMap((item) => item.sources ?? []),
              ...asArray(candidate.enrichment?.claims).flatMap((item) => item.sources ?? []),
              ...(detail ? asArray(detail.sources) : []),
            ].length > 0 ? (
              <ul className="space-y-2.5">
                {dedupeSources([
                  ...(candidate.evidence_sources ?? []).map((source) => source as Record<string, unknown>),
                  ...(candidate.sources ?? []).map((source) => ({
                    source_id: source.source_id,
                    title: source.title,
                    identifier: source.identifier,
                    year: source.year,
                    url: source.url,
                  })),
                  ...asArray(candidate.traditional_uses).flatMap((item) => typeof item === 'object' ? (item.sources ?? []) : []),
                  ...asArray(candidate.enrichment?.traditional_uses).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.preparation_methods).flatMap((item) => 'sources' in item ? (item.sources ?? []) : []),
                  ...asArray(candidate.enrichment?.preparation_methods).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.usage_guidelines).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.enrichment?.usage_guidelines).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.safety_warnings).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.enrichment?.safety_warnings).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.clinical_guidelines).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.enrichment?.clinical_guidelines).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.claims).flatMap((item) => item.sources ?? []),
                  ...asArray(candidate.enrichment?.claims).flatMap((item) => item.sources ?? []),
                  ...(detail ? asArray(detail.sources) : []),
                ].map((source) => {
                  const record = source as Record<string, unknown>;
                  return {
                    type: typeof record.type === 'string' ? record.type : 'neo4j',
                    source_id: typeof record.source_id === 'string' ? record.source_id : null,
                    title: typeof record.title === 'string' ? record.title : null,
                    identifier: typeof record.identifier === 'string' ? record.identifier : null,
                    year: typeof record.year === 'string' || typeof record.year === 'number' ? record.year : null,
                    url: typeof record.url === 'string' ? record.url : null,
                  };
                })).map((source, idx) => (
                  <li key={`${source.source_id || 'source'}-${idx}`} className="p-3.5 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-start justify-between gap-3 text-gray-700 dark:text-gray-300">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{source.title || source.identifier || 'Rujukan Ilmiah'}</p>
                      <p className="text-[10px] text-gray-400">{source.identifier} {source.year ? `(${source.year})` : ''}</p>
                    </div>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                        Buka Link
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
            )}
          </div>
        )}

        {/* Tab 7: Lanjutan */}
        {activeTab === 'lanjutan' && (
          <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Klaim Medis Terdaftar</h5>
              {mergeArr('claims').length > 0 ? (
                <ul className="space-y-2">
                  {mergeArr('claims').map((item, idx) => (
                    <li key={itemKey('claim', item, idx)} className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl leading-relaxed font-semibold">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2.5">Topik Riset Farmakologi</h5>
              {mergeArr('research_topics').length > 0 ? (
                <ul className="space-y-2">
                  {mergeArr('research_topics').map((item, idx) => (
                    <li key={itemKey('research', item, idx)} className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl leading-relaxed font-semibold">
                      {textFromUnknown(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">{emptyText}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
