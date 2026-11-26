import api from './api'
import { clearUser } from '../lib/session'

export async function signOut() {
  try {
    await api.post('/auth/logout')
  } catch {
    // Even if the request fails (offline, network), still clear local state.
  }
  clearUser()
  window.location.href = '/login'
}
