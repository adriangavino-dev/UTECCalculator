import { formatNota } from '../logic/useCalculadora'

// Colores y acción según el estado del curso
const TONOS = {
  riesgo: {
    texto: 'text-rose-300', barra: 'bg-rose-300', borde: 'border-rose-300/45 hover:border-rose-300/70',
    boton: 'bg-rose-300 hover:bg-rose-200 text-[#1a0610] border-transparent', accion: 'Ver plan',
  },
  jalado: {
    texto: 'text-rose-300', barra: 'bg-rose-300', borde: 'border-rose-300/30 hover:border-rose-300/60',
    boton: 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border-white/10', accion: 'Abrir',
  },
  ok: {
    texto: 'text-teal-300', barra: 'bg-teal-300', borde: 'border-white/[0.08] hover:border-cyan-300/40',
    boton: 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border-white/10', accion: 'Abrir',
  },
  vacio: {
    texto: 'text-slate-400', barra: 'bg-slate-500', borde: 'border-white/[0.08] hover:border-cyan-300/40',
    boton: 'bg-cyan-300 hover:bg-cyan-200 text-[#0a0420] border-transparent', accion: 'Poner notas',
  },
}
TONOS.aprobado = TONOS.ok

const IconoEditar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Barra = ({ pct, tono, alto = 'h-2' }) => (
  <div className={`${alto} rounded-full bg-white/[0.07] overflow-hidden`}>
    <div className={`h-full rounded-full ${tono.barra} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
  </div>
)

export const CourseGrid = ({
  cursos,
  estados,
  misCursosIds,
  onCalcular,
  onToggleFav,
  verMisCursos,
  isAdmin,
  onEditar,
}) => {
  if (cursos.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-[#0c0824]/40 rounded-3xl border border-dashed border-white/10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-300/10 border border-white/10 flex items-center justify-center text-2xl text-cyan-300">
          {verMisCursos ? '★' : '⌕'}
        </div>
        <p className="text-slate-300 font-semibold text-sm">
          {verMisCursos
            ? 'Aún no tienes cursos. Márcalos con ★ para agregarlos aquí.'
            : 'No se encontraron cursos.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-[18px]">
      {cursos.map((curso) => {
        const esFavorito = misCursosIds.includes(curso.id)
        const esCandado = !!(curso.sistema && curso.sistema.candado)
        const e = estados[curso.id]
        const tono = TONOS[e.tipo]
        const pct = Math.round(e.progreso.fraccion * 100)
        const prom = e.progreso.parcial !== null ? formatNota(e.progreso.parcial) : '—'

        return (
          <div key={curso.id}>
            {/* Móvil: fila compacta */}
            <div className={`sm:hidden flex items-stretch gap-2 rounded-[18px] bg-[#0c0824] border ${tono.borde} transition-colors`}>
              <button
                type="button"
                onClick={() => onCalcular(curso)}
                className="flex-1 min-w-0 flex items-center gap-3.5 p-3.5 text-left cursor-pointer"
              >
                <span className="flex-1 min-w-0 flex flex-col gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold tracking-[1px] text-cyan-300 shrink-0">{curso.id}</span>
                    <span className="text-sm font-bold text-slate-100 truncate">{curso.nombre}</span>
                  </span>
                  <Barra pct={pct} tono={tono} alto="h-1.5" />
                  <span className="text-xs font-semibold text-slate-400 truncate">{e.texto}</span>
                </span>
                <span className={`text-[26px] font-bold shrink-0 tabular-nums ${tono.texto}`}>{prom}</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onEditar(curso)}
                  className="w-11 shrink-0 flex items-center justify-center border-l border-white/[0.06] text-slate-400 hover:text-cyan-200 cursor-pointer"
                  aria-label={`Editar ${curso.nombre}`}
                >
                  <IconoEditar />
                </button>
              )}
            </div>

            {/* Escritorio / tablet: tarjeta */}
            <article className={`hidden sm:flex h-full flex-col gap-4 bg-[#0c0824] p-[22px] rounded-[22px] border ${tono.borde} transition-colors`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[11px] font-bold tracking-[1.5px] text-cyan-300 bg-cyan-300/10 border border-cyan-300/25 rounded-lg px-2 py-0.5">
                    {curso.id}
                  </span>
                  {esCandado && (
                    <span className="text-[10px] font-bold text-amber-200 bg-amber-300/10 border border-amber-300/30 rounded-lg px-2 py-0.5">
                      🔒 Candado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onEditar(curso)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-cyan-200 hover:border-cyan-300/40 transition-colors active:scale-90 cursor-pointer"
                      title="Editar curso"
                      aria-label={`Editar ${curso.nombre}`}
                    >
                      <IconoEditar />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleFav(curso.id)}
                    aria-pressed={esFavorito}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors active:scale-90 cursor-pointer ${
                      esFavorito
                        ? 'bg-amber-300/15 border-amber-300/40 text-amber-300'
                        : 'bg-white/[0.04] border-white/10 text-slate-500 hover:text-amber-300 hover:border-amber-300/30'
                    }`}
                    aria-label={esFavorito ? `Quitar ${curso.nombre} de mis cursos` : `Agregar ${curso.nombre} a mis cursos`}
                  >
                    <span className="text-sm">{esFavorito ? '★' : '☆'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[17px] font-bold text-slate-100 leading-snug min-w-0">{curso.nombre}</h3>
                <div className="text-right shrink-0">
                  <div className={`text-[32px] leading-none font-bold tabular-nums ${tono.texto}`}>{prom}</div>
                  <div className="text-[11px] font-bold text-slate-400 mt-1">promedio</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Barra pct={pct} tono={tono} />
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">{pct}% evaluado</span>
                  <span className={tono.texto}>{e.etiqueta}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-white/[0.07]">
                <span className="text-[13px] text-slate-300 font-semibold">{e.texto}</span>
                <button
                  type="button"
                  onClick={() => onCalcular(curso)}
                  className={`min-h-[44px] px-4 rounded-xl border font-bold text-[13px] shrink-0 transition-colors active:scale-[0.97] cursor-pointer ${tono.boton}`}
                >
                  {tono.accion}
                </button>
              </div>
            </article>
          </div>
        )
      })}
    </div>
  )
}
