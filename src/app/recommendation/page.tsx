'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Activity,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  analyzeHerbalComplaint,
  canShowClinicalDose,
  dedupeSources,
  formatPercent,
  getApiErrorMessage,
  getEvidenceLabel,
  getHerbRecommendationDetail,
  getVerificationLabel,
  HerbalCandidate,
  HerbalRecommendationApiError,
  HerbalRecommendationResponse,
  HerbEnrichmentDetail,
  RecommendationStatus,
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
  resolveHerbId,
  formatSafetyFieldStatus,
} from '@/lib/herbalRecommendationNormalize';

const emptyText = 'Informasi belum tersedia pada knowledge graph.';
const medicalDisclaimer = 'Informasi ini bersifat edukatif dan bukan diagnosis atau pengganti tenaga kesehatan.';

type DetailTab = 'ringkasan' | 'tradisional' | 'pengolahan' | 'aturan' | 'peringatan' | 'sumber' | 'lanjutan';
type Persona = 'umum' | 'pelajar' | 'peneliti' | 'tenaga_medis';

const statusText: Record<RecommendationStatus, string> = {
  idle: 'Menunggu input keluhan.',
  validating: 'Memvalidasi keluhan...',
  analyzing_symptoms: 'MODEL_THINKING mengekstrak gejala...',
  searching_graph: 'Mencari kandidat di Neo4j...',
  checking_safety: 'Memeriksa kontraindikasi dan red flag...',
  ranking: 'Meranking kandidat herbal...',
  completed: 'Rekomendasi selesai.',
  completed_with_partial_enrichment: 'Rekomendasi selesai dengan pengayaan sebagian.',
  completed_with_model_fallback: 'Rekomendasi berhasil dari Knowledge Graph.',
  clarification_required: 'Butuh klarifikasi keluhan.',
  medical_attention_recommended: 'Tanda kewaspadaan terdeteksi.',
  no_safe_candidate: 'Tidak ada kandidat aman dari knowledge graph.',
  no_fully_verified_candidate: 'Belum ada kandidat dengan provenance lengkap.',
  graph_unavailable: 'Knowledge Graph tidak tersedia.',
  failed: 'Rekomendasi gagal diproses.',
};

function plantIcon(candidate: HerbalCandidate) {
  const name = candidate.local_name.toLowerCase();
  if (name.includes('jahe')) return '🫚';
  if (name.includes('kunyit') || name.includes('temu')) return '🟨';
  if (name.includes('jeruk')) return '🍋';
  if (name.includes('daun')) return '🍃';
  return '🌿';
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

function uniqueCandidates(candidates: HerbalCandidate[]) {
  const map = new Map<string, HerbalCandidate>();
  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    if (map.has(key) && process.env.NODE_ENV === 'development') {
      console.warn('[HerbalRecommendation] Duplicate candidate received', key);
    }
    if (!map.has(key)) map.set(key, candidate);
  }
  return Array.from(map.values()).sort((a, b) => (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0) || (a.scientific_name || a.local_name).localeCompare(b.scientific_name || b.local_name));
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

function candidatePlantParts(candidate: HerbalCandidate) {
  return [
    ...asArray(candidate.plant_parts),
    ...asArray(candidate.enrichment?.plant_parts),
  ].map(textFromUnknown).filter(Boolean);
}

function candidateRelatedSymptoms(candidate: HerbalCandidate) {
  return [
    ...asArray(candidate.matched_symptoms),
    ...asArray(candidate.related_symptoms),
    ...asArray(candidate.enrichment?.related_symptoms).flatMap((symptom) => [symptom.name, ...(symptom.aliases ?? [])]),
  ].map(textFromUnknown).filter(Boolean);
}

function nestedSources(candidate: HerbalCandidate) {
  return dedupeSources([
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
  }));
}

