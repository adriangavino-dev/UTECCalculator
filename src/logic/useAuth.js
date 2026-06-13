import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Maneja la sesión del usuario y si es admin o no.
 * - user: objeto del usuario logueado (o null)
 * - isAdmin: true si su user_id está en la tabla `admins`
 * - loading: true mientras se resuelve la sesión inicial
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. Sesión inicial + escuchar cambios de login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Cada vez que cambia el usuario, verificar si es admin
  useEffect(() => {
    let cancelled = false

    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled) setIsAdmin(!!data && !error)
    }

    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [user])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) console.error('Error al iniciar sesión:', error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, isAdmin, loading, signInWithGoogle, signOut }
}
