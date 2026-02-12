import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'

export const metadata: Metadata = {
  title: 'Emotion Capture | AI Emotional Intelligence Assessment',
  description: 'Real-time emotional response analysis using AI-powered facial recognition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display bg-midnight text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
