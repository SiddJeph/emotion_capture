import { OceanScores, OceanTrait } from '../ocean/types'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'remote'
  salary: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  // OCEAN trait requirements for matching
  idealTraits: {
    trait: OceanTrait
    weight: number // 0-1, how important this trait is
    minScore: number // minimum score needed (0-100)
  }[]
  tags: string[]
  postedAt: string
  deadline: string
  logo?: string
}

export type ApplicationStatus = 
  | 'applied' 
  | 'assessment_pending' 
  | 'assessment_completed'
  | 'under_review'
  | 'selected'
  | 'rejected'
  | 'withdrawn'

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: ApplicationStatus
  appliedAt: string
  assessmentId?: string // Links to assessment result
  matchScore?: number // Calculated match percentage
  notes?: string
}

export interface JobMatch {
  job: Job
  matchScore: number
  matchingTraits: {
    trait: OceanTrait
    userScore: number
    requiredScore: number
    matched: boolean
  }[]
}

// Calculate job match score based on OCEAN scores
export function calculateJobMatch(job: Job, oceanScores: OceanScores | null): number {
  if (!oceanScores || job.idealTraits.length === 0) {
    return 50 // Default neutral match if no scores
  }

  let totalWeight = 0
  let weightedScore = 0

  for (const requirement of job.idealTraits) {
    const userScore = oceanScores[requirement.trait]
    const weight = requirement.weight
    totalWeight += weight

    // Calculate how well user matches this trait requirement
    if (userScore >= requirement.minScore) {
      // Full match or better
      weightedScore += weight * 100
    } else {
      // Partial match - scale based on how close they are
      const ratio = userScore / requirement.minScore
      weightedScore += weight * ratio * 100
    }
  }

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50
}

// Get matching trait details
export function getMatchingTraits(job: Job, oceanScores: OceanScores | null): JobMatch['matchingTraits'] {
  if (!oceanScores) return []

  return job.idealTraits.map(req => ({
    trait: req.trait,
    userScore: Math.round(oceanScores[req.trait]),
    requiredScore: req.minScore,
    matched: oceanScores[req.trait] >= req.minScore
  }))
}

// Status display info
export const STATUS_INFO: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  applied: { label: 'Applied', color: '#60a5fa', icon: '📝' },
  assessment_pending: { label: 'Assessment Required', color: '#fcd34d', icon: '⏳' },
  assessment_completed: { label: 'Assessment Done', color: '#4ade80', icon: '✅' },
  under_review: { label: 'Under Review', color: '#a78bfa', icon: '👀' },
  selected: { label: 'Selected', color: '#22c55e', icon: '🎉' },
  rejected: { label: 'Not Selected', color: '#f87171', icon: '❌' },
  withdrawn: { label: 'Withdrawn', color: '#94a3b8', icon: '↩️' },
}

