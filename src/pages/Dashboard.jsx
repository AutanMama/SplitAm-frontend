import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, UsersRound } from 'lucide-react'
import MoneyCard, { MoneyCardSkeleton } from '../components/dashboard/MoneyCard'
import GroupRow, { GroupRowSkeleton } from '../components/dashboard/GroupRow'
import JoinGroupCard from '../components/dashboard/JoinGroupCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import api from '../services/api'
import { toast } from '../services/toast'
import { getUser } from '../lib/session'
import { firstName, plural } from '../lib/format'
import { myStakeIn } from '../lib/ajo'

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const groupIdOf = (ajo) => ajo.groupId?._id || ajo.groupId

export default function Dashboard() {
  const user = getUser()
  const [groups, setGroups] = useState([])
  const [myAjos, setMyAjos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [gRes, aRes] = await Promise.all([api.get('/groups'), api.get('/ajo/mine').catch(() => ({ data: [] }))])
      setGroups(gRes.data)
      setMyAjos(aRes.data || [])
    } catch {
      toast.error("Couldn't load your groups. Check your internet.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const { perRound, activeCount, nextTurn, stakes } = useMemo(() => {
    const stakeByAjo = {}
    let total = 0
    let soonest = null
    const active = myAjos.filter((a) => a.cycleStatus === 'active')

    myAjos.forEach((a) => {
      stakeByAjo[a._id] = myStakeIn(a, user?.id)
    })
    active.forEach((a) => {
      const stake = stakeByAjo[a._id]
      total += stake.perRound
      if (stake.nextTurnRound) {
        const roundsAway = stake.nextTurnRound - (a.currentCycle || 1)
        if (!soonest || roundsAway < soonest.roundsAway) {
          const group = groups.find((g) => g._id === groupIdOf(a))
          soonest = { roundsAway, round: stake.nextTurnRound, groupId: groupIdOf(a), groupName: group?.name || a.title }
        }
      }
    })
    return { perRound: total, activeCount: active.length, nextTurn: soonest, stakes: stakeByAjo }
  }, [myAjos, groups, user?.id])

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted">{greeting()},</p>
          <h1 className="text-3xl font-bold md:text-4xl">{firstName(user?.name || '')}</h1>
        </div>
        <div className="hidden md:block">
          <Button as={Link} to="/create-group">
            <Plus className="size-4" aria-hidden /> New group
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-6">
          {loading ? <MoneyCardSkeleton /> : activeCount > 0 && <MoneyCard perRound={perRound} activeCount={activeCount} nextTurn={nextTurn} />}

          <section aria-labelledby="groups-heading">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="groups-heading" className="text-lg font-bold">
                Your groups
              </h2>
              {!loading && groups.length > 0 && <span className="text-sm text-muted">{plural(groups.length, 'group')}</span>}
            </div>

            <div className="space-y-3">
              {loading &&
                Array.from({ length: 3 }, (_, i) => <GroupRowSkeleton key={i} />)}
              {!loading &&
                groups.map((group) => {
                  const ajo = myAjos.find((a) => groupIdOf(a) === group._id)
                  return <GroupRow key={group._id} group={group} ajo={ajo} stake={ajo ? stakes[ajo._id] : { hands: 0 }} />
                })}
              {!loading && groups.length === 0 && (
                <EmptyState
                  icon={UsersRound}
                  title="You’re not in any ajo yet"
                  action={
                    <Button as={Link} to="/create-group">
                      <Plus className="size-4" aria-hidden /> Create a group
                    </Button>
                  }
                >
                  Start a group for your friends, office or family, or paste an invite code from someone you trust.
                </EmptyState>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <JoinGroupCard onJoined={fetchAll} />
        </aside>
      </div>
    </div>
  )
}
