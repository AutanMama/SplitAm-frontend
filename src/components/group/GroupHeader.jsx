import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Copy, UserPlus } from 'lucide-react'
import { AvatarStack } from '../ui/Avatar'
import Button from '../ui/Button'
import { toast } from '../../services/toast'
import { plural } from '../../lib/format'

export default function GroupHeader({ group, isAdmin, onAddPeople }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group.inviteCode)
      setCopied(true)
      toast.success('Invite code copied. Paste it into a chat.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy. Select the code manually.")
    }
  }

  return (
    <header>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Your groups
      </Link>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold md:text-4xl">{group.name}</h1>
          {group.description && <p className="mt-1 max-w-xl text-muted">{group.description}</p>}
          <div className="mt-3 flex items-center gap-3">
            <AvatarStack names={group.members.map((m) => m.name || 'Member')} />
            <span className="text-sm text-muted">{plural(group.members.length, 'member')}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="flex h-11 items-center gap-3 rounded-xl border border-line bg-surface px-3.5 text-left shadow-card hover:border-forest/40"
            aria-label={`Copy invite code ${group.inviteCode}`}
          >
            <span>
              <span className="block text-[11px] leading-none text-muted">Invite code</span>
              <span className="font-mono text-sm font-semibold tracking-wider">{group.inviteCode}</span>
            </span>
            {copied ? <Check className="size-4 text-paid" aria-hidden /> : <Copy className="size-4 text-muted" aria-hidden />}
          </button>
          {isAdmin && (
            <Button onClick={onAddPeople}>
              <UserPlus className="size-4" aria-hidden /> Add people
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
