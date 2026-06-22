import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Trophy,
  Target,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz';
import { useTimer } from '../hooks/useTimer';
import type { QuizMode, Question, QuizResult } from '../types';
import { getModeLabel, getCorrectAnswerDisplay, getUserAnswerDisplay } from '../utils/quiz';
import { cn } from '../lib/utils';

// ─── Sub-components ────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function TypeBadge({ type }: { type: Question['type'] }) {
  const config = {
    single: { label: '单选', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    multiple: { label: '多选', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    trueFalse: { label: '判断', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  };
  const c = config[type];
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider', c.color)}>
      {c.label}
    </span>
  );
}

function QuestionDots({ total, current, answers, onGoTo }: {
  total: number;
  current: number;
  answers: Map<number, { isCorrect: boolean | null }>;
  onGoTo: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({ length: total }, (_, i) => {
        const answer = answers.get(i);
        const isCurrent = i === current;
        let dotClass = 'bg-muted-foreground/25';
        if (answer?.isCorrect === true) dotClass = 'bg-emerald-500/70';
        else if (answer?.isCorrect === false) dotClass = 'bg-red-500/70';
        if (isCurrent) dotClass = 'bg-primary ring-2 ring-primary/30';

        return (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-125',
              dotClass,
            )}
          />
        );
      })}
    </div>
  );
}

