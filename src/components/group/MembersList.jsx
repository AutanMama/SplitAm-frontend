import { MessageCircle, Trash2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card, { CardHeader } from '../ui/Card'
import api from '../../services/api'
import { confirm } from '../../services/confirm'
import { toast } from '../../services/toast'
import { isGhostMember } from '../../lib/ajo'
import { apiError, formatPhone, plural } from '../../lib/format'

export default function MembersList({ group, isAdmin, currentUserId, onUpdate }) {
  async function invite(member) {
    try {
      await api.post(`/groups/${group._id}/members/${member._id}/invite`)
      toast.success(`Invite sent to ${member.name}`)
    } catch (err) {
      toast.error(apiError(err, "Couldn't send invite"))
    }
  }

  async function remove(member) {
    const ok = await confirm({ title: `Remove ${member.name || 'this person'}?`, body: 'They lose access to the group and its ajo.', confirmLabel: 'Remove', danger: true })
    if (!ok) return
    try {
      await api.delete(`/groups/${group._id}/members/${member._id}`)
      toast.success('Member removed')
      onUpdate()
    } catch (err) {
      toast.error(apiError(err, "Couldn't remove that member"))
    }
  }

  return (
    <Card>
      <CardHeader title="Members" description={plural(group.members.length, 'person', 'people')} />
      <ul className="divide-y divide-line">
        {group.members.map((m) => {
          const name = m.name || 'Member'
          const isMe = Boolean(m.userId) && m.userId.toString() === currentUserId
          const ghost = isGhostMember(m)
          const contact = m.email || formatPhone(m.phone) || 'No contact'
          return (
            <li key={m._id} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={name} tone={isMe ? 'me' : ghost ? 'ghost' : 'neutral'} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                  <span className="truncate">{name}</span>
                  {isMe && <span className="text-sm font-normal text-muted">(you)</span>}
                  {m.role === 'ADMIN' && <Badge tone="forest">Admin</Badge>}
                  {ghost && <Badge tone="due">No app yet</Badge>}
                </p>
                <p className="truncate text-sm text-muted">{contact}</p>
              </div>
              {isAdmin && ghost && m.phone && (
                <Button size="sm" variant="secondary" onClick={() => invite(m)} title="Send WhatsApp invite">
                  <MessageCircle className="size-4" aria-hidden /> Invite
                </Button>
              )}
              {isAdmin && !isMe && (
                <button
                  type="button"
                  onClick={() => remove(m)}
                  aria-label={`Remove ${name}`}
                  className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-danger-soft hover:text-danger md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
