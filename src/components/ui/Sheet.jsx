import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Bottom sheet on phones, centred dialog from `md` up. Traps focus and closes on Esc.
export default function Sheet({ open, onClose, title, description, children, footer }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const first = panelRef.current?.querySelector('input, textarea, select') ?? panelRef.current?.querySelector(FOCUSABLE)
    first?.focus()

    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => !n.disabled)
      if (!nodes.length) return
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-end justify-center md:items-center md:p-6">
      <div className="animate-fade absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet relative flex max-h-[90dvh] w-full flex-col rounded-t-3xl bg-surface shadow-float md:max-w-md md:rounded-3xl"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-2 md:px-6 md:pt-6">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-sunk hover:text-ink">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-3 md:px-6">{children}</div>
        {footer && <footer className="flex gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
