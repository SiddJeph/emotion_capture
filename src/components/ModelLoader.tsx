'use client'

import { useState, useEffect } from 'react'
import { Cpu, CheckCircle2, Loader2, Brain, Eye, Sparkles } from 'lucide-react'
import { loadFaceApiModels, ModelLoadingProgress } from '@/lib/face-api/loader'

interface ModelLoaderProps {
  onLoaded: () => void
}

const MODEL_NAMES = {
  tinyFaceDetector: 'Face Detector',
  faceLandmark68Net: 'Landmark Network',
  faceExpressionNet: 'Expression Analyzer',
}

const MODEL_ICONS = {
  tinyFaceDetector: Eye,
  faceLandmark68Net: Brain,
  faceExpressionNet: Sparkles,
}

export default function ModelLoader({ onLoaded }: ModelLoaderProps) {
  const [progress, setProgress] = useState<ModelLoadingProgress>({
    tinyFaceDetector: false,
    faceLandmark68Net: false,
    faceExpressionNet: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loadingStarted, setLoadingStarted] = useState(false)

  useEffect(() => {
    async function loadModels() {
      setLoadingStarted(true)
      try {
        await loadFaceApiModels(setProgress)
        // Small delay for visual effect
        setTimeout(onLoaded, 500)
      } catch (err) {
        console.error('Failed to load models:', err)
        setError('Failed to load AI models. Please refresh the page.')
      }
    }

    loadModels()
  }, [onLoaded])

  const loadedCount = Object.values(progress).filter(Boolean).length
  const totalModels = Object.keys(progress).length
  const percentComplete = Math.round((loadedCount / totalModels) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-bg">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric/20 to-calm/20 flex items-center justify-center relative">
              <Cpu className="w-10 h-10 text-electric" />
              {loadingStarted && loadedCount < totalModels && (
                <div className="absolute inset-0 rounded-2xl border-2 border-electric animate-pulse" />
              )}
            </div>
            <h1 className="text-2xl font-semibold mb-2">
              Initializing <span className="gradient-text">AI Engine</span>
            </h1>
            <p className="text-white/50 text-sm">
              Loading neural networks for emotion detection
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Progress</span>
              <span className="font-mono text-electric">{percentComplete}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric to-calm transition-all duration-500 ease-out rounded-full"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Model List */}
          <div className="space-y-3">
            {(Object.keys(progress) as Array<keyof ModelLoadingProgress>).map((modelKey, index) => {
              const isLoaded = progress[modelKey]
              const Icon = MODEL_ICONS[modelKey]
              
              return (
                <div
                  key={modelKey}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isLoaded 
                      ? 'bg-electric/10 border border-electric/30' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLoaded ? 'bg-electric/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${isLoaded ? 'text-electric' : 'text-white/50'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {MODEL_NAMES[modelKey]}
                    </div>
                    <div className="text-xs text-white/40 font-mono">
                      {modelKey}
                    </div>
                  </div>
                  
                  <div className="w-6 h-6">
                    {isLoaded ? (
                      <CheckCircle2 className="w-6 h-6 text-electric animate-fade-in" />
                    ) : loadingStarted && loadedCount === index ? (
                      <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white/20" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-pulse/20 border border-pulse/30 rounded-xl text-center">
              <p className="text-pulse text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/30 text-xs mt-6">
          Models are cached locally for faster loading next time
        </p>
      </div>
    </div>
  )
}




