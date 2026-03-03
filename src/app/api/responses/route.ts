import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { saveResponseLocally, getResponsesLocally } from '@/lib/storage/local'
import { EmotionDataPoint, EmotionSummary } from '@/lib/supabase/types'

interface SubmitResponseBody {
  videoId: string
  timeline: EmotionDataPoint[]
  summary: EmotionSummary
  userId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitResponseBody = await request.json()
    const { videoId, timeline, summary, userId } = body

    // Validate required fields
    if (!videoId || !timeline || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: videoId, timeline, and summary are required' },
        { status: 400 }
      )
    }

    // Validate timeline is an array
    if (!Array.isArray(timeline)) {
      return NextResponse.json(
        { error: 'Timeline must be an array' },
        { status: 400 }
      )
    }

    // Try Supabase first
    const supabase = createServerClient()
    
    if (supabase) {
      // Supabase is configured - use it
      const { data, error } = await supabase
        .from('candidate_responses')
        .insert({
          user_id: userId || null,
          video_id: videoId,
          raw_timeline: timeline,
          summary: summary,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        // Fall back to local storage
        const localData = await saveResponseLocally(videoId, timeline, summary, userId || null)
        return NextResponse.json({
          success: true,
          warning: 'Supabase error, saved locally instead',
          data: {
            id: localData.id,
            createdAt: localData.created_at,
            storage: 'local',
          },
        })
      }

      console.log('\n✅ Results saved to Supabase!')
      console.log(`   ID: ${data.id}`)
      console.log(`   Video: ${videoId}`)
      console.log(`   Data Points: ${timeline.length}\n`)

      return NextResponse.json({
        success: true,
        data: {
          id: data.id,
          createdAt: data.created_at,
          storage: 'supabase',
        },
      })
    }

    // No Supabase - use local storage
    const localData = await saveResponseLocally(videoId, timeline, summary, userId || null)
    
    return NextResponse.json({
      success: true,
      data: {
        id: localData.id,
        createdAt: localData.created_at,
        storage: 'local',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const videoId = searchParams.get('videoId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Try Supabase first
    const supabase = createServerClient()
    
    if (supabase) {
      let query = supabase
        .from('candidate_responses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (videoId) {
        query = query.eq('video_id', videoId)
      }

      const { data, error } = await query

      if (!error) {
        return NextResponse.json({
          success: true,
          storage: 'supabase',
          data,
        })
      }
    }

    // Fall back to local storage
    const data = await getResponsesLocally(
      videoId || undefined,
      userId || undefined,
      limit
    )

    return NextResponse.json({
      success: true,
      storage: 'local',
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
