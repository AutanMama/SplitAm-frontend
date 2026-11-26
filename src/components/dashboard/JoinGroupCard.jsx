import { useState } from 'react'
import { Ticket } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import api from '../../services/api'
import { toast } from '../../services/toast'
import { apiError } from '../../lib/format'

export default function JoinGroupCard({ onJoined }) {
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)

  async function handleJoin(e) {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    try {
      const { data } = await api.post(`/groups/join/${code.trim().toUpperCase()}`)
      setCode('')
      toast.success(`Joined ${data?.group?.name || 'group'}!`)
      onJoined()
    } catch (err) {
      toast.error(apiError(err, "That code didn't work. Double-check it."))
    } finally {
      setJoining(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunk text-indigo">
          <Ticket className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-bold">Got an invite code?</h2>
          <p className="text-sm text-muted">Paste it to ask to join a group.</p>
        </div>
      </div>
      <form onSubmit={handleJoin} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="invite-code">
          Invite code
        </label>
        <input
          id="invite-code"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-center font-mono text-base font-semibold tracking-[0.2em] uppercase placeholder:tracking-normal placeholder:text-muted/70 focus:border-indigo focus:ring-4 focus:ring-indigo/10 focus:outline-none"
          placeholder="AX72J3F1"
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" disabled={!code.trim()} loading={joining}>
          Join
        </Button>
      </form>
    </Card>
  )
}
