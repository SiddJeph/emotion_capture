export type OceanTrait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'

export interface OceanQuestion {
  id: number
  text: string
  trait: OceanTrait
  reversed: boolean // Some questions are reverse-scored
}

export interface OceanAnswer {
  questionId: number
  score: number // 1-5 Likert scale
}

export interface OceanScores {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface OceanResult {
  scores: OceanScores
  dominantTrait: OceanTrait
  traitDescriptions: Record<OceanTrait, string>
}

// OCEAN trait descriptions
export const OCEAN_DESCRIPTIONS: Record<OceanTrait, { name: string; high: string; low: string; emoji: string; color: string }> = {
  openness: {
    name: 'Openness',
    high: 'Creative, curious, open to new experiences',
    low: 'Practical, conventional, prefers routine',
    emoji: '🎨',
    color: '#a78bfa', // purple
  },
  conscientiousness: {
    name: 'Conscientiousness',
    high: 'Organized, disciplined, goal-oriented',
    low: 'Flexible, spontaneous, adaptable',
    emoji: '📋',
    color: '#4ade80', // green
  },
  extraversion: {
    name: 'Extraversion',
    high: 'Outgoing, energetic, talkative',
    low: 'Reserved, reflective, enjoys solitude',
    emoji: '🎉',
    color: '#fcd34d', // yellow
  },
  agreeableness: {
    name: 'Agreeableness',
    high: 'Cooperative, trusting, helpful',
    low: 'Competitive, challenging, skeptical',
    emoji: '🤝',
    color: '#60a5fa', // blue
  },
  neuroticism: {
    name: 'Neuroticism',
    high: 'Emotionally sensitive, prone to stress',
    low: 'Emotionally stable, calm under pressure',
    emoji: '🌊',
    color: '#f472b6', // pink
  },
}

// Standard OCEAN questions (based on IPIP-NEO)
export const OCEAN_QUESTIONS: OceanQuestion[] = [
  // Openness (O)
  { id: 1, text: "I have a vivid imagination.", trait: 'openness', reversed: false },
  { id: 2, text: "I am interested in abstract ideas.", trait: 'openness', reversed: false },
  { id: 3, text: "I enjoy thinking about theoretical concepts.", trait: 'openness', reversed: false },
  { id: 4, text: "I prefer variety over routine.", trait: 'openness', reversed: false },
  { id: 5, text: "I enjoy artistic and creative experiences.", trait: 'openness', reversed: false },
  
  // Conscientiousness (C)
  { id: 6, text: "I am always prepared.", trait: 'conscientiousness', reversed: false },
  { id: 7, text: "I pay attention to details.", trait: 'conscientiousness', reversed: false },
  { id: 8, text: "I follow a schedule.", trait: 'conscientiousness', reversed: false },
  { id: 9, text: "I complete tasks successfully.", trait: 'conscientiousness', reversed: false },
  { id: 10, text: "I like order and organization.", trait: 'conscientiousness', reversed: false },
  
  // Extraversion (E)
  { id: 11, text: "I feel comfortable around people.", trait: 'extraversion', reversed: false },
  { id: 12, text: "I start conversations with strangers.", trait: 'extraversion', reversed: false },
  { id: 13, text: "I am the life of the party.", trait: 'extraversion', reversed: false },
  { id: 14, text: "I talk to a lot of different people at social gatherings.", trait: 'extraversion', reversed: false },
  { id: 15, text: "I don't mind being the center of attention.", trait: 'extraversion', reversed: false },
  
  // Agreeableness (A)
  { id: 16, text: "I am interested in other people's problems.", trait: 'agreeableness', reversed: false },
  { id: 17, text: "I feel others' emotions.", trait: 'agreeableness', reversed: false },
  { id: 18, text: "I make people feel at ease.", trait: 'agreeableness', reversed: false },
  { id: 19, text: "I take time out for others.", trait: 'agreeableness', reversed: false },
  { id: 20, text: "I sympathize with others' feelings.", trait: 'agreeableness', reversed: false },
  
  // Neuroticism (N)
  { id: 21, text: "I get stressed out easily.", trait: 'neuroticism', reversed: false },
  { id: 22, text: "I worry about things.", trait: 'neuroticism', reversed: false },
  { id: 23, text: "I am easily disturbed.", trait: 'neuroticism', reversed: false },
  { id: 24, text: "I get upset easily.", trait: 'neuroticism', reversed: false },
  { id: 25, text: "I change my mood a lot.", trait: 'neuroticism', reversed: false },
]

// Calculate OCEAN scores from answers
export function calculateOceanScores(answers: OceanAnswer[]): OceanScores {
  const traitScores: Record<OceanTrait, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: [],
  }

  answers.forEach(answer => {
    const question = OCEAN_QUESTIONS.find(q => q.id === answer.questionId)
    if (question) {
      // Handle reverse scoring
      const score = question.reversed ? (6 - answer.score) : answer.score
      traitScores[question.trait].push(score)
    }
  })

  // Calculate average for each trait (normalized to 0-100)
  const scores: OceanScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  }

  for (const trait of Object.keys(traitScores) as OceanTrait[]) {
    const traitAnswers = traitScores[trait]
    if (traitAnswers.length > 0) {
      const avg = traitAnswers.reduce((a, b) => a + b, 0) / traitAnswers.length
      scores[trait] = ((avg - 1) / 4) * 100 // Convert 1-5 scale to 0-100
    }
  }

  return scores
}

// Get dominant trait
export function getDominantTrait(scores: OceanScores): OceanTrait {
  let maxTrait: OceanTrait = 'openness'
  let maxScore = scores.openness

  for (const [trait, score] of Object.entries(scores) as [OceanTrait, number][]) {
    if (score > maxScore) {
      maxScore = score
      maxTrait = trait
    }
  }

  return maxTrait
}



