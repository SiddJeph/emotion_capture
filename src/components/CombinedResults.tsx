'use client'

import { 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Briefcase,
  MapPin,
  ArrowRight,
  Home,
  FileCheck,
  Clock,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EmotionDataPoint, EmotionSummary } from '@/lib/supabase/types'
import { OceanScores } from '@/lib/ocean/types'
import { Job } from '@/lib/jobs/types'
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

export default function CombinedResults({
  onRestart,
  isSubmitting,
  submitError,
  submitSuccess,
  submitWarning,
  applicationContext,
}: CombinedResultsProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="glass rounded-3xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-10 text-center border-b border-white/10">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-electric flex items-center justify-center border-4 border-electric/30">
              <CheckCircle2 className="w-14 h-14 text-midnight" />
            </div>
            <h1 className="text-4xl font-bold mb-3">
              Assessment <span className="text-electric">Complete!</span>
            </h1>
            <p className="text-white/60 text-lg">
              Thank you for completing the assessment
            </p>
          </div>

          {/* Status */}
          <div className="p-8">
            {/* Submit Status */}
            {isSubmitting && (
              <div className="mb-6 p-4 rounded-xl bg-calm/20 border border-calm/30 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-calm animate-spin" />
                <span className="text-calm">Submitting your assessment...</span>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-pulse/20 border border-pulse/30 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-pulse" />
                <span className="text-pulse">{submitError}</span>
              </div>
            )}

            {submitWarning && (
              <div className="mb-6 p-4 rounded-xl bg-warm/20 border border-warm/30 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warm" />
                <span className="text-warm text-sm">{submitWarning}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-electric/20 border border-electric/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-electric" />
                <span className="text-electric">Your assessment has been submitted successfully!</span>
              </div>
            )}

            {/* Job Application Info */}
            {applicationContext?.job && (
              <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-7 h-7 text-electric" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-electric mb-1 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      Application Submitted
                    </div>
                    <h3 className="text-lg font-semibold">{applicationContext.job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                      <span>{applicationContext.job.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {applicationContext.job.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                What happens next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-5 h-5 text-electric" />
                  </div>
                  <div>
                    <div className="font-medium">Review in Progress</div>
                    <div className="text-sm text-white/50">
                      Our team will review your assessment results
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-calm/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-calm" />
                  </div>
                  <div>
                    <div className="font-medium">Updates Coming Soon</div>
                    <div className="text-sm text-white/50">
                      You&apos;ll receive updates on your application status in your dashboard
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-warm/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-warm" />
                  </div>
                  <div>
                    <div className="font-medium">Data Privacy</div>
                    <div className="text-sm text-white/50">
                      Your assessment data is securely stored and only accessible to authorized reviewers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 btn-primary px-6 py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-medium"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Additional Note */}
        <p className="text-center text-white/40 text-sm mt-6">
          Need help? Contact our support team at support@emotionai.com
        </p>
      </div>
    </div>
  )
}

