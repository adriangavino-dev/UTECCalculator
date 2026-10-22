import { useEffect, useRef } from 'react'
import { CourseGrid } from './CourseGrid'
import { formatNota } from '../logic/useCalculadora'

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

  const btn = 'min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border'
  const ir = (p) => setPaginaActual(Math.min(Math.max(1, p), totalPaginas))

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <button onClick={() => ir(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior"
        className={`${btn} bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:border-cyan-300/30 disabled:opacity-30 disabled:cursor-not-allowed`}>‹</button>
      {conGaps.map((p, i) =>
        p === '...' ? (
          <span key={`g${i}`} className="px-1 text-slate-600 text-xs">…</span>
        ) : (
          <button key={p} onClick={() => ir(p)} aria-label={`Página ${p}`} aria-current={p === paginaActual ? 'page' : undefined}
            className={`${btn} ${p === paginaActual
              ? 'bg-cyan-300 text-[#0a0420] border-transparent'
              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:border-cyan-300/30'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => ir(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente"
        className={`${btn} bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:border-cyan-300/30 disabled:opacity-30 disabled:cursor-not-allowed`}>›</button>
    </div>
  )
}

// Resumen del ciclo: promedio de los cursos con notas y cómo van
const CicloCard = ({ ciclo, onMiCiclo }) => {
  if (ciclo.total === 0) {
    return (
      <div className="flex flex-col gap-3 justify-center h-full">
        <span className="text-xs font-bold text-slate-400 tracking-[1.5px] uppercase">Mi ciclo</span>
        <p className="text-slate-300 text-sm font-semibold leading-relaxed">
          Marca tus cursos con ★ y aquí verás el promedio de tu ciclo y qué cursos están en riesgo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-[18px]">
      <div className="flex justify-between items-center gap-3">
        <span className="text-xs font-bold text-slate-400 tracking-[1.5px] uppercase">Mi ciclo</span>
        <span className="text-xs font-bold text-cyan-300">
          {ciclo.conNotas} de {ciclo.total} {ciclo.total === 1 ? 'curso' : 'cursos'} con notas
        </span>
      </div>
      <div className="flex items-end gap-3.5">
        <span className="text-[44px] md:text-[64px] leading-[0.9] font-bold text-cyan-300 tabular-nums">
          {ciclo.promedio !== null ? formatNota(ciclo.promedio) : '—'}
        </span>
        <span className="text-[13px] text-slate-400 font-semibold pb-1">promedio de lo que<br />llevas en tus cursos</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl p-3 bg-teal-300/[0.08] border border-teal-300/25">
          <div className="text-[22px] font-bold text-teal-300 tabular-nums">{ciclo.aprobando}</div>
          <div className="text-[11px] font-bold text-teal-100">aprobando</div>
        </div>
        <div className="rounded-2xl p-3 bg-rose-300/[0.08] border border-rose-300/30">
          <div className="text-[22px] font-bold text-rose-300 tabular-nums">{ciclo.riesgo}</div>
          <div className="text-[11px] font-bold text-rose-100">en riesgo</div>
        </div>
        <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10">
          <div className="text-[22px] font-bold text-slate-300 tabular-nums">{ciclo.sinNotas}</div>
          <div className="text-[11px] font-bold text-slate-400">sin notas</div>
        </div>
      </div>
      <button type="button" onClick={onMiCiclo} className="self-start text-[13px] font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer">
        Ver mis cursos →
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

  const chip = (activo, color = 'cyan') =>
    `inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full text-xs font-bold border transition-colors cursor-pointer active:scale-95 ${
      activo
        ? color === 'amber'
          ? 'bg-amber-300/15 text-amber-200 border-amber-300/45'
          : 'bg-cyan-300/[0.12] text-cyan-200 border-cyan-300/45'
        : color === 'amber'
          ? 'text-amber-200 border-amber-300/35 hover:bg-amber-300/[0.08]'
          : 'text-slate-300 border-white/[0.12] hover:text-white hover:border-white/25'
    }`

  const accionAdmin = 'inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full text-xs font-bold border transition-colors cursor-pointer active:scale-95'

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5 md:pt-10 pb-32 md:pb-16">

      {/* Hero: búsqueda + resumen del ciclo */}
      <section className="flex flex-wrap gap-4 md:gap-6 items-stretch">
        <div className="flex-[999_1_520px] min-w-0 flex flex-col justify-center gap-4 md:gap-[18px]">
          <h1 className="hidden md:block m-0 text-[40px] leading-[1.1] font-bold text-slate-100">¿Cómo vas este ciclo?</h1>
          <p className="hidden md:block m-0 text-base text-slate-400 font-medium max-w-[520px]">
            Busca tu curso, pon tus notas y te decimos tu promedio, cuánto te falta y qué necesitas en el final.
          </p>

          <div className="relative max-w-[620px]">
            <label htmlFor="buscar-curso" className="sr-only">Buscar curso por nombre o código</label>
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-[18px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-cyan-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="buscar-curso"
              ref={buscadorRef}
              type="text"
              placeholder="Busca tu curso o código"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-[50px] md:h-14 pl-12 pr-14 rounded-2xl bg-[#0c0824] border border-cyan-300/35 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/70 transition-colors font-semibold text-[15px]"
            />
            {hayBusqueda ? (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Limpiar búsqueda">✕</button>
            ) : (
              <kbd className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-bold border border-white/[0.12] rounded-md px-1.5 py-0.5 font-[inherit]">/</kbd>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
            <button type="button" onClick={() => setVerMisCursos(!verMisCursos)} aria-pressed={verMisCursos} className={chip(verMisCursos, 'amber')}>
              ★ Mis cursos
            </button>
            <button type="button" onClick={() => setSoloCandado(!soloCandado)} aria-pressed={soloCandado} className={chip(soloCandado)}>
              🔒 Con candado
            </button>
            {isAdmin && (
              <button type="button" onClick={onAddCurso} className={`${accionAdmin} border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-200 hover:bg-cyan-300/20`}>
                + Agregar curso
              </button>
            )}
            {isAdmin && (
              <button type="button" onClick={onVerHistorial} className={`${accionAdmin} border-white/[0.12] text-slate-300 hover:text-cyan-200 hover:border-cyan-300/30`}>
                🕓 Historial
              </button>
            )}
            {isOwner && (
              <button type="button" onClick={onGestionarAdmins} className={`${accionAdmin} border-amber-300/40 bg-amber-300/[0.12] text-amber-200 hover:bg-amber-300/20`}>
                ★ Admins
              </button>
            )}
          </div>
        </div>

        <aside className="order-first md:order-none flex-[1_1_340px] min-w-0 bg-[#0c0824] border border-white/[0.08] rounded-[22px] md:rounded-3xl p-[18px] md:p-6" aria-label="Resumen del ciclo">
          {cargandoCursos ? (
            <div className="h-full min-h-[120px] rounded-2xl bg-white/[0.03] animate-pulse" aria-label="Cargando resumen" />
          ) : (
            <CicloCard ciclo={ciclo} onMiCiclo={onMiCiclo} />
          )}
        </aside>
      </section>

      {/* Lista de cursos */}
      <section id="lista-cursos" className="mt-8 md:mt-12 scroll-mt-6" aria-label="Cursos">
        <div className="flex justify-between items-center gap-3 flex-wrap mb-3.5 md:mb-[18px]">
          <h2 className="m-0 text-lg md:text-xl font-bold text-slate-100">
            {verMisCursos ? 'Mis cursos' : 'Cursos'}
            <span className="ml-2 text-[13px] font-semibold text-slate-400">
              {cargandoCursos
                ? 'Cargando…'
                : hayFiltro
                  ? `${filtrados.length} ${filtrados.length === 1 ? 'resultado' : 'resultados'}`
                  : `${totalCursos} disponibles`}
            </span>
          </h2>
          {ciclo.algunoConNotas && (
            <span className="text-[13px] text-slate-400 font-semibold">
              Ordenado por: <span className="text-slate-100">los que más te urgen</span>
            </span>
          )}
        </div>

        {cargandoCursos ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-300/10 border border-white/10 flex items-center justify-center animate-pulse">
              <span className="text-cyan-300 text-xl">⌛</span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-[3px] font-bold mt-4">Cargando cursos…</p>
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
      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 px-5 md:px-6 py-5 rounded-[20px] border border-dashed border-cyan-300/35 bg-cyan-300/[0.04]">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-bold text-base text-slate-100">¿No encuentras tu curso o tiene un peso mal?</span>
          <span className="text-[13px] text-slate-400 font-semibold">Mándanos el sílabo por WhatsApp y lo agregamos.</span>
        </div>
        <button type="button" onClick={onSolicitar} className="min-h-[44px] px-[18px] rounded-xl border border-cyan-300/45 text-cyan-200 hover:bg-cyan-300/10 font-bold text-[13px] transition-colors cursor-pointer active:scale-95">
          + Solicitar curso
        </button>
      </section>
    </main>
  )
}
