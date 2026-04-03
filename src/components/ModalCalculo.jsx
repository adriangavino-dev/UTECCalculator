export const ModalCalculo = ({ curso, notasGlobales, actualizarNota, resultado, onCalcular, onCerrar }) => {
  if (!curso) return null;

  // Obtenemos las notas guardadas de este curso específico
  const notasDelCurso = notasGlobales[curso.id] || {};

  return (
    <div className="fixed inset-0 bg-[#0a0f1e]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#161d31] rounded-[40px] p-6 md:p-10 max-w-sm w-full border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-white tracking-tight">{curso.nombre}</h3>
          <p className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest mt-2">Notas Guardadas</p>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
          {Object.keys(curso.sistema).map(ev => (
            <div key={ev} className="flex items-center justify-between bg-[#070b14]/50 p-4 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm uppercase">{ev}</span>
                <span className="text-cyan-500 text-[10px] font-bold">PESO: {curso.sistema[ev]*100}%</span>
              </div>
              <input 
                type="number" 
                placeholder="0.0"
                value={notasDelCurso[ev] || ""} 
                className="w-20 p-3 bg-[#0a0f1e] border border-white/10 rounded-[15px] text-center font-bold text-xl text-cyan-300 outline-none"
                onChange={(e) => actualizarNota(curso.id, ev, e.target.value)}
              />
            </div>
          ))}
        </div>

        {resultado !== null && (
          <div className="bg-cyan-500 p-5 rounded-[25px] mb-6 text-center">
            <p className="text-[#0a0f1e] text-[10px] font-black uppercase mb-1">Resultado Final</p>
            <p className="text-5xl font-bold text-[#0a0f1e]">{resultado}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={onCalcular} className="w-full bg-white text-[#0a0f1e] font-black py-4 rounded-[22px] hover:bg-cyan-400 transition-all cursor-pointer">
            CALCULAR
          </button>
          <button onClick={onCerrar} className="text-slate-500 font-bold py-2 text-sm hover:text-white transition-colors cursor-pointer">
            CERRAR
          </button>
        </div>
      </div>
    </div>
  )
}