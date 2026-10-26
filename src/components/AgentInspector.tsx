import React from 'react';
import { LearnerState, AgentDecisionLog } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { Activity, Brain, CheckCircle, XCircle, ChevronRight, X, Sparkles, ShieldCheck, Layers, MessageSquareQuote } from 'lucide-react';

interface AgentInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  learnerState: LearnerState;
  decisionLogs: AgentDecisionLog[];
}

export const AgentInspector: React.FC<AgentInspectorProps> = ({
  isOpen,
  onClose,
  learnerState,
  decisionLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Agent State Inspector
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase font-semibold">
                  Live
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Observing learner responses & adaptation state
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Overview Grid */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Current Learner Model
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 shadow-2xs">
              <span className="text-zinc-500 block text-[11px]">Current Difficulty</span>
              <div className="mt-1">
                <DifficultyBadge difficulty={learnerState.currentDifficulty} size="sm" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 shadow-2xs">
              <span className="text-zinc-500 block text-[11px]">Score Accuracy</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                {learnerState.correctCount} / {learnerState.history.length || 0}
                {learnerState.history.length > 0 && (
                  <span className="text-xs text-zinc-500 font-normal ml-1">
                    ({Math.round((learnerState.correctCount / learnerState.history.length) * 100)}%)
                  </span>
                )}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
              <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-medium">
                Consecutive Correct
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {learnerState.consecutiveCorrect} / 2
                </span>
                <span className="text-[10px] text-zinc-500">
                  {learnerState.consecutiveCorrect === 1
                    ? '(1 more to level up)'
                    : learnerState.consecutiveCorrect >= 2
                    ? '(Level up triggered)'
                    : '(Needs 2)'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs">
              <span className="text-rose-700 dark:text-rose-400 block text-[11px] font-medium">
                Consecutive Incorrect
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  {learnerState.consecutiveIncorrect} / 2
                </span>
                <span className="text-[10px] text-zinc-500">
                  {learnerState.consecutiveIncorrect === 1
                    ? '(1 more to step down)'
                    : learnerState.consecutiveIncorrect >= 2
                    ? '(Step down triggered)'
                    : '(Needs 2)'}
                </span>
              </div>
            </div>
          </div>

          {/* Concepts tracked & Verified Knowledge Base */}
          <div className="space-y-2 pt-1">
            {learnerState.verifiedSubtopics && learnerState.verifiedSubtopics.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Curriculum Knowledge Base ({learnerState.verifiedSubtopics.length} Subtopics Mapped):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {learnerState.verifiedSubtopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] border border-indigo-200/60 dark:border-indigo-900"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {learnerState.masteredTopics.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3" /> Mastered Concepts:
                </span>
                <div className="flex flex-wrap gap-1">
                  {learnerState.masteredTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {learnerState.strugglingTopics.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1 mb-1">
                  <XCircle className="w-3 h-3" /> Struggling Concepts (Remediation Targets):
                </span>
                <div className="flex flex-wrap gap-1">
                  {learnerState.strugglingTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[11px]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chronological Decision Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Agent Decision Journal</span>
            <span className="text-[11px] text-zinc-400">{decisionLogs.length} events logged</span>
          </div>

          {decisionLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              Agent will record observations and decisions as the quiz progresses.
            </div>
          ) : (
            <div className="space-y-2.5">
              {decisionLogs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 text-xs shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      {log.phase === 'verify_topic' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                      )}
                      <span>{log.title}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                    {log.details}
                  </p>
                  {log.learnerNote && (
                    <div className="p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[10px] text-indigo-950 dark:text-indigo-200 flex items-start gap-1.5 italic">
                      <MessageSquareQuote className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-indigo-900 dark:text-indigo-300 not-italic">Learner Note: </span>
                        <span>"{log.learnerNote}"</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-700/50 text-[10px] text-zinc-500">
                    <span>Difficulty: <strong className="text-zinc-700 dark:text-zinc-300 capitalize">{log.metrics.difficulty}</strong></span>
                    <span>Streak: <strong className="text-zinc-700 dark:text-zinc-300">{log.metrics.streak}</strong></span>
                    <span>Score: <strong className="text-zinc-700 dark:text-zinc-300">{log.metrics.score}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
