import { useState, useEffect } from 'react'
import { useCursoAdmin } from '../logic/useCursoAdmin'
import { useToast } from './Toast'

const uid = () => (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)

const nuevaSubnota = () => ({ key: uid(), nombre: '', porcentaje: '' })
const nuevoComponente = () => ({
  key: uid(), nombre: '', porcentaje: '', tieneSubnotas: false, subNotas: [],
})
const nuevoCompSimple = () => ({ key: uid(), nombre: '', porcentaje: '' })
const nuevaParte = (nombre) => ({
  key: uid(), nombre, peso: '', componentes: [nuevoCompSimple()],
})

const EPSILON = 0.01
const sumaPct = (arr) => arr.reduce((acc, x) => acc + (parseFloat(x.porcentaje) || 0), 0)
const round2 = (n) => Math.round(n * 100) / 100
// peso 0-1 -> string porcentaje 0-100 (sin ceros sobrantes)
const pesoAPct = (p) => String(Math.round((p * 100 + Number.EPSILON) * 10000) / 10000)

const repartir = (items) => {
  const n = items.length
  if (n === 0) return items
  const base = Math.floor((100 / n) * 10000) / 10000
  return items.map((s, i) => ({
    ...s,
    porcentaje: i === n - 1
      ? String(round2(100 - base * (n - 1)) === 100 - base * (n - 1) ? 100 - base * (n - 1) : (100 - base * (n - 1)).toFixed(4)).replace(/\.?0+$/, '')
      : String(base),
  }))
}

