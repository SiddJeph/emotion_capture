import { NextRequest, NextResponse } from 'next/server'
import { 
  createApplication, 
  getUserApplications, 
  updateApplicationStatus,
  hasUserApplied,
  getAllApplications,
  getAllJobs,
  getJobById
} from '@/lib/jobs/storage'
import { ApplicationStatus } from '@/lib/jobs/types'

// GET - Fetch user's applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isAdmin = searchParams.get('admin') === 'true'

    if (isAdmin) {
      // Return all applications for admin
      const applications = await getAllApplications()
      const jobs = await getAllJobs()
      
      // Enrich with job data
      const enriched = applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId)
        return {
          ...app,
          job: job || null,
        }
      })

      return NextResponse.json({
        success: true,
        data: enriched,
      })
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const applications = await getUserApplications(userId)
    const jobs = await getAllJobs()
    
    // Enrich with job data
    const enriched = applications.map(app => {
      const job = jobs.find(j => j.id === app.jobId)
      return {
        ...app,
        job: job || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
    })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, userId } = body

    if (!jobId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Job ID and User ID required' },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await getJobById(jobId)
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if already applied
    const alreadyApplied = await hasUserApplied(jobId, userId)
    if (alreadyApplied) {
      return NextResponse.json(
        { success: false, error: 'Already applied to this job' },
        { status: 409 }
      )
    }

    const application = await createApplication(jobId, userId)

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        job,
      },
    })
  } catch (error) {
    console.error('Application create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

// PATCH - Update application status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, assessmentId, matchScore } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status required' },
        { status: 400 }
      )
    }

    const application = await updateApplicationStatus(
      applicationId,
      status as ApplicationStatus,
      assessmentId,
      matchScore
    )

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

