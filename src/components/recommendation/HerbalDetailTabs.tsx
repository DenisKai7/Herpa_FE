'use client';

import React from 'react';
import { ShieldCheck, Info, Leaf, FlaskConical, BookOpen, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HerbalCandidate,
  HerbEnrichmentDetail,
  BotanicalDescription,
  TraditionalUseItem,
  PreparationMethodItem,
  UsageGuidelineItem,
  ClinicalGuidelineItem,
  SafetyWarningItem,
  ClaimEvidenceItem,
  ResearchTopicItem,
  SourceReference,
  PlantPartItem,
  DrugInteractionItem,
  ContraindicationItem,
  dedupeSources,
} from '@/lib/api/herbalRecommendation';
import { formatSafetyFieldStatus } from '@/lib/herbalRecommendationNormalize';
import { DetailTab } from '@/hooks/useHerbalRecommendation';

const emptyText = 'Informasi belum tersedia pada knowledge graph.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '');
}

function hasMeaningfulContent(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.some(hasMeaningfulContent);
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulContent);
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    return (
      text.length > 0 &&
      !text.includes('belum tersedia') &&
      !text.includes('informasi belum tersedia') &&
      !text.includes('data belum tersedia')
    );
  }
  return true;
}

function isPlaceholderText(text: string, herbName: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const herb = herbName.toLowerCase().replace(/\s+/g, ' ').trim();
  return (
    normalized === `cara pengolahan tradisional ${herb}` ||
    normalized === `aturan pakai edukatif ${herb}` ||
    normalized.includes('belum tersedia') ||
    normalized.includes('informasi belum tersedia')
  );
}

function asArray<T>(value?: T[] | null): T[] {
  return Array.isArray(value) ? value : [];
}

function itemKey(prefix: string, id: unknown, index: number) {
  const key = normalizeKey(id ?? index);
  return `${prefix}-${key}-${index}`;
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'high':
    case 'danger':
      return 'bg-red-50/10 dark:bg-red-950/10 border-red-200 dark:border-red-950/40 text-red-700 dark:text-red-300';
    case 'moderate':
    case 'caution':
      return 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300';
    default:
      return 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300';
  }
}

function severityLabel(severity: string): string {
  switch (severity) {
    case 'high':
    case 'danger':
      return 'Tinggi';
    case 'moderate':
    case 'caution':
      return 'Sedang';
    default:
      return 'Info';
  }
}

