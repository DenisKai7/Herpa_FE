import type { QuizLevel, QuizQuestionType } from '@/types/quiz';
import { cn } from '@/lib/utils';

export function getLevelTypeLabel(type: QuizQuestionType) {
  switch (type) {
    case 'multiple_choice':
      return 'Pilihan Ganda';
    case 'matching':
      return 'Mencocokkan';
    case 'true_false':
      return 'Benar/Salah';
    case 'short_answer':
      return 'Jawaban Singkat';
    case 'case_based':
      return 'Studi Kasus';
    default:
      return 'Quiz';
  }
}

interface QuizLevelChipsProps {
  levels: QuizLevel[];
  onSelectLevel: (level: QuizLevel) => void;
}

export function QuizLevelChips({ levels, onSelectLevel }: QuizLevelChipsProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelectLevel(level);
          }}
          className={cn(
            'flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all',
            level.is_locked || level.is_unlocked === false
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/50'
              : 'cursor-pointer border-blue-100 bg-blue-50/60 text-blue-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300'
          )}
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-bold">Level {level.level_number}</span>
            <span>{getLevelTypeLabel(level.quiz_type ?? level.question_type ?? 'multiple_choice')}</span>
          </span>
          <span className="text-[10px] font-bold">
            {level.is_completed ? 'Selesai · Ulangi' : level.is_locked || level.is_unlocked === false ? `Terkunci — selesaikan Level ${Math.max(1, level.level_number - 1)} dulu` : 'Mulai Level'}
          </span>
        </button>
      ))}
    </div>
  );
}
