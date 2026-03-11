export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  topic: string;
  lesson?: string;
  context?: string;
  cognitiveLevel?: CognitiveLevel;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
}

export interface TrueFalseStatement {
  id: string;
  text: string;
  isTrue: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  statements: TrueFalseStatement[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  correctAnswer: string | number;
  unit?: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface QuizAttempt {
  id: string;
  date: string;
  mode: 'lesson' | 'topic' | 'exam';
  title: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
}

export interface UserProfile {
  name: string;
  className: string;
  school?: string;
  targetScore?: string;
}
