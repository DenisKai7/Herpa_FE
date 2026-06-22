import apiClient from './client';

export type RecommendationStatus =
  | 'idle'
  | 'validating'
  | 'analyzing_symptoms'
  | 'searching_graph'
  | 'checking_safety'
  | 'ranking'
  | 'completed'
  | 'completed_with_partial_enrichment'
  | 'completed_with_model_fallback'
  | 'clarification_required'
  | 'medical_attention_recommended'
  | 'no_safe_candidate'
  | 'no_fully_verified_candidate'
  | 'graph_unavailable'
  | 'failed';

export type VerificationSource =
  | 'knowledge_graph'
  | 'trusted_source'
  | 'graph_and_model'
  | 'model_assisted'
  | 'safety_rule'
  | 'unavailable'
  // Legacy compat
  | 'graph_verified'
  | 'graph_model_verified';

export interface FieldEvidence {
  verification_source: VerificationSource;
  verification_status: 'verified' | 'assisted' | 'limited' | 'unavailable' | 'conflicting';
  source_ids: string[];
  graph_node_ids: string[];
  confidence: number | null;
  verified_at: string | null;
  warnings: string[];
}

export interface EvidenceSource {
  source_id: string;
  title: string;
  publisher: string | null;
  year: number | null;
  source_type: string;
  evidence_grade: 'A' | 'B' | 'C' | 'D';
  identifier: string | null;
  url: string | null;
  active: boolean;
  verified_at: string | null;
  supported_fields: string[];
}

export interface CandidateScores {
  confidence?: number;
  relevance?: number;
  relevance_score?: number;
  symptom_match_score?: number;
  evidence_score?: number;
  compound_score?: number;
  safety_score?: number;
  alias_match_score?: number;
  graph_coverage: number;
  trusted_source_coverage: number;
  model_assisted_coverage: number;
  safety_coverage: number;
}

export interface FieldVerification {
  field_name: string;
  value: unknown;
  verification_source: VerificationSource;
  graph_node_ids: string[];
  graph_relationship_ids: string[];
  source_ids: string[];
  model_confidence: number | null;
  model_critic_passed: boolean;
  safety_critical: boolean;
  warnings: string[];
  evidence: FieldEvidence | null;
}

export interface SafetyItem {
  safety_id: string;
  title: string;
  description: string;
  severity: string;
  action_text: string;
  source_ids: string[];
  id: string | null;
  label: string;
}

export interface VerifiedSafetyField {
  status: 'known_issue' | 'no_known_issue_within_source_scope' | 'missing' | 'conflicting';
  items: SafetyItem[];
  source_ids: string[];
  verified_at: string | null;
}

export interface SafetySection {
  contraindications: VerifiedSafetyField;
  interactions: VerifiedSafetyField;
  side_effects: VerifiedSafetyField;
  risk_groups: VerifiedSafetyField;
  general_safety_warnings: string[];
  stop_use_signs: string[];
  medical_attention_signs: string[];
}

export interface SourceProvenanceItem {
  source_id: string;
  title: string;
  publisher: string | null;
  year: number | null;
  evidence_grade: string | null;
  url: string | null;
  verified_at: string | null;
  active: boolean;
}

export interface HerbalRecommendationRequest {
  complaint: string;
  symptoms?: string[];
  persona?: string;
  model_choice?: string;
  age_group?: 'child' | 'teen' | 'adult' | 'elderly' | null;
  pregnancy_status?: 'not_pregnant' | 'pregnant' | 'breastfeeding' | 'unknown' | null;
  allergies?: string[];
  chronic_conditions?: string[];
  medical_conditions?: string[];
  current_medications?: string[];
}

export interface IngredientItem {
  name: string;
  amount_text: string | null;
  source_ids: string[];
}

export interface PreparationMethod {
  method_id: string;
  title: string;
  plant_part: string | null;
  dosage_form: string;
  ingredients: IngredientItem[];
  steps: string[];
  water_volume_text: string | null;
  temperature_text: string | null;
  preparation_duration_text: string | null;
  storage_instruction: string | null;
  discard_instruction: string | null;
  suitable_symptoms: string[];
  preparation_type: string;
  source: string | null;
  evidence_level: string;
  verification_status: string;
  source_ids: string[];
  compatible_symptoms: string[];
  contraindicated_groups: string[];
  evidence: FieldEvidence | null;
}

