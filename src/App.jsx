import { useCalculadora } from './logic/useCalculadora'
import { ModalCalculo } from './components/ModalCalculo'

export default function App() {
  const {
    carreras, carrera, setCarrera,
    busqueda, setBusqueda, filtrados,
    verMisCursos, setVerMisCursos,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset,
    limpiarNotasCurso
  } = useCalculadora()

  return (
    <div className="min-h-screen text-slate-100 font-['Quicksand'] antialiased selection:bg-fuchsia-400/40 selection:text-white">
      <div className="p-5 md:p-10 relative">

        {!carrera ? (
          <div className="max-w-md mx-auto mt-16 md:mt-24 animate-fade-in">
            <div className="relative p-[1.5px] rounded-[40px] bg-gradient-to-br from-cyan-400/60 via-fuchsia-400/40 to-violet-500/60 animate-pulse-glow">
              <div className="relative bg-[#0c0824]/90 backdrop-blur-2xl p-10 rounded-[38px] text-center overflow-hidden">

                <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-fuchsia-500/25 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-violet-500 flex items-center justify-center shadow-[0_0_45px_-5px_rgba(232,121,249,0.7)] animate-float">
                    <span className="text-2xl font-black text-[#0a0420] tracking-tight">CN</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                      Calculadora de Notas
                    </span>
                  </h1>
                  <p className="text-cyan-300/70 mb-10 text-[10px] uppercase tracking-[4px] font-bold">
                    ◢ Selecciona tu carrera ◣
                  </p>

                  <div className="flex flex-col gap-3">
                    {carreras.map((nombre, i) => (
                      <button
                        key={nombre}
                        onClick={() => setCarrera(nombre)}
                        className="group relative w-full overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-slate-100 font-semibold py-4 px-5 rounded-2xl border border-white/10 hover:border-cyan-300/50 transition-all active:scale-[0.98] text-base flex items-center justify-between cursor-pointer"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className="absolute inset-y-0 left-0 w-0 group-hover:w-full bg-gradient-to-r from-cyan-400/15 via-fuchsia-400/10 to-transparent transition-all duration-500"></span>
                        <span className="relative flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] group-hover:bg-fuchsia-300 group-hover:shadow-[0_0_10px_rgba(232,121,249,0.9)] transition-all"></span>
                          {nombre}
                        </span>
                        <span className="relative text-cyan-300 group-hover:text-fuchsia-300 group-hover:translate-x-1 transition-all text-lg">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-500 mt-6 tracking-[3px] uppercase font-bold">
              <span className="text-cyan-400">UTEC</span> · Sistema de Cálculo
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto animate-fade-in">

            <div className="flex items-center justify-between mb-10">
              <button
                onClick={() => setCarrera(null)}
                className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-cyan-300/50 group-hover:-translate-x-0.5 group-hover:shadow-[0_0_15px_-3px_rgba(34,211,238,0.5)] transition-all">←</span>
                <span className="text-[10px] uppercase tracking-[3px] font-bold">Cambiar Carrera</span>
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-violet-500 flex items-center justify-center shadow-[0_0_25px_-5px_rgba(232,121,249,0.7)]">
                <span className="text-sm font-black text-[#0a0420]">CN</span>
              </div>
            </div>

            <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/20 to-violet-500/40 mb-10">
              <div className="bg-[#0c0824]/85 backdrop-blur-xl p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                      Carrera activa
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{carrera}</h2>
                  </div>

                  <div className="inline-flex gap-1 p-1 rounded-2xl bg-black/30 border border-white/[0.06] w-fit">
                    <button
                      onClick={() => setVerMisCursos(false)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                        !verMisCursos
                          ? 'bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-[#0a0420] shadow-[0_0_20px_-5px_rgba(34,211,238,0.7)]'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setVerMisCursos(true)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        verMisCursos
                          ? 'bg-gradient-to-r from-fuchsia-300 to-violet-300 text-[#0a0420] shadow-[0_0_20px_-5px_rgba(232,121,249,0.7)]'
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtrados.length > 0 ? (
                filtrados.map(curso => {
                  const esFavorito = misCursosIds.includes(curso.id);
                  return (
                    <div
                      key={curso.id}
                      className="group relative bg-[#0c0824]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] hover:border-cyan-300/40 transition-all hover:-translate-y-1 hover:shadow-[0_15px_45px_-15px_rgba(34,211,238,0.5)] flex flex-col overflow-hidden"
                    >
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/0 group-hover:bg-fuchsia-500/15 rounded-full blur-3xl transition-all duration-500 pointer-events-none"></div>

                      <button
                        onClick={() => toggleFavorito(curso.id)}
                        className={`absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 cursor-pointer z-10 ${
                          esFavorito
                            ? 'bg-amber-300/15 border-amber-300/40 text-amber-300 shadow-[0_0_15px_-3px_rgba(252,211,77,0.6)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-500 hover:text-amber-300 hover:border-amber-300/30'
                        }`}
                        aria-label={esFavorito ? 'Quitar favorito' : 'Marcar favorito'}
                      >
                        <span className="text-sm">{esFavorito ? '★' : '☆'}</span>
                      </button>

                      <div className="relative mb-6 pr-12">
                        <span className="inline-block text-[9px] font-bold text-cyan-300 uppercase tracking-[2.5px] bg-cyan-300/10 px-2.5 py-1 rounded-md border border-cyan-300/25 shadow-[0_0_15px_-5px_rgba(34,211,238,0.5)]">
                          {curso.id}
                        </span>
                        <h3 className="text-lg font-bold text-slate-100 mt-3 leading-snug group-hover:text-cyan-100 transition-colors">
                          {curso.nombre}
                        </h3>
                      </div>

                      <button
                        onClick={() => setCursoSeleccionado(curso)}
                        className="relative mt-auto w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-[2.5px] hover:bg-gradient-to-r hover:from-cyan-300 hover:to-fuchsia-300 hover:text-[#0a0420] hover:border-transparent hover:shadow-[0_0_25px_-5px_rgba(232,121,249,0.6)] transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
                      >
                        Calcular →
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-20 bg-[#0c0824]/40 rounded-3xl border border-dashed border-white/10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center text-2xl text-cyan-300">
                    {verMisCursos ? '★' : '⌕'}
                  </div>
                  <p className="text-slate-400 font-medium text-sm">
                    {verMisCursos ? 'Aún no has agregado cursos a favoritos.' : 'No se encontraron cursos.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ModalCalculo
        curso={cursoSeleccionado}
        notasGlobales={notasGlobales}
        actualizarNota={actualizarNota}
        limpiarNotasCurso={limpiarNotasCurso}
        resultado={resultado}
        onCalcular={() => calcularPromedio(cursoSeleccionado)}
        onCerrar={reset}
      />
    </div>
  )
}
