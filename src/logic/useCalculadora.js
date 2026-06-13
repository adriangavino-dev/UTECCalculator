import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MIN_APROBATORIO = 10.5

export const useCalculadora = () => {
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [necesario, setNecesario] = useState(null)
  const [verMisCursos, setVerMisCursos] = useState(false)
  const [orden, setOrden] = useState('codigo')      // 'codigo' | 'nombre'
  const [soloCandado, setSoloCandado] = useState(false)

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
      const { data, error } = await supabase.from('cursos').select('*').order('id')
      if (active) {
        if (!error && data) setCursos(data)
        setCargandoCursos(false)
      }
    }
    fetchCursos()
    const channel = supabase
      .channel('cursos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cursos' }, () => fetchCursos())
      .subscribe()
    return () => { active = false; supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    localStorage.setItem('quantum_notas', JSON.stringify(notasGlobales));
  }, [notasGlobales]);

  useEffect(() => {
    localStorage.setItem('quantum_favoritos', JSON.stringify(misCursosIds));
  }, [misCursosIds]);

  const q = busqueda.trim().toLowerCase();
  let lista = cursos.filter(c => {
    const coincideBusqueda = q === ''
      ? true
      : (c.nombre.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    const estaEnMisCursos = misCursosIds.includes(c.id);
    return verMisCursos ? (estaEnMisCursos && coincideBusqueda) : coincideBusqueda;
  });
  if (soloCandado) lista = lista.filter(c => c.sistema && c.sistema.candado)
  lista = [...lista].sort((a, b) =>
    orden === 'nombre' ? a.nombre.localeCompare(b.nombre) : a.id.localeCompare(b.id)
  )
  const filtrados = lista

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
    setNotasGlobales(prev => ({ ...prev, [cursoId]: {} }));
  };

  // Suma ponderada de un sistema simple
  const calcularSistemaSimple = (sistema, notasDelCurso, prefijo = '') => {
    let total = 0
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        total += (parseFloat(notasDelCurso[`${prefijo}${key}`]) || 0) * config
      } else if (config && config.subNotas) {
        let acc = 0
        Object.keys(config.subNotas).forEach(sk => {
          acc += (parseFloat(notasDelCurso[`${prefijo}${key}_${sk}`]) || 0) * config.subNotas[sk]
        })
        total += acc * config.peso
      }
    })
    return total
  }

  // Aplana un sistema en "hojas" con su peso efectivo (suman ~1.0)
  const hojasDeSistema = (sistema, prefijo = '') => {
    const hojas = []
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        hojas.push({ key: `${prefijo}${key}`, pesoEf: config })
      } else if (config && config.subNotas) {
        Object.keys(config.subNotas).forEach(sk => {
          hojas.push({ key: `${prefijo}${key}_${sk}`, pesoEf: config.peso * config.subNotas[sk] })
        })
      }
    })
    return hojas
  }

  const calcularPromedio = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {}
    setNecesario(null)

    if (curso.sistema && curso.sistema.candado) {
      const partes = curso.sistema.partes.map((parte, pIdx) => {
        const nota = calcularSistemaSimple(parte.sistema, notasDelCurso, `P${pIdx}_`)
        return {
          nombre: parte.nombre, peso: parte.peso,
          nota: Number(nota.toFixed(2)), aprobada: nota >= MIN_APROBATORIO - 1e-9,
        }
      })
      const final = partes.reduce((acc, p) => acc + p.peso * p.nota, 0)
      const aprobado = partes.every(p => p.aprobada) && final >= MIN_APROBATORIO - 1e-9
      setResultado({ candado: true, final: final.toFixed(2), aprobado, partes })
      return
    }

    const total = calcularSistemaSimple(curso.sistema, notasDelCurso)
    setResultado({ candado: false, final: total.toFixed(2), aprobado: total >= MIN_APROBATORIO - 1e-9, partes: null })
  }

  // Calculadora inversa: ¿cuánto necesito (en promedio en lo que falta) para 10.5?
  const calcularNecesario = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {}
    setResultado(null)

    const resolver = (sistema, prefijo = '') => {
      const hojas = hojasDeSistema(sistema, prefijo)
      let lleno = 0, pesoVacio = 0, hayVacios = false
      hojas.forEach(({ key, pesoEf }) => {
        const raw = notasDelCurso[key]
        const val = parseFloat(raw)
        if (raw === undefined || raw === '' || isNaN(val)) {
          pesoVacio += pesoEf; hayVacios = true
        } else {
          lleno += val * pesoEf
        }
      })
      if (!hayVacios) {
        return { completo: true, notaActual: Number(lleno.toFixed(2)) }
      }
      const req = (MIN_APROBATORIO - lleno) / pesoVacio
      return {
        completo: false,
        necesario: Number(req.toFixed(2)),
        yaAprobado: req <= 1e-9,
        posible: req <= 20 + 1e-9,
      }
    }

    if (curso.sistema && curso.sistema.candado) {
      const partes = curso.sistema.partes.map((parte, pIdx) => ({
        nombre: parte.nombre, ...resolver(parte.sistema, `P${pIdx}_`),
      }))
      setNecesario({ candado: true, partes })
      return
    }
    setNecesario({ candado: false, ...resolver(curso.sistema) })
  }

  const reset = () => {
    setCursoSeleccionado(null);
    setResultado(null);
    setNecesario(null);
  };

  return {
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    orden, setOrden, soloCandado, setSoloCandado,
    filtrados, cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset, limpiarNotasCurso,
    necesario, calcularNecesario,
    cursos, cargandoCursos, totalCursos: cursos.length
  }
}
