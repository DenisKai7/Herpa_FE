import type { QuizSessionQuestion } from '@/hooks/useQuizStore';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function CaseBasedQuestion({ question, selectedAnswer, isChecked, onSelect }: Props) {
  return (
    <div className="space-y-4">
      {question.case_context && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          <strong>Studi Kasus:</strong>
          <p className="mt-1">{question.case_context}</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Analisis Kasus:</label>
        <textarea
          value={selectedAnswer ?? ''}
          disabled={isChecked}
          onChange={(event) => onSelect(event.target.value)}
          placeholder="Ketik jawaban analisis Anda di sini..."
          rows={5}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900"
        />
      </div>
    </div>
  );
}
