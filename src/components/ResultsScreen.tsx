'use client'

import { useState, useMemo } from 'react'
import { 
  CheckCircle2, 
  Download, 
  RotateCcw, 
  Share2,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  PieChart,
  Activity,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { EmotionDataPoint, EmotionSummary, EmotionType } from '@/lib/supabase/types'

interface ResultsScreenProps {
  timeline: EmotionDataPoint[]
  summary: EmotionSummary
  videoId: string
  onRestart: () => void
  isSubmitting: boolean
  submitError: string | null
  submitSuccess: boolean
  submitWarning?: string | null
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#fcd34d',
  sad: '#60a5fa',
  angry: '#f87171',
  fearful: '#a78bfa',
  disgusted: '#4ade80',
  surprised: '#f472b6',
  neutral: '#94a3b8',
}

const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐',
}

const EMOTION_DESCRIPTIONS: Record<EmotionType, string> = {
  happy: 'Joyful and positive emotional response',
  sad: 'Melancholic or sorrowful reaction',
  angry: 'Frustrated or irritated response',
  fearful: 'Anxious or apprehensive reaction',
  disgusted: 'Aversion or distaste shown',
  surprised: 'Unexpected or startled response',
  neutral: 'Calm and balanced emotional state',
}

export default function ResultsScreen({
  timeline,
  summary,
  videoId,
  onRestart,
  isSubmitting,
  submitError,
  submitSuccess,
  submitWarning,
}: ResultsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'distribution'>('overview')

  // Calculate time-based segments
  const timeSegments = useMemo(() => {
    if (timeline.length === 0) return []
    
    const segmentDuration = summary.duration / 10 // 10 segments
    const segments: { start: number; end: number; dominantEmotion: EmotionType; count: number }[] = []
    
    for (let i = 0; i < 10; i++) {
      const start = i * segmentDuration
      const end = (i + 1) * segmentDuration
      const segmentData = timeline.filter(p => p.time >= start && p.time < end)
      
      if (segmentData.length === 0) continue
      
      const emotionCounts: Record<EmotionType, number> = {
        happy: 0, sad: 0, angry: 0, fearful: 0,
        disgusted: 0, surprised: 0, neutral: 0
      }
      
      segmentData.forEach(p => emotionCounts[p.emotion]++)
      
      let dominant: EmotionType = 'neutral'
      let maxCount = 0
      for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count
          dominant = emotion as EmotionType
        }
      }
      
      segments.push({ start, end, dominantEmotion: dominant, count: segmentData.length })
    }
    
    return segments
  }, [timeline, summary.duration])

  // Get sorted emotions for distribution
  const sortedEmotions = useMemo(() => {
    return Object.entries(summary.emotionDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, value]) => ({ emotion: emotion as EmotionType, value }))
  }, [summary.emotionDistribution])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadResults = () => {
    const data = {
      videoId,
      summary,
      timeline,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emotion-results-${videoId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen p-6 grid-bg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-electric/20 flex items-center justify-center border border-electric/30">
            <CheckCircle2 className="w-10 h-10 text-electric" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            Assessment <span className="text-electric">Complete</span>
          </h1>
          <p className="text-white/50">
            Here&apos;s your emotional response analysis
          </p>
        </div>

        {/* Submit Status */}
        {(isSubmitting || submitError || submitSuccess || submitWarning) && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            isSubmitting ? 'bg-calm/20 border border-calm/30' :
            submitError ? 'bg-pulse/20 border border-pulse/30' :
            submitWarning ? 'bg-warm/20 border border-warm/30' :
            'bg-electric/20 border border-electric/30'
          }`}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 text-calm animate-spin" />
                <span className="text-calm">Saving results to database...</span>
              </>
            ) : submitError ? (
              <>
                <AlertTriangle className="w-5 h-5 text-pulse" />
                <span className="text-pulse">{submitError}</span>
              </>
            ) : submitWarning ? (
              <>
                <AlertTriangle className="w-5 h-5 text-warm" />
                <span className="text-warm text-sm">{submitWarning}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-electric" />
                <span className="text-electric">Results saved successfully!</span>
              </>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4 stagger-child">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              Dominant
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{EMOTION_EMOJIS[summary.dominantEmotion]}</span>
              <span 
                className="text-xl font-semibold capitalize"
                style={{ color: EMOTION_COLORS[summary.dominantEmotion] }}
              >
                {summary.dominantEmotion}
              </span>
            </div>
          </div>

          <div className="glass rounded-xl p-4 stagger-child">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <Target className="w-4 h-4" />
              Confidence
            </div>
            <div className="text-2xl font-semibold text-electric">
              {(summary.averageConfidence * 100).toFixed(1)}%
            </div>
          </div>

          <div className="glass rounded-xl p-4 stagger-child">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <Activity className="w-4 h-4" />
              Data Points
            </div>
            <div className="text-2xl font-semibold text-calm">
              {summary.totalDataPoints}
            </div>
          </div>

          <div className="glass rounded-xl p-4 stagger-child">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Duration
            </div>
            <div className="text-2xl font-semibold text-warm">
              {formatTime(summary.duration)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'timeline', label: 'Timeline', icon: Activity },
              { id: 'distribution', label: 'Distribution', icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white border-b-2 border-electric' 
                    : 'text-white/50 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center p-8 bg-white/5 rounded-xl">
                  <div className="text-6xl mb-4">{EMOTION_EMOJIS[summary.dominantEmotion]}</div>
                  <h3 
                    className="text-3xl font-semibold capitalize mb-2"
                    style={{ color: EMOTION_COLORS[summary.dominantEmotion] }}
                  >
                    {summary.dominantEmotion}
                  </h3>
                  <p className="text-white/50">
                    {EMOTION_DESCRIPTIONS[summary.dominantEmotion]}
                  </p>
                </div>

                {/* Emotion breakdown bars */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                    Emotion Breakdown
                  </h4>
                  {sortedEmotions.map(({ emotion, value }) => (
                    <div key={emotion} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{EMOTION_EMOJIS[emotion]}</span>
                          <span className="capitalize">{emotion}</span>
                        </span>
                        <span className="font-mono text-white/50">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${value * 100}%`,
                            backgroundColor: EMOTION_COLORS[emotion],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="animate-fade-in">
                <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4">
                  Emotional Journey
                </h4>
                
                {/* Visual timeline */}
                <div className="flex items-end gap-1 h-32 mb-6">
                  {timeSegments.map((segment, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          backgroundColor: EMOTION_COLORS[segment.dominantEmotion],
                          height: `${(segment.count / Math.max(...timeSegments.map(s => s.count))) * 100}%`,
                          minHeight: '20%',
                        }}
                        title={`${formatTime(segment.start)} - ${formatTime(segment.end)}: ${segment.dominantEmotion}`}
                      />
                      <span className="text-xs text-white/30 mt-2">
                        {formatTime(segment.start)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timeline legend */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                    <div key={emotion} className="flex items-center gap-1.5">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-white/50 capitalize">{emotion}</span>
                    </div>
                  ))}
                </div>

                {/* Key moments - spread across timeline */}
                <div className="mt-8 space-y-3">
                  <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                    Notable Moments
                  </h4>
                  {(() => {
                    // Get high-confidence moments spread across the video
                    const highConfidence = timeline.filter(p => p.confidence > 0.7)
                    if (highConfidence.length === 0) return (
                      <p className="text-white/40 text-sm">No high-confidence moments detected</p>
                    )
                    
                    // Sort by time and pick moments spread across the timeline
                    const sorted = [...highConfidence].sort((a, b) => a.time - b.time)
                    const step = Math.max(1, Math.floor(sorted.length / 5))
                    const moments = sorted.filter((_, i) => i % step === 0).slice(0, 5)
                    
                    return moments.map((point, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-2xl">{EMOTION_EMOJIS[point.emotion]}</span>
                        <div className="flex-1">
                          <span className="capitalize font-medium">{point.emotion}</span>
                          <span className="text-white/50 text-sm ml-2">
                            at {formatTime(point.time)}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-electric">
                          {(point.confidence * 100).toFixed(0)}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* Distribution Tab */}
            {activeTab === 'distribution' && (
              <div className="animate-fade-in">
                {/* Pie chart visualization */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {(() => {
                        let cumulativePercent = 0
                        return sortedEmotions.map(({ emotion, value }) => {
                          const percent = value * 100
                          const strokeDasharray = `${percent} ${100 - percent}`
                          const strokeDashoffset = -cumulativePercent
                          cumulativePercent += percent
                          
                          return (
                            <circle
                              key={emotion}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={EMOTION_COLORS[emotion]}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              pathLength="100"
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-1">
                          {EMOTION_EMOJIS[summary.dominantEmotion]}
                        </div>
                        <div className="text-sm text-white/50">Dominant</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sortedEmotions.map(({ emotion, value }) => (
                    <div 
                      key={emotion}
                      className="p-3 bg-white/5 rounded-lg text-center"
                    >
                      <div className="text-2xl mb-1">{EMOTION_EMOJIS[emotion]}</div>
                      <div className="text-xs text-white/50 capitalize">{emotion}</div>
                      <div 
                        className="text-lg font-semibold"
                        style={{ color: EMOTION_COLORS[emotion] }}
                      >
                        {(value * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Take Again
          </button>
          
          <button
            onClick={downloadResults}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Results
          </button>
          
          <button
            className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl"
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </button>
        </div>
      </div>
    </div>
  )
}

