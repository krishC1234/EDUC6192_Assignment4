import { Difficulty, AdaptationDecision, LearnerState, AnswerEvaluation } from '../types';

export const DIFFICULTY_LEVELS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function getDifficultyIndex(diff: Difficulty): number {
  return DIFFICULTY_LEVELS.indexOf(diff);
}

export function formatDifficulty(diff: Difficulty): string {
  switch (diff) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
  }
}

/**
 * Pure function executing the educational agent's adaptation decision logic.
 * Follows Rule 5:
 * - 2 consecutive correct -> increase difficulty by 1 (max 'advanced'), reset streak counter
 * - 2 consecutive incorrect -> decrease difficulty by 1 (min 'beginner'), reset streak counter
 * - otherwise maintain current difficulty
 * - streak resets when broken
 */
export function computeNextAdaptation(
  currentState: Pick<LearnerState, 'currentDifficulty' | 'consecutiveCorrect' | 'consecutiveIncorrect' | 'strugglingTopics'>,
  evaluation: AnswerEvaluation
): {
  decision: AdaptationDecision;
  nextConsecutiveCorrect: number;
  nextConsecutiveIncorrect: number;
  nextDifficulty: Difficulty;
  targetedFocusArea?: string;
} {
  const currentDiff = currentState.currentDifficulty;
  const currentDiffIdx = getDifficultyIndex(currentDiff);

  let newConsecutiveCorrect = 0;
  let newConsecutiveIncorrect = 0;
  let nextDifficulty = currentDiff;
  let action: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let reason = '';

  if (evaluation.isCorrect) {
    newConsecutiveCorrect = currentState.consecutiveCorrect + 1;
    newConsecutiveIncorrect = 0;

    if (newConsecutiveCorrect >= 2) {
      if (currentDiffIdx < DIFFICULTY_LEVELS.length - 1) {
        nextDifficulty = DIFFICULTY_LEVELS[currentDiffIdx + 1];
        action = 'increase';
        reason = `Difficulty increased from ${formatDifficulty(currentDiff)} to ${formatDifficulty(nextDifficulty)}: Demonstrated strong mastery with 2 consecutive correct answers.`;
        newConsecutiveCorrect = 0; // Reset streak counter after leveling up
      } else {
        nextDifficulty = currentDiff;
        action = 'maintain';
        reason = `Difficulty maintained at ${formatDifficulty(currentDiff)}: Outstanding performance! Already at maximum difficulty level.`;
      }
    } else {
      action = 'maintain';
      reason = `Difficulty maintained at ${formatDifficulty(currentDiff)}: 1 correct answer logged (2 consecutive needed to increase difficulty).`;
    }
  } else {
    newConsecutiveIncorrect = currentState.consecutiveIncorrect + 1;
    newConsecutiveCorrect = 0;

    if (newConsecutiveIncorrect >= 2) {
      if (currentDiffIdx > 0) {
        nextDifficulty = DIFFICULTY_LEVELS[currentDiffIdx - 1];
        action = 'decrease';
        reason = `Difficulty decreased from ${formatDifficulty(currentDiff)} to ${formatDifficulty(nextDifficulty)}: 2 consecutive incorrect answers. Stepping down to reinforce foundational understanding.`;
        newConsecutiveIncorrect = 0; // Reset streak counter after leveling down
      } else {
        nextDifficulty = currentDiff;
        action = 'maintain';
        reason = `Difficulty maintained at ${formatDifficulty(currentDiff)}: Already at the foundation level. Focusing on constructive explanations and core concepts.`;
      }
    } else {
      action = 'maintain';
      reason = `Difficulty maintained at ${formatDifficulty(currentDiff)}: 1 incorrect answer logged (2 consecutive needed to trigger a step-down).`;
    }
  }

  // Choose a targeted focus area if the learner is struggling with any concept
  let targetedFocusArea: string | undefined = undefined;
  if (!evaluation.isCorrect && evaluation.strugglingConcept) {
    targetedFocusArea = evaluation.strugglingConcept;
  } else if (currentState.strugglingTopics.length > 0 && Math.random() > 0.3) {
    // 70% chance to revisit a recent struggling concept for reinforcement
    targetedFocusArea = currentState.strugglingTopics[currentState.strugglingTopics.length - 1];
  }

  const decision: AdaptationDecision = {
    action,
    previousDifficulty: currentDiff,
    nextDifficulty,
    reason,
    consecutiveCorrect: newConsecutiveCorrect,
    consecutiveIncorrect: newConsecutiveIncorrect,
    focusArea: targetedFocusArea,
  };

  return {
    decision,
    nextConsecutiveCorrect: newConsecutiveCorrect,
    nextConsecutiveIncorrect: newConsecutiveIncorrect,
    nextDifficulty,
    targetedFocusArea,
  };
}
