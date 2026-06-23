import { useQuizStore } from '@/hooks/useQuizStore';
import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { cn } from '@/lib/utils';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function MatchingQuestion({ question, isChecked }: Props) {
  const { matchingAnswer, setMatchingAnswer } = useQuizStore();

  const pairs = question.matching_pairs?.length
    ? question.matching_pairs
    : question.options.map((option) => ({ left: option.label, right: option.text }));

  // Extract right options for selects
  const rightOptions = question.options.length > 0
    ? question.options.map(opt => ({ label: String(opt.label), text: opt.text }))
    : Array.from(new Set(pairs.map(p => String(p.right)))).map(val => ({ label: val, text: val }));

  // Correct answers mapping from checkAnswer response (stored as correct_answer in question)
  let parsedCorrectAnswer: Record<string, string> = {};
  if (isChecked && question.correct_answer) {
    try {
      parsedCorrectAnswer = typeof question.correct_answer === 'string' ? JSON.parse(question.correct_answer) : {};
    } catch {
      if (question.correct_answer && typeof question.correct_answer === 'object' && !Array.isArray(question.correct_answer)) {
        parsedCorrectAnswer = question.correct_answer as Record<string, string>;
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
        Cocokkan semua konsep di kiri dengan jawaban paling tepat di kanan.
      </div>
      <div className="space-y-3">
        {pairs.map((pair, index) => {
          const leftKey = String(pair.left);
          const selectedVal = matchingAnswer[leftKey] ?? '';
          const correctVal = parsedCorrectAnswer[leftKey] ?? '';
          const isPairCorrect = isChecked ? (selectedVal === correctVal || !correctVal) : null;

          return (
            <div
              key={`${leftKey}-${index}`}
              className={cn(
                "grid grid-cols-1 items-center gap-3 rounded-2xl border p-4 dark:bg-gray-900 md:grid-cols-[1fr_auto_1fr]",
                isChecked
                  ? isPairCorrect
                    ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40"
                    : "border-rose-200 bg-rose-50/30 dark:border-rose-900/40"
                  : "border-gray-200 bg-white dark:border-gray-800"
              )}
            >
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {leftKey}
              </div>
              <div className="hidden text-xs font-bold text-gray-400 md:block">→</div>
              <div className="flex flex-col gap-1">
                <select
                  disabled={isChecked}
                  value={selectedVal}
                  onChange={(event) => setMatchingAnswer(leftKey, event.target.value)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm outline-none transition w-full',
                    isChecked
                      ? 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-950'
                      : 'border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-500 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
                  )}
                >
                  <option value="">Pilih jawaban</option>
                  {rightOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.text}
                    </option>
                  ))}
                </select>
                {isChecked && !isPairCorrect && correctVal && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Koreksi: {correctVal}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
