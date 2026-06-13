import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Maneja la sesión del usuario y su rol.
 * - user: usuario logueado (o null)
 * - isAdmin: true si está en la tabla admins (admin u owner)
 * - isOwner: true si su rol es 'owner'
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    let cancelled = false

    const checkRol = async () => {
      if (!user) {
        setIsAdmin(false)
        setIsOwner(false)
        return
      }
      const { data, error } = await supabase
        .from('admins')
        .select('rol')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled) {
        const esAdmin = !!data && !error
        setIsAdmin(esAdmin)
        setIsOwner(esAdmin && data.rol === 'owner')
      }
    }

    checkRol()
    return () => { cancelled = true }
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

  return { user, isAdmin, isOwner, loading, signInWithGoogle, signOut }
}
