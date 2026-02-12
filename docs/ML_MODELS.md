# 🧠 ML Models Documentation

## Deep Dive: Emotion Analysis & Personality Scoring Algorithms

This document provides a comprehensive explanation of the machine learning models used in the AI Emotional Intelligence Assessment Platform. It covers the mathematical foundations, algorithms, and scoring methodologies.

---

## 📁 File Structure

```
src/lib/ml/
├── emotion-model.ts      # Emotion analysis & EQ scoring
└── personality-model.ts  # OCEAN personality scoring
```

---

# Part 1: Emotion Analysis Model

**File**: `emotion-model.ts`  
**Model Version**: `EMOTION-MARKOV-v1.3`

## Overview

The Emotion Analysis Model processes time-series data from facial expression detection (captured via face-api.js) and computes various emotional intelligence metrics.

```
Input: Timeline of emotion data points
       ↓
┌─────────────────────────────────────┐
│  1. Data Validation & Filtering    │
│  2. Distribution Analysis           │
│  3. Temporal Pattern Recognition    │
│  4. Markov Transition Analysis      │
│  5. Stability Calculation           │
│  6. Valence-Arousal Mapping         │
│  7. EQ Score Computation            │
└─────────────────────────────────────┘
       ↓
Output: EmotionAnalysisResult
```

---

## 1. Input Data Structure

Each data point captured during the assessment:

```typescript
interface EmotionDataPoint {
  time: number           // Video timestamp (seconds)
  emotion: EmotionType   // Detected emotion
  confidence: number     // Detection confidence (0-1)
  expressions: {         // Raw scores for all 7 emotions
    happy: number
    sad: number
    angry: number
    fearful: number
    disgusted: number
    surprised: number
    neutral: number
  }
}
```

**Capture Rate**: 5 samples/second (every 200ms)  
**Typical Assessment**: 30-60 seconds → 150-300 data points

---

## 2. Emotion Classification

### 2.1 Seven Basic Emotions

The model recognizes 7 universal emotions based on Ekman's research:

| Emotion | Valence | Arousal | EQ Weight |
|---------|---------|---------|-----------|
| 😊 Happy | +0.9 | 0.7 | 1.2 |
| 😲 Surprised | +0.3 | 0.9 | 0.8 |
| 😐 Neutral | 0.0 | 0.3 | 1.0 |
| 😢 Sad | -0.7 | 0.2 | 0.9 |
| 😨 Fearful | -0.6 | 0.8 | 0.7 |
| 😠 Angry | -0.8 | 0.9 | 0.6 |
| 🤢 Disgusted | -0.9 | 0.6 | 0.5 |

### 2.2 Valence-Arousal Model (Circumplex)

Emotions are mapped to a 2D space:

```
        High Arousal
             │
    Angry ●  │  ● Surprised
             │       ● Happy
   ──────────┼─────────────
             │
   Sad ●     │   ● Neutral
             │
        Low Arousal
   Negative ←─→ Positive
        Valence
```

**Valence**: Emotional polarity (-1 to +1)  
**Arousal**: Energy/activation level (0 to 1)

---

## 3. Scoring Algorithms

### 3.1 Confidence-Weighted Distribution

The dominant emotion is calculated using confidence weighting:

```typescript
function calculateDistribution(timeline: EmotionDataPoint[]): Record<EmotionType, number> {
  const weighted = { happy: 0, sad: 0, angry: 0, ... }
  let totalWeight = 0
  
  for (const point of timeline) {
    const weight = point.confidence  // Higher confidence = more weight
    weighted[point.emotion] += weight
    totalWeight += weight
  }
  
  // Normalize to percentages (sum = 1.0)
  for (const emotion of Object.keys(weighted)) {
    weighted[emotion] = weighted[emotion] / totalWeight
  }
  
  return weighted
}
```

**Example**:
```
Timeline: [
  { emotion: 'happy', confidence: 0.9 },
  { emotion: 'happy', confidence: 0.8 },
  { emotion: 'neutral', confidence: 0.7 },
]

Weighted sums:
  happy: 0.9 + 0.8 = 1.7
  neutral: 0.7
  Total: 2.4

Distribution:
  happy: 1.7/2.4 = 70.8%
  neutral: 0.7/2.4 = 29.2%
```

---

### 3.2 Emotional Stability Score

Measures how consistent emotions are over time:

