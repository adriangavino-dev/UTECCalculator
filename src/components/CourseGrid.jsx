import { calcularResultado, hayNotas } from '../logic/useCalculadora'

export const CourseGrid = ({
  cursos,
  misCursosIds,
  notasGlobales,
  onCalcular,
  onToggleFav,
  verMisCursos,
  isAdmin,
  onEditar,
}) => {
  if (cursos.length === 0) {
    return (
      <div className="col-span-full text-center py-20 bg-[#0c0824]/40 rounded-3xl border border-dashed border-white/10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-300/10 border border-white/10 flex items-center justify-center text-2xl text-cyan-300">
          {verMisCursos ? '★' : '⌕'}
        </div>
        <p className="text-slate-400 font-medium text-sm">
          {verMisCursos ? 'Aún no has agregado cursos a favoritos.' : 'No se encontraron cursos.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cursos.map((curso) => {
        const esFavorito = misCursosIds.includes(curso.id)
        const esCandado = !!(curso.sistema && curso.sistema.candado)
        const notas = (notasGlobales && notasGlobales[curso.id]) || {}
        const prom = hayNotas(notas) ? calcularResultado(curso, notas) : null
        return (
          <div
            key={curso.id}
            className="group relative bg-[#0c0824] p-6 rounded-3xl border border-white/[0.08] hover:border-cyan-300/40 transition-colors flex flex-col"
          >
            {/* Acciones (editar admin + favorito) */}
            <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onEditar(curso)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-cyan-200 hover:border-cyan-300/40 transition-all active:scale-90 cursor-pointer"
                  title="Editar curso"
                  aria-label="Editar curso"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleFav(curso.id)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 cursor-pointer ${
                  esFavorito
                    ? 'bg-amber-300/15 border-amber-300/40 text-amber-300'
                    : 'bg-white/[0.04] border-white/10 text-slate-500 hover:text-amber-300 hover:border-amber-300/30'
                }`}
                aria-label={esFavorito ? 'Quitar favorito' : 'Marcar favorito'}
              >
                <span className="text-sm">{esFavorito ? '★' : '☆'}</span>
              </button>
            </div>

            <div className={`relative mb-6 ${isAdmin ? 'pr-24' : 'pr-12'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block text-[9px] font-bold text-cyan-300 uppercase tracking-[2.5px] bg-cyan-300/10 px-2.5 py-1 rounded-md border border-cyan-300/25">
                  {curso.id}
                </span>
                {esCandado && (
                  <span className="inline-block text-[8px] font-bold text-amber-200 uppercase tracking-[1.5px] bg-amber-300/10 px-1.5 py-0.5 rounded border border-amber-300/30">
                    🔒 Candado
                  </span>
                )}
                {prom && (
                  <span
                    className={`inline-block text-[9px] font-black uppercase tracking-[1.5px] px-2 py-0.5 rounded-md border ${
                      prom.aprobado
                        ? 'text-teal-200 bg-teal-300/10 border-teal-300/30'
                        : 'text-rose-200 bg-rose-400/10 border-rose-400/30'
                    }`}
                    title="Promedio con tus notas guardadas"
                  >
                    Prom. {prom.final}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-3 leading-snug group-hover:text-cyan-100 transition-colors">
                {curso.nombre}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onCalcular(curso)}
              className="relative mt-auto w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-[2.5px] hover:bg-cyan-300 hover:text-[#0a0420] hover:border-transparent transition-colors active:scale-[0.98] cursor-pointer"
            >
              Calcular →
            </button>
          </div>
        )
      })}
    </div>
  )
}
