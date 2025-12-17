import { questions } from './questions';

export interface DimensionScores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

/**
 * Calculate MBTI type from an array of answers (1-5 scale)
 * @param answers - Array of numbers from 1 (strongly disagree) to 5 (strongly agree)
 * @returns 4-letter MBTI type (e.g., 'INTJ', 'ENFP')
 */
export function calculateMBTI(answers: number[]): string {
  if (answers.length !== questions.length) {
    throw new Error(`Expected ${questions.length} answers, got ${answers.length}`);
  }

  const scores: DimensionScores = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  // Calculate scores for each dimension
  answers.forEach((answer, index) => {
    const question = questions[index];
    // Convert 1-5 scale to -2 to +2 scale, then apply weight
    const normalizedScore = (answer - 3) * question.weight;
    scores[question.dimension] += normalizedScore;
  });

  // Determine personality type based on scores
  const type = [
    scores.EI >= 0 ? 'E' : 'I',
    scores.SN >= 0 ? 'N' : 'S',
    scores.TF >= 0 ? 'T' : 'F',
    scores.JP >= 0 ? 'J' : 'P',
  ].join('');

  return type;
}

/**
 * Get detailed scores for each dimension
 * @param answers - Array of numbers from 1 to 5
 * @returns Object with scores for each dimension
 */
export function getDimensionScores(answers: number[]): DimensionScores {
  if (answers.length !== questions.length) {
    throw new Error(`Expected ${questions.length} answers, got ${answers.length}`);
  }

  const scores: DimensionScores = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  answers.forEach((answer, index) => {
    const question = questions[index];
    const normalizedScore = (answer - 3) * question.weight;
    scores[question.dimension] += normalizedScore;
  });

  return scores;
}
