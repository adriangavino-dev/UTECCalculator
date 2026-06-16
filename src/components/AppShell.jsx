export const AppShell = ({
  carrera,
  onBack,
  verMisCursos,
  setVerMisCursos,
  busqueda,
  setBusqueda,
  children,
}) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pt-12 md:pt-4">

      <div className="flex items-center justify-between mb-10">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-cyan-300/50 group-hover:-translate-x-0.5 group-hover:shadow-[0_0_15px_-3px_rgba(34,211,238,0.5)] transition-all">←</span>
          <span className="text-[10px] uppercase tracking-[3px] font-bold">Cambiar Carrera</span>
        </button>
      </div>

      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-400/40 via-teal-400/20 to-sky-500/40 mb-10">
        <div className="bg-[#0c0824]/85 backdrop-blur-xl p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                Carrera activa
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {carrera}
              </h2>
            </div>

            <div className="inline-flex gap-1 p-1 rounded-2xl bg-black/30 border border-white/[0.06] w-fit">
              <button
                type="button"
                onClick={() => setVerMisCursos(false)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                  !verMisCursos
                    ? 'bg-gradient-to-r from-cyan-300 to-teal-300 text-[#0a0420] shadow-[0_0_20px_-5px_rgba(34,211,238,0.7)]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setVerMisCursos(true)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all flex items-center gap-1.5 cursor-pointer ${
                  verMisCursos
                    ? 'bg-gradient-to-r from-teal-300 to-sky-300 text-[#0a0420] shadow-[0_0_20px_-5px_rgba(20,184,166,0.7)]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>★</span> Favoritos
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 text-sm">⌕</span>
            <input
              type="text"
              placeholder="Filtrar por nombre…"
              value={busqueda}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 focus:shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)] transition-all font-medium text-sm"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
