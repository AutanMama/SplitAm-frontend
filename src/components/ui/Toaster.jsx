import { useEffect, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { subscribeToToasts } from '../../services/toast'

/**
 * Renders every toast in one place: top of the screen on phones, under the
 * header on desktop, always above sheets.
 */
export default function Toaster() {
  const [items, setItems] = useState([])

  useEffect(
    () =>
      subscribeToToasts((item) => {
        setItems((prev) => [...prev, item])
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== item.id)), item.duration)
      }),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[300] flex flex-col items-center gap-2 px-4 md:top-20" aria-live="polite">
      {items.map((item) => {
        const isError = item.type === 'error'
        const Icon = isError ? CircleAlert : CircleCheck
        return (
          <div key={item.id} role="status" className="animate-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-float">
            <Icon className={`size-5 shrink-0 ${isError ? 'text-danger-soft' : 'text-lime'}`} aria-hidden />
            <p className="leading-snug">{item.message}</p>
          </div>
        )
      })}
    </div>
  )
}
