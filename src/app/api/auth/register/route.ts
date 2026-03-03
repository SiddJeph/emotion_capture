import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth/store'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Only candidates can self-register
    const user = await createUser(email, password, name, 'candidate')

    if (!user) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



