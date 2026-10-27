import { motion } from 'framer-motion'
import { BarChart3, List, Plus } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { LoginButton } from './LoginButton'
import { ThemeToggle } from './ThemeToggle'

const secciones = (verMisCursos, onCursos, onMiCiclo, onSolicitar) => [
  { id: 'cursos', label: 'Cursos', Icono: List, activo: !verMisCursos, onClick: onCursos },
  { id: 'ciclo', label: 'Mi ciclo', Icono: BarChart3, activo: verMisCursos, onClick: onMiCiclo },
  { id: 'solicitar', label: 'Solicitar curso', corto: 'Solicitar', Icono: Plus, activo: false, onClick: onSolicitar },
]

// Barra superior: marca, navegación (escritorio), tema y sesión
export const TopBar = ({ auth, verMisCursos, onCursos, onMiCiclo, onSolicitar }) => (
  <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
    <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
      <button type="button" onClick={onCursos} className="flex items-center gap-2.5 text-left cursor-pointer min-w-0">
        <BrandMark />
        <span className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-sm sm:text-[15px] text-foreground truncate">Calculadora de notas</span>
          <span className="hidden sm:block text-xs text-muted-foreground truncate">Para cursos de UTEC · no oficial</span>
        </span>
      </button>

      <div className="flex items-center gap-2">
        <nav className="hidden md:flex items-center gap-1 mr-1" aria-label="Principal">
          {secciones(verMisCursos, onCursos, onMiCiclo, onSolicitar).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={s.onClick}
              aria-current={s.activo ? 'page' : undefined}
              className={`relative px-3.5 h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                s.activo ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.activo && (
                <motion.span
                  layoutId="nav-activo"
                  className="absolute inset-0 rounded-md bg-muted"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </nav>
        <ThemeToggle />
        <LoginButton {...auth} />
      </div>
    </div>
  </header>
)

// Navegación inferior en móvil
export const MobileNav = ({ verMisCursos, onCursos, onMiCiclo, onSolicitar }) => (
  <nav
    className="md:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-card/95 backdrop-blur-md border-t border-border"
    aria-label="Principal"
  >
    {secciones(verMisCursos, onCursos, onMiCiclo, onSolicitar).map((s) => {
      const Icono = s.Icono
      return (
        <button
          key={s.id}
          type="button"
          onClick={s.onClick}
          aria-current={s.activo ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-h-[52px] text-[11px] font-medium transition-colors cursor-pointer ${
            s.activo ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Icono className="w-5 h-5" strokeWidth={s.activo ? 2.4 : 2} />
          {s.corto || s.label}
        </button>
      )
    })}
  </nav>
)