export const CursoFormModal = ({ isOpen, onClose, onSaved, cursoEditar }) => {
  const { agregarCurso, editarCurso, eliminarCurso, guardando, error, setError } = useCursoAdmin()
  const { showToast } = useToast()

  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [candado, setCandado] = useState(false)
  const [componentes, setComponentes] = useState([nuevoComponente()])
  const [partes, setPartes] = useState([nuevaParte('Teoría'), nuevaParte('Laboratorio')])
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)

  const esEdicion = !!cursoEditar

  // Al abrir: cargar datos del curso (edición) o limpiar (nuevo)
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setConfirmarBorrar(false)
    if (cursoEditar) {
      setId(cursoEditar.id)
      setNombre(cursoEditar.nombre)
      const sis = cursoEditar.sistema || {}
      if (sis.candado) {
        setCandado(true)
        setPartes(
          sis.partes.map((p) => ({
            key: uid(),
            nombre: p.nombre,
            peso: pesoAPct(p.peso),
            componentes: Object.entries(p.sistema).map(([nom, peso]) => ({
              key: uid(), nombre: nom, porcentaje: pesoAPct(peso),
            })),
          }))
        )
        setComponentes([nuevoComponente()])
      } else {
        setCandado(false)
        setComponentes(
          Object.entries(sis)
            .filter(([k]) => k !== 'candado' && k !== 'partes')
            .map(([nom, cfg]) => {
              if (typeof cfg === 'number') {
                return { key: uid(), nombre: nom, porcentaje: pesoAPct(cfg), tieneSubnotas: false, subNotas: [] }
              }
              return {
                key: uid(), nombre: nom, porcentaje: pesoAPct(cfg.peso), tieneSubnotas: true,
                subNotas: Object.entries(cfg.subNotas).map(([sn, sp]) => ({ key: uid(), nombre: sn, porcentaje: pesoAPct(sp) })),
              }
            })
        )
        setPartes([nuevaParte('Teoría'), nuevaParte('Laboratorio')])
      }
    } else {
      setId(''); setNombre(''); setCandado(false)
      setComponentes([nuevoComponente()])
      setPartes([nuevaParte('Teoría'), nuevaParte('Laboratorio')])
    }
  }, [isOpen, cursoEditar, setError])

  if (!isOpen) return null

  const cerrar = () => { setError(null); onClose() }

  // ---- Componentes (modo normal) ----
  const updateComp = (key, c) => setComponentes((p) => p.map((x) => x.key === key ? { ...x, ...c } : x))
  const addComponente = () => setComponentes((p) => [...p, nuevoComponente()])
  const removeComponente = (key) => setComponentes((p) => p.filter((x) => x.key !== key))
  const toggleSubnotas = (key, v) => updateComp(key, { tieneSubnotas: v, subNotas: v ? [nuevaSubnota()] : [] })
  const addSubnota = (ck) => setComponentes((p) => p.map((c) => c.key === ck ? { ...c, subNotas: [...c.subNotas, nuevaSubnota()] } : c))
  const updateSubnota = (ck, sk, ch) => setComponentes((p) => p.map((c) => c.key === ck ? { ...c, subNotas: c.subNotas.map((s) => s.key === sk ? { ...s, ...ch } : s) } : c))
  const removeSubnota = (ck, sk) => setComponentes((p) => p.map((c) => c.key === ck ? { ...c, subNotas: c.subNotas.filter((s) => s.key !== sk) } : c))
  const repartirSub = (ck) => setComponentes((p) => p.map((c) => c.key === ck ? { ...c, subNotas: repartir(c.subNotas) } : c))

  // ---- Partes (modo candado) ----
  const updateParte = (key, ch) => setPartes((p) => p.map((x) => x.key === key ? { ...x, ...ch } : x))
  const addParteComp = (pk) => setPartes((p) => p.map((x) => x.key === pk ? { ...x, componentes: [...x.componentes, nuevoCompSimple()] } : x))
  const updateParteComp = (pk, ck, ch) => setPartes((p) => p.map((x) => x.key === pk ? { ...x, componentes: x.componentes.map((c) => c.key === ck ? { ...c, ...ch } : c) } : x))
  const removeParteComp = (pk, ck) => setPartes((p) => p.map((x) => x.key === pk ? { ...x, componentes: x.componentes.filter((c) => c.key !== ck) } : x))
  const repartirParteComp = (pk) => setPartes((p) => p.map((x) => x.key === pk ? { ...x, componentes: repartir(x.componentes) } : x))

  // ---- Validación ----
  const totalComponentes = sumaPct(componentes)
  const componentesOk = Math.abs(totalComponentes - 100) < EPSILON
  const subnotaSum = (comp) => sumaPct(comp.subNotas)
  const subnotaOk = (comp) => !comp.tieneSubnotas || Math.abs(subnotaSum(comp) - 100) < EPSILON
  const simpleNombresOk = id.trim() && nombre.trim() && componentes.length > 0 &&
    componentes.every((c) => c.nombre.trim() && c.porcentaje !== '' &&
      (!c.tieneSubnotas || (c.subNotas.length > 0 && c.subNotas.every((s) => s.nombre.trim() && s.porcentaje !== ''))))
  const puedeGuardarSimple = componentesOk && componentes.every(subnotaOk) && simpleNombresOk

  const totalPesoPartes = partes.reduce((acc, p) => acc + (parseFloat(p.peso) || 0), 0)
  const pesosPartesOk = Math.abs(totalPesoPartes - 100) < EPSILON
  const parteCompSum = (parte) => sumaPct(parte.componentes)
  const parteCompOk = (parte) => Math.abs(parteCompSum(parte) - 100) < EPSILON
  const todasPartesOk = partes.every(parteCompOk)
  const candadoNombresOk = id.trim() && nombre.trim() &&
    partes.every((p) => p.nombre.trim() && p.peso !== '' && p.componentes.length > 0 &&
      p.componentes.every((c) => c.nombre.trim() && c.porcentaje !== ''))
  const puedeGuardarCandado = pesosPartesOk && todasPartesOk && candadoNombresOk

  const puedeGuardar = (candado ? puedeGuardarCandado : puedeGuardarSimple) && !guardando

  const handleGuardar = async () => {
    if (!puedeGuardar) return
    const payload = { id, nombre, candado, componentes, partes }
    const res = esEdicion
      ? await editarCurso(cursoEditar.id, payload)
      : await agregarCurso(payload)
    if (res.ok) {
      showToast(esEdicion ? 'Cambios guardados' : `Curso ${id.trim()} agregado`, 'success')
      onSaved?.(res.curso)
      onClose()
    } else {
      showToast(res.message || 'Ocurrió un error', 'error')
    }
  }

  const handleEliminar = async () => {
    const res = await eliminarCurso(cursoEditar.id)
    if (res.ok) {
      showToast(`Curso ${cursoEditar.id} eliminado`, 'info')
      setConfirmarBorrar(false)
      onClose()
    } else {
      showToast(res.message || 'No se pudo eliminar', 'error')
    }
  }

  const inputBase = 'rounded-lg bg-black/40 border text-slate-100 placeholder:text-slate-600 outline-none transition-all'

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) cerrar() }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] p-[1.5px] rounded-[34px] bg-gradient-to-br from-cyan-400/60 via-teal-400/40 to-sky-500/60 shadow-[0_25px_80px_-20px_rgba(56,189,248,0.4)]">
        <div className="relative w-full h-full max-h-[calc(92vh-3px)] flex flex-col bg-[#0c0824]/95 backdrop-blur-2xl rounded-[33px] overflow-hidden">

          <div className="absolute -top-32 -right-24 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                {esEdicion ? 'Editar curso' : 'Nuevo curso'}
              </p>
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                {esEdicion ? cursoEditar.id : 'Agregar curso'}
              </h3>
            </div>
            <button onClick={cerrar} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-5 space-y-6">

            {/* Datos básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[2px] text-cyan-300 font-bold mb-2">
                  Código {esEdicion && <span className="text-slate-500">(no editable)</span>}
                </label>
                <input type="text" placeholder="CS3041" value={id} disabled={esEdicion} onChange={(e) => setId(e.target.value)}
                  className={`w-full px-3 py-2.5 ${inputBase} border-white/10 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed`} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-[2px] text-cyan-300 font-bold mb-2">Nombre del curso</label>
                <input type="text" placeholder="Algoritmos y Estructuras de Datos" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className={`w-full px-3 py-2.5 ${inputBase} border-white/10 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 font-medium text-sm`} />
              </div>
            </div>

            {/* Toggle candado */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
              <div>
                <span className="text-sm font-bold text-slate-100 flex items-center gap-2">🔒 Curso candado</span>
                <span className="text-[10px] text-slate-400 font-medium">Dos partes (ej. Teoría/Lab); cada una debe llegar a 10.5</span>
              </div>
              <button onClick={() => setCandado((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${candado ? 'bg-gradient-to-r from-cyan-300 to-teal-300' : 'bg-white/10'}`} aria-label="Activar candado">
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${candado ? 'left-[26px]' : 'left-0.5'}`}></span>
              </button>
            </div>

            {/* ===== MODO NORMAL ===== */}
            {!candado && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[2px] text-teal-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.9)]"></span>
                    Sistema de evaluación
                  </span>
                  <span className={`text-[11px] font-black ${componentesOk ? 'text-teal-300' : 'text-amber-300'}`}>
                    Total: {round2(totalComponentes)}% / 100%{componentesOk ? ' ✓' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {componentes.map((comp) => {
                    const sOk = subnotaOk(comp)
                    return (
                      <div key={comp.key} className="bg-white/[0.03] rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="EC1" value={comp.nombre} onChange={(e) => updateComp(comp.key, { nombre: e.target.value })}
                            className={`flex-1 min-w-0 px-3 py-2 ${inputBase} border-white/10 focus:border-cyan-300/50 font-bold text-sm uppercase`} />
                          <div className="relative w-24 shrink-0">
                            <input type="number" placeholder="0" min="0" max="100" step="0.01" value={comp.porcentaje} onChange={(e) => updateComp(comp.key, { porcentaje: e.target.value })}
                              className={`w-full pl-3 pr-7 py-2 ${inputBase} border-cyan-300/20 text-center text-cyan-200 font-bold text-sm focus:border-cyan-300/60`} />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-300/60 text-xs font-bold">%</span>
                          </div>
                          <button onClick={() => removeComponente(comp.key)} disabled={componentes.length === 1}
                            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-400/20 text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer" aria-label="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
                          <input type="checkbox" checked={comp.tieneSubnotas} onChange={(e) => toggleSubnotas(comp.key, e.target.checked)} className="accent-cyan-400 w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-slate-400">Tiene subnotas</span>
                        </label>

                        {comp.tieneSubnotas && (
                          <div className="mt-3 pl-3 border-l-2 border-teal-300/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-[1.5px] font-bold text-teal-300/80">Subnotas (suman 100% de {comp.nombre || 'este componente'})</span>
                              <span className={`text-[10px] font-black ${sOk ? 'text-teal-300' : 'text-amber-300'}`}>{round2(subnotaSum(comp))}%{sOk ? ' ✓' : ''}</span>
                            </div>
                            {comp.subNotas.map((sub) => (
                              <div key={sub.key} className="flex items-center gap-2">
                                <input type="text" placeholder="Lab 1" value={sub.nombre} onChange={(e) => updateSubnota(comp.key, sub.key, { nombre: e.target.value })}
                                  className={`flex-1 min-w-0 px-2.5 py-1.5 ${inputBase} bg-black/50 border-white/[0.06] focus:border-teal-300/50 text-xs font-semibold`} />
                                <div className="relative w-20 shrink-0">
                                  <input type="number" placeholder="0" min="0" max="100" step="0.0001" value={sub.porcentaje} onChange={(e) => updateSubnota(comp.key, sub.key, { porcentaje: e.target.value })}
                                    className={`w-full pl-2 pr-6 py-1.5 ${inputBase} bg-black/50 border-teal-300/20 text-center text-teal-100 font-bold text-xs focus:border-teal-300/60`} />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-300/50 text-[10px] font-bold">%</span>
                                </div>
                                <button onClick={() => removeSubnota(comp.key, sub.key)} disabled={comp.subNotas.length === 1}
                                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer text-xs" aria-label="Eliminar subnota">✕</button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 pt-1">
                              <button onClick={() => addSubnota(comp.key)} className="text-[10px] uppercase tracking-[1.5px] font-bold text-teal-300 hover:text-teal-200 transition-colors cursor-pointer">+ Subnota</button>
                              <span className="text-slate-600">·</span>
                              <button onClick={() => repartirSub(comp.key)} className="text-[10px] uppercase tracking-[1.5px] font-bold text-cyan-300/80 hover:text-cyan-200 transition-colors cursor-pointer" title="Reparte 100% en partes iguales">÷ Equitativo</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button onClick={addComponente} className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/15 text-slate-400 hover:text-cyan-200 hover:border-cyan-300/40 transition-all text-[10px] uppercase tracking-[2px] font-bold cursor-pointer">+ Agregar componente</button>
              </div>
            )}

            {/* ===== MODO CANDADO ===== */}
            {candado && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[2px] text-teal-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.9)]"></span>
                    Partes del candado
                  </span>
                  <span className={`text-[11px] font-black ${pesosPartesOk ? 'text-teal-300' : 'text-amber-300'}`}>
                    Pesos: {round2(totalPesoPartes)}% / 100%{pesosPartesOk ? ' ✓' : ''}
                  </span>
                </div>

                {partes.map((parte) => {
                  const pOk = parteCompOk(parte)
                  return (
                    <div key={parte.key} className="bg-white/[0.03] rounded-2xl border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input type="text" placeholder="Teoría" value={parte.nombre} onChange={(e) => updateParte(parte.key, { nombre: e.target.value })}
                          className={`flex-1 min-w-0 px-3 py-2 ${inputBase} border-cyan-300/20 focus:border-cyan-300/50 font-bold text-sm`} />
                        <div className="relative w-24 shrink-0">
                          <input type="number" placeholder="0" min="0" max="100" step="0.01" value={parte.peso} onChange={(e) => updateParte(parte.key, { peso: e.target.value })}
                            className={`w-full pl-3 pr-7 py-2 ${inputBase} border-cyan-300/30 text-center text-cyan-200 font-bold text-sm focus:border-cyan-300/60`} />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-300/60 text-xs font-bold">%</span>
                        </div>
                      </div>

                      <div className="pl-3 border-l-2 border-teal-300/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-[1.5px] font-bold text-teal-300/80">Evaluaciones de {parte.nombre || 'esta parte'} (suman 100%)</span>
                          <span className={`text-[10px] font-black ${pOk ? 'text-teal-300' : 'text-amber-300'}`}>{round2(parteCompSum(parte))}%{pOk ? ' ✓' : ''}</span>
                        </div>
                        {parte.componentes.map((comp) => (
                          <div key={comp.key} className="flex items-center gap-2">
                            <input type="text" placeholder="EP" value={comp.nombre} onChange={(e) => updateParteComp(parte.key, comp.key, { nombre: e.target.value })}
                              className={`flex-1 min-w-0 px-2.5 py-1.5 ${inputBase} bg-black/50 border-white/[0.06] focus:border-teal-300/50 text-xs font-semibold uppercase`} />
                            <div className="relative w-20 shrink-0">
                              <input type="number" placeholder="0" min="0" max="100" step="0.0001" value={comp.porcentaje} onChange={(e) => updateParteComp(parte.key, comp.key, { porcentaje: e.target.value })}
                                className={`w-full pl-2 pr-6 py-1.5 ${inputBase} bg-black/50 border-teal-300/20 text-center text-teal-100 font-bold text-xs focus:border-teal-300/60`} />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-300/50 text-[10px] font-bold">%</span>
                            </div>
                            <button onClick={() => removeParteComp(parte.key, comp.key)} disabled={parte.componentes.length === 1}
                              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer text-xs" aria-label="Eliminar">✕</button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => addParteComp(parte.key)} className="text-[10px] uppercase tracking-[1.5px] font-bold text-teal-300 hover:text-teal-200 transition-colors cursor-pointer">+ Evaluación</button>
                          <span className="text-slate-600">·</span>
                          <button onClick={() => repartirParteComp(parte.key)} className="text-[10px] uppercase tracking-[1.5px] font-bold text-cyan-300/80 hover:text-cyan-200 transition-colors cursor-pointer" title="Reparte 100% en partes iguales">÷ Equitativo</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-400/30 rounded-xl px-4 py-3 text-rose-200 text-xs font-semibold">{error}</div>
            )}
          </div>

          {/* Footer */}
          <div className="relative z-10 px-6 md:px-8 py-4 border-t border-white/[0.08] bg-black/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-h-[40px]">
              {esEdicion && (
                confirmarBorrar ? (
                  <>
                    <span className="text-[10px] text-rose-300 font-black uppercase tracking-wider hidden sm:block">¿Eliminar?</span>
                    <button onClick={handleEliminar} disabled={guardando}
                      className="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-200 hover:bg-rose-500/30 font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer disabled:opacity-40">
                      {guardando ? 'Borrando…' : 'Sí, borrar'}
                    </button>
                    <button onClick={() => setConfirmarBorrar(false)}
                      className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer">
                      No
                    </button>
                  </>
                ) : (
                  <button onClick={() => setConfirmarBorrar(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40 font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer"
                    title="Eliminar curso">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={cerrar} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold text-[11px] uppercase tracking-[2px] transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleGuardar} disabled={!puedeGuardar}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-300 text-[#0a0420] font-black text-[11px] uppercase tracking-[2px] hover:shadow-[0_10px_30px_-10px_rgba(56,189,248,0.8)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
                {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar curso'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