function getVerificationSourceFromCandidate(candidate: HerbalCandidate): VerificationSource {
  const vs = candidate.overall_verification_status;
  if (vs === 'fully_verified') return 'knowledge_graph';
  if (vs === 'source_verified') return 'trusted_source';
  if (vs === 'fully_graph_verified' || vs === 'graph_and_model_verified') return 'graph_and_model';
  if (vs === 'model_assisted_limited') return 'model_assisted';
  // Legacy compat
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
    // Legacy
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
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full', styles[source] || styles.unavailable)}>
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
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full', styles[level] ?? styles.unknown)}>
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

function formatAvailabilityLabel(candidate: HerbalCandidate) {
  const fv = candidate.field_verifications?.find(f => f.field_name === 'availability');
  if (fv) {
    if (fv.verification_source === 'graph_verified') {
      return 'Penyimpanan terverifikasi Knowledge Graph';
    }
    if (fv.verification_source === 'model_assisted') {
      return 'Perkiraan penyimpanan berbantuan AI';
    }
  }
  if (candidate.availability === 'unknown') {
    return 'Informasi penyimpanan belum tercatat pada knowledge graph';
  }
  return candidate.availability_label || 'Informasi penyimpanan belum tercatat pada knowledge graph';
}

export default function HerbalRecommendationPage() {
  const router = useRouter();
  const [complaint, setComplaint] = useState('');
  const [response, setResponse] = useState<HerbalRecommendationResponse | null>(null);
  const [status, setStatus] = useState<RecommendationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<HerbalCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');
  const [persona, setPersona] = useState<Persona>('umum');

  // Lazy detail state
  const [detailByHerbId, setDetailByHerbId] = useState<Record<string, HerbEnrichmentDetail>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailErrorByHerbId, setDetailErrorByHerbId] = useState<Record<string, string>>({});

  const recommendations = uniqueCandidates(response?.recommendations ?? []);
  const isLoading = ['validating', 'analyzing_symptoms', 'searching_graph', 'checking_safety', 'ranking'].includes(status);

  const handleOpenDetail = async (item: HerbalCandidate) => {
    setActiveTab('ringkasan');
    setSelectedPlant(item);

    const herbId = resolveHerbId(item);
    if (!herbId) return;
    if (detailByHerbId[herbId]) return; // already cached

    try {
      setDetailLoadingId(herbId);
      setDetailErrorByHerbId((prev) => ({ ...prev, [herbId]: '' }));
      const detail = await getHerbRecommendationDetail(herbId);
      setDetailByHerbId((prev) => ({ ...prev, [herbId]: detail }));
    } catch (error) {
      setDetailErrorByHerbId((prev) => ({
        ...prev,
        [herbId]: getApiErrorMessage(error),
      }));
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = complaint.trim();
    if (isLoading) return;
    if (!trimmed) {
      setError('Isi keluhan utama terlebih dahulu.');
      return;
    }

    setError(null);
    setResponse(null);
    setSelectedPlant(null);

    try {
      setStatus('validating');
      await new Promise((resolve) => setTimeout(resolve, 120));
      setStatus('analyzing_symptoms');
      const result = await analyzeHerbalComplaint({
        complaint: trimmed,
        symptoms: [],
        persona,
        model_choice: 'fast-medium',
        age_group: null,
        pregnancy_status: null,
        allergies: [],
        chronic_conditions: [],
        medical_conditions: [],
        current_medications: [],
      });
      setStatus('searching_graph');
      await new Promise((resolve) => setTimeout(resolve, 80));
      setStatus('checking_safety');
      await new Promise((resolve) => setTimeout(resolve, 80));
      setStatus('ranking');
      await new Promise((resolve) => setTimeout(resolve, 80));
      setResponse(result);
      const completedStatuses = ['completed', 'completed_with_partial_enrichment', 'completed_with_model_fallback'];
      setStatus(completedStatuses.includes(result.status) ? 'completed' : result.status);
    } catch (caught) {
      const message = caught instanceof HerbalRecommendationApiError
        ? `${caught.code}: ${caught.message}`
        : 'Rekomendasi gagal diproses.';
      setError(message);
      setStatus('failed');
    }
  };

  const resetSearch = () => {
    setComplaint('');
    setResponse(null);
    setError(null);
    setStatus('idle');
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col relative overflow-hidden">
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-600" />
              <span>Rekomendasi Obat Herbal</span>
            </h1>
          </div>
        </div>
        <button
          onClick={resetSearch}
          disabled={!response && !error && !complaint}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          Cari Ulang
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-6 py-8 relative">
        <AnimatePresence mode="wait">
          {!response && !isLoading && !error ? (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
                  <Activity className="h-7 w-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-black">Apa Keluhan Kesehatan Anda?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tulis keluhan ringan yang ingin dicari dukungan herbalnya. Sistem akan memakai backend, MODEL_THINKING, Neo4j, dan safety validation.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Contoh: batuk berdahak dan tenggorokan gatal..."
                    className="w-full p-4 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all placeholder:text-gray-400 leading-relaxed shadow-sm resize-none"
                    required
                    minLength={3}
                    maxLength={1000}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-400 font-medium">
                    {complaint.length}/1000
                  </div>
                </div>

                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Persona tampilan
                  <select
                    value={persona}
                    onChange={(event) => setPersona(event.target.value as Persona)}
                    className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm normal-case tracking-normal text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  >
                    <option value="umum">Umum</option>
                    <option value="pelajar">Pelajar</option>
                    <option value="peneliti">Peneliti</option>
                    <option value="tenaga_medis">Tenaga medis</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-green-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4" />
                  Analisis Gejala & Cari Ramuan
                </button>
              </form>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Keluhan Populer</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: 'Batuk Berdahak', text: 'batuk berdahak dan tenggorokan gatal selama dua hari' },
                    { label: 'Asam Lambung / Maag', text: 'perut terasa perih ringan dan kembung setelah makan' },
                    { label: 'Mual Ringan', text: 'mual ringan tanpa muntah darah atau nyeri dada' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setComplaint(chip.text)}
                      className="text-xs font-semibold px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-800 rounded-full transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center justify-center space-y-8 py-6 min-h-[450px]"
            >
              <div className="text-center space-y-2 max-w-2xl">
                <span className="text-[10px] font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">
                  Peta Koneksi Ramuan Herbal
                </span>
                <h3 className="text-lg font-bold leading-tight" title={response?.normalized_complaint || complaint}>
                  KELUHAN UTAMA: {response?.normalized_complaint || complaint}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{statusText[status]}</p>
                {Boolean(response?.metadata?.request_id) && (
                  <p className="text-[10px] text-gray-400">Request ID: {String(response?.metadata.request_id)}</p>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 px-5 py-4 text-sm text-green-700 dark:text-green-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {statusText[status]}
                </div>
              )}

              {error && (
                <div className="max-w-xl rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-5 text-sm text-red-700 dark:text-red-300">
                  <div className="font-black uppercase text-xs mb-1">Error</div>
                  {error}
                </div>
              )}

              {response?.status === 'clarification_required' && (
                <div className="max-w-xl rounded-2xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20 p-5">
                  <h4 className="text-sm font-black text-yellow-800 dark:text-yellow-300 mb-3">Keluhan perlu diperjelas</h4>
                  <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200 list-disc pl-5">
                    {response.clarification_questions.map((question) => <li key={question}>{question}</li>)}
                  </ul>
                </div>
              )}

              {response?.status === 'medical_attention_recommended' && (
                <div className="max-w-xl rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-5 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-red-800 dark:text-red-300 mb-2">Pemeriksaan medis disarankan</h4>
                    <p className="text-sm text-red-700 dark:text-red-200 leading-relaxed">{response.medical_attention_message}</p>
                  </div>
                </div>
              )}

              {response && recommendations.length > 0 && (
                <div className="w-full space-y-8">
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Ditemukan {recommendations.length} kandidat awal berdasarkan data knowledge graph.
                  </p>
                  {recommendations.every((item) => item.safety_status === 'conditional') && (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
                      Pilihan dengan perhatian khusus. Data keamanan atau aturan pakai belum lengkap, sehingga kandidat tidak ditandai aman penuh.
                    </div>
                  )}
                  <div className={cn(
                    'mx-auto grid gap-4',
                    recommendations.length === 1 ? 'max-w-sm grid-cols-1 place-items-center' :
                      recommendations.length <= 3 ? 'max-w-4xl grid-cols-1 sm:grid-cols-3' :
                        recommendations.length <= 6 ? 'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                          'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-h-[520px] overflow-y-auto pr-2'
                  )}>
                    {recommendations.map((plant, idx) => {
                      const verifSource = getVerificationSourceFromCandidate(plant);
                      return (
                        <motion.button
                          key={candidateKey(plant)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleOpenDetail(plant)}
                          className="bg-white dark:bg-gray-900 border-2 border-green-500 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer text-left select-none flex flex-col justify-between h-full"
                        >
                          <div>
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{plantIcon(plant)}</span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{plant.local_name}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic truncate mt-0.5">{plant.scientific_name || 'Nama ilmiah belum tersedia'}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {renderVerificationBadge(verifSource, plant)}
                              {renderRelevanceBadge(plant)}
                              {renderSafetyStatusBadge(plant)}
                              <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                {getEvidenceLabelV2(plant)}
                              </span>
                            </div>
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                              {plant.explanation || plant.recommendation_reason || 'Alasan rekomendasi belum tersedia pada data saat ini.'}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-400">Score {getRelevancePercent(plant)}%</p>
                              {getSymptomPercent(plant) > 0 && (
                                <p className="text-[10px] text-gray-400">| Gejala {getSymptomPercent(plant)}%</p>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detail &rarr;</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mx-auto max-w-3xl text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl flex items-start gap-2 font-medium">
                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{response.general_disclaimer}</span>
                  </div>
                </div>
              )}

              {(response?.status === 'no_safe_candidate' || response?.status === 'no_fully_verified_candidate') && (
                <div className="max-w-xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    Belum tersedia rekomendasi dengan data penggunaan dan keamanan yang sepenuhnya terverifikasi untuk keluhan ini.
                  </p>
                  {asArray((response as HerbalRecommendationResponse & { suggested_terms?: string[] })?.suggested_terms).length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Coba gunakan istilah lain seperti:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {((response as HerbalRecommendationResponse & { suggested_terms?: string[] })?.suggested_terms ?? []).map((term) => (
                          <li key={term}>{term}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={resetSearch} className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold cursor-pointer">Cari ulang</button>
                    <button onClick={() => setResponse(null)} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold cursor-pointer">Ubah keluhan</button>
                    <button onClick={() => router.push('/')} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold cursor-pointer">Lihat informasi umum non-rekomendasi</button>
                  </div>
                </div>
              )}

              {/* Empty state: completed but no recommendations */}
              {response && !isLoading && recommendations.length === 0 && !['no_safe_candidate', 'no_fully_verified_candidate', 'clarification_required', 'medical_attention_recommended'].includes(response.status) && (
                <div className="max-w-xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Belum ditemukan rekomendasi herbal yang cukup relevan untuk keluhan ini.</h4>
                  </div>

                  {(response.warnings?.length ?? 0) > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/40 p-3 rounded-xl">
                      <ul className="list-disc pl-4 space-y-1 text-yellow-800 dark:text-yellow-200">
                        {response.warnings?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {(response.limitations?.length ?? 0) > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {response.limitations?.map((l, i) => <p key={i}>{l}</p>)}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Coba gunakan istilah lain seperti:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {((response as HerbalRecommendationResponse & { suggested_terms?: string[] })?.suggested_terms ?? [
                        'sariawan',
                        'luka mulut',
                        'iritasi tenggorokan',
                        'tenggorokan panas',
                      ]).map((term) => (
                        <li key={term}>{term}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={resetSearch} className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold cursor-pointer">Cari ulang</button>
                    <button onClick={() => { setResponse(null); setError(null); setStatus('idle'); }} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold cursor-pointer">Ubah keluhan</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPlant && (() => {
          const herbId = resolveHerbId(selectedPlant);
          const loadedDetail = herbId ? detailByHerbId[herbId] : null;
          const isDetailLoading = herbId ? detailLoadingId === herbId : false;
          const detailError = herbId ? detailErrorByHerbId[herbId] ?? '' : '';

          const prepFv = selectedPlant.field_verifications?.find(f => f.field_name === 'preparation_method');
          const isPrepGraph = prepFv?.verification_source === 'graph_verified';
          const isPrepModel = prepFv?.verification_source === 'model_assisted';

          const usageFv = selectedPlant.field_verifications?.find(f => f.field_name === 'usage_rule');
          const isUsageModel = usageFv?.verification_source === 'model_assisted';

          // Merge: prefer lazy detail over analyze data
          const mergeArr = <T,>(detailArr?: T[] | null, candidateArr?: T[] | null): T[] => {
            const d = asArray(detailArr);
            return d.length > 0 ? d : asArray(candidateArr);
          };

          const traditionalUses = mergeArr(
            loadedDetail?.traditional_uses,
            [...asArray(selectedPlant.traditional_uses), ...asArray(selectedPlant.enrichment?.traditional_uses)],
          );
          const preparationMethods = mergeArr(
            loadedDetail?.preparation_methods,
            [...asArray(selectedPlant.preparation_methods), ...asArray(selectedPlant.enrichment?.preparation_methods)],
          );
          const usageGuidelines = mergeArr(
            loadedDetail?.usage_guidelines,
            [...asArray(selectedPlant.usage_guidelines), ...asArray(selectedPlant.enrichment?.usage_guidelines)],
          );
          const safetyWarnings = mergeArr(
            loadedDetail?.safety_warnings,
            [...asArray(selectedPlant.safety_warnings), ...asArray(selectedPlant.enrichment?.safety_warnings)],
          );
          const drugInteractions = mergeArr(
            loadedDetail?.drug_interactions,
            [...asArray(selectedPlant.drug_interactions), ...asArray(selectedPlant.enrichment?.drug_interactions)],
          );
          const contraindications = mergeArr(
            loadedDetail?.contraindications,
            [...asArray(selectedPlant.contraindications), ...asArray(selectedPlant.enrichment?.contraindications)],
          );
          const detailPlantParts = asArray(loadedDetail?.plant_parts);
          const plantParts = detailPlantParts.length > 0
            ? detailPlantParts.map(p => p.name).filter(Boolean) as string[]
            : candidatePlantParts(selectedPlant);
          const relatedSymptoms = candidateRelatedSymptoms(selectedPlant);
          const sources = nestedSources(selectedPlant);
          const storageGuidelines = mergeArr(
            loadedDetail?.storage_guidelines,
            [...asArray(selectedPlant.storage_guidelines), ...asArray(selectedPlant.enrichment?.storage_guidelines)],
          );
          const mythFacts = [...asArray(selectedPlant.myth_facts), ...asArray(selectedPlant.enrichment?.myth_facts)];
          const qualityStandards = [...asArray(selectedPlant.quality_standards), ...asArray(selectedPlant.enrichment?.quality_standards)];
          const clinicalGuidelines = [...asArray(selectedPlant.clinical_guidelines), ...asArray(selectedPlant.enrichment?.clinical_guidelines)];
          const pharmacokinetics = [...asArray(selectedPlant.pharmacokinetic_profiles), ...asArray(selectedPlant.enrichment?.pharmacokinetic_profiles)];
          const researchTopics = [...asArray(selectedPlant.research_topics), ...asArray(selectedPlant.enrichment?.research_topics)];
          const claims = [...asArray(selectedPlant.claims), ...asArray(selectedPlant.enrichment?.claims)];

          return (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPlant(null)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col justify-between border-l border-gray-200 dark:border-gray-800 z-10"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl">{plantIcon(selectedPlant)}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-50 leading-tight truncate">{selectedPlant.local_name}</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5 truncate">{selectedPlant.scientific_name || 'Nama ilmiah belum tersedia'}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {renderVerificationBadge(getVerificationSourceFromCandidate(selectedPlant), selectedPlant)}
                        {renderRelevanceBadge(selectedPlant)}
                        {renderSafetyStatusBadge(selectedPlant)}
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">{getEvidenceLabelV2(selectedPlant)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Detail loading indicator */}
                  {isDetailLoading && (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 p-3 rounded-xl">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Memuat detail dari knowledge graph...
                    </div>
                  )}

                  {detailError && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl">
                      {detailError}
                    </div>
                  )}

                  <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{selectedPlant.explanation || selectedPlant.recommendation_reason || 'Alasan rekomendasi belum tersedia pada data saat ini.'}</p>
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Gejala cocok: </span>
                      {relatedSymptoms.length ? relatedSymptoms.join(', ') : emptyText}
                      {(selectedPlant.unmatched_symptoms?.length ?? 0) > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 ml-1">
                          (tidak cocok: {selectedPlant.unmatched_symptoms?.join(', ')})
                        </span>
                      )}
                    </div>
                    {(selectedPlant.match_reasons?.length ?? 0) > 0 && (
                      <div>
                        <span className="font-black text-gray-500 uppercase tracking-wider">Kenapa direkomendasikan:</span>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          {selectedPlant.match_reasons?.map((reason) => <li key={reason}>{reason}</li>)}
                        </ul>
                      </div>
                    )}
                    {(selectedPlant.matched_uses?.length ?? 0) > 0 && (
                      <div>
                        <span className="font-black text-gray-500 uppercase tracking-wider">Kegunaan terapeutik cocok: </span>
                        {selectedPlant.matched_uses?.join(', ')}
                      </div>
                    )}
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Penggunaan tradisional: </span>
                      {traditionalUses.length ? traditionalUses.map(textFromUnknown).filter(Boolean).join(', ') : emptyText}
                    </div>
                    {(selectedPlant.active_compounds?.length ?? 0) > 0 && (
                      <div>
                        <span className="font-black text-gray-500 uppercase tracking-wider">Senyawa terkait: </span>
                        {selectedPlant.active_compounds.join(', ')}
                      </div>
                    )}
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Penyimpanan/Ketersediaan data: </span>
                      {formatAvailabilityLabel(selectedPlant)}
                    </div>
                  </div>

                  <div className="flex border-b border-gray-100 dark:border-gray-800 gap-4 text-xs font-bold uppercase tracking-wider">
                    {[
                      ['ringkasan', 'Ringkasan'],
                      ['tradisional', 'Penggunaan Tradisional'],
                      ['pengolahan', 'Cara Pengolahan'],
                      ['aturan', 'Aturan Pakai'],
                      ['peringatan', 'Peringatan'],
                      ['sumber', 'Sumber'],
                      ['lanjutan', 'Lanjutan'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key as DetailTab)}
                        className={cn(
                          'pb-2.5 transition-colors cursor-pointer border-b-2',
                          activeTab === key ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'ringkasan' && (
                    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                        <p><span className="font-bold">Tanaman:</span> {selectedPlant.local_name}</p>
                        <p><span className="font-bold">Nama ilmiah:</span> {selectedPlant.scientific_name || 'Nama ilmiah belum tersedia'}</p>
                        <p><span className="font-bold">Score:</span> {getRelevancePercent(selectedPlant)}%</p>
                        <p><span className="font-bold">Relevansi:</span> {getRelevanceBadgeText(selectedPlant)}</p>
                        <p><span className="font-bold">Alasan:</span> {selectedPlant.explanation || selectedPlant.recommendation_reason || 'Alasan rekomendasi belum tersedia.'}</p>
                        <p><span className="font-bold">Gejala terkait:</span> {relatedSymptoms.length ? relatedSymptoms.join(', ') : emptyText}</p>
                        <p><span className="font-bold">Senyawa terkait:</span> {selectedPlant.active_compounds?.length ? selectedPlant.active_compounds.join(', ') : emptyText}</p>
                        <p><span className="font-bold">Bagian tanaman:</span> {plantParts.length ? plantParts.join(', ') : (isDetailLoading ? 'Memuat data...' : 'Bagian tanaman belum tersedia pada knowledge graph.')}</p>
                      </div>
                      <p className="text-[11px] text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3 rounded-xl">{response?.general_disclaimer || medicalDisclaimer}</p>
                    </div>
                  )}

                  {activeTab === 'tradisional' && (
                    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                      {traditionalUses.length ? traditionalUses.map((use, idx) => {
                        const item = typeof use === 'string' ? { title: use } : use;
                        return (
                          <div key={itemKey('tradisional', use, idx)} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.title || 'Penggunaan tradisional'}</h4>
                            {'description' in item && item.description && <p>{item.description}</p>}
                            {'category' in item && item.category && <p>Kategori: {item.category}</p>}
                            {'evidence_level' in item && <p>Bukti: {getEvidenceLabel(item.evidence_level)}</p>}
                            {'verification_status' in item && <p>Status: {getVerificationLabel(item.verification_status)}</p>}
                          </div>
                        );
                      }) : (
                        <p className="text-gray-400 italic">Informasi penggunaan tradisional belum tersedia pada knowledge graph.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'pengolahan' && (
                    <div className="space-y-4">
                      {prepFv && (
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            Sumber: {isPrepGraph ? 'Terverifikasi Knowledge Graph' : 'Panduan umum berbantuan AI'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            Status: {isPrepGraph ? 'Terverifikasi' : 'Belum terverifikasi'}
                          </p>
                          {isPrepModel && (
                            <p className="text-amber-600 dark:text-amber-400 mt-2 font-medium">
                              Panduan umum pengolahan berbantuan AI. Takaran dan metode spesifik belum terverifikasi Knowledge Graph.
                            </p>
                          )}
                        </div>
                      )}
                      {preparationMethods.length ? preparationMethods.map((method, methodIdx) => {
                        const id = 'method_id' in method ? method.method_id : method.id;
                        const methodType = 'preparation_type' in method ? method.preparation_type : method.method_type;
                        const ingredients = (Array.isArray(method.ingredients) ? method.ingredients : []).map((i) => typeof i === 'string' ? i : `${i.name}${i.amount_text ? ` (${i.amount_text})` : ''}`);
                        const formulations = 'formulations' in method ? asArray(method.formulations) : [];
                        const steps = Array.isArray(method.steps) && method.steps.length ? method.steps : [];
                        return (
                          <div key={id || methodIdx} className="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">{method.title}</h4>
                            {methodType && <p className="text-xs text-gray-500">Jenis: {methodType}</p>}
                            <p className="text-xs text-gray-500">Bagian tanaman: {method.plant_part || 'Belum tercatat'}</p>
                            <p className="text-xs text-gray-500">Bahan: {ingredients.length ? ingredients.join(', ') : 'Takaran terstandar belum tersedia pada database.'}</p>
                            {formulations.length > 0 && <p className="text-xs text-gray-500">Formulasi: {formulations.join(', ')}</p>}
                            {'notes' in method && method.notes && <p className="text-xs text-gray-500">Catatan: {method.notes}</p>}
                            {'verification_status' in method && <p className="text-xs text-gray-500">Status: {getVerificationLabel(method.verification_status)}</p>}
                            {steps.length > 0 ? (
                              <ol className="space-y-2.5">
                                {steps.map((step, idx) => (
                                  <li key={`${id || methodIdx}-${idx}`} className="flex gap-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                                    <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Langkah pengolahan belum tercatat.</p>
                            )}
                          </div>
                        );
                      }) : (
                        isDetailLoading
                          ? <p className="text-gray-400 italic text-xs flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Memuat cara pengolahan dari knowledge graph...</p>
                          : <p className="text-gray-400 italic text-xs">Cara pengolahan belum tercatat pada knowledge graph untuk kandidat ini.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'aturan' && (
                    <div className="space-y-3">
                      {isUsageModel && (
                        <div className="text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/40 font-medium">
                          Dosis khusus tidak tersedia dari knowledge graph. Gunakan produk terstandar sesuai label atau konsultasikan dengan farmasis.
                        </div>
                      )}
                      {usageFv && (
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            Sumber: {isUsageModel ? 'Panduan umum berbantuan AI' : 'Knowledge Graph'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            Status: {isUsageModel ? 'Belum terverifikasi' : 'Terverifikasi'}
                          </p>
                        </div>
                      )}
                      {usageGuidelines.map((guide, idx) => (
                        <div key={guide.id || idx} className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex gap-2.5 items-start"><ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span className="font-bold">{guide.title || 'Aturan pakai edukatif'}</span></div>
                          {guide.description && <p>{guide.description}</p>}
                          {guide.frequency_text && <p>Frekuensi: {guide.frequency_text}</p>}
                          {guide.duration_text && <p>Durasi: {guide.duration_text}</p>}
                          {guide.dose_status && <p>Status dosis: {guide.dose_status}</p>}
                          {guide.verification_status && <p>Status: {getVerificationLabel(guide.verification_status)}</p>}
                        </div>
                      ))}
                      {selectedPlant.usage_rules?.length ? selectedPlant.usage_rules.map((rule, idx) => (
                        <div key={idx} className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex gap-2.5 items-start"><ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>Bentuk: {rule.form || 'Belum tercatat'}</span></div>
                          <p>Jumlah: {canShowClinicalDose(persona) ? (rule.amount_text || 'Belum tercatat') : 'Dosis klinis detail tidak ditampilkan untuk penggunaan mandiri. Gunakan sesuai batas wajar dan konsultasikan kepada tenaga kesehatan bila memiliki kondisi khusus.'}</p>
                          {rule.frequency_text && <p>Frekuensi: {rule.frequency_text}</p>}
                          {rule.duration_text && <p>Durasi: {rule.duration_text}</p>}
                          {rule.administration_notes.length > 0 && <p>Catatan: {rule.administration_notes.join(', ')}</p>}
                        </div>
                      )) : null}
                      {!usageGuidelines.length && !selectedPlant.usage_rules?.length && (
                        isDetailLoading
                          ? <p className="text-gray-400 italic text-xs flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Memuat aturan pakai dari knowledge graph...</p>
                          : <p className="text-gray-400 italic text-xs">Aturan pakai spesifik belum tercatat pada knowledge graph. Gunakan informasi herbal secara hati-hati dan konsultasikan dengan tenaga kesehatan bila gejala menetap.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'peringatan' && (
                    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                      {selectedPlant.general_safety_warnings?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl space-y-2">
                          <span className="text-xs font-black text-amber-800 dark:text-amber-400 block uppercase tracking-wide">Peringatan umum keselamatan</span>
                          <p className="whitespace-pre-line leading-relaxed text-amber-700 dark:text-amber-300">{selectedPlant.general_safety_warnings[0]}</p>
                        </div>
                      )}

                      {selectedPlant.safety?.stop_use_signs?.length ? (
                        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4 rounded-2xl space-y-2">
                          <span className="text-xs font-black text-orange-800 dark:text-orange-400 block uppercase tracking-wide">Tanda harus hentikan penggunaan</span>
                          <ul className="list-disc pl-4 space-y-1">
                            {selectedPlant.safety.stop_use_signs.map((sign, i) => <li key={i}>{sign}</li>)}
                          </ul>
                        </div>
                      ) : null}

                      <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-3 w-full">
                          <span className="text-xs font-black text-red-800 dark:text-red-400 block uppercase tracking-wide">Peringatan Keamanan Medis</span>

                          {safetyWarnings.length > 0 && (
                            <div>
                              <span className="font-bold">Peringatan knowledge graph:</span>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {safetyWarnings.map((warning, idx) => (
                                  <li key={warning.id || idx}>{warning.title || warning.description || 'Peringatan'}{warning.population_risks?.length ? ` — risiko: ${warning.population_risks.join(', ')}` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedPlant.warnings?.length > 0 && (
                            <div>
                              <span className="font-bold">Peringatan:</span>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {selectedPlant.warnings.map((w, idx) => typeof w === 'string'
                                  ? <li key={`${w}-${idx}`}>{w}</li>
                                  : <li key={w.safety_id}>{w.title}{w.severity !== 'unspecified' ? ` (${w.severity})` : ''}</li>)}
                              </ul>
                            </div>
                          )}

                          <div>
                            <span className="font-bold">Kontraindikasi ({formatSafetyFieldStatus(selectedPlant.contraindication_status?.status)}):</span>
                            <p>{contraindications.length ? contraindications.map(textFromUnknown).filter(Boolean).join(', ') : 'Belum ada kontraindikasi spesifik yang tercatat pada knowledge graph.'}</p>
                          </div>
                          <div>
                            <span className="font-bold">Interaksi ({formatSafetyFieldStatus(selectedPlant.interaction_status?.status)}):</span>
                            <p>{selectedPlant.interactions?.length ? selectedPlant.interactions.join(', ') : drugInteractions.length ? drugInteractions.map(textFromUnknown).filter(Boolean).join(', ') : 'Belum ada interaksi spesifik yang tercatat pada knowledge graph.'}</p>
                          </div>
                          <div>
                            <span className="font-bold">Kelompok berisiko ({formatSafetyFieldStatus(selectedPlant.risk_group_status?.status)}):</span>
                            <p>{selectedPlant.risk_groups?.length ? selectedPlant.risk_groups.join(', ') : 'Belum ada kelompok berisiko spesifik yang tercatat pada knowledge graph.'}</p>
                          </div>
                          <div>
                            <span className="font-bold">Efek samping ({formatSafetyFieldStatus(selectedPlant.side_effect_status?.status)}):</span>
                            <p>{selectedPlant.side_effects?.length ? selectedPlant.side_effects.join(', ') : 'Belum ada efek samping spesifik yang tercatat pada knowledge graph.'}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3 rounded-xl">
                        {medicalDisclaimer}
                      </p>

                      {!safetyWarnings.length && !selectedPlant.warnings?.length && !contraindications.length && !drugInteractions.length && (
                        <p className="text-gray-400 italic">Belum ada peringatan spesifik pada knowledge graph. Tetap berhati-hati bila sedang hamil, menyusui, memiliki penyakit kronis, atau menggunakan obat rutin.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'sumber' && (
                    <div className="space-y-4 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">Skor Verifikasi</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <p>Relevansi: <span className="font-mono">{formatPercent(selectedPlant.scores?.relevance ?? selectedPlant.scores?.relevance_score ?? selectedPlant.recommendation_score)}</span></p>
                          <p>Graph Coverage: <span className="font-mono">{formatPercent(selectedPlant.scores?.graph_coverage ?? selectedPlant.graph_coverage_score)}</span></p>
                          <p>Cakupan Sumber: <span className="font-mono">{formatPercent(selectedPlant.scores?.trusted_source_coverage ?? selectedPlant.trusted_source_coverage_score)}</span></p>
                          <p>Model Assisted: <span className="font-mono">{formatPercent(selectedPlant.scores?.model_assisted_coverage ?? selectedPlant.model_assisted_coverage_score)}</span></p>
                          <p>Keamanan: <span className="font-mono">{formatPercent(selectedPlant.scores?.safety_coverage ?? selectedPlant.safety_coverage_score)}</span></p>
                          <p>Cakupan Gejala: <span className="font-mono">{formatPercent(selectedPlant.symptom_coverage)}</span></p>
                        </div>
                        <p>Status Data Keamanan: <span className="font-mono capitalize">{selectedPlant.safety_data_status}</span></p>
                      </div>

                      {sources.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Sumber</h4>
                          {sources.map((src, idx) => (
                            <div key={src.source_id || src.identifier || src.title || idx} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
                              <p className="font-bold text-gray-800 dark:text-gray-200">{src.title || src.source_id || 'Sumber Neo4j'}</p>
                              {(src.identifier || src.year) && <p className="text-gray-500">{src.identifier}{src.year ? ` (${src.year})` : ''}</p>}
                              {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{src.url}</a>}
                            </div>
                          ))}
                        </div>
                      ) : selectedPlant.provenance?.source_ids?.length ? (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Referensi Graph</h4>
                          {selectedPlant.provenance.source_ids.map((sourceId, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                              <p className="font-bold text-gray-800 dark:text-gray-200">{sourceId}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Sumber spesifik belum tersedia pada data ini.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'lanjutan' && (
                    <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
                      {(persona === 'umum' || persona === 'pelajar') && (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Edukasi ringkas</h4>
                          {storageGuidelines.length > 0 ? storageGuidelines.map((item, idx) => (
                            <div key={item.id || idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                              <p className="font-bold">{item.title || 'Penyimpanan'}</p>
                              <p>{item.description || item.notes || emptyText}</p>
                              {item.storage_temperature && <p>Suhu: {item.storage_temperature}</p>}
                            </div>
                          )) : <p className="text-gray-400 italic">Panduan penyimpanan belum tersedia.</p>}
                          {mythFacts.map((item, idx) => (
                            <div key={item.id || idx} className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
                              <p className="font-bold">Mitos: {item.claim || emptyText}</p>
                              <p>Fakta: {item.fact || emptyText}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {persona === 'peneliti' && (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Peneliti</h4>
                          {researchTopics.map((topic, idx) => <p key={topic.id || idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">{topic.title || emptyText}{topic.category ? ` — ${topic.category}` : ''}</p>)}
                          {claims.map((claim, idx) => (
                            <div key={claim.claim_id || idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                              <p className="font-bold">{claim.claim_text || 'Klaim'}</p>
                              <p>Bukti: {getEvidenceLabel(claim.evidence_level)}</p>
                              {claim.evidence_summary && <p>{claim.evidence_summary}</p>}
                            </div>
                          ))}
                          {qualityStandards.map((standard, idx) => <p key={standard.id || idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">{standard.parameter || 'Standar mutu'}: {standard.value || emptyText}</p>)}
                        </div>
                      )}

                      {persona === 'tenaga_medis' && (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Tenaga medis</h4>
                          {clinicalGuidelines.length > 0 ? clinicalGuidelines.map((guide, idx) => (
                            <div key={guide.id || idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                              <p>Mekanisme: {guide.mechanism || emptyText}</p>
                              <p>Dosis klinis: {canShowClinicalDose(persona) ? (guide.therapeutic_dose_text || emptyText) : 'Dosis klinis detail tidak ditampilkan untuk penggunaan mandiri. Gunakan sesuai batas wajar dan konsultasikan kepada tenaga kesehatan bila memiliki kondisi khusus.'}</p>
                              {guide.notes && <p>Catatan: {guide.notes}</p>}
                            </div>
                          )) : <p className="text-gray-400 italic">Panduan klinis belum tersedia.</p>}
                          <p><span className="font-bold">Interaksi:</span> {drugInteractions.length ? drugInteractions.map(textFromUnknown).filter(Boolean).join(', ') : emptyText}</p>
                          <p><span className="font-bold">Kontraindikasi:</span> {contraindications.length ? contraindications.map(textFromUnknown).filter(Boolean).join(', ') : emptyText}</p>
                        </div>
                      )}

                      {(persona === 'peneliti' || persona === 'tenaga_medis') && pharmacokinetics.map((pk, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                          <p className="font-bold">Farmakokinetik</p>
                          <p>Absorpsi: {pk.absorption || emptyText}</p>
                          <p>Distribusi: {pk.distribution || emptyText}</p>
                          <p>Metabolisme: {pk.metabolism || emptyText}</p>
                          <p>Ekskresi: {pk.excretion || emptyText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Tutup Panduan
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
