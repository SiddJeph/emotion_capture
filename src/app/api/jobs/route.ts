import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllJobs, 
  createJob, 
  updateJob, 
  deleteJob,
  getJobStats
} from '@/lib/jobs/storage'
import { calculateJobMatch, getMatchingTraits, JobMatch, Job } from '@/lib/jobs/types'
import { OceanScores, OceanTrait } from '@/lib/ocean/types'

// GET - Fetch all jobs (with optional OCEAN score matching)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withScores = searchParams.get('withScores')
    const jobId = searchParams.get('id')
    const withStats = searchParams.get('withStats') === 'true'
    
    const jobs = await getAllJobs()

    // Get single job with stats
    if (jobId) {
      const job = jobs.find(j => j.id === jobId)
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }

      if (withStats) {
        const stats = await getJobStats(jobId)
        return NextResponse.json({
          success: true,
          data: { ...job, stats },
        })
      }

      return NextResponse.json({
        success: true,
        data: job,
      })
    }

    // If OCEAN scores provided, calculate match scores
    if (withScores) {
      const oceanScores: OceanScores = JSON.parse(withScores)
      
      const jobMatches: JobMatch[] = jobs.map(job => ({
        job,
        matchScore: calculateJobMatch(job, oceanScores),
        matchingTraits: getMatchingTraits(job, oceanScores),
      }))

      // Sort by match score
      jobMatches.sort((a, b) => b.matchScore - a.matchScore)

      return NextResponse.json({
        success: true,
        data: jobMatches,
      })
    }

    // Return all jobs with optional stats
    if (withStats) {
      const jobsWithStats = await Promise.all(
        jobs.map(async (job) => ({
          ...job,
          stats: await getJobStats(job.id),
        }))
      )
      return NextResponse.json({
        success: true,
        data: jobsWithStats,
      })
    }

    return NextResponse.json({
      success: true,
      data: jobs,
    })
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST - Create new job (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      company, 
      location, 
      type, 
      salary, 
      description, 
      requirements, 
      idealTraits, 
      tags, 
      deadline,
      logo 
    } = body

    // Validate required fields
    if (!title || !company || !description) {
      return NextResponse.json(
        { success: false, error: 'Title, company, and description are required' },
        { status: 400 }
      )
    }

    const newJob = await createJob({
      title,
      company,
      location: location || 'Remote',
      type: type || 'full-time',
      salary: salary || { min: 50000, max: 100000, currency: 'USD' },
      description,
      requirements: requirements || [],
      idealTraits: idealTraits || [],
      tags: tags || [],
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      logo: logo || '💼',
    })

    return NextResponse.json({
      success: true,
      data: newJob,
    })
  } catch (error) {
    console.error('Job create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

// PATCH - Update job (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, ...updates } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const updatedJob = await updateJob(jobId, updates)

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
    })
  } catch (error) {
    console.error('Job update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE - Delete job (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteJob(jobId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    })
  } catch (error) {
    console.error('Job delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
