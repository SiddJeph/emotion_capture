'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  Download, 
  RotateCcw, 
  Share2,
  BarChart3,
  Brain,
  Sparkles,
  Activity,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  MapPin,
  ArrowRight,
  Cpu,
  Gauge,
  LineChart,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EmotionDataPoint, EmotionSummary, EmotionType } from '@/lib/supabase/types'
import { OceanScores, OCEAN_DESCRIPTIONS, OceanTrait, getDominantTrait } from '@/lib/ocean/types'
import { Job, calculateJobMatch, getMatchingTraits } from '@/lib/jobs/types'
import { EmotionAnalysisResult } from '@/lib/ml/emotion-model'
import { PersonalityAnalysisResult } from '@/lib/ml/personality-model'

interface ApplicationContext {
  id: string
  job: Job | null
}

interface CombinedResultsProps {
  // Emotion Detection Results
  emotionTimeline: EmotionDataPoint[]
  emotionSummary: EmotionSummary
  // OCEAN Results
  oceanScores: OceanScores
  // Meta
  videoId: string
  onRestart: () => void
  isSubmitting: boolean
  submitError: string | null
  submitSuccess: boolean
  submitWarning?: string | null
  applicationContext?: ApplicationContext | null
  // ML Analysis Results
  emotionAnalysis?: EmotionAnalysisResult | null
  personalityAnalysis?: PersonalityAnalysisResult | null
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

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#fcd34d',
  sad: '#60a5fa',
  angry: '#f87171',
  fearful: '#a78bfa',
  disgusted: '#4ade80',
  surprised: '#f472b6',
  neutral: '#94a3b8',
}

