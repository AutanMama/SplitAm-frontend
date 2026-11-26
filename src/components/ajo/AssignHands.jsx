import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import { Input } from '../ui/Field'
import { toast } from '../../services/toast'
import { isGhostMember } from '../../lib/ajo'
import { plural } from '../../lib/format'

// Admin shortcut: give hands to a member directly instead of waiting for a request.
export default function AssignHands({ ajo, derived, busy, onAssign }) {
  const { membersNotYetIn, emptySlots } = derived
  const [editing, setEditing] = useState(null)
  const [hands, setHands] = useState('1')

  async function save(member) {
    const n = Number(hands)
    if (!Number.isInteger(n) || n < 1) return toast.error('Enter how many hands (whole number)')
    if (n > emptySlots) return toast.error(`Only ${plural(emptySlots, 'slot')} left`)
    const slotPositions = ajo.rotation
      .map((s, i) => (s.member ? -1 : i))
      .filter((i) => i >= 0)
      .slice(0, n)
    const res = await onAssign(member._id, member.name || 'Member', slotPositions)
    if (res) {
      setEditing(null)
      setHands('1')
    }
  }

  return (
    <Card>
      <CardHeader title="Assign hands directly" description={`Skip the request and place someone yourself. ${plural(emptySlots, 'slot')} left.`} />
      <ul className="divide-y divide-line">
        {membersNotYetIn.map((m) => {
          const name = m.name || 'Member'
          const isEditing = editing === m._id
          return (
            <li key={m._id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={name} size="sm" tone={isGhostMember(m) ? 'ghost' : 'neutral'} />
              <span className="flex min-w-0 flex-1 items-center gap-2 font-medium">
                <span className="truncate">{name}</span>
                {isGhostMember(m) && <Badge tone="due">No app</Badge>}
              </span>
              {isEditing ? (
                <span className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`assign-${m._id}`}>
                    Hands for {name}
                  </label>
                  <Input id={`assign-${m._id}`} type="number" min="1" max={emptySlots} className="!h-9 w-16 text-center" value={hands} onChange={(e) => setHands(e.target.value)} autoFocus />
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" loading={busy} onClick={() => save(m)}>
                    Save
                  </Button>
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(m._id)
                    setHands('1')
                  }}
                >
                  Assign
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
