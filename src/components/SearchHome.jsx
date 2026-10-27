import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Circle, CircleAlert, CircleCheck, ChevronLeft, ChevronRight, History, Lock, Plus, Search, ShieldCheck, Star, X } from 'lucide-react'
import { CourseGrid } from './CourseGrid'
import { NumeroAnimado } from './NumeroAnimado'
import { cn } from '@/lib/utils'

const Pager = ({ paginaActual, totalPaginas, setPaginaActual }) => {
  if (totalPaginas <= 1) return null

  // ventana de páginas alrededor de la actual
  const paginas = []
  const win = 1
  const push = (p) => paginas.push(p)
  push(1)
  for (let p = paginaActual - win; p <= paginaActual + win; p++) {
    if (p > 1 && p < totalPaginas) push(p)
  }
  if (totalPaginas > 1) push(totalPaginas)
  const unicas = [...new Set(paginas)].sort((a, b) => a - b)
  const conGaps = []
  unicas.forEach((p, i) => {
    if (i > 0 && p - unicas[i - 1] > 1) conGaps.push('...')
    conGaps.push(p)
  })

  const btn = 'min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border flex items-center justify-center'
  const ir = (p) => setPaginaActual(Math.min(Math.max(1, p), totalPaginas))

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <button onClick={() => ir(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior"
        className={`${btn} bg-card border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed`}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      {conGaps.map((p, i) =>
        p === '...' ? (
          <span key={`g${i}`} className="px-1 text-muted-foreground text-sm">…</span>
        ) : (
          <button key={p} onClick={() => ir(p)} aria-label={`Página ${p}`} aria-current={p === paginaActual ? 'page' : undefined}
            className={`${btn} num ${p === paginaActual
              ? 'bg-foreground text-background border-transparent'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => ir(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente"
        className={`${btn} bg-card border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Esqueleto de carga con la misma forma que las tarjetas reales
const Hueso = ({ className }) => <div className={cn('rounded bg-muted', className)} />

const SkeletonCursos = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 animate-pulse" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i}>
        {/* Móvil */}
        <div className="sm:hidden flex items-center gap-3.5 p-3.5 rounded-xl bg-card border border-border">
          <div className="flex-1 flex flex-col gap-2.5">
            <Hueso className="h-3.5 w-3/4" />
            <Hueso className="h-1.5 w-full rounded-full" />
            <Hueso className="h-3 w-1/2" />
          </div>
          <Hueso className="h-7 w-10" />
        </div>
        {/* Escritorio */}
        <div className="hidden sm:flex flex-col gap-4 p-5 rounded-xl bg-card border border-border h-[210px]">
          <div className="flex justify-between"><Hueso className="h-5 w-16" /><Hueso className="h-5 w-5" /></div>
          <div className="flex justify-between gap-6"><Hueso className="h-5 flex-1" /><Hueso className="h-8 w-14" /></div>
          <div className="mt-auto flex flex-col gap-2"><Hueso className="h-1.5 w-full rounded-full" /><Hueso className="h-3 w-24" /></div>
          <div className="flex justify-between items-center pt-3.5 border-t border-border"><Hueso className="h-3.5 w-40" /><Hueso className="h-9 w-20 rounded-lg" /></div>
        </div>
      </div>
    ))}
  </div>
)

const SkeletonCiclo = () => (
  <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
    <div className="flex justify-between"><Hueso className="h-4 w-16 bg-hero-foreground/15" /><Hueso className="h-3 w-28 bg-hero-foreground/15" /></div>
    <div className="flex items-end gap-3"><Hueso className="h-12 w-28 bg-hero-foreground/15" /><Hueso className="h-8 w-32 bg-hero-foreground/15" /></div>
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => <Hueso key={i} className="h-14 rounded-lg bg-hero-foreground/15" />)}
    </div>
  </div>
)

// Anillo decorativo de fondo (eco del anillo de nota del detalle)
const AnilloDecorativo = () => (
  <svg className="absolute -right-16 -bottom-20 w-64 h-64 text-hero-foreground/[0.07] pointer-events-none" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="22" />
    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="22" strokeDasharray="330 600" strokeLinecap="round" transform="rotate(-90 100 100)" />
  </svg>
)

// Resumen del ciclo: promedio de los cursos marcados y cómo van (bloque de color)
const CicloCard = ({ ciclo, onMiCiclo }) => {
  if (ciclo.total === 0) {
    return (
      <div className="relative flex flex-col gap-2 justify-center h-full">
        <span className="text-sm font-medium text-hero-muted">Mi ciclo</span>
        <p className="text-[15px] text-hero-foreground leading-relaxed max-w-[300px]">
          Marca tus cursos con <Star className="inline w-4 h-4 -mt-0.5" fill="currentColor" /> y aquí verás el
          promedio de tu ciclo y qué cursos están en riesgo.
        </p>
      </div>
    )
  }

  const stats = [
    { n: ciclo.aprobando, label: 'aprobando', Icono: CircleCheck },
    { n: ciclo.riesgo, label: 'en riesgo', Icono: CircleAlert },
    { n: ciclo.sinNotas, label: 'sin notas', Icono: Circle },
  ]
  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3">
        <span className="text-sm font-medium text-hero-muted">Mi ciclo</span>
        <span className="text-xs text-hero-muted">
          {ciclo.conNotas} de {ciclo.total} {ciclo.total === 1 ? 'curso' : 'cursos'} con notas
        </span>
      </div>
      <div className="flex items-end gap-3">
        <NumeroAnimado valor={ciclo.promedio} className="num text-5xl md:text-6xl leading-[0.9] font-semibold" />
        <span className="text-sm text-hero-muted pb-1">promedio de lo que<br />llevas en tus cursos</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((st) => {
          const Icono = st.Icono
          return (
            <div key={st.label} className="rounded-lg px-3 py-2.5 bg-hero-foreground/10">
              <div className="num text-xl font-semibold">{st.n}</div>
              <div className="flex items-center gap-1 text-xs text-hero-muted">
                <Icono className="w-3 h-3 shrink-0" /> {st.label}
              </div>
            </div>
          )
        })}
      </div>
      <button type="button" onClick={onMiCiclo} className="group self-start inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 decoration-hero-foreground/40 hover:decoration-hero-foreground cursor-pointer">
        Ver mis cursos
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}

