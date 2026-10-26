import React, { useState } from 'react';
import { QuizSummary, QuizHistoryItem } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  MessageSquareQuote,
} from 'lucide-react';

interface ResultsScreenProps {
  summary: QuizSummary;
  history: QuizHistoryItem[];
  onRestart: () => void;
  onOpenInspector: () => void;
  onReportError?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  summary,
  history,
  onRestart,
  onOpenInspector,
  onReportError,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percent >= 60) return 'text-indigo-600 dark:text-indigo-400';
    if (percent >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* Hero Score Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4 shadow-2xs">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Quiz Completed: {summary.subject}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
          Here is your comprehensive performance evaluation and the adaptive agent's synthesized observations.
        </p>

        {/* Big Score Stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Final Score
            </span>
            <span className={`text-4xl sm:text-5xl font-black ${getScoreColor(summary.accuracyPercentage)}`}>
              {summary.accuracyPercentage}%
            </span>
            <span className="text-xs text-zinc-500 block mt-1">
              {summary.correctCount} of {summary.totalQuestions} correct
            </span>
          </div>

          <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Starting Level
            </span>
            <div className="mt-1">
              <DifficultyBadge difficulty={summary.startingDifficulty} size="md" />
            </div>
          </div>

          <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Final Adapted Level
            </span>
            <div className="mt-1">
              <DifficultyBadge difficulty={summary.finalDifficulty} size="md" />
            </div>
          </div>
        </div>

        {/* Button to open live state machine inspector */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
          <button
            onClick={onOpenInspector}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>View Full Agent State Machine & Decision Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Difficulty Trajectory Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Adaptive Difficulty Trajectory
          </h2>
        </div>

        {/* Visual Timeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {summary.difficultyTrajectory.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                step.isCorrect
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                  : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Q{step.questionNumber}</span>
                {step.isCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
              </div>
              <div className="mt-1">
                <DifficultyBadge difficulty={step.difficulty} size="sm" showDots={false} />
              </div>
              <span className="text-[10px] text-zinc-500 truncate mt-2 block" title={step.subtopic}>
                {step.subtopic}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-3 italic">{summary.observedPatterns}</p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Observed Strengths</h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {summary.strengthsSummary}
          </p>
        </div>

        {/* Struggling Concepts */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Areas for Review</h3>
          </div>
          {summary.strugglingAreas.length > 0 ? (
            <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
              {summary.strugglingAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              No prominent struggle areas recorded during this question sequence.
            </p>
          )}
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400">
          <BookOpen className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Agent Study Recommendations</h3>
        </div>
        <div className="space-y-2">
          {summary.studyRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 flex items-start gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required Boundary Caveat Banner */}
      <div className="rounded-2xl p-4 bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            Educational Disclaimer & Scope Boundary:{' '}
          </span>
          {summary.masteryCaveat}
        </div>
      </div>

      {/* Question Review Accordion */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
          Detailed Question Breakdown ({history.length} Questions)
        </h3>

        <div className="space-y-2.5">
          {history.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const isCorrect = item.evaluation.isCorrect;

            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-3.5 bg-zinc-50/70 hover:bg-zinc-100/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Q{item.questionNumber}:</span>
                    <span className="truncate text-zinc-700 dark:text-zinc-300 font-medium">
                      {item.question.questionText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <DifficultyBadge difficulty={item.difficultyBefore} size="sm" showDots={false} />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-zinc-900 text-xs space-y-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {item.question.questionText}
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5">
                      {item.question.options.map((opt) => {
                        const isStudentChoice = opt.id === item.selectedOptionId;
                        const isCorrectOption = opt.id === item.evaluation.correctOptionId;

                        let style = 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
                        if (isCorrectOption) {
                          style = 'bg-emerald-50 text-emerald-950 border border-emerald-300 font-medium dark:bg-emerald-950/40 dark:text-emerald-100';
                        } else if (isStudentChoice && !isCorrect) {
                          style = 'bg-rose-50 text-rose-950 border border-rose-300 font-medium dark:bg-rose-950/40 dark:text-rose-100';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 ${style}`}
                          >
                            <span>
                              <strong>{opt.id}:</strong> {opt.text}
                            </span>
                            <div className="flex gap-1.5 shrink-0">
                              {isStudentChoice && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                                  Your Choice
                                </span>
                              )}
                              {isCorrectOption && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-600 text-white font-semibold">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Agent Feedback:</strong> {item.evaluation.explanation}
                    </div>

                    {/* Learner Note if submitted */}
                    {item.learnerNote && (
                      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-xs text-indigo-950 dark:text-indigo-100 flex items-start gap-2.5">
                        <MessageSquareQuote className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300 block">
                            Your Note Submitted with Answer:
                          </span>
                          <p className="italic text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/60 p-2 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                            "{item.learnerNote}"
                          </p>
                          {item.evaluation.noteFeedback && (
                            <div className="pt-1 text-zinc-800 dark:text-zinc-200">
                              <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                                Agent Reaction:{' '}
                              </span>
                              <span>{item.evaluation.noteFeedback}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Adaptation decision explanation */}
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between">
                      <span><strong>Agent Adaptation Trigger:</strong> {item.adaptationDecision.reason}</span>
                      <span className="text-[10px] font-mono">
                        Level: {item.difficultyBefore} → {item.difficultyAfter}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start a New Adaptive Quiz</span>
        </button>

        {onReportError && (
          <button
            type="button"
            onClick={onReportError}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Report System Issue</span>
          </button>
        )}
      </div>
    </div>
  );
};
