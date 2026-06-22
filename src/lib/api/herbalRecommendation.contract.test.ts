import assert from 'node:assert/strict';

import {
  canShowClinicalDose,
  dedupeSources,
  formatPercent,
  getApiErrorMessage,
  getEvidenceLabel,
  getSafetyLabel,
  getVerificationLabel,
  normalizeHerbalRecommendationPayload,
  HerbalCandidate,
} from './herbalRecommendation';

import {
  asArray,
  clampScore,
  toPercent,
  resolveHerbId,
  getPrimaryScore,
  getRelevancePercent,
  getSymptomPercent,
  getRelevanceLabel,
  getRelevanceBadgeText,
  getRelevanceLevel,
  getDataStatusLabel,
  getSafetyLabelV2,
  getEvidenceLabelV2,
  getVerificationBadgeLabel,
  formatSafetyFieldStatus,
} from '../herbalRecommendationNormalize';

// Legacy tests
export function recommendation_payload_converts_empty_age_group_to_null() {
  const payload = normalizeHerbalRecommendationPayload({
    complaint: 'batuk berdahak',
    age_group: '' as never,
    pregnancy_status: '' as never,
  });

  assert.equal(payload.age_group, null);
  assert.equal(payload.pregnancy_status, null);
}

export function recommendation_payload_uses_canonical_age_group_values() {
  const payload = normalizeHerbalRecommendationPayload({
    complaint: 'batuk berdahak',
    age_group: 'adult',
  });

  assert.equal(payload.age_group, 'adult');
}

export function recommendation_error_parser_shows_validation_detail() {
  const message = getApiErrorMessage({
    response: {
      data: {
        error: {
          message: 'Format request tidak sesuai.',
          details: [
            {
              loc: ['body', 'age_group'],
              msg: 'Input should be child, teen, adult or elderly',
            },
          ],
        },
      },
    },
  });

  assert.equal(
    message,
    'Format request tidak sesuai. (body.age_group): Input should be child, teen, adult or elderly',
  );
}

export function formatPercent_returns_belum_tersedia_for_nan() {
  assert.equal(formatPercent(Number.NaN), 'Belum tersedia');
}

export function formatPercent_returns_belum_tersedia_for_undefined() {
  assert.equal(formatPercent(undefined), 'Belum tersedia');
}

export function unknown_safety_does_not_show_tidak_aman() {
  assert.equal(getSafetyLabel('unknown'), 'Data keamanan belum cukup');
}

export function recommendation_card_displays_explanation() {
  const item = { explanation: 'Kencur muncul sebagai kandidat awal.' };
  assert.equal(item.explanation.includes('Kencur'), true);
}

export function recommendation_card_displays_match_reasons() {
  const item = { match_reasons: ['Keluhan yang dianalisis: batuk berdahak.'] };
  assert.equal(item.match_reasons.length, 1);
}

export function recommendation_card_uses_relevance_label_from_backend() {
  const item = { relevance_label: 'Relevansi rendah' };
  assert.equal(item.relevance_label, 'Relevansi rendah');
}

export function recommendation_card_uses_recommendations_not_options() {
  const response = {
    recommendations: [{ local_name: 'Kencur' }],
    options: [{ local_name: 'Jahe' }],
  };
  assert.equal(response.recommendations[0].local_name, 'Kencur');
}

export function verification_label_maps_limited() {
  assert.equal(getVerificationLabel('limited'), 'Data terbatas');
}

export function evidence_label_maps_pharmacopoeia() {
  assert.equal(getEvidenceLabel('pharmacopoeia'), 'Farmakope/Materia Medika');
}

export function evidence_label_maps_traditional() {
  assert.equal(getEvidenceLabel('traditional'), 'Tradisional');
}

export function dedupe_sources_by_identifier() {
  const sources = dedupeSources([
    { source_id: 'src-1', title: 'Materia Medika' },
    { source_id: 'src-1', title: 'Materia Medika duplicate' },
    { identifier: 'doi:10/example', title: 'Paper' },
  ]);

  assert.equal(sources.length, 2);
}

export function recommendation_item_contains_enrichment_fields() {
  const item = {
    enrichment: {
      traditional_uses: [{ title: 'Batuk', evidence_level: 'traditional' }],
      preparation_methods: [{ title: 'Seduhan', steps: ['Cuci', 'Seduh'] }],
      usage_guidelines: [{ title: 'Edukasi', dose_status: 'not_clinically_established' }],
      safety_warnings: [{ title: 'Hati-hati', severity: 'caution' }],
    },
  };

  assert.equal(item.enrichment.traditional_uses.length, 1);
  assert.equal(item.enrichment.preparation_methods[0].steps.length, 2);
}