export const SearchHome = ({
  busqueda, setBusqueda,
  verMisCursos, setVerMisCursos,
  soloCandado, setSoloCandado,
  filtrados, paginados, paginaActual, setPaginaActual, totalPaginas,
  totalCursos, cargandoCursos,
  misCursosIds, toggleFavorito,
  estados, ciclo,
  onCalcular,
  onMiCiclo, onSolicitar,
  isAdmin, onAddCurso, onEditarCurso,
  isOwner, onGestionarAdmins, onVerHistorial,
}) => {
  const buscadorRef = useRef(null)
  const hayBusqueda = busqueda.trim().length > 0
  const hayFiltro = hayBusqueda || verMisCursos || soloCandado

  // Atajo: "/" enfoca el buscador
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
      e.preventDefault()
      buscadorRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const chip = (activo) =>
    `inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-medium border transition-colors cursor-pointer active:scale-[0.97] ${
      activo
        ? 'bg-foreground text-background border-foreground'
        : 'bg-card text-foreground border-border hover:border-input'
    }`

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-5 md:pt-12 pb-12 md:pb-16">

      {/* Hero: búsqueda + resumen del ciclo */}
      <section className="flex flex-wrap gap-4 md:gap-8 items-stretch">
        <motion.div
          className="flex-[999_1_520px] min-w-0 flex flex-col justify-center gap-4 md:gap-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="sr-only md:not-sr-only m-0 text-4xl leading-tight font-semibold tracking-tight text-foreground">
            ¿Cómo vas este ciclo?
          </h1>
          <p className="hidden md:block m-0 text-base text-muted-foreground max-w-[520px]">
            Busca tu curso, pon tus notas y te decimos tu promedio, cuánto te falta y qué necesitas en el final.
          </p>

          <div className="relative max-w-[620px]">
            <label htmlFor="buscar-curso" className="sr-only">Buscar curso por nombre o código</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground pointer-events-none" />
            <input
              id="buscar-curso"
              ref={buscadorRef}
              type="text"
              placeholder="Busca tu curso o código"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-12 pl-11 pr-12 rounded-xl bg-card border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition text-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            />
            {hayBusqueda ? (
              <button onClick={() => setBusqueda('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer" aria-label="Limpiar búsqueda">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 num text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">/</kbd>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
            <button type="button" onClick={() => setVerMisCursos(!verMisCursos)} aria-pressed={verMisCursos} className={chip(verMisCursos)}>
              <Star className={`w-4 h-4 ${verMisCursos ? '' : 'text-star'}`} fill="currentColor" /> Mis cursos
            </button>
            <button type="button" onClick={() => setSoloCandado(!soloCandado)} aria-pressed={soloCandado} className={chip(soloCandado)}>
              <Lock className="w-4 h-4" /> Con candado
            </button>
            {isAdmin && (
              <button type="button" onClick={onAddCurso} className={`${chip(false)} text-primary`}>
                <Plus className="w-4 h-4" /> Agregar curso
              </button>
            )}
            {isAdmin && (
              <button type="button" onClick={onVerHistorial} className={chip(false)}>
                <History className="w-4 h-4" /> Historial
              </button>
            )}
            {isOwner && (
              <button type="button" onClick={onGestionarAdmins} className={chip(false)}>
                <ShieldCheck className="w-4 h-4" /> Admins
              </button>
            )}
          </div>
        </motion.div>

        <motion.aside
          className="relative overflow-hidden order-first md:order-none flex-[1_1_340px] min-w-0 bg-hero text-hero-foreground rounded-xl p-5 md:p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
          aria-label="Resumen del ciclo"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: 'easeOut' }}
        >
          <AnilloDecorativo />
          {cargandoCursos ? (
            <SkeletonCiclo />
          ) : (
            <CicloCard ciclo={ciclo} onMiCiclo={onMiCiclo} />
          )}
        </motion.aside>
      </section>

      {/* Lista de cursos */}
      <section id="lista-cursos" className="mt-8 md:mt-14 scroll-mt-20" aria-label="Cursos">
        <div className="flex justify-between items-baseline gap-3 flex-wrap mb-4">
          <h2 className="m-0 text-lg md:text-xl font-semibold text-foreground">
            {verMisCursos ? 'Mis cursos' : 'Cursos'}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {cargandoCursos
                ? 'Cargando…'
                : hayFiltro
                  ? `${filtrados.length} ${filtrados.length === 1 ? 'resultado' : 'resultados'}`
                  : `${totalCursos} disponibles`}
            </span>
          </h2>
          {ciclo.algunoConNotas && (
            <span className="text-sm text-muted-foreground">
              Ordenado por <span className="text-foreground font-medium">urgencia</span>
            </span>
          )}
        </div>

        {cargandoCursos ? (
          <div role="status">
            <span className="sr-only">Cargando cursos…</span>
            <SkeletonCursos />
          </div>
        ) : (
          <>
            <CourseGrid
              cursos={paginados}
              estados={estados}
              misCursosIds={misCursosIds}
              onCalcular={onCalcular}
              onToggleFav={toggleFavorito}
              verMisCursos={verMisCursos}
              isAdmin={isAdmin}
              onEditar={onEditarCurso}
            />
            <Pager paginaActual={paginaActual} totalPaginas={totalPaginas} setPaginaActual={setPaginaActual} />
          </>
        )}
      </section>

      {/* Franja para solicitar curso */}
      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 px-5 md:px-6 py-5 rounded-xl border border-dashed border-input bg-card/60">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold text-foreground">¿No encuentras tu curso o tiene un peso mal?</span>
          <span className="text-sm text-muted-foreground">Mándanos el sílabo por WhatsApp y lo agregamos.</span>
        </div>
        <button type="button" onClick={onSolicitar} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Solicitar curso
        </button>
      </section>
    </main>
  )
}
