import assert from 'node:assert/strict';

import { getApiErrorMessage, normalizeHerbalRecommendationPayload } from './herbalRecommendation';

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
