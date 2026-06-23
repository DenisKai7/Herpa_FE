import type { QuizSessionQuestion } from '@/hooks/useQuizStore';

export function formatShortAnswerValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatShortAnswerValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const accepted = obj.accepted_answers ?? obj.acceptedAnswers ?? obj.keywords;
    if (Array.isArray(accepted)) return accepted.map(formatShortAnswerValue).filter(Boolean).join(', ');
    for (const key of ['answer', 'value', 'correct', 'correct_answer', 'formatted_correct_answer']) {
      const text = formatShortAnswerValue(obj[key]);
      if (text) return text;
    }
    try {
      return JSON.stringify(obj);
    } catch {
      return '';
    }
  }
  return String(value);
}

export function resolveShortAnswerCorrectText(question: QuizSessionQuestion, submitResult?: {
  formatted_correct_answer?: unknown;
  accepted_answers?: unknown;
  correct_answer?: unknown;
}) {
  return (
    formatShortAnswerValue(submitResult?.formatted_correct_answer) ||
    formatShortAnswerValue(submitResult?.accepted_answers) ||
    formatShortAnswerValue(submitResult?.correct_answer) ||
    formatShortAnswerValue(question.formatted_correct_answer) ||
    formatShortAnswerValue(question.accepted_answers) ||
    formatShortAnswerValue(question.correct_answer) ||
    '-'
  );
}

interface Props {
  question: QuizSessionQuestion;
  answerText: string;
  onAnswerTextChange: (answer: string) => void;
  submitResult?: unknown;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function ShortAnswerQuestionRenderer({ answerText, onAnswerTextChange, disabled, isSubmitting }: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <input
        type="text"
        value={answerText}
        disabled={disabled || isSubmitting}
        onChange={(event) => onAnswerTextChange(event.target.value)}
        placeholder="Tulis jawaban singkatmu di sini..."
        className="min-h-14 w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-blue-500"
      />
      {!disabled && (
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p>Tulis istilah, konsep, rumus, atau jawaban singkat sesuai pertanyaan.</p>
          <p>Jawaban tidak peka huruf besar/kecil.</p>
        </div>
      )}
    </div>
  );
}
