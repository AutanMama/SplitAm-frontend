// Gloock has no naira sign, so inside serif text the ₦ is set in the body face.
export default function SerifText({ children }) {
  if (typeof children !== 'string' || !children.includes('₦')) return children
  return children.split(/(₦)/).map((part, i) =>
    part === '₦' ? (
      <span key={i} className="font-sans font-semibold">
        ₦
      </span>
    ) : (
      part
    ),
  )
}
