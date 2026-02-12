'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState } from './types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: 'candidate' | 'admin') => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'emotion_capture_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY)
    if (storedSession) {
      try {
        const userData = JSON.parse(storedSession)
        setUser(userData)
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'candidate' | 'admin'): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return false
      }

      setUser(data.user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      setIsLoading(false)
      return true
    } catch (err) {
      setError('Connection error. Please try again.')
      setIsLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsLoading(false)
        return false
      }

      setUser(data.user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      setIsLoading(false)
      return true
    } catch (err) {
      setError('Connection error. Please try again.')
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}