export interface UsageRule {
  usage_rule_id: string;
  form: string | null;
  amount_text: string | null;
  frequency_text: string | null;
  administration_time_text: string | null;
  duration_text: string | null;
  maximum_duration_text: string | null;
  before_or_after_meal: string | null;
  administration_notes: string[];
  allowed_age_groups: string[];
  prohibited_age_groups: string[];
  applicable_age_groups: string[];
  source: string | null;
  evidence_level: string;
  verification_status: string;
  source_ids: string[];
  evidence: FieldEvidence | null;
}

export interface GraphProvenance {
  graph_verified: boolean;
  coverage_score: number;
  source_ids: string[];
  sources: SourceProvenanceItem[];
  evidence_claim_ids: string[];
  graph_node_ids: string[];
  graph_relationship_ids: string[];
  verified_at: string | null;
  data_version: string;
}

export interface AvailabilityInfo {
  category: string;
  label: string;
  reason: string;
  source_ids: string[];
}

export interface EvidenceInfo {
  level: string;
  label: string;
  source_ids: string[];
}

export type SourceReference = {
  type?: string;
  source_id?: string | null;
  title?: string | null;
  identifier?: string | null;
  year?: string | number | null;
  url?: string | null;
};

export type TraditionalUseItem = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  evidence_level?: string;
  verification_status?: string;
  recommendation_weight?: number | null;
  sources?: SourceReference[];
};

export type PreparationMethodItem = {
  id?: string | null;
  title?: string | null;
  method_type?: string | null;
  plant_part?: string | null;
  ingredients?: string[];
  steps?: string[];
  notes?: string | null;
  verification_status?: string;
  formulations?: string[];
  sources?: SourceReference[];
};

export type UsageGuidelineItem = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  frequency_text?: string | null;
  duration_text?: string | null;
  dose_status?: string;
  verification_status?: string;
  sources?: SourceReference[];
};

export type SafetyWarningItem = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  severity?: string;
  verification_status?: string;
  population_risks?: string[];
  sources?: SourceReference[];
};

export type PlantPartItem = {
  id?: string | null;
  name?: string | null;
  description?: string | null;
};

export type StorageGuidelineItem = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  storage_temperature?: string | null;
  notes?: string | null;
  verification_status?: string;
};

export type MythFactItem = {
  id?: string | null;
  claim?: string | null;
  fact?: string | null;
  risk_level?: string | null;
  verification_status?: string;
};

export type QualityStandardItem = {
  id?: string | null;
  parameter?: string | null;
  value?: string | null;
  source_standard?: string | null;
  verification_status?: string;
};

export type ClinicalGuidelineItem = {
  id?: string | null;
  mechanism?: string | null;
  therapeutic_dose_text?: string | null;
  notes?: string | null;
  visible_to?: string[];
  sources?: SourceReference[];
};

export type DrugInteractionItem = {
  id?: string | null;
  substance?: string | null;
  description?: string | null;
  severity?: string;
  population_risks?: string[];
};

export type ContraindicationItem = {
  id?: string | null;
  condition?: string | null;
  description?: string | null;
  severity?: string;
  population_risks?: string[];
};

export type PharmacokineticProfileItem = {
  absorption?: string | null;
  distribution?: string | null;
  metabolism?: string | null;
  excretion?: string | null;
};

export type ResearchTopicItem = {
  id?: string | null;
  title?: string | null;
  category?: string | null;
  visible_to?: string[];
};

export type ClaimEvidenceItem = {
  claim_id?: string | null;
  claim_text?: string | null;
  claim_type?: string | null;
  evidence_level?: string;
  evidence_summary?: string | null;
  sources?: SourceReference[];
};

export type SymptomItem = {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  aliases?: string[];
};

