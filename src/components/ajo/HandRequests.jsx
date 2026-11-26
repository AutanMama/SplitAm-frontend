import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import { Input } from '../ui/Field'
import { naira, plural } from '../../lib/format'

function RequestRow({ req, baseAmount, emptySlots, busy, onApprove, onReject }) {
  const [hands, setHands] = useState(req.requestedHands)
  const name = req.member?.name || 'Someone'
  const n = Number(hands)
  const valid = n >= 1 && n <= emptySlots

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted">Asked for {plural(req.requestedHands, 'hand')}</p>
          {req.note && <p className="mt-1 rounded-lg bg-sunk px-2.5 py-1.5 text-sm">“{req.note}”</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-[52px]">
        <label className="text-sm text-muted" htmlFor={`approve-${req._id}`}>
          Approve
        </label>
        <Input id={`approve-${req._id}`} type="number" min="1" max={emptySlots} className="!h-9 w-16 text-center" value={hands} onChange={(e) => setHands(e.target.value)} />
        <span className="text-sm text-muted">hands · {naira(baseAmount * (n || 0))}/round</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onReject(req._id, name)}>
            Reject
          </Button>
          <Button size="sm" disabled={busy || !valid} onClick={() => onApprove(req._id, name, n)}>
            Approve
          </Button>
        </div>
      </div>
      {n > emptySlots && <p className="mt-1 text-sm text-danger sm:pl-[52px]">Only {plural(emptySlots, 'slot')} left.</p>}
    </li>
  )
}

export default function HandRequests({ derived, busy, actions }) {
  const { pendingRequests, baseAmount, emptySlots } = derived
  return (
    <Card className="border-due/30">
      <CardHeader title={`Hand requests · ${pendingRequests.length}`} description="Approve to place them in the next empty slots." />
      <ul className="divide-y divide-line">
        {pendingRequests.map((req) => (
          <RequestRow key={req._id} req={req} baseAmount={baseAmount} emptySlots={emptySlots} busy={busy} onApprove={actions.approveRequest} onReject={actions.rejectRequest} />
        ))}
      </ul>
    </Card>
  )
}
