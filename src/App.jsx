<<<<<<< HEAD
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
    resultado, calcularPromedio, reset 
  } = useCalculadora()

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-['Quicksand'] antialiased selection:bg-cyan-500/30">
      <div className="p-5 md:p-10">
        
        {!carrera ? (
          /* --- PANTALLA DE INICIO CON LOGO --- */
          <div className="max-w-md mx-auto bg-[#161d31] p-10 rounded-[40px] text-center mt-20 border border-white/5 shadow-[0_0_50px_-15px_rgba(0,173,238,0.3)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl"></div>
            
            {/* EL LOGO "Q" */}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_30px_rgba(0,173,238,0.5)]">
              <span className="text-4xl font-bold text-white">CN</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Calculadora de Notas</h1>
            <p className="text-slate-400 mb-12 text-xs uppercase tracking-[3px]">Selecciona tu carrera</p>
            
            <div className="flex flex-col gap-4">
              {carreras.map(nombre => (
                <button 
                  key={nombre} 
                  onClick={() => setCarrera(nombre)} 
                  className="w-full bg-white text-[#0a0f1e] font-black py-4 rounded-[22px] hover:bg-cyan-400 transition-all shadow-xl active:scale-95 text-lg cursor-pointer"
                >
                  {nombre}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* --- PANEL DE CURSOS CON LOGO PEQUEÑO --- */
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setCarrera(null)} className="text-cyan-400 font-bold flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-xs uppercase tracking-widest">Cambiar Carrera</span>
              </button>
              
              {/* Logo pequeño en la esquina superior derecha */}
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold">CN</span>
              </div>
            </div>
            
            <div className="bg-[#161d31]/80 backdrop-blur-md p-6 md:p-8 rounded-[35px] mb-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold tracking-tight">{carrera}</h2>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setVerMisCursos(false)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!verMisCursos ? 'bg-cyan-500 text-[#0a0f1e]' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setVerMisCursos(true)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${verMisCursos ? 'bg-cyan-500 text-[#0a0f1e]' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                  >
                    Mis Cursos
                  </button>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Filtrar por nombre..." 
                className="w-full md:w-80 p-4 rounded-[22px] bg-[#070b14] border border-white/10 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrados.length > 0 ? (
                filtrados.map(curso => (
                  <div key={curso.id} className="bg-[#161d31] p-8 rounded-[35px] border border-white/5 flex flex-col justify-between relative group hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
                    {/* BOTÓN FAVORITO */}
                    <button 
                      onClick={() => toggleFavorito(curso.id)}
                      className={`absolute top-6 right-6 text-xl transition-all active:scale-150 cursor-pointer ${misCursosIds.includes(curso.id) ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-100'}`}
                    >
                      {misCursosIds.includes(curso.id) ? '⭐' : '☆'}
                    </button>

                    <div className="mb-8">
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {curso.id}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-4 leading-tight group-hover:text-cyan-300 transition-colors">
                        {curso.nombre}
                      </h3>
                    </div>
                    
                    <button 
                      onClick={() => setCursoSeleccionado(curso)}
                      className="w-full bg-white/5 text-white font-bold py-4 rounded-[20px] border border-white/10 hover:bg-white hover:text-[#0a0f1e] transition-all cursor-pointer active:scale-95"
                    >
                      CALCULAR
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-[#161d31]/40 rounded-[40px] border border-white/5 border-dashed">
                  <p className="text-slate-600 font-medium italic">
                    {verMisCursos ? "Aún no has agregado cursos a favoritos." : "No se encontraron cursos."}
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
        resultado={resultado}
        onCalcular={() => calcularPromedio(cursoSeleccionado)}
        onCerrar={reset}
      />
    </div>
  )
}
=======
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
    <div className="min-h-screen bg-[#070b14] text-white font-['Quicksand'] antialiased selection:bg-cyan-500/30">
      <div className="p-5 md:p-10">
        
        {!carrera ? (
          /* --- PANTALLA DE INICIO CON LOGO --- */
          <div className="max-w-md mx-auto bg-[#161d31] p-10 rounded-[40px] text-center mt-20 border border-white/5 shadow-[0_0_50px_-15px_rgba(0,173,238,0.3)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl"></div>
            
            {/* EL LOGO "Q" */}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_30px_rgba(0,173,238,0.5)]">
              <span className="text-4xl font-bold text-white">CN</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Calculadora de Notas</h1>
            <p className="text-slate-400 mb-12 text-xs uppercase tracking-[3px]">Selecciona tu carrera</p>
            
            <div className="flex flex-col gap-4">
              {carreras.map(nombre => (
                <button 
                  key={nombre} 
                  onClick={() => setCarrera(nombre)} 
                  className="w-full bg-white text-[#0a0f1e] font-black py-4 rounded-[22px] hover:bg-cyan-400 transition-all shadow-xl active:scale-95 text-lg cursor-pointer"
                >
                  {nombre}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* --- PANEL DE CURSOS CON LOGO PEQUEÑO --- */
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setCarrera(null)} className="text-cyan-400 font-bold flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-xs uppercase tracking-widest">Cambiar Carrera</span>
              </button>
              
              {/* Logo pequeño en la esquina superior derecha */}
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold">CN</span>
              </div>
            </div>
            
            <div className="bg-[#161d31]/80 backdrop-blur-md p-6 md:p-8 rounded-[35px] mb-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold tracking-tight">{carrera}</h2>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setVerMisCursos(false)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!verMisCursos ? 'bg-cyan-500 text-[#0a0f1e]' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setVerMisCursos(true)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${verMisCursos ? 'bg-cyan-500 text-[#0a0f1e]' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                  >
                    Mis Cursos
                  </button>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Filtrar por nombre..." 
                className="w-full md:w-80 p-4 rounded-[22px] bg-[#070b14] border border-white/10 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrados.length > 0 ? (
                filtrados.map(curso => (
                  <div key={curso.id} className="bg-[#161d31] p-8 rounded-[35px] border border-white/5 flex flex-col justify-between relative group hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
                    {/* BOTÓN FAVORITO */}
                    <button 
                      onClick={() => toggleFavorito(curso.id)}
                      className={`absolute top-6 right-6 text-xl transition-all active:scale-150 cursor-pointer ${misCursosIds.includes(curso.id) ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-100'}`}
                    >
                      {misCursosIds.includes(curso.id) ? '⭐' : '☆'}
                    </button>

                    <div className="mb-8">
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {curso.id}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-4 leading-tight group-hover:text-cyan-300 transition-colors">
                        {curso.nombre}
                      </h3>
                    </div>
                    
                    <button 
                      onClick={() => setCursoSeleccionado(curso)}
                      className="w-full bg-white/5 text-white font-bold py-4 rounded-[20px] border border-white/10 hover:bg-white hover:text-[#0a0f1e] transition-all cursor-pointer active:scale-95"
                    >
                      CALCULAR
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-[#161d31]/40 rounded-[40px] border border-white/5 border-dashed">
                  <p className="text-slate-600 font-medium italic">
                    {verMisCursos ? "Aún no has agregado cursos a favoritos." : "No se encontraron cursos."}
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
>>>>>>> 0b29bea426e57a78137196ebb15dbac6e4fe04b8
