import { useState, useEffect } from 'react'
import cursosData from '../data/cursos.json'

// Carreras actualizadas
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

  // 1. Cargar NOTAS desde LocalStorage al iniciar
  const [notasGlobales, setNotasGlobales] = useState(() => {
    const saved = localStorage.getItem('quantum_notas');
    return saved ? JSON.parse(saved) : {};
  });

  // 2. Cargar MIS CURSOS (Favoritos) desde LocalStorage
  const [misCursosIds, setMisCursosIds] = useState(() => {
    const saved = localStorage.getItem('quantum_favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Efectos para guardar automáticamente cuando algo cambie
  useEffect(() => {
    localStorage.setItem('quantum_notas', JSON.stringify(notasGlobales));
  }, [notasGlobales]);

  useEffect(() => {
    localStorage.setItem('quantum_favoritos', JSON.stringify(misCursosIds));
  }, [misCursosIds]);

  // Lógica de Filtrado Pro
  const filtrados = cursosData.filter(c => {
    const coincideCarrera = c.carrera === carrera;
    const coincideBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const estaEnMisCursos = misCursosIds.includes(c.id);
    
    if (verMisCursos) {
      return estaEnMisCursos && coincideBusqueda;
    }
    return coincideCarrera && coincideBusqueda;
  });

  // Funciones de acción
  const toggleFavorito = (id) => {
    setMisCursosIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const actualizarNota = (cursoId, ev, valor) => {
    setNotasGlobales(prev => ({
      ...prev,
      [cursoId]: { 
        ...(prev[cursoId] || {}), 
        [ev]: valor 
      }
    }));
  };

  const calcularPromedio = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {};
    let acumulado = 0;
    Object.keys(curso.sistema).forEach(ev => {
      const valor = parseFloat(notasDelCurso[ev]) || 0;
      acumulado += valor * curso.sistema[ev];
    });
    setResultado(acumulado.toFixed(2));
  };

  const reset = () => {
    setCursoSeleccionado(null);
    setResultado(null);
  };

  return {
    carreras: LISTA_CARRERAS,
    carrera, setCarrera,
    busqueda, setBusqueda,
    verMisCursos, setVerMisCursos,
    filtrados,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota,
    misCursosIds, toggleFavorito,
    resultado, calcularPromedio,
    reset
  }
}