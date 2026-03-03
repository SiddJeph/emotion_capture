'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  BarChart3,
  Building,
  Zap,
  Home,
  LogOut,
  User,
  X,
  Save
} from 'lucide-react'
import { Job, STATUS_INFO } from '@/lib/jobs/types'
import { OCEAN_DESCRIPTIONS, OceanTrait } from '@/lib/ocean/types'

interface JobWithStats extends Job {
  stats?: {
    totalApplications: number
    pendingAssessments: number
    completed: number
    underReview: number
    selected: number
    rejected: number
  }
}

export default function AdminJobsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  const [jobs, setJobs] = useState<JobWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deletingJob, setDeletingJob] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, user, router])

  // Fetch jobs
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/jobs?withStats=true')
      const data = await res.json()
      if (data.success) {
        setJobs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    setDeletingJob(jobId)
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, { method: 'DELETE' })
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId))
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    } finally {
      setDeletingJob(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse to-warm flex items-center justify-center">
                  <Building className="w-5 h-5" />
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
                className="text-electric font-medium"
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Job <span className="gradient-text">Management</span>
            </h2>
            <p className="text-white/60">Create, edit, and manage job postings</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Job
          </button>
        </div>

        {/* Search & Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
            />
          </div>
          
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-electric" />
            <div>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <div className="text-xs text-white/50">Total Jobs</div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-calm" />
            <div>
              <div className="text-2xl font-bold">
                {jobs.reduce((sum, j) => sum + (j.stats?.totalApplications || 0), 0)}
              </div>
              <div className="text-xs text-white/50">Total Applications</div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-warm" />
            <div>
              <div className="text-2xl font-bold">
                {jobs.reduce((sum, j) => sum + (j.stats?.completed || 0), 0)}
              </div>
              <div className="text-xs text-white/50">Assessments Done</div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 glass rounded-xl">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-white/50 mb-6">Create your first job posting to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="glass rounded-xl p-6 border border-white/10">
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
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/applications?jobId=${job.id}`)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title="View Applications"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingJob(job)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJob === job.id}
                          className="p-2 bg-pulse/20 hover:bg-pulse/30 text-pulse rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Job"
                        >
                          {deletingJob === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Stats */}
                    {job.stats && (
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {job.stats.totalApplications} Applications
                        </span>
                        <span className="px-3 py-1 bg-calm/20 text-calm rounded-full text-xs">
                          {job.stats.completed} Assessed
                        </span>
                        <span className="px-3 py-1 bg-electric/20 text-electric rounded-full text-xs">
                          {job.stats.selected} Selected
                        </span>
                        <span className="px-3 py-1 bg-pulse/20 text-pulse rounded-full text-xs">
                          {job.stats.rejected} Rejected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Job Modal */}
      {(showCreateModal || editingJob) && (
        <JobFormModal
          job={editingJob}
          onClose={() => {
            setShowCreateModal(false)
            setEditingJob(null)
          }}
          onSave={() => {
            setShowCreateModal(false)
            setEditingJob(null)
            fetchJobs()
          }}
        />
      )}
    </div>
  )
}

// Job Form Modal Component
function JobFormModal({
  job,
  onClose,
  onSave,
}: {
  job: Job | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || 'Remote',
    type: job?.type || 'full-time',
    salaryMin: job?.salary?.min || 50000,
    salaryMax: job?.salary?.max || 100000,
    currency: job?.salary?.currency || 'USD',
    description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '',
    tags: job?.tags?.join(', ') || '',
    deadline: job?.deadline?.split('T')[0] || '',
    logo: job?.logo || '💼',
  })
  const [traits, setTraits] = useState<{ trait: OceanTrait; weight: number; minScore: number }[]>(
    job?.idealTraits || []
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...(job && { jobId: job.id }),
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: {
          min: formData.salaryMin,
          max: formData.salaryMax,
          currency: formData.currency,
        },
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        logo: formData.logo,
        idealTraits: traits,
      }

      const res = await fetch('/api/jobs', {
        method: job ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to save job:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addTrait = (trait: OceanTrait) => {
    if (!traits.find(t => t.trait === trait)) {
      setTraits([...traits, { trait, weight: 0.5, minScore: 50 }])
    }
  }

  const removeTrait = (trait: OceanTrait) => {
    setTraits(traits.filter(t => t.trait !== trait))
  }

  const updateTrait = (trait: OceanTrait, updates: Partial<{ weight: number; minScore: number }>) => {
    setTraits(traits.map(t => t.trait === trait ? { ...t, ...updates } : t))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
                placeholder="e.g., TechCorp Inc"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
                placeholder="e.g., Remote"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Job Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Logo Emoji</label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric text-center text-2xl"
                placeholder="💼"
              />
            </div>
          </div>

          {/* Salary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Min Salary</label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Max Salary</label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric resize-none"
              placeholder="Describe the role..."
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Requirements (one per line)</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric resize-none"
              placeholder="3+ years experience&#10;Bachelor's degree&#10;Strong communication skills"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-electric"
              placeholder="e.g., Python, Remote, Leadership"
            />
          </div>

          {/* Ideal Traits */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Ideal Personality Traits</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as OceanTrait[]).map(trait => {
                const info = OCEAN_DESCRIPTIONS[trait]
                const isSelected = traits.find(t => t.trait === trait)
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => isSelected ? removeTrait(trait) : addTrait(trait)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                      isSelected 
                        ? 'bg-electric text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {info.emoji} {info.name}
                  </button>
                )
              })}
            </div>
            
            {traits.length > 0 && (
              <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                {traits.map(trait => {
                  const info = OCEAN_DESCRIPTIONS[trait.trait]
                  return (
                    <div key={trait.trait} className="flex items-center gap-4">
                      <span className="w-32 flex items-center gap-1">
                        {info.emoji} {info.name}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-white/50 w-16">Weight:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={trait.weight}
                          onChange={(e) => updateTrait(trait.trait, { weight: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-xs w-10">{(trait.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-white/50 w-16">Min Score:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={trait.minScore}
                          onChange={(e) => updateTrait(trait.trait, { minScore: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-xs w-10">{trait.minScore}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

