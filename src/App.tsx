/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Difficulty,
  Question,
  AnswerEvaluation,
  AdaptationDecision,
  LearnerState,
  QuizSummary,
  AgentDecisionLog,
  TopicVerificationResult,
} from './types';
import { computeNextAdaptation, formatDifficulty } from './agent/adaptationEngine';
import {
  generateQuestion,
  evaluateAnswer,
  generateSummary,
  verifyTopicQuizzability,
} from './api/quizService';
import { SetupScreen } from './components/SetupScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { AgentInspector } from './components/AgentInspector';
import { ErrorReportModal } from './components/ErrorReportModal';
import { Brain, Activity, RotateCcw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector Drawer State
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Error Report Modal State
  const [isErrorReportOpen, setIsErrorReportOpen] = useState<boolean>(false);

  // Learner State Managed by the Agent
  const [learnerState, setLearnerState] = useState<LearnerState>({
    subject: '',
    targetQuestionCount: 5,
    currentDifficulty: 'beginner',
    currentQuestionNumber: 1,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    strugglingTopics: [],
    masteredTopics: [],
    history: [],
  });

  // Current Question & Grading
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentGradingKey, setCurrentGradingKey] = useState<{
    correctOptionId: string;
    explanation: string;
    subtopic?: string;
  } | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [currentAdaptationDecision, setCurrentAdaptationDecision] = useState<AdaptationDecision | undefined>(undefined);

  // Quiz Summary State
  const [summary, setSummary] = useState<QuizSummary | null>(null);

  // Chronological Agent Decision Logs for Auditability
  const [decisionLogs, setDecisionLogs] = useState<AgentDecisionLog[]>([]);

  const addDecisionLog = (
    phase: AgentDecisionLog['phase'],
    title: string,
    details: string,
    stateSnapshot: LearnerState,
    learnerNote?: string
  ) => {
    const newLog: AgentDecisionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stepNumber: decisionLogs.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      phase,
      title,
      details,
      metrics: {
        difficulty: stateSnapshot.currentDifficulty,
        streak: `+${stateSnapshot.consecutiveCorrect} / -${stateSnapshot.consecutiveIncorrect}`,
        score: `${stateSnapshot.correctCount}/${stateSnapshot.history.length}`,
      },
      learnerNote,
    };
    setDecisionLogs((prev) => [...prev, newLog]);
  };

  /**
   * Action 1: Start Quiz Setup - Verified by Agent
   */
  const handleStartQuiz = async (config: {
    subject: string;
    startingDifficulty: Difficulty;
    questionCount: number;
    verificationResult?: TopicVerificationResult;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Execute Agent Task -> Topic Quizzability & Niche Verification
      let audit = config.verificationResult;
      if (!audit) {
        audit = await verifyTopicQuizzability(config.subject);
      }

      if (!audit.isValid || !audit.isQuizzable || audit.quizzabilityScore < 80) {
        setErrorMessage(
          audit.assessmentSummary ||
            `Topic scored ${audit.quizzabilityScore}/100 (Threshold required: 80/100). The agent cannot proceed without more specific detail. Please narrow or detail the topic.`
        );
        setIsLoading(false);
        return;
      }

      const activeSubject = audit.normalizedTopic || config.subject;
      const verifiedSubtopics = audit.detectedSubtopics || [];

      const initialState: LearnerState = {
        subject: activeSubject,
        targetQuestionCount: config.questionCount,
        currentDifficulty: config.startingDifficulty,
        currentQuestionNumber: 1,
        correctCount: 0,
        incorrectCount: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        strugglingTopics: [],
        masteredTopics: [],
        history: [],
        verifiedSubtopics,
        topicVerification: audit,
      };

      setLearnerState(initialState);
      setDecisionLogs([]);

      // Step 2: Record Topic Feasibility Agent Decision Log
      addDecisionLog(
        'verify_topic',
        `Topic Feasibility Verified: "${activeSubject}" (Score: ${audit.quizzabilityScore}/100)`,
        `Specificity: ${audit.specificityLevel}. Mapped ${verifiedSubtopics.length} core curriculum subtopics: ${verifiedSubtopics.join('; ')}. ${audit.assessmentSummary}`,
        initialState
      );

      // Step 3: Agent creates first question grounded in verified subtopics
      const res = await generateQuestion({
        subject: activeSubject,
        difficulty: config.startingDifficulty,
        questionNumber: 1,
        totalQuestions: config.questionCount,
        strugglingTopics: [],
        masteredTopics: [],
        previousQuestions: [],
        verifiedSubtopics,
      });

      setCurrentQuestion(res.question);
      setCurrentGradingKey(res._gradingKey);
      setCurrentEvaluation(null);
      setCurrentAdaptationDecision(undefined);

      // Step 4: Log Initial Question Formulation
      addDecisionLog(
        'generate',
        `Generated Initial Question at ${formatDifficulty(config.startingDifficulty)}`,
        `Subject "${activeSubject}". Agent formulated question targeting "${res.question.subtopic}". Pedagogical intent: ${res.question.pedagogicalIntent}`,
        initialState
      );

      setScreen('quiz');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to start quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Action 2: Learner Submits Answer -> Agent Evaluates & Adapts
   */
  const handleSubmitAnswer = async (selectedOptionId: string, learnerComment?: string) => {
    if (!currentQuestion || !currentGradingKey) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      // 1. Agent Evaluates the Answer
      const evaluation = await evaluateAnswer({
        subject: learnerState.subject,
        question: currentQuestion,
        selectedOptionId,
        gradingKey: currentGradingKey,
        learnerComment,
      });

      setCurrentEvaluation(evaluation);

      // 2. Agent Decision Engine Computes Next Adaptation (Rule 5)
      const {
        decision,
        nextConsecutiveCorrect,
        nextConsecutiveIncorrect,
        nextDifficulty,
        targetedFocusArea,
      } = computeNextAdaptation(learnerState, evaluation);

      setCurrentAdaptationDecision(decision);

      // 3. Update Learner State
      const updatedStruggling = evaluation.strugglingConcept && !learnerState.strugglingTopics.includes(evaluation.strugglingConcept)
        ? [...learnerState.strugglingTopics, evaluation.strugglingConcept]
        : learnerState.strugglingTopics;

      const updatedMastered = evaluation.masteredConcept && !learnerState.masteredTopics.includes(evaluation.masteredConcept)
        ? [...learnerState.masteredTopics, evaluation.masteredConcept]
        : learnerState.masteredTopics;

      const updatedState: LearnerState = {
        ...learnerState,
        correctCount: learnerState.correctCount + (evaluation.isCorrect ? 1 : 0),
        incorrectCount: learnerState.incorrectCount + (evaluation.isCorrect ? 0 : 1),
        consecutiveCorrect: nextConsecutiveCorrect,
        consecutiveIncorrect: nextConsecutiveIncorrect,
        currentDifficulty: nextDifficulty,
        strugglingTopics: updatedStruggling,
        masteredTopics: updatedMastered,
        latestDecision: decision,
        history: [
          ...learnerState.history,
          {
            questionNumber: learnerState.currentQuestionNumber,
            question: currentQuestion,
            selectedOptionId,
            learnerNote: learnerComment?.trim() || undefined,
            evaluation,
            difficultyBefore: currentQuestion.targetDifficulty,
            difficultyAfter: nextDifficulty,
            adaptationDecision: decision,
            timestamp: Date.now(),
          },
        ],
      };

      setLearnerState(updatedState);

      // Log evaluation & adaptation
      addDecisionLog(
        'evaluate',
        `Evaluated Answer: ${evaluation.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}`,
        `Learner chose option ${selectedOptionId}. Concept: "${evaluation.conceptTested}". Explanation: ${evaluation.explanation}${
          learnerComment ? ` (Learner note attached: "${learnerComment.trim()}")` : ''
        }`,
        updatedState,
        learnerComment?.trim() || undefined
      );

      addDecisionLog(
        'adapt',
        `Adaptation Decision: ${decision.action.toUpperCase()} (${formatDifficulty(decision.previousDifficulty)} → ${formatDifficulty(decision.nextDifficulty)})`,
        `${decision.reason}${targetedFocusArea ? ` Targeted focus area for next question: "${targetedFocusArea}".` : ''}`,
        updatedState
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  /**
   * Action 3: Next Question or Finalize Quiz
   */
  const handleNextQuestion = async () => {
    // Check if finished
    if (learnerState.currentQuestionNumber >= learnerState.targetQuestionCount) {
      setIsLoadingNext(true);
      setErrorMessage(null);
      try {
        const summaryData = await generateSummary({
          subject: learnerState.subject,
          history: learnerState.history,
          strugglingTopics: learnerState.strugglingTopics,
          masteredTopics: learnerState.masteredTopics,
          startingDifficulty: learnerState.history[0]?.difficultyBefore || 'beginner',
          finalDifficulty: learnerState.currentDifficulty,
        });

        setSummary(summaryData);

        addDecisionLog(
          'finalize',
          'Synthesized Learning Observations',
          `Generated comprehensive analysis. Overall accuracy: ${summaryData.accuracyPercentage}%. Identified ${summaryData.studyRecommendations.length} recommendations.`,
          learnerState
        );

        setScreen('results');
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Failed to finalize quiz summary.');
      } finally {
        setIsLoadingNext(false);
      }
      return;
    }

    // Otherwise, generate next question at adapted difficulty
    setIsLoadingNext(true);
    setErrorMessage(null);

    const nextQNum = learnerState.currentQuestionNumber + 1;
    const previousQuestions = learnerState.history.map((h) => h.question.questionText);

    try {
      const res = await generateQuestion({
        subject: learnerState.subject,
        difficulty: learnerState.currentDifficulty,
        questionNumber: nextQNum,
        totalQuestions: learnerState.targetQuestionCount,
        strugglingTopics: learnerState.strugglingTopics,
        masteredTopics: learnerState.masteredTopics,
        previousQuestions,
        focusArea: learnerState.latestDecision?.focusArea,
        verifiedSubtopics: learnerState.verifiedSubtopics,
      });

      setCurrentQuestion(res.question);
      setCurrentGradingKey(res._gradingKey);
      setCurrentEvaluation(null);
      setCurrentAdaptationDecision(undefined);

      setLearnerState((prev) => ({
        ...prev,
        currentQuestionNumber: nextQNum,
      }));

      addDecisionLog(
        'generate',
        `Generated Question ${nextQNum} at ${formatDifficulty(learnerState.currentDifficulty)}`,
        `Agent tailored question on "${res.question.subtopic}". Goal: ${res.question.pedagogicalIntent}`,
        learnerState
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate next question.');
    } finally {
      setIsLoadingNext(false);
    }
  };

  /**
   * Action 4: Restart Quiz
   */
  const handleRestart = () => {
    setScreen('setup');
    setLearnerState({
      subject: '',
      targetQuestionCount: 5,
      currentDifficulty: 'beginner',
      currentQuestionNumber: 1,
      correctCount: 0,
      incorrectCount: 0,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      strugglingTopics: [],
      masteredTopics: [],
      history: [],
    });
    setCurrentQuestion(null);
    setCurrentGradingKey(null);
    setCurrentEvaluation(null);
    setCurrentAdaptationDecision(undefined);
    setSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            onClick={screen !== 'setup' ? handleRestart : undefined}
            className={`flex items-center gap-2.5 ${screen !== 'setup' ? 'cursor-pointer hover:opacity-85' : ''}`}
            title={screen !== 'setup' ? 'Click to reset quiz' : undefined}
          >
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">Adaptive Quiz Generator</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Always accessible Report Error button */}
            <button
              type="button"
              onClick={() => setIsErrorReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              title="Report an error or issue with the system"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>

            {screen !== 'setup' && (
              <button
                type="button"
                onClick={() => setIsInspectorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Agent State</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-mono">
                  {decisionLogs.length}
                </span>
              </button>
            )}

            {screen !== 'setup' && (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Start a new quiz"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="pb-16">
        {screen === 'setup' && (
          <SetupScreen
            onStartQuiz={handleStartQuiz}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onReportError={() => setIsErrorReportOpen(true)}
          />
        )}

        {screen === 'quiz' && currentQuestion && (
          <QuizScreen
            question={currentQuestion}
            questionNumber={learnerState.currentQuestionNumber}
            totalQuestions={learnerState.targetQuestionCount}
            currentDifficulty={learnerState.currentDifficulty}
            consecutiveCorrect={learnerState.consecutiveCorrect}
            consecutiveIncorrect={learnerState.consecutiveIncorrect}
            evaluation={currentEvaluation}
            adaptationDecision={currentAdaptationDecision}
            isEvaluating={isEvaluating}
            isLoadingNext={isLoadingNext}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onOpenInspector={() => setIsInspectorOpen(true)}
            error={errorMessage}
            onRetry={handleNextQuestion}
            onReportError={() => setIsErrorReportOpen(true)}
          />
        )}

        {screen === 'results' && summary && (
          <ResultsScreen
            summary={summary}
            history={learnerState.history}
            onRestart={handleRestart}
            onOpenInspector={() => setIsInspectorOpen(true)}
            onReportError={() => setIsErrorReportOpen(true)}
          />
        )}
      </main>

      {/* Observable Agent Inspector Drawer */}
      <AgentInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        learnerState={learnerState}
        decisionLogs={decisionLogs}
      />

      {/* System Error Reporting Modal */}
      <ErrorReportModal
        isOpen={isErrorReportOpen}
        onClose={() => setIsErrorReportOpen(false)}
        currentStep={screen}
        diagnosticsData={{
          subject: learnerState.subject || 'Not specified',
          currentDifficulty: learnerState.currentDifficulty,
          questionNumber: learnerState.currentQuestionNumber,
          targetQuestionCount: learnerState.targetQuestionCount,
          streaks: `+${learnerState.consecutiveCorrect} / -${learnerState.consecutiveIncorrect}`,
          correctCount: learnerState.correctCount,
          incorrectCount: learnerState.incorrectCount,
          questionText: currentQuestion?.questionText,
          subtopic: currentQuestion?.subtopic,
          options: currentQuestion?.options?.map((o) => `${o.id}: ${o.text}`).join('; '),
          latestDecision: learnerState.latestDecision?.reason,
          systemError: errorMessage || undefined,
        }}
        onRetryAction={
          errorMessage
            ? () => {
                setErrorMessage(null);
                if (screen === 'quiz') handleNextQuestion();
              }
            : undefined
        }
      />
    </div>
  );
}
