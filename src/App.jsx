import { useState } from 'react'
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
    filtrados, totalCursos, cargandoCursos,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset,
    limpiarNotasCurso,
  } = useCalculadora()

  const auth = useAuth()
  const [formAbierto, setFormAbierto] = useState(false)
  const [cursoEditar, setCursoEditar] = useState(null)

  const abrirAgregar = () => { setCursoEditar(null); setFormAbierto(true) }
  const abrirEditar = (curso) => { setCursoEditar(curso); setFormAbierto(true) }
  const cerrarForm = () => { setFormAbierto(false); setCursoEditar(null) }

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
        onCalcular={() => calcularPromedio(cursoSeleccionado)}
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
