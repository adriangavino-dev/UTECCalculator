import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const MIN_APROBATORIO = 10.5
const PER_PAGE = 9
const redondear = (n) => Math.round(n)

/* =====================================================================
   Funciones puras de cálculo — reutilizables fuera del hook
   (CourseGrid las usa para el promedio en tarjetas y ModalCalculo
   para el simulador "¿qué pasa si…?")
   ===================================================================== */

const calcularSistemaSimple = (sistema, notasDelCurso, prefijo = '') => {
  let total = 0
  Object.keys(sistema).forEach(key => {
    if (key === 'candado' || key === 'partes') return
    const config = sistema[key]
    if (typeof config === 'number') {
      const v = redondear(parseFloat(notasDelCurso[`${prefijo}${key}`]) || 0)
      total += v * config
    } else if (config && config.subNotas) {
      // Si la evaluación permite nota directa y el usuario la puso,
      // se usa esa nota y se ignoran las subnotas
      const directaRaw = config.directa ? notasDelCurso[`${prefijo}${key}__directa`] : undefined
      const directa = parseFloat(directaRaw)
      if (directaRaw !== undefined && directaRaw !== '' && !isNaN(directa)) {
        total += redondear(directa) * config.peso
        return
      }
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

// ¿El usuario ingresó al menos una nota de este curso?
export const hayNotas = (notasDelCurso) =>
  Object.values(notasDelCurso || {}).some(v => v !== undefined && v !== '')

// Promedio del curso con las notas dadas (vacías cuentan como 0)
export const calcularResultado = (curso, notasDelCurso) => {
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
    return { candado: true, final: final.toFixed(2), aprobado, partes }
  }

  const total = calcularSistemaSimple(curso.sistema, notasDelCurso)
  return { candado: false, final: total.toFixed(2), aprobado: total >= MIN_APROBATORIO - 1e-9, partes: null }
}

// Copia de las notas con todo lo vacío rellenado con `valor` (simulador)
export const notasSimuladas = (curso, notasDelCurso, valor) => {
  const notas = { ...notasDelCurso }
  const vacia = (k) => notas[k] === undefined || notas[k] === ''
  const llenarSistema = (sistema, prefijo = '') => {
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        if (vacia(`${prefijo}${key}`)) notas[`${prefijo}${key}`] = String(valor)
      } else if (config && config.subNotas) {
        // Si la nota directa está puesta, la evaluación ya está completa
        if (config.directa && !vacia(`${prefijo}${key}__directa`)) return
        Object.keys(config.subNotas).forEach(sk => {
          if (vacia(`${prefijo}${key}_${sk}`)) notas[`${prefijo}${key}_${sk}`] = String(valor)
        })
      }
    })
  }
  if (curso.sistema && curso.sistema.candado) {
    curso.sistema.partes.forEach((parte, pIdx) => llenarSistema(parte.sistema, `P${pIdx}_`))
  } else {
    llenarSistema(curso.sistema)
  }
  return notas
}

// ¿Cuánto necesito en lo que falta para llegar a 10.5?
export const calcularNecesarioDe = (curso, notasDelCurso) => {
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
        // Nota directa: la evaluación cuenta como completa con esa nota
        const directaRaw = config.directa ? notasDelCurso[`${prefijo}${key}__directa`] : undefined
        const directa = parseFloat(directaRaw)
        if (directaRaw !== undefined && directaRaw !== '' && !isNaN(directa)) {
          constante += redondear(directa) * config.peso
          return
        }
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
    return { candado: true, partes }
  }
  return { candado: false, ...resolver(curso.sistema) }
}

export const useCalculadora = () => {
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [verNecesario, setVerNecesario] = useState(false)
  const [verMisCursos, setVerMisCursos] = useState(false)
  const [soloCandado, setSoloCandado] = useState(false)
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
  useEffect(() => { setPaginaActual(1) }, [busqueda, soloCandado, verMisCursos])

  const q = busqueda.trim().toLowerCase();
  let lista = cursos.filter(c => {
    const coincideBusqueda = q === '' ? true : (c.nombre.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    const estaEnMisCursos = misCursosIds.includes(c.id);
    return verMisCursos ? (estaEnMisCursos && coincideBusqueda) : coincideBusqueda;
  });
  if (soloCandado) lista = lista.filter(c => c.sistema && c.sistema.candado)
  lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))
  const filtrados = lista

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PER_PAGE))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const paginados = filtrados.slice((paginaSegura - 1) * PER_PAGE, paginaSegura * PER_PAGE)

  const toggleFavorito = (id) => setMisCursosIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const actualizarNota = (cursoId, llaveNota, valor) => setNotasGlobales(prev => ({ ...prev, [cursoId]: { ...(prev[cursoId] || {}), [llaveNota]: valor } }));
  const limpiarNotasCurso = (cursoId) => setNotasGlobales(prev => ({ ...prev, [cursoId]: {} }));

  // Cálculo en vivo: el promedio se recalcula solo al escribir
  const notasDelCursoSel = (cursoSeleccionado && notasGlobales[cursoSeleccionado.id]) || {}
  const resultado = useMemo(
    () => (cursoSeleccionado && hayNotas(notasDelCursoSel) ? calcularResultado(cursoSeleccionado, notasDelCursoSel) : null),
    [cursoSeleccionado, notasDelCursoSel],
  )
  const necesario = useMemo(
    () => (cursoSeleccionado && verNecesario ? calcularNecesarioDe(cursoSeleccionado, notasDelCursoSel) : null),
    [cursoSeleccionado, verNecesario, notasDelCursoSel],
  )

  const toggleNecesario = () => setVerNecesario(v => !v)

  const abrirCurso = (curso) => { setCursoSeleccionado(curso); setVerNecesario(false) }
  const reset = () => { setCursoSeleccionado(null); setVerNecesario(false) };

  return {
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    soloCandado, setSoloCandado,
    filtrados, paginados, paginaActual: paginaSegura, setPaginaActual, totalPaginas, perPage: PER_PAGE,
    cursoSeleccionado, setCursoSeleccionado: abrirCurso,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    resultado, reset, limpiarNotasCurso,
    necesario, toggleNecesario, verNecesario,
    cursos, cargandoCursos, totalCursos: cursos.length
  }
}
