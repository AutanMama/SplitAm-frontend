import { Rocket } from 'lucide-react'
import Button from '../ui/Button'

export default function SetupBanner({ derived, isAdmin, busy, onLaunch }) {
  const { filledSlots, totalRounds, emptySlots } = derived
  const ready = emptySlots === 0
  return (
    <div className={`flex flex-col gap-3 rounded-card border p-4 sm:flex-row sm:items-center ${ready ? 'border-paid/30 bg-paid-soft' : 'border-due/20 bg-due-soft'}`}>
      <div className="flex-1">
        <p className={`font-semibold ${ready ? 'text-paid' : 'text-due'}`}>
          {ready ? 'All slots filled. Ready to start.' : `${filledSlots} of ${totalRounds} slots filled`}
        </p>
        <p className="text-sm text-muted">
          {ready ? 'Once it starts, members see the schedule and begin paying.' : 'Members request hands and the admin places them in the rotation.'}
        </p>
      </div>
      {isAdmin && ready && (
        <Button onClick={onLaunch} loading={busy}>
          <Rocket className="size-4" aria-hidden /> Start the ajo
        </Button>
      )}
    </div>
  )
}
