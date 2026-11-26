// The server owns auth through an httpOnly cookie. We only keep the user profile
// locally so the UI knows who is signed in; any 401 clears it (see services/api).
const KEY = 'user'

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(KEY)
}
