import Badge from '../ui/Badge'
import ProgressRing from '../ui/ProgressRing'
import { naira } from '../../lib/format'
import AdirePattern from '../brand/AdirePattern'

export default function AjoHero({ ajo, derived }) {
  const { isSetup, isActive, isCompleted, currentCycle, totalRounds, potPerRound, collectedThisRound, baseAmount, filledSlots } = derived
  const paidPct = potPerRound ? Math.min(100, Math.round((collectedThisRound / potPerRound) * 100)) : 0

  return (
    <section className="relative overflow-hidden rounded-card bg-indigo p-5 text-on-indigo shadow-float md:p-7" aria-label="Ajo summary">
      <AdirePattern motif="oniko" size={52} className="absolute inset-y-0 right-0 h-full w-2/3 text-indigo-muted/[0.12] [mask-image:linear-gradient(to_left,black,transparent)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="serif text-2xl md:text-3xl">{ajo.title}</h2>
            {isSetup && <Badge tone="kola">Setting up</Badge>}
            {isCompleted && <Badge tone="kola">Completed</Badge>}
          </div>
          <p className="mt-1 text-sm text-indigo-muted">
            {naira(baseAmount)} per hand · {ajo.frequency}
          </p>

          <p className="mt-5 text-sm text-indigo-muted">{isActive ? 'Pot this round' : 'Pot each round'}</p>
          <p className="money text-3xl font-bold md:text-4xl">{naira(potPerRound)}</p>
        </div>

        <ProgressRing value={isActive ? currentCycle : isCompleted ? totalRounds : filledSlots} max={totalRounds} size={92}>
          <span className="text-xs leading-tight text-indigo-muted">
            <span className="money block text-2xl font-bold text-on-indigo">{isActive ? currentCycle : isCompleted ? totalRounds : filledSlots}</span>
            {isSetup ? `of ${totalRounds} slots` : `of ${totalRounds}`}
          </span>
        </ProgressRing>
      </div>

      {isActive && (
        <div className="relative mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} aria-label="Paid in this round">
            <div className="h-full rounded-full bg-kola transition-[width] duration-700" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-indigo-muted">
            <span className="money font-semibold text-on-indigo">{naira(collectedThisRound)}</span> of {naira(potPerRound)} paid in for round {currentCycle}
          </p>
        </div>
      )}
    </section>
  )
}
