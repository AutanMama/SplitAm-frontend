import { useNavigate } from 'react-router-dom'
import { LogOut, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import api from '../../services/api'
import { confirm } from '../../services/confirm'
import { toast } from '../../services/toast'
import { apiError } from '../../lib/format'

export default function DangerZone({ groupId, isAdmin, currentUserId }) {
  const navigate = useNavigate()

  async function leave() {
    const ok = await confirm({ title: 'Leave this group?', body: 'You’ll lose access to its ajo and history.', confirmLabel: 'Leave group', danger: true })
    if (!ok) return
    try {
      await api.delete(`/groups/${groupId}/members/${currentUserId}`)
      toast.success('You left the group')
      navigate('/')
    } catch (err) {
      toast.error(apiError(err, "Couldn't leave the group"))
    }
  }

  async function remove() {
    const ok = await confirm({
      title: 'Delete this group?',
      body: 'The ajo and all of its history will be gone for everyone. This can’t be undone.',
      confirmLabel: 'Delete for everyone',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/groups/${groupId}`)
      toast.success('Group deleted')
      navigate('/')
    } catch (err) {
      toast.error(apiError(err, "Couldn't delete the group"))
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-card border border-danger/20 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold">{isAdmin ? 'Delete group' : 'Leave group'}</h2>
        <p className="text-sm text-muted">{isAdmin ? 'Removes the group, its ajo and history for everyone.' : 'You can be added back by the admin later.'}</p>
      </div>
      {isAdmin ? (
        <Button variant="danger-soft" onClick={remove}>
          <Trash2 className="size-4" aria-hidden /> Delete group
        </Button>
      ) : (
        <Button variant="danger-soft" onClick={leave}>
          <LogOut className="size-4" aria-hidden /> Leave group
        </Button>
      )}
    </section>
  )
}
