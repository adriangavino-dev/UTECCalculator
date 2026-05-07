import { useCalculadora } from './logic/useCalculadora'
import { ModalCalculo } from './components/ModalCalculo'
import { WelcomePicker } from './components/WelcomePicker'
import { AppShell } from './components/AppShell'
import { CourseGrid } from './components/CourseGrid'

export default function App() {
  const {
    carreras, carrera, setCarrera,
    busqueda, setBusqueda, filtrados,
    verMisCursos, setVerMisCursos,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset,
    limpiarNotasCurso,
  } = useCalculadora()

  return (
    <div className="min-h-screen text-slate-100 font-['Quicksand'] antialiased selection:bg-teal-400/40 selection:text-white">
      <div className="p-5 md:p-10 relative">

        {!carrera ? (
          <WelcomePicker carreras={carreras} onPick={setCarrera} />
        ) : (
          <AppShell
            carrera={carrera}
            onBack={() => setCarrera(null)}
            verMisCursos={verMisCursos}
            setVerMisCursos={setVerMisCursos}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
          >
            <CourseGrid
              cursos={filtrados}
              misCursosIds={misCursosIds}
              onCalcular={setCursoSeleccionado}
              onToggleFav={toggleFavorito}
              verMisCursos={verMisCursos}
            />
          </AppShell>
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