// ---------------------------------------------------------------------------
// Section renderer helpers
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
      <Info className="w-5 h-5 mx-auto text-gray-300 dark:text-gray-600 mb-1.5" />
      <p className="text-xs text-gray-400 italic">{message || emptyText}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
      <h5 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs">{title}</h5>
      {typeof count === 'number' && count > 0 && (
        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-semibold">
          {count}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab components
// ---------------------------------------------------------------------------

function BotanicalDescriptionSection({ botanical, plantParts, herbName }: {
  botanical?: BotanicalDescription;
  plantParts: PlantPartItem[];
  herbName: string;
}) {
  const hasSummary = hasMeaningfulContent(botanical?.summary);
  const hasMorphology = botanical?.morphology && botanical.morphology.length > 0;
  const hasOrganoleptic = botanical?.organoleptic && botanical.organoleptic.length > 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <SectionHeader icon={Leaf} title="Deskripsi Botani" />
        {hasSummary ? (
          <p className="leading-relaxed text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            {botanical!.summary}
          </p>
        ) : (
          <EmptyState message={`Deskripsi botani ${herbName} belum tersedia.`} />
        )}
      </div>

      {/* Morphology */}
      {hasMorphology && (
        <div>
          <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] mb-2">Morfologi</h6>
          <ul className="space-y-1.5">
            {botanical!.morphology!.map((item, idx) => (
              <li key={`morph-${idx}`} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Organoleptic */}
      {hasOrganoleptic && (
        <div>
          <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] mb-2">Organoleptik</h6>
          <div className="flex flex-wrap gap-1.5">
            {botanical!.organoleptic!.map((item, idx) => (
              <span key={`organo-${idx}`} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plant Parts */}
      <div>
        <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] mb-2">Bagian yang Digunakan</h6>
        {plantParts.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {plantParts.map((part, index) => (
              <span key={`plant-part-${normalizeKey(part.name)}-${index}`} className="px-3 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-800/40 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                {part.name}
                {part.description && <span className="ml-1 text-green-500 dark:text-green-400 font-normal">— {part.description}</span>}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function TraditionalUsesSection({ uses, herbName }: { uses: TraditionalUseItem[]; herbName: string }) {
  const validUses = uses.filter(u =>
    hasMeaningfulContent(u.title) || hasMeaningfulContent(u.description)
  );

  return (
    <div>
      <SectionHeader icon={BookOpen} title="Penggunaan Tradisional" count={validUses.length} />
      {validUses.length > 0 ? (
        <ul className="space-y-3">
          {validUses.map((item, idx) => (
            <li key={itemKey('trad', item.id || item.title, idx)} className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
              {hasMeaningfulContent(item.title) && (
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs mb-1">{item.title}</p>
              )}
              {hasMeaningfulContent(item.description) && (
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
              )}
              {item.matched_symptoms && item.matched_symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.matched_symptoms.map((s, si) => (
                    <span key={`sym-${si}`} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {hasMeaningfulContent(item.evidence_level) && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                  {item.evidence_level}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={`Data penggunaan tradisional ${herbName} belum tersedia.`} />
      )}
    </div>
  );
}

function PreparationMethodsSection({ methods, herbName }: { methods: PreparationMethodItem[]; herbName: string }) {
  const validMethods = methods.filter(m =>
    hasMeaningfulContent(m.title) || (m.steps && m.steps.length > 0)
  );

  return (
    <div>
      <SectionHeader icon={FlaskConical} title="Metode Pengolahan Rumah Tangga" count={validMethods.length} />
      {validMethods.length > 0 ? (
        <ul className="space-y-4">
          {validMethods.map((item, idx) => (
            <li key={itemKey('prep', item.id || item.title, idx)} className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
              {/* Title */}
              {hasMeaningfulContent(item.title) && (
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs mb-2">{item.title}</p>
              )}

              {/* Plant part & method type */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hasMeaningfulContent(item.plant_part) && (
                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-full text-[10px] font-medium">
                    {item.plant_part}
                  </span>
                )}
                {hasMeaningfulContent(item.method_type) && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[10px]">
                    {item.method_type}
                  </span>
                )}
              </div>

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Bahan:</p>
                  <ul className="space-y-0.5">
                    {item.ingredients.map((ing, ii) => (
                      <li key={`ing-${ii}`} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {item.steps && item.steps.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Langkah:</p>
                  <ol className="space-y-1">
                    {item.steps.map((step, si) => (
                      <li key={`step-${si}`} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="mt-0.5 w-4 h-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px] font-bold shrink-0">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Notes */}
              {hasMeaningfulContent(item.notes) && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-2 p-2 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                  ℹ️ {item.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={`Data pengolahan ${herbName} belum tersedia.`} />
      )}
    </div>
  );
}

function UsageGuidelinesSection({ guidelines, clinical, herbName }: {
  guidelines: UsageGuidelineItem[];
  clinical: ClinicalGuidelineItem[];
  herbName: string;
}) {
  const validGuidelines = guidelines.filter(g =>
    hasMeaningfulContent(g.title) || hasMeaningfulContent(g.description)
  );

  return (
    <div className="space-y-6">
      {/* Usage Guidelines */}
      <div>
        <SectionHeader icon={BookOpen} title="Panduan Penggunaan Ramuan" count={validGuidelines.length} />
        {validGuidelines.length > 0 ? (
          <ul className="space-y-3">
            {validGuidelines.map((item, idx) => (
              <li key={itemKey('usage', item.id || item.title, idx)} className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
                {hasMeaningfulContent(item.title) && (
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-xs mb-1">{item.title}</p>
                )}
                {hasMeaningfulContent(item.description) && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{item.description}</p>
                )}
                <div className="space-y-1">
                  {hasMeaningfulContent(item.frequency_text) && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Frekuensi:</span> {item.frequency_text}
                    </p>
                  )}
                  {hasMeaningfulContent(item.duration_text) && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Durasi:</span> {item.duration_text}
                    </p>
                  )}
                </div>
                {item.dose_status === 'not_clinically_established' && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800/40">
                    Dosis klinis belum terverifikasi
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message={`Panduan penggunaan ${herbName} belum tersedia.`} />
        )}
      </div>

      {/* Clinical Guidelines */}
      <div>
        <SectionHeader icon={FlaskConical} title="Petunjuk Dosis Klinis" count={clinical.length} />
        {clinical.length > 0 ? (
          <ul className="space-y-3">
            {clinical.map((item, idx) => (
              <li key={itemKey('clinical', item.id || item.mechanism, idx)} className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                {hasMeaningfulContent(item.mechanism) && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-1">
                    <span className="font-semibold">Mekanisme:</span> {item.mechanism}
                  </p>
                )}
                {hasMeaningfulContent(item.therapeutic_dose_text) && (
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    <span className="font-semibold">Dosis:</span> {item.therapeutic_dose_text}
                  </p>
                )}
                {hasMeaningfulContent(item.notes) && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-2 p-2 bg-blue-50/30 dark:bg-blue-950/10 rounded-lg">
                    {item.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 bg-amber-50/20 dark:bg-amber-950/10 rounded-2xl border border-amber-200 dark:border-amber-800/40">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Dosis klinis belum tersedia/terverifikasi. Gunakan sebagai edukasi, bukan pengganti saran tenaga kesehatan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SafetyWarningsSection({ warnings, contraindications, drugInteractions, candidate }: {
  warnings: SafetyWarningItem[];
  contraindications: ContraindicationItem[];
  drugInteractions: DrugInteractionItem[];
  candidate: HerbalCandidate;
}) {
  return (
    <div className="space-y-6">
      {/* Safety Warnings */}
      <div>
        <SectionHeader icon={AlertTriangle} title="Peringatan Keamanan" count={warnings.length} />
        {warnings.length > 0 ? (
          <ul className="space-y-2.5">
            {warnings.map((item, idx) => (
              <li key={itemKey('warn', item.id || item.title, idx)} className={cn('p-3 rounded-2xl border leading-relaxed font-medium text-xs', severityColor(item.severity || 'caution'))}>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 font-bold shrink-0">
                    {severityLabel(item.severity || 'caution')}
                  </span>
                  <div>
                    {hasMeaningfulContent(item.title) && <p className="font-bold mb-0.5">{item.title}</p>}
                    {hasMeaningfulContent(item.description) && <p>{item.description}</p>}
                    {item.population_risks && item.population_risks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.population_risks.map((r, ri) => (
                          <span key={`risk-${ri}`} className="px-2 py-0.5 bg-white/30 dark:bg-black/20 rounded-full text-[10px]">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300 text-xs">
            <p className="font-medium">Tidak ada peringatan khusus yang tercatat pada knowledge graph.</p>
          </div>
        )}
      </div>

      {/* Contraindications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionHeader icon={ShieldCheck} title="Kontraindikasi" count={contraindications.length} />
          {candidate.field_verifications?.find(f => f.field_name === 'contraindications') && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {candidate.field_verifications.find(f => f.field_name === 'contraindications')?.verification_source === 'graph_verified' ? 'Terverifikasi' : 'Validasi AI'}
            </span>
          )}
        </div>
        {contraindications.length > 0 ? (
          <ul className="space-y-2">
            {contraindications.map((item, idx) => (
              <li key={itemKey('contra', item.id || item.condition, idx)} className="p-3 bg-red-50/10 dark:bg-red-950/10 border border-red-200 dark:border-red-950/40 text-red-700 dark:text-red-300 rounded-2xl leading-relaxed font-semibold text-xs">
                {hasMeaningfulContent(item.condition) && <p className="font-bold mb-0.5">{item.condition}</p>}
                {hasMeaningfulContent(item.description) && <p>{item.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300 text-xs">
            Status Kontraindikasi: <span className="font-bold">{formatSafetyFieldStatus(candidate.contraindication_status?.status)}</span>
          </div>
        )}
      </div>

      {/* Drug Interactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionHeader icon={AlertTriangle} title="Interaksi Obat Medis" count={drugInteractions.length} />
          {candidate.field_verifications?.find(f => f.field_name === 'drug_interactions') && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {candidate.field_verifications.find(f => f.field_name === 'drug_interactions')?.verification_source === 'graph_verified' ? 'Terverifikasi' : 'Validasi AI'}
            </span>
          )}
        </div>
        {drugInteractions.length > 0 ? (
          <ul className="space-y-2">
            {drugInteractions.map((item, idx) => (
              <li key={itemKey('drug', item.id || item.substance, idx)} className="p-3 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded-2xl leading-relaxed font-medium text-xs">
                {hasMeaningfulContent(item.substance) && <p className="font-bold mb-0.5">{item.substance}</p>}
                {hasMeaningfulContent(item.description) && <p>{item.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 rounded-2xl bg-green-50/20 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 text-green-700 dark:text-green-300 text-xs">
            Status Interaksi Obat: <span className="font-bold">{formatSafetyFieldStatus(candidate.interaction_status?.status)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SourcesSection({ sources, dataQuality }: {
  sources: SourceReference[];
  dataQuality?: { source?: string; has_kg_data?: boolean; has_curated_fallback?: boolean };
}) {
  return (
    <div>
      <SectionHeader icon={FileText} title="Sumber Informasi & Rujukan" count={sources.length} />
      {/* Data quality badge */}
      {dataQuality && (
        <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Sumber data:</span>{' '}
          {dataQuality.source === 'knowledge_graph' && 'Knowledge Graph HERPA'}
          {dataQuality.source === 'curated_fallback' && 'Curated herbal profile internal (edukasi, perlu verifikasi literatur lanjutan)'}
          {dataQuality.source === 'mixed' && 'Knowledge Graph + Curated herbal profile'}
          {!dataQuality.source && 'Tidak diketahui'}
        </div>
      )}
      {sources.length > 0 ? (
        <ul className="space-y-2.5">
          {sources.map((source, idx) => (
            <li key={`${source.source_id || 'source'}-${idx}`} className="p-3.5 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-start justify-between gap-3 text-gray-700 dark:text-gray-300">
              <div className="space-y-0.5">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{source.title || source.identifier || 'Rujukan Ilmiah'}</p>
                {hasMeaningfulContent(source.description) && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{source.description}</p>
                )}
                <p className="text-[10px] text-gray-400">{source.identifier} {source.year ? `(${source.year})` : ''}</p>
                {hasMeaningfulContent(source.evidence_level) && (
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                    {source.evidence_level}
                  </span>
                )}
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
        <EmptyState />
      )}
    </div>
  );
}

function AdvancedSection({ claims, researchTopics, drugInteractions, contraindications }: {
  claims: ClaimEvidenceItem[];
  researchTopics: ResearchTopicItem[];
  drugInteractions: DrugInteractionItem[];
  contraindications: ContraindicationItem[];
}) {
  return (
    <div className="space-y-6">
      {/* Claims */}
      <div>
        <SectionHeader icon={FileText} title="Klaim Medis Terdaftar" count={claims.length} />
        {claims.length > 0 ? (
          <ul className="space-y-2">
            {claims.map((item, idx) => (
              <li key={itemKey('claim', item.claim_id || item.claim_text, idx)} className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs">
                {hasMeaningfulContent(item.claim_text) && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{item.claim_text}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {hasMeaningfulContent(item.claim_type) && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[10px]">{item.claim_type}</span>
                  )}
                  {hasMeaningfulContent(item.evidence_level) && (
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-full text-[10px]">{item.evidence_level}</span>
                  )}
                </div>
                {hasMeaningfulContent(item.evidence_summary) && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{item.evidence_summary}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Klaim medis belum tercatat pada knowledge graph." />
        )}
      </div>

      {/* Research Topics */}
      <div>
        <SectionHeader icon={FlaskConical} title="Topik Riset Farmakologi" count={researchTopics.length} />
        {researchTopics.length > 0 ? (
          <ul className="space-y-2">
            {researchTopics.map((item, idx) => (
              <li key={itemKey('research', item.id || item.title, idx)} className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-start gap-2 text-xs">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                <div>
                  {hasMeaningfulContent(item.title) && <p className="font-semibold text-gray-700 dark:text-gray-300">{item.title}</p>}
                  {hasMeaningfulContent(item.category) && <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.category}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Topik riset farmakologi belum tercatat pada knowledge graph." />
        )}
      </div>

      {/* Drug Interactions summary (if not shown in peringatan tab) */}
      {drugInteractions.length > 0 && (
        <div>
          <SectionHeader icon={AlertTriangle} title="Interaksi Obat" count={drugInteractions.length} />
          <ul className="space-y-2">
            {drugInteractions.map((item, idx) => (
              <li key={itemKey('adv-drug', item.id || item.substance, idx)} className="p-3 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded-2xl text-xs leading-relaxed font-medium">
                {hasMeaningfulContent(item.substance) && <p className="font-bold">{item.substance}</p>}
                {hasMeaningfulContent(item.description) && <p>{item.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contraindications summary (if not shown in peringatan tab) */}
      {contraindications.length > 0 && (
        <div>
          <SectionHeader icon={ShieldCheck} title="Kontraindikasi" count={contraindications.length} />
          <ul className="space-y-2">
            {contraindications.map((item, idx) => (
              <li key={itemKey('adv-contra', item.id || item.condition, idx)} className="p-3 bg-red-50/10 dark:bg-red-950/10 border border-red-200 dark:border-red-950/40 text-red-700 dark:text-red-300 rounded-2xl text-xs leading-relaxed font-semibold">
                {hasMeaningfulContent(item.condition) && <p className="font-bold">{item.condition}</p>}
                {hasMeaningfulContent(item.description) && <p>{item.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface HerbalDetailTabsProps {
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  candidate: HerbalCandidate;
  detail: HerbEnrichmentDetail | null;
  detailLoading: boolean;
  detailError?: string;
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

  const herbName = detail?.common_name || candidate.local_name || '';

  // Merge data: prefer detail (from /detail endpoint), fallback to candidate enrichment
  const botanical = detail?.botanical_description || candidate.enrichment?.botanical_description;
  const dataQuality = detail?.data_quality;

  const plantParts: PlantPartItem[] = asArray(detail?.plant_parts).length > 0
    ? asArray(detail?.plant_parts)
    : asArray(candidate.plant_parts);

  const traditionalUses: TraditionalUseItem[] = asArray(detail?.traditional_uses).length > 0
    ? asArray(detail?.traditional_uses)
    : asArray(candidate.traditional_uses);

  const preparationMethods: PreparationMethodItem[] = asArray(detail?.preparation_methods).length > 0
    ? asArray(detail?.preparation_methods)
    : asArray(candidate.preparation_methods);

  const usageGuidelines: UsageGuidelineItem[] = asArray(detail?.usage_guidelines).length > 0
    ? asArray(detail?.usage_guidelines)
    : asArray(candidate.usage_guidelines);

  const clinicalGuidelines: ClinicalGuidelineItem[] = asArray(detail?.clinical_guidelines).length > 0
    ? asArray(detail?.clinical_guidelines)
    : asArray(candidate.clinical_guidelines);

  const safetyWarnings: SafetyWarningItem[] = asArray(detail?.safety_warnings).length > 0
    ? asArray(detail?.safety_warnings)
    : asArray(candidate.safety_warnings);

  const contraindications: ContraindicationItem[] = asArray(detail?.contraindications).length > 0
    ? asArray(detail?.contraindications)
    : asArray(candidate.contraindications).filter((c): c is ContraindicationItem => typeof c === 'object' && c !== null);

  const drugInteractions: DrugInteractionItem[] = asArray(detail?.drug_interactions).length > 0
    ? asArray(detail?.drug_interactions)
    : asArray(candidate.drug_interactions).filter((c): c is DrugInteractionItem => typeof c === 'object' && c !== null);

  const claims: ClaimEvidenceItem[] = asArray(detail?.claims).length > 0
    ? asArray(detail?.claims)
    : asArray(candidate.claims);

  const researchTopics: ResearchTopicItem[] = asArray(detail?.research_topics).length > 0
    ? asArray(detail?.research_topics)
    : asArray(candidate.research_topics);

  // Merge sources from detail, candidate, and all sections
  const allSources: SourceReference[] = dedupeSources([
    ...asArray(detail?.sources),
    ...(candidate.evidence_sources ?? []).map(s => ({ source_id: s.source_id as string, title: s.title as string, type: s.type as string })),
    ...(candidate.sources ?? []).map(s => ({ source_id: s.source_id, title: s.title, url: s.url })),
    ...asArray(traditionalUses).flatMap(u => u.sources ?? []),
    ...asArray(preparationMethods).flatMap(p => p.sources ?? []),
    ...asArray(usageGuidelines).flatMap(g => g.sources ?? []),
    ...asArray(safetyWarnings).flatMap(w => w.sources ?? []),
    ...asArray(clinicalGuidelines).flatMap(c => c.sources ?? []),
    ...asArray(claims).flatMap(c => c.sources ?? []),
  ]);

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
            {tab.id === 'peringatan' && (contraindications.length > 0 || drugInteractions.length > 0) ? (
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

      {/* Tab Panels */}
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

        {/* Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
            <BotanicalDescriptionSection
              botanical={botanical}
              plantParts={plantParts}
              herbName={herbName}
            />

            {/* Related symptoms */}
            {(() => {
              const relatedSymptoms = [
                ...asArray(candidate.matched_symptoms),
                ...asArray(candidate.related_symptoms).map(s => typeof s === 'string' ? s : s.name ?? ''),
              ].filter(Boolean);
              return relatedSymptoms.length > 0 ? (
                <div>
                  <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] mb-2">Gejala Terkait</h6>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedSymptoms.map((symptom, index) => (
                      <span key={`related-symptom-${normalizeKey(symptom)}-${index}`} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Tradisional */}
        {activeTab === 'tradisional' && (
          <TraditionalUsesSection uses={traditionalUses} herbName={herbName} />
        )}

        {/* Pengolahan */}
        {activeTab === 'pengolahan' && (
          <PreparationMethodsSection methods={preparationMethods} herbName={herbName} />
        )}

        {/* Aturan Pakai */}
        {activeTab === 'aturan' && (
          <UsageGuidelinesSection guidelines={usageGuidelines} clinical={clinicalGuidelines} herbName={herbName} />
        )}

        {/* Peringatan */}
        {activeTab === 'peringatan' && (
          <SafetyWarningsSection
            warnings={safetyWarnings}
            contraindications={contraindications}
            drugInteractions={drugInteractions}
            candidate={candidate}
          />
        )}

        {/* Sumber */}
        {activeTab === 'sumber' && (
          <SourcesSection sources={allSources} dataQuality={dataQuality} />
        )}

        {/* Lanjutan */}
        {activeTab === 'lanjutan' && (
          <AdvancedSection
            claims={claims}
            researchTopics={researchTopics}
            drugInteractions={drugInteractions}
            contraindications={contraindications}
          />
        )}
      </div>
    </div>
  );
}
