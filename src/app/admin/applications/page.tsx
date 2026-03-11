'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Search,
  Filter,
  Loader2,
  Brain,
  Activity,
  TrendingUp,
  BarChart3,
  Building,
  LogOut,
  User,
  ChevronDown,
  Clock,
  Target,
  Briefcase,
  X,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { Job, JobApplication, STATUS_INFO, ApplicationStatus } from '@/lib/jobs/types'
import { OCEAN_DESCRIPTIONS, OceanTrait, OceanScores } from '@/lib/ocean/types'

interface EnrichedApplication extends JobApplication {
  job: Job | null
  user?: {
    name: string
    email: string
  }
}

function ApplicationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [applications, setApplications] = useState<EnrichedApplication[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<EnrichedApplication | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Get job filter from URL
  useEffect(() => {
    const urlJobId = searchParams.get('jobId')
    if (urlJobId) {
      setJobFilter(urlJobId)
    }
  }, [searchParams])

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, user, router])

  // Fetch data
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch('/api/applications?admin=true'),
        fetch('/api/jobs'),
      ])
      
      const appsData = await appsRes.json()
      const jobsData = await jobsRes.json()
      
      if (appsData.success) {
        setApplications(appsData.data)
      }
      if (jobsData.success) {
        setJobs(jobsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus) => {
    setUpdating(applicationId)
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status }),
      })
      
      if (res.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        )
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status } : null)
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Filter applications
  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (jobFilter !== 'all' && app.jobId !== jobFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        app.job?.title.toLowerCase().includes(query) ||
        app.job?.company.toLowerCase().includes(query) ||
        app.userId.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'assessment_pending').length,
    completed: applications.filter(a => a.status === 'assessment_completed').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    )
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
                <div className="w-10 h-10 rounded-xl bg-pulse flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Admin Portal</h1>
                  <p className="text-xs text-white/50">Company Dashboard</p>
                </div>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/admin/jobs')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Jobs
              </button>
              <button 
                onClick={() => router.push('/admin/applications')}
                className="text-electric font-medium"
              >
                Applications
              </button>
              <div className="flex items-center gap-3">
                <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-pulse" />
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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Application <span className="text-electric">Review</span>
          </h2>
          <p className="text-white/60">Review candidates and make hiring decisions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-white/50">Total</div>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-warm/30">
            <div className="text-2xl font-bold text-warm">{stats.pending}</div>
            <div className="text-xs text-white/50">Pending</div>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-calm/30">
            <div className="text-2xl font-bold text-calm">{stats.completed}</div>
            <div className="text-xs text-white/50">Assessed</div>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-electric/30">
            <div className="text-2xl font-bold text-electric">{stats.underReview}</div>
            <div className="text-xs text-white/50">In Review</div>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-green-500/30">
            <div className="text-2xl font-bold text-green-500">{stats.selected}</div>
            <div className="text-xs text-white/50">Selected</div>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-pulse/30">
            <div className="text-2xl font-bold text-pulse">{stats.rejected}</div>
            <div className="text-xs text-white/50">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
            />
          </div>
          
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric min-w-48"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric min-w-40"
          >
            <option value="all">All Status</option>
            <option value="assessment_pending">Pending Assessment</option>
            <option value="assessment_completed">Assessed</option>
            <option value="under_review">Under Review</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-20 glass rounded-xl">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
            <p className="text-white/50">No applications match your filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => {
              const statusInfo = STATUS_INFO[app.status]
              return (
                <div 
                  key={app.id} 
                  className="glass rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                      {app.job?.logo || '💼'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{app.job?.title || 'Unknown Job'}</h3>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>Applicant: {app.userId.slice(0, 8)}...</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                        {app.matchScore && (
                          <span className="flex items-center gap-1 text-electric">
                            <Target className="w-3 h-3" />
                            {app.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {app.status === 'assessment_completed' && (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'under_review')}
                          disabled={updating === app.id}
                          className="px-3 py-1.5 bg-electric/20 text-electric rounded-lg text-sm hover:bg-electric/30 disabled:opacity-50"
                        >
                          Review
                        </button>
                      </div>
                    )}
                    
                    {(app.status === 'under_review' || app.status === 'assessment_completed') && (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'selected')}
                          disabled={updating === app.id}
                          className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 disabled:opacity-50"
                          title="Select Candidate"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          disabled={updating === app.id}
                          className="p-2 bg-pulse/20 text-pulse rounded-lg hover:bg-pulse/30 disabled:opacity-50"
                          title="Reject Candidate"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <ChevronDown className="w-5 h-5 text-white/30" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updating === selectedApplication.id}
        />
      )}
    </div>
  )
}

