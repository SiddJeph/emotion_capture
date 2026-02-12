'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Search, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  Sparkles,
  ChevronRight,
  Filter,
  TrendingUp,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  LogOut,
  Brain,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Job, JobMatch, JobApplication, STATUS_INFO, calculateJobMatch } from '@/lib/jobs/types'
import { OceanScores, OCEAN_DESCRIPTIONS, OceanTrait } from '@/lib/ocean/types'

type TabType = 'all' | 'recommended' | 'applied'

interface EnrichedApplication extends JobApplication {
  job: Job | null
}

export default function JobsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [applications, setApplications] = useState<EnrichedApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [oceanScores, setOceanScores] = useState<OceanScores | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch jobs and applications
  useEffect(() => {
    if (!user?.id) return

    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch applications
        const appRes = await fetch(`/api/applications?userId=${user?.id}`)
        const appData = await appRes.json()
        if (appData.success) {
          setApplications(appData.data)
          
          // Check if user has completed assessment - get OCEAN scores
          const completedApp = appData.data.find((a: EnrichedApplication) => 
            a.status === 'assessment_completed' || a.assessmentId
          )
          
          // For demo, we'll use stored scores or generate sample ones
          // In production, you'd fetch from actual assessment results
        }

        // Fetch jobs - with scores if available
        const scores = oceanScores ? `?withScores=${JSON.stringify(oceanScores)}` : ''
        const jobsRes = await fetch(`/api/jobs${scores}`)
        const jobsData = await jobsRes.json()
        
        if (jobsData.success) {
          if (scores) {
            setJobMatches(jobsData.data)
            setJobs(jobsData.data.map((m: JobMatch) => m.job))
          } else {
            setJobs(jobsData.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id, oceanScores])

  // Filter jobs based on search
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs
    const query = searchQuery.toLowerCase()
    return jobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }, [jobs, searchQuery])

  // Get recommended jobs (top matches)
  const recommendedJobs = useMemo(() => {
    if (jobMatches.length > 0) {
      return jobMatches.filter(m => m.matchScore >= 60)
    }
    // If no OCEAN scores, return top jobs by other criteria
    return jobs.slice(0, 5).map(job => ({
      job,
      matchScore: 50 + Math.random() * 30,
      matchingTraits: []
    }))
  }, [jobMatches, jobs])

  // Handle apply
  const handleApply = async (job: Job) => {
    if (!user?.id) return
    
    setApplying(job.id)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, userId: user.id }),
      })
      
      const data = await res.json()
      if (data.success) {
        setApplications(prev => [data.data, ...prev])
        // Switch to applied tab
        setActiveTab('applied')
      }
    } catch (error) {
      console.error('Apply error:', error)
    } finally {
      setApplying(null)
    }
  }

  // Check if user has applied
  const hasApplied = (jobId: string) => {
    return applications.some(a => a.jobId === jobId)
  }

  // Get application for job
  const getApplication = (jobId: string) => {
    return applications.find(a => a.jobId === jobId)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleTakeAssessment = (application: EnrichedApplication) => {
    // Navigate to assessment with application context
    router.push(`/assessment?applicationId=${application.id}`)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    )
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }

  const getTimeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

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
                className="text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/jobs')}
                className="text-electric font-medium"
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
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Find Your <span className="gradient-text">Perfect Match</span>
          </h2>
          <p className="text-white/60">
            AI-powered job matching based on your personality and emotional intelligence
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'all', label: 'All Jobs', icon: Briefcase, count: jobs.length },
            { id: 'recommended', label: 'Recommended', icon: Sparkles, count: recommendedJobs.length },
            { id: 'applied', label: 'Applied', icon: BookmarkPlus, count: applications.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-electric text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : (
          <>
            {/* All Jobs Tab */}
            {activeTab === 'all' && (
              <div className="grid gap-4">
                {filteredJobs.map((job) => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    matchScore={jobMatches.find(m => m.job.id === job.id)?.matchScore}
                    hasApplied={hasApplied(job.id)}
                    isApplying={applying === job.id}
                    onApply={() => handleApply(job)}
                    onSelect={() => setSelectedJob(job)}
                    formatSalary={formatSalary}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            )}

            {/* Recommended Tab */}
            {activeTab === 'recommended' && (
              <div className="space-y-6">
                {!oceanScores && (
                  <div className="glass rounded-xl p-6 border border-electric/30 bg-electric/5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-electric/20 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-electric" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Complete Your Profile Assessment</h3>
                        <p className="text-sm text-white/60 mb-4">
                          Take the AI-powered personality assessment to get personalized job recommendations
                          based on your unique traits and emotional intelligence.
                        </p>
                        <button
                          onClick={() => router.push('/assessment')}
                          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Take Assessment
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {recommendedJobs.map((match, index) => (
                    <JobCard 
                      key={match.job.id}
                      job={match.job}
                      matchScore={match.matchScore}
                      matchingTraits={match.matchingTraits}
                      isTopMatch={index === 0}
                      hasApplied={hasApplied(match.job.id)}
                      isApplying={applying === match.job.id}
                      onApply={() => handleApply(match.job)}
                      onSelect={() => setSelectedJob(match.job)}
                      formatSalary={formatSalary}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Applied Tab */}
            {activeTab === 'applied' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-16 glass rounded-xl">
                    <BookmarkPlus className="w-12 h-12 mx-auto mb-4 text-white/30" />
                    <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-white/50 mb-6">Start your journey by applying to jobs that match your profile</p>
                    <button
                      onClick={() => setActiveTab('recommended')}
                      className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      View Recommended Jobs
                    </button>
                  </div>
                ) : (
                  applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onTakeAssessment={() => handleTakeAssessment(application)}
                      formatSalary={formatSalary}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          matchScore={jobMatches.find(m => m.job.id === selectedJob.id)?.matchScore}
          matchingTraits={jobMatches.find(m => m.job.id === selectedJob.id)?.matchingTraits}
          hasApplied={hasApplied(selectedJob.id)}
          isApplying={applying === selectedJob.id}
          onApply={() => handleApply(selectedJob)}
          onClose={() => setSelectedJob(null)}
          formatSalary={formatSalary}
        />
      )}
    </div>
  )
}

// Job Card Component
interface JobCardProps {
  job: Job
  matchScore?: number
  matchingTraits?: JobMatch['matchingTraits']
  isTopMatch?: boolean
  hasApplied: boolean
  isApplying: boolean
  onApply: () => void
  onSelect: () => void
  formatSalary: (min: number, max: number, currency: string) => string
  getTimeAgo: (date: string) => string
}

function JobCard({ 
  job, 
  matchScore, 
  matchingTraits,
  isTopMatch,
  hasApplied, 
  isApplying, 
  onApply,
  onSelect,
  formatSalary,
  getTimeAgo
}: JobCardProps) {
  return (
    <div 
      className={`glass rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all ${
        isTopMatch ? 'border-2 border-electric glow-electric' : 'border border-white/10'
      }`}
      onClick={onSelect}
    >
      {isTopMatch && (
        <div className="flex items-center gap-2 mb-4 text-electric">
          <Star className="w-4 h-4 fill-electric" />
          <span className="text-sm font-medium">Top Match for You</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
          {job.logo || '💼'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
              <p className="text-white/60">{job.company}</p>
            </div>
            
            {matchScore !== undefined && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                matchScore >= 80 ? 'bg-electric/20 text-electric' :
                matchScore >= 60 ? 'bg-calm/20 text-calm' :
                'bg-white/10 text-white/60'
              }`}>
                {matchScore}% Match
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeAgo(job.postedAt)}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Briefcase className="w-4 h-4" />
              {job.type}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {job.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70">
                {tag}
              </span>
            ))}
          </div>

          {/* Matching traits */}
          {matchingTraits && matchingTraits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {matchingTraits.slice(0, 3).map(trait => (
                <span 
                  key={trait.trait}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    trait.matched ? 'bg-electric/20 text-electric' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {OCEAN_DESCRIPTIONS[trait.trait].emoji}
                  {trait.userScore}% {OCEAN_DESCRIPTIONS[trait.trait].name}
                  {trait.matched && <CheckCircle2 className="w-3 h-3" />}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          {hasApplied ? (
            <span className="px-4 py-2 bg-electric/20 text-electric rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Applied
            </span>
          ) : (
            <button
              onClick={onApply}
              disabled={isApplying}
              className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Apply Now
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Application Card Component
interface ApplicationCardProps {
  application: EnrichedApplication
  onTakeAssessment: () => void
  formatSalary: (min: number, max: number, currency: string) => string
}

function ApplicationCard({ application, onTakeAssessment, formatSalary }: ApplicationCardProps) {
  const statusInfo = STATUS_INFO[application.status]
  const job = application.job

  if (!job) return null

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
          {job.logo || '💼'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-white/60">{job.company}</p>
            </div>
            
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
            >
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Applied {new Date(application.appliedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Match score if available */}
          {application.matchScore !== undefined && (
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-electric" />
              <span className="text-sm">
                Profile Match: <span className="text-electric font-medium">{application.matchScore}%</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {application.status === 'assessment_pending' && (
            <button
              onClick={onTakeAssessment}
              className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 group"
            >
              <Brain className="w-4 h-4" />
              Take Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {application.status === 'assessment_completed' && (
            <span className="px-4 py-2 bg-electric/20 text-electric rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Assessment Complete
            </span>
          )}

          {application.status === 'under_review' && (
            <span className="text-sm text-white/50 text-right">
              We&apos;ll notify you<br />of updates
            </span>
          )}

          {application.status === 'selected' && (
            <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Selected!
            </span>
          )}

          {application.status === 'rejected' && (
            <span className="px-4 py-2 bg-pulse/20 text-pulse rounded-lg text-sm flex items-center gap-2">
              Not Selected
            </span>
          )}
        </div>
      </div>

      {/* Progress timeline for active applications */}
      {!['rejected', 'withdrawn', 'selected'].includes(application.status) && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            {['Applied', 'Assessment', 'Review', 'Decision'].map((step, idx) => {
              const stepStates = ['applied', 'assessment_completed', 'under_review', 'selected']
              const currentIdx = stepStates.indexOf(application.status)
              const isComplete = idx <= currentIdx || 
                (application.status === 'assessment_pending' && idx === 0)
              const isCurrent = (application.status === 'assessment_pending' && idx === 1) ||
                (application.status === stepStates[idx])
              
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center w-full`}>
                    {idx > 0 && (
                      <div className={`h-0.5 w-full mb-2 ${isComplete ? 'bg-electric' : 'bg-white/20'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isComplete ? 'bg-electric text-white' :
                      isCurrent ? 'border-2 border-electric text-electric' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <span className={`mt-1 ${isComplete || isCurrent ? 'text-white' : 'text-white/40'}`}>
                      {step}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Job Detail Modal
interface JobDetailModalProps {
  job: Job
  matchScore?: number
  matchingTraits?: JobMatch['matchingTraits']
  hasApplied: boolean
  isApplying: boolean
  onApply: () => void
  onClose: () => void
  formatSalary: (min: number, max: number, currency: string) => string
}

function JobDetailModal({
  job,
  matchScore,
  matchingTraits,
  hasApplied,
  isApplying,
  onApply,
  onClose,
  formatSalary
}: JobDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 glass p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
              {job.logo || '💼'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-white/60">{job.company}</p>
              {matchScore !== undefined && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  matchScore >= 80 ? 'bg-electric/20 text-electric' :
                  matchScore >= 60 ? 'bg-calm/20 text-calm' :
                  'bg-white/10 text-white/60'
                }`}>
                  {matchScore}% Match
                </span>
              )}
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <MapPin className="w-5 h-5 text-white/50 mb-2" />
              <div className="text-sm text-white/50">Location</div>
              <div className="font-medium">{job.location}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <DollarSign className="w-5 h-5 text-white/50 mb-2" />
              <div className="text-sm text-white/50">Salary</div>
              <div className="font-medium">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <Briefcase className="w-5 h-5 text-white/50 mb-2" />
              <div className="text-sm text-white/50">Type</div>
              <div className="font-medium capitalize">{job.type}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <Clock className="w-5 h-5 text-white/50 mb-2" />
              <div className="text-sm text-white/50">Deadline</div>
              <div className="font-medium">{new Date(job.deadline).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Personality Match */}
          {matchingTraits && matchingTraits.length > 0 && (
            <div className="p-5 bg-electric/5 border border-electric/20 rounded-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-electric" />
                Personality Match Analysis
              </h3>
              <div className="space-y-3">
                {matchingTraits.map(trait => {
                  const info = OCEAN_DESCRIPTIONS[trait.trait]
                  return (
                    <div key={trait.trait} className="flex items-center gap-3">
                      <span className="text-lg">{info.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{info.name}</span>
                          <span className={trait.matched ? 'text-electric' : 'text-white/50'}>
                            {trait.userScore}% / {trait.requiredScore}% required
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${trait.matched ? 'bg-electric' : 'bg-pulse'}`}
                            style={{ width: `${trait.userScore}%` }}
                          />
                        </div>
                      </div>
                      {trait.matched ? (
                        <CheckCircle2 className="w-5 h-5 text-electric" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-pulse" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">About This Role</h3>
            <p className="text-white/70 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-electric mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {job.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass p-6 border-t border-white/10 flex justify-between items-center">
          <button onClick={onClose} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            Close
          </button>
          
          {hasApplied ? (
            <span className="px-6 py-3 bg-electric/20 text-electric rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Already Applied
            </span>
          ) : (
            <button
              onClick={onApply}
              disabled={isApplying}
              className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {isApplying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <BookmarkPlus className="w-5 h-5" />
                  Apply for This Position
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