function AnswerFeedback({ question, selected, isCorrect }: {
  question: Question;
  selected: number[];
  isCorrect: boolean;
}) {
  return (
    <div className={cn(
      'mt-5 p-4 rounded-xl border text-sm animate-slide-up',
      isCorrect
        ? 'bg-emerald-500/8 border-emerald-500/30 text-emerald-400'
        : 'bg-red-500/8 border-red-500/30 text-red-400',
    )}>
      <div className="flex items-center gap-2 font-semibold mb-2">
        {isCorrect ? (
          <><CheckCircle2 className="w-4 h-4" /> 回答正确！</>
        ) : (
          <><XCircle className="w-4 h-4" /> 回答错误</>
        )}
      </div>
      <div className="space-y-1.5">
        <div>
          <span className="text-muted-foreground">你的答案：</span>
          <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
            {getUserAnswerDisplay(question, selected)}
          </span>
        </div>
        {!isCorrect && (
          <div>
            <span className="text-muted-foreground">正确答案：</span>
            <span className="text-emerald-400 font-medium">
              {getCorrectAnswerDisplay(question)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Screen ──────────────────────────────────────────────

function ResultScreen({ result, elapsedSeconds, onRedo, onHome, onRedoWrong }: {
  result: QuizResult;
  elapsedSeconds: number;
  onRedo: () => void;
  onHome: () => void;
  onRedoWrong: () => void;
}) {
  const { total, correct, wrong, score, wrongAnswers } = result;
  const isPerfect = score === 100;
  const isGood = score >= 80;
  const isPass = score >= 60;

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m > 0) return `${m}分${sec}秒`;
    return `${sec}秒`;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Score Hero */}
        <div className="text-center mb-8 animate-scale-in">
          <div className={cn(
            'w-28 h-28 mx-auto rounded-full flex items-center justify-center border-4 mb-4',
            isPerfect ? 'border-amber-400 bg-amber-400/10' :
            isGood ? 'border-emerald-400 bg-emerald-400/10' :
            isPass ? 'border-blue-400 bg-blue-400/10' :
            'border-red-400 bg-red-400/10',
          )}>
            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold',
                isPerfect ? 'text-amber-400' :
                isGood ? 'text-emerald-400' :
                isPass ? 'text-blue-400' :
                'text-red-400',
              )}>{score}</div>
              <div className="text-[10px] text-muted-foreground">分</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {isPerfect ? '🎉 完美通关！' : isGood ? '👏 表现优秀！' : isPass ? '📚 继续加油！' : '💪 还需努力！'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {getModeLabel(result.mode)} · {total} 题
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8 animate-slide-up">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold">{total}</div>
            <div className="text-[10px] text-muted-foreground">总题数</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400">{correct}</div>
            <div className="text-[10px] text-muted-foreground">正确</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-red-500/15 flex items-center justify-center">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-lg font-bold text-red-400">{wrong}</div>
            <div className="text-[10px] text-muted-foreground">错误</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold">{formatTime(elapsedSeconds)}</div>
            <div className="text-[10px] text-muted-foreground">用时</div>
          </div>
        </div>

        {/* Wrong Answers Detail */}
        {wrongAnswers.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold">错题回顾 ({wrongAnswers.length}题)</h3>
            </div>
            <div className="space-y-3">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="rounded-xl bg-card border border-border/50 p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <TypeBadge type={wa.question.type} />
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium mb-3">{wa.question.question}</p>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-muted-foreground">你的答案：</span>
                      <span className="text-red-400">{getUserAnswerDisplay(wa.question, wa.userAnswer)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">正确答案：</span>
                      <span className="text-emerald-400 font-medium">{getCorrectAnswerDisplay(wa.question)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPerfect && wrongAnswers.length === 0 && (
          <div className="mb-8 text-center animate-slide-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              <Trophy className="w-4 h-4" />
              全部正确，太厉害了！
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {wrongAnswers.length > 0 && (
            <button
              onClick={onRedoWrong}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl
                         bg-primary text-primary-foreground font-semibold
                         hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              重做错题 ({wrongAnswers.length}题)
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRedo}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         bg-card border border-border font-medium
                         hover:bg-accent active:scale-[0.98] transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              重新练习
            </button>
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         bg-card border border-border font-medium
                         hover:bg-accent active:scale-[0.98] transition-all text-sm"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Quiz Page ─────────────────────────────────────────────

export default function QuizPage() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const quizMode = (mode ?? 'single') as QuizMode;

  // Handle redo: check sessionStorage first, then location state
  const redoQuestions = useRef<Question[] | undefined>(undefined);
  if (!redoQuestions.current) {
    // Check sessionStorage (set by previous result screen)
    const stored = sessionStorage.getItem('quiz_redo_qs');
    if (stored) {
      try {
        redoQuestions.current = JSON.parse(stored);
        sessionStorage.removeItem('quiz_redo_qs');
      } catch { /* ignore */ }
    }
    if (!redoQuestions.current) {
      redoQuestions.current = (location.state as any)?.redoQuestions;
    }
  }

  const {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
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
  } = useQuiz(quizMode, redoQuestions.current);

  const timer = useTimer();

  // Start timer on first mount
  useEffect(() => {
    timer.start();
    return () => timer.stop();
  }, []);

  // Stop timer when quiz completes
  useEffect(() => {
    if (isComplete) timer.stop();
  }, [isComplete, timer]);

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showDots, setShowDots] = useState(false);

  // Reset selection when moving to a new question
  useEffect(() => {
    const existing = getCurrentAnswer();
    setSelectedOptions(existing?.selectedOptions ?? []);
  }, [currentIndex, getCurrentAnswer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;

      if (!showResult && currentQuestion && 'options' in currentQuestion) {
        // Number keys to select options
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQuestion.options.length) {
          e.preventDefault();
          if (currentQuestion.type === 'single') {
            setSelectedOptions([num - 1]);
          } else {
            setSelectedOptions(prev =>
              prev.includes(num - 1)
                ? prev.filter(o => o !== num - 1)
                : [...prev, num - 1]
            );
          }
        }

        // Enter to submit
        if (e.key === 'Enter' && selectedOptions.length > 0) {
          e.preventDefault();
          handleSubmit();
        }
      }

      // Arrow keys for navigation
      if (showResult) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          nextQuestion();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showResult, selectedOptions, isComplete]);

  const handleOptionToggle = (index: number) => {
    if (showResult || !currentQuestion) return;

    if (currentQuestion.type === 'single' || currentQuestion.type === 'trueFalse') {
      setSelectedOptions([index]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(index)
          ? prev.filter(o => o !== index)
          : [...prev, index]
      );
    }
  };

  const handleSubmit = useCallback(() => {
    if (selectedOptions.length === 0 || !currentQuestion) return;
    submitAnswer(selectedOptions);
  }, [selectedOptions, currentQuestion, submitAnswer]);

  const handleRedoWrong = useCallback(() => {
    const wrongQs = getWrongQuestions();
    if (wrongQs.length > 0) {
      // Store wrong questions in sessionStorage so they survive navigation
      sessionStorage.setItem('quiz_redo_qs', JSON.stringify(wrongQs));
      // Navigate with a unique key to force remount
      navigate(`/quiz/${quizMode}?k=${Date.now()}`, { replace: true });
    }
  }, [getWrongQuestions, navigate, quizMode]);

  // If complete, show result
  if (isComplete) {
    const result = getResult();
    return (
      <ResultScreen
        result={result}
        elapsedSeconds={timer.seconds}
        onRedo={() => {
          navigate(`/quiz/${quizMode}?k=${Date.now()}`, { replace: true });
        }}
        onHome={() => navigate('/', { replace: true })}
        onRedoWrong={handleRedoWrong}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-muted-foreground">加载题目中...</p>
      </div>
    );
  }

  const currentAnswer = getCurrentAnswer();
  const isAnswered = currentAnswer !== undefined;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold truncate">{getModeLabel(quizMode)}</span>
                {currentQuestion && <TypeBadge type={currentQuestion.type} />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timer.formatTime(timer.seconds)}
              </span>
              <button
                onClick={() => setShowDots(!showDots)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-accent transition-colors font-medium tabular-nums"
              >
                {currentIndex + 1}/{totalQuestions}
              </button>
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      {/* Question Dots (expandable) */}
      {showDots && (
        <div className="border-b border-border bg-card/50 py-3 px-4 animate-slide-down">
          <QuestionDots
            total={totalQuestions}
            current={currentIndex}
            answers={userAnswers}
            onGoTo={goToQuestion}
          />
        </div>
      )}

      {/* Question Area */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full">
        {/* Question Card */}
        <div className="animate-fade-in">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                第 {currentIndex + 1} 题
              </span>
              {currentQuestion.type === 'multiple' && (
                <span className="text-[10px] text-muted-foreground/60">（多选）</span>
              )}
            </div>
            <h2 className="text-lg font-semibold leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.type === 'trueFalse' ? (
              // True/False buttons
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 1, label: '正确', icon: Check, color: 'emerald' },
                  { value: 0, label: '错误', icon: X, color: 'red' },
                ].map((opt) => {
                  const isSelected = selectedOptions.includes(opt.value);
                  const isCorrectAnswer = currentQuestion.answer === (opt.value === 1);
                  let stateClass = '';
                  if (showResult) {
                    if (isCorrectAnswer) {
                      stateClass = 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30';
                    } else if (isSelected && !isCorrectAnswer) {
                      stateClass = 'border-red-500 bg-red-500/15 ring-1 ring-red-500/30';
                    } else {
                      stateClass = 'opacity-50';
                    }
                  } else if (isSelected) {
                    stateClass = 'border-primary bg-primary/10 ring-1 ring-primary/30';
                  }

                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionToggle(opt.value)}
                      disabled={showResult}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border-2 border-border',
                        'transition-all duration-200',
                        'hover:border-primary/50 active:scale-[0.98]',
                        'disabled:cursor-default',
                        stateClass,
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        'bg-muted border border-border',
                      )}>
                        <opt.icon className={cn(
                          'w-5 h-5',
                          opt.color === 'emerald' ? 'text-emerald-400' : 'text-red-400',
                        )} />
                      </div>
                      <span className="font-semibold text-base">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // ABCD Options
              ('options' in currentQuestion ? currentQuestion.options : []).map((option, i) => {
                const label = String.fromCharCode(65 + i); // A, B, C, D
                const isSelected = selectedOptions.includes(i);
                const isCorrectAnswer = currentQuestion.type === 'single'
                  ? currentQuestion.answer === i
                  : currentQuestion.answer.includes(i);
                const showCheckbox = currentQuestion.type === 'multiple';

                let stateClass = '';
                if (showResult) {
                  if (isCorrectAnswer) {
                    stateClass = 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30';
                  } else if (isSelected && !isCorrectAnswer) {
                    stateClass = 'border-red-500 bg-red-500/15 ring-1 ring-red-500/30 animate-shake';
                  } else {
                    stateClass = 'opacity-50';
                  }
                } else if (isSelected) {
                  stateClass = 'border-primary bg-primary/10 ring-1 ring-primary/30';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionToggle(i)}
                    disabled={showResult}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border-2 border-border',
                      'transition-all duration-200 text-left',
                      'hover:border-primary/50 active:scale-[0.98]',
                      'disabled:cursor-default',
                      stateClass,
                    )}
                  >
                    {/* Label circle */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      'font-semibold text-sm transition-colors',
                      isSelected && !showResult ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border',
                      showResult && isCorrectAnswer && 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
                    )}>
                      {showResult && isCorrectAnswer ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : showResult && isSelected && !isCorrectAnswer ? (
                        <XCircle className="w-5 h-5" />
                      ) : showCheckbox ? (
                        isSelected ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-30" />
                      ) : (
                        label
                      )}
                    </div>

                    {/* Option text */}
                    <span className="flex-1 text-sm leading-relaxed">
                      <span className="font-medium text-muted-foreground mr-2">{label}.</span>
                      {option}
                    </span>

                    {/* Selection indicator for multiple choice */}
                    {showCheckbox && !showResult && (
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          {!showResult && (
            <p className="mt-4 text-center text-[10px] text-muted-foreground/50">
              按数字键 1-4 选择 · Enter 确认 · ← → 切换题目
            </p>
          )}

          {/* Submit / Feedback */}
          {showResult && currentAnswer ? (
            <AnswerFeedback
              question={currentQuestion}
              selected={currentAnswer.selectedOptions}
              isCorrect={currentAnswer.isCorrect ?? false}
            />
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className={cn(
                'w-full mt-5 py-3.5 rounded-xl font-semibold text-base transition-all',
                selectedOptions.length > 0
                  ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {selectedOptions.length === 0 ? '请选择答案' : '确认答案'}
            </button>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                currentIndex === 0
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'hover:bg-accent active:scale-[0.97]',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              上一题
            </button>

            <QuestionDots
              total={totalQuestions}
              current={currentIndex}
              answers={userAnswers}
              onGoTo={goToQuestion}
            />

            <button
              onClick={nextQuestion}
              disabled={!showResult && !isAnswered}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                showResult || isAnswered
                  ? 'hover:bg-accent active:scale-[0.97]'
                  : 'text-muted-foreground/40 cursor-not-allowed',
              )}
            >
              {currentIndex === totalQuestions - 1 ? '完成' : '下一题'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
