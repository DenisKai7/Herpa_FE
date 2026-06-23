import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { formatShortAnswerValue } from './ShortAnswerQuestionRenderer';

export function resolveCaseStudyCorrectText(question: QuizSessionQuestion, submitResult?: {
  formatted_correct_answer?: unknown;
  required_keywords?: unknown;
  keywords?: unknown;
  accepted_answers?: unknown;
  correct_answer?: unknown;
}) {
  const formatted = formatShortAnswerValue(submitResult?.formatted_correct_answer) || formatShortAnswerValue(question.formatted_correct_answer);
  if (formatted) return formatted;

  const keywords = formatShortAnswerValue(submitResult?.required_keywords) || formatShortAnswerValue(submitResult?.keywords) || formatShortAnswerValue(submitResult?.accepted_answers);
  if (keywords) return keywords;

  return (
    formatShortAnswerValue(submitResult?.correct_answer) ||
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

export function CaseStudyQuestionRenderer({ question, answerText, onAnswerTextChange, disabled, isSubmitting }: Props) {
  const charCount = answerText.length;
  const minLength = 10;

  return (
    <div className="space-y-4">
      {question.case_context && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          <p className="font-bold">Studi Kasus:</p>
          <p className="mt-1">{question.case_context}</p>
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Jawaban Analisis</label>
        <textarea
          value={answerText}
          disabled={disabled || isSubmitting}
          onChange={(event) => onAnswerTextChange(event.target.value)}
          placeholder="Tuliskan jawaban analisismu di sini..."
          rows={6}
          className="min-h-40 w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-blue-500"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>{disabled ? '' : 'Jawab dengan menjelaskan konsep kunci dan alasan pentingnya secara singkat. Tulis jawaban berupa 1–3 kalimat.'}</span>
          <span className={charCount >= minLength ? 'text-emerald-500' : 'text-gray-400'}>{charCount} karakter</span>
        </div>
        {!disabled && charCount > 0 && charCount < minLength && (
          <p className="mt-1 text-xs font-semibold text-amber-500">Minimal {minLength} karakter.</p>
        )}
      </div>
    </div>
  );
}
