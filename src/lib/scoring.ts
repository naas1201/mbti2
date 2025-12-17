import { questions } from './questions';

export { calculateMBTI, getDimensionScores, calculateAnswerVariance, getPersonalityDescription };
export type { DimensionScores, PersonalityDescription };

export interface DimensionScores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

export interface PersonalityDescription {
  type: string;
  fullType: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  relationships: string[];
  famousExamples: string[];
  percentage: number;
  isTurbulent: boolean;
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

  const scores = getDimensionScores(answers);

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
    // Enhanced scoring: weight * (answer - 3) * question complexity factor
    const complexityFactor = Math.abs(question.weight) > 1 ? 1.2 : 1.0;
    const normalizedScore = (answer - 3) * question.weight * complexityFactor;
    scores[question.dimension] += normalizedScore;
  });

  return scores;
}

/**
 * Calculate variance of answers to determine turbulent/assertive
 * @param answers - Array of numbers from 1 to 5
 * @returns Variance score (higher = more turbulent)
 */
export function calculateAnswerVariance(answers: number[]): number {
  if (answers.length === 0) return 0;
  
  const mean = answers.reduce((sum, val) => sum + val, 0) / answers.length;
  const variance = answers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / answers.length;
  
  return variance;
}

/**
 * Get comprehensive personality description
 * @param fullType - Full MBTI type including -T or -A (e.g., 'INFJ-T')
 * @param scores - Dimension scores
 * @returns Detailed personality description
 */
