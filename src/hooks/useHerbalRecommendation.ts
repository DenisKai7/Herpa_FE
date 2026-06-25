import { useState, useCallback } from 'react';
import {
  analyzeHerbalComplaint,
  getHerbRecommendationDetail,
  getApiErrorMessage,
  HerbalCandidate,
  HerbalRecommendationResponse,
  HerbEnrichmentDetail,
  RecommendationStatus,
} from '@/lib/api/herbalRecommendation';
import { resolveHerbId } from '@/lib/herbalRecommendationNormalize';
import type { Persona } from '@/types/persona';

export type DetailTab = 'ringkasan' | 'tradisional' | 'pengolahan' | 'aturan' | 'peringatan' | 'sumber' | 'lanjutan';

export function useHerbalRecommendation() {
  const [complaint, setComplaint] = useState('');
  const [response, setResponse] = useState<HerbalRecommendationResponse | null>(null);
  const [status, setStatus] = useState<RecommendationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<HerbalCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');
  const [persona, setPersona] = useState<Persona>('umum');

  // Lazy detail states
  const [detailByHerbId, setDetailByHerbId] = useState<Record<string, HerbEnrichmentDetail>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailErrorByHerbId, setDetailErrorByHerbId] = useState<Record<string, string>>({});

  const isLoading = ['validating', 'analyzing_symptoms', 'searching_graph', 'checking_safety', 'ranking'].includes(status);

  const handleOpenDetail = useCallback(async (item: HerbalCandidate) => {
    setActiveTab('ringkasan');
    setSelectedPlant(item);

    const herbId = resolveHerbId(item);
    if (!herbId) return;
    if (detailByHerbId[herbId]) return; // already cached

    try {
      setDetailLoadingId(herbId);
      setDetailErrorByHerbId((prev) => ({ ...prev, [herbId]: '' }));
      const detail = await getHerbRecommendationDetail(herbId, {
        common_name: item.local_name || undefined,
        scientific_name: item.scientific_name || undefined,
      });
      setDetailByHerbId((prev) => ({ ...prev, [herbId]: detail }));
    } catch (err) {
      setDetailErrorByHerbId((prev) => ({
        ...prev,
        [herbId]: getApiErrorMessage(err),
      }));
    } finally {
      setDetailLoadingId(null);
    }
  }, [detailByHerbId]);

  const handleSearch = useCallback(async (complaintText: string, searchPersona: Persona) => {
    const trimmed = complaintText.trim();
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
        persona: searchPersona,
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
      setError(getApiErrorMessage(caught) || 'Rekomendasi gagal diproses.');
      setStatus('failed');
    }
  }, [isLoading]);

  const resetSearch = useCallback(() => {
    setComplaint('');
    setResponse(null);
    setError(null);
    setStatus('idle');
    setSelectedPlant(null);
  }, []);

  return {
    complaint,
    setComplaint,
    response,
    setResponse,
    status,
    setStatus,
    error,
    setError,
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
  };
}
