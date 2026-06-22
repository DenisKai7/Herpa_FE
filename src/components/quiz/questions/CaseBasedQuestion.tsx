import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function CaseBasedQuestion(props: Props) {
  return (
    <div className="space-y-4">
      {props.question.case_context && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          {props.question.case_context}
        </div>
      )}
      <MultipleChoiceQuestion {...props} />
    </div>
  );
}
