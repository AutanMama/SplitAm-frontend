export const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`

export const firstName = (name = '') => name.trim().split(' ')[0] || name

export const initials = (name = '?') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('') || '?'

// 2348012345678 → 0801 234 5678
export function formatPhone(phone) {
  if (!phone) return ''
  if (phone.startsWith('234') && phone.length === 13) {
    const local = `0${phone.slice(3)}`
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
  }
  return phone
}

export function relativeTime(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const apiError = (err, fallback) => err?.response?.data?.error || fallback
