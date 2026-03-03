'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, error, isLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    const result = await login(email, password, 'admin')

    if (result) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
      {/* Background effects - purple/calm theme for admin */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-calm/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pulse/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-calm/30 to-pulse/20 flex items-center justify-center glow-calm">
            <Shield className="w-8 h-8 text-calm" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            Admin <span className="text-calm">Portal</span>
          </h1>
          <p className="text-white/50 text-sm">
            Secure access for administrators only
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8 border border-calm/20">
          {/* Admin Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-calm/10 rounded-lg border border-calm/20">
            <Shield className="w-4 h-4 text-calm" />
            <span className="text-sm text-calm font-medium">Administrator Access</span>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-calm/20 border border-calm/30 rounded-lg flex items-center gap-2 text-calm animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Welcome back! Redirecting...</span>
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
            <div>
              <label className="block text-sm text-white/70 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-calm transition-colors"
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
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-calm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-calm to-pulse hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Access Dashboard
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

          {/* Candidate Link */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm text-white/70"
          >
            <Users className="w-4 h-4" />
            Candidate Login
          </Link>
        </div>

        {/* Default Credentials Hint (for demo) */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/50 text-center mb-2">Demo Credentials:</p>
          <div className="font-mono text-xs text-center text-white/70">
            admin@company.com / admin123
          </div>
        </div>
      </div>
    </div>
  )
}



