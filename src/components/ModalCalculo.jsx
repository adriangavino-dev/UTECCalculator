import React from 'react'

export const ModalCalculo = ({ curso, notasGlobales, actualizarNota, limpiarNotasCurso, resultado, onCalcular, onCerrar }) => {
  if (!curso) return null;
  const notasDelCurso = notasGlobales[curso.id] || {};

  const getColorResultado = (nota) => {
    const n = parseFloat(nota);
    if (n >= 14) return { grad: 'from-cyan-300 via-emerald-300 to-teal-300', glow: 'rgba(34,211,238,0.6)' };
    if (n >= 11) return { grad: 'from-fuchsia-300 via-violet-300 to-indigo-300', glow: 'rgba(232,121,249,0.6)' };
    return { grad: 'from-rose-400 via-pink-400 to-fuchsia-400', glow: 'rgba(244,114,182,0.6)' };
  };

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="relative w-full max-w-md md:max-w-4xl max-h-[92vh] p-[1.5px] rounded-[34px] bg-gradient-to-br from-cyan-400/60 via-fuchsia-400/40 to-violet-500/60 shadow-[0_25px_80px_-20px_rgba(232,121,249,0.4)]">
        <div className="relative w-full h-full max-h-[calc(92vh-3px)] flex flex-col bg-[#0c0824]/95 backdrop-blur-2xl rounded-[33px] overflow-hidden">

          <div className="absolute -top-32 -right-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-24 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-start justify-between gap-4 px-6 md:px-10 pt-7 pb-5 border-b border-white/[0.08]">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                {curso.id} · Configuración
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-cyan-100 to-fuchsia-100 bg-clip-text text-transparent">
                {curso.nombre}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => limpiarNotasCurso(curso.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 hover:shadow-[0_0_18px_-3px_rgba(244,114,182,0.7)] transition-all active:scale-90 cursor-pointer group"
                title="Limpiar todas las notas"
                aria-label="Limpiar notas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onCerrar}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {Object.keys(curso.sistema).map(key => {
                const config = curso.sistema[key];

                if (typeof config === 'number') {
                  return (
                    <div
                      key={key}
                      className="group flex items-center justify-between gap-4 bg-white/[0.03] hover:bg-white/[0.06] p-5 rounded-2xl border border-white/10 hover:border-cyan-300/40 hover:shadow-[0_0_25px_-10px_rgba(34,211,238,0.5)] transition-all"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-100 text-sm uppercase tracking-[2px] group-hover:text-cyan-100 transition-colors">{key}</span>
                        <span className="text-cyan-300 text-[10px] font-bold tracking-[2px] mt-0.5">PESO {Math.round(config * 100)}%</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        max="20"
                        value={notasDelCurso[key] || ""}
                        className="w-20 p-2.5 bg-black/50 border border-cyan-300/20 rounded-xl text-center font-bold text-lg text-cyan-200 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 focus:shadow-[0_0_15px_-3px_rgba(34,211,238,0.6)] transition-all placeholder:text-slate-700"
                        onChange={(e) => actualizarNota(curso.id, key, e.target.value)}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className="bg-white/[0.03] rounded-2xl p-5 border border-white/10 md:col-span-2 relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-fuchsia-200 text-sm uppercase tracking-[2px] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.9)]"></span>
                          {key}
                        </span>
                        <span className="bg-gradient-to-r from-cyan-300/15 to-fuchsia-300/15 text-fuchsia-200 text-[10px] px-2.5 py-1 rounded-md font-bold border border-fuchsia-300/25 uppercase tracking-[2px]">
                          {Math.round(config.peso * 100)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.keys(config.subNotas).map(subKey => (
                          <div
                            key={subKey}
                            className="flex items-center justify-between gap-3 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/[0.06] hover:border-fuchsia-300/30 transition-colors"
                          >
                            <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider truncate">{subKey}</span>
                            <input
                              type="number"
                              placeholder="0"
                              step="0.1"
                              min="0"
                              max="20"
                              value={notasDelCurso[`${key}_${subKey}`] || ""}
                              className="w-14 p-1.5 bg-black/60 border border-fuchsia-300/20 rounded-lg text-center font-bold text-sm text-fuchsia-100 outline-none focus:border-fuchsia-300/60 focus:shadow-[0_0_12px_-3px_rgba(232,121,249,0.6)] placeholder:text-slate-700 shrink-0"
                              onChange={(e) => actualizarNota(curso.id, `${key}_${subKey}`, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 px-6 md:px-10 py-5 border-t border-white/[0.08] bg-black/20">
            {resultado !== null && (() => {
              const { grad, glow } = getColorResultado(resultado);
              return (
                <div className="mb-4 animate-fade-in">
                  <div
                    className={`relative bg-gradient-to-br ${grad} p-5 rounded-2xl text-center overflow-hidden`}
                    style={{ boxShadow: `0 15px 50px -15px ${glow}` }}
                  >
                    <div className="absolute inset-0 bg-[#0a0420]/15 pointer-events-none"></div>
                    <div className="relative">
                      <p className="text-[#0a0420]/80 text-[10px] font-black uppercase tracking-[3px] mb-1">Promedio Calculado</p>
                      <p className="text-5xl md:text-6xl font-black text-[#0a0420] tracking-tight">{resultado}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onCerrar}
                className="sm:flex-1 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold text-xs uppercase tracking-[2.5px] transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={onCalcular}
                className="relative sm:flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 text-[#0a0420] font-black text-xs uppercase tracking-[2.5px] hover:shadow-[0_10px_40px_-10px_rgba(232,121,249,0.8)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
              >
                ◢ Calcular Promedio ◣
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
