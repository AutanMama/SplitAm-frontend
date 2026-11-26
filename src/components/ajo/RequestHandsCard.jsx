import { useState } from 'react'
import { Hourglass } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { Input } from '../ui/Field'
import { naira, plural } from '../../lib/format'

export default function RequestHandsCard({ derived, busy, onRequest }) {
  const { myPendingRequest, baseAmount, emptySlots } = derived
  const [hands, setHands] = useState('1')
  const [note, setNote] = useState('')

  if (myPendingRequest) {
    return (
      <Card className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-due-soft text-due">
          <Hourglass className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold">Request sent · {plural(myPendingRequest.requestedHands, 'hand')}</p>
          <p className="text-sm text-muted">Waiting for the admin to approve and place you in the rotation.</p>
        </div>
      </Card>
    )
  }

  const n = Number(hands)
  const valid = Number.isInteger(n) && n >= 1

  async function submit(e) {
    e.preventDefault()
    if (!valid) return
    const res = await onRequest(n, note)
    if (res) {
      setHands('1')
      setNote('')
    }
  }

  return (
    <Card as="form" onSubmit={submit}>
      <h3 className="font-bold">Join this ajo</h3>
      <p className="mt-1 text-sm text-muted">Each hand pays {naira(baseAmount)} per round and gives you one turn to collect the pot.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[110px_1fr_auto]">
        <label className="sr-only" htmlFor="hands">
          Hands
        </label>
        <Input id="hands" type="number" min="1" max={emptySlots || undefined} inputMode="numeric" value={hands} onChange={(e) => setHands(e.target.value)} />
        <label className="sr-only" htmlFor="hands-note">
          Note for the admin
        </label>
        <Input id="hands-note" placeholder="Note for the admin (optional)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" disabled={!valid} loading={busy}>
          Request {valid ? plural(n, 'hand') : 'hands'}
        </Button>
      </div>
      {valid && <p className="mt-2 text-sm text-muted">You’d pay {naira(baseAmount * n)} each round.</p>}
    </Card>
  )
}
