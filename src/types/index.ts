export interface SingleChoiceQuestion {
  id: string;
  type: 'single';
  question: string;
  options: string[];
  answer: number;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple';
  question: string;
  options: string[];
  answer: number[];
}

export interface TrueFalseQuestion {
  id: string;
  type: 'trueFalse';
  question: string;
  answer: boolean;
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion;

export type QuizMode = 'single' | 'multiple' | 'trueFalse' | 'mixed';

export interface QuizState {
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  userAnswers: Map<number, UserAnswer>;
  isSubmitted: boolean;
  isComplete: boolean;
}

export interface UserAnswer {
  selectedOptions: number[];
  isCorrect: boolean | null;
}

export interface WrongAnswer {
  question: Question;
  userAnswer: number[];
}

export interface QuizResult {
  total: number;
  correct: number;
  wrong: number;
  score: number;
  wrongAnswers: WrongAnswer[];
  mode: QuizMode;
}
