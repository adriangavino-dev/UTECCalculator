import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const useCursoAdmin = () => {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const construirSimple = (componentes) => {
    const sistema = {}
    for (const comp of componentes) {
      const nombreComp = comp.nombre.trim()
      if (comp.tieneSubnotas) {
        const subNotas = {}
        for (const sub of comp.subNotas) {
          subNotas[sub.nombre.trim()] = (parseFloat(sub.porcentaje) || 0) / 100
        }
        sistema[nombreComp] = { peso: (parseFloat(comp.porcentaje) || 0) / 100, subNotas }
        // Cuadro opcional de nota completa (configurable por evaluación)
        if (comp.permiteDirecta) sistema[nombreComp].directa = true
      } else {
        sistema[nombreComp] = (parseFloat(comp.porcentaje) || 0) / 100
      }
    }
    return sistema
  }

  const construirCandado = (partes) => ({
    candado: true,
    partes: partes.map((parte) => ({
      nombre: parte.nombre.trim(),
      sistema: construirSimple(parte.componentes),
    })),
  })

  const construirSistema = (cursoForm) =>
    cursoForm.candado ? construirCandado(cursoForm.partes) : construirSimple(cursoForm.componentes)

  // Etiquetas de búsqueda: sin vacías ni repetidas (sin importar mayúsculas)
  const limpiarEtiquetas = (etiquetas = []) => {
    const vistas = new Set()
    return etiquetas
      .map((e) => e.trim().replace(/\s+/g, ' ').slice(0, 40))
      .filter((e) => {
        const k = e.toLowerCase()
        if (!e || vistas.has(k)) return false
        vistas.add(k)
        return true
      })
      .slice(0, 20)
  }

  // Solo se envían si el formulario las trae (así no falla si la columna aún no existe)
  const camposEtiquetas = (cursoForm) =>
    cursoForm.etiquetas === undefined ? {} : { etiquetas: limpiarEtiquetas(cursoForm.etiquetas) }

  const mensajeError = (err, porDefecto) => {
    if (err.code === '23505') return mensajeDuplicado(err)
    if ((err.message || '').includes('etiquetas')) {
      return 'Falta activar las etiquetas en Supabase: ejecuta supabase/etiquetas_cursos.sql'
    }
    return err.message || porDefecto
  }

  const mensajeDuplicado = (err) => {
    const msg = (err.message || '').toLowerCase()
    if (msg.includes('nombre')) return 'Ya existe un curso con ese nombre.'
    return 'Ya existe un curso con ese código. Usa otro ID.'
  }

  const agregarCurso = async (cursoForm) => {
    setGuardando(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('cursos')
      .insert({
        id: cursoForm.id.trim(),
        nombre: cursoForm.nombre.trim(),
        carrera: [],
        sistema: construirSistema(cursoForm),
        ...camposEtiquetas(cursoForm),
      })
      .select()
      .single()

    setGuardando(false)

    if (insertError) {
      const message = mensajeError(insertError, 'Error al guardar el curso.')
      setError(message)
      return { ok: false, message }
    }
    return { ok: true, curso: data }
  }

  const editarCurso = async (originalId, cursoForm) => {
    setGuardando(true)
    setError(null)

    const { data, error: updError } = await supabase
      .from('cursos')
      .update({
        nombre: cursoForm.nombre.trim(),
        sistema: construirSistema(cursoForm),
        ...camposEtiquetas(cursoForm),
      })
      .eq('id', originalId)
      .select()
      .single()

    setGuardando(false)

    if (updError) {
      const message = mensajeError(updError, 'Error al actualizar el curso.')
      setError(message)
      return { ok: false, message }
    }
    return { ok: true, curso: data }
  }

  const eliminarCurso = async (id) => {
    setGuardando(true)
    setError(null)
    const { error: delError } = await supabase.from('cursos').delete().eq('id', id)
    setGuardando(false)
    if (delError) {
      const message = delError.message || 'Error al eliminar el curso.'
      setError(message)
      return { ok: false, message }
    }
    return { ok: true }
  }

  return { agregarCurso, editarCurso, eliminarCurso, guardando, error, setError }
}
