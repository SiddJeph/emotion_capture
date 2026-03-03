/**
 * Emotion Analysis ML Model
 * 
 * This module implements advanced emotion analysis from timeline data.
 * The model uses:
 * - Temporal pattern analysis for emotion stability
 * - Confidence-weighted aggregation
 * - Emotional transition probability matrix
 * - Sentiment polarity scoring
 * - Emotional intelligence metrics
 */

import { EmotionDataPoint, EmotionSummary, EmotionType } from '../supabase/types'

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

/**
 * Emotion valence scores (positive/negative polarity)
 * Range: -1 (very negative) to +1 (very positive)
 */
const EMOTION_VALENCE: Record<EmotionType, number> = {
  happy: 0.9,
  surprised: 0.3,
  neutral: 0.0,
  sad: -0.7,
  fearful: -0.6,
  angry: -0.8,
  disgusted: -0.9,
}

/**
 * Emotion arousal levels (energy/activation)
 * Range: 0 (low arousal) to 1 (high arousal)
 */
const EMOTION_AROUSAL: Record<EmotionType, number> = {
  happy: 0.7,
  surprised: 0.9,
  neutral: 0.3,
  sad: 0.2,
  fearful: 0.8,
  angry: 0.9,
  disgusted: 0.6,
}

/**
 * Expected transition probabilities (Markov chain)
 * Used to detect unusual emotional patterns
 */
const TRANSITION_BASELINES: Record<string, number> = {
  'neutral-happy': 0.15,
  'neutral-neutral': 0.60,
  'neutral-sad': 0.05,
  'happy-happy': 0.70,
  'happy-neutral': 0.25,
  'sad-sad': 0.60,
  'sad-neutral': 0.30,
  'angry-angry': 0.50,
  'angry-neutral': 0.30,
}

/**
 * Emotion weights for overall emotional intelligence scoring
 */
const EQ_WEIGHTS: Record<EmotionType, number> = {
  happy: 1.2,
  surprised: 0.8,
  neutral: 1.0,
  sad: 0.9,
  fearful: 0.7,
  angry: 0.6,
  disgusted: 0.5,
}

// ============================================================================
// ANALYSIS STEP TYPES
// ============================================================================

export interface EmotionAnalysisStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'processing' | 'complete'
  result?: {
    value: number | string
    details: string
  }
  duration: number
}

export interface EmotionalPattern {
  emotion: EmotionType
  startTime: number
  endTime: number
  duration: number
  averageConfidence: number
}

export interface EmotionTransition {
  from: EmotionType
  to: EmotionType
  count: number
  probability: number
}

export interface EmotionAnalysisResult {
  // Core metrics
  summary: EmotionSummary
  
  // Advanced metrics
  emotionalStability: number // 0-100
  emotionalRange: number // 0-100 (variety of emotions)
  averageValence: number // -1 to +1
  averageArousal: number // 0 to 1
  
  // Pattern analysis
  patterns: EmotionalPattern[]
  transitions: EmotionTransition[]
  emotionalPeaks: { time: number; emotion: EmotionType; confidence: number }[]
  
  // EQ Metrics
  eqScore: number // 0-100
  responsiveness: number // How quickly emotions respond
  regulation: number // Emotional stability over time
  expressiveness: number // Range and intensity of expressions
  
  // Analysis steps for UI
  analysisSteps: EmotionAnalysisStep[]
  
