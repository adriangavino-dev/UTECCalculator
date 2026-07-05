import React from 'react'
import { useToast } from './Toast'

const MIN_APROBATORIO = 10.5

export const ModalCalculo = ({
  curso,
  notasGlobales,
  actualizarNota,
  limpiarNotasCurso,
  resultado,
  necesario,
  onCalcular,
  onCalcularNecesario,
  onCerrar,
}) => {
  const { showToast } = useToast()
  if (!curso) return null
  const notasDelCurso = notasGlobales[curso.id] || {}
  const esCandado = !!(curso.sistema && curso.sistema.candado)

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

  const compartir = async () => {
    const url = `${window.location.origin}/?curso=${encodeURIComponent(curso.id)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link del curso copiado', 'success')
    } catch {
      showToast(url, 'info')
    }
  }

  const textoNecesario = (r) => {
    if (r.completo) return `Ya tienes todas las notas (actual: ${r.notaActual})`
    if (r.yaAprobado) return '¡Ya está aprobado, saques lo que saques en lo que falta!'
    if (!r.posible) return `Necesitarías ${r.necesario} (más de 20) — ya no alcanza para 10.5`
    return `Necesitas ${r.necesario} en promedio en lo que te falta`
  }

  // Renderiza los inputs de un "sistema" simple (componentes número o subNotas)
  const renderSistema = (sistema, prefijo = '') => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {Object.keys(sistema).map((key) => {
        if (key === 'candado' || key === 'partes') return null
        const config = sistema[key]

        if (typeof config === 'number') {
          return (
            <div
              key={key}
              className="group flex items-center justify-between gap-3 md:gap-4 bg-white/[0.03] hover:bg-white/[0.05] p-4 md:p-5 rounded-2xl border border-white/10 hover:border-cyan-300/30 transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-100 text-sm uppercase tracking-[2px] group-hover:text-cyan-100 transition-colors">
                  {key}
                </span>
                <span className="text-cyan-300 text-[10px] font-bold tracking-[2px] mt-0.5">
                  PESO {Math.round(config * 100)}%
                </span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                step="0.1"
                min="0"
                max="20"
                value={notasDelCurso[`${prefijo}${key}`] || ''}
                className="w-20 p-2.5 bg-black/50 border border-cyan-300/20 rounded-xl text-center font-bold text-lg text-cyan-200 outline-none focus:border-cyan-300/60 transition-colors placeholder:text-slate-700"
                onChange={(e) => actualizarNota(curso.id, `${prefijo}${key}`, e.target.value)}
              />
            </div>
          )
        }

        // Evaluación con subnotas; puede permitir nota directa (config.directa)
        const llaveDirecta = `${prefijo}${key}__directa`
        const notaDirecta = config.directa ? (notasDelCurso[llaveDirecta] ?? '') : ''
        const bloqueado = notaDirecta !== ''

        return (
          <div
            key={key}
            className="bg-white/[0.03] rounded-2xl p-4 md:p-5 border border-white/10 md:col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-teal-200 text-sm uppercase tracking-[2px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                {key}
              </span>
              <span className="bg-teal-300/10 text-teal-200 text-[10px] px-2.5 py-1 rounded-md font-bold border border-teal-300/25 uppercase tracking-[2px]">
                {Math.round(config.peso * 100)}%
              </span>
            </div>

            {config.directa && (
              <div
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border mb-3 transition-colors ${
                  bloqueado ? 'bg-teal-300/[0.07] border-teal-300/35' : 'bg-black/40 border-white/[0.08]'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                    Nota completa de {key} <span className="text-slate-500 normal-case tracking-normal font-semibold">(opcional)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {bloqueado
                      ? 'Subnotas bloqueadas — borra esta nota para editarlas'
                      : 'Si ya la sabes, ponla aquí y omite las subnotas'}
                  </span>
                </div>
                <input
                  type="number"
                  placeholder="—"
                  step="0.1"
                  min="0"
                  max="20"
                  value={notaDirecta}
                  className="w-16 p-2 bg-black/60 border border-teal-300/25 rounded-lg text-center font-bold text-base text-teal-100 outline-none focus:border-teal-300/60 transition-colors placeholder:text-slate-700 shrink-0"
                  onChange={(e) => actualizarNota(curso.id, llaveDirecta, e.target.value)}
                />
              </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 transition-opacity ${bloqueado ? 'opacity-40' : ''}`}>
              {Object.keys(config.subNotas).map((subKey) => (
                <div
                  key={subKey}
                  className="flex items-center justify-between gap-3 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/[0.06] hover:border-teal-300/30 transition-colors"
                >
                  <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider truncate">
                    {subKey}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="20"
                    disabled={bloqueado}
                    value={notasDelCurso[`${prefijo}${key}_${subKey}`] || ''}
                    className="w-14 p-1.5 bg-black/60 border border-teal-300/20 rounded-lg text-center font-bold text-sm text-teal-100 outline-none focus:border-teal-300/60 placeholder:text-slate-700 shrink-0 disabled:cursor-not-allowed"
                    onChange={(e) =>
                      actualizarNota(curso.id, `${prefijo}${key}_${subKey}`, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )


  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="relative w-full max-w-md md:max-w-4xl max-h-[90vh] rounded-[28px] md:rounded-[34px] border border-white/10 shadow-2xl shadow-black/50">
        <div className="relative w-full h-full max-h-[calc(90vh-3px)] flex flex-col bg-[#0c0824] rounded-[27px] md:rounded-[33px] overflow-hidden">

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-3 px-5 md:px-10 pt-5 md:pt-7 pb-4 md:pb-5 border-b border-white/[0.08]">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                {curso.id} · Configuración
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-slate-100">
                {curso.nombre}
              </h3>
              {esCandado && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-amber-300/15 border border-amber-300/30 text-amber-200 text-[9px] tracking-[1.5px] font-bold">
                  🔒 Candado
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button
                type="button"
                onClick={compartir}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-cyan-200 hover:border-cyan-300/40 transition-all active:scale-90 cursor-pointer"
                title="Copiar link del curso"
                aria-label="Compartir curso"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => limpiarNotasCurso(curso.id)}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 transition-colors active:scale-90 cursor-pointer group"
                title="Limpiar todas las notas"
                aria-label="Limpiar notas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onCerrar}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-4 md:px-10 py-4 md:py-6">
            {esCandado ? (
              <div className="space-y-6">
                {curso.sistema.partes.map((parte, pIdx) => {
                  const parteRes = resultado?.candado
                    ? resultado.partes.find((p) => p.nombre === parte.nombre)
                    : null
                  return (
                    <div key={pIdx} className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-cyan-100 text-sm uppercase tracking-[2px] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                          {parte.nombre}
                          <span className="text-cyan-300/60 text-[10px]">· {Math.round(pesoDeParte(parte) * 100)}%</span>
                        </span>
                        {parteRes && (
                          <span
                            className={`text-[10px] font-black uppercase tracking-[1.5px] px-2.5 py-1 rounded-md border ${
                              parteRes.aprobada
                                ? 'bg-teal-300/15 text-teal-200 border-teal-300/40'
                                : 'bg-rose-400/15 text-rose-200 border-rose-400/40'
                            }`}
                          >
                            {parteRes.nota} · {parteRes.aprobada ? 'Aprobado' : 'Jalado'} (mín 10.5)
                          </span>
                        )}
                      </div>
                      {renderSistema(parte.sistema, `P${pIdx}_`)}
                    </div>
                  )
                })}
              </div>
            ) : (
              renderSistema(curso.sistema)
            )}
          </div>

          {/* Footer */}
          <div className="relative z-10 px-4 md:px-10 py-4 md:py-5 border-t border-white/[0.08] bg-black/20">
            {resultado !== null && (
              <div className="mb-4 animate-fade-in">
                <div
                  className={`p-5 rounded-2xl text-center ${
                    resultado.aprobado ? 'bg-teal-300' : 'bg-rose-400'
                  }`}
                >
                  <p className="text-[#0a0420]/70 text-[10px] font-black uppercase tracking-[3px] mb-1">
                    Promedio Final · {resultado.aprobado ? 'Aprobado ✓' : 'Desaprobado ✕'}
                  </p>
                  <p className="text-5xl md:text-6xl font-black text-[#0a0420] tracking-tight">
                    {resultado.final}
                  </p>
                  {resultado.candado && !resultado.aprobado && resultado.partes.some((p) => !p.aprobada) && (
                    <p className="text-[#0a0420]/70 text-[10px] font-bold uppercase tracking-[2px] mt-2">
                      🔒 Jalas por candado: una parte no llega a 10.5
                    </p>
                  )}
                </div>
              </div>
            )}

            {necesario !== null && (
              <div className="mb-4 animate-fade-in">
                <div className="relative bg-[#0c0824]/80 border border-sky-300/30 p-4 rounded-2xl">
                  <p className="text-sky-200 text-[10px] font-black uppercase tracking-[3px] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                    ¿Cuánto necesito para aprobar (10.5)?
                  </p>
                  {necesario.candado ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[1.5px]">
                        Cada parte debe llegar a 10.5:
                      </p>
                      {necesario.partes.map((p, i) => (
                        <p key={i} className="text-sm font-semibold text-slate-200">
                          <span className="text-cyan-200 font-bold">{p.nombre}:</span> {textoNecesario(p)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-200">{textoNecesario(necesario)}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onCalcular}
                className="relative w-full py-3.5 rounded-2xl bg-cyan-300 hover:bg-cyan-200 text-[#0a0420] font-black text-xs uppercase tracking-[2.5px] active:scale-[0.98] transition-colors cursor-pointer"
              >
                Calcular Promedio
              </button>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onCalcularNecesario}
                  className="flex-1 py-3 rounded-2xl bg-sky-300/10 border border-sky-300/30 text-sky-200 hover:bg-sky-300/20 hover:border-sky-300/50 font-bold text-[11px] uppercase tracking-[1.5px] transition-all cursor-pointer"
                >
                  ¿Cuánto necesito?
                </button>
                <button
                  type="button"
                  onClick={onCerrar}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold text-[11px] uppercase tracking-[2px] transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
