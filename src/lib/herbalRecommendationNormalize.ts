/**
 * Normalizer helpers for herbal recommendation frontend.
 *
 * These functions resolve contradictions between backend fields
 * (e.g. relevance_label says "tinggi" but symptom_coverage is 0)
 * by deriving labels from the actual numeric score.
 *
 * IMPORTANT: No medical claims are created here. All labels are
 * descriptive of the data availability / verification status.
 */

import type { HerbalCandidate, SourceReference } from '@/lib/api/herbalRecommendation';

// ---------------------------------------------------------------------------
// Generic array / number helpers
// ---------------------------------------------------------------------------

export function asArray<T>(value?: T[] | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function clampScore(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(num, 1));
}

export function toPercent(value: unknown, fallback = 0): number {
  return Math.round(clampScore(value, fallback) * 100);
}

// ---------------------------------------------------------------------------
// Herb ID resolution (plant_id vs herb_id)
// ---------------------------------------------------------------------------

export function resolveHerbId(item: HerbalCandidate): string | null {
  return item.herb_id ?? item.plant_id ?? null;
}

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

export function getPrimaryScore(item: HerbalCandidate): number {
  return clampScore(
    item.relevance_score ?? item.confidence ?? item.recommendation_score ?? 0,
  );
}

export function getRelevancePercent(item: HerbalCandidate): number {
  return toPercent(getPrimaryScore(item));
}

