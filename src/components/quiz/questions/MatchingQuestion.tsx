import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { cn } from '@/lib/utils';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function MatchingQuestion({ question, selectedAnswer, isChecked, onSelect }: Props) {
  const pairs = question.matching_pairs?.length ? question.matching_pairs : question.options.map((option) => ({ left: option.label, right: option.text }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
        Cocokkan konsep di kiri dengan jawaban paling tepat di kanan. Pilihan pertama menentukan jawaban sesi ini.
      </div>
      <div className="space-y-3">
        {pairs.map((pair, index) => {
          const locked = isChecked || index > 0;
          return (
            <div key={`${pair.left}-${index}`} className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_auto_1fr]">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{pair.left}</div>
              <div className="hidden text-xs font-bold text-gray-400 md:block">→</div>
              <select
                disabled={locked}
                value={index === 0 ? selectedAnswer ?? '' : pair.left}
                onChange={(event) => onSelect(event.target.value)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm outline-none transition',
                  locked ? 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-950' : 'border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-500 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
                )}
              >
                <option value="">Pilih jawaban</option>
                {question.options.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
