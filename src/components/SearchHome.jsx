import { BrandMark } from './BrandMark'
import { CourseGrid } from './CourseGrid'

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

export const SearchHome = ({
  busqueda, setBusqueda,
  verMisCursos, setVerMisCursos,
  soloCandado, setSoloCandado,
  filtrados, paginados, paginaActual, setPaginaActual, totalPaginas,
  totalCursos, cargandoCursos,
  misCursosIds, toggleFavorito,
  notasGlobales,
  onCalcular,
  isAdmin, onAddCurso, onEditarCurso,
  isOwner, onGestionarAdmins, onVerHistorial,
}) => {
  const hayBusqueda = busqueda.trim().length > 0
  const hayFavoritos = misCursosIds.length > 0

  const pill = (activo) =>
    `px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] border transition-all cursor-pointer active:scale-95 ${
      activo
        ? 'bg-cyan-300/15 text-cyan-200 border-cyan-300/40'
        : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-slate-100'
    }`

  return (
    <div className="relative px-5 md:px-10 pt-24 md:pt-20 pb-16">

      <div className="w-full max-w-2xl mx-auto text-center mb-10">
        <div className="flex justify-center mb-6">
          <BrandMark size="lg" float />
        </div>

        <h1 className="font-bold tracking-tight text-3xl md:text-4xl mb-2 text-cyan-300">
          Calculadora de Notas
        </h1>
        <p className="text-cyan-300/70 mb-8 text-[11px] uppercase tracking-[4px] font-bold">
          UTEC · Calcula tu promedio al instante
        </p>

        <div className="relative max-w-xl mx-auto">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-300 text-lg pointer-events-none">⌕</span>
          <input
            type="text"
            placeholder="Busca tu curso o código (ej. Base de Datos, CS2041)…"
            value={busqueda}
            aria-label="Buscar curso por nombre o código"
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#0c0824] border border-white/10 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 transition-colors font-medium text-base"
          />
          {hayBusqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all cursor-pointer" aria-label="Limpiar búsqueda">✕</button>
          )}
        </div>

        {/* Contador + favoritos + acciones admin */}
        <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] font-bold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
            {cargandoCursos
              ? 'Cargando…'
              : hayBusqueda || verMisCursos || soloCandado
                ? `${filtrados.length} ${filtrados.length === 1 ? 'resultado' : 'resultados'}`
                : `${totalCursos} cursos disponibles`}
          </span>

          {(hayFavoritos || verMisCursos) && (
            <button
              onClick={() => setVerMisCursos(!verMisCursos)}
              aria-pressed={verMisCursos}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] border transition-all cursor-pointer active:scale-95 ${
                verMisCursos
                  ? 'bg-amber-300/15 text-amber-200 border-amber-300/40'
                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-amber-200 hover:border-amber-300/30'
              }`}
            >
              <span>★</span>
              {verMisCursos ? 'Viendo favoritos' : 'Mis favoritos'}
            </button>
          )}

          {isAdmin && (
            <button onClick={onAddCurso} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] border border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-200 hover:bg-cyan-300/20 transition-colors cursor-pointer active:scale-95">
              <span className="text-sm leading-none">+</span>
              Agregar curso
            </button>
          )}
          {isAdmin && (
            <button onClick={onVerHistorial} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] border border-white/10 bg-white/[0.04] text-slate-300 hover:text-cyan-200 hover:border-cyan-300/30 transition-all cursor-pointer active:scale-95">
              🕓 Historial
            </button>
          )}
          {isOwner && (
            <button onClick={onGestionarAdmins} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] border border-amber-300/40 bg-amber-300/[0.12] text-amber-200 hover:bg-amber-300/20 transition-colors cursor-pointer active:scale-95">
              ★ Admins
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-3">
          <button onClick={() => setSoloCandado(!soloCandado)} aria-pressed={soloCandado} className={pill(soloCandado)}>🔒 Solo candado</button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto animate-fade-in">
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
              misCursosIds={misCursosIds}
              notasGlobales={notasGlobales}
              onCalcular={onCalcular}
              onToggleFav={toggleFavorito}
              verMisCursos={verMisCursos}
              isAdmin={isAdmin}
              onEditar={onEditarCurso}
            />
            <Pager paginaActual={paginaActual} totalPaginas={totalPaginas} setPaginaActual={setPaginaActual} />
          </>
        )}
      </div>
    </div>
  )
}
