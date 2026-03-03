import { NextRequest, NextResponse } from 'next/server'
import { getLatestUserAssessment, getAllAssessments } from '@/lib/storage/local'

// GET - Fetch assessment results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const admin = searchParams.get('admin')

    // Admin fetch all assessments
    if (admin === 'true') {
      const assessments = await getAllAssessments()
      return NextResponse.json({
        success: true,
        data: assessments,
      })
    }

    // Fetch specific user's assessment
    if (userId) {
      const assessment = await getLatestUserAssessment(userId)
      return NextResponse.json({
        success: true,
        data: assessment,
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Missing userId or admin parameter',
    }, { status: 400 })

  } catch (error) {
    console.error('Failed to fetch assessments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch assessments',
    }, { status: 500 })
  }
}


