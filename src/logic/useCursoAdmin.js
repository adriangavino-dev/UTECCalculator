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

  const parseCiclo = (ciclo) =>
    (ciclo === '' || ciclo === null || ciclo === undefined) ? null : parseInt(ciclo, 10)

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
        ciclo: parseCiclo(cursoForm.ciclo),
        sistema: construirSistema(cursoForm),
      })
      .select()
      .single()

    setGuardando(false)

    if (insertError) {
      const message = insertError.code === '23505'
        ? mensajeDuplicado(insertError)
        : (insertError.message || 'Error al guardar el curso.')
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
        ciclo: parseCiclo(cursoForm.ciclo),
        sistema: construirSistema(cursoForm),
      })
      .eq('id', originalId)
      .select()
      .single()

    setGuardando(false)

    if (updError) {
      const message = updError.code === '23505'
        ? mensajeDuplicado(updError)
        : (updError.message || 'Error al actualizar el curso.')
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
