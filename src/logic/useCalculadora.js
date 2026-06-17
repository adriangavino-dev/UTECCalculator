import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MIN_APROBATORIO = 10.5
const PER_PAGE = 9
const redondear = (n) => Math.round(n)

export const useCalculadora = () => {
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [necesario, setNecesario] = useState(null)
  const [verMisCursos, setVerMisCursos] = useState(false)
  const [soloCandado, setSoloCandado] = useState(false)
  const [cicloFiltro, setCicloFiltro] = useState('')   // '' = todos
  const [paginaActual, setPaginaActual] = useState(1)

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

  useEffect(() => { localStorage.setItem('quantum_notas', JSON.stringify(notasGlobales)) }, [notasGlobales]);
  useEffect(() => { localStorage.setItem('quantum_favoritos', JSON.stringify(misCursosIds)) }, [misCursosIds]);

  // Reiniciar a la página 1 cuando cambian los filtros/búsqueda
  useEffect(() => { setPaginaActual(1) }, [busqueda, soloCandado, verMisCursos, cicloFiltro])

  const q = busqueda.trim().toLowerCase();
  let lista = cursos.filter(c => {
    const coincideBusqueda = q === '' ? true : (c.nombre.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    const estaEnMisCursos = misCursosIds.includes(c.id);
    return verMisCursos ? (estaEnMisCursos && coincideBusqueda) : coincideBusqueda;
  });
  if (soloCandado) lista = lista.filter(c => c.sistema && c.sistema.candado)
  if (cicloFiltro !== '') lista = lista.filter(c => String(c.ciclo) === String(cicloFiltro))
  lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))
  const filtrados = lista

  // Ciclos disponibles (para el filtro)
  const ciclosDisponibles = [...new Set(cursos.map(c => c.ciclo).filter(x => x !== null && x !== undefined))].sort((a, b) => a - b)

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PER_PAGE))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const paginados = filtrados.slice((paginaSegura - 1) * PER_PAGE, paginaSegura * PER_PAGE)

  const toggleFavorito = (id) => setMisCursosIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const actualizarNota = (cursoId, llaveNota, valor) => setNotasGlobales(prev => ({ ...prev, [cursoId]: { ...(prev[cursoId] || {}), [llaveNota]: valor } }));
  const limpiarNotasCurso = (cursoId) => setNotasGlobales(prev => ({ ...prev, [cursoId]: {} }));

  const calcularSistemaSimple = (sistema, notasDelCurso, prefijo = '') => {
    let total = 0
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        const v = redondear(parseFloat(notasDelCurso[`${prefijo}${key}`]) || 0)
        total += v * config
      } else if (config && config.subNotas) {
        let acc = 0
        Object.keys(config.subNotas).forEach(sk => {
          acc += (parseFloat(notasDelCurso[`${prefijo}${key}_${sk}`]) || 0) * config.subNotas[sk]
        })
        total += redondear(acc) * config.peso
      }
    })
    return total
  }

  const pesoTotalSistema = (sistema) => {
    let w = 0
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') w += config
      else if (config && config.subNotas) w += config.peso
    })
    return w
  }

  const calcularPromedio = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {}
    setNecesario(null)

    if (curso.sistema && curso.sistema.candado) {
      const partes = curso.sistema.partes.map((parte, pIdx) => {
        const contribucion = calcularSistemaSimple(parte.sistema, notasDelCurso, `P${pIdx}_`)
        const esViejo = parte.peso !== undefined
        const pesoParte = esViejo ? parte.peso : pesoTotalSistema(parte.sistema)
        const nota = esViejo ? contribucion : (pesoParte > 0 ? contribucion / pesoParte : 0)
        const contribFinal = esViejo ? parte.peso * contribucion : contribucion
        return {
          nombre: parte.nombre,
          peso: Number(pesoParte.toFixed(4)),
          nota: Number(nota.toFixed(2)),
          aprobada: nota >= MIN_APROBATORIO - 1e-9,
          _contrib: contribFinal,
        }
      })
      const final = partes.reduce((acc, p) => acc + p._contrib, 0)
      const aprobado = partes.every(p => p.aprobada) && final >= MIN_APROBATORIO - 1e-9
      setResultado({ candado: true, final: final.toFixed(2), aprobado, partes })
      return
    }

    const total = calcularSistemaSimple(curso.sistema, notasDelCurso)
    setResultado({ candado: false, final: total.toFixed(2), aprobado: total >= MIN_APROBATORIO - 1e-9, partes: null })
  }

  const calcularNecesario = (curso) => {
    const notasDelCurso = notasGlobales[curso.id] || {}
    setResultado(null)

    const resolver = (sistema, prefijo = '') => {
      let pesoTotal = 0, constante = 0, coefX = 0, hayVacios = false
      Object.keys(sistema).forEach(key => {
        if (key === 'candado' || key === 'partes') return
        const config = sistema[key]
        if (typeof config === 'number') {
          pesoTotal += config
          const raw = notasDelCurso[`${prefijo}${key}`]
          const val = parseFloat(raw)
          if (raw === undefined || raw === '' || isNaN(val)) { coefX += config; hayVacios = true }
          else constante += redondear(val) * config
        } else if (config && config.subNotas) {
          pesoTotal += config.peso
          let filledSub = 0, emptySubW = 0, algunoVacio = false
          Object.keys(config.subNotas).forEach(sk => {
            const raw = notasDelCurso[`${prefijo}${key}_${sk}`]
            const val = parseFloat(raw)
            const w = config.subNotas[sk]
            if (raw === undefined || raw === '' || isNaN(val)) { emptySubW += w; algunoVacio = true }
            else filledSub += val * w
          })
          if (!algunoVacio) {
            constante += redondear(filledSub) * config.peso
          } else {
            hayVacios = true
            constante += filledSub * config.peso
            coefX += emptySubW * config.peso
          }
        }
      })
      if (!hayVacios || coefX < 1e-12) {
        return { completo: true, notaActual: Number((constante / (pesoTotal || 1)).toFixed(2)) }
      }
      const target = MIN_APROBATORIO * pesoTotal
      const req = (target - constante) / coefX
      return { completo: false, necesario: Number(req.toFixed(2)), yaAprobado: req <= 1e-9, posible: req <= 20 + 1e-9 }
    }

    if (curso.sistema && curso.sistema.candado) {
      const partes = curso.sistema.partes.map((parte, pIdx) => ({ nombre: parte.nombre, ...resolver(parte.sistema, `P${pIdx}_`) }))
      setNecesario({ candado: true, partes })
      return
    }
    setNecesario({ candado: false, ...resolver(curso.sistema) })
  }

  const reset = () => { setCursoSeleccionado(null); setResultado(null); setNecesario(null) };

  return {
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    soloCandado, setSoloCandado,
    cicloFiltro, setCicloFiltro, ciclosDisponibles,
    filtrados, paginados, paginaActual: paginaSegura, setPaginaActual, totalPaginas, perPage: PER_PAGE,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    resultado, calcularPromedio, reset, limpiarNotasCurso,
    necesario, calcularNecesario,
    cursos, cargandoCursos, totalCursos: cursos.length
  }
}
