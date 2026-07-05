import { useState, useEffect } from 'react'
import { useCursoAdmin } from '../logic/useCursoAdmin'
import { useToast } from './Toast'
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

const uid = () => (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
const nuevaSubnota = () => ({ key: uid(), nombre: '', porcentaje: '' })
const nuevoComponente = () => ({ key: uid(), nombre: '', porcentaje: '', tieneSubnotas: false, subNotas: [], permiteDirecta: false })
const nuevaParte = (nombre) => ({ key: uid(), nombre, componentes: [nuevoComponente()] })

const EPSILON = 0.01
const sumaPct = (arr) => arr.reduce((acc, x) => acc + (parseFloat(x.porcentaje) || 0), 0)
const round2 = (n) => Math.round(n * 100) / 100
const pesoAPct = (p) => String(Math.round((p * 100 + Number.EPSILON) * 10000) / 10000)
const inputBase = 'rounded-lg bg-black/40 border text-slate-100 placeholder:text-slate-600 outline-none transition-all'

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

// Helpers puros sobre un array de componentes
const compAdd = (arr) => [...arr, nuevoComponente()]
const compRemove = (arr, key) => arr.filter((c) => c.key !== key)
const compUpdate = (arr, key, ch) => arr.map((c) => (c.key === key ? { ...c, ...ch } : c))
const compToggleSub = (arr, key, v) => compUpdate(arr, key, { tieneSubnotas: v, subNotas: v ? [nuevaSubnota()] : [], ...(v ? {} : { permiteDirecta: false }) })
const subAdd = (arr, ck) => arr.map((c) => (c.key === ck ? { ...c, subNotas: [...c.subNotas, nuevaSubnota()] } : c))
const subUpdate = (arr, ck, sk, ch) => arr.map((c) => (c.key === ck ? { ...c, subNotas: c.subNotas.map((s) => (s.key === sk ? { ...s, ...ch } : s)) } : c))
const subRemove = (arr, ck, sk) => arr.map((c) => (c.key === ck ? { ...c, subNotas: c.subNotas.filter((s) => s.key !== sk) } : c))
const subRepartir = (arr, ck) => arr.map((c) => (c.key === ck ? { ...c, subNotas: repartir(c.subNotas) } : c))
const subReorder = (arr, ck, from, to) => arr.map((c) => (c.key === ck ? { ...c, subNotas: arrayMove(c.subNotas, from, to) } : c))

const subnotaSumArr = (comp) => sumaPct(comp.subNotas)
const subnotaOkComp = (comp) => !comp.tieneSubnotas || Math.abs(subnotaSumArr(comp) - 100) < EPSILON
const nombresOkArr = (arr) =>
  arr.length > 0 && arr.every((c) => c.nombre.trim() && c.porcentaje !== '' &&
    (!c.tieneSubnotas || (c.subNotas.length > 0 && c.subNotas.every((s) => s.nombre.trim() && s.porcentaje !== ''))))

const IconoBorrar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const IconoGrip = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="3" r="1.3" /><circle cx="11" cy="3" r="1.3" />
    <circle cx="5" cy="8" r="1.3" /><circle cx="11" cy="8" r="1.3" />
    <circle cx="5" cy="13" r="1.3" /><circle cx="11" cy="13" r="1.3" />
  </svg>
)

// Fila de subnota arrastrable (drag por el grip ⠿)
const SortableSub = ({ sub, comp, componentes, update }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.key })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className="shrink-0 w-6 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-cyan-200 hover:bg-white/[0.06] cursor-grab active:cursor-grabbing transition-colors"
        aria-label="Arrastrar para reordenar"
        title="Arrastra para reordenar"
      >
        <IconoGrip />
      </button>
      <input type="text" placeholder="Tests" value={sub.nombre} onChange={(e) => update(subUpdate(componentes, comp.key, sub.key, { nombre: e.target.value }))}
        className={`flex-1 min-w-0 px-2.5 py-1.5 ${inputBase} bg-black/50 border-white/[0.06] focus:border-teal-300/50 text-xs font-semibold`} />
      <div className="relative w-20 shrink-0">
        <input type="number" placeholder="0" min="0" max="100" step="0.0001" value={sub.porcentaje} onChange={(e) => update(subUpdate(componentes, comp.key, sub.key, { porcentaje: e.target.value }))}
          className={`w-full pl-2 pr-6 py-1.5 ${inputBase} bg-black/50 border-teal-300/20 text-center text-teal-100 font-bold text-xs focus:border-teal-300/60`} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-300/50 text-[10px] font-bold">%</span>
      </div>
      <button onClick={() => update(subRemove(componentes, comp.key, sub.key))} disabled={comp.subNotas.length === 1}
        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer text-xs" aria-label="Eliminar subnota">✕</button>
    </div>
  )
}

