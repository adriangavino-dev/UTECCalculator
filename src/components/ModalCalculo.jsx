import { useState, useEffect } from 'react'
import { useToast } from './Toast'
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
  if (r.completo) return r.notaActual >= MIN_APROBATORIO - 1e-9 ? 'teal' : 'rose'
  if (r.yaAprobado) return 'teal'
  if (!r.posible) return 'rose'
  return r.necesario > 14 ? 'amber' : 'teal'
}

const CAJA = {
  teal: 'bg-teal-300/[0.08] border-teal-300/30 text-teal-100',
  amber: 'bg-amber-300/[0.08] border-amber-300/35 text-amber-100',
  rose: 'bg-rose-300/[0.08] border-rose-300/35 text-rose-100',
  slate: 'bg-white/[0.04] border-white/10 text-slate-200',
}

const inputNota = 'h-12 rounded-xl bg-[#07061a] text-center font-bold text-slate-100 outline-none focus:border-cyan-300/70 transition-colors placeholder:text-slate-600 border tabular-nums disabled:cursor-not-allowed'

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

  // Escape cierra
  useEffect(() => {
    if (!curso) return
    const onKey = (e) => { if (e.key === 'Escape') onCerrar() }
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

  // Número grande del anillo
  // Número grande del anillo: la nota acumulada sobre 20 (lo que falta cuenta como 0)
  const numero = !conNotas ? null : progreso.completo && resultado ? Number(resultado.final) : progreso.puntos
  // El color depende de cómo vas (no del número, que al inicio siempre es bajo)
  const tipo = estadoCurso(curso, notasDelCurso).tipo
  const tonoAnillo = tipo === 'vacio' ? 'text-slate-400' : ['riesgo', 'jalado'].includes(tipo) ? 'text-rose-300' : 'text-teal-300'

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
    if (!ev || ev.estado === 'vacio') return { texto: 'Pendiente', clase: 'text-slate-400' }
    const pts = `${ev.aporte.toFixed(2)} pts`
    return ev.estado === 'parcial'
      ? { texto: `En curso · aporta ${pts}`, clase: 'text-cyan-300' }
      : { texto: `Aporta ${pts}`, clase: 'text-teal-300' }
  }

  // Filas de evaluaciones de un "sistema" simple (componentes número o subNotas)
  const renderSistema = (sistema, prefijo, parte, factor) => (
    <div className="divide-y divide-white/[0.06]">
      {Object.keys(sistema).map((key) => {
        if (key === 'candado' || key === 'partes') return null
        const config = sistema[key]
        const ev = aportes[`${parte ?? ''}|${key}`]
        const est = estadoFila(ev)
        const idBase = `nota-${prefijo}${key}`.replace(/\s+/g, '-')

        if (typeof config === 'number') {
          const llave = `${prefijo}${key}`
          return (
            <div key={key} className="flex items-center gap-3 md:gap-4 py-3.5">
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <label htmlFor={idBase} className="text-[15px] font-bold text-slate-100 truncate">{key}</label>
                <span className={`text-xs font-bold ${est.clase}`}>{est.texto}</span>
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-300/[0.08] rounded-lg px-2 py-1 tabular-nums">{pct(config * factor)}</span>
              <input
                id={idBase}
                type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                value={notasDelCurso[llave] || ''}
                onChange={(e) => actualizarNota(curso.id, llave, e.target.value)}
                className={`${inputNota} w-[76px] md:w-[84px] text-xl ${notasDelCurso[llave] ? 'border-cyan-300/45' : 'border-white/[0.12]'}`}
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
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                {config.directa ? (
                  <label htmlFor={idBase} className="text-[15px] font-bold text-slate-100 truncate">{key}</label>
                ) : (
                  <span className="text-[15px] font-bold text-slate-100 truncate">{key}</span>
                )}
                <span className={`text-xs font-bold ${est.clase}`}>{est.texto}</span>
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-300/[0.08] rounded-lg px-2 py-1 tabular-nums">{pct(config.peso * factor)}</span>
              {config.directa && (
                <input
                  id={idBase}
                  type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                  value={notaDirecta}
                  title="Nota completa (opcional): si la pones, se ignoran las subnotas"
                  onChange={(e) => actualizarNota(curso.id, llaveDirecta, e.target.value)}
                  className={`${inputNota} w-[76px] md:w-[84px] text-xl ${bloqueado ? 'border-teal-300/50' : 'border-white/[0.12]'}`}
                />
              )}
            </div>
            {config.directa && (
              <p className="-mt-1 text-[11px] text-slate-500 font-semibold">
                {bloqueado
                  ? 'Usando la nota completa: borra la nota de arriba para editar las subnotas'
                  : 'Si ya sabes la nota completa, ponla arriba. Si no, llena las subnotas'}
              </p>
            )}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 border-l-2 border-white/[0.06] transition-opacity ${bloqueado ? 'opacity-40' : ''}`}>
              {Object.keys(config.subNotas).map((subKey) => {
                const llave = `${prefijo}${key}_${subKey}`
                const idSub = `${idBase}-${subKey}`.replace(/\s+/g, '-')
                return (
                  <div key={subKey} className="flex items-center justify-between gap-3 bg-white/[0.03] pl-3.5 pr-2 py-2 rounded-xl">
                    <label htmlFor={idSub} className="text-[13px] text-slate-300 font-semibold truncate">
                      {subKey} <span className="text-slate-500 text-[11px]">{Math.round(config.subNotas[subKey] * 100)}%</span>
                    </label>
                    <input
                      id={idSub}
                      type="number" inputMode="decimal" placeholder="—" step="0.1" min="0" max="20"
                      disabled={bloqueado}
                      value={notasDelCurso[llave] || ''}
                      onChange={(e) => actualizarNota(curso.id, llave, e.target.value)}
                      className={`${inputNota} !h-10 w-16 text-base ${notasDelCurso[llave] ? 'border-cyan-300/40' : 'border-white/[0.1]'}`}
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

  const botonHeader = 'min-h-[44px] px-3.5 md:px-4 rounded-xl border font-bold text-[13px] transition-colors cursor-pointer active:scale-95'

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/85 backdrop-blur-md flex items-stretch md:items-center justify-center md:p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Calculadora de ${curso.nombre}`}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
    >
      <div className="relative w-full md:max-w-6xl md:max-h-[92vh] overflow-y-auto custom-scrollbar bg-[#07061a] md:bg-[#0a0720] md:border md:border-white/10 md:rounded-[28px] shadow-2xl shadow-black/50">
        <div className="px-4 md:px-8 pt-5 md:pt-7 pb-8 flex flex-col gap-6 md:gap-7">

          {/* Encabezado */}
          <header className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-2.5 min-w-0">
              <button type="button" onClick={onCerrar} className="self-start text-[13px] font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer">
                ← Volver a cursos
              </button>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold tracking-[1.5px] text-cyan-300 bg-cyan-300/10 border border-cyan-300/25 rounded-lg px-2 py-0.5">{curso.id}</span>
                {esCandado && (
                  <span className="text-[11px] font-bold text-amber-200 bg-amber-300/10 border border-amber-300/30 rounded-lg px-2 py-0.5">🔒 Candado</span>
                )}
                {carreras.length > 0 && (
                  <span className="text-xs font-bold text-slate-400">{carreras.join(' · ')}</span>
                )}
              </div>
              <h2 className="m-0 text-[26px] md:text-[34px] leading-tight font-bold text-slate-100">{curso.nombre}</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onToggleFav(curso.id)}
                aria-pressed={esFavorito}
                className={`${botonHeader} ${esFavorito
                  ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                  : 'border-white/[0.14] text-slate-200 hover:text-amber-200 hover:border-amber-300/40'}`}
              >
                {esFavorito ? '★ En mis cursos' : '☆ Agregar a mis cursos'}
              </button>
              <button type="button" onClick={compartir} className={`${botonHeader} border-white/[0.14] bg-[#0c0824] text-slate-100 hover:border-cyan-300/40`}>
                Compartir
              </button>
              <button type="button" onClick={() => limpiarNotasCurso(curso.id)} className={`${botonHeader} border-rose-300/35 text-rose-100 hover:bg-rose-300/10`}>
                Limpiar notas
              </button>
            </div>
          </header>

          <div className="flex flex-wrap gap-5 md:gap-6 items-start">

            {/* Columna izquierda: evaluaciones */}
            <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-[18px]" aria-label="Evaluaciones">

              <div className="bg-[#0c0824] border border-white/[0.08] rounded-[22px] p-[18px] md:p-[22px] flex flex-col gap-3.5">
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <h3 className="m-0 text-[15px] font-bold text-slate-100">Cómo se compone tu nota</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {pct(progreso.fraccion)} evaluado · {pct(1 - progreso.fraccion)} por rendir
                  </span>
                </div>
                <div className="flex gap-1 h-9" aria-hidden="true">
                  {progreso.evaluaciones.map((ev, i) => (
                    <div
                      key={`${ev.parte}-${ev.key}-${i}`}
                      title={`${ev.parte ? `${ev.parte} · ` : ''}${ev.key} · ${pct(ev.peso)}`}
                      style={{ width: `${(ev.peso / (progreso.pesoTotal || 1)) * 100}%` }}
                      className={`rounded-lg flex items-center justify-center text-[11px] font-bold overflow-hidden whitespace-nowrap px-1 transition-colors ${
                        ev.estado === 'lleno'
                          ? 'bg-cyan-300 text-[#0a0420]'
                          : ev.estado === 'parcial'
                            ? 'bg-cyan-300/35 text-cyan-50'
                            : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      <span className="truncate">{ev.key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0c0824] border border-white/[0.08] rounded-[22px] px-[18px] md:px-[22px] py-2">
                {esCandado ? (
                  <div className="flex flex-col">
                    {curso.sistema.partes.map((parte, pIdx) => {
                      const parteRes = resultado?.candado ? resultado.partes.find((p) => p.nombre === parte.nombre) : null
                      const factor = parte.peso !== undefined ? parte.peso : 1
                      return (
                        <div key={pIdx} className={pIdx > 0 ? 'pt-3 mt-1 border-t border-white/[0.1]' : 'pt-3'}>
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="font-bold text-cyan-100 text-sm uppercase tracking-[2px]">
                              {parte.nombre} <span className="text-cyan-300/70 text-[11px]">· {pct(pesoDeParte(parte))}</span>
                            </span>
                            {parteRes && (
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                parteRes.aprobada ? 'bg-teal-300/10 text-teal-200 border-teal-300/35' : 'bg-rose-300/10 text-rose-200 border-rose-300/35'
                              }`}>
                                {formatNota(parteRes.nota)} · {parteRes.aprobada ? 'Aprobada' : 'Jalada'} (mín 10.5)
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
                <div className="pt-3.5 pb-2.5 border-t border-white/[0.06] text-[13px] text-slate-400 font-semibold">
                  ¿Algún peso está mal?{' '}
                  <button type="button" onClick={() => onReportar(curso)} className="font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer">
                    Reportar con el sílabo
                  </button>
                </div>
              </div>
            </section>

            {/* Columna derecha: resultado + simulador */}
            <aside className="flex-[1_1_360px] min-w-0 flex flex-col gap-[18px]" aria-label="Resultado">

              <div className="bg-[#0c0824] border border-white/[0.08] rounded-[22px] p-6 flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
                <div className={`relative w-[180px] h-[180px] ${tonoAnillo}`}>
                  <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
                    <circle cx="90" cy="90" r={RADIO} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
                    {numero > 0 && <circle
                      cx="90" cy="90" r={RADIO} fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={`${(CIRC * Math.min(1, (numero ?? 0) / 20)).toFixed(1)} ${CIRC.toFixed(1)}`}
                      transform="rotate(-90 90 90)"
                      className="transition-[stroke-dasharray] duration-300"
                    />}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[46px] leading-none font-bold tabular-nums">{numero !== null ? formatNota(numero) : '—'}</span>
                    <span className="max-w-[110px] text-xs leading-tight font-bold text-slate-400 mt-1.5">
                      {progreso.completo && conNotas ? 'nota final' : 'nota acumulada'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-white/[0.04] rounded-2xl p-3">
                  <div className="text-xl font-bold tabular-nums">{formatNota(progreso.maximo)}</div>
                  <div className="text-[11px] font-bold text-slate-400">máximo posible</div>
                </div>

                {!necesario ? (
                  <div className={`w-full rounded-2xl p-3.5 border ${CAJA.slate}`}>
                    <div className="text-[15px] font-bold">Pon tus notas y te decimos cuánto necesitas</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">para llegar a 10.5</div>
                  </div>
                ) : necesario.candado ? (
                  <div className={`w-full rounded-2xl p-3.5 border text-left flex flex-col gap-1.5 ${CAJA.slate}`}>
                    <div className="text-xs font-bold text-slate-400">Cada parte debe llegar a 10.5:</div>
                    {necesario.partes.map((p, i) => (
                      <div key={i} className="text-sm font-semibold">
                        <span className="text-cyan-200 font-bold">{p.nombre}:</span> {textoNecesario(p)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`w-full rounded-2xl p-3.5 border ${CAJA[tonoNecesario(necesario)]}`}>
                    <div className="text-[15px] font-bold">{textoNecesario(necesario)}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">para llegar a 10.5</div>
                  </div>
                )}

                {resultado?.candado && progreso.completo && !resultado.aprobado && resultado.partes.some((p) => !p.aprobada) && (
                  <p className="text-xs font-bold text-rose-200">🔒 Jalas por candado: una parte no llega a 10.5</p>
                )}
              </div>

              {resultadoSim && (
                <div className="bg-[#0c0824] border border-cyan-300/30 rounded-[22px] p-6 flex flex-col gap-3.5">
                  <div className="flex justify-between items-center">
                    <h3 className="m-0 text-[15px] font-bold text-slate-100">Simulador</h3>
                    <span className="text-[11px] font-bold text-cyan-300 tracking-[1.5px] uppercase">¿Qué pasa si…?</span>
                  </div>
                  <label htmlFor="simulador" className="text-[13px] text-slate-300 font-semibold">
                    Si saco <span className="text-slate-100 font-bold text-base tabular-nums">{simular.toFixed(1)}</span> en todo lo que falta
                  </label>
                  <input
                    id="simulador"
                    type="range" min="0" max="20" step="0.5"
                    value={simular}
                    onChange={(e) => setSimular(parseFloat(e.target.value))}
                    className="w-full accent-cyan-300 cursor-pointer"
                  />
                  <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Notas rápidas">
                    {ATAJOS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSimular(v)}
                        aria-pressed={simular === v}
                        className={`min-h-[36px] px-3 rounded-[10px] border font-bold text-xs text-slate-100 transition-colors cursor-pointer ${
                          simular === v ? 'bg-cyan-300/[0.18] border-cyan-300/60' : 'border-white/[0.14] hover:border-white/30'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-3 pt-3.5 border-t border-white/[0.07]" aria-live="polite">
                    <span className="text-[13px] text-slate-300 font-semibold">Terminarías con</span>
                    <span className={`flex items-center gap-2.5 ${resultadoSim.aprobado ? 'text-teal-300' : 'text-rose-300'}`}>
                      <span className="text-[34px] leading-none font-bold tabular-nums">{formatNota(resultadoSim.final)}</span>
                      <span className="text-[11px] font-bold px-2 py-1 rounded-lg border border-current">
                        {resultadoSim.aprobado ? 'Apruebas' : 'Desapruebas'}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
