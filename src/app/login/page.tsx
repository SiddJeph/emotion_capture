'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function CandidateLoginPage() {
  const router = useRouter()
  const { login, register, error, isLoading } = useAuth()
  
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    let result: boolean
    if (mode === 'login') {
      result = await login(email, password, 'candidate')
    } else {
      result = await register(email, password, name)
    }

    if (result) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-calm/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-electric/20 flex items-center justify-center border border-electric/30">
            <Sparkles className="w-8 h-8 text-electric" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            Candidate <span className="text-electric">Portal</span>
          </h1>
          <p className="text-white/50 text-sm">
            {mode === 'login' ? 'Sign in to take your assessment' : 'Create your account to get started'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-electric text-white' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'register' 
                  ? 'bg-electric text-white' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-electric/20 border border-electric/30 rounded-lg flex items-center gap-2 text-electric animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Success! Redirecting...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-pulse/20 border border-pulse/30 rounded-lg flex items-center gap-2 text-pulse animate-fade-in">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="block text-sm text-white/70 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={mode === 'register'}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-electric transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-electric transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-electric transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-white/40 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Admin Link */}
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm text-white/70"
          >
            <Shield className="w-4 h-4" />
            Admin Login
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          By signing in, you agree to participate in the emotional assessment.
        </p>
      </div>
    </div>
  )
}

