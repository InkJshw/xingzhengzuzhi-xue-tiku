import type { Question, QuizMode, UserAnswer, QuizResult, WrongAnswer, SingleChoiceQuestion, MultipleChoiceQuestion, TrueFalseQuestion } from '../types';
import allQuestionsData from '../data/questions.json';

const allQuestions = allQuestionsData as unknown as {
  singleChoice: SingleChoiceQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  trueFalse: TrueFalseQuestion[];
};

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getQuestionsByMode(mode: QuizMode): Question[] {
  switch (mode) {
    case 'single':
      return [...allQuestions.singleChoice];
    case 'multiple':
      return [...allQuestions.multipleChoice];
    case 'trueFalse':
      return [...allQuestions.trueFalse];
    case 'mixed':
      return [
        ...allQuestions.singleChoice,
        ...allQuestions.multipleChoice,
        ...allQuestions.trueFalse,
      ];
    default:
      return [];
  }
}

export function getModeLabel(mode: QuizMode): string {
  switch (mode) {
    case 'single': return '单选题';
    case 'multiple': return '多选题';
    case 'trueFalse': return '判断题';
    case 'mixed': return '综合练习';
  }
}

export function getModeIcon(mode: QuizMode): string {
  switch (mode) {
    case 'single': return 'circle-dot';
    case 'multiple': return 'check-check';
    case 'trueFalse': return 'toggle-right';
    case 'mixed': return 'shuffle';
  }
}

export function checkAnswer(question: Question, selected: number[]): boolean {
  switch (question.type) {
    case 'single': {
      if (selected.length !== 1) return false;
      return selected[0] === question.answer;
    }
    case 'multiple': {
      if (selected.length === 0) return false;
      const correct = question.answer.sort().join(',');
      const user = [...selected].sort().join(',');
      return correct === user;
    }
    case 'trueFalse': {
      if (selected.length !== 1) return false;
      return (selected[0] === 1) === question.answer;
    }
  }
}

export function getCorrectAnswerDisplay(question: Question): string {
  switch (question.type) {
    case 'single':
      return `选项${String.fromCharCode(65 + question.answer)}：${question.options[question.answer]}`;
    case 'multiple': {
      const labels = question.answer.map(i => String.fromCharCode(65 + i)).join('、');
      return `${labels}：${question.answer.map(i => question.options[i]).join('；')}`;
    }
    case 'trueFalse':
      return question.answer ? '正确（√）' : '错误（×）';
  }
}

export function getUserAnswerDisplay(question: Question, selected: number[]): string {
  switch (question.type) {
    case 'single':
      if (selected.length === 0) return '未作答';
      return `选项${String.fromCharCode(65 + selected[0])}：${question.options[selected[0]]}`;
    case 'multiple': {
      if (selected.length === 0) return '未作答';
      const labels = selected.map(i => String.fromCharCode(65 + i)).join('、');
      return `${labels}：${selected.map(i => question.options[i]).join('；')}`;
    }
    case 'trueFalse':
      if (selected.length === 0) return '未作答';
      return selected[0] === 1 ? '正确（√）' : '错误（×）';
  }
}

export function calculateResult(
  questions: Question[],
  userAnswers: Map<number, UserAnswer>,
  mode: QuizMode
): QuizResult {
  let correct = 0;
  let wrong = 0;
  const wrongAnswers: WrongAnswer[] = [];

  questions.forEach((q, index) => {
    const ua = userAnswers.get(index);
    const isCorrect = ua?.isCorrect ?? false;
    if (isCorrect) {
      correct++;
    } else {
      wrong++;
      wrongAnswers.push({
        question: q,
        userAnswer: ua?.selectedOptions ?? [],
      });
    }
  });

  return {
    total: questions.length,
    correct,
    wrong,
    score: Math.round((correct / questions.length) * 100),
    wrongAnswers,
    mode,
  };
}
