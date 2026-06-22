import type { QuizSessionQuestion } from '@/hooks/useQuizStore';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function ShortAnswerQuestion({ question, selectedAnswer, isChecked, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <input
        value={selectedAnswer ?? ''}
        disabled={isChecked}
        onChange={(event) => onSelect(event.target.value)}
        placeholder="Tulis jawaban singkat..."
        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Kata kunci diterima: {question.accepted_answers?.join(', ') || question.correct_answer}
      </p>
    </div>
  );
}
