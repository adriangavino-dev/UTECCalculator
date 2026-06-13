import { useState, useEffect, useRef } from 'react'
import { useCalculadora } from './logic/useCalculadora'
import { useAuth } from './logic/useAuth'
import { ModalCalculo } from './components/ModalCalculo'
import { SearchHome } from './components/SearchHome'
import { LoginButton } from './components/LoginButton'
import { CursoFormModal } from './components/CursoFormModal'
import { ToastProvider } from './components/Toast'

export default function App() {
  const {
    busqueda, setBusqueda,
    verMisCursos, setVerMisCursos,
    orden, setOrden, soloCandado, setSoloCandado,
    filtrados, totalCursos, cargandoCursos, cursos,
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
  const yaAbrioCompartido = useRef(false)

  const abrirAgregar = () => { setCursoEditar(null); setFormAbierto(true) }
  const abrirEditar = (curso) => { setCursoEditar(curso); setFormAbierto(true) }
  const cerrarForm = () => { setFormAbierto(false); setCursoEditar(null) }

  // Deep-link: ?curso=CS2041 abre ese curso directo
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
        orden={orden}
        setOrden={setOrden}
        soloCandado={soloCandado}
        setSoloCandado={setSoloCandado}
        filtrados={filtrados}
        totalCursos={totalCursos}
        cargandoCursos={cargandoCursos}
        misCursosIds={misCursosIds}
        toggleFavorito={toggleFavorito}
        onCalcular={setCursoSeleccionado}
        isAdmin={auth.isAdmin}
        onAddCurso={abrirAgregar}
        onEditarCurso={abrirEditar}
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
        onClose={cerrarForm}
        onSaved={() => { /* realtime refresca el grid solo */ }}
      />
    </div>
    </ToastProvider>
  )
}
