import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Segmented from '../ui/Segmented'
import api from '../../services/api'
import { toast } from '../../services/toast'
import { apiError } from '../../lib/format'

export default function AddMemberSheet({ groupId, inviteCode, open, onClose, onMemberAdded }) {
  const [mode, setMode] = useState('phone')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      toast.success('Invite code copied. Paste it into a chat.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy. Select the code manually.")
    }
  }

  async function addByEmail(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/groups/add-member', { groupId, email: email.trim() })
      toast.success(`${email} was added to the group`)
      setEmail('')
      onMemberAdded()
      onClose()
    } catch (err) {
      toast.error(apiError(err, "Couldn't add that person. Are they signed up?"))
    } finally {
      setLoading(false)
    }
  }

  async function addByPhone(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error("Enter the person's name")
    if (!phone.trim()) return toast.error('Enter their phone number')
    setLoading(true)
    try {
      const { data: member } = await api.post(`/groups/${groupId}/members/ghost`, { name: name.trim(), phone: phone.trim() })
      // Ghost members get a WhatsApp invite straight away.
      if (member.isGhost && member._id) {
        try {
          await api.post(`/groups/${groupId}/members/${member._id}/invite`)
          toast.success(`${name} added and invited on WhatsApp`)
        } catch {
          toast.success(`${name} added (couldn't send the WhatsApp invite, try again later)`)
        }
      } else {
        toast.success(`${name} added to the group`)
      }
      setName('')
      setPhone('')
      onMemberAdded()
      onClose()
    } catch (err) {
      toast.error(apiError(err, "Couldn't add that person"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add people" description="Share the code, or add someone yourself.">
      <div className="space-y-5 pb-2">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-indigo p-4 text-on-indigo">
          <div>
            <p className="text-sm text-indigo-muted">Invite code</p>
            <p className="font-mono text-2xl font-semibold tracking-[0.15em] text-kola">{inviteCode}</p>
            <p className="mt-1 text-xs text-indigo-muted">Anyone with this code can ask to join. You approve them.</p>
          </div>
          <Button variant="kola" size="sm" onClick={copyCode}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <Segmented
          label="Add by"
          value={mode}
          onChange={setMode}
          options={[
            { id: 'phone', label: 'By phone' },
            { id: 'email', label: 'By email' },
          ]}
        />

        {mode === 'phone' ? (
          <form onSubmit={addByPhone} className="space-y-3">
            <Field label="Their name" required maxLength={60} placeholder="e.g. Musa Ibrahim" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Phone number" type="tel" inputMode="tel" required placeholder="0801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button type="submit" className="w-full" disabled={!name.trim() || !phone.trim()} loading={loading}>
              Add and send WhatsApp invite
            </Button>
            <p className="text-sm text-muted">They don’t need an account. You can track and mark their payments, and when they sign up later their history links automatically.</p>
          </form>
        ) : (
          <form onSubmit={addByEmail} className="space-y-3">
            <Field label="Email" type="email" required placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" className="w-full" disabled={!email.trim()} loading={loading}>
              Add to group
            </Button>
            <p className="text-sm text-muted">They need to have a SplitAm account already.</p>
          </form>
        )}
      </div>
    </Sheet>
  )
}
