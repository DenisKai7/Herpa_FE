import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function TrueFalseQuestion(props: Props) {
  return <MultipleChoiceQuestion {...props} />;
}
