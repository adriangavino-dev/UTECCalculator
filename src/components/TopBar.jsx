import { BrandMark } from './BrandMark'
import { LoginButton } from './LoginButton'

const IconoLista = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <path d="M4 5h16M4 12h16M4 19h10" />
  </svg>
)
const IconoCiclo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)
const IconoMas = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const secciones = (verMisCursos, onCursos, onMiCiclo, onSolicitar) => [
  { id: 'cursos', label: 'Cursos', icono: IconoLista, activo: !verMisCursos, onClick: onCursos },
  { id: 'ciclo', label: 'Mi ciclo', icono: IconoCiclo, activo: verMisCursos, onClick: onMiCiclo },
  { id: 'solicitar', label: 'Solicitar curso', corto: 'Solicitar', icono: IconoMas, activo: false, onClick: onSolicitar },
]

// Barra superior: marca, navegación (escritorio) y sesión
export const TopBar = ({ auth, verMisCursos, onCursos, onMiCiclo, onSolicitar }) => (
  <header className="border-b border-white/[0.07]">
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <button type="button" onClick={onCursos} className="flex items-center gap-3 text-left cursor-pointer min-w-0" aria-label="Ir al inicio">
        <BrandMark size="md" />
        <span className="flex flex-col min-w-0">
          <span className="font-bold text-base text-slate-100 truncate">Calculadora UTEC</span>
          <span className="hidden sm:block text-[11px] text-slate-400 font-semibold truncate">Calcula tu promedio al instante</span>
        </span>
      </button>

      <div className="flex items-center gap-1.5">
        <nav className="hidden md:flex items-center gap-1.5 mr-2" aria-label="Principal">
          {secciones(verMisCursos, onCursos, onMiCiclo, onSolicitar).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={s.onClick}
              aria-current={s.activo ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-xl font-bold text-[13px] transition-colors cursor-pointer ${
                s.activo ? 'bg-cyan-300/[0.12] text-cyan-200' : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <LoginButton {...auth} />
      </div>
    </div>
  </header>
)

// Navegación inferior en móvil
export const MobileNav = ({ verMisCursos, onCursos, onMiCiclo, onSolicitar }) => (
  <nav
    className="md:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#0c0824] border-t border-white/[0.08]"
    aria-label="Principal"
  >
    {secciones(verMisCursos, onCursos, onMiCiclo, onSolicitar).map((s) => {
      const Icono = s.icono
      return (
        <button
          key={s.id}
          type="button"
          onClick={s.onClick}
          aria-current={s.activo ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-h-[52px] rounded-2xl text-[11px] font-bold transition-colors cursor-pointer ${
            s.activo ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-300'
          }`}
        >
          <Icono />
          {s.corto || s.label}
        </button>
      )
    })}
  </nav>
)
