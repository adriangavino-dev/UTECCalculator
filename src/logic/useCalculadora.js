import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MIN_APROBATORIO = 10.5

export const useCalculadora = () => {
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [verMisCursos, setVerMisCursos] = useState(false)

  const [cursos, setCursos] = useState([])
  const [cargandoCursos, setCargandoCursos] = useState(true)

  const [notasGlobales, setNotasGlobales] = useState(() => {
    const saved = localStorage.getItem('quantum_notas');
    return saved ? JSON.parse(saved) : {};
  });

  const [misCursosIds, setMisCursosIds] = useState(() => {
    const saved = localStorage.getItem('quantum_favoritos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    let active = true

    const fetchCursos = async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('id')

      if (active) {
        if (!error && data) setCursos(data)
        setCargandoCursos(false)
      }
    }

    fetchCursos()

    const channel = supabase
      .channel('cursos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cursos' },
        () => fetchCursos()
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quantum_notas', JSON.stringify(notasGlobales));
  }, [notasGlobales]);

  useEffect(() => {
    localStorage.setItem('quantum_favoritos', JSON.stringify(misCursosIds));
  }, [misCursosIds]);

  const q = busqueda.trim().toLowerCase();
  const filtrados = cursos.filter(c => {
    const coincideBusqueda = q === ''
      ? true
      : (c.nombre.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    const estaEnMisCursos = misCursosIds.includes(c.id);
    return verMisCursos
      ? (estaEnMisCursos && coincideBusqueda)
      : coincideBusqueda;
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
    setNotasGlobales(prev => ({
      ...prev,
      [cursoId]: {}
    }));
  };

  // Calcula la nota de un "sistema" simple (componentes con número o subNotas)
  const calcularSistemaSimple = (sistema, notasDelCurso, prefijo = '') => {
    let total = 0
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        const nota = parseFloat(notasDelCurso[`${prefijo}${key}`]) || 0
        total += nota * config
      } else if (config && config.subNotas) {
        let acumuladoSub = 0
        Object.keys(config.subNotas).forEach(subKey => {
          const notaSub = parseFloat(notasDelCurso[`${prefijo}${key}_${subKey}`]) || 0
          acumuladoSub += notaSub * config.subNotas[subKey]
        })
        total += acumuladoSub * config.peso
      }
    })
    return total
  }

  const calcularPromedio = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {}

    // ---- CURSO CANDADO ----
    if (curso.sistema && curso.sistema.candado) {
      const partes = curso.sistema.partes.map((parte, pIdx) => {
        const nota = calcularSistemaSimple(parte.sistema, notasDelCurso, `P${pIdx}_`)
        return {
          nombre: parte.nombre,
          peso: parte.peso,
          nota: Number(nota.toFixed(2)),
          aprobada: nota >= MIN_APROBATORIO - 1e-9,
        }
      })

      const final = partes.reduce((acc, p) => acc + p.peso * p.nota, 0)
      const aprobado = partes.every(p => p.aprobada) && final >= MIN_APROBATORIO - 1e-9

      setResultado({
        candado: true,
        final: final.toFixed(2),
        aprobado,
        partes,
      })
      return
    }

    // ---- CURSO NORMAL ----
    const total = calcularSistemaSimple(curso.sistema, notasDelCurso)
    setResultado({
      candado: false,
      final: total.toFixed(2),
      aprobado: total >= MIN_APROBATORIO - 1e-9,
      partes: null,
    })
  }

  const reset = () => {
    setCursoSeleccionado(null);
    setResultado(null);
  };

  return {
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    filtrados, cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset, limpiarNotasCurso,
    cursos, cargandoCursos, totalCursos: cursos.length
  }
}
