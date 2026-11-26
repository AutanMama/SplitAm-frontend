import { BellRing, CircleCheck, Share2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import { isGhostMember } from '../../lib/ajo'
import { naira, plural } from '../../lib/format'

function ReminderSwitch({ on, busy, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg py-1 text-sm font-medium whitespace-nowrap text-muted hover:text-ink disabled:opacity-50"
    >
      <span className={`relative block h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-paid' : 'bg-line'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      Send daily reminders automatically
    </button>
  )
}

// Admin view of who has paid the current round.
export default function Payments({ ajo, derived, busy, actions, onShare }) {
  const { uniqueParticipants, paidThisCycle, baseAmount, currentCycle, unpaidCount } = derived
  const paidCount = uniqueParticipants.length - unpaidCount

  return (
    <Card>
      <CardHeader
        title={`Round ${currentCycle} payments`}
        description={`${paidCount} of ${plural(uniqueParticipants.length, 'member')} paid`}
      />

      <ul className="divide-y divide-line">
        {uniqueParticipants.map((p) => {
          const name = p.member?.name || 'Member'
          const paid = paidThisCycle.has(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
              <Avatar name={name} size="sm" tone={paid ? 'paid' : isGhostMember(p.member) ? 'ghost' : 'neutral'} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="money text-sm text-muted">
                  {plural(p.hands, 'hand')} · {naira(baseAmount * p.hands)}
                </p>
              </div>
              {paid ? (
                <Badge tone="paid" icon={CircleCheck}>
                  Paid
                </Badge>
              ) : (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => actions.markPaid(p.id, name)}>
                  Mark paid
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <ReminderSwitch on={Boolean(ajo.autoRemindersEnabled)} busy={busy} onToggle={actions.toggleReminders} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" onClick={onShare}>
          <Share2 className="size-4" aria-hidden /> Share update
        </Button>
        <Button disabled={busy || unpaidCount === 0} onClick={() => actions.sendReminders(unpaidCount)}>
          <BellRing className="size-4" aria-hidden /> {unpaidCount ? `Remind ${unpaidCount} unpaid` : 'Everyone has paid'}
        </Button>
      </div>
    </Card>
  )
}
