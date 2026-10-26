import {
  Difficulty,
  Question,
  AnswerEvaluation,
  QuizSummary,
  QuizHistoryItem,
  TopicVerificationResult,
} from '../types';

export interface GenerateQuestionResponse {
  question: Question;
  _gradingKey: {
    correctOptionId: string;
    explanation: string;
    subtopic?: string;
  };
}

export async function verifyTopicQuizzability(subject: string): Promise<TopicVerificationResult> {
  const res = await fetch('/api/quiz/verify-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to verify topic quizzability');
  }
  return res.json();
}

export async function validateSubject(subject: string): Promise<TopicVerificationResult> {
  return verifyTopicQuizzability(subject);
}

export async function generateQuestion(params: {
  subject: string;
  difficulty: Difficulty;
  questionNumber: number;
  totalQuestions: number;
  strugglingTopics: string[];
  masteredTopics: string[];
  previousQuestions: string[];
  focusArea?: string;
  verifiedSubtopics?: string[];
}): Promise<GenerateQuestionResponse> {
  const res = await fetch('/api/quiz/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate quiz question');
  }
  return res.json();
}

export async function evaluateAnswer(params: {
  subject: string;
  question: Question;
  selectedOptionId: string;
  gradingKey: {
    correctOptionId: string;
    explanation: string;
    subtopic?: string;
  };
  learnerComment?: string;
}): Promise<AnswerEvaluation> {
  const res = await fetch('/api/quiz/evaluate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate answer');
  }
  return res.json();
}

export async function generateSummary(params: {
  subject: string;
  history: QuizHistoryItem[];
  strugglingTopics: string[];
  masteredTopics: string[];
  startingDifficulty: Difficulty;
  finalDifficulty: Difficulty;
}): Promise<QuizSummary> {
  const res = await fetch('/api/quiz/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate summary');
  }
  return res.json();
}

export async function reportSystemError(params: {
  category: string;
  description: string;
  currentStep: string;
  diagnostics?: Record<string, any>;
}): Promise<{ success: boolean; reportId: string; timestamp: string; message: string }> {
  const res = await fetch('/api/report-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit error report');
  }
  return res.json();
}

