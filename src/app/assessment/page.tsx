'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import LandingScreen from '@/components/LandingScreen'
import ModelLoader from '@/components/ModelLoader'
import CalibrationScreen from '@/components/CalibrationScreen'
import AssessmentEngine from '@/components/AssessmentEngine'
import OceanQuestionnaire from '@/components/OceanQuestionnaire'
import AnalysisScreen from '@/components/AnalysisScreen'
import CombinedResults from '@/components/CombinedResults'
import { EmotionDataPoint, EmotionSummary } from '@/lib/supabase/types'
import { OceanScores, OceanAnswer } from '@/lib/ocean/types'
import { Job, calculateJobMatch } from '@/lib/jobs/types'
import { EmotionAnalysisResult } from '@/lib/ml/emotion-model'
import { PersonalityAnalysisResult } from '@/lib/ml/personality-model'
import { Loader2, LogOut, User, CheckCircle2, ArrowRight, Briefcase, MapPin, Zap, Home, Brain } from 'lucide-react'

type AppState = 
  | 'landing' 
  | 'loading' 
  | 'calibration' 
  | 'round1_assessment' 
  | 'round1_complete'
  | 'round2_questionnaire'
  | 'analyzing'  // NEW: ML Analysis phase
  | 'results'

interface EmotionResult {
  timeline: EmotionDataPoint[]
  summary: EmotionSummary
}

interface VideoConfig {
  url: string
  id: string
}