export default function CombinedResults({
  emotionTimeline,
  emotionSummary,
  oceanScores,
  videoId,
  onRestart,
  isSubmitting,
  submitError,
  submitSuccess,
  submitWarning,
  applicationContext,
  emotionAnalysis,
  personalityAnalysis,
}: CombinedResultsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'emotions' | 'personality' | 'analysis'>('overview')
  
  const dominantOceanTrait = getDominantTrait(oceanScores)
  const oceanTraitInfo = OCEAN_DESCRIPTIONS[dominantOceanTrait]

  // Calculate job match if we have application context
  const jobMatchScore = applicationContext?.job 
    ? calculateJobMatch(applicationContext.job, oceanScores) 
    : null
  const jobMatchingTraits = applicationContext?.job 
    ? getMatchingTraits(applicationContext.job, oceanScores) 
    : []

  // Use ML analysis scores if available
  const eqScore = emotionAnalysis?.eqScore ?? Math.round(emotionSummary.averageConfidence * 80 + 20)
  const emotionalStability = emotionAnalysis?.emotionalStability ?? 70
  const traitProfile = personalityAnalysis?.traitProfile ?? 'Balanced Individual'
  const consistency = personalityAnalysis?.consistency ?? 0.75

  // Calculate compatibility score (fun metric combining both)
  const compatibilityScore = jobMatchScore || Math.round(
    (eqScore * 0.4) + (oceanScores[dominantOceanTrait] * 0.6)
  )

  const downloadResults = () => {
    const data = {
      videoId,
      emotionResults: {
        summary: emotionSummary,
        timeline: emotionTimeline,
      },
      personalityResults: {
        scores: oceanScores,
        dominantTrait: dominantOceanTrait,
      },
      compatibilityScore,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assessment-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen p-6 grid-bg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric via-calm to-pulse flex items-center justify-center glow-electric relative">
            <CheckCircle2 className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-warm rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            Assessment <span className="gradient-text">Complete!</span>
          </h1>
          <p className="text-white/50">
            Both rounds finished. Here&apos;s your comprehensive profile.
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
                <span className="text-calm">Saving results...</span>
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

        {/* Job Application Match Card */}
        {applicationContext?.job && jobMatchScore !== null && (
          <div className="mb-8 glass rounded-2xl overflow-hidden border-2 border-electric/30 animate-fade-in">
            <div className="bg-gradient-to-r from-electric/20 to-calm/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                  {applicationContext.job.logo || '💼'}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-electric mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Application Match
                  </div>
                  <h3 className="text-xl font-semibold">{applicationContext.job.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span>{applicationContext.job.company}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {applicationContext.job.location}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${
                    jobMatchScore >= 80 ? 'text-electric' :
                    jobMatchScore >= 60 ? 'text-calm' :
                    'text-warm'
                  }`}>
                    {jobMatchScore}%
                  </div>
                  <div className="text-sm text-white/50">Match Score</div>
                </div>
              </div>
            </div>
            
            {/* Trait Matches */}
            {jobMatchingTraits.length > 0 && (
              <div className="p-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Personality Trait Match
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {jobMatchingTraits.map(trait => {
                    const info = OCEAN_DESCRIPTIONS[trait.trait]
                    return (
                      <div key={trait.trait} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <span className="text-xl">{info.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{info.name}</div>
                          <div className="text-xs text-white/50">
                            Your score: {trait.userScore}% | Required: {trait.requiredScore}%
                          </div>
                        </div>
                        {trait.matched ? (
                          <CheckCircle2 className="w-5 h-5 text-electric" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warm" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="p-6 border-t border-white/10 bg-electric/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-electric">Application Status Updated!</div>
                <div className="text-sm text-white/60">Your assessment has been submitted. We&apos;ll review your profile.</div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Score Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Compatibility Score */}
          <div className="glass rounded-xl p-6 text-center col-span-1 md:col-span-1">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
              {applicationContext?.job ? 'Job Match' : 'Overall Score'}
            </div>
            <div className="text-5xl font-bold gradient-text mb-2">{compatibilityScore}</div>
            <div className="text-sm text-white/50">out of 100</div>
          </div>

          {/* Emotion Result */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-electric" />
              <span className="text-sm text-white/50">Emotional Response</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{EMOTION_EMOJIS[emotionSummary.dominantEmotion]}</span>
              <div>
                <div className="text-xl font-semibold capitalize" style={{ color: EMOTION_COLORS[emotionSummary.dominantEmotion] }}>
                  {emotionSummary.dominantEmotion}
                </div>
                <div className="text-sm text-white/50">
                  {(emotionSummary.averageConfidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
          </div>

          {/* Personality Result */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-calm" />
              <span className="text-sm text-white/50">Personality Trait</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{oceanTraitInfo.emoji}</span>
              <div>
                <div className="text-xl font-semibold" style={{ color: oceanTraitInfo.color }}>
                  {oceanTraitInfo.name}
                </div>
                <div className="text-sm text-white/50">
                  {oceanScores[dominantOceanTrait].toFixed(0)}% score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl overflow-hidden mb-8">
          <div className="flex border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: Sparkles },
              { id: 'emotions', label: 'Emotions', icon: Activity },
              { id: 'personality', label: 'Personality', icon: Brain },
              { id: 'analysis', label: 'ML Analysis', icon: Cpu },
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
              <div className="animate-fade-in space-y-6">
                <div className="text-center p-8 bg-white/5 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Your Profile Summary</h3>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-5xl">{EMOTION_EMOJIS[emotionSummary.dominantEmotion]}</div>
                    <div className="text-3xl text-white/30">+</div>
                    <div className="text-5xl">{oceanTraitInfo.emoji}</div>
                  </div>
                  <p className="text-white/70 max-w-md mx-auto">
                    Your dominant emotional response was <strong className="capitalize">{emotionSummary.dominantEmotion}</strong>, 
                    combined with high <strong>{oceanTraitInfo.name}</strong> personality traits.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-white/50" />
                    <div className="text-lg font-semibold">{emotionSummary.duration.toFixed(1)}s</div>
                    <div className="text-xs text-white/40">Video Duration</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <Activity className="w-5 h-5 mx-auto mb-2 text-white/50" />
                    <div className="text-lg font-semibold">{emotionSummary.totalDataPoints}</div>
                    <div className="text-xs text-white/40">Data Points</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <Target className="w-5 h-5 mx-auto mb-2 text-white/50" />
                    <div className="text-lg font-semibold">{(emotionSummary.averageConfidence * 100).toFixed(0)}%</div>
                    <div className="text-xs text-white/40">Accuracy</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <BarChart3 className="w-5 h-5 mx-auto mb-2 text-white/50" />
                    <div className="text-lg font-semibold">25</div>
                    <div className="text-xs text-white/40">Questions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Emotions Tab */}
            {activeTab === 'emotions' && (
              <div className="animate-fade-in space-y-6">
                <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Emotion Distribution
                </h4>
                <div className="space-y-4">
                  {Object.entries(emotionSummary.emotionDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([emotion, value]) => (
                      <div key={emotion} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{EMOTION_EMOJIS[emotion as EmotionType]}</span>
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
                              backgroundColor: EMOTION_COLORS[emotion as EmotionType],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Personality Tab */}
            {activeTab === 'personality' && (
              <div className="animate-fade-in space-y-6">
                <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  OCEAN Personality Profile
                </h4>
                <div className="space-y-4">
                  {(Object.entries(oceanScores) as [OceanTrait, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([trait, score]) => {
                      const info = OCEAN_DESCRIPTIONS[trait]
                      return (
                        <div key={trait} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{info.emoji}</span>
                              <span>{info.name}</span>
                            </span>
                            <span className="font-mono" style={{ color: info.color }}>
                              {score.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${score}%`,
                                backgroundColor: info.color,
                              }}
                            />
                          </div>
                          <p className="text-xs text-white/40">
                            {score >= 60 ? info.high : info.low}
                          </p>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* ML Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-5 h-5 text-electric" />
                  <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                    Machine Learning Analysis
                  </h4>
                </div>

                {/* Model Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-electric/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-electric" />
                      </div>
                      <div>
                        <div className="font-semibold">Emotion Analysis</div>
                        <div className="text-xs text-white/50">
                          {emotionAnalysis?.metadata.modelVersion || 'EMOTION-MARKOV-v1.3'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">EQ Score</span>
                        <span className="font-mono text-electric">{eqScore.toFixed(0)}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Emotional Stability</span>
                        <span className="font-mono text-calm">{emotionalStability.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Responsiveness</span>
                        <span className="font-mono text-warm">{emotionAnalysis?.responsiveness?.toFixed(0) || 75}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Expressiveness</span>
                        <span className="font-mono text-pulse">{emotionAnalysis?.expressiveness?.toFixed(0) || 68}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-calm/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-calm" />
                      </div>
                      <div>
                        <div className="font-semibold">Personality Analysis</div>
                        <div className="text-xs text-white/50">
                          {personalityAnalysis?.metadata.modelVersion || 'OCEAN-IRT-v2.1'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Profile Type</span>
                        <span className="font-mono text-calm">{traitProfile}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Consistency (α)</span>
                        <span className="font-mono text-electric">{(consistency * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Questions Answered</span>
                        <span className="font-mono">{personalityAnalysis?.metadata.answeredQuestions || 25}/25</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Confidence Avg</span>
                        <span className="font-mono text-warm">
                          {personalityAnalysis?.confidence 
                            ? Math.round(Object.values(personalityAnalysis.confidence).reduce((a, b) => a + b, 0) / 5 * 100)
                            : 82}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Steps */}
                {(emotionAnalysis?.analysisSteps || personalityAnalysis?.analysisSteps) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <LineChart className="w-4 h-4" />
                      Analysis Pipeline
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {emotionAnalysis?.analysisSteps.slice(0, 4).map((step, idx) => (
                        <div key={`e-${idx}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-electric flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{step.name}</div>
                            <div className="text-xs text-white/40">{step.result?.value}</div>
                          </div>
                        </div>
                      ))}
                      {personalityAnalysis?.analysisSteps.slice(0, 4).map((step, idx) => (
                        <div key={`p-${idx}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-calm flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{step.name}</div>
                            <div className="text-xs text-white/40">{step.result?.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Quality */}
                <div className="p-5 bg-gradient-to-r from-electric/5 to-calm/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-electric" />
                    <span className="font-semibold">Data Quality & Reliability</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-electric">
                        {emotionAnalysis?.metadata.validDataPoints || emotionSummary.totalDataPoints}
                      </div>
                      <div className="text-xs text-white/50">Valid Data Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-calm">
                        {emotionAnalysis?.metadata.captureRate?.toFixed(1) || (emotionSummary.totalDataPoints / emotionSummary.duration).toFixed(1)}
                      </div>
                      <div className="text-xs text-white/50">Captures/Second</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warm">
                        {((consistency + emotionSummary.averageConfidence) / 2 * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-white/50">Overall Reliability</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
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
            Download Report
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

