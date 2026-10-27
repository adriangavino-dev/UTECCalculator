import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Pencil, Search, Star } from 'lucide-react'
import { formatNota } from '../logic/useCalculadora'

// Colores y acción según el estado del curso
const TONOS = {
  riesgo: {
    texto: 'text-danger', barra: 'bg-danger', borde: 'border-danger/40 hover:border-danger/70',
    boton: 'bg-destructive text-destructive-foreground hover:opacity-90 border-transparent', accion: 'Ver plan',
  },
  jalado: {
    texto: 'text-danger', barra: 'bg-danger', borde: 'border-border hover:border-input',
    boton: 'bg-card hover:bg-muted text-foreground border-border', accion: 'Abrir',
  },
  ok: {
    texto: 'text-success', barra: 'bg-success', borde: 'border-border hover:border-input',
    boton: 'bg-card hover:bg-muted text-foreground border-border', accion: 'Abrir',
  },
  vacio: {
    texto: 'text-muted-foreground', barra: 'bg-muted-foreground', borde: 'border-border hover:border-input',
    boton: 'bg-primary text-primary-foreground hover:opacity-90 border-transparent', accion: 'Poner notas',
  },
}
TONOS.aprobado = TONOS.ok

const Barra = ({ pct, tono, alto = 'h-1.5' }) => (
  <div className={`${alto} rounded-full bg-muted overflow-hidden`}>
    <motion.div
      className={`h-full rounded-full ${tono.barra}`}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
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
  const reducir = useReducedMotion()

  if (cursos.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border bg-card/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          {verMisCursos ? <Star className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </div>
        <p className="text-sm text-muted-foreground">
          {verMisCursos ? 'Aún no tienes cursos. Márcalos con la estrella para agregarlos aquí.' : 'No se encontraron cursos.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
      {cursos.map((curso, i) => {
        const esFavorito = misCursosIds.includes(curso.id)
        const esCandado = !!(curso.sistema && curso.sistema.candado)
        const e = estados[curso.id]
        const tono = TONOS[e.tipo]
        const pct = Math.round(e.progreso.fraccion * 100)
        // Nota acumulada sobre 20 (igual que el anillo del detalle)
        const prom = e.progreso.parcial !== null ? formatNota(e.progreso.puntos) : '—'

        return (
          <motion.div
            key={curso.id}
            initial={reducir ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.035, ease: 'easeOut' }}
          >
            {/* Móvil: fila compacta */}
            <div className={`sm:hidden flex items-stretch rounded-xl bg-card border ${tono.borde} transition-colors`}>
              <button
                type="button"
                onClick={() => onCalcular(curso)}
                className="flex-1 min-w-0 flex items-center gap-3.5 p-3.5 text-left cursor-pointer"
              >
                <span className="flex-1 min-w-0 flex flex-col gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="num text-[11px] text-muted-foreground shrink-0">{curso.id}</span>
                    <span className="text-sm font-semibold text-foreground truncate">{curso.nombre}</span>
                  </span>
                  <Barra pct={pct} tono={tono} />
                  <span className="text-xs text-muted-foreground truncate">
                    {e.tipo !== 'vacio' && <span className={`font-medium ${tono.texto}`}>{e.etiqueta} · </span>}
                    {e.texto}
                  </span>
                </span>
                <span className={`num text-2xl font-semibold shrink-0 ${tono.texto}`}>{prom}</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onEditar(curso)}
                  className="w-11 shrink-0 flex items-center justify-center border-l border-border text-muted-foreground hover:text-primary cursor-pointer"
                  aria-label={`Editar ${curso.nombre}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Escritorio / tablet: tarjeta */}
            <article className={`hidden sm:flex h-full flex-col gap-4 bg-card p-5 rounded-xl border ${tono.borde} shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-[box-shadow,border-color]`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="num text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{curso.id}</span>
                  {esCandado && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning-soft rounded px-1.5 py-0.5">
                      <Lock className="w-3 h-3" /> Candado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 -mr-1.5">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onEditar(curso)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                      title="Editar curso"
                      aria-label={`Editar ${curso.nombre}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <motion.button
                    type="button"
                    onClick={() => onToggleFav(curso.id)}
                    aria-pressed={esFavorito}
                    whileTap={{ scale: 0.8 }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-muted ${
                      esFavorito ? 'text-star' : 'text-muted-foreground hover:text-star'
                    }`}
                    aria-label={esFavorito ? `Quitar ${curso.nombre} de mis cursos` : `Agregar ${curso.nombre} a mis cursos`}
                  >
                    <Star className="w-4 h-4" fill={esFavorito ? 'currentColor' : 'none'} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground leading-snug min-w-0">{curso.nombre}</h3>
                <div className="text-right shrink-0">
                  <div className={`num text-3xl leading-none font-semibold ${tono.texto}`}>{prom}</div>
                  <div className="text-xs text-muted-foreground mt-1">acumulado</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Barra pct={pct} tono={tono} />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{pct}% evaluado</span>
                  <span className={`font-medium ${tono.texto}`}>{e.etiqueta}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-border">
                <span className="text-sm text-muted-foreground">{e.texto}</span>
                <button
                  type="button"
                  onClick={() => onCalcular(curso)}
                  className={`h-9 px-3.5 rounded-lg border text-sm font-medium shrink-0 transition active:scale-[0.97] cursor-pointer ${tono.boton}`}
                >
                  {tono.accion}
                </button>
              </div>
            </article>
          </motion.div>
        )
      })}
    </div>
  )
}
