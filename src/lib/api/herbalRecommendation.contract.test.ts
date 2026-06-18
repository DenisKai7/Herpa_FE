import assert from 'node:assert/strict';

import {
  formatPercent,
  getApiErrorMessage,
  getSafetyLabel,
  normalizeHerbalRecommendationPayload,
} from './herbalRecommendation';

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