export type HerbEnrichmentDetail = {
  traditional_uses?: TraditionalUseItem[];
  preparation_methods?: PreparationMethodItem[];
  usage_guidelines?: UsageGuidelineItem[];
  safety_warnings?: SafetyWarningItem[];
  plant_parts?: PlantPartItem[];
  storage_guidelines?: StorageGuidelineItem[];
  myth_facts?: MythFactItem[];
  quality_standards?: QualityStandardItem[];
  clinical_guidelines?: ClinicalGuidelineItem[];
  drug_interactions?: DrugInteractionItem[];
  contraindications?: ContraindicationItem[];
  pharmacokinetic_profiles?: PharmacokineticProfileItem[];
  research_topics?: ResearchTopicItem[];
  claims?: ClaimEvidenceItem[];
  related_symptoms?: SymptomItem[];
};

export type Persona = 'umum' | 'pelajar' | 'peneliti' | 'tenaga_medis';

export interface HerbalCandidate {
  plant_id?: string;
  herb_id: string;
  canonical_key: string;
  source_herb_ids?: string[];
  local_name: string;
  scientific_name: string | null;
  aliases?: string[];
  matched_symptoms?: string[];
  unmatched_symptoms?: string[];
  matched_uses?: string[];
  symptom_coverage: number;
  relevance_score?: number;
  confidence?: number;
  relevance_level?: 'high' | 'medium' | 'low' | 'unknown';
  relevance_label?: string;
  relevance_status: 'exact_match' | 'partial_match' | 'low_relevance' | 'unknown';
  recommendation_reason: string;
  reason?: string;
  match_reasons?: string[];
  related_symptoms?: Array<string | SymptomItem>;
  plant_parts?: Array<string | PlantPartItem>;
  active_compounds: string[];
  traditional_uses?: Array<string | TraditionalUseItem>;
  supported_activities?: string[];
  evidence_level: string;
  evidence_status?: 'available' | 'limited' | 'unavailable' | 'unknown';
  evidence_label?: string;
  evidence_sources?: Array<Record<string, unknown>>;
  enrichment?: HerbEnrichmentDetail;
  preparation_methods?: Array<PreparationMethod | PreparationMethodItem>;
  usage_guidelines?: UsageGuidelineItem[];
  usage_rules?: UsageRule[];
  safety_warnings?: SafetyWarningItem[];
  storage_guidelines?: StorageGuidelineItem[];
  myth_facts?: MythFactItem[];
  quality_standards?: QualityStandardItem[];
  clinical_guidelines?: ClinicalGuidelineItem[];
  pharmacokinetic_profiles?: PharmacokineticProfileItem[];
  research_topics?: ResearchTopicItem[];
  claims?: ClaimEvidenceItem[];
  contraindications: Array<string | ContraindicationItem>;
  interactions?: string[];
  drug_interactions?: Array<string | DrugInteractionItem>;
  side_effects: string[];
  risk_groups?: string[];
  warnings: Array<SafetyItem | string>;
  limitations?: string[];
  safety_notes?: string[];
  stop_use_signs?: string[];
  medical_attention_signs?: string[];
  availability?: 'easy_to_find' | 'moderately_available' | 'hard_to_find' | 'seasonal' | 'restricted' | 'unknown';
  availability_label?: string;
  availability_reason?: string | null;
  recommendation_score: number;
  safety_status: 'safe' | 'caution' | 'unsafe' | 'unknown' | 'eligible' | 'conditional' | 'excluded';
  safety_label?: string;
  safety_reasons?: string[];
  explanation?: string | null;
  usage_status?: 'available' | 'insufficient_data';
  graph_verified?: boolean;
  provenance_valid?: boolean;
  has_conflicting_claims?: boolean;
  provenance?: GraphProvenance | null;
  availability_info?: AvailabilityInfo | null;
  evidence?: EvidenceInfo | null;

  // Structured safety
  contraindication_status?: VerifiedSafetyField;
  interaction_status?: VerifiedSafetyField;
  side_effect_status?: VerifiedSafetyField;
  risk_group_status?: VerifiedSafetyField;
  safety?: SafetySection | null;
  sources: EvidenceSource[];