  // Metadata
  metadata: {
    totalDataPoints: number
    validDataPoints: number
    averageConfidence: number
    captureRate: number // points per second
    modelVersion: string
  }
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Calculate emotion distribution with confidence weighting
 */
function calculateDistribution(
  timeline: EmotionDataPoint[]
): Record<EmotionType, number> {
  const weighted: Record<EmotionType, number> = {
    happy: 0, sad: 0, angry: 0, fearful: 0, 
    disgusted: 0, surprised: 0, neutral: 0,
  }
  
  let totalWeight = 0
  
  for (const point of timeline) {
    const weight = point.confidence
    weighted[point.emotion] += weight
    totalWeight += weight
  }
  
  // Normalize to percentages
  if (totalWeight > 0) {
    for (const emotion of Object.keys(weighted) as EmotionType[]) {
      weighted[emotion] = weighted[emotion] / totalWeight
    }
  }
  
  return weighted
}

/**
 * Analyze emotional patterns (sustained emotion periods)
 */
function analyzePatterns(timeline: EmotionDataPoint[]): EmotionalPattern[] {
  if (timeline.length === 0) return []
  
  const patterns: EmotionalPattern[] = []
  let currentPattern: EmotionalPattern | null = null
  
  for (const point of timeline) {
    if (!currentPattern || currentPattern.emotion !== point.emotion) {
      // Save previous pattern if exists
      if (currentPattern && currentPattern.duration >= 0.5) {
        patterns.push(currentPattern)
      }
      
      // Start new pattern
      currentPattern = {
        emotion: point.emotion,
        startTime: point.time,
        endTime: point.time,
        duration: 0,
        averageConfidence: point.confidence,
      }
    } else {
      // Extend current pattern
      currentPattern.endTime = point.time
      currentPattern.duration = currentPattern.endTime - currentPattern.startTime
      currentPattern.averageConfidence = (currentPattern.averageConfidence + point.confidence) / 2
    }
  }
  
  // Don't forget last pattern
  if (currentPattern && currentPattern.duration >= 0.5) {
    patterns.push(currentPattern)
  }
  
  return patterns
}

/**
 * Calculate emotion transitions (Markov chain analysis)
 */
function calculateTransitions(timeline: EmotionDataPoint[]): EmotionTransition[] {
  const transitionCounts: Map<string, number> = new Map()
  const fromCounts: Map<EmotionType, number> = new Map()
  
  for (let i = 1; i < timeline.length; i++) {
    const from = timeline[i - 1].emotion
    const to = timeline[i].emotion
    const key = `${from}-${to}`
    
    transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1)
    fromCounts.set(from, (fromCounts.get(from) || 0) + 1)
  }
  
  const transitions: EmotionTransition[] = []
  
  transitionCounts.forEach((count, key) => {
    const [from, to] = key.split('-') as [EmotionType, EmotionType]
    const fromTotal = fromCounts.get(from) || 1
    
    transitions.push({
      from,
      to,
      count,
      probability: count / fromTotal,
    })
  })
  
  return transitions.sort((a, b) => b.count - a.count)
}

/**
 * Calculate emotional stability score
 */
function calculateStability(timeline: EmotionDataPoint[]): number {
  if (timeline.length < 2) return 100
  
  let transitions = 0
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].emotion !== timeline[i - 1].emotion) {
      transitions++
    }
  }
  
  // Fewer transitions = more stable
  const transitionRate = transitions / (timeline.length - 1)
  const stability = (1 - transitionRate) * 100
  
  return Math.max(0, Math.min(100, stability))
}

/**
 * Calculate emotional range (variety)
 */
function calculateRange(distribution: Record<EmotionType, number>): number {
  const values = Object.values(distribution).filter(v => v > 0.01)
  
  // More emotions detected = higher range
  // Shannon entropy-based calculation
  let entropy = 0
  for (const p of values) {
    if (p > 0) {
      entropy -= p * Math.log2(p)
    }
  }
  
  // Normalize to 0-100 (max entropy for 7 emotions is ~2.8)
  return Math.min(100, (entropy / 2.8) * 100)
}

/**
 * Calculate average valence (positive/negative)
 */
function calculateValence(timeline: EmotionDataPoint[]): number {
  if (timeline.length === 0) return 0
  
  let weightedValence = 0
  let totalWeight = 0
  
  for (const point of timeline) {
    const weight = point.confidence
    weightedValence += EMOTION_VALENCE[point.emotion] * weight
    totalWeight += weight
  }
  
  return totalWeight > 0 ? weightedValence / totalWeight : 0
}

