import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import type { SubmitAnswerResult } from '@/types/quiz';

export function normalizeText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeMatchingAnswer(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};

  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map((item) => [normalizeText(item.left), normalizeText(item.right)])
    );
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      normalizeText(key),
      normalizeText(val),
    ])
  );
}

export function checkAnswerLocally(question: QuizSessionQuestion, answer: unknown): SubmitAnswerResult {
  const type = question.question_type ?? 'multiple_choice';
  const correctAnswer = question.correct_answer;
  const acceptedAnswers = question.accepted_answers ?? [];
  let correct = false;

  if (type === 'case_based' || type === 'case_study') {
    const ca = correctAnswer as Record<string, unknown>;
    if (ca && typeof ca === 'object' && (Array.isArray(ca.required_keywords) || Array.isArray(ca.keywords))) {
      const kws = (ca.required_keywords || ca.keywords || []) as string[];
      const keywords = kws.map(normalizeText);
      const minKw = typeof ca.min_keywords === 'number' ? ca.min_keywords : 1;
      const userNorm = normalizeText(answer);
      const matched = keywords.filter(kw => kw && userNorm.includes(kw)).length;
      correct = matched >= minKw;
    } else {
      correct = normalizeText(answer) === normalizeText(correctAnswer);
    }
  } else if (type === 'multiple_choice' || type === 'matching') {
    correct = normalizeText(answer) === normalizeText(correctAnswer);
  }

  if (type === 'true_false') {
    correct = normalizeText(answer) === normalizeText(correctAnswer);
  }

  if (type === 'short_answer') {
    const accepted = [correctAnswer, ...acceptedAnswers].map(normalizeText);
    correct = accepted.includes(normalizeText(answer));
  }

  return {
    correct,
    correct_answer: correctAnswer,
    explanation: question.explanation ?? null,
    score_delta: correct ? 10 : 0,
    xp_delta: correct ? 10 : 0,
    session_completed: false,
    session_score: 0,
    backend_unavailable: true,
  };
}
