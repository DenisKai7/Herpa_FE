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
  HerbalCandidate,
  HerbalRecommendationApiError,
  HerbalRecommendationResponse,
  RecommendationStatus,
  VerificationSource,
} from '@/lib/api/herbalRecommendation';

const emptyText = 'Informasi ini tidak ditampilkan karena belum lolos verifikasi.';

type DetailTab = 'pengolahan' | 'aturan' | 'peringatan' | 'sumber';

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

function scorePercent(score: number) {
  return `${Math.round(score * 100)}%`;
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
  return Array.from(map.values()).sort((a, b) => b.recommendation_score - a.recommendation_score || (a.scientific_name || a.local_name).localeCompare(b.scientific_name || b.local_name));
}

function formatEvidenceLevel(value: string) {
  const labels: Record<string, string> = {
    traditional: 'Penggunaan tradisional',
    phytochemical_screening: 'Skrining fitokimia',
    in_vitro: 'Bukti in-vitro',
    in_vivo: 'Bukti in-vivo',
    clinical: 'Bukti klinis',
    systematic_review: 'Tinjauan sistematis',
    data_not_available: 'Data bukti belum tersedia',
    insufficient_evidence: 'Bukti masih terbatas',
  };
  return labels[value] ?? 'Data bukti belum tersedia';
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

function renderVerificationBadge(source: VerificationSource) {
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
    unavailable: 'Data belum dapat dipastikan',
    graph_verified: 'Terverifikasi Knowledge Graph',
    graph_model_verified: 'Knowledge Graph + Validasi AI',
  };
  return (
    <span className={cn('text-[9px] font-black px-2 py-1 rounded-full', styles[source] || styles.unavailable)}>
      {labels[source] || labels.unavailable}
    </span>
  );
}

function renderRelevanceBadge(candidate: HerbalCandidate) {
  const rs = candidate.relevance_status;
  if (rs === 'exact_match') {
    return (
      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40">
        Cocok tepat ({Math.round(candidate.symptom_coverage * 100)}%)
      </span>
    );
  }
  if (rs === 'partial_match') {
    return (
      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
        Cocok sebagian ({Math.round(candidate.symptom_coverage * 100)}%)
      </span>
    );
  }
  return (
    <span className="text-[9px] font-black px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-950/40 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800/40">
      Relevansi rendah ({Math.round(candidate.symptom_coverage * 100)}%)
    </span>
  );
}

function renderSafetyStatusBadge(candidate: HerbalCandidate) {
  if (candidate.safety_status === 'eligible') {
    return (
      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300">
        Aman digunakan
      </span>
    );
  }
  if (candidate.safety_status === 'conditional') {
    return (
      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300">
        Perhatian khusus
      </span>
    );
  }
  return (
    <span className="text-[9px] font-black px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300">
      Tidak aman
    </span>
  );
}

function formatAvailabilityLabel(candidate: HerbalCandidate) {
  const fv = candidate.field_verifications?.find(f => f.field_name === 'availability');
  if (fv) {
    if (fv.verification_source === 'graph_verified') {
      return 'Ketersediaan terverifikasi Knowledge Graph';
    }
    if (fv.verification_source === 'model_assisted') {
      return 'Perkiraan ketersediaan berbantuan AI';
    }
  }
  if (candidate.availability === 'unknown') {
    return 'Ketersediaan belum dapat dipastikan';
  }
  return candidate.availability_label || 'Ketersediaan belum dapat dipastikan';
}

