'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Activity, Loader2 } from 'lucide-react';
import { useHerbalRecommendation } from '@/hooks/useHerbalRecommendation';
import { RecommendationSearchForm } from '@/components/recommendation/RecommendationSearchForm';
import { RecommendationResultGrid } from '@/components/recommendation/RecommendationResultGrid';
import { HerbalDetailDrawer } from '@/components/recommendation/HerbalDetailDrawer';
import { RecommendationEmptyState } from '@/components/recommendation/RecommendationEmptyState';
import { RecommendationDisclaimer } from '@/components/recommendation/RecommendationDisclaimer';
import type { RecommendationStatus } from '@/lib/api/herbalRecommendation';

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

export default function HerbalRecommendationPage() {
  const router = useRouter();
  const {
    complaint,
    setComplaint,
    response,
    status,
    error,
    selectedPlant,
    setSelectedPlant,
    activeTab,
    setActiveTab,
    persona,
    setPersona,
    detailByHerbId,
    detailLoadingId,
    detailErrorByHerbId,
    isLoading,
    handleOpenDetail,
    handleSearch,
    resetSearch,
  } = useHerbalRecommendation();

  const candidates = response?.recommendations ?? [];
  const hasCandidates = candidates.length > 0;

  const handleSuggestedClick = (term: string) => {
    setComplaint(term);
    handleSearch(term, persona);
  };

  const resolvedHerbIdVal = selectedPlant
    ? selectedPlant.herb_id || selectedPlant.plant_id || ''
    : '';

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

              <RecommendationSearchForm
                complaint={complaint}
                setComplaint={setComplaint}
                persona={persona}
                setPersona={setPersona}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
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
                  <p>{error}</p>
                </div>
              )}

              {/* Show empty state when completed but no results found */}
              {!isLoading && !error && response && !hasCandidates && (
                <RecommendationEmptyState
                  suggestedTerms={response.suggested_terms}
                  onSuggestedClick={handleSuggestedClick}
                  onReset={resetSearch}
                />
              )}

              {/* Candidates Grid */}
              {!isLoading && !error && hasCandidates && (
                <RecommendationResultGrid
                  candidates={candidates}
                  onCardClick={handleOpenDetail}
                />
              )}

              {!isLoading && response && <RecommendationDisclaimer />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lazy Details Drawer */}
      <AnimatePresence>
        {selectedPlant && (
          <HerbalDetailDrawer
            isOpen={selectedPlant !== null}
            onClose={() => setSelectedPlant(null)}
            candidate={selectedPlant}
            detail={detailByHerbId[resolvedHerbIdVal] || null}
            detailLoading={detailLoadingId === resolvedHerbIdVal}
            detailError={detailErrorByHerbId[resolvedHerbIdVal]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
