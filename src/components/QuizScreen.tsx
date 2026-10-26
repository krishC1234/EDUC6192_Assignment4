import React, { useState, useEffect } from 'react';
import { Question, AnswerEvaluation, AdaptationDecision, LearnerState } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { FeedbackBanner } from './FeedbackBanner';
import {
  Lightbulb,
  MessageSquareQuote,
  Check,
  Activity,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Send,
} from 'lucide-react';

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentDifficulty: LearnerState['currentDifficulty'];
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  evaluation: AnswerEvaluation | null;
  adaptationDecision?: AdaptationDecision;
  isEvaluating: boolean;
  isLoadingNext: boolean;
  onSubmitAnswer: (selectedOptionId: string, learnerComment?: string) => void;
  onNextQuestion: () => void;
  onOpenInspector: () => void;
  error?: string | null;
  onRetry?: () => void;
  onReportError?: () => void;
}

const QUICK_NOTE_PROMPTS = [
  'Reasoned through mechanism',
  'Torn between two options',
  'Eliminated other choices',
  'Flagging subtle ambiguity',
];

export const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  questionNumber,
  totalQuestions,
  currentDifficulty,
  consecutiveCorrect,
  consecutiveIncorrect,
  evaluation,
  adaptationDecision,
  isEvaluating,
  isLoadingNext,
  onSubmitAnswer,
  onNextQuestion,
  onOpenInspector,
  error,
  onRetry,
  onReportError,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [learnerComment, setLearnerComment] = useState<string>('');
  const [submittedComment, setSubmittedComment] = useState<string>('');

  const isSubmitted = !!evaluation;
  const isLastQuestion = questionNumber >= totalQuestions;

  // Clean reset when moving to a new question
  useEffect(() => {
    setSelectedOptionId(null);
    setLearnerComment('');
    setSubmittedComment('');
    setShowHint(false);
  }, [question.id, questionNumber]);

  const handleOptionSelect = (id: string) => {
    if (isSubmitted || isEvaluating) return;
    setSelectedOptionId(id);
  };

  const handleQuickPromptClick = (promptText: string) => {
    if (isSubmitted || isEvaluating) return;
    if (learnerComment.includes(promptText)) return;
    setLearnerComment((prev) =>
      prev ? `${prev.trim()}. ${promptText}` : promptText
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isSubmitted || isEvaluating) return;
    const trimmed = learnerComment.trim();
    setSubmittedComment(trimmed);
    onSubmitAnswer(selectedOptionId, trimmed || undefined);
  };

  // Progress percentage
  const progressPercent = Math.round(((questionNumber - 1) / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4">
      {/* Top Bar with Progress, Difficulty, and Inspector Trigger */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <DifficultyBadge difficulty={currentDifficulty} size="sm" />
          </div>

          <div className="flex items-center gap-3">
            {/* Live Streak Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  consecutiveCorrect > 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'text-zinc-400'
                }`}
                title="Consecutive correct answers (2 triggers level up)"
              >
                +{consecutiveCorrect} correct
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  consecutiveIncorrect > 0
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    : 'text-zinc-400'
                }`}
                title="Consecutive incorrect answers (2 triggers step down)"
              >
                -{consecutiveIncorrect} mistakes
              </span>
            </div>

            {/* Inspector Toggle Button */}
            <button
              type="button"
              onClick={onOpenInspector}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
              title="Inspect agent internal states and decision logs"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Agent State</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Error state if generation or evaluation failed */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Agent Process Disrupted</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onReportError && (
              <button
                type="button"
                onClick={onReportError}
                className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Report Error
              </button>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        {/* Subtopic & Pedagogical intent tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Concept: <strong>{question.subtopic}</strong>
          </span>

          {question.pedagogicalIntent && (
            <span
              className="text-[11px] text-zinc-500 dark:text-zinc-400 italic max-w-sm truncate"
              title={`Agent Goal: ${question.pedagogicalIntent}`}
            >
              Goal: {question.pedagogicalIntent}
            </span>
          )}
        </div>

        {/* Question Prompt */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-relaxed mb-6">
          {question.questionText}
        </h2>

        {/* Options List */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;

              // Post-submission styling
              let optionStyle = 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200';
              let badgeStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

              if (isSubmitted && evaluation) {
                const isCorrectOption = option.id === evaluation.correctOptionId;
                if (isCorrectOption) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold ring-2 ring-emerald-500/20';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected && !evaluation.isCorrect) {
                  optionStyle = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 font-medium ring-2 ring-rose-400/20';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600';
                } else {
                  optionStyle = 'opacity-60 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20 text-zinc-500';
                }
              } else if (isSelected) {
                optionStyle = 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-zinc-900 dark:text-zinc-100 ring-2 ring-indigo-500/20 font-medium';
                badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-sm sm:text-base transition-all select-none cursor-pointer ${optionStyle} ${
                    isSubmitted || isEvaluating ? 'cursor-default' : 'active:scale-[0.99]'
                  }`}
                >
                  <span
                    className={`shrink-0 w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center transition-colors ${badgeStyle}`}
                  >
                    {option.id}
                  </span>
                  <div className="flex-1 pt-0.5 leading-snug">{option.text}</div>
                  {isSelected && !isSubmitted && (
                    <span className="shrink-0 text-indigo-600 dark:text-indigo-400 pt-1">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint & Issue Controls Toolbar */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
            {question.hint && (
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>
            )}

            {onReportError && (
              <button
                type="button"
                onClick={onReportError}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer ml-auto"
                title="Report an issue or error with this question"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            )}
          </div>

          {/* Expandable Hint Box */}
          {showHint && question.hint && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Agent Hint: </span>
                {question.hint}
              </div>
            </div>
          )}

          {/* Prominent Learner Note / Reasoning Box - Submitted WITH Question */}
          {!isSubmitted && (
            <div className="pt-2">
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/60 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label
                    htmlFor="learner-note-input"
                    className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Learner Note & Reasoning (Submitted with your answer):</span>
                  </label>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Optional • Reviewed by AI Agent
                  </span>
                </div>

                <textarea
                  id="learner-note-input"
                  rows={2}
                  value={learnerComment}
                  onChange={(e) => setLearnerComment(e.target.value)}
                  placeholder="Share your reasoning, thought process, or flag doubts (e.g. 'I was torn between B and D because...', 'Assuming standard STP conditions')..."
                  className="w-full text-xs p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
                  disabled={isEvaluating}
                />

                {/* Quick Helper Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium">Quick tags:</span>
                  {QUICK_NOTE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPromptClick(prompt)}
                      disabled={isEvaluating}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      +{prompt}
                    </button>
                  ))}
                </div>

                {learnerComment.trim().length > 0 && selectedOptionId && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Note will be submitted with Option {selectedOptionId} for personalized agent feedback.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Answer Action Button */}
          {!isSubmitted && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedOptionId || isEvaluating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Agent Evaluating Answer & Learner Note...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer for Evaluation</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Immediate Feedback Banner on Submission */}
        {isSubmitted && evaluation && (
          <FeedbackBanner
            evaluation={evaluation}
            adaptationDecision={adaptationDecision}
            learnerNote={submittedComment || learnerComment.trim() || undefined}
            onNextQuestion={onNextQuestion}
            isLastQuestion={isLastQuestion}
            isLoadingNext={isLoadingNext}
          />
        )}
      </div>
    </div>
  );
};
