import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Question, QuizMode, UserAnswer, QuizResult } from '../types';
import { shuffle, getQuestionsByMode, checkAnswer, calculateResult } from '../utils/quiz';

export function useQuiz(mode: QuizMode, initialQuestions?: Question[]) {
  const initRef = useRef(false);
  const [questions, setQuestions] = useState<Question[]>(() => {
    initRef.current = true;
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions;
    }
    return shuffle(getQuestionsByMode(mode));
  });

  // Handle redo from session storage
  useEffect(() => {
    if (initRef.current) {
      initRef.current = false;
      return;
    }
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setCurrentIndex(0);
      setUserAnswers(new Map());
      setIsComplete(false);
      setShowResult(false);
    }
  }, [initialQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map());
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;

  const answeredCount = useMemo(() => {
    let count = 0;
    userAnswers.forEach((ua) => {
      if (ua.selectedOptions.length > 0) count++;
    });
    return count;
  }, [userAnswers]);

  const submitAnswer = useCallback((selectedOptions: number[]) => {
    if (!currentQuestion || isComplete) return;

    const isCorrect = checkAnswer(currentQuestion, selectedOptions);
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentIndex, { selectedOptions, isCorrect });
    setUserAnswers(newAnswers);
    setShowResult(true);
  }, [currentQuestion, currentIndex, userAnswers, isComplete]);

  const nextQuestion = useCallback(() => {
    setShowResult(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setShowResult(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setShowResult(false);
      setCurrentIndex(index);
    }
  }, [totalQuestions]);

  const getResult = useCallback((): QuizResult => {
    return calculateResult(questions, userAnswers, mode);
  }, [questions, userAnswers, mode]);

  const getWrongQuestions = useCallback((): Question[] => {
    const result = getResult();
    return result.wrongAnswers.map(w => w.question);
  }, [getResult]);

  const getCurrentAnswer = useCallback((): UserAnswer | undefined => {
    return userAnswers.get(currentIndex);
  }, [userAnswers, currentIndex]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    answeredCount,
    userAnswers,
    isComplete,
    showResult,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    getResult,
    getWrongQuestions,
    getCurrentAnswer,
  };
}
