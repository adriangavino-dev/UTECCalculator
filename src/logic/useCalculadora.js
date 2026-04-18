import { useState, useEffect } from 'react'
import cursosData from '../data/cursos.json'

const LISTA_CARRERAS = [
  "Ciencia de la Computación", 
  "Ciberseguridad", 
  "Ciencia de Datos",
  "Sistemas de Información"
];

export const useCalculadora = () => {
  const [carrera, setCarrera] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [verMisCursos, setVerMisCursos] = useState(false)

  const [notasGlobales, setNotasGlobales] = useState(() => {
    const saved = localStorage.getItem('quantum_notas');
    return saved ? JSON.parse(saved) : {};
  });

  const [misCursosIds, setMisCursosIds] = useState(() => {
    const saved = localStorage.getItem('quantum_favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quantum_notas', JSON.stringify(notasGlobales));
  }, [notasGlobales]);

  useEffect(() => {
    localStorage.setItem('quantum_favoritos', JSON.stringify(misCursosIds));
  }, [misCursosIds]);

const filtrados = cursosData.filter(c => {
  const coincideCarrera = Array.isArray(c.carrera) 
    ? c.carrera.includes(carrera) 
    : c.carrera === carrera;

  const coincideBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
  const estaEnMisCursos = misCursosIds.includes(c.id);
  
  return verMisCursos 
    ? (estaEnMisCursos && coincideBusqueda) 
    : (coincideCarrera && coincideBusqueda);
});

  const toggleFavorito = (id) => {
    setMisCursosIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const actualizarNota = (cursoId, llaveNota, valor) => {
    setNotasGlobales(prev => ({
      ...prev,
      [cursoId]: { ...(prev[cursoId] || {}), [llaveNota]: valor }
    }));
  };
  
const limpiarNotasCurso = (cursoId) => {
  setNotasGlobales(prev => {
    const nuevasNotas = { ...prev };
    nuevasNotas[cursoId] = {}; 
    return nuevasNotas;
  });
};

  const calcularPromedio = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {};
    let totalPromedio = 0;

    Object.keys(curso.sistema).forEach(key => {
      const config = curso.sistema[key];
      
      if (typeof config === 'number') {
        const nota = parseFloat(notasDelCurso[key]) || 0;
        totalPromedio += nota * config;
      } else if (config.subNotas) {
        let acumuladoSub = 0;
        Object.keys(config.subNotas).forEach(subKey => {
          const notaSub = parseFloat(notasDelCurso[`${key}_${subKey}`]) || 0;
          const pesoSub = config.subNotas[subKey];
          acumuladoSub += notaSub * pesoSub;
        });
        totalPromedio += acumuladoSub * config.peso;
      }
    });

    setResultado(totalPromedio.toFixed(2));
  };

  const reset = () => {
    setCursoSeleccionado(null);
    setResultado(null);
  };

  return {
    carreras: LISTA_CARRERAS, carrera, setCarrera,
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    filtrados, cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset, limpiarNotasCurso
  }
}
