import { useState, useEffect, useRef } from 'react'
import { useCalculadora } from './logic/useCalculadora'
import { useAuth } from './logic/useAuth'
import { ModalCalculo } from './components/ModalCalculo'
import { SearchHome } from './components/SearchHome'
import { TopBar, MobileNav } from './components/TopBar'
import { CursoFormModal } from './components/CursoFormModal'
import { AdminsModal } from './components/AdminsModal'
import { HistorialModal } from './components/HistorialModal'
import { DonateModal } from './components/DonateModal'
import { SolicitarCursoModal } from './components/SolicitarCursoModal'
import { ToastProvider } from './components/Toast'

export default function App() {
  const {
    busqueda, setBusqueda,
    verMisCursos, setVerMisCursos,
    soloCandado, setSoloCandado,
    filtrados, paginados, paginaActual, setPaginaActual, totalPaginas,
    totalCursos, cargandoCursos, cursos,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    reset, limpiarNotasCurso,
    estados, ciclo,
  } = useCalculadora()

  const auth = useAuth()
  const [formAbierto, setFormAbierto] = useState(false)
  const [cursoEditar, setCursoEditar] = useState(null)
  const [adminsAbierto, setAdminsAbierto] = useState(false)
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [donarAbierto, setDonarAbierto] = useState(false)
  // null = cerrado; { tipo, curso } = abierto (con valores iniciales opcionales)
  const [solicitud, setSolicitud] = useState(null)
  const yaAbrioCompartido = useRef(false)

  const abrirAgregar = () => { setCursoEditar(null); setFormAbierto(true) }
  const abrirEditar = (curso) => { setCursoEditar(curso); setFormAbierto(true) }
  const cerrarForm = () => { setFormAbierto(false); setCursoEditar(null) }

  const irACursos = () => { setVerMisCursos(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const irAMiCiclo = () => {
    setVerMisCursos(true)
    document.getElementById('lista-cursos')?.scrollIntoView({ behavior: 'smooth' })
  }
  const abrirSolicitud = () => setSolicitud({})
  const reportarCurso = (curso) => setSolicitud({ tipo: 'modificar', curso: `${curso.id} ${curso.nombre}` })

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

      <TopBar
        auth={auth}
        verMisCursos={verMisCursos}
        onCursos={irACursos}
        onMiCiclo={irAMiCiclo}
        onSolicitar={abrirSolicitud}
      />

      <SearchHome
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        verMisCursos={verMisCursos}
        setVerMisCursos={setVerMisCursos}
        soloCandado={soloCandado}
        setSoloCandado={setSoloCandado}
        filtrados={filtrados}
        paginados={paginados}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        totalPaginas={totalPaginas}
        totalCursos={totalCursos}
        cargandoCursos={cargandoCursos}
        misCursosIds={misCursosIds}
        toggleFavorito={toggleFavorito}
        estados={estados}
        ciclo={ciclo}
        onCalcular={setCursoSeleccionado}
        onMiCiclo={irAMiCiclo}
        onSolicitar={abrirSolicitud}
        isAdmin={auth.isAdmin}
        onAddCurso={abrirAgregar}
        onEditarCurso={abrirEditar}
        isOwner={auth.isOwner}
        onGestionarAdmins={() => setAdminsAbierto(true)}
        onVerHistorial={() => setHistorialAbierto(true)}
      />

      {/* key: el simulador se reinicia al cambiar de curso */}
      <ModalCalculo
        key={cursoSeleccionado?.id}
        curso={cursoSeleccionado}
        notasGlobales={notasGlobales}
        actualizarNota={actualizarNota}
        limpiarNotasCurso={limpiarNotasCurso}
        esFavorito={!!cursoSeleccionado && misCursosIds.includes(cursoSeleccionado.id)}
        onToggleFav={toggleFavorito}
        onReportar={reportarCurso}
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
        className="fixed bottom-[92px] md:bottom-5 right-4 md:right-5 z-40 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-2xl bg-cyan-300 hover:bg-cyan-200 text-[#0a0420] font-black text-[11px] uppercase tracking-[2px] active:scale-95 transition-colors cursor-pointer"
        aria-label="Donar"
      >
        <span className="text-sm leading-none">♥</span>
        Donar
      </button>

      <DonateModal isOpen={donarAbierto} onClose={() => setDonarAbierto(false)} />

      <MobileNav
        verMisCursos={verMisCursos}
        onCursos={irACursos}
        onMiCiclo={irAMiCiclo}
        onSolicitar={abrirSolicitud}
      />

      {solicitud && (
        <SolicitarCursoModal
          isOpen
          inicial={solicitud}
          onClose={() => setSolicitud(null)}
          cursos={cursos}
        />
      )}
    </div>
    </ToastProvider>
  )
}
