export default function EmptyState({ icon: Icon, title, children, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center rounded-card border border-dashed border-line px-6 py-12 text-center ${className}`}>
      {Icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-sunk text-forest">
          <Icon className="size-7" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <h3 className="text-base font-bold">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