export function getSymptomPercent(item: HerbalCandidate): number {
  if (
    typeof item.symptom_coverage === 'number' &&
    Number.isFinite(item.symptom_coverage)
  ) {
    return Math.max(0, Math.min(Math.round(item.symptom_coverage * 100), 100));
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Relevance label — replaces the contradictory "Relevansi tinggi (0%)"
// ---------------------------------------------------------------------------

export function getRelevanceLabel(item: HerbalCandidate): string {
  // Trust backend label ONLY if it doesn't contain "(0%)" (the known bug)
  if (item.relevance_label && !item.relevance_label.includes('(0%)')) {
    // Strip any existing percentage from the label — we'll add our own
    const clean = item.relevance_label.replace(/\s*\(\d+%\)\s*$/, '').trim();
    if (clean) return clean;
  }

  const score = getPrimaryScore(item);
  if (score >= 0.75) return 'Relevansi tinggi';
  if (score >= 0.5) return 'Relevansi sedang';
  if (score >= 0.25) return 'Relevansi rendah';
  return 'Kandidat awal';
}

export function getRelevanceBadgeText(item: HerbalCandidate): string {
  return `${getRelevanceLabel(item)} (${getRelevancePercent(item)}%)`;
}

export function getRelevanceLevel(item: HerbalCandidate): 'high' | 'medium' | 'low' | 'unknown' {
  const score = getPrimaryScore(item);
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.25) return 'low';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Data status label — replaces blanket "Data belum dapat dipastikan"
// ---------------------------------------------------------------------------

export function getDataStatusLabel(item: HerbalCandidate): string {
  const hasSources =
    asArray(item.sources).length > 0 ||
    asArray(item.evidence_sources).length > 0;

  const hasTraditional = asArray(item.traditional_uses).length > 0 ||
    asArray(item.enrichment?.traditional_uses).length > 0;

  const hasCompounds = asArray(item.active_compounds).length > 0;

  const hasPreparation = asArray(item.preparation_methods).length > 0 ||
    asArray(item.enrichment?.preparation_methods).length > 0;

  const hasGuideline = asArray(item.usage_guidelines).length > 0 ||
    asArray(item.enrichment?.usage_guidelines).length > 0;

  if (hasSources) return 'Data sumber tersedia';
  if (hasTraditional && hasCompounds) return 'Didukung knowledge graph';
  if (hasTraditional) return 'Data tradisional tersedia';
  if (hasPreparation || hasGuideline) return 'Data panduan tersedia';
  if (hasCompounds) return 'Data senyawa tersedia';

  return 'Data masih terbatas';
}

// ---------------------------------------------------------------------------
// Safety label — prevents blanket "Perlu perhatian" for unknown data
// ---------------------------------------------------------------------------

export function getSafetyLabelV2(item: HerbalCandidate): string {
  if (item.safety_label) return item.safety_label;

  const status = item.safety_status;
  if (status === 'safe' || status === 'eligible') return 'Relatif aman';
  if (status === 'caution' || status === 'conditional') return 'Perlu perhatian';
  if (status === 'unsafe' || status === 'excluded') return 'Tidak aman';

  // For 'unknown' status — check actual data before labeling
  const hasContra = asArray(item.contraindications).length > 0 ||
    asArray(item.enrichment?.contraindications).length > 0;
  const hasInteractions = asArray(item.drug_interactions).length > 0 ||
    asArray(item.enrichment?.drug_interactions).length > 0;
  const hasWarnings = asArray(item.safety_warnings).length > 0 ||
    asArray(item.enrichment?.safety_warnings).length > 0;

  if (hasContra || hasInteractions) return 'Perlu perhatian';
  if (hasWarnings) return 'Data keamanan terbatas';

  return 'Data keamanan belum cukup';
}

// ---------------------------------------------------------------------------
// Evidence label — prevents "Data bukti belum tersedia" when traditional data exists
// ---------------------------------------------------------------------------

export function getEvidenceLabelV2(item: HerbalCandidate): string {
  if (item.evidence_label) return item.evidence_label;

  const level = item.evidence_level;

  // Map known evidence levels
  const labels: Record<string, string> = {
    clinical: 'Bukti klinis tersedia',
    systematic_review: 'Tinjauan sistematis',
    pharmacopoeia: 'Farmakope/Materia Medika',
    review: 'Kajian literatur',
    in_vivo: 'Bukti in-vivo',
    in_vitro: 'Bukti in-vitro',
    phytochemical_screening: 'Skrining fitokimia',
    traditional: 'Data tradisional tersedia',
  };

  if (level && labels[level]) return labels[level];

  // Fallback: check actual data availability
  const hasSources =
    asArray(item.sources).length > 0 ||
    asArray(item.evidence_sources).length > 0;

  const hasTraditional = asArray(item.traditional_uses).length > 0 ||
    asArray(item.enrichment?.traditional_uses).length > 0;

  if (hasSources) return 'Data sumber tersedia';
  if (hasTraditional) return 'Data tradisional tersedia';

  return 'Data bukti belum tersedia';
}

// ---------------------------------------------------------------------------
// Verification badge label — replaces blanket "Data belum dapat dipastikan"
// ---------------------------------------------------------------------------

export function getVerificationBadgeLabel(item: HerbalCandidate): string {
  const vs = item.overall_verification_status;
  if (vs === 'fully_verified') return 'Terverifikasi Knowledge Graph';
  if (vs === 'source_verified') return 'Sumber Tepercaya';
  if (vs === 'fully_graph_verified' || vs === 'graph_and_model_verified') return 'Knowledge Graph + Validasi AI';
  if (vs === 'model_assisted_limited') return 'Panduan umum berbantuan AI';

  // Instead of blanket "Data belum dapat dipastikan", check data
  return getDataStatusLabel(item);
}

// ---------------------------------------------------------------------------
// Safety status label for warning section headers
// ---------------------------------------------------------------------------

export function formatSafetyFieldStatus(status?: string): string {
  if (!status) return 'belum tercatat';
  const map: Record<string, string> = {
    known_issue: 'tercatat',
    no_known_issue_within_source_scope: 'tidak ditemukan dalam sumber',
    missing: 'belum tercatat',
    conflicting: 'data bertentangan',
  };
  return map[status] ?? 'belum tercatat';
}

// ---------------------------------------------------------------------------
// Source deduplication (re-export for convenience)
// ---------------------------------------------------------------------------

export function dedupeAllSources(sources: SourceReference[]): SourceReference[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.source_id ?? source.identifier ?? source.title ?? JSON.stringify(source);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