export function getPersonalityDescription(fullType: string, scores: DimensionScores): PersonalityDescription {
  const baseType = fullType.replace(/[-][TA]$/, '');
  const isTurbulent = fullType.endsWith('-T');
  
  // Calculate percentage confidence for each dimension
  const maxScorePerDimension = 20; // Maximum possible score per dimension
  const percentages = {
    EI: Math.min(100, Math.max(0, (Math.abs(scores.EI) / maxScorePerDimension) * 100)),
    SN: Math.min(100, Math.max(0, (Math.abs(scores.SN) / maxScorePerDimension) * 100)),
    TF: Math.min(100, Math.max(0, (Math.abs(scores.TF) / maxScorePerDimension) * 100)),
    JP: Math.min(100, Math.max(0, (Math.abs(scores.JP) / maxScorePerDimension) * 100)),
  };
  
  const overallPercentage = Math.round(
    (percentages.EI + percentages.SN + percentages.TF + percentages.JP) / 4
  );

  // Personality descriptions database
  const descriptions: Record<string, PersonalityDescription> = {
    'INTJ': {
      type: 'INTJ',
      fullType: fullType,
      summary: 'The Architect - Strategic, logical, and independent thinkers who excel at turning visions into reality.',
      strengths: ['Strategic thinking', 'Determination', 'Independence', 'High standards'],
      weaknesses: ['Overly critical', 'Socially awkward', 'Perfectionistic', 'Arrogant'],
      careers: ['Scientist', 'Engineer', 'Professor', 'Judge', 'Strategic Planner'],
      relationships: ['Value intellectual connection', 'Loyal but private', 'Need personal space'],
      famousExamples: ['Elon Musk', 'Michelle Obama', 'Christopher Nolan', 'Ruth Bader Ginsburg'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'INTP': {
      type: 'INTP',
      fullType: fullType,
      summary: 'The Logician - Innovative inventors with an unquenchable thirst for knowledge.',
      strengths: ['Analytical', 'Original', 'Open-minded', 'Objective'],
      weaknesses: ['Insensitive', 'Absent-minded', 'Condescending', 'Procrastinates'],
      careers: ['Researcher', 'Programmer', 'Philosopher', 'Architect'],
      relationships: ['Value intellectual freedom', 'Respect independence', 'Need mental stimulation'],
      famousExamples: ['Albert Einstein', 'Bill Gates', 'Socrates', 'Marie Curie'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ENTJ': {
      type: 'ENTJ',
      fullType: fullType,
      summary: 'The Commander - Bold, imaginative, and strong-willed leaders who find or create solutions.',
      strengths: ['Efficient', 'Energetic', 'Self-confident', 'Strong-willed'],
      weaknesses: ['Stubborn', 'Intolerant', 'Impatient', 'Arrogant'],
      careers: ['CEO', 'Entrepreneur', 'Lawyer', 'Politician'],
      relationships: ['Direct communicators', 'Value competence', 'Expect loyalty'],
      famousExamples: ['Steve Jobs', 'Margaret Thatcher', 'Gordon Ramsay', 'Franklin D. Roosevelt'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ENTP': {
      type: 'ENTP',
      fullType: fullType,
      summary: 'The Debater - Smart and curious thinkers who cannot resist an intellectual challenge.',
      strengths: ['Knowledgeable', 'Quick-witted', 'Original', 'Excellent brainstormer'],
      weaknesses: ['Argumentative', 'Insensitive', 'Intolerant', 'Can find it hard to focus'],
      careers: ['Entrepreneur', 'Lawyer', 'Journalist', 'Marketing Director'],
      relationships: ['Enjoy debates', 'Value intellectual growth', 'Need freedom'],
      famousExamples: ['Thomas Edison', 'Mark Twain', 'Leonardo da Vinci', 'Walt Disney'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'INFJ': {
      type: 'INFJ',
      fullType: fullType,
      summary: 'The Advocate - Quiet and mystical, yet very inspiring and tireless idealists.',
      strengths: ['Creative', 'Insightful', 'Principled', 'Passionate'],
      weaknesses: ['Sensitive to criticism', 'Reluctant to open up', 'Perfectionistic', 'Can burn out easily'],
      careers: ['Counselor', 'Writer', 'Psychologist', 'Human Resources'],
      relationships: ['Deep connections', 'Empathetic', 'Value authenticity'],
      famousExamples: ['Nelson Mandela', 'Mother Teresa', 'Carl Jung', 'Martin Luther King Jr.'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'INFP': {
      type: 'INFP',
      fullType: fullType,
      summary: 'The Mediator - Poetic, kind, and altruistic people, always eager to help a good cause.',
      strengths: ['Empathetic', 'Creative', 'Idealistic', 'Open-minded'],
      weaknesses: ['Unrealistic', 'Self-isolating', 'Unfocused', 'Emotionally vulnerable'],
      careers: ['Writer', 'Artist', 'Psychologist', 'Social Worker'],
      relationships: ['Value deep meaning', 'Loyal', 'Need emotional connection'],
      famousExamples: ['William Shakespeare', 'J.R.R. Tolkien', 'Princess Diana', 'John Lennon'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ENFJ': {
      type: 'ENFJ',
      fullType: fullType,
      summary: 'The Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners.',
      strengths: ['Tolerant', 'Reliable', 'Charismatic', 'Altruistic'],
      weaknesses: ['Overly idealistic', 'Too selfless', 'Fluctuating self-esteem', 'Struggle with criticism'],
      careers: ['Teacher', 'Consultant', 'Politician', 'Event Planner'],
      relationships: ['Supportive', 'Encouraging', 'Value harmony'],
      famousExamples: ['Barack Obama', 'Oprah Winfrey', 'Martin Luther King Jr.', 'John F. Kennedy'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ENFP': {
      type: 'ENFP',
      fullType: fullType,
      summary: 'The Campaigner - Enthusiastic, creative, and sociable free spirits who can always find a reason to smile.',
      strengths: ['Curious', 'Observant', 'Energetic', 'Excellent communicator'],
      weaknesses: ['Poor practical skills', 'Easily stressed', 'Overly emotional', 'Difficulty focusing'],
      careers: ['Journalist', 'Actor', 'Consultant', 'Entrepreneur'],
      relationships: ['Enthusiastic', 'Supportive', 'Value authenticity'],
      famousExamples: ['Robin Williams', 'Ellen DeGeneres', 'Walt Disney', 'Mark Twain'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ISTJ': {
      type: 'ISTJ',
      fullType: fullType,
      summary: 'The Logistician - Practical and fact-minded individuals, whose reliability cannot be doubted.',
      strengths: ['Honest', 'Direct', 'Strong-willed', 'Very responsible'],
      weaknesses: ['Stubborn', 'Insensitive', 'Always by the book', 'Judgmental'],
      careers: ['Accountant', 'Banker', 'Judge', 'Military Officer'],
      relationships: ['Loyal', 'Reliable', 'Value tradition'],
      famousExamples: ['Queen Elizabeth II', 'George Washington', 'Warren Buffett', 'Jeff Bezos'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ISFJ': {
      type: 'ISFJ',
      fullType: fullType,
      summary: 'The Defender - Very dedicated and warm protectors, always ready to defend their loved ones.',
      strengths: ['Supportive', 'Reliable', 'Patient', 'Practical'],
      weaknesses: ['Shy', 'Take things too personally', 'Reluctant to change', 'Overload themselves'],
      careers: ['Nurse', 'Teacher', 'Librarian', 'Social Worker'],
      relationships: ['Caring', 'Loyal', 'Value stability'],
      famousExamples: ['Mother Teresa', 'Rosa Parks', 'Kate Middleton', 'Dr. Watson (Sherlock Holmes)'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ESTJ': {
      type: 'ESTJ',
      fullType: fullType,
      summary: 'The Executive - Excellent administrators, unsurpassed at managing things or people.',
      strengths: ['Dedicated', 'Strong-willed', 'Direct', 'Loyal'],
      weaknesses: ['Inflexible', 'Stubborn', 'Judgmental', 'Difficulty relaxing'],
      careers: ['Manager', 'Police Officer', 'Judge', 'Teacher'],
      relationships: ['Traditional', 'Reliable', 'Value commitment'],
      famousExamples: ['Judge Judy', 'Lyndon B. Johnson', 'Frank Sinatra', 'John D. Rockefeller'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ESFJ': {
      type: 'ESFJ',
      fullType: fullType,
      summary: 'The Consul - Extraordinarily caring, social, and popular people, always eager to help.',
      strengths: ['Practical', 'Caring', 'Sociable', 'Popular'],
      weaknesses: ['Inflexible', 'Uncomfortable with change', 'Worry too much', 'Too needy'],
      careers: ['Nurse', 'Teacher', 'Social Worker', 'Event Planner'],
      relationships: ['Supportive', 'Loyal', 'Value harmony'],
      famousExamples: ['Bill Clinton', 'Taylor Swift', 'Steve Harvey', 'Jennifer Garner'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ISTP': {
      type: 'ISTP',
      fullType: fullType,
      summary: 'The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.',
      strengths: ['Optimistic', 'Energetic', 'Creative', 'Practical'],
      weaknesses: ['Stubborn', 'Insensitive', 'Private', 'Easily bored'],
      careers: ['Mechanic', 'Engineer', 'Pilot', 'Athlete'],
      relationships: ['Independent', 'Spontaneous', 'Value freedom'],
      famousExamples: ['Bruce Lee', 'Amelia Earhart', 'Clint Eastwood', 'Michael Jordan'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ISFP': {
      type: 'ISFP',
      fullType: fullType,
      summary: 'The Adventurer - Flexible and charming artists, always ready to explore and experience something new.',
      strengths: ['Charming', 'Sensitive to others', 'Imaginative', 'Passionate'],
      weaknesses: ['Fiercely independent', 'Unpredictable', 'Easily stressed', 'Overly competitive'],
      careers: ['Artist', 'Designer', 'Musician', 'Veterinarian'],
      relationships: ['Caring', 'Spontaneous', 'Value authenticity'],
      famousExamples: ['Michael Jackson', 'Freddie Mercury', 'Bob Dylan', 'Marilyn Monroe'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ESTP': {
      type: 'ESTP',
      fullType: fullType,
      summary: 'The Entrepreneur - Smart, energetic, and very perceptive people who truly enjoy living on the edge.',
      strengths: ['Bold', 'Practical', 'Original', 'Direct'],
      weaknesses: ['Impatient', 'Risk-prone', 'Unstructured', 'May miss the bigger picture'],
      careers: ['Entrepreneur', 'Salesperson', 'Police Officer', 'Athlete'],
      relationships: ['Spontaneous', 'Fun-loving', 'Value excitement'],
      famousExamples: ['Ernest Hemingway', 'Madonna', 'Donald Trump', 'Winston Churchill'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    },
    'ESFP': {
      type: 'ESFP',
      fullType: fullType,
      summary: 'The Entertainer - Spontaneous, energetic, and enthusiastic people who love life, people, and material comforts.',
      strengths: ['Bold', 'Original', 'Practical', 'Observant'],
      weaknesses: ['Sensitive', 'Conflict-averse', 'Easily bored', 'Poor long-term planners'],
      careers: ['Actor', 'Salesperson', 'Event Planner', 'Tour Guide'],
      relationships: ['Enthusiastic', 'Supportive', 'Value fun'],
      famousExamples: ['Elvis Presley', 'Marilyn Monroe', 'Jamie Oliver', 'Will Smith'],
      percentage: overallPercentage,
      isTurbulent: isTurbulent
    }
  };

  // Return the description or a default one
  return descriptions[baseType] || {
    type: baseType,
    fullType: fullType,
    summary: `The ${baseType} - A unique personality type with balanced characteristics.`,
    strengths: ['Adaptable', 'Balanced', 'Open-minded'],
    weaknesses: ['May lack extreme strengths', 'Can be indecisive'],
    careers: ['Various fields depending on interests'],
    relationships: ['Value connection and understanding'],
    famousExamples: ['Various successful individuals'],
    percentage: overallPercentage,
    isTurbulent: isTurbulent
  };
}
