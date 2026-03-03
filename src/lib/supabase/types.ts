export type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral'

export interface EmotionDataPoint {
  time: number
  emotion: EmotionType
  confidence: number
  allEmotions: Record<EmotionType, number>
}

export interface EmotionSummary {
  dominantEmotion: EmotionType
  averageConfidence: number
  emotionDistribution: Record<EmotionType, number>
  totalDataPoints: number
  duration: number
}

export interface CandidateResponse {
  id: string
  user_id: string | null
  video_id: string
  raw_timeline: EmotionDataPoint[]
  summary: EmotionSummary
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      candidate_responses: {
        Row: CandidateResponse
        Insert: Omit<CandidateResponse, 'id' | 'created_at'>
        Update: Partial<Omit<CandidateResponse, 'id' | 'created_at'>>
      }
    }
  }
}




