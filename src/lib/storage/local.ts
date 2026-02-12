import { EmotionDataPoint, EmotionSummary } from '../supabase/types'
import { OceanScores, OceanTrait, OCEAN_DESCRIPTIONS, getDominantTrait } from '../ocean/types'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json')

interface ExtendedSummary extends EmotionSummary {
  oceanScores?: OceanScores
}

interface StoredResponse {
  id: string
  user_id: string | null
  video_id: string
  raw_timeline: EmotionDataPoint[]
  summary: ExtendedSummary
  created_at: string
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load existing responses
function loadResponses(): StoredResponse[] {
  ensureDataDir()
  if (!fs.existsSync(RESPONSES_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(RESPONSES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save responses
function saveResponses(responses: StoredResponse[]) {
  ensureDataDir()
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2))
}

export async function saveResponseLocally(
  videoId: string,
  timeline: EmotionDataPoint[],
  summary: ExtendedSummary,
  userId: string | null = null
): Promise<StoredResponse> {
  const response: StoredResponse = {
    id: uuidv4(),
    user_id: userId,
    video_id: videoId,
    raw_timeline: timeline,
    summary: summary,
    created_at: new Date().toISOString(),
  }

  const responses = loadResponses()
  responses.push(response)
  saveResponses(responses)

  // Log to console for visibility
  console.log('\n' + '='.repeat(60))
  console.log('📊 EMOTION CAPTURE - COMPLETE ASSESSMENT SAVED')
  console.log('='.repeat(60))
  console.log(`ID: ${response.id}`)
  console.log(`Video: ${videoId}`)
  console.log(`Timestamp: ${response.created_at}`)
  console.log(`Data Points: ${timeline.length}`)
  console.log(`Duration: ${summary.duration.toFixed(1)}s`)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎭 ROUND 1: EMOTION DETECTION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   Dominant Emotion: ${summary.dominantEmotion.toUpperCase()}`)
  console.log(`   Average Confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`)
  console.log('')
  console.log('   📊 EMOTION DISTRIBUTION:')
  Object.entries(summary.emotionDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([emotion, value]) => {
      const bar = '█'.repeat(Math.round(value * 30))
      const percentage = (value * 100).toFixed(1).padStart(5)
      console.log(`      ${emotion.padEnd(10)} ${percentage}% ${bar}`)
    })
  
  // Log OCEAN scores if present
  if (summary.oceanScores) {
    const dominantTrait = getDominantTrait(summary.oceanScores)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🧠 ROUND 2: OCEAN PERSONALITY ASSESSMENT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Dominant Trait: ${OCEAN_DESCRIPTIONS[dominantTrait].name.toUpperCase()} ${OCEAN_DESCRIPTIONS[dominantTrait].emoji}`)
    console.log('')
    console.log('   📊 OCEAN SCORES:')
    Object.entries(summary.oceanScores)
      .sort((a, b) => b[1] - a[1])
      .forEach(([trait, score]) => {
        const traitInfo = OCEAN_DESCRIPTIONS[trait as OceanTrait]
        const bar = '█'.repeat(Math.round(score / 100 * 30))
        const percentage = score.toFixed(1).padStart(5)
        console.log(`      ${traitInfo.emoji} ${traitInfo.name.padEnd(17)} ${percentage}% ${bar}`)
      })
  }
  
  console.log('')
  console.log('📍 TIMELINE SAMPLE (first 10 data points):')
  timeline.slice(0, 10).forEach((point, i) => {
    console.log(`   ${(i + 1).toString().padStart(2)}. [${point.time.toFixed(2)}s] ${point.emotion} (${(point.confidence * 100).toFixed(0)}%)`)
  })
  if (timeline.length > 10) {
    console.log(`   ... and ${timeline.length - 10} more data points`)
  }
  console.log('')
  console.log(`💾 Saved to: ${RESPONSES_FILE}`)
  console.log('='.repeat(60) + '\n')

  return response
}

export async function getResponsesLocally(
  videoId?: string,
  userId?: string,
  limit: number = 10
): Promise<StoredResponse[]> {
  let responses = loadResponses()

  if (videoId) {
    responses = responses.filter(r => r.video_id === videoId)
  }

  if (userId) {
    responses = responses.filter(r => r.user_id === userId)
  }

  // Sort by created_at descending
  responses.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return responses.slice(0, limit)
}

// Get latest assessment result for a specific user
export async function getLatestUserAssessment(userId: string): Promise<StoredResponse | null> {
  const responses = loadResponses()
  
  const userResponses = responses
    .filter(r => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  return userResponses[0] || null
}

// Get all assessment results (for admin)
export async function getAllAssessments(): Promise<StoredResponse[]> {
  const responses = loadResponses()
  return responses.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}