export default function HerbalRecommendationPage() {
  const router = useRouter();
  const [complaint, setComplaint] = useState('');
  const [response, setResponse] = useState<HerbalRecommendationResponse | null>(null);
  const [status, setStatus] = useState<RecommendationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<HerbalCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('pengolahan');

  const recommendations = uniqueCandidates(response?.recommendations ?? []);
  const isLoading = ['validating', 'analyzing_symptoms', 'searching_graph', 'checking_safety', 'ranking'].includes(status);

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
        persona: 'umum',
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
                    Ditemukan {recommendations.length} kandidat tanaman yang memenuhi kriteria saat ini.
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
                          onClick={() => {
                            setActiveTab('pengolahan');
                            setSelectedPlant(plant);
                          }}
                          className="bg-white dark:bg-gray-900 border-2 border-green-500 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer text-left select-none flex flex-col justify-between h-full"
                        >
                          <div>
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{plantIcon(plant)}</span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{plant.local_name}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic truncate mt-0.5">{plant.scientific_name || emptyText}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {renderVerificationBadge(verifSource)}
                              {renderRelevanceBadge(plant)}
                              {renderSafetyStatusBadge(plant)}
                              <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                {formatEvidenceLevel(plant.evidence_level)}
                              </span>
                            </div>
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                              {plant.recommendation_reason || plant.explanation || 'Penjelasan belum tersedia dari backend.'}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-400">Score {scorePercent(plant.recommendation_score)}</p>
                              {plant.symptom_coverage > 0 && (
                                <p className="text-[10px] text-gray-400">| Gejala {scorePercent(plant.symptom_coverage)}</p>
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
                  <div className="flex flex-wrap gap-2">
                    <button onClick={resetSearch} className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold">Cari ulang</button>
                    <button onClick={() => setResponse(null)} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold">Ubah keluhan</button>
                    <button onClick={() => router.push('/')} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold">Lihat informasi umum non-rekomendasi</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPlant && (() => {
          const prepFv = selectedPlant.field_verifications?.find(f => f.field_name === 'preparation_method');
          const isPrepGraph = prepFv?.verification_source === 'graph_verified';
          const isPrepModel = prepFv?.verification_source === 'model_assisted';

          const usageFv = selectedPlant.field_verifications?.find(f => f.field_name === 'usage_rule');
          const isUsageModel = usageFv?.verification_source === 'model_assisted';

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
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5 truncate">{selectedPlant.scientific_name || emptyText}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {renderVerificationBadge(getVerificationSourceFromCandidate(selectedPlant))}
                        {renderRelevanceBadge(selectedPlant)}
                        {renderSafetyStatusBadge(selectedPlant)}
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">{formatEvidenceLevel(selectedPlant.evidence_level)}</span>
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
                  <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{selectedPlant.recommendation_reason || selectedPlant.explanation || emptyText}</p>
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Gejala cocok: </span>
                      {selectedPlant.matched_symptoms.length ? selectedPlant.matched_symptoms.join(', ') : emptyText}
                      {selectedPlant.unmatched_symptoms.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 ml-1">
                          (tidak cocok: {selectedPlant.unmatched_symptoms.join(', ')})
                        </span>
                      )}
                    </div>
                    {selectedPlant.matched_uses.length > 0 && (
                      <div>
                        <span className="font-black text-gray-500 uppercase tracking-wider">Kegunaan terapeutik cocok: </span>
                        {selectedPlant.matched_uses.join(', ')}
                      </div>
                    )}
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Penggunaan tradisional: </span>
                      {selectedPlant.traditional_uses.length ? selectedPlant.traditional_uses.join(', ') : emptyText}
                    </div>
                    <div>
                      <span className="font-black text-gray-500 uppercase tracking-wider">Ketersediaan: </span>
                      {formatAvailabilityLabel(selectedPlant)}
                    </div>
                  </div>

                  <div className="flex border-b border-gray-100 dark:border-gray-800 gap-4 text-xs font-bold uppercase tracking-wider">
                    {[
                      ['pengolahan', 'Cara Pengolahan'],
                      ['aturan', 'Aturan Pakai'],
                      ['peringatan', 'Peringatan'],
                      ['sumber', 'Sumber'],
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

                  {activeTab === 'pengolahan' && (
                    <div className="space-y-4">
                      {prepFv && (
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            Sumber: {isPrepGraph ? 'Terverifikasi Knowledge Graph' : 'Panduan umum berbantuan AI'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            Status: {isPrepGraph ? 'Terverifikasi Knowledge Graph' : 'Belum terverifikasi Knowledge Graph'}
                          </p>
                          {isPrepModel && (
                            <p className="text-amber-600 dark:text-amber-400 mt-2 font-medium">
                              Panduan umum pengolahan berbantuan AI. Takaran dan metode spesifik belum terverifikasi Knowledge Graph.
                            </p>
                          )}
                        </div>
                      )}
                      {selectedPlant.preparation_methods.length ? selectedPlant.preparation_methods.map((method) => (
                        <div key={method.method_id} className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">{method.title}</h4>
                          <p className="text-xs text-gray-500">Bagian tanaman: {method.plant_part || emptyText}</p>
                          <p className="text-xs text-gray-500">Bahan: {method.ingredients.length ? method.ingredients.map(i => typeof i === 'string' ? i : `${i.name}${i.amount_text ? ` (${i.amount_text})` : ''}`).join(', ') : 'Takaran terstandar belum tersedia pada database.'}</p>
                          <ol className="space-y-2.5">
                            {(method.steps.length ? method.steps : [emptyText]).map((step, idx) => (
                              <li key={`${method.method_id}-${idx}`} className="flex gap-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )) : null}
                    </div>
                  )}

                  {activeTab === 'aturan' && (
                    <div className="space-y-3">
                      {isUsageModel && (
                        <div className="text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/40 font-medium">
                          Dosis khusus tidak tersedia dari knowledge graph. Gunakan produk terstandar sesuai label atau konsultasikan dengan farmasis.
                        </div>
                      )}
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          Sumber: {isUsageModel ? 'Panduan umum berbantuan AI' : 'Terverifikasi Knowledge Graph'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                          Status: {isUsageModel ? 'Belum terverifikasi Knowledge Graph' : 'Terverifikasi Knowledge Graph'}
                        </p>
                      </div>
                      {selectedPlant.usage_rules.length ? selectedPlant.usage_rules.map((rule, idx) => (
                        <div key={idx} className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex gap-2.5 items-start"><ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>Bentuk: {rule.form || emptyText}</span></div>
                          <p>Jumlah: {rule.amount_text}</p>
                          <p>Frekuensi: {rule.frequency_text}</p>
                          <p>Durasi: {rule.duration_text || emptyText}</p>
                          <p>Catatan: {rule.administration_notes.length ? rule.administration_notes.join(', ') : emptyText}</p>
                        </div>
                      )) : null}
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

                          {selectedPlant.warnings?.length > 0 && (
                            <div>
                              <span className="font-bold">Peringatan:</span>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {selectedPlant.warnings.map((w) => <li key={w.safety_id}>{w.title}{w.severity !== 'unspecified' ? ` (${w.severity})` : ''}</li>)}
                              </ul>
                            </div>
                          )}

                          <div>
                            <span className="font-bold">Kontraindikasi ({selectedPlant.contraindication_status?.status || 'missing'}):</span>
                            <p>{selectedPlant.contraindications.length ? selectedPlant.contraindications.join(', ') : emptyText}</p>
                          </div>
                          <div>
                            <span className="font-bold">Interaksi ({selectedPlant.interaction_status?.status || 'missing'}):</span>
                            <p>{selectedPlant.interactions.length ? selectedPlant.interactions.join(', ') : emptyText}</p>
                          </div>
                          <div>
                            <span className="font-bold">Kelompok berisiko ({selectedPlant.risk_group_status?.status || 'missing'}):</span>
                            <p>{selectedPlant.risk_groups.length ? selectedPlant.risk_groups.join(', ') : emptyText}</p>
                          </div>
                          <div>
                            <span className="font-bold">Efek samping ({selectedPlant.side_effect_status?.status || 'missing'}):</span>
                            <p>{selectedPlant.side_effects.length ? selectedPlant.side_effects.join(', ') : emptyText}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sumber' && (
                    <div className="space-y-4 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">Skor Verifikasi</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <p>Relevansi: <span className="font-mono">{scorePercent(selectedPlant.scores?.relevance ?? selectedPlant.recommendation_score)}</span></p>
                          <p>Graph Coverage: <span className="font-mono">{scorePercent(selectedPlant.scores?.graph_coverage ?? selectedPlant.graph_coverage_score)}</span></p>
                          <p>Sumber Tepercaya: <span className="font-mono">{scorePercent(selectedPlant.scores?.trusted_source_coverage ?? selectedPlant.trusted_source_coverage_score ?? 0)}</span></p>
                          <p>Model Assisted: <span className="font-mono">{scorePercent(selectedPlant.scores?.model_assisted_coverage ?? selectedPlant.model_assisted_coverage_score)}</span></p>
                          <p>Keamanan: <span className="font-mono">{scorePercent(selectedPlant.scores?.safety_coverage ?? selectedPlant.safety_coverage_score ?? 0)}</span></p>
                          <p>Cakupan Gejala: <span className="font-mono">{scorePercent(selectedPlant.symptom_coverage ?? 0)}</span></p>
                        </div>
                        <p>Status Data Keamanan: <span className="font-mono capitalize">{selectedPlant.safety_data_status}</span></p>
                      </div>

                      {selectedPlant.sources?.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Sumber Bukti</h4>
                          {selectedPlant.sources.map((src) => (
                            <div key={src.source_id} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-800 dark:text-gray-200">{src.title}</p>
                                <span className={cn(
                                  'text-[8px] font-black px-1.5 py-0.5 rounded-full',
                                  src.evidence_grade === 'A' ? 'bg-green-100 text-green-700' :
                                  src.evidence_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                  src.evidence_grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'
                                )}>
                                  Tier {src.evidence_grade}
                                </span>
                              </div>
                              {src.publisher && <p className="text-gray-500">{src.publisher}{src.year ? ` (${src.year})` : ''}</p>}
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
                        <p className="text-gray-400 italic">Tidak ada literatur spesifik yang tercatat di graph.</p>
                      )}
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
