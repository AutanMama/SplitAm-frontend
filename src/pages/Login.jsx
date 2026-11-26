import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import api from '../services/api'
import { toast } from '../services/toast'
import { setUser } from '../lib/session'
import { apiError, firstName } from '../lib/format'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data.user)
      toast.success(`Welcome back, ${firstName(data.user.name)}`)
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      toast.error(apiError(err, 'Invalid email or password'))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Run ajo with your guys, your office, your family."
      footer={
        <>
          New to SplitAm?{' '}
          <Link to="/register" className="font-semibold text-indigo underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
