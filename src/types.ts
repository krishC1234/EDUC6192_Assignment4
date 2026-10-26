export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  subtopic: string;
  targetDifficulty: Difficulty;
  pedagogicalIntent: string;
  hint?: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  conceptTested: string;
  strugglingConcept?: string;
  masteredConcept?: string;
  isAmbiguous?: boolean;
  ambiguityNote?: string;
  noteFeedback?: string;
}

export interface AdaptationDecision {
  action: 'increase' | 'decrease' | 'maintain';
  previousDifficulty: Difficulty;
  nextDifficulty: Difficulty;
  reason: string;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  focusArea?: string;
}

export interface QuizHistoryItem {
  questionNumber: number;
  question: Question;
  selectedOptionId: string;
  learnerNote?: string;
  evaluation: AnswerEvaluation;
  difficultyBefore: Difficulty;
  difficultyAfter: Difficulty;
  adaptationDecision: AdaptationDecision;
  timestamp: number;
}

export interface LearnerState {
  subject: string;
  targetQuestionCount: number;
  currentDifficulty: Difficulty;
  currentQuestionNumber: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  strugglingTopics: string[];
  masteredTopics: string[];
  history: QuizHistoryItem[];
  latestDecision?: AdaptationDecision;
  verifiedSubtopics?: string[];
  topicVerification?: TopicVerificationResult;
}

export interface TopicVerificationResult {
  isValid: boolean;
  isQuizzable: boolean;
  isNicheEnough: boolean;
  normalizedTopic: string;
  quizzabilityScore: number; // 0 to 100
  thresholdRequired?: number; // e.g. 80
  specificityLevel: 'too_broad' | 'optimal_niche' | 'too_shallow' | 'unquizzable';
  assessmentSummary: string;
  detectedSubtopics: string[];
  suggestedRefinements: string[];
  pedagogicalScope?: string;
  message?: string;
}

export interface QuizSummary {
  subject: string;
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  startingDifficulty: Difficulty;
  finalDifficulty: Difficulty;
  difficultyTrajectory: {
    questionNumber: number;
    difficulty: Difficulty;
    isCorrect: boolean;
    subtopic: string;
  }[];
  strengthsSummary: string;
  strugglingAreas: string[];
  observedPatterns: string;
  studyRecommendations: string[];
  masteryCaveat: string;
}

export interface AgentDecisionLog {
  id: string;
  stepNumber: number;
  timestamp: string;
  phase: 'verify_topic' | 'generate' | 'evaluate' | 'adapt' | 'finalize';
  title: string;
  details: string;
  metrics: {
    difficulty: Difficulty;
    streak: string;
    score: string;
  };
  learnerNote?: string;
}

export type ErrorReportCategory =
  | 'ai_generation'
  | 'grading_dispute'
  | 'adaptation_logic'
  | 'ui_crash'
  | 'performance'
  | 'other';

export interface SystemErrorReport {
  reportId: string;
  category: ErrorReportCategory;
  description: string;
  currentStep: string;
  diagnostics: Record<string, any>;
  timestamp: string;
}

