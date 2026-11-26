import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarClock, Layers } from 'lucide-react'
import { naira, plural } from '../../lib/format'
import AdirePattern from '../brand/AdirePattern'

export function MoneyCardSkeleton() {
  return <div className="skeleton h-48 rounded-card md:h-52" aria-hidden />
}

export default function MoneyCard({ perRound, activeCount, nextTurn }) {
  return (
    <section className="relative overflow-hidden rounded-card bg-indigo p-6 text-on-indigo shadow-float md:p-8" aria-label="Your ajo summary">
      <AdirePattern motif="oniko" size={52} className="absolute inset-y-0 right-0 h-full w-1/2 text-indigo-muted/[0.14] [mask-image:linear-gradient(to_left,black,transparent)]" />
      <p className="relative text-sm font-medium text-indigo-muted">You pay each round</p>
      <p className="money relative mt-1 text-4xl font-bold md:text-5xl">{naira(perRound)}</p>

      <div className="relative mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm">
          <Layers className="size-4 text-kola" aria-hidden />
          {plural(activeCount, 'active ajo')}
        </span>
        {nextTurn && (
          <Link
            to={`/group/${nextTurn.groupId}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-kola px-3 py-1.5 text-sm font-semibold text-on-kola"
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
