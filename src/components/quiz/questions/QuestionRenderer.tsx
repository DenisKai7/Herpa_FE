import type { QuizSessionQuestion } from '@/hooks/useQuizStore';
import { CaseStudyQuestionRenderer } from './CaseStudyQuestionRenderer';
import { MatchingQuestionRenderer } from './MatchingQuestionRenderer';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { ShortAnswerQuestionRenderer } from './ShortAnswerQuestionRenderer';
import { TrueFalseQuestion } from './TrueFalseQuestion';

interface Props {
  question: QuizSessionQuestion;
  selectedAnswer: string | null;
  matchingAnswer?: Record<string, string>;
  isChecked: boolean;
  onSelect: (answer: string) => void;
  onMatchingChange?: (key: string, value: string) => void;
  isSubmitting?: boolean;
}

export function QuestionRenderer(props: Props) {
  switch (props.question.question_type) {
    case 'matching':
      return <MatchingQuestionRenderer question={props.question} matchingAnswer={props.matchingAnswer ?? {}} onMatchingChange={props.onMatchingChange ?? (() => undefined)} disabled={props.isChecked} />;
    case 'true_false':
      return <TrueFalseQuestion {...props} />;
    case 'short_answer':
      return <ShortAnswerQuestionRenderer question={props.question} answerText={props.selectedAnswer ?? ''} onAnswerTextChange={props.onSelect} disabled={props.isChecked} isSubmitting={props.isSubmitting} />;
    case 'case_based':
    case 'case_study':
      return <CaseStudyQuestionRenderer question={props.question} answerText={props.selectedAnswer ?? ''} onAnswerTextChange={props.onSelect} disabled={props.isChecked} isSubmitting={props.isSubmitting} />;
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
}
