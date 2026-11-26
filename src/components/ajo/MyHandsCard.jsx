import { CircleCheck } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { naira, plural } from '../../lib/format'

export default function MyHandsCard({ derived, busy, onPay }) {
  const { myHandCount, myHandSlots, baseAmount, potPerRound, isActive, iHavePaid, currentCycle } = derived
  const rounds = myHandSlots.map((x) => x.index + 1)
  const collectsNow = isActive && rounds.includes(currentCycle)

  return (
    <Card className={collectsNow ? 'border-lime ring-2 ring-lime/60' : ''}>
      <p className="text-sm font-semibold text-muted">Your stake · {plural(myHandCount, 'hand')}</p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="money text-2xl font-bold">{naira(baseAmount * myHandCount)}</p>
          <p className="text-sm text-muted">you pay each round</p>
        </div>
        <div>
          <p className="money text-2xl font-bold">{naira(potPerRound)}</p>
          <p className="text-sm text-muted">
            you collect in round{rounds.length > 1 ? 's' : ''} {rounds.join(', ')}
          </p>
        </div>
      </div>

      {collectsNow && <p className="mt-4 rounded-xl bg-lime px-3 py-2 text-sm font-semibold text-on-lime">It’s your turn this round. The pot comes to you.</p>}

      {isActive &&
        (iHavePaid ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-paid">
            <CircleCheck className="size-5" aria-hidden /> Paid for round {currentCycle}
          </p>
        ) : (
          <Button className="mt-4 w-full sm:w-auto" onClick={onPay} loading={busy}>
            I’ve paid round {currentCycle}
          </Button>
        ))}
    </Card>
  )
}
