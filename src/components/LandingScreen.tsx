'use client'

import { useState } from 'react'
import { 
  Play, 
  Sparkles, 
  Shield, 
  Clock,
  Brain,
  ChevronRight,
  Upload,
  Link2,
  Video
} from 'lucide-react'

interface LandingScreenProps {
  onStart: (videoUrl: string, videoId: string) => void
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  const [videoOption, setVideoOption] = useState<'demo' | 'url' | 'upload'>('demo')
  const [customUrl, setCustomUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedPreset, setSelectedPreset] = useState(0)

  // Preset videos for testing different emotions
  const PRESET_VIDEOS = [
    {
      name: 'Nature Scene',
      url: '/sample-video.mp4',
      description: 'Calming nature footage',
      emotions: ['neutral', 'happy'],
    },
    {
      name: 'Funny Animals',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      description: 'Playful & amusing clips',
      emotions: ['happy', 'surprised'],
    },
    {
      name: 'Dramatic Scene',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      description: 'Intense action sequence',
      emotions: ['surprised', 'fearful'],
    },
    {
      name: 'Emotional Story',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      description: 'Adventure & excitement',
      emotions: ['happy', 'surprised'],
    },
  ]

  const handleStart = () => {
    if (videoOption === 'demo') {
      const preset = PRESET_VIDEOS[selectedPreset]
      onStart(preset.url, `preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`)
    } else if (videoOption === 'url' && customUrl) {
      onStart(customUrl, `custom-${Date.now()}`)
    } else if (videoOption === 'upload' && uploadedFile) {
      const url = URL.createObjectURL(uploadedFile)
      onStart(url, `upload-${uploadedFile.name}-${Date.now()}`)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file)
      setVideoOption('upload')
    }
  }

  const isStartDisabled = 
    (videoOption === 'url' && !customUrl) ||
    (videoOption === 'upload' && !uploadedFile)

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-bg overflow-hidden">
      <div className="max-w-4xl w-full relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-6">
            <Sparkles className="w-4 h-4 text-electric" />
            AI-Powered Emotional Intelligence
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Your
            <br />
            <span className="text-electric">Emotional Response</span>
          </h1>
          
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Watch a video while our AI analyzes your facial expressions in real-time,
            mapping your emotional journey frame by frame.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-8 animate-slide-up">
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Brain, label: 'AI Detection', desc: '7 emotions tracked' },
              { icon: Clock, label: 'Real-time', desc: '5 captures/second' },
              { icon: Shield, label: 'Private', desc: 'Local processing' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl stagger-child"
              >
                <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-electric" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.label}</div>
                  <div className="text-xs text-white/50">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Source Selection */}
          <div className="mb-8">
            <label className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4 block">
              Select Video Source
            </label>
            
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => setVideoOption('demo')}
                className={`p-4 rounded-xl border transition-all text-left ${
                  videoOption === 'demo'
                    ? 'border-electric bg-electric/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <Video className={`w-5 h-5 mb-2 ${videoOption === 'demo' ? 'text-electric' : 'text-white/50'}`} />
                <div className="font-medium text-sm">Demo Video</div>
                <div className="text-xs text-white/50">Use sample content</div>
              </button>

              <button
                onClick={() => setVideoOption('url')}
                className={`p-4 rounded-xl border transition-all text-left ${
                  videoOption === 'url'
                    ? 'border-electric bg-electric/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <Link2 className={`w-5 h-5 mb-2 ${videoOption === 'url' ? 'text-electric' : 'text-white/50'}`} />
                <div className="font-medium text-sm">Video URL</div>
                <div className="text-xs text-white/50">Paste a link</div>
              </button>

              <label
                className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  videoOption === 'upload'
                    ? 'border-electric bg-electric/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className={`w-5 h-5 mb-2 ${videoOption === 'upload' ? 'text-electric' : 'text-white/50'}`} />
                <div className="font-medium text-sm">Upload</div>
                <div className="text-xs text-white/50">
                  {uploadedFile ? uploadedFile.name.slice(0, 15) + '...' : 'From your device'}
                </div>
              </label>
            </div>

            {/* Preset Video Selector */}
            {videoOption === 'demo' && (
              <div className="mt-4 animate-fade-in">
                <p className="text-xs text-white/50 mb-3">Choose a test video:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PRESET_VIDEOS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPreset(index)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedPreset === index
                          ? 'border-electric bg-electric/10'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{preset.name}</div>
                      <div className="text-xs text-white/40">{preset.description}</div>
                      <div className="flex gap-1 mt-2">
                        {preset.emotions.map((em, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                            {em}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input */}
            {videoOption === 'url' && (
              <div className="mt-4 animate-fade-in">
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-electric transition-colors"
                />
                <p className="text-xs text-white/40 mt-2">
                  Tip: Use direct video URLs (.mp4, .webm). YouTube links won&apos;t work directly.
                </p>
              </div>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isStartDisabled}
            className="w-full btn-primary py-5 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 group"
          >
            <Play className="w-6 h-6" />
            Begin Assessment
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Disclaimer */}
          <p className="text-center text-white/30 text-xs mt-6">
            By continuing, you consent to camera access for emotion detection.
            <br />
            No video is recorded or uploaded. All processing happens locally.
          </p>
        </div>

        {/* Emotion Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
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
      </div>
    </div>
  )
}

