import { useId } from 'react'

const INPUT =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-ink placeholder:text-muted/70 transition focus:border-indigo focus:outline-none focus:ring-4 focus:ring-indigo/10'

export function Input({ className = '', ...props }) {
  return <input className={`h-12 ${INPUT} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`resize-none py-3 ${INPUT} ${className}`} {...props} />
}

// Label + control + hint. Pass `prefix` for a currency sign inside the input.
export default function Field({ label, hint, optional, prefix, multiline = false, className = '', ...props }) {
  const id = useId()
  const Control = multiline ? Textarea : Input
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-muted">{prefix}</span>}
        <Control id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={prefix ? 'pl-8' : ''} {...props} />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
