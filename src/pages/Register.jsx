import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import api from '../services/api'
import { toast } from '../services/toast'
import { setUser } from '../lib/session'
import { apiError, firstName } from '../lib/format'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setUser(data.user)
      toast.success(`Account created. Welcome, ${firstName(data.user.name)}!`)
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      toast.error(apiError(err, "Couldn't create your account. Try again."))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save together. No drama. No chasing."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-forest underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <Field label="Full name" autoComplete="name" placeholder="e.g. Chinedu Okafor" maxLength={60} value={form.name} onChange={update('name')} required />
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
        <Field
          label="Phone"
          optional
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0801 234 5678"
          value={form.phone}
          onChange={update('phone')}
          hint="For WhatsApp reminders when your ajo payment is due."
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          maxLength={128}
          value={form.password}
          onChange={update('password')}
          required
        />
        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          {loading ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
