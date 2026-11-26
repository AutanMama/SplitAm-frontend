import { CircleDollarSign } from 'lucide-react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function StartAjoCard({ isAdmin, onStart }) {
  return (
    <EmptyState
      icon={CircleDollarSign}
      title="No ajo running yet"
      className="bg-surface"
      action={
        isAdmin ? (
          <Button onClick={onStart}>Set up an ajo</Button>
        ) : (
          <span className="rounded-full bg-sunk px-4 py-2 text-sm font-medium text-muted">Only the admin can start one</span>
        )
      }
    >
      Set the amount per hand and the number of rounds. Members request hands, you arrange the order, and each round one person collects the whole pot.
    </EmptyState>
  )
}
