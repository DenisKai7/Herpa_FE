import apiClient from './client';

export type RecommendationStatus =
  | 'idle'
  | 'validating'
  | 'analyzing_symptoms'
  | 'searching_graph'
  | 'checking_safety'
  | 'ranking'
  | 'completed'
  | 'clarification_required'
  | 'medical_attention_recommended'
  | 'no_safe_candidate'
  | 'no_fully_verified_candidate'
  | 'failed';

export type VerificationSource =
  | 'graph_verified'
  | 'graph_model_verified'
  | 'model_assisted'
  | 'unavailable';

export interface FieldVerification {
  field_name: string;
  value: any;
  verification_source: VerificationSource;
  graph_node_ids: string[];
  graph_relationship_ids: string[];
  source_ids: string[];
  model_confidence: number | null;
  model_critic_passed: boolean;
  safety_critical: boolean;
  warnings: string[];
}

export interface HerbalRecommendationRequest {
  complaint: string;
  age_group?: 'unknown' | 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly';
  pregnancy_status?: 'unknown' | 'not_pregnant' | 'pregnant' | 'breastfeeding';
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
}

export interface PreparationMethod {
  method_id: string;
  title: string;
  plant_part: string | null;
  ingredients: string[];
  steps: string[];
  preparation_type: string;
  source: string | null;
  evidence_level: string;
  compatible_symptoms: string[];
  contraindicated_groups: string[];
}

export interface UsageRule {
  form: string | null;
  amount_text: string | null;
  frequency_text: string | null;
  duration_text: string | null;
  maximum_duration_text: string | null;
  administration_notes: string[];
  applicable_age_groups: string[];
  prohibited_age_groups: string[];
  source: string | null;
  evidence_level: string;
}

export interface GraphProvenance {
  graph_verified: boolean;
  coverage_score: number;
  source_ids: string[];
  evidence_claim_ids: string[];
  graph_node_ids: string[];
  graph_relationship_ids: string[];
  verified_at: string | null;
  data_version: string;
}

export interface HerbalCandidate {
  herb_id: string;
  canonical_key: string;
  source_herb_ids: string[];
  local_name: string;
  scientific_name: string | null;
  aliases: string[];
  matched_symptoms: string[];
  unmatched_symptoms: string[];
  traditional_uses: string[];
  supported_activities: string[];
  evidence_level: string;
  preparation_methods: PreparationMethod[];
  usage_rules: UsageRule[];
  contraindications: string[];
  interactions: string[];
  side_effects: string[];
  risk_groups: string[];
  warnings: string[];
  availability: 'easy_to_find' | 'moderately_available' | 'hard_to_find' | 'seasonal' | 'restricted' | 'unknown';
  availability_label: string;
  availability_reason: string | null;
  recommendation_score: number;
  safety_status: 'eligible' | 'conditional' | 'excluded';
  safety_reasons: string[];
  explanation?: string | null;
  usage_status?: 'available' | 'insufficient_data';
  graph_verified?: boolean;
  provenance_valid?: boolean;
  provenance?: GraphProvenance | null;

  // Dual verification fields
  field_verifications: FieldVerification[];
  graph_coverage_score: number;
  model_assisted_coverage_score: number;
  overall_verification_status:
    | 'fully_graph_verified'
    | 'graph_and_model_verified'
    | 'model_assisted_limited'
    | 'insufficient_data';
  safety_data_status: 'complete' | 'incomplete' | 'missing';
  general_safety_warnings: string[];
}

export interface HerbalRecommendationResponse {
  recommendation_id: string;
  status: 'completed' | 'clarification_required' | 'medical_attention_recommended' | 'no_safe_candidate' | 'no_fully_verified_candidate' | 'failed';
  complaint: string;
  normalized_complaint: string;
  extracted_symptoms: string[];
  clarification_questions: string[];
  red_flags: string[];
  total_candidates_found: number;
  total_candidates_eligible: number;
  total_candidates_excluded: number;
  recommendations: HerbalCandidate[];
  excluded_candidates: Array<Record<string, unknown>>;
  general_disclaimer: string;
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
      payload,
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
            detail?: {
              code?: string;
              message?: string;
              error?: {
                code?: string;
                message?: string;
              };
            };
            error?: {
              code?: string;
              message?: string;
            };
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
        status === 404
          ? routeMissingMessage
          : apiError?.message ?? body?.detail?.message ?? `Request gagal dengan HTTP ${status}`,
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
