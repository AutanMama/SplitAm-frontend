import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import GroupHeader from '../components/group/GroupHeader'
import JoinRequests from '../components/group/JoinRequests'
import MembersList from '../components/group/MembersList'
import ActivityFeed from '../components/group/ActivityFeed'
import StartAjoCard from '../components/group/StartAjoCard'
import StartAjoSheet from '../components/group/StartAjoSheet'
import AddMemberSheet from '../components/group/AddMemberSheet'
import DangerZone from '../components/group/DangerZone'
import AjoPanel from '../components/ajo/AjoPanel'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Segmented from '../components/ui/Segmented'
import Skeleton from '../components/ui/Skeleton'
import api from '../services/api'
import { toast } from '../services/toast'
import { getUser } from '../lib/session'

function GroupSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading group">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    </div>
  )
}

export default function GroupDetails() {
  const { groupId } = useParams()
  const user = getUser()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ajo')
  const [addingPeople, setAddingPeople] = useState(false)
  const [startingAjo, setStartingAjo] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/groups')
      const current = data.find((g) => g._id === groupId)
      if (!current) {
        setGroup(null)
        return
      }
      try {
        const { data: ajo } = await api.get(`/ajo/${groupId}`)
        current.activeAjo = ajo
      } catch {
        current.activeAjo = null
      }
      setGroup(current)
    } catch {
      toast.error("Couldn't load this group. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !group) return <GroupSkeleton />

  if (!group) {
    return (
      <EmptyState
        icon={SearchX}
        title="We couldn’t find this group"
        action={
          <Button as={Link} to="/" variant="secondary">
            Back to your groups
          </Button>
        }
      >
        It may have been deleted, or you’re no longer a member.
      </EmptyState>
    )
  }

  const isAdmin = group.owner === user.id || group.owner?._id === user.id
  const joinRequests = isAdmin ? group.joinRequests || [] : []

  const ajoSection = group.activeAjo ? (
    <AjoPanel group={group} isAdmin={isAdmin} currentUserId={user.id} onUpdate={fetchData} />
  ) : (
    <StartAjoCard isAdmin={isAdmin} onStart={() => setStartingAjo(true)} />
  )

  const peopleSection = (
    <div className="space-y-4">
      {joinRequests.length > 0 && <JoinRequests group={group} onUpdate={fetchData} />}
      <MembersList group={group} isAdmin={isAdmin} currentUserId={user.id} onUpdate={fetchData} />
    </div>
  )

  const activitySection = <ActivityFeed groupId={groupId} refreshKey={group.activeAjo?.updatedAt || group.updatedAt} />

  return (
    <div className="space-y-6">
      <GroupHeader group={group} isAdmin={isAdmin} onAddPeople={() => setAddingPeople(true)} />

      {/* Phones: one section at a time. */}
      <div className="lg:hidden">
        <div className="sticky top-14 z-20 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur-md">
          <Segmented
            label="Group sections"
            value={tab}
            onChange={setTab}
            options={[
              { id: 'ajo', label: 'Ajo' },
              { id: 'people', label: 'Members', count: joinRequests.length },
              { id: 'activity', label: 'Activity' },
            ]}
          />
        </div>
        <div className="mt-4">
          {tab === 'ajo' && ajoSection}
          {tab === 'people' && peopleSection}
          {tab === 'activity' && activitySection}
        </div>
      </div>

      {/* Desktop: ajo on the left, people and activity beside it. */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start">
        {ajoSection}
        <div className="space-y-4">
          {peopleSection}
          {activitySection}
        </div>
      </div>

      <DangerZone groupId={groupId} isAdmin={isAdmin} currentUserId={user.id} />

      <StartAjoSheet open={startingAjo} onClose={() => setStartingAjo(false)} groupId={groupId} onCreated={fetchData} />
      <AddMemberSheet
        groupId={groupId}
        inviteCode={group.inviteCode}
        open={addingPeople}
        onClose={() => setAddingPeople(false)}
        onMemberAdded={() => {
          fetchData()
          toast.success('Member added')
        }}
      />
    </div>
  )
}
