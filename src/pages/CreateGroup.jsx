import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import api from '../services/api'
import { toast } from '../services/toast'
import { apiError } from '../lib/format'

const NEXT = ['Share the invite code in your WhatsApp group', 'Add anyone without the app by name and phone', 'Set up the ajo: amount per hand, rounds and how often']

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!navigator.onLine) {
      toast.error("You're offline. Connect to the internet to create a group.")
      return
    }
    setLoading(true)
    try {
      await api.post('/groups', { name, description })
      toast.success(`Group "${name}" created`)
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      toast.error(apiError(err, "Couldn't create the group. Try again."))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Your groups
      </Link>
      <h1 className="serif mt-3 text-4xl">New group</h1>
      <p className="mt-1 text-muted">A group is where you run an ajo with your guys, your office or your family.</p>

      <div className="mt-8 grid items-start gap-6 md:grid-cols-[1fr_280px]">
        <Card as="form" onSubmit={handleSubmit} className="space-y-5">
          <Field label="Group name" required maxLength={60} placeholder="e.g. Office Adashi" value={name} onChange={(e) => setName(e.target.value)} />
          <Field
            label="What’s it for?"
            optional
            multiline
            rows={3}
            maxLength={280}
            placeholder="e.g. 10-month ajo for our office, ₦50k per hand"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()} loading={loading}>
              {loading ? 'Creating…' : 'Create group'}
            </Button>
          </div>
        </Card>

        <aside className="rounded-card bg-sunk p-5">
          <p className="text-sm font-semibold">What happens next</p>
          <ol className="mt-3 space-y-3">
            {NEXT.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-muted">
                <span className="money grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-indigo">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}