interface AssessmentData {
  id: string
  user_id: string
  summary: {
    dominantEmotion: string
    averageConfidence: number
    duration: number
    totalDataPoints: number
    emotionDistribution: Record<string, number>
    oceanScores?: OceanScores
    eqScore?: number
    emotionalStability?: number
    dominantTrait?: string
    traitProfile?: string
  }
  created_at: string
}

// Application Detail Modal
function ApplicationDetailModal({
  application,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  application: EnrichedApplication
  onClose: () => void
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  isUpdating: boolean
}) {
  const statusInfo = STATUS_INFO[application.status]
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)

  // Fetch real assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      setLoadingAssessment(true)
      try {
        const res = await fetch(`/api/assessments?userId=${application.userId}`)
        const data = await res.json()
        if (data.success && data.data) {
          setAssessmentData(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch assessment:', error)
      } finally {
        setLoadingAssessment(false)
      }
    }

    if (application.status !== 'assessment_pending') {
      fetchAssessment()
    }
  }, [application.userId, application.status])

  // Use real data or defaults
  const emotionData = assessmentData?.summary || null
  const oceanScores = emotionData?.oceanScores || null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                {application.job?.logo || '💼'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{application.job?.title}</h2>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span>{application.job?.company}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {application.job?.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span 
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
              >
                {statusInfo.icon} {statusInfo.label}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Applicant Info */}
          <div className="glass rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-electric" />
              Applicant Information
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-white/50">Applicant ID</div>
                <div className="font-mono">{application.userId}</div>
              </div>
              <div>
                <div className="text-sm text-white/50">Applied On</div>
                <div>{new Date(application.appliedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-white/50">Match Score</div>
                <div className={`text-xl font-bold ${
                  application.matchScore && application.matchScore >= 70 ? 'text-electric' :
                  application.matchScore && application.matchScore >= 50 ? 'text-calm' :
                  'text-warm'
                }`}>
                  {application.matchScore || 'N/A'}%
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Results */}
          {application.status !== 'assessment_pending' && (
            <>
              {loadingAssessment ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-electric animate-spin" />
                  <span className="ml-3 text-white/50">Loading assessment data...</span>
                </div>
              ) : !emotionData ? (
                <div className="glass rounded-xl p-6 border border-warm/30 bg-warm/5 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warm" />
                  <h3 className="text-lg font-semibold mb-2">Assessment Data Not Found</h3>
                  <p className="text-white/50">
                    The assessment results for this candidate could not be loaded.
                  </p>
                </div>
              ) : (
                <>
                  {/* EQ & Emotion */}
                  <div className="glass rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-calm" />
                      Emotional Intelligence Assessment
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-white/5 rounded-xl text-center">
                        <div className="text-3xl font-bold text-electric">
                          {emotionData.eqScore?.toFixed(0) || Math.round(emotionData.averageConfidence * 80 + 20)}
                        </div>
                        <div className="text-xs text-white/50">EQ Score</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl text-center">
                        <div className="text-3xl font-bold text-calm">
                          {emotionData.emotionalStability?.toFixed(0) || 70}%
                        </div>
                        <div className="text-xs text-white/50">Stability</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl text-center">
                        <div className="text-3xl font-bold capitalize">{emotionData.dominantEmotion}</div>
                        <div className="text-xs text-white/50">Dominant Emotion</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl text-center">
                        <div className="text-3xl font-bold text-warm">
                          {(emotionData.averageConfidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/50">Confidence</div>
                      </div>
                    </div>
                    
                    {/* Emotion Distribution */}
                    <h4 className="text-sm font-medium text-white/70 mb-3">Emotion Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(emotionData.emotionDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([emotion, value]) => (
                          <div key={emotion} className="flex items-center gap-3">
                            <span className="w-24 text-sm capitalize">{emotion}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-electric"
                                style={{ width: `${value * 100}%` }}
                              />
                            </div>
                            <span className="w-14 text-xs text-white/50 text-right">
                              {(value * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* OCEAN Profile */}
                  {oceanScores && (
                    <div className="glass rounded-xl p-5 border border-white/10">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-calm" />
                        Personality Profile: <span className="text-calm">{emotionData.traitProfile || 'Assessed'}</span>
                      </h3>
                      <div className="space-y-3">
                        {(Object.entries(oceanScores) as [OceanTrait, number][])
                          .sort((a, b) => b[1] - a[1])
                          .map(([trait, score]) => {
                            const info = OCEAN_DESCRIPTIONS[trait]
                            const jobTrait = application.job?.idealTraits?.find(t => t.trait === trait)
                            const isMatch = !jobTrait || score >= jobTrait.minScore
                            
                            return (
                              <div key={trait} className="flex items-center gap-4">
                                <span className="w-8 text-xl">{info.emoji}</span>
                                <span className="w-32">{info.name}</span>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ width: `${score}%`, backgroundColor: info.color }}
                                  />
                                </div>
                                <span className="w-14 text-sm font-mono" style={{ color: info.color }}>
                                  {score.toFixed(0)}%
                                </span>
                                {jobTrait && (
                                  <span className={`text-sm ${isMatch ? 'text-green-500' : 'text-pulse'}`}>
                                    {isMatch ? '✓' : '✗'} {jobTrait.minScore}% req
                                  </span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* Assessment Metadata */}
                  <div className="glass rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-warm" />
                      Assessment Details
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/50">Video Duration</div>
                        <div className="font-semibold">{emotionData.duration?.toFixed(1) || 'N/A'}s</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/50">Data Points Captured</div>
                        <div className="font-semibold">{emotionData.totalDataPoints || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/50">Assessment Date</div>
                        <div className="font-semibold">
                          {assessmentData?.created_at 
                            ? new Date(assessmentData.created_at).toLocaleString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Requirements Match */}
                  {application.job?.requirements && (
                    <div className="glass rounded-xl p-5 border border-white/10">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-warm" />
                        Job Requirements
                      </h3>
                      <ul className="space-y-2">
                        {application.job.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/70">
                            <CheckCircle2 className="w-4 h-4 text-white/30 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Pending Assessment Notice */}
          {application.status === 'assessment_pending' && (
            <div className="glass rounded-xl p-6 border border-warm/30 bg-warm/5 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warm" />
              <h3 className="text-lg font-semibold mb-2">Assessment Pending</h3>
              <p className="text-white/50">
                This candidate has not completed their assessment yet.
                Results will be available once they finish both rounds.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 glass p-6 border-t border-white/10 flex justify-between items-center">
          <button onClick={onClose} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            Close
          </button>
          
          {(application.status === 'assessment_completed' || application.status === 'under_review') && (
            <div className="flex items-center gap-3">
              {application.status === 'assessment_completed' && (
                <button
                  onClick={() => onUpdateStatus(application.id, 'under_review')}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-electric/20 text-electric hover:bg-electric/30 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  Start Review
                </button>
              )}
              
              <button
                onClick={() => onUpdateStatus(application.id, 'rejected')}
                disabled={isUpdating}
                className="px-6 py-3 bg-pulse/20 text-pulse hover:bg-pulse/30 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ThumbsDown className="w-5 h-5" />
                Reject
              </button>
              
              <button
                onClick={() => onUpdateStatus(application.id, 'selected')}
                disabled={isUpdating}
                className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ThumbsUp className="w-5 h-5" />
                )}
                Select Candidate
              </button>
            </div>
          )}

          {application.status === 'selected' && (
            <span className="px-6 py-3 bg-green-500/20 text-green-500 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Candidate Selected
            </span>
          )}

          {application.status === 'rejected' && (
            <span className="px-6 py-3 bg-pulse/20 text-pulse rounded-xl flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Candidate Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense
export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  )
}



