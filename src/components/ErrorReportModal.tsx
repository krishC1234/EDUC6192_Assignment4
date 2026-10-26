import React, { useState } from 'react';
import { ErrorReportCategory } from '../types';
import { reportSystemError } from '../api/quizService';
import {
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  Bug,
  Brain,
  Scale,
  Gauge,
  Sliders,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  diagnosticsData: Record<string, any>;
  onRetryAction?: () => void;
}

const CATEGORIES: {
  id: ErrorReportCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'ai_generation',
    label: 'AI Question Generation Issue',
    desc: 'Question was unclear, incomplete, or failed to generate',
    icon: Brain,
  },
  {
    id: 'grading_dispute',
    label: 'Grading or Answer Evaluation',
    desc: 'Answer evaluated incorrectly or explanation was flawed',
    icon: Scale,
  },
  {
    id: 'adaptation_logic',
    label: 'Difficulty Adaptation Glitch',
    desc: 'Difficulty did not adjust according to streak rules',
    icon: Sliders,
  },
  {
    id: 'performance',
    label: 'Performance / Timeout',
    desc: 'System was unresponsive, stalled, or timed out',
    icon: Gauge,
  },
  {
    id: 'ui_crash',
    label: 'UI or Display Bug',
    desc: 'Buttons unresponsive, formatting broken, or visual glitch',
    icon: Bug,
  },
  {
    id: 'other',
    label: 'Other System Issue',
    desc: 'Any other observation, error, or unexpected behavior',
    icon: HelpCircle,
  },
];

export const ErrorReportModal: React.FC<ErrorReportModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  diagnosticsData,
  onRetryAction,
}) => {
  const [category, setCategory] = useState<ErrorReportCategory>('ai_generation');
  const [description, setDescription] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorNotice('Please provide a brief description of the issue you experienced.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      const response = await reportSystemError({
        category,
        description: description.trim(),
        currentStep,
        diagnostics: {
          ...diagnosticsData,
          browserAgent: navigator.userAgent,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          localTime: new Date().toISOString(),
        },
      });

      setSubmittedReportId(response.reportId);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setDescription('');
    setErrorNotice(null);
    setSubmittedReportId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Report a System Issue
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Help us identify and resolve glitches in the adaptive quiz engine
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {submittedReportId ? (
            /* Submission Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Error Report Submitted
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Thank you for reporting. Your issue and the active agent state diagnostics have been logged.
                </p>
              </div>

              <div className="inline-block px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                Tracking ID: <strong>{submittedReportId}</strong>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                {onRetryAction && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onRetryAction();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Retry Current Step
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            /* Report Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorNotice && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  What kind of issue occurred?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                        <div>
                          <div className="font-semibold leading-tight">{cat.label}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label
                  htmlFor="issue-description"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Describe the Issue <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="issue-description"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errorNotice) setErrorNotice(null);
                  }}
                  placeholder="e.g., The question generation stalled after submitting Q2, or Option B seemed correct according to standard biology textbooks..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              {/* Collapsible Diagnostics Preview */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/30">
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="w-full p-2.5 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 cursor-pointer"
                >
                  <span>Captured System Diagnostics (Auto-attached)</span>
                  {showDiagnostics ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showDiagnostics && (
                  <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 max-h-36 overflow-y-auto space-y-1">
                    <div><strong>Current Stage:</strong> {currentStep}</div>
                    {diagnosticsData.subject && <div><strong>Subject:</strong> {diagnosticsData.subject}</div>}
                    {diagnosticsData.currentDifficulty && <div><strong>Difficulty:</strong> {diagnosticsData.currentDifficulty}</div>}
                    {diagnosticsData.questionNumber && <div><strong>Question #:</strong> {diagnosticsData.questionNumber}</div>}
                    {diagnosticsData.streaks && <div><strong>Streaks:</strong> {diagnosticsData.streaks}</div>}
                    {diagnosticsData.questionText && <div><strong>Question:</strong> {diagnosticsData.questionText}</div>}
                    {diagnosticsData.systemError && <div className="text-rose-600"><strong>Error Output:</strong> {diagnosticsData.systemError}</div>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Report...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Error Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
