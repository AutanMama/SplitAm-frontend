import { useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Field from '../ui/Field'
import api from '../../services/api'
import { toast } from '../../services/toast'
import { apiError, naira, plural } from '../../lib/format'

const EMPTY = { title: '', amount: '', totalRounds: '', frequency: 'monthly' }
const FREQUENCIES = ['daily', 'weekly', 'monthly']

export default function StartAjoSheet({ open, onClose, groupId, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const amount = Number(form.amount)
  const rounds = Number(form.totalRounds)
  const showPot = amount > 0 && rounds > 0

  async function submit() {
    if (!form.title.trim()) return toast.error('Give your ajo a name')
    if (!amount || amount <= 0) return toast.error('Enter the amount per hand')
    if (!Number.isInteger(rounds) || rounds < 1) return toast.error('Enter how many rounds in total (1 hand = 1 round)')

    setSaving(true)
    try {
      await api.post('/ajo', { groupId, title: form.title.trim(), contributionAmount: amount, totalRounds: rounds, frequency: form.frequency })
      toast.success('Ajo set up! Members can now request hands.')
      setForm(EMPTY)
      onClose()
      onCreated()
    } catch (err) {
      toast.error(apiError(err, "Couldn't start the ajo"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Set up an ajo"
      description="You choose the amount per hand and the number of rounds. Members then request how many hands they want."
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-[2]" onClick={submit} loading={saving}>
            Set up ajo
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name this ajo" placeholder="e.g. January savings" maxLength={60} value={form.title} onChange={update('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount per hand" prefix="₦" type="number" min="0" inputMode="decimal" placeholder="50000" value={form.amount} onChange={update('amount')} />
          <Field label="Total rounds" type="number" min="1" max="100" inputMode="numeric" placeholder="10" value={form.totalRounds} onChange={update('totalRounds')} />
        </div>
        <p className="-mt-1 text-sm text-muted">One round = one hand collects. Five people with two hands each is ten rounds.</p>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">How often?</legend>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={form.frequency === f}
                onClick={() => setForm((v) => ({ ...v, frequency: f }))}
                className={`h-11 rounded-xl border text-sm font-semibold capitalize transition ${
                  form.frequency === f ? 'border-forest bg-forest text-on-forest' : 'border-line bg-surface text-ink hover:border-forest/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </fieldset>

        {showPot && (
          <div className="rounded-2xl bg-forest p-4 text-on-forest">
            <p className="text-sm text-forest-muted">Each round’s pot</p>
            <p className="money text-2xl font-bold text-lime">{naira(amount * rounds)}</p>
            <p className="text-sm text-forest-muted">
              {plural(rounds, 'round')} × {naira(amount)} per hand
            </p>
          </div>
        )}
      </div>
    </Sheet>
  )
}
