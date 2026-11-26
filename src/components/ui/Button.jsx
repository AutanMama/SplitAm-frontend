import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-forest text-on-forest hover:bg-forest-hover',
  lime: 'bg-lime text-on-lime hover:brightness-95',
  secondary: 'bg-surface text-ink border border-line hover:border-ink/40',
  ghost: 'text-ink hover:bg-sunk',
  danger: 'bg-danger text-white hover:brightness-110',
  'danger-soft': 'bg-danger-soft text-danger hover:brightness-95',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-xl',
  lg: 'h-13 px-5 text-base gap-2 rounded-xl',
}

export default function Button({ as: Component = 'button', variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) {
  const isButton = Component === 'button'
  return (
    <Component
      className={`inline-flex items-center font-semibold whitespace-nowrap transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
        className.includes('justify-') ? '' : 'justify-center'
      } ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={isButton ? disabled || loading : undefined}
      type={isButton ? props.type ?? 'button' : undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </Component>
  )
}
