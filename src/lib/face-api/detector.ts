import * as faceapi from 'face-api.js'
import { EmotionType, EmotionDataPoint } from '../supabase/types'

export interface DetectionResult {
  detected: boolean
  expressions: Record<EmotionType, number> | null
  dominantEmotion: EmotionType | null
  confidence: number
  faceBox: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

const EMOTION_MAP: Record<string, EmotionType> = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  fearful: 'fearful',
  disgusted: 'disgusted',
  surprised: 'surprised',
  neutral: 'neutral',
}

export async function detectFace(
  videoElement: HTMLVideoElement
): Promise<DetectionResult> {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      }))
      .withFaceLandmarks()
      .withFaceExpressions()

    if (!detection) {
      return {
        detected: false,
        expressions: null,
        dominantEmotion: null,
        confidence: 0,
        faceBox: null,
      }
    }

    const expressions: Record<EmotionType, number> = {
      happy: detection.expressions.happy,
      sad: detection.expressions.sad,
      angry: detection.expressions.angry,
      fearful: detection.expressions.fearful,
      disgusted: detection.expressions.disgusted,
      surprised: detection.expressions.surprised,
      neutral: detection.expressions.neutral,
    }

    // Find dominant emotion
    let dominantEmotion: EmotionType = 'neutral'
    let maxConfidence = 0

    for (const [emotion, confidence] of Object.entries(expressions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence
        dominantEmotion = emotion as EmotionType
      }
    }

    const box = detection.detection.box

    return {
      detected: true,
      expressions,
      dominantEmotion,
      confidence: maxConfidence,
      faceBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
    }
  } catch (error) {
    console.error('Face detection error:', error)
    return {
      detected: false,
      expressions: null,
      dominantEmotion: null,
      confidence: 0,
      faceBox: null,
    }
  }
}

export function createEmotionDataPoint(
  time: number,
  result: DetectionResult
): EmotionDataPoint | null {
  if (!result.detected || !result.expressions || !result.dominantEmotion) {
    return null
  }

  return {
    time,
    emotion: result.dominantEmotion,
    confidence: result.confidence,
    allEmotions: result.expressions,
  }
}




