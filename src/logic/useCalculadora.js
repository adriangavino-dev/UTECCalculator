import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const MIN_APROBATORIO = 10.5
const PER_PAGE = 9
const redondear = (n) => Math.round(n)

/* =====================================================================
   Funciones puras de cálculo — reutilizables fuera del hook
   (CourseGrid las usa para las tarjetas y ModalCalculo para el
   detalle del curso y el simulador "¿qué pasa si…?")
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

// Nota con 1 decimal. Las notas se cortan hacia abajo (10.45 no debe verse
// como 10.5 aprobado) y lo que "necesitas" se redondea hacia arriba.
export const formatNota = (n, hacia = 'abajo') => {
  const f = hacia === 'arriba' ? Math.ceil : Math.floor
  return (f(Number(n) * 10 - (hacia === 'arriba' ? 1e-9 : -1e-9)) / 10).toFixed(1)
}

// Qué parte del curso ya está evaluada: peso rendido, puntos ganados (sobre 20)
// y el promedio de lo rendido. También devuelve el detalle por evaluación.
export const calcularProgreso = (curso, notasDelCurso) => {
  const notas = notasDelCurso || {}
  const lleno = (k) => notas[k] !== undefined && notas[k] !== '' && !isNaN(parseFloat(notas[k]))
  const evaluaciones = []
  let pesoTotal = 0, pesoEvaluado = 0, puntos = 0

  const recorrer = (sistema, prefijo, factor, parte) => {
    Object.keys(sistema).forEach(key => {
      if (key === 'candado' || key === 'partes') return
      const config = sistema[key]
      if (typeof config === 'number') {
        const peso = config * factor
        pesoTotal += peso
        const ok = lleno(`${prefijo}${key}`)
        const aporte = ok ? redondear(parseFloat(notas[`${prefijo}${key}`])) * peso : 0
        if (ok) { pesoEvaluado += peso; puntos += aporte }
        evaluaciones.push({ key, parte, peso, estado: ok ? 'lleno' : 'vacio', aporte })
      } else if (config && config.subNotas) {
        const peso = config.peso * factor
        pesoTotal += peso
        if (config.directa && lleno(`${prefijo}${key}__directa`)) {
          const aporte = redondear(parseFloat(notas[`${prefijo}${key}__directa`])) * peso
          pesoEvaluado += peso; puntos += aporte
          evaluaciones.push({ key, parte, peso, estado: 'lleno', aporte })
          return
        }
        let acc = 0, wLleno = 0, todos = true
        Object.keys(config.subNotas).forEach(sk => {
          if (lleno(`${prefijo}${key}_${sk}`)) {
            acc += parseFloat(notas[`${prefijo}${key}_${sk}`]) * config.subNotas[sk]
            wLleno += config.subNotas[sk]
          } else todos = false
        })
        const aporte = todos ? redondear(acc) * peso : acc * peso
        pesoEvaluado += wLleno * peso; puntos += aporte
        evaluaciones.push({ key, parte, peso, estado: todos ? 'lleno' : wLleno > 0 ? 'parcial' : 'vacio', aporte })
      }
    })
  }

  if (curso.sistema && curso.sistema.candado) {
    curso.sistema.partes.forEach((parte, pIdx) => {
      // Modelo viejo: la parte trae su peso y su sistema suma 1 por dentro
      recorrer(parte.sistema, `P${pIdx}_`, parte.peso !== undefined ? parte.peso : 1, parte.nombre)
    })
  } else {
    recorrer(curso.sistema, '', 1, null)
  }

  const falta = Math.max(0, pesoTotal - pesoEvaluado)
  return {
    evaluaciones,
    pesoTotal,
    pesoEvaluado,
    fraccion: pesoTotal > 0 ? pesoEvaluado / pesoTotal : 0,
    puntos,
    maximo: puntos + falta * 20,
    parcial: pesoEvaluado > 1e-9 ? puntos / pesoEvaluado : null,
    completo: falta < 1e-9,
  }
}

// Estado del curso para tarjetas, orden por urgencia y resumen del ciclo.
// tipo: 'riesgo' | 'jalado' | 'ok' | 'aprobado' | 'vacio'
export const estadoCurso = (curso, notasDelCurso) => {
  const progreso = calcularProgreso(curso, notasDelCurso)
  if (progreso.parcial === null) {
    return { tipo: 'vacio', etiqueta: 'Sin notas', texto: 'Aún no pones notas', progreso, necesita: null }
  }
  if (progreso.completo) {
    const res = calcularResultado(curso, notasDelCurso)
    return res.aprobado
      ? { tipo: 'aprobado', etiqueta: 'Aprobado', texto: `Nota final ${formatNota(res.final)}`, progreso, necesita: null }
      : { tipo: 'jalado', etiqueta: 'Desaprobado', texto: `Nota final ${formatNota(res.final)}`, progreso, necesita: null }
  }

  const nec = calcularNecesarioDe(curso, notasDelCurso)
  const necDe = (r) => (r.completo ? (r.notaActual >= MIN_APROBATORIO - 1e-9 ? -Infinity : Infinity) : r.necesario)
  const necesita = nec.candado ? Math.max(...nec.partes.map(necDe)) : necDe(nec)

  if (necesita > 20 + 1e-9) {
    return { tipo: 'riesgo', etiqueta: 'Ya no alcanza', texto: 'Ya no llegas a 10.5', progreso, necesita }
  }
  if (necesita <= 1e-9) {
    return { tipo: 'ok', etiqueta: 'Aprobando', texto: '¡Ya aprobaste, saques lo que saques!', progreso, necesita }
  }
  const enRiesgo = progreso.parcial < MIN_APROBATORIO - 1e-9
  return {
    tipo: enRiesgo ? 'riesgo' : 'ok',
    etiqueta: enRiesgo ? 'En riesgo' : 'Aprobando',
    texto: `Necesitas ${formatNota(necesita, 'arriba')} en lo que falta`,
    progreso,
    necesita,
  }
}

// Orden por urgencia: primero lo que está en riesgo
const RANGO = { riesgo: 0, jalado: 1, ok: 2, aprobado: 3, vacio: 4 }

export const useCalculadora = () => {
  const [busqueda, setBusqueda] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
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

  // Estado de cada curso (promedio, % evaluado, cuánto falta)
  const estados = useMemo(() => {
    const m = {}
    cursos.forEach(c => { m[c.id] = estadoCurso(c, notasGlobales[c.id]) })
    return m
  }, [cursos, notasGlobales])

  // "Mis cursos" = los marcados con ★ más los que ya tienen notas
  const esMio = (c) => misCursosIds.includes(c.id) || estados[c.id]?.tipo !== 'vacio'

  const q = busqueda.trim().toLowerCase();
  let lista = cursos.filter(c => {
    const coincideBusqueda = q === '' ? true : (c.nombre.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    return verMisCursos ? (esMio(c) && coincideBusqueda) : coincideBusqueda;
  });
  if (soloCandado) lista = lista.filter(c => c.sistema && c.sistema.candado)
  const urgencia = (c) => {
    const e = estados[c.id]
    // Dentro de "en riesgo", primero el que más necesita
    return RANGO[e.tipo] * 100 - (e.tipo === 'riesgo' ? Math.min(e.necesita ?? 21, 21) : 0)
  }
  lista = [...lista].sort((a, b) => urgencia(a) - urgencia(b) || a.nombre.localeCompare(b.nombre))
  const filtrados = lista

  // Resumen "Mi ciclo"
  const mios = cursos.filter(esMio)
  const conNotas = mios.filter(c => estados[c.id].tipo !== 'vacio')
  const ciclo = {
    total: mios.length,
    conNotas: conNotas.length,
    promedio: conNotas.length
      ? conNotas.reduce((acc, c) => acc + estados[c.id].progreso.parcial, 0) / conNotas.length
      : null,
    aprobando: conNotas.filter(c => ['ok', 'aprobado'].includes(estados[c.id].tipo)).length,
    riesgo: conNotas.filter(c => ['riesgo', 'jalado'].includes(estados[c.id].tipo)).length,
    sinNotas: mios.length - conNotas.length,
  }

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PER_PAGE))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const paginados = filtrados.slice((paginaSegura - 1) * PER_PAGE, paginaSegura * PER_PAGE)

  const toggleFavorito = (id) => setMisCursosIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const actualizarNota = (cursoId, llaveNota, valor) => setNotasGlobales(prev => ({ ...prev, [cursoId]: { ...(prev[cursoId] || {}), [llaveNota]: valor } }));
  const limpiarNotasCurso = (cursoId) => setNotasGlobales(prev => ({ ...prev, [cursoId]: {} }));

  const reset = () => setCursoSeleccionado(null)

  return {
    busqueda, setBusqueda, verMisCursos, setVerMisCursos,
    soloCandado, setSoloCandado,
    filtrados, paginados, paginaActual: paginaSegura, setPaginaActual, totalPaginas, perPage: PER_PAGE,
    cursoSeleccionado, setCursoSeleccionado,
    notasGlobales, actualizarNota, misCursosIds, toggleFavorito,
    reset, limpiarNotasCurso,
    estados, ciclo,
    cursos, cargandoCursos, totalCursos: cursos.length
  }
}
