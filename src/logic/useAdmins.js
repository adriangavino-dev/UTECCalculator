import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MENSAJES = {
  NO_AUTORIZADO: 'No tienes permiso para esto.',
  USUARIO_NO_ENCONTRADO: 'Ese correo no ha iniciado sesión todavía. Pídele que entre una vez con Google primero.',
  NO_PUEDE_QUITAR_OWNER: 'No puedes quitar al owner.',
}

export const useAdmins = () => {
  const [admins, setAdmins] = useState([])
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const listar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('admins')
      .select('user_id, email, rol, added_at')
      .order('added_at', { ascending: true })
    setCargando(false)
    if (!error && data) setAdmins(data)
    return { ok: !error }
  }, [])

  const agregar = async (email) => {
    setProcesando(true)
    const { data, error } = await supabase.rpc('agregar_admin', { p_email: email.trim() })
    setProcesando(false)
    if (error) return { ok: false, message: error.message }
    if (data !== 'OK') return { ok: false, message: MENSAJES[data] || data }
    await listar()
    return { ok: true }
  }

  const quitar = async (userId) => {
    setProcesando(true)
    const { data, error } = await supabase.rpc('quitar_admin', { p_user_id: userId })
    setProcesando(false)
    if (error) return { ok: false, message: error.message }
    if (data !== 'OK') return { ok: false, message: MENSAJES[data] || data }
    await listar()
    return { ok: true }
  }

  return { admins, cargando, procesando, listar, agregar, quitar }
}
