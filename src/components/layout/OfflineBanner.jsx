import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-24 z-50 flex items-center gap-3 rounded-2xl bg-due px-4 py-3 text-sm font-medium text-white shadow-float md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm">
      <WifiOff className="size-5 shrink-0" aria-hidden />
      You’re offline. We’ll save changes once you’re back.
    </div>
  )
}
