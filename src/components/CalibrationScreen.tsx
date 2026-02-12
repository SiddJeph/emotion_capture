'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  User,
  Scan,
  Shield,
  Volume2,
  RefreshCw
} from 'lucide-react'
import { detectFace, DetectionResult } from '@/lib/face-api/detector'

interface CalibrationScreenProps {
  onReady: () => void
}

export default function CalibrationScreen({ onReady }: CalibrationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [consecutiveDetections, setConsecutiveDetections] = useState(0)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const REQUIRED_DETECTIONS = 10 // Need 10 consecutive detections to be considered calibrated

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null
    let mounted = true

    async function initCamera() {
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported. Please use a modern browser.')
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        })

        if (!mounted || !videoRef.current) return

        videoRef.current.srcObject = stream
        
        // Wait for video to be ready before playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'))
            return
          }
          
          const video = videoRef.current
          
          const handleCanPlay = () => {
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
            resolve()
          }
          
          const handleError = () => {
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
            reject(new Error('Video failed to load'))
          }
          
          video.addEventListener('canplay', handleCanPlay)
          video.addEventListener('error', handleError)
          
          // If already ready, resolve immediately
          if (video.readyState >= 3) {
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
            resolve()
          }
        })

        if (!mounted) return
        
        await videoRef.current.play()
        setCameraReady(true)
        
      } catch (err: unknown) {
        console.error('Camera error:', err)
        
        // Provide specific error messages
        let errorMessage = 'Unable to access camera.'
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and reload the page.'
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = 'No camera found. Please connect a camera and reload the page.'
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = 'Camera is in use by another application. Please close other apps using the camera and reload.'
          } else if (err.name === 'OverconstrainedError') {
            errorMessage = 'Camera does not meet requirements. Trying with default settings...'
            // Try again with basic constraints
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true })
              if (mounted && videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                setCameraReady(true)
                return
              }
            } catch {
              errorMessage = 'Failed to access camera with any settings.'
            }
          } else if (err.name === 'AbortError') {
            errorMessage = 'Camera access was aborted. Please reload and try again.'
          } else if (err.message) {
            errorMessage = err.message
          }
        }
        
        if (mounted) {
          setCameraError(errorMessage)
        }
      }
    }

    initCamera()

    return () => {
      mounted = false
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  // Face detection loop
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !cameraReady) return

    const result = await detectFace(videoRef.current)
    setDetectionResult(result)
    setFaceDetected(result.detected)

    if (result.detected) {
      setConsecutiveDetections(prev => {
        const newCount = prev + 1
        if (newCount >= REQUIRED_DETECTIONS && !isCalibrated) {
          setIsCalibrated(true)
        }
        return newCount
      })
    } else {
      setConsecutiveDetections(0)
    }

    // Draw face box on canvas
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        if (result.detected && result.faceBox) {
          const { x, y, width, height } = result.faceBox
          
          // Draw face box with glow effect
          ctx.strokeStyle = isCalibrated ? '#00d4ff' : '#8338ec'
          ctx.lineWidth = 2
          ctx.shadowColor = isCalibrated ? '#00d4ff' : '#8338ec'
          ctx.shadowBlur = 10
          
          // Rounded rectangle
          const radius = 10
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + width - radius, y)
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
          ctx.lineTo(x + width, y + height - radius)
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
          ctx.lineTo(x + radius, y + height)
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.stroke()

          // Corner accents
          const cornerLength = 15
          ctx.lineWidth = 3
          ctx.shadowBlur = 15

          // Top-left
          ctx.beginPath()
          ctx.moveTo(x, y + cornerLength)
          ctx.lineTo(x, y)
          ctx.lineTo(x + cornerLength, y)
          ctx.stroke()

          // Top-right
          ctx.beginPath()
          ctx.moveTo(x + width - cornerLength, y)
          ctx.lineTo(x + width, y)
          ctx.lineTo(x + width, y + cornerLength)
          ctx.stroke()

          // Bottom-left
          ctx.beginPath()
          ctx.moveTo(x, y + height - cornerLength)
          ctx.lineTo(x, y + height)
          ctx.lineTo(x + cornerLength, y + height)
          ctx.stroke()

          // Bottom-right
          ctx.beginPath()
          ctx.moveTo(x + width - cornerLength, y + height)
          ctx.lineTo(x + width, y + height)
          ctx.lineTo(x + width, y + height - cornerLength)
          ctx.stroke()
        }
      }
    }
  }, [cameraReady, isCalibrated])

  // Start detection loop when camera is ready
  useEffect(() => {
    if (cameraReady && !detectionIntervalRef.current) {
      detectionIntervalRef.current = setInterval(runDetection, 100)
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [cameraReady, runDetection])

  const calibrationProgress = Math.min(
    (consecutiveDetections / REQUIRED_DETECTIONS) * 100,
    100
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-bg">
      <div className="max-w-4xl w-full">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-3">
              Face <span className="gradient-text">Calibration</span>
            </h1>
            <p className="text-white/50 max-w-md mx-auto">
              Let&apos;s make sure we can see you clearly. Position yourself in 
              front of the camera so the AI can track your expressions.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera Feed */}
            <div className="relative">
              <div className="video-container aspect-[4/3] bg-black/50 rounded-xl overflow-hidden">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6 max-w-sm">
                      <AlertCircle className="w-12 h-12 text-pulse mx-auto mb-4" />
                      <p className="text-pulse text-sm mb-4">{cameraError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover transform scale-x-[-1]"
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full transform scale-x-[-1] pointer-events-none"
                    />
                    
                    {/* Scanner overlay */}
                    {!isCalibrated && faceDetected && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="scanner-line" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
                      isCalibrated 
                        ? 'bg-electric/20 text-electric border border-electric/30' 
                        : faceDetected 
                          ? 'bg-calm/20 text-calm border border-calm/30'
                          : 'bg-white/10 text-white/50 border border-white/20'
                    }`}>
                      {isCalibrated ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Calibrated
                        </>
                      ) : faceDetected ? (
                        <>
                          <Scan className="w-3 h-3 animate-pulse" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          No Face
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Calibration Progress */}
              {!cameraError && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Calibration</span>
                    <span className="font-mono text-electric">
                      {Math.round(calibrationProgress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        isCalibrated 
                          ? 'bg-gradient-to-r from-electric to-calm' 
                          : 'bg-gradient-to-r from-calm to-pulse'
                      }`}
                      style={{ width: `${calibrationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Panel */}
            <div className="space-y-6">
              {/* Current Emotion */}
              {detectionResult?.detected && detectionResult.dominantEmotion && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 animate-fade-in">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
                    Detected Emotion
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-semibold capitalize emotion-${detectionResult.dominantEmotion}`}>
                      {detectionResult.dominantEmotion}
                    </span>
                    <span className="text-white/70 font-mono text-sm">
                      {(detectionResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Checklist
                </h3>
                
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  cameraReady ? 'bg-electric/10' : 'bg-white/5'
                }`}>
                  <Camera className={`w-5 h-5 ${cameraReady ? 'text-electric' : 'text-white/40'}`} />
                  <span className={cameraReady ? 'text-white' : 'text-white/50'}>
                    Camera access granted
                  </span>
                  {cameraReady && <CheckCircle2 className="w-4 h-4 text-electric ml-auto" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  faceDetected ? 'bg-electric/10' : 'bg-white/5'
                }`}>
                  <User className={`w-5 h-5 ${faceDetected ? 'text-electric' : 'text-white/40'}`} />
                  <span className={faceDetected ? 'text-white' : 'text-white/50'}>
                    Face detected
                  </span>
                  {faceDetected && <CheckCircle2 className="w-4 h-4 text-electric ml-auto" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCalibrated ? 'bg-electric/10' : 'bg-white/5'
                }`}>
                  <Shield className={`w-5 h-5 ${isCalibrated ? 'text-electric' : 'text-white/40'}`} />
                  <span className={isCalibrated ? 'text-white' : 'text-white/50'}>
                    Calibration complete
                  </span>
                  {isCalibrated && <CheckCircle2 className="w-4 h-4 text-electric ml-auto" />}
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 bg-calm/10 border border-calm/20 rounded-xl">
                <h4 className="text-sm font-medium mb-2 text-calm">Tips for best results</h4>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Face the camera directly</li>
                  <li>• Keep a neutral background</li>
                  <li>• Remove glasses if detection is unstable</li>
                </ul>
              </div>

              {/* Audio Reminder */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Volume2 className="w-5 h-5 text-white/50" />
                <span className="text-sm text-white/60">
                  Ensure your speakers or headphones are connected
                </span>
              </div>

              {/* Start Button */}
              <button
                onClick={onReady}
                disabled={!isCalibrated}
                className="w-full btn-primary py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Play className="w-5 h-5" />
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