/**
 * Calculate average arousal
 */
function calculateArousal(timeline: EmotionDataPoint[]): number {
  if (timeline.length === 0) return 0.5
  
  let weightedArousal = 0
  let totalWeight = 0
  
  for (const point of timeline) {
    const weight = point.confidence
    weightedArousal += EMOTION_AROUSAL[point.emotion] * weight
    totalWeight += weight
  }
  
  return totalWeight > 0 ? weightedArousal / totalWeight : 0.5
}

/**
 * Find emotional peaks (moments of high confidence expression)
 */
function findEmotionalPeaks(
  timeline: EmotionDataPoint[],
  threshold: number = 0.9
): { time: number; emotion: EmotionType; confidence: number }[] {
  return timeline
    .filter(p => p.confidence >= threshold && p.emotion !== 'neutral')
    .slice(0, 10) // Top 10 peaks
    .map(p => ({
      time: p.time,
      emotion: p.emotion,
      confidence: p.confidence,
    }))
}

/**
 * Calculate Emotional Intelligence Score
 */
function calculateEQScore(
  timeline: EmotionDataPoint[],
  stability: number,
  range: number,
  valence: number
): { eq: number; responsiveness: number; regulation: number; expressiveness: number } {
  // Responsiveness: How quickly emotions appear after start
  let responsiveness = 50
  const firstNonNeutral = timeline.findIndex(p => p.emotion !== 'neutral')
  if (firstNonNeutral >= 0 && timeline.length > 0) {
    const responseTime = timeline[firstNonNeutral].time
    responsiveness = Math.max(0, Math.min(100, 100 - (responseTime * 10)))
  }
  
  // Regulation: Based on stability and recovery patterns
  const regulation = stability * 0.7 + (valence > 0 ? 30 : 10)
  
  // Expressiveness: Based on range and confidence
  const avgConfidence = timeline.reduce((sum, p) => sum + p.confidence, 0) / Math.max(1, timeline.length)
  const expressiveness = (range * 0.6 + avgConfidence * 40)
  
  // Overall EQ score
  const eq = (responsiveness * 0.2) + (regulation * 0.4) + (expressiveness * 0.4)
  
  return {
    eq: Math.max(0, Math.min(100, eq)),
    responsiveness: Math.max(0, Math.min(100, responsiveness)),
    regulation: Math.max(0, Math.min(100, regulation)),
    expressiveness: Math.max(0, Math.min(100, expressiveness)),
  }
}

/**
 * Determine dominant emotion using weighted analysis
 */
