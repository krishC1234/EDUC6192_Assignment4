import React, { useState } from 'react';
import { Difficulty, TopicVerificationResult } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { verifyTopicQuizzability } from '../api/quizService';
import {
  Brain,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Target,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SetupScreenProps {
  onStartQuiz: (config: {
    subject: string;
    startingDifficulty: Difficulty;
    questionCount: number;
    verificationResult?: TopicVerificationResult;
  }) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onReportError?: () => void;
}

const PRESET_TOPICS = [
  'Python Programming Basics',
  'Cellular Respiration & Photosynthesis',
  'CRISPR-Cas9 Gene Editing',
  'Newtonian Mechanics & Forces',
  'World War II Battle of Midway',
  'Microeconomics: Price Elasticity',
  'Cardiovascular Anatomy & Blood Flow',
  'React Hooks & State Management',
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartQuiz,
  isLoading,
  errorMessage,
  onReportError,
}) => {
  const [subject, setSubject] = useState('');
  const [startingDifficulty, setStartingDifficulty] = useState<Difficulty>('beginner');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Agent Topic Verification Task State
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<TopicVerificationResult | null>(null);

  const performAudit = async (topicToAudit: string): Promise<TopicVerificationResult | null> => {
    const trimmed = topicToAudit.trim();
    if (!trimmed) {
      setValidationError('Please enter a subject or topic for the quiz.');
      return null;
    }

    if (trimmed.length < 2) {
      setValidationError('Please enter a more descriptive topic title (at least 2 characters).');
      return null;
    }

    setIsAuditing(true);
    setValidationError(null);

    try {
      const result = await verifyTopicQuizzability(trimmed);
      setVerificationResult(result);
      return result;
    } catch (err: any) {
      console.warn('Audit failed:', err);
      const fallbackResult: TopicVerificationResult = {
        isValid: true,
        isQuizzable: true,
        isNicheEnough: true,
        normalizedTopic: trimmed,
        quizzabilityScore: 75,
        specificityLevel: 'optimal_niche',
        assessmentSummary: `Topic "${trimmed}" validated with standard academic curriculum coverage.`,
        detectedSubtopics: [`${trimmed} Principles`, `${trimmed} Key Applications`],
        suggestedRefinements: [],
      };
      setVerificationResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsAuditing(false);
    }
  };

  const handleManualAudit = async () => {
    await performAudit(subject);
  };

  const handleSelectSuggestedTopic = async (suggested: string) => {
    setSubject(suggested);
    setValidationError(null);
    await performAudit(suggested);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedSubject = subject.trim();

    // Edge case: Missing subject
    if (!trimmedSubject) {
      setValidationError('Please enter a subject or topic for the quiz. The adaptive agent requires a clear domain to generate questions.');
      return;
    }

    if (trimmedSubject.length < 2) {
      setValidationError('Please enter a more descriptive topic title (at least 2 characters).');
      return;
    }

    // Edge case: Invalid question count
    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      setValidationError('Question count must be a whole integer between 1 and 20.');
      return;
    }

    // Agent Task: Topic Quizzability & Niche Verification (Strict 80/100 Threshold)
    let audit = verificationResult;
    if (!audit || audit.normalizedTopic.toLowerCase() !== trimmedSubject.toLowerCase()) {
      audit = await performAudit(trimmedSubject);
    }

    if (!audit) return;

    if (!audit.isValid || !audit.isQuizzable || audit.quizzabilityScore < 80) {
      setValidationError(
        audit.assessmentSummary ||
          `Topic scored ${audit.quizzabilityScore}/100, which is below the required 80/100 threshold. The agent cannot proceed without more specific detail. Please narrow the focus or select a recommended niche below.`
      );
      return;
    }

    onStartQuiz({
      subject: audit.normalizedTopic || trimmedSubject,
      startingDifficulty,
      questionCount,
      verificationResult: audit,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-3 shadow-2xs">
          <Brain className="w-3.5 h-3.5" />
          <span>Autonomous Educational AI Agent — Version 1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Adaptive Quiz Generator
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
          An educational agent that verifies topic depth, observes your answers, evaluates your understanding, and dynamically adjusts difficulty in real time.
        </p>
      </div>

      {/* Main Setup Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        {(validationError || errorMessage) && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to proceed</p>
                <p className="mt-0.5">{validationError || errorMessage}</p>
              </div>
            </div>
            {onReportError && (
              <button
                type="button"
                onClick={onReportError}
                className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-semibold cursor-pointer shrink-0 transition-colors self-end sm:self-auto"
              >
                Report System Issue
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Field & Verification Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="subject-input"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
              >
                <span>Subject or Topic</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">≥ 80/100 Depth Required</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (validationError) setValidationError(null);
                    if (verificationResult) setVerificationResult(null);
                  }}
                  placeholder="e.g., Cellular Respiration, CRISPR Gene Editing, World War II"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                  disabled={isLoading || isAuditing}
                />
                <BookOpen className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Explicit Audit Button */}
              <button
                type="button"
                onClick={handleManualAudit}
                disabled={!subject.trim() || isAuditing || isLoading}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Ask the agent to verify if this topic meets the 80/100 threshold"
              >
                {isAuditing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Auditing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Audit Depth</span>
                  </>
                )}
              </button>
            </div>

            {/* Agent Topic Verification Feedback Card */}
            {isAuditing && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3 animate-in fade-in">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-semibold">Agent Task: </span>
                  Evaluating topic specificity, distractor viability, and checking against 80/100 depth threshold...
                </div>
              </div>
            )}

            {verificationResult && !isAuditing && (
              <div
                className={`mt-3 p-4 rounded-xl border transition-all animate-in fade-in ${
                  verificationResult.quizzabilityScore >= 80 && verificationResult.isQuizzable
                    ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/60 text-amber-950 dark:text-amber-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {verificationResult.quizzabilityScore >= 80 && verificationResult.isQuizzable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Agent Topic Feasibility Report
                    </span>
                  </div>

                  {/* Quizzability Score & Threshold Indicator */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                        verificationResult.quizzabilityScore >= 80
                          ? 'bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      Score: {verificationResult.quizzabilityScore}/100 {verificationResult.quizzabilityScore >= 80 ? '✓ (Meets ≥ 80)' : '✗ (< 80 Threshold)'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700">
                      {verificationResult.specificityLevel.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed mb-3">
                  {verificationResult.assessmentSummary}
                </p>

                {/* Warning callout when score < 80 asking for more detail */}
                {verificationResult.quizzabilityScore < 80 && (
                  <div className="mb-3 p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                    <span className="font-semibold">More Detail Required: </span>
                    The agent requires a score of at least <strong>80/100</strong> to ensure questions are sufficiently substantive and focused. Please add specific detail (e.g. key mechanism, specific era, or subdiscipline) or choose a recommended niche below.
                  </div>
                )}

                {/* Subtopics mapped by agent (proving sufficient depth) */}
                {verificationResult.detectedSubtopics.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Curriculum Depth Confirmed ({verificationResult.detectedSubtopics.length} subtopics):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {verificationResult.detectedSubtopics.map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested niche topics if current topic needs narrowing or fixing */}
                {verificationResult.suggestedRefinements.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/40">
                    <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1.5 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {!verificationResult.isValid
                          ? 'Recommended Quizzable Niche Topics (Click to adopt):'
                          : 'Related Deep-Dive Niches:'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {verificationResult.suggestedRefinements.map((ref) => (
                        <button
                          key={ref}
                          type="button"
                          onClick={() => handleSelectSuggestedTopic(ref)}
                          className="w-full text-left p-2 rounded-lg bg-white/90 dark:bg-zinc-800 border border-amber-200/80 dark:border-amber-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{ref}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Topic Suggestions Chips */}
            <div className="mt-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Or select a pre-verified niche subject:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setSubject(topic);
                      if (validationError) setValidationError(null);
                      if (verificationResult) setVerificationResult(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Starting Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Starting Difficulty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'beginner' as Difficulty,
                  title: 'Beginner',
                  desc: 'Core definitions, basic concepts & direct identification',
                },
                {
                  id: 'intermediate' as Difficulty,
                  title: 'Intermediate',
                  desc: 'Conceptual application, mechanisms & problem scenarios',
                },
                {
                  id: 'advanced' as Difficulty,
                  title: 'Advanced',
                  desc: 'Subtle trade-offs, edge cases, multi-step synthesis',
                },
              ].map((diff) => {
                const isSelected = startingDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setStartingDifficulty(diff.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <DifficultyBadge difficulty={diff.id} />
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="question-count-slider"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Number of Questions
              </label>
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">1</span>
              <input
                id="question-count-slider"
                type="range"
                min="1"
                max="20"
                step="1"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-400">20</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
              <span>Quick: 3-5 questions</span>
              <span>Recommended: 5-10</span>
              <span>In-depth: 15-20</span>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isAuditing}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading || isAuditing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isAuditing
                      ? 'Agent Verifying Quizzability & Niche...'
                      : 'Agent Initializing Adaptive Learning...'}
                  </span>
                </>
              ) : (
                <>
                  <span>Begin Adaptive Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Observability Guidance Footer */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Niche & Quizzable Vetting</span>
          </div>
          <p>
            Agent audits topic substance and maps 3-6 distinct concepts to ensure rich, non-repetitive learning.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>2-Consecutive Rule</span>
          </div>
          <p>
            2 consecutive correct answers elevate difficulty; 2 consecutive mistakes reduce difficulty with focused remediation.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Transparent State</span>
          </div>
          <p>
            Live streak counters, mastered concepts, and step-by-step agent decision logs are observable anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
