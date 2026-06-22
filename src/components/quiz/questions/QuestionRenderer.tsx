import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { CaseBasedQuestion } from './CaseBasedQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  onSelect: (answer: string) => void;
}

export function QuestionRenderer(props: Props) {
  switch (props.question.question_type) {
    case 'matching':
      return <MatchingQuestion {...props} />;
    case 'true_false':
      return <TrueFalseQuestion {...props} />;
    case 'short_answer':
      return <ShortAnswerQuestion {...props} />;
    case 'case_based':
      return <CaseBasedQuestion {...props} />;
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
}