  // Dual verification fields
  field_verifications?: FieldVerification[];
  graph_coverage_score: number;
  trusted_source_coverage_score: number;
  model_assisted_coverage_score: number;
  safety_coverage_score: number;
  scores: CandidateScores;
  overall_verification_status:
    | 'fully_verified'
    | 'source_verified'
    | 'fully_graph_verified'
    | 'graph_and_model_verified'
    | 'model_assisted_limited'
    | 'insufficient_data';
  safety_data_status: 'complete' | 'incomplete' | 'missing';
  general_safety_warnings: string[];
}

export interface HerbalRecommendationResponse {
  recommendation_id?: string;
  request_id?: string | null;
  status: 'completed' | 'completed_with_partial_enrichment' | 'clarification_required' | 'medical_attention_recommended' | 'no_safe_candidate' | 'no_fully_verified_candidate' | 'graph_unavailable' | 'failed';
  complaint: string;
  normalized_complaint: string;
  symptoms?: string[];
  extracted_symptoms: string[];
  clarification_questions: string[];
  red_flags: string[];
  when_to_seek_medical_help?: string[];
  total_candidates_found: number;
  total_candidates_eligible: number;
  total_candidates_excluded: number;
  recommendations: HerbalCandidate[];
  options?: HerbalCandidate[];
  excluded_candidates: Array<Record<string, unknown>>;
  general_disclaimer: string;
  safety_note?: string;
  warnings?: string[];
  limitations?: string[];
  medical_attention_message: string | null;
  metadata: Record<string, unknown>;
}

export class HerbalRecommendationApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'HerbalRecommendationApiError';
    this.code = code;
    this.status = status;
  }
}

const HERBAL_ANALYZE_PATH = '/api/herbal-recommendations/analyze';

type ErrorResponse = {
  data?: Record<string, unknown>;
  error?: { message?: string; details?: unknown };
  detail?: unknown;
};

function getErrorResponse(error: unknown): ErrorResponse | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('response' in error) return (error as { response?: ErrorResponse }).response;
  return error as ErrorResponse;
}

export function getApiErrorMessage(error: unknown): string {
  const response = getErrorResponse(error);
  const body = (response?.data ?? response) as {
    error?: { message?: string; details?: unknown };
    detail?: unknown;
  } | undefined;

  if (body?.error?.message) {
    const details = body.error.details;

    if (Array.isArray(details) && details.length > 0) {
      const first = details[0] as { loc?: unknown; msg?: string; message?: string };
      const loc = Array.isArray(first.loc) ? first.loc.join('.') : '';
      const msg = first.msg ?? first.message;

      if (loc || msg) {
        return `${body.error.message}${loc ? ` (${loc})` : ''}${msg ? `: ${msg}` : ''}`;
      }
    }

    return body.error.message;
  }

  if (Array.isArray(body?.detail) && body.detail.length > 0) {
    const first = body.detail[0] as { loc?: unknown; msg?: string; message?: string };
    const loc = Array.isArray(first.loc) ? first.loc.join('.') : '';
    const msg = first.msg ?? first.message ?? 'Validasi gagal.';

    return `${loc ? `${loc}: ` : ''}${msg}`;
  }

  return 'Terjadi kesalahan saat memproses rekomendasi herbal.';
}

export function formatPercent(value?: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Belum tersedia';
  }

  return `${Math.round(value * 100)}%`;
}

export function getSafetyLabel(status?: HerbalCandidate['safety_status'], label?: string): string {
  if (label) return label;
  const safetyLabelMap: Record<string, string> = {
    safe: 'Relatif aman',
    eligible: 'Relatif aman',
    caution: 'Perlu perhatian',
    conditional: 'Perlu perhatian',
    unsafe: 'Tidak aman',
    excluded: 'Tidak aman',
    unknown: 'Data keamanan belum cukup',
  };
  return safetyLabelMap[status ?? 'unknown'] ?? safetyLabelMap.unknown;
}

