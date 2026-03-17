import { useState, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { SKILL_LEVELS, SKILL_AREAS, FOCUS_AREAS, COMPETITIONS } from '../../types/onboarding'
import { POSITIONS, POSITION_LABELS, POSITION_DESCRIPTIONS, type Position, getPositionRole } from '../../types/player'
import type { SkillLevel, SkillArea, FocusArea } from '../../types/onboarding'
import { createEstimatedPPI, getIdealShape, getPositionWeakestAxis, PPI_AXES, PPI_LABELS, type PPIScores } from '../../types/ppi'
import { polygonPoints } from '../../lib/spider'

interface Props {
  onComplete: () => void
}

/** Mini spider chart preview for the position step */
function PositionPPIPreview({ scores, ideal }: { scores: PPIScores; ideal: PPIScores }) {
  const cx = 80
  const cy = 80
  const r = 55
  const total = PPI_AXES.length

  const currentValues = PPI_AXES.map(axis => scores[axis] / 100)
  const idealValues = PPI_AXES.map(axis => ideal[axis] / 100)

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px]">
      {/* Grid ring */}
      <polygon
        points={polygonPoints(Array(total).fill(1), cx, cy, r)}
        fill="none"
        stroke="rgba(148,163,184,0.08)"
        strokeWidth={0.8}
        opacity={0.5}
      />
      {/* Ideal shape (faded target) */}
      <polygon
        points={polygonPoints(idealValues, cx, cy, r)}
        fill="rgba(45,212,168,0.08)"
        stroke="#2DD4A8"
        strokeWidth={1}
        strokeDasharray="3 2"
        opacity={0.5}
      />
      {/* Current shape */}
      <polygon
        points={polygonPoints(currentValues, cx, cy, r)}
        fill="rgba(124,91,240,0.2)"
        stroke="#7C5BF0"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Axis labels */}
      {PPI_AXES.map((axis, i) => {
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2
        const lx = cx + (r + 12) * Math.cos(angle)
        const ly = cy + (r + 12) * Math.sin(angle)
        const anchor = Math.cos(angle) > 0.1 ? 'start' : Math.cos(angle) < -0.1 ? 'end' : 'middle'
        return (
          <text
            key={axis}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#94A3B8"
            fontSize={5.5}
            fontWeight={600}
          >
            {PPI_LABELS[axis].toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
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
    { title: 'Position Profile', subtitle: 'See how your position shapes your training' },
    { title: 'Secondary Positions', subtitle: 'Do you play other positions? (Optional)' },
    { title: 'Skills', subtitle: 'What areas do you want to improve?' },
    { title: 'Focus', subtitle: 'Pick your top training priorities' },
    { title: 'Competition', subtitle: 'Where do you compete?' },
    { title: 'Commitment', subtitle: 'How much time can you train weekly?' },
    { title: 'Benchmarking', subtitle: 'Help the community & see where you stand' },
  ]

  // Compute preview PPI for the position profile step
  const previewPPI = useMemo(() => {
    const divisionMap: Record<SkillLevel, string> = {
      beginner: 'D5', intermediate: 'D4', advanced: 'D3', competitive: 'D2'
    }
    const division = divisionMap[onboarding.currentLevel] || 'D4'
    const role = getPositionRole(onboarding.primaryPosition)
    const estimated = createEstimatedPPI(division, onboarding.weeklyTrainingHours, role)
    const ideal = getIdealShape(role, division)
    return { estimated, ideal, division, role }
  }, [onboarding.currentLevel, onboarding.primaryPosition, onboarding.weeklyTrainingHours])

  const canAdvance = () => {
    switch (step) {
      case 0: return onboarding.playerName.length > 0
      case 1: return true
      case 2: return true
      case 3: return true // position profile preview - always can advance
      case 4: return true // secondary positions - optional
      case 5: return onboarding.skillAreas.length > 0
      case 6: return onboarding.focusAreas.length > 0
      case 7: return onboarding.competition.length > 0
      case 8: return true
      case 9: return true // benchmarking opt-in - always can advance
      default: return true
    }
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      // Generate estimated PPI based on division + experience + position
      const divisionMap: Record<SkillLevel, string> = {
        beginner: 'D5', intermediate: 'D4', advanced: 'D3', competitive: 'D2'
      }
      const division = divisionMap[onboarding.currentLevel] || 'D4'
      const role = getPositionRole(onboarding.primaryPosition)
      const estimatedPPI = createEstimatedPPI(
        division,
        onboarding.weeklyTrainingHours,
        role,
      )
      dispatch({ type: 'SET_PPI_SCORES', scores: estimatedPPI })
      dispatch({ type: 'SET_PPI_ESTIMATED', estimated: true })
      // Use position-weighted weakest axis for focus
      dispatch({ type: 'SET_FOCUS_AXIS', axis: getPositionWeakestAxis(estimatedPPI, role) })
      dispatch({ type: 'SET_PROFILE', field: 'division', value: division })
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

  const toggleSecondaryPosition = (pos: Position) => {
    if (pos === onboarding.primaryPosition) return // can't be both primary and secondary
    const current = onboarding.secondaryPositions || []
    const updated = current.includes(pos) ? current.filter(p => p !== pos) : [...current, pos]
    dispatch({ type: 'SET_ONBOARDING', data: { secondaryPositions: updated } })
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#2DD4A8]' : 'border-white/[0.08] bg-white/[0.08]'}`} />
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-white mb-1">{steps[step].title}</h2>
        <p className="text-[12px] text-[#94A3B8] mb-6">{steps[step].subtitle}</p>

        <div className="space-y-3 mb-8">
          {/* Step 0: Player Name */}
          {step === 0 && (
            <input
              type="text"
              value={onboarding.playerName}
              onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { playerName: e.target.value } })}
              placeholder="Enter your player name"
              className="w-full bg-[#111827] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-[#64748B] focus:outline-none focus:border-[#2DD4A8] text-base"
              autoFocus
            />
          )}

          {/* Step 1: Skill Level */}
          {step === 1 && SKILL_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { currentLevel: level.value as SkillLevel } })}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                onboarding.currentLevel === level.value
                  ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                  : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[13px]">{level.label}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">{level.description}</div>
                </div>
                <span className="text-[10px] font-bold text-[#7C5BF0] bg-[#7C5BF0]/10 px-2 py-1 rounded">
                  {level.division}
                </span>
              </div>
            </button>
          ))}

          {/* Step 2: Primary Position */}
          {step === 2 && (
            <>
              <p className="text-[10px] text-[#64748B] mb-1">
                Your position determines how the app weights your skills and suggests drills
              </p>
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { primaryPosition: pos as Position } })}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    onboarding.primaryPosition === pos
                      ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                      : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="font-bold text-white text-[13px]">{POSITION_LABELS[pos]}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">{POSITION_DESCRIPTIONS[pos]}</div>
                </button>
              ))}
            </>
          )}

          {/* Step 3: Position Profile Preview (NEW) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-[#2DD4A8]" />
                  <span className="text-sm font-bold text-[#F1F5F9]">
                    {POSITION_LABELS[onboarding.primaryPosition]} Profile
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                  Your PPI spider chart is now weighted for your position. The
                  <span className="text-[#2DD4A8] font-semibold"> dashed green shape </span>
                  shows the ideal profile for a {POSITION_LABELS[onboarding.primaryPosition]} at the {previewPPI.division} level.
                  Gaps between your scores and the ideal are where to focus.
                </p>
                <div className="flex justify-center">
                  <PositionPPIPreview scores={previewPPI.estimated} ideal={previewPPI.ideal} />
                </div>
                <div className="mt-3 flex items-center gap-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-[2px] rounded bg-[#7C5BF0]" />
                    <span className="text-[9px] text-[#94A3B8]">Your Estimate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-[2px] rounded bg-[#2DD4A8] opacity-50" style={{ borderTop: '1px dashed #2DD4A8' }} />
                    <span className="text-[9px] text-[#94A3B8]">Ideal Shape</span>
                  </div>
                </div>
              </div>

              {/* Position weight highlights */}
              <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  Critical Skills for {POSITION_LABELS[onboarding.primaryPosition]}
                </div>
                <div className="flex flex-wrap gap-2">
                  {PPI_AXES.map(axis => {
                    const weight = (previewPPI.ideal[axis] / Math.max(...PPI_AXES.map(a => previewPPI.ideal[a])))
                    const isCritical = weight > 0.95
                    const isHigh = weight > 0.85
                    if (!isHigh) return null
                    return (
                      <span
                        key={axis}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold ${
                          isCritical
                            ? 'bg-[#2DD4A8]/15 text-[#2DD4A8] border border-[#2DD4A8]/30'
                            : 'bg-[#7C5BF0]/10 text-[#7C5BF0] border border-[#7C5BF0]/20'
                        }`}
                      >
                        {isCritical ? 'CRITICAL' : 'HIGH'}: {PPI_LABELS[axis]}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Secondary Positions (NEW) */}
          {step === 4 && (
            <>
              <p className="text-[10px] text-[#64748B] mb-1">
                Select any other positions you play. The app will let you toggle PPI views between positions.
              </p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { secondaryPositions: [] } })}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  (onboarding.secondaryPositions || []).length === 0
                    ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                    : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                }`}
              >
                <span className="font-semibold text-white text-[12px]">None — I only play {POSITION_LABELS[onboarding.primaryPosition]}</span>
              </button>
              {POSITIONS.filter(p => p !== onboarding.primaryPosition).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => toggleSecondaryPosition(pos)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    (onboarding.secondaryPositions || []).includes(pos)
                      ? 'border-[#4A7BF7] bg-[#4A7BF7]/10'
                      : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                  }`}
                >
                  <span className="font-semibold text-white text-[12px]">{POSITION_LABELS[pos]}</span>
                </button>
              ))}
            </>
          )}

          {/* Step 5: Skills */}
          {step === 5 && (
            <>
              <p className="text-[10px] text-[#64748B]">Select all that apply</p>
              {SKILL_AREAS.map((area) => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => toggleSkillArea(area.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    onboarding.skillAreas.includes(area.value)
                      ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                      : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                  }`}
                >
                  <span className="text-base mr-2">{area.icon}</span>
                  <span className="font-semibold text-white text-[12px]">{area.label}</span>
                </button>
              ))}
            </>
          )}

          {/* Step 6: Focus */}
          {step === 6 && (
            <>
              <p className="text-[10px] text-[#64748B]">Pick 1-3 priorities</p>
              <div className="grid grid-cols-2 gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => toggleFocusArea(area.value)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      onboarding.focusAreas.includes(area.value)
                        ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                        : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                    }`}
                  >
                    <span className="font-semibold text-white text-[11px]">{area.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 7: Competition */}
          {step === 7 && COMPETITIONS.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { competition: comp } })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                onboarding.competition === comp
                  ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                  : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
              }`}
            >
              <span className="font-medium text-white text-[12px]">{comp}</span>
            </button>
          ))}

          {/* Step 8: Commitment */}
          {step === 8 && (
            <div>
              <div className="text-center mb-4">
                <span className="text-4xl font-black text-[#2DD4A8]">{onboarding.weeklyTrainingHours}</span>
                <span className="text-sm text-[#94A3B8] ml-2">hours / week</span>
              </div>
              <input
                type="range" min="1" max="20"
                value={onboarding.weeklyTrainingHours}
                onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { weeklyTrainingHours: parseInt(e.target.value) } })}
                className="w-full accent-[#2DD4A8]"
              />
              <div className="flex justify-between text-[9px] text-[#64748B] mt-1">
                <span>1 hr</span><span>20 hrs</span>
              </div>
            </div>
          )}

          {/* Step 9: Benchmarking Opt-In (NEW) */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#F1F5F9] mb-2">Anonymous Division Percentiles</h3>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                  Opt in to see how your PPI scores compare to other players in your division.
                  Your data is <span className="text-[#2DD4A8] font-semibold">completely anonymous</span> — no names, no team names, just aggregate percentile data.
                </p>
                <div className="flex items-center gap-3 bg-[#2A3050] rounded-lg p-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-stat text-lg font-bold text-[#F1F5F9]">62</span>
                    <span className="text-[8px] text-[#64748B] uppercase">Score</span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.08]" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-stat text-lg font-bold text-[#4A7BF7]">Top 38%</span>
                    <span className="text-[8px] text-[#64748B] uppercase">Your Division</span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.08]" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-stat text-lg font-bold text-[#2DD4A8]">+9 pts</span>
                    <span className="text-[8px] text-[#64748B] uppercase">Next Div</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { benchmarkOptIn: true } })}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  onboarding.benchmarkOptIn
                    ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                    : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold text-white text-[13px]">Yes, opt me in</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">See division percentiles and contribute anonymously</div>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ONBOARDING', data: { benchmarkOptIn: false } })}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  !onboarding.benchmarkOptIn
                    ? 'border-[#94A3B8] bg-[#94A3B8]/5'
                    : 'border-white/[0.08] bg-[#111827] hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold text-white text-[13px]">No thanks</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">I prefer not to share data</div>
              </button>
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
              canAdvance() ? 'btn-primary' : 'bg-[#111827] text-[#64748B] cursor-not-allowed'
            }`}
          >
            {step === steps.length - 1 ? 'Start Training' : step === 4 ? 'Skip / Next' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
