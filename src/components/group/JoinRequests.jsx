import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import api from '../../services/api'
import { toast } from '../../services/toast'
import { apiError } from '../../lib/format'

export default function JoinRequests({ group, onUpdate }) {
  const [approving, setApproving] = useState(null)

  async function approve(request) {
    setApproving(request._id)
    try {
      await api.post('/groups/approve-request', { groupId: group._id, userId: request._id })
      toast.success(`${request.name || 'They'} can now access the group`)
      onUpdate()
    } catch (err) {
      toast.error(apiError(err, "Couldn't approve. Try again."))
    } finally {
      setApproving(null)
    }
  }

  return (
    <Card className="border-due/30 bg-due-soft/40">
      <CardHeader title="Waiting to join" description="They used your invite code. Let in the people you know." />
      <ul className="divide-y divide-line">
        {group.joinRequests.map((r) => (
          <li key={r._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar name={r.name || 'New person'} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.name || 'New person'}</p>
              <p className="truncate text-sm text-muted">{r.email}</p>
            </div>
            <Button size="sm" loading={approving === r._id} onClick={() => approve(r)}>
              Let in
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
