import Badge from '../ui/Badge'
import ProgressRing from '../ui/ProgressRing'
import { naira } from '../../lib/format'

export default function AjoHero({ ajo, derived }) {
  const { isSetup, isActive, isCompleted, currentCycle, totalRounds, potPerRound, collectedThisRound, baseAmount, filledSlots } = derived
  const paidPct = potPerRound ? Math.min(100, Math.round((collectedThisRound / potPerRound) * 100)) : 0

  return (
    <section className="relative overflow-hidden rounded-card bg-forest p-5 text-on-forest shadow-float md:p-7" aria-label="Ajo summary">
      <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full border-[30px] border-lime/10" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold md:text-2xl">{ajo.title}</h2>
            {isSetup && <Badge tone="lime">Setting up</Badge>}
            {isCompleted && <Badge tone="lime">Completed</Badge>}
          </div>
          <p className="mt-1 text-sm text-forest-muted">
            {naira(baseAmount)} per hand · {ajo.frequency}
          </p>

          <p className="mt-5 text-sm text-forest-muted">{isActive ? 'Pot this round' : 'Pot each round'}</p>
          <p className="money text-3xl font-bold md:text-4xl">{naira(potPerRound)}</p>
        </div>

        <ProgressRing value={isActive ? currentCycle : isCompleted ? totalRounds : filledSlots} max={totalRounds} size={92}>
          <span className="text-[11px] leading-tight text-forest-muted">
            <span className="money block text-2xl font-bold text-on-forest">{isActive ? currentCycle : isCompleted ? totalRounds : filledSlots}</span>
            {isSetup ? `of ${totalRounds} slots` : `of ${totalRounds}`}
          </span>
        </ProgressRing>
      </div>

      {isActive && (
        <div className="relative mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} aria-label="Paid in this round">
            <div className="h-full rounded-full bg-lime transition-[width] duration-700" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-forest-muted">
            <span className="money font-semibold text-on-forest">{naira(collectedThisRound)}</span> of {naira(potPerRound)} paid in for round {currentCycle}
          </p>
        </div>
      )}
    </section>
  )
}