```typescript
function calculateStability(timeline: EmotionDataPoint[]): number {
  let transitions = 0
  
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].emotion !== timeline[i-1].emotion) {
      transitions++
    }
  }
  
  const transitionRate = transitions / (timeline.length - 1)
  const stability = (1 - transitionRate) * 100
  
  return stability  // 0-100 scale
}
```

**Interpretation**:
- **90-100%**: Very stable (same emotion throughout)
- **70-89%**: Stable (few transitions)
- **40-69%**: Moderate (regular transitions)
- **0-39%**: Unstable (frequent emotion changes)

**Visual Example**:
```
Timeline A (High Stability = 90%):
  😐 → 😐 → 😐 → 😊 → 😊 → 😊 → 😊 → 😊 → 😊 → 😊
  (1 transition out of 9 possible)

Timeline B (Low Stability = 44%):
  😐 → 😊 → 😐 → 😢 → 😐 → 😊 → 😐 → 😢 → 😊 → 😐
  (5 transitions out of 9 possible)
```

---

### 3.3 Emotional Range (Shannon Entropy)

Measures the variety of emotions expressed:

```typescript
function calculateRange(distribution: Record<EmotionType, number>): number {
  const values = Object.values(distribution).filter(v => v > 0.01)
  
  // Shannon entropy calculation
  let entropy = 0
  for (const p of values) {
    if (p > 0) {
      entropy -= p * Math.log2(p)
    }
  }
  
  // Normalize to 0-100 (max entropy for 7 emotions ≈ 2.8)
  return Math.min(100, (entropy / 2.8) * 100)
}
```

**Shannon Entropy Formula**:
```
H = -Σ p(x) × log₂(p(x))
```

Where `p(x)` is the probability of each emotion.

**Examples**:
```
Distribution A (Low Range):
  neutral: 95%, happy: 5%
  H = -(0.95 × log₂(0.95) + 0.05 × log₂(0.05))
  H = -(0.95 × -0.074 + 0.05 × -4.32)
  H = 0.286
  Range = (0.286 / 2.8) × 100 = 10.2%

Distribution B (High Range):
  happy: 25%, neutral: 25%, sad: 20%, surprised: 15%, angry: 15%
  H = 2.21
  Range = (2.21 / 2.8) × 100 = 78.9%
```

---

### 3.4 Markov Transition Analysis

Tracks emotion state transitions using a first-order Markov model:

```typescript
function calculateTransitions(timeline: EmotionDataPoint[]): EmotionTransition[] {
  const transitionCounts = new Map<string, number>()
  const fromCounts = new Map<EmotionType, number>()
  
  for (let i = 1; i < timeline.length; i++) {
    const from = timeline[i - 1].emotion
    const to = timeline[i].emotion
    const key = `${from}-${to}`
    
    transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1)
    fromCounts.set(from, (fromCounts.get(from) || 0) + 1)
  }
  
  // Calculate probabilities
  const transitions = []
  transitionCounts.forEach((count, key) => {
    const [from, to] = key.split('-')
    const probability = count / fromCounts.get(from)
    transitions.push({ from, to, count, probability })
  })
  
  return transitions.sort((a, b) => b.count - a.count)
}
```

**Transition Matrix Example**:
```
           To:
From:    Happy  Neutral  Sad
Happy     0.70    0.25   0.05
Neutral   0.15    0.60   0.25
Sad       0.10    0.30   0.60
```

This shows:
- 70% chance of staying happy if currently happy
- 15% chance of becoming happy from neutral
- 60% chance of staying sad if currently sad

---

### 3.5 EQ (Emotional Intelligence) Score

Composite score combining multiple factors:

```typescript
function calculateEQScore(timeline, stability, range, valence) {
  // 1. Responsiveness: How quickly emotions appear
  const firstNonNeutral = timeline.findIndex(p => p.emotion !== 'neutral')
  const responseTime = timeline[firstNonNeutral]?.time || 10
  const responsiveness = Math.max(0, 100 - (responseTime * 10))
  
  // 2. Regulation: Stability + positive recovery
  const regulation = stability * 0.7 + (valence > 0 ? 30 : 10)
  
  // 3. Expressiveness: Range + confidence
  const avgConfidence = average(timeline.map(p => p.confidence))
  const expressiveness = (range * 0.6) + (avgConfidence * 40)
  
  // 4. Weighted EQ Score
  const eq = (responsiveness * 0.2) + (regulation * 0.4) + (expressiveness * 0.4)
  
  return { eq, responsiveness, regulation, expressiveness }
}
```

**EQ Components**:

| Component | Weight | Description |
|-----------|--------|-------------|
| Responsiveness | 20% | Speed of emotional response |
| Regulation | 40% | Emotional stability + positive valence |
| Expressiveness | 40% | Emotional range + detection confidence |

**Formula**:
```
EQ = 0.2×Responsiveness + 0.4×Regulation + 0.4×Expressiveness
```

---

### 3.6 Valence & Arousal Calculation

Weighted average based on the valence/arousal tables:

```typescript
function calculateValence(timeline: EmotionDataPoint[]): number {
  let weightedValence = 0
  let totalWeight = 0
  
  for (const point of timeline) {
    const weight = point.confidence
    weightedValence += EMOTION_VALENCE[point.emotion] * weight
    totalWeight += weight
  }
  
  return weightedValence / totalWeight  // Range: -1 to +1
}
```

**Example**:
```
Timeline: [
  { emotion: 'happy', confidence: 0.9 },    // valence: +0.9
  { emotion: 'neutral', confidence: 0.7 },  // valence: 0.0
  { emotion: 'sad', confidence: 0.8 },      // valence: -0.7
]

Weighted Valence = (0.9×0.9 + 0.7×0.0 + 0.8×(-0.7)) / (0.9 + 0.7 + 0.8)
                 = (0.81 + 0 - 0.56) / 2.4
                 = 0.104 (Slightly Positive)
```

---

## 4. Output Structure

```typescript
interface EmotionAnalysisResult {
  // Core metrics
  summary: {
    dominantEmotion: EmotionType
    emotionDistribution: Record<EmotionType, number>
    averageConfidence: number
    totalDataPoints: number
    duration: number
  }
  
  // Advanced metrics (0-100 scale)
  emotionalStability: number
  emotionalRange: number
  eqScore: number
  responsiveness: number
  regulation: number
  expressiveness: number
  
  // Valence-Arousal (-1 to +1 / 0 to 1)
  averageValence: number
  averageArousal: number
  
  // Pattern data
  patterns: EmotionalPattern[]
  transitions: EmotionTransition[]
  emotionalPeaks: { time: number; emotion: EmotionType; confidence: number }[]
}
```

---

# Part 2: Personality Analysis Model

**File**: `personality-model.ts`  
**Model Version**: `OCEAN-IRT-v2.1`

## Overview

The Personality Analysis Model implements a weighted factor analysis system based on the Big Five (OCEAN) personality model, using Item Response Theory (IRT) principles.

```
Input: 25 questionnaire answers (5-point Likert scale)
       ↓
┌─────────────────────────────────────┐
│  1. Factor Loading Application      │
│  2. Raw Score Calculation           │
│  3. Z-Score Normalization           │
│  4. Confidence Interval Estimation  │
│  5. Consistency Validation          │
│  6. Profile Classification          │
└─────────────────────────────────────┘
       ↓
Output: PersonalityAnalysisResult
```

---

## 1. OCEAN Personality Model

### 1.1 The Five Factors

| Trait | Symbol | High Scorers | Low Scorers |
|-------|--------|--------------|-------------|
| **O**penness | 🎨 | Creative, curious, artistic | Practical, conventional |
| **C**onscientiousness | 📋 | Organized, dependable | Spontaneous, flexible |
| **E**xtraversion | 🎉 | Outgoing, energetic | Reserved, introspective |
| **A**greeableness | 🤝 | Cooperative, trusting | Competitive, skeptical |
| **N**euroticism | 🌊 | Anxious, emotional | Calm, emotionally stable |

### 1.2 Question Distribution

Each trait has 5 questions (25 total):
- Questions 1-5: Openness
- Questions 6-10: Conscientiousness  
- Questions 11-15: Extraversion
- Questions 16-20: Agreeableness
- Questions 21-25: Neuroticism

---

## 2. Factor Loadings (IRT)

Each question has a **factor loading** value representing its correlation with the underlying trait:

```typescript
const FACTOR_LOADINGS: Record<number, number> = {
  // Openness questions
  1: 0.72,  2: 0.68,  3: 0.75,  4: 0.61,  5: 0.79,
  // Conscientiousness questions  
  6: 0.81,  7: 0.74,  8: 0.69,  9: 0.77,  10: 0.73,
  // Extraversion questions
  11: 0.76, 12: 0.82, 13: 0.71, 14: 0.78, 15: 0.65,
  // Agreeableness questions
  16: 0.73, 17: 0.79, 18: 0.68, 19: 0.71, 20: 0.84,
  // Neuroticism questions
  21: 0.77, 22: 0.83, 23: 0.72, 24: 0.69, 25: 0.74,
}
```

