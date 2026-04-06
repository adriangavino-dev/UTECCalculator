import React from 'react'

export const ModalCalculo = ({ curso, notasGlobales, actualizarNota, resultado, onCalcular, onCerrar }) => {
  if (!curso) return null;
  const notasDelCurso = notasGlobales[curso.id] || {};

  return (
    // FONDO DE PANTALLA (OVERLAY) CON DESENFOQUE
    <div className="fixed inset-0 bg-[#070b14]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-500">
      
      {/* TARJETA DEL MODAL CON EFECTO CRISTAL REAL:
        - bg-[#161d31]/40: Bajamos a 40% para que sea MUY transparente.
        - backdrop-blur-3xl: El nivel máximo de desenfoque para que se note el efecto.
        - border-white/10: Un borde sutil que "atrapa" la luz.
      */}
      <div className="bg-[#161d31]/40 backdrop-blur-3xl rounded-[40px] p-6 md:p-10 w-full max-w-md md:max-w-4xl border border-white/10 shadow-[0_0_80px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] relative overflow-hidden">
        
        {/* RESPLANDORES DE COLOR INTERNOS (Para forzar que el cristal brille) */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mb-6 text-center relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{curso.nombre}</h3>
          <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[3px] mt-2 opacity-80">Configuración de Evaluación</p>
        </div>
        
        {/* ÁREA DE NOTAS CON GRID RESPONSIVO */}
        <div className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {Object.keys(curso.sistema).map(key => {
              const config = curso.sistema[key];
              
              // CASO 1: NOTA SIMPLE
              if (typeof config === 'number') {
                return (
                  <div key={key} className="flex items-center justify-between bg-white/5 p-4 md:p-6 rounded-[25px] border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex flex-col">
                      <span className="font-black text-white text-xs md:text-sm uppercase tracking-wider group-hover:text-cyan-300 transition-colors">{key}</span>
                      <span className="text-cyan-500/70 text-[9px] md:text-[10px] font-bold tracking-widest">PESO: {config * 100}%</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.0"
                      value={notasDelCurso[key] || ""} 
                      className="w-20 md:w-24 p-3 bg-[#070b14]/60 border border-white/10 rounded-[18px] text-center font-bold text-xl text-cyan-300 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      onChange={(e) => actualizarNota(curso.id, key, e.target.value)}
                    />
                  </div>
                );
              }

              // CASO 2: NOTA COMPUESTA
              return (
                <div key={key} className="bg-white/5 rounded-[30px] p-5 md:p-7 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <span className="font-black text-cyan-400 text-[11px] md:text-xs uppercase tracking-widest">{key} </span>
                    <span className="bg-cyan-500/5 text-cyan-400/60 text-[9px] px-2 py-1 rounded-md font-bold border border-cyan-500/10 uppercase tracking-tighter">
                      VALOR: {config.peso * 100}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(config.subNotas).map(subKey => (
                      <div key={subKey} className="flex items-center justify-between bg-[#070b14]/40 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase">{subKey}</span>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={notasDelCurso[`${key}_${subKey}`] || ""} 
                          className="w-16 p-2 bg-[#070b14]/60 border border-white/5 rounded-xl text-center font-bold text-sm text-white outline-none focus:border-cyan-500/50"
                          onChange={(e) => actualizarNota(curso.id, `${key}_${subKey}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DE RESULTADO */}
        {resultado !== null && (
          <div className="bg-gradient-to-br from-cyan-500/80 to-blue-600/80 backdrop-blur-xl p-4 md:p-6 rounded-[25px] mb-6 text-center shadow-[0_10px_40px_-10px_rgba(0,173,238,0.4)] mx-auto w-full md:max-w-md transform transition-all duration-300 scale-105 border border-white/10">
            <p className="text-[#0a0f1e] text-[10px] font-black uppercase mb-1 tracking-widest opacity-80">Promedio Calculado</p>
            <p className="text-5xl md:text-6xl font-black text-[#0a0f1e]">{resultado}</p>
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col md:flex-row gap-3 md:justify-center relative z-10">
          <button onClick={onCalcular} className="w-full md:max-w-xs bg-white text-[#0a0f1e] font-black py-4 rounded-[22px] hover:bg-cyan-400 active:scale-95 transition-all shadow-xl cursor-pointer">
            CALCULAR AHORA
          </button>
          <button onClick={onCerrar} className="text-slate-400 font-bold py-2 px-4 text-xs hover:text-white transition-colors cursor-pointer uppercase tracking-[2px]">
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  )
}