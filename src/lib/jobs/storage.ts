import { Job, JobApplication, ApplicationStatus } from './types'
import { SAMPLE_JOBS } from './data'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json')
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load existing applications
function loadApplications(): JobApplication[] {
  ensureDataDir()
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(APPLICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save applications
function saveApplications(applications: JobApplication[]) {
  ensureDataDir()
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2))
}

// Create new application
export async function createApplication(
  jobId: string,
  userId: string
): Promise<JobApplication> {
  const applications = loadApplications()
  
  // Check if already applied
  const existing = applications.find(
    a => a.jobId === jobId && a.userId === userId
  )
  if (existing) {
    return existing
  }

  const application: JobApplication = {
    id: uuidv4(),
    jobId,
    userId,
    status: 'assessment_pending',
    appliedAt: new Date().toISOString(),
  }

  applications.push(application)
  saveApplications(applications)

  console.log(`\n✅ New job application: ${userId} applied to ${jobId}`)

  return application
}

// Get user's applications
export async function getUserApplications(userId: string): Promise<JobApplication[]> {
  const applications = loadApplications()
  return applications
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
}

// Get application by ID
export async function getApplication(applicationId: string): Promise<JobApplication | null> {
  const applications = loadApplications()
  return applications.find(a => a.id === applicationId) || null
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  assessmentId?: string,
  matchScore?: number
): Promise<JobApplication | null> {
  const applications = loadApplications()
  const index = applications.findIndex(a => a.id === applicationId)
  
  if (index === -1) return null

  applications[index] = {
    ...applications[index],
    status,
    ...(assessmentId && { assessmentId }),
    ...(matchScore !== undefined && { matchScore }),
  }

  saveApplications(applications)
  
  console.log(`\n📝 Application ${applicationId} updated: ${status}`)

  return applications[index]
}

// Check if user has applied to job
export async function hasUserApplied(jobId: string, userId: string): Promise<boolean> {
  const applications = loadApplications()
  return applications.some(a => a.jobId === jobId && a.userId === userId)
}

// Get all applications (for admin)
export async function getAllApplications(): Promise<JobApplication[]> {
  return loadApplications()
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
}

// Get applications by job ID (for admin)
export async function getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
  const applications = loadApplications()
  return applications
    .filter(a => a.jobId === jobId)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
}

// ============================================================================
// JOB MANAGEMENT (for Admin)
// ============================================================================

// Load jobs (custom + sample)
function loadJobs(): Job[] {
  ensureDataDir()
  if (!fs.existsSync(JOBS_FILE)) {
    // Initialize with sample jobs
    saveJobs(SAMPLE_JOBS)
    return SAMPLE_JOBS
  }
  try {
    const data = fs.readFileSync(JOBS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return SAMPLE_JOBS
  }
}

// Save jobs
function saveJobs(jobs: Job[]) {
  ensureDataDir()
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2))
}

// Get all jobs
export async function getAllJobs(): Promise<Job[]> {
  return loadJobs()
}

// Get job by ID
export async function getJobById(jobId: string): Promise<Job | null> {
  const jobs = loadJobs()
  return jobs.find(j => j.id === jobId) || null
}

// Create new job
export async function createJob(jobData: Omit<Job, 'id' | 'postedAt'>): Promise<Job> {
  const jobs = loadJobs()
  
  const newJob: Job = {
    ...jobData,
    id: `job-${uuidv4().slice(0, 8)}`,
    postedAt: new Date().toISOString(),
  }

  jobs.push(newJob)
  saveJobs(jobs)

  console.log(`\n✅ New job created: ${newJob.title} at ${newJob.company}`)

  return newJob
}

// Update job
export async function updateJob(jobId: string, updates: Partial<Job>): Promise<Job | null> {
  const jobs = loadJobs()
  const index = jobs.findIndex(j => j.id === jobId)
  
  if (index === -1) return null

  jobs[index] = {
    ...jobs[index],
    ...updates,
    id: jobId, // Ensure ID doesn't change
  }

  saveJobs(jobs)
  console.log(`\n📝 Job ${jobId} updated`)

  return jobs[index]
}

// Delete job
export async function deleteJob(jobId: string): Promise<boolean> {
  const jobs = loadJobs()
  const index = jobs.findIndex(j => j.id === jobId)
  
  if (index === -1) return false

  jobs.splice(index, 1)
  saveJobs(jobs)

  console.log(`\n🗑️ Job ${jobId} deleted`)

  return true
}

// Get job stats
export async function getJobStats(jobId: string): Promise<{
  totalApplications: number
  pendingAssessments: number
  completed: number
  underReview: number
  selected: number
  rejected: number
}> {
  const applications = loadApplications().filter(a => a.jobId === jobId)
  
  return {
    totalApplications: applications.length,
    pendingAssessments: applications.filter(a => a.status === 'assessment_pending').length,
    completed: applications.filter(a => a.status === 'assessment_completed').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }
}
