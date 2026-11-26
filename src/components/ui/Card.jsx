export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-card border border-line bg-surface p-5 shadow-card md:p-6 ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
