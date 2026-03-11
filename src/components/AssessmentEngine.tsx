'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { detectFace, DetectionResult } from '@/lib/face-api/detector'
import { EmotionDataPoint, EmotionType, EmotionSummary } from '@/lib/supabase/types'

interface AssessmentEngineProps {
  videoSrc: string
  videoId: string
  onComplete: (data: { timeline: EmotionDataPoint[], summary: EmotionSummary }) => void
}

const CAPTURE_INTERVAL = 200 // 200ms = 5 captures per second

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#fcd34d',
  sad: '#60a5fa',
  angry: '#f87171',
  fearful: '#a78bfa',
  disgusted: '#4ade80',
  surprised: '#f472b6',
  neutral: '#94a3b8',
}

// Emojis kept for potential future use
// const EMOTION_EMOJIS: Record<EmotionType, string> = {
//   happy: '😊', sad: '😢', angry: '😠', fearful: '😨',
//   disgusted: '🤢', surprised: '😲', neutral: '😐',
// }

export default function AssessmentEngine({ 
  videoSrc, 
  videoId, 
  onComplete 
}: AssessmentEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const webcamRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentTimeRef = useRef(0) // Track time in ref for capture callback
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [timeline, setTimeline] = useState<EmotionDataPoint[]>([])
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null)
  const [webcamReady, setWebcamReady] = useState(false)
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false)
  const [dataPointCount, setDataPointCount] = useState(0)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)

  // Initialize webcam
  useEffect(() => {
    let stream: MediaStream | null = null
    let mounted = true

    async function initWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
        })

        if (!mounted || !webcamRef.current) return

        webcamRef.current.srcObject = stream
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (!webcamRef.current) {
            resolve()
            return
          }
          const video = webcamRef.current
          if (video.readyState >= 3) {
            resolve()
            return
          }
          video.addEventListener('canplay', () => resolve(), { once: true })
        })

        if (!mounted || !webcamRef.current) return
        
        await webcamRef.current.play()
        setWebcamReady(true)
      } catch (err) {
        console.error('Webcam error:', err)
        // Try with basic constraints as fallback
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (mounted && webcamRef.current) {
            webcamRef.current.srcObject = stream
            await webcamRef.current.play()
            setWebcamReady(true)
          }
        } catch {
          console.error('Webcam fallback also failed')
        }
      }
    }

    initWebcam()

    return () => {
      mounted = false
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Capture emotion data
  const captureEmotion = useCallback(async () => {
    if (!webcamRef.current || !webcamReady) return

    const result = await detectFace(webcamRef.current)
    setCurrentDetection(result)

    if (result.detected && result.expressions && result.dominantEmotion) {
      // Get time from ref (updated by handleTimeUpdate) or directly from video
      const captureTime = videoRef.current?.currentTime ?? currentTimeRef.current
      
      const dataPoint: EmotionDataPoint = {
        time: captureTime,
        emotion: result.dominantEmotion,
        confidence: result.confidence,
        allEmotions: result.expressions,
      }
      
      console.log('Captured emotion:', dataPoint.emotion, 'at time:', captureTime.toFixed(2))
      
      setTimeline(prev => [...prev, dataPoint])
      setDataPointCount(prev => prev + 1)
    }

    // Draw face indicator on canvas
    if (canvasRef.current && webcamRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = webcamRef.current.videoWidth
        canvasRef.current.height = webcamRef.current.videoHeight
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        if (result.detected && result.faceBox) {
          const { x, y, width, height } = result.faceBox
          ctx.strokeStyle = EMOTION_COLORS[result.dominantEmotion || 'neutral']
          ctx.lineWidth = 2
          ctx.shadowColor = ctx.strokeStyle
          ctx.shadowBlur = 10
          ctx.strokeRect(x, y, width, height)
        }
      }
    }
  }, [webcamReady])

  // Start/stop capture loop based on video playback
  useEffect(() => {
    if (isPlaying && webcamReady && !isAssessmentComplete) {
      captureIntervalRef.current = setInterval(captureEmotion, CAPTURE_INTERVAL)
    } else {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
      }
    }
  }, [isPlaying, webcamReady, captureEmotion, isAssessmentComplete])

  // Handle video events
  const handlePlay = () => {
    console.log('Video playing, current time:', videoRef.current?.currentTime)
    setIsPlaying(true)
  }
  const handlePause = () => setIsPlaying(false)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      currentTimeRef.current = time // Keep ref in sync for capture callback
      setCurrentTime(time)
    }
  }
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log('Video loaded, duration:', videoRef.current.duration)
      setDuration(videoRef.current.duration)
    }
  }

  // Calculate summary when assessment completes
  const calculateSummary = useCallback((data: EmotionDataPoint[]): EmotionSummary => {
    if (data.length === 0) {
      return {
        dominantEmotion: 'neutral',
        averageConfidence: 0,
        emotionDistribution: {
          happy: 0, sad: 0, angry: 0, fearful: 0, 
          disgusted: 0, surprised: 0, neutral: 0
        },
        totalDataPoints: 0,
        duration: 0,
      }
    }

    const emotionCounts: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, fearful: 0,
      disgusted: 0, surprised: 0, neutral: 0
    }

    let totalConfidence = 0

    data.forEach(point => {
      emotionCounts[point.emotion]++
      totalConfidence += point.confidence
    })

    // Find dominant emotion
    let dominantEmotion: EmotionType = 'neutral'
    let maxCount = 0
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantEmotion = emotion as EmotionType
      }
    }

    // Calculate distribution percentages
    const total = data.length
    const emotionDistribution: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, fearful: 0,
      disgusted: 0, surprised: 0, neutral: 0
    }
    
    for (const emotion of Object.keys(emotionCounts) as EmotionType[]) {
      emotionDistribution[emotion] = emotionCounts[emotion] / total
    }

    return {
      dominantEmotion,
      averageConfidence: totalConfidence / total,
      emotionDistribution,
      totalDataPoints: total,
      duration: duration,
    }
  }, [duration])

  // Handle video end
  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setIsAssessmentComplete(true)

    // Stop webcam
    if (webcamRef.current?.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }

    // Calculate summary and trigger callback
    const summary = calculateSummary(timeline)
    onComplete({ timeline, summary })
  }, [timeline, calculateSummary, onComplete])

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col grid-bg">
      {/* Hidden webcam for background capture - not visible to user */}
      <div className="sr-only">
        <video
          ref={webcamRef}
          className="w-1 h-1"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="w-1 h-1"
        />
      </div>

      {/* Minimal Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-pulse rounded-full animate-pulse" />
          <span className="text-sm text-white/50">Assessment in progress</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Full-width Video Player */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="glass rounded-2xl overflow-hidden shadow-2xl">
            {/* Video */}
            <div className="video-container aspect-video bg-black relative">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => {
                  handleLoadedMetadata()
                  setVideoLoading(false)
                }}
                onEnded={handleEnded}
                onError={(e) => {
                  console.error('Video error:', e)
                  setVideoError('Failed to load video. Please check the video URL or try uploading a file.')
                  setVideoLoading(false)
                }}
                onCanPlay={() => setVideoLoading(false)}
                playsInline
              />

              {/* Loading indicator */}
              {videoLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-electric mx-auto mb-3 animate-spin" />
                    <p className="text-white/70 text-sm">Loading video...</p>
                  </div>
                </div>
              )}

              {/* Error display */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center p-6 max-w-sm">
                    <AlertCircle className="w-12 h-12 text-pulse mx-auto mb-4" />
                    <p className="text-pulse text-sm mb-4">{videoError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              )}

              {/* Play overlay */}
              {!isPlaying && !isAssessmentComplete && !videoLoading && !videoError && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={togglePlay}
                >
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all">
                    <Play className="w-12 h-12 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Recording indicator - subtle */}
              {isPlaying && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 bg-pulse rounded-full animate-pulse" />
                  <span className="text-xs text-white/70">Recording</span>
                </div>
              )}
            </div>

            {/* Minimal Controls */}
            <div className="p-4 bg-black/20">
              {/* Progress bar */}
              <div className="mb-4">
                <div 
                  className="h-1 bg-white/10 rounded-full cursor-pointer group"
                  onClick={(e) => {
                    if (videoRef.current && !isAssessmentComplete) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const percent = (e.clientX - rect.left) / rect.width
                      videoRef.current.currentTime = percent * duration
                    }
                  }}
                >
                  <div 
                    className="h-full bg-electric rounded-full transition-all relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={togglePlay}
                  disabled={isAssessmentComplete}
                  className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white/50" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Subtle instruction */}
          <p className="text-center text-white/30 text-sm mt-4">
            Watch the video naturally. Your reactions are being recorded.
          </p>
        </div>
      </div>
    </div>
  )
}