**Interpretation**:
- **0.80+**: Strong indicator of the trait
- **0.70-0.79**: Good indicator
- **0.60-0.69**: Moderate indicator
- **<0.60**: Weak indicator

---

## 3. Scoring Algorithms

### 3.1 Raw Score Calculation

Uses factor-weighted averaging:

```typescript
function calculateRawScores(answers: OceanAnswer[]): OceanScores {
  const traitScores = {
    openness: { sum: 0, weightSum: 0 },
    conscientiousness: { sum: 0, weightSum: 0 },
    extraversion: { sum: 0, weightSum: 0 },
    agreeableness: { sum: 0, weightSum: 0 },
    neuroticism: { sum: 0, weightSum: 0 },
  }

  for (const answer of answers) {
    const question = OCEAN_QUESTIONS.find(q => q.id === answer.questionId)
    const factorLoading = FACTOR_LOADINGS[question.id]
    
    // Handle reverse-coded questions
    const score = question.reversed ? (6 - answer.score) : answer.score
    
    traitScores[question.trait].sum += score * factorLoading
    traitScores[question.trait].weightSum += factorLoading
  }

  // Calculate weighted average for each trait
  const rawScores = {}
  for (const trait of Object.keys(traitScores)) {
    rawScores[trait] = traitScores[trait].sum / traitScores[trait].weightSum
  }

  return rawScores  // Range: 1-5
}
```

**Example**:
```
Openness Questions (user answers):
  Q1: 4 (loading: 0.72)
  Q2: 5 (loading: 0.68)
  Q3: 3 (loading: 0.75)
  Q4: 4 (loading: 0.61)
  Q5: 5 (loading: 0.79)

Weighted sum = (4×0.72) + (5×0.68) + (3×0.75) + (4×0.61) + (5×0.79)
             = 2.88 + 3.40 + 2.25 + 2.44 + 3.95
             = 14.92

Weight sum = 0.72 + 0.68 + 0.75 + 0.61 + 0.79 = 3.55

Raw Openness Score = 14.92 / 3.55 = 4.20 (on 1-5 scale)
```

---

### 3.2 Z-Score Normalization

Converts raw scores to population percentiles:

```typescript
const POPULATION_NORMS = {
  openness:         { mean: 3.2, std: 0.8 },
  conscientiousness: { mean: 3.4, std: 0.7 },
  extraversion:      { mean: 3.1, std: 0.9 },
  agreeableness:     { mean: 3.6, std: 0.6 },
  neuroticism:       { mean: 2.8, std: 0.85 },
}

function normalizeScores(rawScores: OceanScores): OceanScores {
  const normalized = {}
  
  for (const trait of Object.keys(rawScores)) {
    const raw = rawScores[trait]
    const { mean, std } = POPULATION_NORMS[trait]
    
    // Z-score transformation
    const zScore = (raw - mean) / std
    
    // Convert to percentile using cumulative normal distribution
    const percentile = 50 * (1 + erf(zScore / Math.sqrt(2)))
    
    normalized[trait] = Math.max(0, Math.min(100, percentile))
  }
  
  return normalized  // Range: 0-100
}
```

**Z-Score Formula**:
```
z = (x - μ) / σ

Where:
  x = raw score
  μ = population mean
  σ = population standard deviation
```

**Percentile Conversion** (using error function):
```
percentile = 50 × (1 + erf(z / √2))
```

**Example**:
```
Raw Openness Score: 4.20
Population Mean: 3.2
Population Std Dev: 0.8

Z-Score = (4.20 - 3.2) / 0.8 = 1.25

Percentile = 50 × (1 + erf(1.25 / √2))
           = 50 × (1 + erf(0.884))
           = 50 × (1 + 0.789)
           = 50 × 1.789
           = 89.4%

User is in the 89th percentile for Openness
(Higher than 89% of the population)
```

---

### 3.3 Error Function (erf) Implementation

The error function is used for normal CDF approximation:

```typescript
function erf(x: number): number {
  // Horner's method coefficients (Abramowitz & Stegun approximation)
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1) * t * Math.exp(-x*x)

  return sign * y
}
```

**Mathematical Definition**:
```
erf(x) = (2/√π) × ∫₀ˣ e^(-t²) dt
```

This polynomial approximation achieves ~99.99% accuracy.

