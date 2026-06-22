import { cn } from '@/lib/utils';
import type { QuizSessionQuestion } from '@/hooks/useQuizStore';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function MultipleChoiceQuestion({ question, selectedAnswer, isChecked, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {question.options.map((option) => {
        const isSelected = selectedAnswer === option.label;
        const isOptCorrect = option.label === question.correct_answer;

        return (
          <button
            key={option.label}
            onClick={() => onSelect(option.label)}
            disabled={isChecked}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left font-medium transition-all duration-200 disabled:cursor-default',
              !isChecked && 'cursor-pointer hover:border-gray-400 hover:bg-gray-50/50 dark:hover:border-gray-600 dark:hover:bg-gray-900/30',
              isChecked
                ? isOptCorrect
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : isSelected
                  ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                  : 'border-gray-200 opacity-50 dark:border-gray-800'
                : isSelected
                ? 'scale-[1.01] border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-800'
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold">
              {option.label}
            </span>
            <span className="text-sm md:text-base">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
