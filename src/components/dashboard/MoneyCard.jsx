import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarClock, Layers } from 'lucide-react'
import { naira, plural } from '../../lib/format'

export function MoneyCardSkeleton() {
  return <div className="skeleton h-48 rounded-card md:h-52" aria-hidden />
}

export default function MoneyCard({ perRound, activeCount, nextTurn }) {
  return (
    <section className="relative overflow-hidden rounded-card bg-forest p-6 text-on-forest shadow-float md:p-8" aria-label="Your ajo summary">
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full border-[28px] border-lime/10" aria-hidden />
      <p className="text-sm font-medium text-forest-muted">You pay each round</p>
      <p className="money mt-1 text-4xl font-bold md:text-5xl">{naira(perRound)}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm">
          <Layers className="size-4 text-lime" aria-hidden />
          {plural(activeCount, 'active ajo')}
        </span>
        {nextTurn && (
          <Link
            to={`/group/${nextTurn.groupId}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-sm font-semibold text-on-lime"
          >
            <CalendarClock className="size-4" aria-hidden />
            {nextTurn.roundsAway === 0 ? 'You collect this round' : `You collect in round ${nextTurn.round}`}
            <span className="hidden font-normal sm:inline">· {nextTurn.groupName}</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  )
}