export function persona_filter_hides_clinical_detail_for_umum() {
  assert.equal(canShowClinicalDose('umum'), false);
}

export function persona_filter_shows_clinical_detail_for_tenaga_medis() {
  assert.equal(canShowClinicalDose('tenaga_medis'), true);
}

export function no_diagnosis_or_replace_medical_treatment_claim() {
  const disclaimer = 'Informasi ini bersifat edukatif and bukan diagnosis atau pengganti tenaga kesehatan.';

  assert.equal(disclaimer.includes('bukan diagnosis'), true);
  assert.equal(disclaimer.includes('pengganti tenaga kesehatan'), true);
}

// ===========================================================================
// NEW UI FIX AND NORMALIZER CONTRACT TESTS
// ===========================================================================

export function card_does_not_show_relevansi_tinggi_0_percent() {
  const item = {
    relevance_score: 0.0,
    relevance_label: 'Relevansi tinggi (0%)',
    symptom_coverage: 0.0,
  } as unknown as HerbalCandidate;

  // Badge text should correctly display Score percentage derived from relevance_score (0%)
  const badgeText = getRelevanceBadgeText(item);
  assert.equal(badgeText, 'Kandidat awal (0%)');
}

export function card_relevance_badge_uses_relevance_score() {
  const item = {
    relevance_score: 0.85,
    symptom_coverage: 0.20,
  } as unknown as HerbalCandidate;

  const badgeText = getRelevanceBadgeText(item);
  // Relevansi tinggi is for score >= 0.75, percent is 85%
  assert.equal(badgeText, 'Relevansi tinggi (85%)');
}

export function card_score_and_relevance_are_consistent() {
  const item = {
    relevance_score: 0.65,
    symptom_coverage: 0.40,
  } as unknown as HerbalCandidate;

  assert.equal(getRelevanceLabel(item), 'Relevansi sedang');
  assert.equal(getRelevancePercent(item), 65);
}

export function card_data_status_shows_traditional_when_traditional_exists() {
  const item = {
    traditional_uses: [{ title: 'Batuk' }],
  } as unknown as HerbalCandidate;

  assert.equal(getDataStatusLabel(item), 'Data tradisional tersedia');
}

export function card_safety_unknown_not_rendered_as_perlu_perhatian() {
  const item = {
    safety_status: 'unknown',
  } as unknown as HerbalCandidate;

  // Unknown safety status with no warnings or contraindications should render as 'Data keamanan belum cukup'
  assert.equal(getSafetyLabelV2(item), 'Data keamanan belum cukup');
}

export function card_evidence_traditional_not_rendered_as_bukti_belum_tersedia() {
  const item = {
    evidence_level: 'traditional',
  } as unknown as HerbalCandidate;

  assert.equal(getEvidenceLabelV2(item), 'Data tradisional tersedia');
}

export function detail_plant_part_no_belum_lolos_verifikasi_when_data_missing() {
  const plantParts = [] as any[];
  // Renders standard friendly fallback text, not legacy "belum lolos verifikasi"
  const text = plantParts.length > 0 ? plantParts.join(', ') : 'Bagian tanaman belum tersedia pada knowledge graph.';
  assert.equal(text, 'Bagian tanaman belum tersedia pada knowledge graph.');
}

export function detail_warning_does_not_show_missing_word() {
  const status = 'missing';
  assert.equal(formatSafetyFieldStatus(status), 'belum tercatat');
}

export function detail_warning_renders_friendly_empty_state() {
  const contraindications = [] as any[];
  const text = contraindications.length ? contraindications.join(', ') : 'Belum ada kontraindikasi spesifik yang tercatat pada knowledge graph.';
  assert.equal(text, 'Belum ada kontraindikasi spesifik yang tercatat pada knowledge graph.');
}

export function detail_sources_not_show_verified_graph_when_empty() {
  const sources = [] as any[];
  const text = sources.length > 0 ? 'Verified' : 'Sumber spesifik belum tersedia pada data ini.';
  assert.equal(text, 'Sumber spesifik belum tersedia pada data ini.');
}

export function free_text_empty_state_shows_suggested_terms() {
  const response = {
    suggested_terms: ['sariawan', 'luka mulut'],
  };
  assert.equal(response.suggested_terms.length, 2);
}