export function getVerificationLabel(status?: string) {
  switch (status) {
    case 'verified':
      return 'Terverifikasi';
    case 'limited':
      return 'Data terbatas';
    case 'traditional':
      return 'Penggunaan tradisional';
    case 'unavailable':
      return 'Belum tersedia';
    default:
      return 'Status belum diketahui';
  }
}

export function getEvidenceLabel(level?: string) {
  switch (level) {
    case 'clinical':
      return 'Bukti klinis';
    case 'pharmacopoeia':
      return 'Farmakope/Materia Medika';
    case 'review':
      return 'Kajian literatur';
    case 'preclinical':
      return 'Praklinik';
    case 'traditional':
      return 'Tradisional';
    case 'computational':
      return 'Komputasional';
    default:
      return 'Belum diketahui';
  }
}

export function dedupeSources(sources: SourceReference[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = source.source_id ?? source.identifier ?? source.title ?? JSON.stringify(source);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function canShowClinicalDose(persona?: string) {
  return persona === 'tenaga_medis' || persona === 'peneliti';
}

export function normalizeHerbalRecommendationPayload(
  payload: HerbalRecommendationRequest,
): HerbalRecommendationRequest {
  return {
    ...payload,
    age_group: payload.age_group && payload.age_group.trim() !== '' ? payload.age_group : null,
    pregnancy_status: payload.pregnancy_status && payload.pregnancy_status.trim() !== ''
      ? payload.pregnancy_status
      : null,
  };
}

export async function analyzeHerbalComplaint(
  payload: HerbalRecommendationRequest,
): Promise<HerbalRecommendationResponse> {
  const requestId = crypto.randomUUID();

  if (process.env.NODE_ENV === 'development') {
    console.debug('[HerbalRecommendation] request path:', HERBAL_ANALYZE_PATH);
  }

  try {
    const response = await apiClient.post<HerbalRecommendationResponse>(
      HERBAL_ANALYZE_PATH,
      normalizeHerbalRecommendationPayload(payload),
      {
        headers: {
          'X-Request-ID': requestId,
        },
        timeout: 120000,
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            detail?: { code?: string; message?: string; error?: { code?: string; message?: string } };
            error?: { code?: string; message?: string };
          };
        };
      };
      const status = axiosError.response?.status ?? 500;
      const body = axiosError.response?.data;
      const apiError = body?.detail?.error ?? body?.error;
      const routeMissingMessage = process.env.NODE_ENV === 'development'
        ? 'Endpoint rekomendasi herbal belum tersedia pada backend.'
        : 'Layanan rekomendasi herbal belum tersedia.';
      throw new HerbalRecommendationApiError(
        apiError?.code ?? body?.detail?.code ?? 'HERBAL_RECOMMENDATION_FAILED',
        status === 404 ? routeMissingMessage : getApiErrorMessage(error),
        status,
      );
    }

    throw new HerbalRecommendationApiError(
      'HERBAL_RECOMMENDATION_FAILED',
      'Rekomendasi gagal diproses.',
      500,
    );
  }
}

export async function getHerbRecommendationDetail(
  herbId: string,
): Promise<HerbEnrichmentDetail> {
  try {
    const response = await apiClient.get<{ detail?: HerbEnrichmentDetail } | HerbEnrichmentDetail>(
      `/api/herbal-recommendations/herbs/${encodeURIComponent(herbId)}/detail`,
      { timeout: 30000 },
    );

    const data = response.data;

    // Backend may wrap in { detail: {...} } or return flat
    if (data && typeof data === 'object' && 'detail' in data && data.detail) {
      return data.detail;
    }

    return data as HerbEnrichmentDetail;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      const status = axiosError.response?.status ?? 500;

      throw new HerbalRecommendationApiError(
        'HERB_DETAIL_FAILED',
        status === 404
          ? 'Detail herbal belum tersedia pada knowledge graph.'
          : getApiErrorMessage(error),
        status,
      );
    }

    throw new HerbalRecommendationApiError(
      'HERB_DETAIL_FAILED',
      'Gagal memuat detail herbal.',
      500,
    );
  }
}
