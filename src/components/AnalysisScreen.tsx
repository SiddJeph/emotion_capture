'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Brain, 
  Activity, 
  CheckCircle2, 
  Loader2,
  Cpu,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap,
  LineChart,
  PieChart,
  Target,
  Gauge
} from 'lucide-react'
import { EmotionDataPoint, EmotionSummary } from '@/lib/supabase/types'
import { OceanAnswer, OceanScores } from '@/lib/ocean/types'
import { analyzeEmotions, EmotionAnalysisResult, EmotionAnalysisStep } from '@/lib/ml/emotion-model'
import { analyzePersonality, PersonalityAnalysisResult, AnalysisStep } from '@/lib/ml/personality-model'

interface AnalysisScreenProps {
  emotionTimeline: EmotionDataPoint[]
  oceanAnswers: OceanAnswer[]
  onComplete: (emotionResult: EmotionAnalysisResult, personalityResult: PersonalityAnalysisResult) => void
}

type AnalysisPhase = 'initializing' | 'emotion' | 'personality' | 'integrating' | 'complete'

export default function AnalysisScreen({ 
  emotionTimeline, 
  oceanAnswers, 
  onComplete 
}: AnalysisScreenProps) {
  const [phase, setPhase] = useState<AnalysisPhase>('initializing')
  const [emotionSteps, setEmotionSteps] = useState<EmotionAnalysisStep[]>([])
  const [personalitySteps, setPersonalitySteps] = useState<AnalysisStep[]>([])
  const [currentEmotionStep, setCurrentEmotionStep] = useState(0)
  const [currentPersonalityStep, setCurrentPersonalityStep] = useState(0)
  const [emotionResult, setEmotionResult] = useState<EmotionAnalysisResult | null>(null)
  const [personalityResult, setPersonalityResult] = useState<PersonalityAnalysisResult | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [integrationProgress, setIntegrationProgress] = useState(0)

  // Run emotion analysis
  const runEmotionAnalysis = useCallback(async () => {
    const result = analyzeEmotions(emotionTimeline)
    setEmotionSteps(result.analysisSteps.map(s => ({ ...s, status: 'pending' as const })))
    
    // Animate through steps
    for (let i = 0; i < result.analysisSteps.length; i++) {
      setEmotionSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx === i ? 'processing' : idx < i ? 'complete' : 'pending'
      })))
      setCurrentEmotionStep(i)
      setOverallProgress((i / (result.analysisSteps.length + 7)) * 50)
      
      await new Promise(resolve => setTimeout(resolve, result.analysisSteps[i].duration))
      
      setEmotionSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'complete' : 'pending'
      })))
    }
    
    setEmotionResult(result)
    return result
  }, [emotionTimeline])

  // Run personality analysis
  const runPersonalityAnalysis = useCallback(async () => {
    const result = analyzePersonality(oceanAnswers)
    setPersonalitySteps(result.analysisSteps.map(s => ({ ...s, status: 'pending' as const })))
    
    // Animate through steps
    for (let i = 0; i < result.analysisSteps.length; i++) {
      setPersonalitySteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx === i ? 'processing' : idx < i ? 'complete' : 'pending'
      })))
      setCurrentPersonalityStep(i)
      setOverallProgress(50 + (i / (result.analysisSteps.length + 1)) * 40)
      
      await new Promise(resolve => setTimeout(resolve, result.analysisSteps[i].duration))
      
      setPersonalitySteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'complete' : 'pending'
      })))
    }
    
    setPersonalityResult(result)
    return result
  }, [oceanAnswers])

  // Run integration phase
  const runIntegration = useCallback(async () => {
    const integrationSteps = [
      { name: 'Cross-validating emotional-personality correlations', duration: 500 },
      { name: 'Computing composite scores', duration: 400 },
      { name: 'Generating final assessment', duration: 600 },
    ]
    
    for (let i = 0; i < integrationSteps.length; i++) {
      setIntegrationProgress((i / integrationSteps.length) * 100)
      await new Promise(resolve => setTimeout(resolve, integrationSteps[i].duration))
    }
    
    setIntegrationProgress(100)
    setOverallProgress(100)
  }, [])

  // Main analysis flow
  useEffect(() => {
    const runAnalysis = async () => {
      // Phase 1: Initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Phase 2: Emotion Analysis
      setPhase('emotion')
      const emotionRes = await runEmotionAnalysis()
      
      // Phase 3: Personality Analysis
      setPhase('personality')
      const personalityRes = await runPersonalityAnalysis()
      
      // Phase 4: Integration
      setPhase('integrating')
      await runIntegration()
      
      // Phase 5: Complete
      setPhase('complete')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onComplete(emotionRes, personalityRes)
    }
    
    runAnalysis()
  }, [runEmotionAnalysis, runPersonalityAnalysis, runIntegration, onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric via-calm to-pulse flex items-center justify-center relative">
            <Cpu className="w-10 h-10 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-electric to-calm opacity-50 animate-ping" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Analyzing Your <span className="gradient-text">Assessment</span>
          </h1>
          <p className="text-white/50">
            Our AI models are processing your responses
          </p>
        </div>

        {/* Overall Progress */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-mono text-electric">{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-electric via-calm to-pulse rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Phase indicators */}
          <div className="flex justify-between mt-4 text-xs">
            {['Emotion Analysis', 'Personality Analysis', 'Integration'].map((label, idx) => {
              const phaseMap: AnalysisPhase[] = ['emotion', 'personality', 'integrating']
              const isActive = phase === phaseMap[idx]
              const isComplete = 
                (idx === 0 && ['personality', 'integrating', 'complete'].includes(phase)) ||
                (idx === 1 && ['integrating', 'complete'].includes(phase)) ||
                (idx === 2 && phase === 'complete')
              
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isComplete ? 'bg-electric text-white' :
                    isActive ? 'border-2 border-electric text-electric' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {isComplete ? '✓' : idx + 1}
                  </div>
                  <span className={isActive || isComplete ? 'text-white' : 'text-white/40'}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Analysis Panels */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Emotion Analysis Panel */}
          <div className={`glass rounded-xl overflow-hidden transition-all ${
            phase === 'emotion' ? 'ring-2 ring-electric' : ''
          }`}>
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                phase === 'emotion' ? 'bg-electric' : 
                ['personality', 'integrating', 'complete'].includes(phase) ? 'bg-electric/50' : 
                'bg-white/10'
              }`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Emotion Analysis</h3>
                <p className="text-xs text-white/50">
                  {emotionResult 
                    ? `${emotionResult.metadata.modelVersion}`
                    : 'Processing facial expression data'
                  }
                </p>
              </div>
              {['personality', 'integrating', 'complete'].includes(phase) && (
                <CheckCircle2 className="w-5 h-5 text-electric ml-auto" />
              )}
            </div>
            
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {phase === 'initializing' ? (
                <div className="flex items-center gap-3 text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Waiting to start...</span>
                </div>
              ) : (
                emotionSteps.map((step, idx) => (
                  <AnalysisStepRow key={step.id} step={step} index={idx} />
                ))
              )}
              
              {emotionResult && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-electric">
                        {emotionResult.eqScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-white/50">EQ Score</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-calm">
                        {emotionResult.emotionalStability.toFixed(0)}%
                      </div>
                      <div className="text-xs text-white/50">Stability</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personality Analysis Panel */}
          <div className={`glass rounded-xl overflow-hidden transition-all ${
            phase === 'personality' ? 'ring-2 ring-calm' : ''
          }`}>
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                phase === 'personality' ? 'bg-calm' : 
                ['integrating', 'complete'].includes(phase) ? 'bg-calm/50' : 
                'bg-white/10'
              }`}>
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Personality Analysis</h3>
                <p className="text-xs text-white/50">
                  {personalityResult 
                    ? `${personalityResult.metadata.modelVersion}`
                    : 'Processing questionnaire responses'
                  }
                </p>
              </div>
              {['integrating', 'complete'].includes(phase) && (
                <CheckCircle2 className="w-5 h-5 text-calm ml-auto" />
              )}
            </div>
            
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {['initializing', 'emotion'].includes(phase) ? (
                <div className="flex items-center gap-3 text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Waiting for emotion analysis...</span>
                </div>
              ) : (
                personalitySteps.map((step, idx) => (
                  <AnalysisStepRow key={step.id} step={step} index={idx} />
                ))
              )}
              
              {personalityResult && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-calm">
                        {personalityResult.traitProfile}
                      </div>
                      <div className="text-xs text-white/50">Profile Type</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-warm">
                        {(personalityResult.consistency * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-white/50">Consistency</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Phase */}
        {phase === 'integrating' && (
          <div className="mt-6 glass rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-electric to-calm flex items-center justify-center">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold">Final Integration</h3>
                <p className="text-xs text-white/50">Cross-validating and computing final scores</p>
              </div>
            </div>
            
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-electric to-calm rounded-full transition-all duration-300"
                style={{ width: `${integrationProgress}%` }}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="flex items-center justify-center gap-2 text-white/50">
                <LineChart className="w-4 h-4" />
                Correlation Analysis
              </div>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <PieChart className="w-4 h-4" />
                Score Synthesis
              </div>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Target className="w-4 h-4" />
                Final Scoring
              </div>
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="mt-6 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-electric/20 rounded-xl text-electric">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Analysis Complete!</span>
            </div>
            <p className="text-white/50 mt-2 text-sm">Preparing your personalized results...</p>
          </div>
        )}

        {/* Model Info Footer */}
        <div className="mt-8 text-center text-xs text-white/30">
          <div className="flex items-center justify-center gap-4">
            <span>🧠 OCEAN-IRT-v2.1</span>
            <span>|</span>
            <span>🎭 EMOTION-MARKOV-v1.3</span>
            <span>|</span>
            <span>⚡ Real-time Analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Analysis Step Row Component
function AnalysisStepRow({ 
  step, 
  index 
}: { 
  step: EmotionAnalysisStep | AnalysisStep
  index: number 
}) {
  const getIcon = () => {
    switch (step.status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-electric" />
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-electric" />
      default:
        return <div className="w-4 h-4 rounded-full bg-white/10" />
    }
  }

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
        step.status === 'processing' 
          ? 'bg-electric/10 border border-electric/30' 
          : step.status === 'complete'
            ? 'bg-white/5'
            : 'opacity-50'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: step.status === 'processing' ? 'pulse 1s infinite' : 'none'
      }}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            step.status === 'pending' ? 'text-white/50' : ''
          }`}>
            {step.name}
          </span>
          {step.result && step.status === 'complete' && (
            <span className="text-xs font-mono text-electric">
              {step.result.value}
            </span>
          )}
        </div>
        <p className="text-xs text-white/40 mt-0.5">{step.description}</p>
        {step.result && step.status === 'complete' && (
          <p className="text-xs text-white/60 mt-1">
            → {step.result.details}
          </p>
        )}
      </div>
    </div>
  )
}

