import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CircleAlert, CircleCheck, Lock, Share2, Star, Trash2 } from 'lucide-react'
import { useToast } from './Toast'
import { useFocoModal } from '../logic/useFocoModal'
import { NumeroAnimado } from './NumeroAnimado'
import {
  calcularResultado, calcularNecesarioDe, calcularProgreso, notasSimuladas, estadoCurso, formatNota,
} from '../logic/useCalculadora'

const MIN_APROBATORIO = 10.5
const ATAJOS = [10, 12, 14, 16]
const RADIO = 76
const CIRC = 2 * Math.PI * RADIO

const pct = (n) => `${Math.round(n * 100)}%`

// Peso de una parte: si no está guardado (modelo nuevo), se deriva sumando sus componentes
const pesoDeParte = (parte) => {
  if (parte.peso !== undefined) return parte.peso
  let w = 0
  Object.keys(parte.sistema).forEach((k) => {
    const cfg = parte.sistema[k]
    if (typeof cfg === 'number') w += cfg
    else if (cfg && cfg.subNotas) w += cfg.peso
  })
  return w
}

const textoNecesario = (r) => {
  if (r.completo) return `Ya tienes todas las notas (actual: ${formatNota(r.notaActual)})`
  if (r.yaAprobado) return '¡Ya aprobaste, saques lo que saques!'
  if (!r.posible) return `Necesitarías ${formatNota(r.necesario, 'arriba')} (más de 20): ya no alcanza`
  return `Necesitas ${formatNota(r.necesario, 'arriba')} en lo que falta`
}

// Tono de la caja "cuánto necesitas"
const tonoNecesario = (r) => {
  if (r.completo) return r.notaActual >= MIN_APROBATORIO - 1e-9 ? 'bien' : 'mal'
  if (r.yaAprobado) return 'bien'
  if (!r.posible) return 'mal'
  return r.necesario > 14 ? 'ajustado' : 'bien'
}

const CAJA = {
  bien: 'bg-success-soft border-success/25',
  ajustado: 'bg-warning-soft border-warning/30',
  mal: 'bg-danger-soft border-danger/30',
  neutro: 'bg-muted border-border',
}
const ICONO_CAJA = { bien: 'text-success', ajustado: 'text-warning', mal: 'text-danger', neutro: 'text-muted-foreground' }

const inputNota = 'h-11 rounded-lg bg-background border border-input text-center num font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition placeholder:text-muted-foreground/60 disabled:cursor-not-allowed'

const tarjeta = 'bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]'

