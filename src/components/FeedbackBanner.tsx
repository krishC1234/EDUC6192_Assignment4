import React from 'react';
import { AnswerEvaluation, AdaptationDecision } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react';

interface FeedbackBannerProps {
  evaluation: AnswerEvaluation;
  adaptationDecision?: AdaptationDecision;
  learnerNote?: string | null;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  isLoadingNext: boolean;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  evaluation,
  adaptationDecision,
  learnerNote,
  onNextQuestion,
  isLastQuestion,
  isLoadingNext,
}) => {
  const isCorrect = evaluation.isCorrect;

  return (
    <div
      className={`mt-6 rounded-2xl border p-5 md:p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
        isCorrect
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-100'
          : 'bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100'
      }`}
    >
      {/* Result Status Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-sm">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isCorrect ? 'Correct Answer!' : 'Not Quite — Opportunity to Learn'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Tested concept:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {evaluation.conceptTested}
              </span>
            </p>
          </div>
        </div>

        {/* Correct option badge */}
        <div className="shrink-0 text-right">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
            Correct Option
          </span>
          <span className="inline-block mt-0.5 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-sm rounded-lg shadow-2xs">
            {evaluation.correctOptionId}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 backdrop-blur-xs">
        <div className="flex items-center gap-2 font-semibold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
          Agent Explanation & Context
        </div>
        <p>{evaluation.explanation}</p>
      </div>

      {/* Ambiguity notice if present */}
      {evaluation.isAmbiguous && evaluation.ambiguityNote && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Agent Ambiguity Note: </span>
            {evaluation.ambiguityNote}
          </div>
        </div>
      )}

      {/* Submitted Learner Note & Agent Review */}
      {learnerNote && (
        <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-xs text-indigo-950 dark:text-indigo-100 flex items-start gap-2.5">
          <MessageSquareQuote className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                Your Note Submitted with Answer:
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                Evaluated by Agent
              </span>
            </div>
            <p className="italic text-zinc-700 dark:text-zinc-300 bg-white/60 dark:bg-zinc-800/50 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              "{learnerNote}"
            </p>
            {evaluation.noteFeedback && (
              <div className="pt-1.5 text-zinc-800 dark:text-zinc-200">
                <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                  Agent Feedback on Note:{' '}
                </span>
                <span>{evaluation.noteFeedback}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent's Adaptation Decision Notice */}
      {adaptationDecision && (
        <div className="mt-4 p-3.5 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-950 dark:border dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            {adaptationDecision.action === 'increase' && (
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            )}
            {adaptationDecision.action === 'decrease' && (
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            )}
            {adaptationDecision.action === 'maintain' && (
              <span className="p-1 rounded-md bg-zinc-700 text-zinc-300">
                <Minus className="w-4 h-4" />
              </span>
            )}
            <div>
              <div className="font-semibold text-zinc-200 flex items-center gap-2">
                <span>Agent Decision:</span>
                <span className="text-zinc-400 capitalize">
                  {adaptationDecision.action === 'increase'
                    ? 'Level Up Difficulty'
                    : adaptationDecision.action === 'decrease'
                    ? 'Ease Difficulty'
                    : 'Maintain Difficulty'}
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-0.5">{adaptationDecision.reason}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-zinc-400 text-xs">Next Level:</span>
            <DifficultyBadge difficulty={adaptationDecision.nextDifficulty} size="sm" />
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onNextQuestion}
          disabled={isLoadingNext}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoadingNext ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Agent Preparing Next Question...</span>
            </>
          ) : isLastQuestion ? (
            <span>Complete Quiz & View Agent Summary →</span>
          ) : (
            <span>Continue to Next Question →</span>
          )}
        </button>
      </div>
    </div>
  );
};