interface ApplicationContext {
  id: string
  job: Job | null
}

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [appState, setAppState] = useState<AppState>('landing')
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({ url: '', id: '' })
  
  // Application context (if coming from a job application)
  const [applicationContext, setApplicationContext] = useState<ApplicationContext | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)
  
  // Round 1: Emotion Detection
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null)
  
  // Round 2: OCEAN Personality
  const [oceanScores, setOceanScores] = useState<OceanScores | null>(null)
  const [oceanAnswers, setOceanAnswers] = useState<OceanAnswer[]>([])
  
  // ML Analysis Results
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysisResult | null>(null)
  const [personalityAnalysis, setPersonalityAnalysis] = useState<PersonalityAnalysisResult | null>(null)
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitWarning, setSubmitWarning] = useState<string | null>(null)

  // Load application context if applicationId is provided
  useEffect(() => {
    const applicationId = searchParams.get('applicationId')
    
    if (applicationId && user?.id) {
      setLoadingContext(true)
      fetch(`/api/applications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const app = data.data.find((a: any) => a.id === applicationId)
            if (app) {
              setApplicationContext({
                id: app.id,
                job: app.job,
              })
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingContext(false))
    } else {
      setLoadingContext(false)
    }
  }, [searchParams, user?.id])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleStartAssessment = useCallback((videoUrl: string, videoId: string) => {
    setVideoConfig({ url: videoUrl, id: videoId })
    setAppState('loading')
  }, [])

  const handleModelsLoaded = useCallback(() => {
    setAppState('calibration')
  }, [])

  const handleCalibrationComplete = useCallback(() => {
    setAppState('round1_assessment')
  }, [])

  // Round 1 Complete - Emotion Detection finished
  const handleRound1Complete = useCallback((data: EmotionResult) => {
    setEmotionResult(data)
    setAppState('round1_complete')
  }, [])

  // Proceed to Round 2
  const handleProceedToRound2 = () => {
    setAppState('round2_questionnaire')
  }

  // Round 2 Complete - OCEAN finished, proceed to analysis
  const handleRound2Complete = useCallback((scores: OceanScores, answers: OceanAnswer[]) => {
    setOceanScores(scores)
    setOceanAnswers(answers)
    // Instead of going directly to results, go to analysis phase
    setAppState('analyzing')
  }, [])

  // Analysis Complete - Both ML models finished
  const handleAnalysisComplete = useCallback(async (
    emotionRes: EmotionAnalysisResult, 
    personalityRes: PersonalityAnalysisResult
  ) => {
    setEmotionAnalysis(emotionRes)
    setPersonalityAnalysis(personalityRes)
    
    // Update ocean scores from the ML model
    setOceanScores(personalityRes.scores)
    
    // Move to results
    setAppState('results')
    
    // Submit all results to database
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    setSubmitWarning(null)

    try {
      // Save assessment results
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoConfig.id,
          timeline: emotionResult?.timeline || [],
          summary: {
            ...emotionRes.summary,
            oceanScores: personalityRes.scores,
            // Include ML analysis metadata
            mlAnalysis: {
              emotionModel: emotionRes.metadata.modelVersion,
              personalityModel: personalityRes.metadata.modelVersion,
              eqScore: emotionRes.eqScore,
              emotionalStability: emotionRes.emotionalStability,
              traitProfile: personalityRes.traitProfile,
              consistency: personalityRes.consistency,
            }
          },
          userId: user?.id || null,
          applicationId: applicationContext?.id || null,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save results')
      }

      // If there's an application context, update the application status
      if (applicationContext?.id && applicationContext.job) {
        const matchScore = calculateJobMatch(applicationContext.job, personalityRes.scores)
        
        await fetch('/api/applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: applicationContext.id,
            status: 'assessment_completed',
            assessmentId: responseData.data?.id,
            matchScore,
          }),
        })
      }

      if (responseData.warning) {
        setSubmitWarning(responseData.warning)
      }
      
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to save results')
    } finally {
      setIsSubmitting(false)
    }
  }, [videoConfig.id, emotionResult, user?.id, applicationContext])

  const handleRestart = useCallback(() => {
    // If there was an application context, go back to dashboard
    if (applicationContext) {
      router.push('/dashboard')
      return
    }
    
    setEmotionResult(null)
    setOceanScores(null)
    setOceanAnswers([])
    setEmotionAnalysis(null)
    setPersonalityAnalysis(null)
    setIsSubmitting(false)
    setSubmitError(null)
    setSubmitSuccess(false)
    setSubmitWarning(null)
    setAppState('landing')
    setVideoConfig({ url: '', id: '' })
  }, [applicationContext, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (authLoading || loadingContext) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="noise-overlay" />
      
      {/* User Header */}
      {isAuthenticated && ['landing', 'round1_complete', 'results'].includes(appState) && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>
            
            {/* Application context badge */}
            {applicationContext?.job && (
              <div className="glass px-4 py-2 rounded-lg flex items-center gap-2 border border-electric/30 bg-electric/5">
                <Briefcase className="w-4 h-4 text-electric" />
                <span className="text-sm">
                  Assessing for: <strong className="text-electric">{applicationContext.job.title}</strong>
                </span>
              </div>
            )}
          </div>
          
          {/* Right side - User info */}
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <User className="w-4 h-4 text-electric" />
              <span className="text-sm">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="glass px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {appState === 'landing' && (
        <>
          {/* Job context banner */}
          {applicationContext?.job && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
              <div className="glass rounded-xl p-6 border border-electric/30 bg-electric/5 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {applicationContext.job.logo || '💼'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-electric mb-1">AI Assessment for Job Application</div>
                    <h3 className="text-lg font-semibold">{applicationContext.job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <span>{applicationContext.job.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {applicationContext.job.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-electric">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Match</span>
                    </div>
                    <div className="text-xs text-white/50">Will be calculated</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <LandingScreen onStart={handleStartAssessment} />
        </>
      )}

      {appState === 'loading' && (
        <ModelLoader onLoaded={handleModelsLoaded} />
      )}

      {appState === 'calibration' && (
        <CalibrationScreen onReady={handleCalibrationComplete} />
      )}

      {appState === 'round1_assessment' && (
        <AssessmentEngine
          videoSrc={videoConfig.url}
          videoId={videoConfig.id}
          onComplete={handleRound1Complete}
        />
      )}

      {/* Round 1 Complete - Transition Screen */}
      {appState === 'round1_complete' && emotionResult && (
        <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
          <div className="max-w-lg w-full text-center animate-fade-in mt-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric/20 to-calm/20 flex items-center justify-center glow-electric relative">
              <CheckCircle2 className="w-10 h-10 text-electric" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-electric rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-3">
              Round 1 <span className="gradient-text">Complete!</span>
            </h2>
            
            <p className="text-white/50 mb-6">
              Great job! We captured <strong className="text-white">{emotionResult.timeline.length}</strong> emotional data points.
              Your dominant emotion was <strong className="text-electric capitalize">{emotionResult.summary.dominantEmotion}</strong>.
            </p>

            {applicationContext?.job && (
              <div className="glass rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                    {applicationContext.job.logo || '💼'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white/50">Applying for</div>
                    <div className="font-medium">{applicationContext.job.title}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-xl p-6 mb-8">
              <h3 className="text-sm text-white/50 uppercase tracking-wider mb-4">Up Next</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-calm/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-calm" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Round 2: Personality Assessment</div>
                  <div className="text-sm text-white/50">25 questions • OCEAN Big Five Test</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToRound2}
              className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 mx-auto group"
            >
              Continue to Round 2
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {appState === 'round2_questionnaire' && (
        <OceanQuestionnaire onComplete={handleRound2Complete} />
      )}

      {/* ML Analysis Phase - NEW */}
      {appState === 'analyzing' && emotionResult && oceanAnswers.length > 0 && (
        <AnalysisScreen
          emotionTimeline={emotionResult.timeline}
          oceanAnswers={oceanAnswers}
          onComplete={handleAnalysisComplete}
        />
      )}

      {appState === 'results' && emotionResult && oceanScores && (
        <div className="pt-16">
          <CombinedResults
            emotionTimeline={emotionResult.timeline}
            emotionSummary={emotionResult.summary}
            oceanScores={oceanScores}
            videoId={videoConfig.id}
            onRestart={handleRestart}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            submitWarning={submitWarning}
            applicationContext={applicationContext}
            emotionAnalysis={emotionAnalysis}
            personalityAnalysis={personalityAnalysis}
          />
        </div>
      )}
    </main>
  )
}

// Main component with Suspense wrapper for useSearchParams
export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
