'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  User, 
  LogOut, 
  Briefcase, 
  Brain, 
  Activity, 
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Award,
  ArrowRight,
  MapPin,
  Calendar,
  FileCheck,
  Loader2
} from 'lucide-react'
import { Job, JobApplication, STATUS_INFO } from '@/lib/jobs/types'
import { OceanScores, OCEAN_DESCRIPTIONS, OceanTrait, getDominantTrait } from '@/lib/ocean/types'

interface EnrichedApplication extends JobApplication {
  job: Job | null
}

// Demo OCEAN scores (in production, fetch from assessment results)
const DEMO_OCEAN_SCORES: OceanScores = {
  openness: 75,
  conscientiousness: 68,
  extraversion: 62,
  agreeableness: 71,
  neuroticism: 38,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [applications, setApplications] = useState<EnrichedApplication[]>([])
  const [oceanScores, setOceanScores] = useState<OceanScores | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingAssessments: 0,
    inProgress: 0,
    profileCompletion: 0,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch user data
  useEffect(() => {
    if (!user?.id) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/applications?userId=${user?.id}`)
        const data = await res.json()
        
        if (data.success) {
          setApplications(data.data)
          
          // Calculate stats
          const apps: EnrichedApplication[] = data.data
          const pending = apps.filter(a => a.status === 'assessment_pending').length
          const inProgress = apps.filter(a => 
            !['rejected', 'withdrawn', 'offered'].includes(a.status)
          ).length
          
          // Check if user has completed any assessment
          const hasAssessment = apps.some(a => a.assessmentId || a.status === 'assessment_completed')
          
          setStats({
            totalApplications: apps.length,
            pendingAssessments: pending,
            inProgress,
            profileCompletion: hasAssessment ? 100 : 40,
          })
          
          // Set OCEAN scores if assessment completed
          if (hasAssessment) {
            setOceanScores(DEMO_OCEAN_SCORES)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    )
  }

  const dominantTrait = oceanScores ? getDominantTrait(oceanScores) : null
  const dominantTraitInfo = dominantTrait ? OCEAN_DESCRIPTIONS[dominantTrait] : null

  // Get ongoing selections (applications in progress)
  const ongoingSelections = applications.filter(a => 
    !['rejected', 'withdrawn', 'offered'].includes(a.status)
  ).slice(0, 5)

  // Get pending assessments
  const pendingAssessments = applications.filter(a => a.status === 'assessment_pending')

  return (
    <div className="min-h-screen grid-bg">
      <div className="noise-overlay" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-calm flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">AI Career Hub</h1>
                  <p className="text-xs text-white/50">Powered by Emotion AI</p>
                </div>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-electric font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/jobs')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Jobs
              </button>
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
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-white/60">
            Your AI-powered career journey continues. Here's your progress.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Briefcase className="w-8 h-8 text-electric" />
                  <span className="text-3xl font-bold">{stats.totalApplications}</span>
                </div>
                <div className="text-white/60 text-sm">Total Applications</div>
              </div>
              
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-calm" />
                  <span className="text-3xl font-bold">{stats.inProgress}</span>
                </div>
                <div className="text-white/60 text-sm">In Progress</div>
              </div>
              
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-warm" />
                  <span className="text-3xl font-bold">{stats.pendingAssessments}</span>
                </div>
                <div className="text-white/60 text-sm">Pending Assessments</div>
              </div>
              
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-pulse" />
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-bold">{stats.profileCompletion}</span>
                    <span className="text-lg text-white/50">%</span>
                  </div>
                </div>
                <div className="text-white/60 text-sm">Profile Completion</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Assessments Alert */}
                {pendingAssessments.length > 0 && (
                  <div className="glass rounded-xl p-6 border-2 border-warm/50 bg-warm/5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warm/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-warm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-warm mb-1">
                          {pendingAssessments.length} Assessment{pendingAssessments.length > 1 ? 's' : ''} Pending
                        </h3>
                        <p className="text-sm text-white/60 mb-4">
                          Complete your assessments to increase your chances of getting hired!
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {pendingAssessments.slice(0, 2).map(app => (
                            <button
                              key={app.id}
                              onClick={() => router.push(`/assessment?applicationId=${app.id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-warm/20 hover:bg-warm/30 rounded-lg text-warm text-sm transition-colors"
                            >
                              <Brain className="w-4 h-4" />
                              {app.job?.title || 'Take Assessment'}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ongoing Selections */}
                <div className="glass rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-electric" />
                      Ongoing Selections
                    </h3>
                    <button 
                      onClick={() => router.push('/jobs')}
                      className="text-sm text-electric hover:text-electric/80 flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {ongoingSelections.length === 0 ? (
                    <div className="p-12 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <p className="text-white/50 mb-4">No ongoing applications</p>
                      <button
                        onClick={() => router.push('/jobs')}
                        className="btn-primary px-6 py-2 rounded-lg inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Browse Jobs
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {ongoingSelections.map((app) => {
                        const statusInfo = STATUS_INFO[app.status]
                        return (
                          <div key={app.id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                                {app.job?.logo || '💼'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{app.job?.title}</h4>
                                <p className="text-sm text-white/50 truncate">{app.job?.company}</p>
                              </div>
                              <div 
                                className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                              >
                                <span>{statusInfo.icon}</span>
                                {statusInfo.label}
                              </div>
                              {app.status === 'assessment_pending' && (
                                <button
                                  onClick={() => router.push(`/assessment?applicationId=${app.id}`)}
                                  className="px-3 py-1.5 bg-electric hover:bg-electric/80 rounded-lg text-xs flex items-center gap-1"
                                >
                                  <Brain className="w-3 h-3" />
                                  Assess
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/jobs')}
                    className="glass rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-electric/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-electric" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Find Matching Jobs</h4>
                        <p className="text-sm text-white/50">AI-powered recommendations</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => router.push('/assessment')}
                    className="glass rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-calm/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6 text-calm" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Take Practice Test</h4>
                        <p className="text-sm text-white/50">Improve your profile</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Column - Profile */}
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="glass rounded-xl border border-white/10 overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-electric via-calm to-pulse" />
                  <div className="px-6 pb-6 -mt-10">
                    <div className="w-20 h-20 rounded-2xl bg-dark border-4 border-dark flex items-center justify-center text-3xl mb-4">
                      {user?.name?.charAt(0).toUpperCase() || '👤'}
                    </div>
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-white/50 text-sm">{user?.email}</p>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/50">Profile Completion</span>
                        <span className="font-medium">{stats.profileCompletion}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-electric to-calm rounded-full transition-all"
                          style={{ width: `${stats.profileCompletion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* OCEAN Profile */}
                {oceanScores ? (
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-calm" />
                      Your Personality Profile
                    </h3>
                    
                    {dominantTraitInfo && (
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-4">
                        <span className="text-3xl">{dominantTraitInfo.emoji}</span>
                        <div>
                          <div className="text-sm text-white/50">Dominant Trait</div>
                          <div className="font-semibold" style={{ color: dominantTraitInfo.color }}>
                            {dominantTraitInfo.name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {(Object.entries(oceanScores) as [OceanTrait, number][])
                        .sort((a, b) => b[1] - a[1])
                        .map(([trait, score]) => {
                          const info = OCEAN_DESCRIPTIONS[trait]
                          return (
                            <div key={trait} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1">
                                  {info.emoji} {info.name}
                                </span>
                                <span style={{ color: info.color }}>{score}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${score}%`, backgroundColor: info.color }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    <button 
                      onClick={() => router.push('/assessment')}
                      className="w-full mt-4 p-3 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Retake Assessment
                    </button>
                  </div>
                ) : (
                  <div className="glass rounded-xl p-6 border-2 border-electric/30 bg-electric/5">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-electric/20 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-electric" />
                      </div>
                      <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                      <p className="text-sm text-white/50 mb-4">
                        Take the AI assessment to unlock personalized job matches!
                      </p>
                      <button
                        onClick={() => router.push('/assessment')}
                        className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Take Assessment
                      </button>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-warm" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-electric mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Complete assessments within 24 hours for better visibility</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-electric mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Apply to jobs with 70%+ match score for best results</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-electric mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Retake assessments to improve your profile accuracy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}



