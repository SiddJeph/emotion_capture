'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  Brain,
  Sparkles
} from 'lucide-react'
import { 
  OCEAN_QUESTIONS, 
  OceanAnswer, 
  OceanScores,
  calculateOceanScores,
  getDominantTrait,
  OCEAN_DESCRIPTIONS
} from '@/lib/ocean/types'

interface OceanQuestionnaireProps {
  onComplete: (scores: OceanScores, answers: OceanAnswer[]) => void
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree', short: 'SD' },
  { value: 2, label: 'Disagree', short: 'D' },
  { value: 3, label: 'Neutral', short: 'N' },
  { value: 4, label: 'Agree', short: 'A' },
  { value: 5, label: 'Strongly Agree', short: 'SA' },
]

export default function OceanQuestionnaire({ onComplete }: OceanQuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<number, number>>(new Map())
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = OCEAN_QUESTIONS[currentIndex]
  const progress = (answers.size / OCEAN_QUESTIONS.length) * 100
  const canProceed = answers.has(currentQuestion.id)
  const isLastQuestion = currentIndex === OCEAN_QUESTIONS.length - 1
  const allAnswered = answers.size === OCEAN_QUESTIONS.length

  const handleAnswer = (score: number) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev)
      newAnswers.set(currentQuestion.id, score)
      return newAnswers
    })
  }

  const handleNext = () => {
    if (isLastQuestion && allAnswered) {
      // Calculate and submit results
      const answerArray: OceanAnswer[] = Array.from(answers.entries()).map(
        ([questionId, score]) => ({ questionId, score })
      )
      const scores = calculateOceanScores(answerArray)
      setIsComplete(true)
      
      // Small delay for animation
      setTimeout(() => {
        onComplete(scores, answerArray)
      }, 1500)
    } else if (currentIndex < OCEAN_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Get trait info for current question
  const traitInfo = OCEAN_DESCRIPTIONS[currentQuestion.trait]

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-calm to-electric flex items-center justify-center glow-calm">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Questionnaire Complete!</h2>
          <p className="text-white/50">Calculating your personality profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-6 grid-bg">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-calm/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-calm" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              Round 2: <span className="text-calm">Personality Assessment</span>
            </h1>
            <p className="text-sm text-white/50">OCEAN Big Five Personality Test</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/50">Progress</span>
            <span className="font-mono text-calm">{answers.size}/{OCEAN_QUESTIONS.length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-calm to-electric transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="glass rounded-2xl p-8 animate-fade-in" key={currentQuestion.id}>
            {/* Trait indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{traitInfo.emoji}</span>
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${traitInfo.color}20`, color: traitInfo.color }}
              >
                {traitInfo.name}
              </span>
              <span className="text-xs text-white/40 ml-auto">
                Question {currentIndex + 1} of {OCEAN_QUESTIONS.length}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-medium mb-8 leading-relaxed">
              "{currentQuestion.text}"
            </h2>

            {/* Likert Scale */}
            <div className="space-y-3">
              {LIKERT_OPTIONS.map((option) => {
                const isSelected = answers.get(currentQuestion.id) === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'border-calm bg-calm/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-calm bg-calm' 
                        : 'border-white/30'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                    <span className={`flex-1 text-left ${isSelected ? 'text-white' : 'text-white/70'}`}>
                      {option.label}
                    </span>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      isSelected ? 'bg-calm/30 text-calm' : 'bg-white/10 text-white/40'
                    }`}>
                      {option.value}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1">
                {OCEAN_QUESTIONS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-calm w-6'
                        : answers.has(OCEAN_QUESTIONS[idx].id)
                          ? 'bg-calm/50'
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isLastQuestion && allAnswered
                    ? 'bg-gradient-to-r from-calm to-electric'
                    : 'bg-calm hover:bg-calm/80'
                }`}
              >
                {isLastQuestion && allAnswered ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