---

### 3.4 Confidence Interval Estimation

Based on within-trait response variance:

```typescript
function calculateConfidence(answers: OceanAnswer[]): Record<OceanTrait, number> {
  const traitVariance = {
    openness: [],
    conscientiousness: [],
    // ... group responses by trait
  }

  for (const answer of answers) {
    const question = OCEAN_QUESTIONS.find(q => q.id === answer.questionId)
    const score = question.reversed ? (6 - answer.score) : answer.score
    traitVariance[question.trait].push(score)
  }

  const confidence = {}
  for (const trait of Object.keys(traitVariance)) {
    const scores = traitVariance[trait]
    
    // Calculate standard error
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (scores.length - 1)
    const standardError = Math.sqrt(variance / scores.length)
    
    // Lower SE = Higher confidence (max SE for 5-point scale ≈ 2)
    confidence[trait] = Math.max(0.5, Math.min(1, 1 - (standardError / 2)))
  }

  return confidence
}
```

**Standard Error Formula**:
```
SE = σ / √n

Where:
  σ = sample standard deviation
  n = number of items
```

**Interpretation**:
- **0.90-1.00**: Very high confidence (consistent responses)
- **0.75-0.89**: Good confidence
- **0.50-0.74**: Moderate confidence (varied responses)

---

### 3.5 Response Consistency (Cronbach's Alpha)

Measures internal consistency:

```typescript
function calculateConsistency(answers: OceanAnswer[]): number {
  // Group responses by trait
  const traitResponses = groupByTrait(answers)
  
  let totalCorrelation = 0
  let correlationCount = 0

  for (const trait of Object.keys(traitResponses)) {
    const responses = traitResponses[trait]
    
    // Calculate variance
    const mean = average(responses)
    const variance = responses.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / responses.length
    
    // Lower variance = higher consistency (max variance for 5-point = 4)
    const consistency = 1 - (variance / 4)
    totalCorrelation += Math.max(0, consistency)
    correlationCount++
  }

  return totalCorrelation / correlationCount  // Range: 0-1
}
```

**Interpretation**:
- **α ≥ 0.80**: High consistency (reliable)
- **0.70 ≤ α < 0.80**: Acceptable
- **α < 0.70**: Low consistency (may need review)

---

### 3.6 Profile Classification

Determines personality type based on score patterns:

```typescript
function determineProfile(scores: OceanScores): { dominant: OceanTrait; profile: string } {
  // Find dominant trait
  let maxTrait = 'openness'
  let maxScore = scores.openness
  
  for (const [trait, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxTrait = trait
    }
  }

  // Profile classification rules (in priority order)
  const profiles = [
    { condition: () => scores.openness > 70 && scores.extraversion > 70,
      name: 'Creative Innovator' },
    { condition: () => scores.conscientiousness > 70 && scores.agreeableness > 70,
      name: 'Reliable Team Player' },
    { condition: () => scores.extraversion > 70 && scores.agreeableness > 70,
      name: 'Social Connector' },
    { condition: () => scores.conscientiousness > 70 && scores.openness > 60,
      name: 'Strategic Thinker' },
    { condition: () => scores.neuroticism < 30 && scores.conscientiousness > 60,
      name: 'Calm Achiever' },
    // ... single-trait profiles
  ]

  for (const profile of profiles) {
    if (profile.condition()) {
      return { dominant: maxTrait, profile: profile.name }
    }
  }

  return { dominant: maxTrait, profile: 'Balanced Individual' }
}
```

**Profile Types**:

| Profile | Required Traits |
|---------|----------------|
| Creative Innovator | O > 70% AND E > 70% |
| Reliable Team Player | C > 70% AND A > 70% |
| Social Connector | E > 70% AND A > 70% |
| Strategic Thinker | C > 70% AND O > 60% |
| Calm Achiever | N < 30% AND C > 60% |
| Creative Explorer | O > 70% |
| Organized Achiever | C > 70% |
| Energetic Leader | E > 70% |
| Empathetic Helper | A > 70% |
| Sensitive Analyst | N > 70% |
| Balanced Individual | Default |

---

## 4. Output Structure

