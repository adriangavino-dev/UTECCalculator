// Marca: una calculadora simple en tinta, sin brillos
export const BrandMark = ({ size = 36 }) => (
  <span
    className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" strokeWidth="2.6" />
    </svg>
  </span>
)
