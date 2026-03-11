'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Shield,
  Brain,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-electric/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-calm/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pulse/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-electric flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-midnight" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-lg">EmotionCapture</span>
            <span className="text-xs text-white/50">Emotional intelligence insights</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Candidate Login
          </Link>
          <Link
            href="/admin/login"
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8 animate-fade-in">
            <Brain className="w-4 h-4 text-electric" />
            AI-Powered Emotional Intelligence Assessment
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Understand
            <br />
            <span className="text-electric">Emotional Intelligence</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Real-time facial expression analysis using advanced AI. 
            Perfect for recruitment, training, and emotional intelligence development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/login"
              className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 group"
            >
              <Users className="w-5 h-5" />
              Take Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/login"
              className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { 
                icon: Brain, 
                title: '7 Emotions', 
                desc: 'Happy, Sad, Angry, Fearful, Disgusted, Surprised, Neutral',
                color: 'electric'
              },
              { 
                icon: Clock, 
                title: 'Real-time', 
                desc: '5 captures per second for accurate emotion mapping',
                color: 'calm'
              },
              { 
                icon: BarChart3, 
                title: 'Analytics', 
                desc: 'Detailed reports and timeline visualization',
                color: 'warm'
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="glass rounded-2xl p-6 text-center stagger-child"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          {[
            { label: 'Happy', color: 'emotion-happy' },
            { label: 'Sad', color: 'emotion-sad' },
            { label: 'Angry', color: 'emotion-angry' },
            { label: 'Fearful', color: 'emotion-fearful' },
            { label: 'Disgusted', color: 'emotion-disgusted' },
            { label: 'Surprised', color: 'emotion-surprised' },
            { label: 'Neutral', color: 'emotion-neutral' },
          ].map((emotion, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${emotion.color}`} />
              <span>{emotion.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/30 text-sm">
        <p>EmotionCapture — AI Emotional Intelligence Assessment Platform</p>
      </footer>
    </div>
  )
}
