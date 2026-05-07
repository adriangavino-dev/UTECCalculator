import logoCalc from '../assets/logo-calc.svg'

export const BrandMark = ({ size = 'md', float = false }) => {
  const dims = { sm: 36, md: 40, lg: 56, hero: 80 }[size] || 40
  const radii = { sm: 10, md: 12, lg: 14, hero: 18 }[size] || 12

  return (
    <div
      className={float ? 'animate-float' : ''}
      style={{
        width: dims,
        height: dims,
        borderRadius: radii,
        background:
          'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(20,184,166,0.15), rgba(14,165,233,0.15))',
        border: '1px solid rgba(103,232,249,0.30)',
        boxShadow: '0 0 45px -5px rgba(56,189,248,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: dims * 0.12,
      }}
    >
      <img
        src={logoCalc}
        alt="UTEC Calc"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
