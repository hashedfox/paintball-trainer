import { useState } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { SKILL_LEVELS, SKILL_AREAS, FOCUS_AREAS, COMPETITIONS } from '../../types/onboarding'
import { POSITIONS, POSITION_LABELS, type Position } from '../../types/player'
import type { SkillLevel, SkillArea, FocusArea } from '../../types/onboarding'
import { createEstimatedPPI, getWeakestAxis } from '../../types/ppi'

interface Props {
  onComplete: () => void
}

export function OnboardingQuiz({ onComplete }: Props) {
  const state = useAppState()
  const dispatch = useDispatch()
  const [step, setStep] = useState(0)
  const { onboarding } = state

  const steps = [
    { title: 'Welcome', subtitle: 'Let\'s set up your player profile' },
    { title: 'Your Level', subtitle: 'Where are you at in your paintball journey?' },
    { title: 'Position', subtitle: 'What\'s your primary position?' },
    { title: 'Skills', subtitle: 'What areas do you want to improve?' },
    { title: 'Focus', subtitle: 'Pick your top training priorities' },
    { title: 'Competition', subtitle: 'Where do you compete?' },
    { title: 'Commitment', subtitle: 'How much time can you train weekly?' },
  ]

  const canAdvance = () => {
    switch (step) {
      case 0: return onboarding.playerName.length > 0
      case 1: return true
      case 2: return true
      case 3: return onboarding.skillAreas.length > 0
      case 4: return onboarding.focusAreas.length > 0
      case 5: return onboarding.competition.length > 0
      case 6: return true
      default: return true
    }
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      // Generate estimated PPI based on division + experience
      const divisionMap: Record<SkillLevel, string> = {
        beginner: 'D5', intermediate: 'D4', advanced: 'D3', competitive: 'D2'
      }
      const estimatedPPI = createEstimatedPPI(
        divisionMap[onboarding.currentLevel] || 'D4',
        onboarding.weeklyTrainingHours
      )
      dispatch({ type: 'SET_PPI_SCORES', scores: estimatedPPI })
      dispatch({ type: 'SET_PPI_ESTIMATED', estimated: true })
      dispatch({ type: 'SET_FOCUS_AXIS', axis: getWeakestAxis(estimatedPPI) })
      dispatch({ type: 'COMPLETE_ONBOARDING' })
      dispatch({ type: 'RECORD_LOGIN' })
      onComplete()
    }
  }

  const toggleSkillArea = (area: SkillArea) => {
    const current = onboarding.skillAreas
    const updated = current.includes(area) ? current.filter(a => a !== area) : [...current, area]
    dispatch({ type: 'SET_ONBOARDING', data: { skillAreas: updated } })
  }

  const toggleFocusArea = (area: FocusArea) => {
    const current = onboarding.focusAreas
    const updated = current.includes(area) ? current.filter(a => a !== area) : [...current, area]
    dispatch({ type: 'SET_ONBOARDING', data: { focusAreas: updated } })
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i <= step ? 'bg-pb-green' : 'bg-pb-border'}`} />
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-white mb-1">{steps[step].title}</h2>
        <p className="text-[12px] text-pb-text-dim mb-6">{steps[step].subtitle}</p>

        <div className="space-y-3 mb-8">
          {step === 0 && (
            <input
              type="text"
              value={onboarding.playerName}
              onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { playerName: e.target.value } })}
              placeholder="Enter your player name"
              className="w-full bg-pb-surface border border-pb-border rounded-lg px-4 py-3 text-white placeholder-pb-text-muted focus:outline-none focus:border-pb-green text-base"
              autoFocus
            />
          )}

          {step === 1 && SKILL_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { currentLevel: level.value as SkillLevel } })}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                onboarding.currentLevel === level.value
                  ? 'border-pb-green bg-pb-green/10'
                  : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
              }`}
            >
              <div className="font-bold text-white text-[13px]">{level.label}</div>
              <div className="text-[11px] text-pb-text-dim mt-0.5">{level.description}</div>
            </button>
          ))}

          {step === 2 && POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { primaryPosition: pos as Position } })}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                onboarding.primaryPosition === pos
                  ? 'border-pb-green bg-pb-green/10'
                  : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
              }`}
            >
              <span className="font-bold text-white text-[13px]">{POSITION_LABELS[pos]}</span>
            </button>
          ))}

          {step === 3 && (
            <>
              <p className="text-[10px] text-pb-text-muted">Select all that apply</p>
              {SKILL_AREAS.map((area) => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => toggleSkillArea(area.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    onboarding.skillAreas.includes(area.value)
                      ? 'border-pb-green bg-pb-green/10'
                      : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
                  }`}
                >
                  <span className="text-base mr-2">{area.icon}</span>
                  <span className="font-semibold text-white text-[12px]">{area.label}</span>
                </button>
              ))}
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-[10px] text-pb-text-muted">Pick 1-3 priorities</p>
              <div className="grid grid-cols-2 gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => toggleFocusArea(area.value)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      onboarding.focusAreas.includes(area.value)
                        ? 'border-pb-green bg-pb-green/10'
                        : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
                    }`}
                  >
                    <span className="font-semibold text-white text-[11px]">{area.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && COMPETITIONS.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { competition: comp } })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                onboarding.competition === comp
                  ? 'border-pb-green bg-pb-green/10'
                  : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
              }`}
            >
              <span className="font-medium text-white text-[12px]">{comp}</span>
            </button>
          ))}

          {step === 6 && (
            <div>
              <div className="text-center mb-4">
                <span className="text-4xl font-black text-pb-green">{onboarding.weeklyTrainingHours}</span>
                <span className="text-sm text-pb-text-dim ml-2">hours / week</span>
              </div>
              <input
                type="range" min="1" max="20"
                value={onboarding.weeklyTrainingHours}
                onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { weeklyTrainingHours: parseInt(e.target.value) } })}
                className="w-full accent-[#39D353]"
              />
              <div className="flex justify-between text-[9px] text-pb-text-muted mt-1">
                <span>1 hr</span><span>20 hrs</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary px-6 py-3">Back</button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`flex-1 py-3 rounded-lg font-bold text-[13px] transition-all ${
              canAdvance() ? 'btn-primary' : 'bg-pb-surface text-pb-text-muted cursor-not-allowed'
            }`}
          >
            {step === steps.length - 1 ? 'Start Training' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
