import { ArrowDown, ArrowUp, Check, Send, X } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import { idStr, isGhostMember } from '../../lib/ajo'

function slotState(slot, index, derived) {
  if (!slot.member) return 'empty'
  if (slot.isPaidOut) return 'collected'
  if (derived.isActive && index + 1 === derived.currentCycle) return 'now'
  return 'upcoming'
}

const DOT = {
  collected: 'bg-paid text-white',
  now: 'bg-lime text-on-lime ring-4 ring-lime/30',
  upcoming: 'bg-surface text-muted border border-line',
  empty: 'border border-dashed border-line text-muted',
}

function SlotRow({ slot, index, derived, isAdmin, busy, actions, isLast, rotation }) {
  const state = slotState(slot, index, derived)
  const member = slot.member
  const memberId = idStr(member)
  const name = member?.name || 'Member'
  const isMine = Boolean(derived.myMemberId) && memberId === derived.myMemberId
  const participant = derived.uniqueParticipants.find((p) => p.id === memberId)
  const handNumber = rotation.slice(0, index + 1).filter((s) => idStr(s.member) === memberId).length
  const canReorder = isAdmin && derived.isSetup && !slot.isPaidOut

  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && <span className={`absolute top-9 bottom-0 left-[17px] w-0.5 ${state === 'collected' ? 'bg-paid' : 'bg-line'}`} aria-hidden />}
      <span className={`money relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${DOT[state]}`}>
        {state === 'collected' ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
      </span>

      <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-3 py-2 ${state === 'now' ? 'bg-lime/25' : ''}`}>
        {member ? (
          <>
            <Avatar name={name} size="sm" tone={isMine ? 'me' : isGhostMember(member) ? 'ghost' : 'neutral'} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                <span className="truncate">{name}</span>
                {isMine && <span className="text-sm font-normal text-muted">(you)</span>}
                {isGhostMember(member) && <Badge tone="due">No app</Badge>}
              </p>
              <p className="text-sm text-muted">
                {state === 'collected' && 'Collected'}
                {state === 'now' && 'Collects this round'}
                {state === 'upcoming' && `Round ${index + 1}`}
                {participant?.hands > 1 && ` · hand ${handNumber} of ${participant.hands}`}
              </p>
            </div>
          </>
        ) : (
          <p className="flex-1 text-sm text-muted">Round {index + 1} · empty slot</p>
        )}

        {canReorder && member && (
          <div className="flex gap-1">
            <button type="button" disabled={busy || index === 0} onClick={() => actions.moveSlot(index, 'up')} aria-label={`Move ${name} up`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sunk hover:text-ink disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              disabled={busy || index === rotation.length - 1}
              onClick={() => actions.moveSlot(index, 'down')}
              aria-label={`Move ${name} down`}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sunk hover:text-ink disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
            <button type="button" disabled={busy} onClick={() => actions.unassignSlot(index)} aria-label={`Clear slot ${index + 1}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
              <X className="size-4" />
            </button>
          </div>
        )}

        {isAdmin && state === 'now' && (
          <Button size="sm" className="w-full sm:w-auto" disabled={busy} onClick={() => actions.disburse(index, name, derived.potPerRound)}>
            <Send className="size-3.5" aria-hidden /> Send pot
          </Button>
        )}
      </div>
    </li>
  )
}

export default function Rotation({ ajo, derived, isAdmin, busy, actions }) {
  const rotation = ajo.rotation || []
  return (
    <Card>
      <CardHeader title="Rotation" description={derived.isSetup ? `${derived.filledSlots} of ${derived.totalRounds} slots filled` : 'Who collects, in order'} />
      <ol>
        {rotation.map((slot, index) => (
          <SlotRow key={index} slot={slot} index={index} derived={derived} isAdmin={isAdmin} busy={busy} actions={actions} isLast={index === rotation.length - 1} rotation={rotation} />
        ))}
      </ol>
    </Card>
  )
}
