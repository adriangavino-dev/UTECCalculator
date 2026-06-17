import { useState, useEffect, useRef } from 'react'
import { useCalculadora } from './logic/useCalculadora'
import { useAuth } from './logic/useAuth'
import { ModalCalculo } from './components/ModalCalculo'
import { SearchHome } from './components/SearchHome'
import { LoginButton } from './components/LoginButton'
import { CursoFormModal } from './components/CursoFormModal'
import { AdminsModal } from './components/AdminsModal'
import { HistorialModal } from './components/HistorialModal'
import { DonateModal } from './components/DonateModal'
import { ToastProvider } from './components/Toast'

export default function App() {
  const {
    busqueda, setBusqueda,
    verMisCursos, setVerMisCursos,
    soloCandado, setSoloCandado,
    cicloFiltro, setCicloFiltro, ciclosDisponibles,
    filtrados, paginados, paginaActual, setPaginaActual, totalPaginas,
    totalCursos, cargandoCursos, cursos,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset,
    necesario, calcularNecesario,
    limpiarNotasCurso,
  } = useCalculadora()

  const auth = useAuth()
  const [formAbierto, setFormAbierto] = useState(false)
  const [cursoEditar, setCursoEditar] = useState(null)
  const [adminsAbierto, setAdminsAbierto] = useState(false)
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [donarAbierto, setDonarAbierto] = useState(false)
  const yaAbrioCompartido = useRef(false)

  const abrirAgregar = () => { setCursoEditar(null); setFormAbierto(true) }
  const abrirEditar = (curso) => { setCursoEditar(curso); setFormAbierto(true) }
  const cerrarForm = () => { setFormAbierto(false); setCursoEditar(null) }

  useEffect(() => {
    if (cargandoCursos || yaAbrioCompartido.current) return
    const params = new URLSearchParams(window.location.search)
    const cursoId = params.get('curso')
    if (cursoId) {
      const found = cursos.find((c) => c.id.toLowerCase() === cursoId.toLowerCase())
      if (found) {
        setCursoSeleccionado(found)
        yaAbrioCompartido.current = true
      }
    }
  }, [cargandoCursos, cursos, setCursoSeleccionado])

  return (
    <ToastProvider>
    <div className="min-h-screen text-slate-100 font-['Quicksand'] antialiased selection:bg-teal-400/40 selection:text-white">

      <div className="fixed top-5 right-5 z-50">
        <LoginButton {...auth} />
      </div>

      <SearchHome
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        verMisCursos={verMisCursos}
        setVerMisCursos={setVerMisCursos}
        soloCandado={soloCandado}
        setSoloCandado={setSoloCandado}
        cicloFiltro={cicloFiltro}
        setCicloFiltro={setCicloFiltro}
        ciclosDisponibles={ciclosDisponibles}
        filtrados={filtrados}
        paginados={paginados}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        totalPaginas={totalPaginas}
        totalCursos={totalCursos}
        cargandoCursos={cargandoCursos}
        misCursosIds={misCursosIds}
        toggleFavorito={toggleFavorito}
        onCalcular={setCursoSeleccionado}
        isAdmin={auth.isAdmin}
        onAddCurso={abrirAgregar}
        onEditarCurso={abrirEditar}
        isOwner={auth.isOwner}
        onGestionarAdmins={() => setAdminsAbierto(true)}
        onVerHistorial={() => setHistorialAbierto(true)}
      />

      <ModalCalculo
        curso={cursoSeleccionado}
        notasGlobales={notasGlobales}
        actualizarNota={actualizarNota}
        limpiarNotasCurso={limpiarNotasCurso}
        resultado={resultado}
        necesario={necesario}
        onCalcular={() => calcularPromedio(cursoSeleccionado)}
        onCalcularNecesario={() => calcularNecesario(cursoSeleccionado)}
        onCerrar={reset}
      />

      <CursoFormModal
        isOpen={formAbierto}
        cursoEditar={cursoEditar}
        cursosExistentes={cursos}
        onClose={cerrarForm}
        onSaved={() => {}}
      />

      <AdminsModal isOpen={adminsAbierto} onClose={() => setAdminsAbierto(false)} />
      <HistorialModal isOpen={historialAbierto} onClose={() => setHistorialAbierto(false)} />

      {/* Botón flotante de donación */}
      <button
        onClick={() => setDonarAbierto(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-300 text-[#0a0420] font-black text-[11px] uppercase tracking-[2px] shadow-[0_10px_35px_-8px_rgba(56,189,248,0.7)] hover:shadow-[0_12px_45px_-8px_rgba(56,189,248,0.9)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
        aria-label="Donar"
      >
        <span className="text-sm leading-none">♥</span>
        Donar
      </button>

      <DonateModal isOpen={donarAbierto} onClose={() => setDonarAbierto(false)} />
    </div>
    </ToastProvider>
  )
}
