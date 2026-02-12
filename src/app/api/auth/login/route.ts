import { NextRequest, NextResponse } from 'next/server'
import { validateUser } from '@/lib/auth/store'
import { UserRole } from '@/lib/auth/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await validateUser(email, password, role as UserRole)

    if (!user) {
      return NextResponse.json(
        { error: role === 'admin' ? 'Invalid admin credentials' : 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



