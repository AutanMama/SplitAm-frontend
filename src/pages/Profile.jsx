import { useEffect, useState } from 'react'
import { BadgeCheck, Banknote, LogOut, Mail, Phone } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Input } from '../components/ui/Field'
import api from '../services/api'
import { signOut } from '../services/auth'
import { toast } from '../services/toast'
import { getUser, setUser as storeUser } from '../lib/session'
import { apiError, formatPhone } from '../lib/format'

function Row({ icon: Icon, label, children, action }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunk text-forest">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <div className="font-semibold break-words">{children}</div>
      </div>
      {action}
    </div>
  )
}

export default function Profile() {
  const [user, setUser] = useState(getUser)
  const [phoneInput, setPhoneInput] = useState(user?.phone || '')
  const [editingPhone, setEditingPhone] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Refresh from the server so the phone is current even if local data is stale.
  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!data?.user) return
        setUser(data.user)
        storeUser(data.user)
        setPhoneInput(data.user.phone || '')
      })
      .catch(() => {})
  }, [])

  async function savePhone() {
    setSavingPhone(true)
    try {
      const { data } = await api.post('/auth/phone', { phone: phoneInput.trim() || '' })
      setUser(data.user)
      storeUser(data.user)
      setEditingPhone(false)
      toast.success(phoneInput.trim() ? 'Phone saved' : 'Phone removed')
    } catch (err) {
      toast.error(apiError(err, "Couldn't save phone"))
    } finally {
      setSavingPhone(false)
    }
  }

  if (!user) return <p className="py-12 text-center text-muted">You’re not signed in.</p>

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="flex flex-col items-center text-center">
        <Avatar name={user.name} size="xl" tone="me" />
        <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
        <p className="mt-1 text-muted">{user.email}</p>
      </Card>

      <Card className="divide-y divide-line py-1 md:py-2">
        <Row icon={Mail} label="Email">
          {user.email}
        </Row>
        <Row
          icon={Phone}
          label="Phone · used for ajo reminders"
          action={
            !editingPhone && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingPhone(true)
                  setPhoneInput(user.phone || '')
                }}
              >
                {user.phone ? 'Change' : 'Add'}
              </Button>
            )
          }
        >
          {editingPhone ? (
            <div className="mt-2 space-y-2">
              <Input type="tel" inputMode="tel" placeholder="0801 234 5678" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} aria-label="Phone number" autoFocus />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={savingPhone}
                  onClick={() => {
                    setEditingPhone(false)
                    setPhoneInput(user.phone || '')
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={savePhone} loading={savingPhone}>
                  Save phone
                </Button>
              </div>
            </div>
          ) : user.phone ? (
            formatPhone(user.phone)
          ) : (
            <span className="font-normal text-muted">Not set. Add one to get WhatsApp reminders.</span>
          )}
        </Row>
        <Row icon={BadgeCheck} label="Plan">
          Free
        </Row>
        <Row icon={Banknote} label="Currency">
          Naira (₦)
        </Row>
      </Card>

      <Button
        variant="danger-soft"
        size="lg"
        className="w-full"
        loading={signingOut}
        onClick={() => {
          setSigningOut(true)
          signOut()
        }}
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </Button>
    </div>
  )
}