// Editor reusable de una lista de componentes (con subnotas arrastrables)
const ListaComponentes = ({ componentes, update, nombreItem = 'componente' }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEndSub = (comp) => (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = comp.subNotas.findIndex((s) => s.key === active.id)
    const to = comp.subNotas.findIndex((s) => s.key === over.id)
    if (from === -1 || to === -1) return
    update(subReorder(componentes, comp.key, from, to))
  }

  return (
    <div className="space-y-3">
      {componentes.map((comp) => {
        const sOk = subnotaOkComp(comp)
        return (
          <div key={comp.key} className="bg-white/[0.03] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2">
              <input type="text" placeholder="EC1" value={comp.nombre}
                onChange={(e) => update(compUpdate(componentes, comp.key, { nombre: e.target.value }))}
                className={`flex-1 min-w-0 px-3 py-2 ${inputBase} border-white/10 focus:border-cyan-300/50 font-bold text-sm uppercase`} />
              <div className="relative w-24 shrink-0">
                <input type="number" placeholder="0" min="0" max="100" step="0.01" value={comp.porcentaje}
                  onChange={(e) => update(compUpdate(componentes, comp.key, { porcentaje: e.target.value }))}
                  className={`w-full pl-3 pr-7 py-2 ${inputBase} border-cyan-300/20 text-center text-cyan-200 font-bold text-sm focus:border-cyan-300/60`} />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-300/60 text-xs font-bold">%</span>
              </div>
              <button onClick={() => update(compRemove(componentes, comp.key))} disabled={componentes.length === 1}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-400/20 text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer" aria-label="Eliminar">
                <IconoBorrar />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" checked={comp.tieneSubnotas} onChange={(e) => update(compToggleSub(componentes, comp.key, e.target.checked))} className="accent-cyan-400 w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-slate-400">Tiene subnotas</span>
              </label>
              {comp.tieneSubnotas && (
                <label className="flex items-center gap-2 cursor-pointer w-fit" title="Muestra un cuadro opcional para ingresar la nota completa de esta evaluación sin llenar las subnotas">
                  <input type="checkbox" checked={!!comp.permiteDirecta} onChange={(e) => update(compUpdate(componentes, comp.key, { permiteDirecta: e.target.checked }))} className="accent-teal-400 w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-teal-300/80">Permitir nota completa</span>
                </label>
              )}
            </div>

            {comp.tieneSubnotas && (
              <div className="mt-3 pl-3 border-l-2 border-teal-300/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[1.5px] font-bold text-teal-300/80">Subnotas (suman 100% de {comp.nombre || 'este'}) · arrastra ⠿</span>
                  <span className={`text-[10px] font-black ${sOk ? 'text-teal-300' : 'text-amber-300'}`}>{round2(subnotaSumArr(comp))}%{sOk ? ' ✓' : ''}</span>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={onDragEndSub(comp)}
                >
                  <SortableContext items={comp.subNotas.map((s) => s.key)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {comp.subNotas.map((sub) => (
                        <SortableSub key={sub.key} sub={sub} comp={comp} componentes={componentes} update={update} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => update(subAdd(componentes, comp.key))} className="text-[10px] uppercase tracking-[1.5px] font-bold text-teal-300 hover:text-teal-200 transition-colors cursor-pointer">+ Subnota</button>
                  <span className="text-slate-600">·</span>
                  <button onClick={() => update(subRepartir(componentes, comp.key))} className="text-[10px] uppercase tracking-[1.5px] font-bold text-cyan-300/80 hover:text-cyan-200 transition-colors cursor-pointer" title="Reparte 100% en partes iguales">÷ Equitativo</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <button onClick={() => update(compAdd(componentes))} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-slate-400 hover:text-cyan-200 hover:border-cyan-300/40 transition-all text-[10px] uppercase tracking-[2px] font-bold cursor-pointer">+ Agregar {nombreItem}</button>
    </div>
  )
}

export const CursoFormModal = ({ isOpen, onClose, onSaved, cursoEditar, cursosExistentes = [] }) => {
  const { agregarCurso, editarCurso, eliminarCurso, guardando, error, setError } = useCursoAdmin()
  const { showToast } = useToast()

  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [candado, setCandado] = useState(false)
  const [componentes, setComponentes] = useState([nuevoComponente()])
  const [partes, setPartes] = useState([nuevaParte('Teoría'), nuevaParte('Laboratorio')])
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)

  const esEdicion = !!cursoEditar

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
        setPartes(sis.partes.map((parte) => {
          const factor = parte.peso !== undefined ? parte.peso : 1 // compat modelo viejo
          const comps = Object.entries(parte.sistema).map(([nom, cfg]) => {
            if (typeof cfg === 'number') {
              return { key: uid(), nombre: nom, porcentaje: pesoAPct(cfg * factor), tieneSubnotas: false, subNotas: [] }
            }
            return {
              key: uid(), nombre: nom, porcentaje: pesoAPct(cfg.peso * factor), tieneSubnotas: true,
              subNotas: Object.entries(cfg.subNotas).map(([sn, sp]) => ({ key: uid(), nombre: sn, porcentaje: pesoAPct(sp) })),
              permiteDirecta: !!cfg.directa,
            }
          })
          return { key: uid(), nombre: parte.nombre, componentes: comps }
        }))
        setComponentes([nuevoComponente()])
      } else {
        setCandado(false)
        setComponentes(Object.entries(sis).filter(([k]) => k !== 'candado' && k !== 'partes').map(([nom, cfg]) => {
          if (typeof cfg === 'number') return { key: uid(), nombre: nom, porcentaje: pesoAPct(cfg), tieneSubnotas: false, subNotas: [] }
          return {
            key: uid(), nombre: nom, porcentaje: pesoAPct(cfg.peso), tieneSubnotas: true,
            subNotas: Object.entries(cfg.subNotas).map(([sn, sp]) => ({ key: uid(), nombre: sn, porcentaje: pesoAPct(sp) })),
            permiteDirecta: !!cfg.directa,
          }
        }))
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

  const setComponentesParte = (parteKey, nuevoArr) =>
    setPartes((prev) => prev.map((p) => (p.key === parteKey ? { ...p, componentes: nuevoArr } : p)))
  const updateParteNombre = (parteKey, nombreNuevo) =>
    setPartes((prev) => prev.map((p) => (p.key === parteKey ? { ...p, nombre: nombreNuevo } : p)))

  // Validación
  const totalNormal = sumaPct(componentes)
  const normalOk = Math.abs(totalNormal - 100) < EPSILON
  const puedeGuardarSimple = normalOk && componentes.every(subnotaOkComp) && nombresOkArr(componentes) && id.trim() && nombre.trim()

  const pesoParte = (parte) => sumaPct(parte.componentes)
  const totalCandado = partes.reduce((acc, p) => acc + pesoParte(p), 0)
  const candadoTotalOk = Math.abs(totalCandado - 100) < EPSILON
  const subnotasCandadoOk = partes.every((p) => p.componentes.every(subnotaOkComp))
  const candadoNombresOk = id.trim() && nombre.trim() && partes.every((p) => p.nombre.trim() && nombresOkArr(p.componentes))
  const puedeGuardarCandado = candadoTotalOk && subnotasCandadoOk && candadoNombresOk

  const puedeGuardar = (candado ? puedeGuardarCandado : puedeGuardarSimple) && !guardando

  const handleGuardar = async () => {
    if (!puedeGuardar) return

    // Nombre único (chequeo en cliente, sin distinguir mayúsculas/espacios)
    const nombreNorm = nombre.trim().toLowerCase()
    const duplicado = cursosExistentes.some(
      (c) => c.nombre.trim().toLowerCase() === nombreNorm && c.id !== (cursoEditar?.id)
    )
    if (duplicado) {
      showToast('Ya existe un curso con ese nombre', 'error')
      return
    }

    const payload = { id, nombre, candado, componentes, partes }
    const res = esEdicion ? await editarCurso(cursoEditar.id, payload) : await agregarCurso(payload)
    if (res.ok) {
      showToast(esEdicion ? 'Cambios guardados' : `Curso ${id.trim()} agregado`, 'success')
      onSaved?.(res.curso); onClose()
    } else {
      showToast(res.message || 'Ocurrió un error', 'error')
    }
  }

  const handleEliminar = async () => {
    const res = await eliminarCurso(cursoEditar.id)
    if (res.ok) { showToast(`Curso ${cursoEditar.id} eliminado`, 'info'); setConfirmarBorrar(false); onClose() }
    else showToast(res.message || 'No se pudo eliminar', 'error')
  }

  return (
    <div className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) cerrar() }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[34px] border border-white/10 shadow-2xl shadow-black/50">
        <div className="relative w-full h-full max-h-[calc(92vh-3px)] flex flex-col bg-[#0c0824] rounded-[33px] overflow-hidden">

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                {esEdicion ? 'Editar curso' : 'Nuevo curso'}
              </p>
              <h3 className="text-xl font-bold tracking-tight text-slate-100">
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
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${candado ? 'bg-cyan-300' : 'bg-white/10'}`} aria-label="Activar candado">
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${candado ? 'left-[26px]' : 'left-0.5'}`}></span>
              </button>
            </div>

            {/* MODO NORMAL */}
            {!candado && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[2px] text-teal-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                    Sistema de evaluación
                  </span>
                  <span className={`text-[11px] font-black ${normalOk ? 'text-teal-300' : 'text-amber-300'}`}>
                    Total: {round2(totalNormal)}% / 100%{normalOk ? ' ✓' : ''}
                  </span>
                </div>
                <ListaComponentes componentes={componentes} update={setComponentes} nombreItem="componente" />
              </div>
            )}

            {/* MODO CANDADO (modelo A: % sobre el total) */}
            {candado && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[2px] text-teal-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                    Partes (los % son sobre el total del curso)
                  </span>
                  <span className={`text-[11px] font-black ${candadoTotalOk ? 'text-teal-300' : 'text-amber-300'}`}>
                    Total: {round2(totalCandado)}% / 100%{candadoTotalOk ? ' ✓' : ''}
                  </span>
                </div>

                {partes.map((parte) => (
                  <div key={parte.key} className="bg-white/[0.02] rounded-2xl border border-cyan-300/20 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <input type="text" placeholder="Teoría" value={parte.nombre} onChange={(e) => updateParteNombre(parte.key, e.target.value)}
                        className={`flex-1 min-w-0 px-3 py-2 ${inputBase} border-cyan-300/30 focus:border-cyan-300/60 font-bold text-sm`} />
                      <span className="shrink-0 text-[10px] uppercase tracking-[1.5px] font-black text-cyan-200 bg-cyan-300/10 border border-cyan-300/30 px-3 py-2 rounded-lg">
                        Peso {round2(pesoParte(parte))}%
                      </span>
                    </div>
                    <ListaComponentes
                      componentes={parte.componentes}
                      update={(arr) => setComponentesParte(parte.key, arr)}
                      nombreItem="evaluación"
                    />
                  </div>
                ))}
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
                      className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer">No</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmarBorrar(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40 font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer" title="Eliminar curso">
                    <IconoBorrar /> Eliminar
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={cerrar} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold text-[11px] uppercase tracking-[2px] transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleGuardar} disabled={!puedeGuardar}
                className="px-6 py-2.5 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-[#0a0420] font-black text-[11px] uppercase tracking-[2px] active:scale-[0.98] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar curso'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