```typescript
interface PersonalityAnalysisResult {
  // Scores
  scores: OceanScores           // Final percentile scores (0-100)
  rawScores: OceanScores        // Raw weighted averages (1-5)
  normalizedScores: OceanScores // Z-normalized scores (0-100)
  
  // Quality metrics
  confidence: Record<OceanTrait, number>  // Per-trait confidence (0-1)
  consistency: number                      // Cronbach's alpha (0-1)
  
  // Profile
  dominantTrait: OceanTrait
  traitProfile: string
  
  // Metadata
  metadata: {
    totalQuestions: number
    answeredQuestions: number
    averageResponseTime: number
    modelVersion: string
  }
}
```

---

## 5. Complete Scoring Pipeline

### Visual Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         USER ANSWERS (25 questions)                        │
│                              [1-5 Likert Scale]                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: FACTOR LOADING APPLICATION                                         │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │  For each answer:                                                     │   │
│ │    weighted_score = answer × factor_loading                           │   │
│ │                                                                       │   │
│ │  Example: Q1 answer=4, loading=0.72 → weighted=2.88                   │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: RAW SCORE CALCULATION                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │  For each trait:                                                      │   │
│ │    raw_score = Σ(weighted_scores) / Σ(factor_loadings)                │   │
│ │                                                                       │   │
│ │  Output: 5 raw scores on 1-5 scale                                    │   │
│ │  Example: Openness = 4.20                                             │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Z-SCORE NORMALIZATION                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │  For each trait:                                                      │   │
│ │    z = (raw - population_mean) / population_std                       │   │
│ │    percentile = 50 × (1 + erf(z / √2))                                │   │
│ │                                                                       │   │
│ │  Output: 5 percentile scores on 0-100 scale                           │   │
│ │  Example: z=1.25 → 89th percentile                                    │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: CONFIDENCE & CONSISTENCY                                           │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │  Confidence = 1 - (standard_error / 2)                                │   │
│ │  Consistency = 1 - (variance / 4)  [Cronbach's α approximation]       │   │
│ │                                                                       │   │
│ │  Output: Per-trait confidence + overall consistency score             │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: PROFILE CLASSIFICATION                                             │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │  Match score patterns to personality profiles                         │   │
│ │                                                                       │   │
│ │  Example: O=89%, E=75% → "Creative Innovator"                         │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         FINAL OUTPUT                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Openness:          89%  ████████████████████░░░░                   │   │
│  │  Conscientiousness: 72%  ██████████████████░░░░░░                   │   │
│  │  Extraversion:      75%  ███████████████████░░░░░                   │   │
│  │  Agreeableness:     68%  █████████████████░░░░░░░                   │   │
│  │  Neuroticism:       35%  █████████░░░░░░░░░░░░░░░                   │   │
│  │                                                                      │   │
│  │  Profile: Creative Innovator                                         │   │
│  │  Confidence: 87%  |  Consistency: α = 0.82                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Job Matching Integration

The OCEAN scores are used to calculate job match percentages:

```typescript
function calculateJobMatch(job: Job, userScores: OceanScores): number {
  let totalWeight = 0
  let weightedScore = 0

  for (const requirement of job.idealTraits) {
    const userScore = userScores[requirement.trait]
    const matchRatio = Math.min(userScore / requirement.minScore, 1.2)  // Cap at 120%
    
    weightedScore += matchRatio * requirement.weight * 100
    totalWeight += requirement.weight
  }

  return Math.round(weightedScore / totalWeight)
}
```

**Example**:
```
Job Requirements:
  - Conscientiousness: min 70%, weight 0.4
  - Agreeableness: min 60%, weight 0.3
  - Openness: min 50%, weight 0.3

User Scores:
  - Conscientiousness: 72%
  - Agreeableness: 68%
  - Openness: 89%

Calculations:
  C match: min(72/70, 1.2) = 1.029 × 0.4 × 100 = 41.1
  A match: min(68/60, 1.2) = 1.133 × 0.3 × 100 = 34.0
  O match: min(89/50, 1.2) = 1.200 × 0.3 × 100 = 36.0

Total: (41.1 + 34.0 + 36.0) / (0.4 + 0.3 + 0.3) = 111.1 / 1.0 = 111%
Capped: 100%

Final Match Score: 100% (Excellent fit!)
```

---

## Summary

| Model | Input | Key Algorithms | Output |
|-------|-------|----------------|--------|
| **Emotion Model** | Timeline of facial expressions | Markov chains, Shannon entropy, Valence-arousal mapping | EQ score, stability, distribution |
| **Personality Model** | 25 Likert responses | Factor loading (IRT), Z-score normalization, Profile classification | OCEAN percentiles, personality type |

Both models produce quantifiable metrics that enable objective candidate assessment and AI-powered job matching.