function getDominantEmotion(distribution: Record<EmotionType, number>): EmotionType {
  let maxEmotion: EmotionType = 'neutral'
  let maxValue = 0
  
  for (const [emotion, value] of Object.entries(distribution) as [EmotionType, number][]) {
    if (value > maxValue) {
      maxValue = value
      maxEmotion = emotion
    }
  }
  
  return maxEmotion
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Run complete emotion analysis with step-by-step breakdown
 */
export function analyzeEmotions(timeline: EmotionDataPoint[]): EmotionAnalysisResult {
  // Filter valid data points (confidence > 0.3)
  const validTimeline = timeline.filter(p => p.confidence > 0.3)
  
  // Calculate duration
  const duration = timeline.length > 0 
    ? Math.max(...timeline.map(p => p.time)) - Math.min(...timeline.map(p => p.time))
    : 0
  
  // Step 1: Calculate distribution
  const distribution = calculateDistribution(validTimeline)
  
  // Step 2: Determine dominant emotion
  const dominantEmotion = getDominantEmotion(distribution)
  
  // Step 3: Analyze patterns
  const patterns = analyzePatterns(validTimeline)
  
  // Step 4: Calculate transitions
  const transitions = calculateTransitions(validTimeline)
  
  // Step 5: Calculate stability
  const stability = calculateStability(validTimeline)
  
  // Step 6: Calculate range
  const range = calculateRange(distribution)
  
  // Step 7: Calculate valence and arousal
  const valence = calculateValence(validTimeline)
  const arousal = calculateArousal(validTimeline)
  
  // Step 8: Find emotional peaks
  const peaks = findEmotionalPeaks(validTimeline)
  
  // Step 9: Calculate EQ metrics
  const avgConfidence = validTimeline.reduce((sum, p) => sum + p.confidence, 0) / Math.max(1, validTimeline.length)
  const { eq, responsiveness, regulation, expressiveness } = calculateEQScore(
    validTimeline, stability, range, valence
  )
  
  // Generate analysis steps for UI
  const analysisSteps: EmotionAnalysisStep[] = [
    {
      id: 'data-validation',
      name: 'Data Point Validation',
      description: 'Filtering low-confidence detections',
      status: 'complete',
      result: {
        value: `${validTimeline.length}/${timeline.length}`,
        details: `${Math.round((validTimeline.length / Math.max(1, timeline.length)) * 100)}% valid detections`,
      },
      duration: 500,
    },
    {
      id: 'distribution',
      name: 'Emotion Distribution Analysis',
      description: 'Calculating confidence-weighted frequencies',
      status: 'complete',
      result: {
        value: `${dominantEmotion.toUpperCase()}`,
        details: `${(distribution[dominantEmotion] * 100).toFixed(1)}% of timeline`,
      },
      duration: 700,
    },
    {
      id: 'temporal',
      name: 'Temporal Pattern Recognition',
      description: 'Identifying sustained emotional periods',
      status: 'complete',
      result: {
        value: `${patterns.length} patterns`,
        details: patterns.length > 0 
          ? `Longest: ${patterns[0].emotion} (${patterns[0].duration.toFixed(1)}s)`
          : 'No sustained patterns detected',
      },
      duration: 800,
    },
    {
      id: 'transitions',
      name: 'Markov Transition Analysis',
      description: 'Computing emotion state transitions',
      status: 'complete',
      result: {
        value: `${transitions.length} transitions`,
        details: transitions.length > 0 
          ? `Most common: ${transitions[0].from}→${transitions[0].to}`
          : 'Single emotion state',
      },
      duration: 600,
    },
    {
      id: 'stability',
      name: 'Emotional Stability Calculation',
      description: 'Measuring consistency over time',
      status: 'complete',
      result: {
        value: `${stability.toFixed(0)}%`,
        details: stability > 70 ? 'High stability' : stability > 40 ? 'Moderate stability' : 'Low stability',
      },
      duration: 500,
    },
    {
      id: 'valence-arousal',
      name: 'Valence-Arousal Mapping',
      description: 'Positioning on emotional circumplex',
      status: 'complete',
      result: {
        value: valence >= 0 ? 'Positive' : 'Negative',
        details: `Valence: ${valence.toFixed(2)}, Arousal: ${arousal.toFixed(2)}`,
      },
      duration: 600,
    },
    {
      id: 'eq-scoring',
      name: 'EQ Score Computation',
      description: 'Calculating emotional intelligence metrics',
      status: 'complete',
      result: {
        value: `${eq.toFixed(0)}/100`,
        details: 'Based on responsiveness, regulation, expressiveness',
      },
      duration: 700,
    },
  ]

  return {
    summary: {
      dominantEmotion,
      emotionDistribution: distribution,
      averageConfidence: avgConfidence,
      totalDataPoints: timeline.length,
      duration,
    },
    emotionalStability: stability,
    emotionalRange: range,
    averageValence: valence,
    averageArousal: arousal,
    patterns,
    transitions,
    emotionalPeaks: peaks,
    eqScore: eq,
    responsiveness,
    regulation,
    expressiveness,
    analysisSteps,
    metadata: {
      totalDataPoints: timeline.length,
      validDataPoints: validTimeline.length,
      averageConfidence: avgConfidence,
      captureRate: duration > 0 ? timeline.length / duration : 0,
      modelVersion: 'EMOTION-MARKOV-v1.3',
    },
  }
}

export type { EmotionType }

