'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Building,
  Users,
  BarChart3,
  LogOut,
  Clock,
  TrendingUp,
  ChevronRight,
  Loader2,
  Activity,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Target,
  Plus,
  Eye,
  Brain,
  Zap,
  ArrowUpRight,
  Calendar
} from 'lucide-react'
import { Job, JobApplication, STATUS_INFO, ApplicationStatus } from '@/lib/jobs/types'
import { OCEAN_DESCRIPTIONS } from '@/lib/ocean/types'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingReview: number
  selected: number
  rejected: number
  avgMatchScore: number
}

interface RecentActivity {
  id: string
  type: 'application' | 'assessment' | 'decision'
  message: string
  time: string
  icon: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    selected: 0,
    rejected: 0,
    avgMatchScore: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, user, authLoading, router])

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated || user?.role !== 'admin') return
      
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?withStats=true'),
          fetch('/api/applications?admin=true'),
        ])

        const jobsData = await jobsRes.json()
        const appsData = await appsRes.json()

        if (jobsData.success) {
          setRecentJobs(jobsData.data.slice(0, 5))
          
          const jobs = jobsData.data as any[]
          const activeJobs = jobs.filter(j => new Date(j.deadline) > new Date()).length
          
          setStats(prev => ({
            ...prev,
            totalJobs: jobs.length,
            activeJobs,
          }))
        }

        if (appsData.success) {
          const apps = appsData.data as JobApplication[]
          setRecentApplications(apps.slice(0, 10))
          
          const pendingReview = apps.filter(a => 
            a.status === 'assessment_completed' || a.status === 'under_review'
          ).length
          const selected = apps.filter(a => a.status === 'selected').length
          const rejected = apps.filter(a => a.status === 'rejected').length
          const withMatch = apps.filter(a => a.matchScore)
          const avgMatchScore = withMatch.length > 0
            ? withMatch.reduce((sum, a) => sum + (a.matchScore || 0), 0) / withMatch.length
            : 0

          setStats(prev => ({
            ...prev,
            totalApplications: apps.length,
            pendingReview,
            selected,
            rejected,
            avgMatchScore,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (hours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
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
                className="text-electric font-medium"
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
                className="text-white/70 hover:text-white transition-colors"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-electric">{user?.name?.split(' ')[0]}</span>
          </h2>
          <p className="text-white/60">Here's what's happening with your hiring today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div 
            className="glass rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-colors border border-white/10"
            onClick={() => router.push('/admin/jobs')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-electric/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-electric" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalJobs}</div>
            <div className="text-sm text-white/50">Active Jobs</div>
          </div>

          <div 
            className="glass rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-colors border border-white/10"
            onClick={() => router.push('/admin/applications')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-calm/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-calm" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalApplications}</div>
            <div className="text-sm text-white/50">Total Applications</div>
          </div>

          <div 
            className="glass rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-colors border border-warm/30"
            onClick={() => router.push('/admin/applications?filter=review')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-warm/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warm" />
              </div>
              {stats.pendingReview > 0 && (
                <span className="px-2 py-1 bg-warm text-white text-xs font-bold rounded">
                  Action Needed
                </span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pendingReview}</div>
            <div className="text-sm text-white/50">Pending Review</div>
          </div>

          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-pulse/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-pulse" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgMatchScore.toFixed(0)}%</div>
            <div className="text-sm text-white/50">Avg Match Score</div>
          </div>
        </div>

        {/* Decision Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <div className="text-4xl font-bold text-green-500">{stats.selected}</div>
                <div className="text-white/50">Candidates Selected</div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6 border border-pulse/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-pulse/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-pulse" />
              </div>
              <div>
                <div className="text-4xl font-bold text-pulse">{stats.rejected}</div>
                <div className="text-white/50">Candidates Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="glass rounded-2xl overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-electric" />
                Your Job Postings
              </h3>
              <button 
                onClick={() => router.push('/admin/jobs')}
                className="text-sm text-electric hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto" />
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="p-12 text-center text-white/50">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">No jobs posted yet</p>
                <button
                  onClick={() => router.push('/admin/jobs')}
                  className="btn-primary px-4 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Job
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4 cursor-pointer"
                    onClick={() => router.push(`/admin/applications?jobId=${job.id}`)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                      {job.logo || '💼'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="text-xs text-white/50">{job.company}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-electric">
                        {job.stats?.totalApplications || 0}
                      </div>
                      <div className="text-xs text-white/40">applicants</div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="glass rounded-2xl overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-calm" />
                Recent Applications
              </h3>
              <button 
                onClick={() => router.push('/admin/applications')}
                className="text-sm text-calm hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto" />
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="p-12 text-center text-white/50">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentApplications.slice(0, 5).map((app: any) => {
                  const statusInfo = STATUS_INFO[app.status as ApplicationStatus]
                  return (
                    <div
                      key={app.id}
                      className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4 cursor-pointer"
                      onClick={() => router.push('/admin/applications')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                        {app.job?.logo || '👤'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{app.job?.title || 'Unknown Job'}</div>
                        <div className="text-xs text-white/50 flex items-center gap-2">
                          <span>ID: {app.userId.slice(0, 8)}...</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(app.appliedAt)}
                          </span>
                        </div>
                      </div>

                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: `${statusInfo?.color}20`, color: statusInfo?.color }}
                      >
                        {statusInfo?.icon} {statusInfo?.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 glass rounded-2xl p-6 border border-white/10">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-warm" />
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/jobs')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
            >
              <Plus className="w-8 h-8 text-electric mb-3" />
              <div className="font-medium">Post New Job</div>
              <div className="text-xs text-white/50">Create a new job listing</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/applications?filter=review')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
            >
              <Eye className="w-8 h-8 text-calm mb-3" />
              <div className="font-medium">Review Candidates</div>
              <div className="text-xs text-white/50">{stats.pendingReview} awaiting review</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/applications')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
            >
              <Brain className="w-8 h-8 text-warm mb-3" />
              <div className="font-medium">View Assessments</div>
              <div className="text-xs text-white/50">AI-powered insights</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/jobs')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-pulse mb-3" />
              <div className="font-medium">Job Analytics</div>
              <div className="text-xs text-white/50">Performance metrics</div>
            </button>
          </div>
        </div>

        {/* AI Insights Banner */}
        <div className="mt-8 glass rounded-2xl p-6 bg-electric/10 border border-electric/30">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-electric flex items-center justify-center">
              <Brain className="w-8 h-8 text-midnight" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">AI-Powered Hiring</h3>
              <p className="text-white/60">
                Our emotion detection and personality assessment helps you find the perfect cultural fit.
                Candidates are scored based on their OCEAN personality traits matched against your job requirements.
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/applications')}
              className="btn-primary px-6 py-3 rounded-xl whitespace-nowrap"
            >
              Review Candidates
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
