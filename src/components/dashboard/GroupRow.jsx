import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AvatarStack } from '../ui/Avatar'
import Badge from '../ui/Badge'
import { naira, plural } from '../../lib/format'

function AjoStatus({ ajo, stake }) {
  if (!ajo) return <span className="text-sm text-muted">No ajo yet</span>
  if (ajo.cycleStatus === 'setup') {
    return stake.hands > 0 ? <Badge tone="due">Setting up · you have {plural(stake.hands, 'hand')}</Badge> : <Badge tone="due">Setting up · request hands</Badge>
  }
  if (ajo.cycleStatus === 'completed') return <Badge tone="paid">Completed</Badge>
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Badge tone="neutral">
        Round {ajo.currentCycle || 1} of {ajo.totalRounds || ajo.rotation?.length}
      </Badge>
      {stake.nextTurnRound === (ajo.currentCycle || 1) && <Badge tone="kola">Your turn</Badge>}
    </span>
  )
}

export function GroupRowSkeleton() {
  return <div className="skeleton h-[92px] rounded-card" aria-hidden />
}

export default function GroupRow({ group, ajo, stake }) {
  const names = (group.members || []).map((m) => m.name || 'Member')
  return (
    <Link
      to={`/group/${group._id}`}
      className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition hover:border-indigo/30 md:p-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-base font-bold md:text-lg">{group.name}</h3>
        </div>
        <div className="mt-2">
          <AjoStatus ajo={ajo} stake={stake} />
        </div>
      </div>

      <div className="hidden text-right sm:block">
        {stake.hands > 0 ? (
          <>
            <p className="money font-bold">{naira(stake.perRound)}</p>
            <p className="text-xs text-muted">per round</p>
          </>
        ) : (
          <AvatarStack names={names} />
        )}
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}