export const ModalCalculo = ({
  curso,
  notasGlobales,
  actualizarNota,
  limpiarNotasCurso,
  esFavorito,
  onToggleFav,
  onReportar,
  onCerrar,
}) => {
  const { showToast } = useToast()
  const [simular, setSimular] = useState(12)
  const panelRef = useFocoModal()

  // Escape cierra
  useEffect(() => {
    if (!curso) return
    const onKey = (e) => {
      // Si hay otra ventana encima (p. ej. Solicitar curso), Escape cierra solo esa
      if (e.key === 'Escape' && document.querySelectorAll('[aria-modal="true"]').length === 1) onCerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [curso, onCerrar])

  if (!curso) return null
  const notasDelCurso = notasGlobales[curso.id] || {}
  const esCandado = !!(curso.sistema && curso.sistema.candado)
  const carreras = [].concat(curso.carrera || [])

  // Cálculo en vivo
  const progreso = calcularProgreso(curso, notasDelCurso)
  const conNotas = progreso.parcial !== null
  const resultado = conNotas ? calcularResultado(curso, notasDelCurso) : null
  const necesario = conNotas ? calcularNecesarioDe(curso, notasDelCurso) : null
  const resultadoSim = progreso.completo
    ? null
    : calcularResultado(curso, notasSimuladas(curso, notasDelCurso, simular))

  // Aporte por evaluación (para "Aporta X pts")
  const aportes = {}
  progreso.evaluaciones.forEach((ev) => { aportes[`${ev.parte ?? ''}|${ev.key}`] = ev })

  // Número grande del anillo: la nota acumulada sobre 20 (lo que falta cuenta como 0)
  const numero = !conNotas ? null : progreso.completo && resultado ? Number(resultado.final) : progreso.puntos
  // El color depende de cómo vas (no del número, que al inicio siempre es bajo)
  const tipo = estadoCurso(curso, notasDelCurso).tipo
  const tonoAnillo = tipo === 'vacio' ? 'text-muted-foreground' : ['riesgo', 'jalado'].includes(tipo) ? 'text-danger' : 'text-success'

  const compartir = async () => {
    const url = `${window.location.origin}/?curso=${encodeURIComponent(curso.id)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link del curso copiado', 'success')
    } catch {
      showToast(url, 'info')
    }
  }

  const estadoFila = (ev) => {
    if (!ev || ev.estado === 'vacio') return { texto: 'Pendiente', clase: 'text-muted-foreground' }
    const pts = `${ev.aporte.toFixed(2)} pts`
    return ev.estado === 'parcial'
      ? { texto: `En curso · aporta ${pts}`, clase: 'text-primary' }
      : { texto: `Aporta ${pts}`, clase: 'text-success' }
  }

  // Filas de evaluaciones de un "sistema" simple (componentes número o subNotas)
  const renderSistema = (sistema, prefijo, parte, factor) => (
    <div className="divide-y divide-border">
      {Object.keys(sistema).map((key) => {
        if (key === 'candado' || key === 'partes') return null
        const config = sistema[key]
        const ev = aportes[`${parte ?? ''}|${key}`]
        const est = estadoFila(ev)
        const idBase = `nota-${prefijo}${key}`.replace(/\s+/g, '-')
        const chipPeso = 'num text-xs font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5'

        if (typeof config === 'number') {
          const llave = `${prefijo}${key}`
          return (
            <div key={key} className="flex items-center gap-3 md:gap-4 py-3.5">
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <label htmlFor={idBase} className="text-[15px] font-medium text-foreground truncate">{key}</label>
                <span className={`text-xs ${est.clase}`}>{est.texto}</span>
              </div>
              <span className={chipPeso}>{pct(config * factor)}</span>
              <input
                id={idBase}
                type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                value={notasDelCurso[llave] || ''}
                onChange={(e) => actualizarNota(curso.id, llave, e.target.value)}
                className={`${inputNota} w-[76px] md:w-20 text-lg`}
              />
            </div>
          )
        }

        // Evaluación con subnotas; puede permitir nota directa (config.directa)
        const llaveDirecta = `${prefijo}${key}__directa`
        const notaDirecta = config.directa ? (notasDelCurso[llaveDirecta] ?? '') : ''
        const bloqueado = notaDirecta !== ''

        return (
          <div key={key} className="py-3.5 flex flex-col gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                {config.directa ? (
                  <label htmlFor={idBase} className="text-[15px] font-medium text-foreground truncate">{key}</label>
                ) : (
                  <span className="text-[15px] font-medium text-foreground truncate">{key}</span>
                )}
                <span className={`text-xs ${est.clase}`}>{est.texto}</span>
              </div>
              <span className={chipPeso}>{pct(config.peso * factor)}</span>
              {config.directa && (
                <input
                  id={idBase}
                  type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                  value={notaDirecta}
                  title="Nota completa (opcional): si la pones, se ignoran las subnotas"
                  onChange={(e) => actualizarNota(curso.id, llaveDirecta, e.target.value)}
                  className={`${inputNota} w-[76px] md:w-20 text-lg`}
                />
              )}
            </div>
            {config.directa && (
              <p className="-mt-1 text-xs text-muted-foreground">
                {bloqueado
                  ? 'Usando la nota completa: bórrala para editar las subnotas.'
                  : 'Si ya sabes la nota completa, ponla arriba. Si no, llena las subnotas.'}
              </p>
            )}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 border-l-2 border-border transition-opacity ${bloqueado ? 'opacity-40' : ''}`}>
              {Object.keys(config.subNotas).map((subKey) => {
                const llave = `${prefijo}${key}_${subKey}`
                const idSub = `${idBase}-${subKey}`.replace(/\s+/g, '-')
                return (
                  <div key={subKey} className="flex items-center justify-between gap-3 bg-muted/60 pl-3 pr-1.5 py-1.5 rounded-lg">
                    <label htmlFor={idSub} className="text-sm text-foreground truncate">
                      {subKey} <span className="num text-xs text-muted-foreground">{Math.round(config.subNotas[subKey] * 100)}%</span>
                    </label>
                    <input
                      id={idSub}
                      type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                      disabled={bloqueado}
                      value={notasDelCurso[llave] || ''}
                      onChange={(e) => actualizarNota(curso.id, llave, e.target.value)}
                      className={`${inputNota} !h-9 w-16 text-base`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  const botonHeader = 'inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer active:scale-[0.97]'
  const tono = necesario && !necesario.candado ? tonoNecesario(necesario) : 'neutro'
  const IconoCaja = tono === 'bien' ? CircleCheck : CircleAlert

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] flex items-stretch md:items-center justify-center md:p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Calculadora de ${curso.nombre}`}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full md:max-w-6xl md:max-h-[92vh] overflow-y-auto custom-scrollbar bg-background md:border md:border-border md:rounded-2xl shadow-2xl outline-none"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="px-4 md:px-8 pt-5 md:pt-7 pb-8 flex flex-col gap-6">

          {/* Encabezado */}
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-2.5 min-w-0">
              <button type="button" onClick={onCerrar} className="group self-start inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Volver a cursos
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="num text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{curso.id}</span>
                {esCandado && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning-soft rounded px-1.5 py-0.5">
                    <Lock className="w-3 h-3" /> Candado
                  </span>
                )}
                {carreras.length > 0 && <span className="text-xs text-muted-foreground">{carreras.join(' · ')}</span>}
              </div>
              <h2 className="m-0 text-2xl md:text-3xl leading-tight font-semibold tracking-tight text-foreground">{curso.nombre}</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onToggleFav(curso.id)}
                aria-pressed={esFavorito}
                className={`${botonHeader} ${esFavorito ? 'border-star/40 bg-warning-soft text-foreground' : 'border-border bg-card text-foreground hover:bg-muted'}`}
              >
                <Star className={`w-4 h-4 ${esFavorito ? 'text-star' : 'text-muted-foreground'}`} fill={esFavorito ? 'currentColor' : 'none'} />
                {esFavorito ? 'En mis cursos' : 'Agregar a mis cursos'}
              </button>
              <button type="button" onClick={compartir} className={`${botonHeader} border-border bg-card text-foreground hover:bg-muted`}>
                <Share2 className="w-4 h-4 text-muted-foreground" /> Compartir
              </button>
              <button type="button" onClick={() => limpiarNotasCurso(curso.id)} className={`${botonHeader} border-border bg-card text-danger hover:bg-danger-soft`}>
                <Trash2 className="w-4 h-4" /> Limpiar notas
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 md:gap-6 items-start">

            {/* Columna izquierda: evaluaciones */}
            <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-4" aria-label="Evaluaciones">

              <div className={`${tarjeta} p-4 md:p-5 flex flex-col gap-3`}>
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <h3 className="m-0 text-sm font-semibold text-foreground">Cómo se compone tu nota</h3>
                  <span className="text-xs text-muted-foreground">
                    <span className="num">{pct(progreso.fraccion)}</span> evaluado · <span className="num">{pct(1 - progreso.fraccion)}</span> por rendir
                  </span>
                </div>
                <div className="flex gap-1 h-8" aria-hidden="true">
                  {progreso.evaluaciones.map((ev, i) => (
                    <div
                      key={`${ev.parte}-${ev.key}-${i}`}
                      title={`${ev.parte ? `${ev.parte} · ` : ''}${ev.key} · ${pct(ev.peso)}`}
                      style={{ width: `${(ev.peso / (progreso.pesoTotal || 1)) * 100}%` }}
                      className={`rounded-md flex items-center justify-center text-[11px] font-medium overflow-hidden whitespace-nowrap px-1 transition-colors duration-300 ${
                        ev.estado === 'lleno'
                          ? 'bg-primary text-primary-foreground'
                          : ev.estado === 'parcial'
                            ? 'bg-primary/25 text-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <span className="truncate">{ev.key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${tarjeta} px-4 md:px-5 py-1`}>
                {esCandado ? (
                  <div className="flex flex-col">
                    {curso.sistema.partes.map((parte, pIdx) => {
                      const parteRes = resultado?.candado ? resultado.partes.find((p) => p.nombre === parte.nombre) : null
                      const factor = parte.peso !== undefined ? parte.peso : 1
                      return (
                        <div key={pIdx} className={pIdx > 0 ? 'pt-3 mt-1 border-t-2 border-border' : 'pt-3'}>
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              {parte.nombre} <span className="num text-xs font-normal text-muted-foreground">· {pct(pesoDeParte(parte))}</span>
                            </span>
                            {parteRes && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                parteRes.aprobada ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                              }`}>
                                <span className="num">{formatNota(parteRes.nota)}</span> · {parteRes.aprobada ? 'Aprobada' : 'Jalada'} (mín. 10.5)
                              </span>
                            )}
                          </div>
                          {renderSistema(parte.sistema, `P${pIdx}_`, parte.nombre, factor)}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  renderSistema(curso.sistema, '', null, 1)
                )}
                <div className="py-3.5 border-t border-border text-sm text-muted-foreground">
                  ¿Algún peso está mal?{' '}
                  <button type="button" onClick={() => onReportar(curso)} className="font-medium text-primary hover:underline underline-offset-2 cursor-pointer">
                    Reportar con el sílabo
                  </button>
                </div>
              </div>
            </section>

            {/* Columna derecha: resultado + simulador */}
            <aside className="flex-[1_1_360px] min-w-0 flex flex-col gap-4 md:sticky md:top-0" aria-label="Resultado">

              <div className={`${tarjeta} p-5 flex flex-col items-center gap-4 text-center`} role="status" aria-live="polite">
                <div className={`relative w-[180px] h-[180px] ${tonoAnillo}`}>
                  <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
                    <circle cx="90" cy="90" r={RADIO} fill="none" stroke="var(--muted)" strokeWidth="12" />
                    {numero > 0 && (
                      <motion.circle
                        cx="90" cy="90" r={RADIO} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
                        transform="rotate(-90 90 90)"
                        strokeDasharray={CIRC}
                        initial={{ strokeDashoffset: CIRC }}
                        animate={{ strokeDashoffset: CIRC * (1 - Math.min(1, numero / 20)) }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <NumeroAnimado valor={numero} className="num text-[44px] leading-none font-semibold" />
                    <span className="max-w-[110px] text-xs leading-tight text-muted-foreground mt-1.5">
                      {progreso.completo && conNotas ? 'nota final' : 'nota acumulada'}
                    </span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5">
                  <span className="text-sm text-muted-foreground">Máximo posible</span>
                  <span className="num text-lg font-semibold text-foreground">{formatNota(progreso.maximo)}</span>
                </div>

                {!necesario ? (
                  <div className={`w-full rounded-lg p-3.5 border text-left ${CAJA.neutro}`}>
                    <div className="text-sm font-medium text-foreground">Pon tus notas y te decimos cuánto necesitas</div>
                    <div className="text-xs text-muted-foreground mt-0.5">para llegar a 10.5</div>
                  </div>
                ) : necesario.candado ? (
                  <div className={`w-full rounded-lg p-3.5 border text-left flex flex-col gap-1.5 ${CAJA.neutro}`}>
                    <div className="text-xs text-muted-foreground">Cada parte debe llegar a 10.5:</div>
                    {necesario.partes.map((p, i) => (
                      <div key={i} className="text-sm text-foreground">
                        <span className="font-semibold">{p.nombre}:</span> {textoNecesario(p)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`w-full rounded-lg p-3.5 border text-left flex gap-2.5 ${CAJA[tono]}`}>
                    <IconoCaja className={`w-5 h-5 shrink-0 mt-px ${ICONO_CAJA[tono]}`} />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{textoNecesario(necesario)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">para llegar a 10.5</div>
                    </div>
                  </div>
                )}

                {resultado?.candado && progreso.completo && !resultado.aprobado && resultado.partes.some((p) => !p.aprobada) && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
                    <Lock className="w-3.5 h-3.5" /> Jalas por candado: una parte no llega a 10.5
                  </p>
                )}
              </div>

              {resultadoSim && (
                <div className={`${tarjeta} p-5 flex flex-col gap-3.5`}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="m-0 text-sm font-semibold text-foreground">Simulador</h3>
                    <span className="text-xs text-muted-foreground">¿Qué pasa si…?</span>
                  </div>
                  <label htmlFor="simulador" className="text-sm text-muted-foreground">
                    Si saco <span className="num text-base font-semibold text-foreground">{simular.toFixed(1)}</span> en todo lo que falta
                  </label>
                  <input
                    id="simulador"
                    type="range" min="0" max="20" step="0.5"
                    value={simular}
                    onChange={(e) => setSimular(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Notas rápidas">
                    {ATAJOS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSimular(v)}
                        aria-pressed={simular === v}
                        className={`num h-8 min-w-10 px-2.5 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                          simular === v ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border hover:border-input'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-3 pt-3.5 border-t border-border" aria-live="polite">
                    <span className="text-sm text-muted-foreground">Terminarías con</span>
                    <span className={`flex items-center gap-2.5 ${resultadoSim.aprobado ? 'text-success' : 'text-danger'}`}>
                      <NumeroAnimado valor={Number(resultadoSim.final)} className="num text-3xl leading-none font-semibold" />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${resultadoSim.aprobado ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                        {resultadoSim.aprobado ? 'Apruebas' : 'Desapruebas'}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
