const STOP_WORDS = new Set([
  'a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'lo', 'los', 'para', 'por', 'sin', 'y',
])

const ROMANO_A_ARABIGO = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6' }
const ARABIGO_A_ROMANO = { 1: 'i', 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v', 6: 'vi' }
const ES_NUMERO = /^\d+$/

/**
 * Elimina tildes/diacríticos, pasa a minúsculas y colapsa espacios.
 */
export const normalizarTexto = (texto = '') =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Divide un texto normalizado en tokens alfanuméricos.
 */
export const tokenizar = (texto = '') =>
  normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

const armarSiglas = (palabras) => {
  if (palabras.length < 2) return []

  const conRomano = palabras
    .map((w) => (ROMANO_A_ARABIGO[w] || ES_NUMERO.test(w) ? w : w[0]))
    .join('')

  const conArabigo = palabras
    .map((w) => {
      if (ROMANO_A_ARABIGO[w]) return ROMANO_A_ARABIGO[w]
      if (ES_NUMERO.test(w)) return w
      return w[0]
    })
    .join('')

  return [conRomano, conArabigo].filter((s) => s.length >= 2)
}

/**
 * Pre-indexa un curso para búsquedas sin tildes, por tokens, romanos y siglas automáticas.
 */
export const indexarCurso = (curso) => {
  const idNorm = normalizarTexto(curso.id)
  const idCompacto = idNorm.replace(/[^a-z0-9]/g, '')
  const nombreNorm = normalizarTexto(curso.nombre)
  const palabras = tokenizar(curso.nombre)
  const palabrasExpandidas = palabras.map((base) => ({
    base,
    alt: ROMANO_A_ARABIGO[base] || ARABIGO_A_ROMANO[base] || null,
  }))
  const sinConectores = palabras.filter((w) => !STOP_WORDS.has(w))
  const siglas = new Set([...armarSiglas(sinConectores), ...armarSiglas(palabras)])

  return { idNorm, idCompacto, nombreNorm, palabrasExpandidas, siglas }
}

const nivelToken = (indice, tok, esMultiToken) => {
  let mejor = null
  const actualizar = (nivel) => {
    if (mejor === null || nivel < mejor) mejor = nivel
  }

  // Evita que un dígito suelto en consultas multi-palabra (ej. "base datos 1")
  // coincida con dígitos internos del código del curso (ej. CS1042)
  if (tok.length >= 2 || !esMultiToken) {
    if (indice.idCompacto === tok) actualizar(0)
    else if (indice.idCompacto.startsWith(tok)) actualizar(1)
    else if (indice.idCompacto.includes(tok)) actualizar(2)
  }

  if (indice.siglas.has(tok)) {
    actualizar(0)
  } else {
    for (const s of indice.siglas) {
      if (s.startsWith(tok)) {
        actualizar(1)
        break
      }
    }
  }

  for (const { base, alt } of indice.palabrasExpandidas) {
    if (base === tok || alt === tok) {
      actualizar(0)
      break
    }
    if (base.startsWith(tok)) actualizar(1)
    else if (base.includes(tok)) actualizar(2)
  }

  return mejor
}

/**
 * Evalúa qué tan bien coincide un curso indexado con la consulta.
 * Devuelve 0 (exacto), 1 (prefijo), 2 (parcial) o null (no coincide).
 */
export const evaluarBusqueda = (indice, consulta) => {
  const qNorm = normalizarTexto(consulta)
  if (qNorm === '') return 0

  const qCompacto = qNorm.replace(/[^a-z0-9]/g, '')
  const tokens = tokenizar(consulta)
  if (tokens.length === 0) return null

  const esMultiToken = tokens.length > 1
  let maxNivel = 0

  for (const tok of tokens) {
    const nivel = nivelToken(indice, tok, esMultiToken)
    if (nivel === null) return null
    if (nivel > maxNivel) maxNivel = nivel
  }

  if (
    indice.idCompacto === qCompacto ||
    indice.nombreNorm === qNorm ||
    indice.siglas.has(qCompacto)
  ) {
    return 0
  }

  return maxNivel <= 1 ? 1 : 2
}
