import { useState } from 'react'

export const LoginButton = ({ user, isAdmin, loading, signInWithGoogle, signOut }) => {
  const [imgError, setImgError] = useState(false)

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
    )
  }

  // No logueado → botón de iniciar sesión
  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-300/50 hover:bg-white/[0.07] transition-colors active:scale-95 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-[11px] uppercase tracking-[2px] font-bold text-slate-200 group-hover:text-cyan-200 transition-colors">
          Iniciar sesión
        </span>
      </button>
    )
  }

  // Logueado
  const nombre = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
  const avatar = user.user_metadata?.avatar_url
  const inicial = nombre.charAt(0).toUpperCase()
  const mostrarFoto = avatar && !imgError

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
        {mostrarFoto ? (
          <img
            src={avatar}
            alt={nombre}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-cyan-300 flex items-center justify-center text-[#0a0420] text-xs font-black">
            {inicial}
          </div>
        )}
        <span className="text-[11px] font-bold text-slate-200 max-w-[100px] truncate hidden sm:inline">
          {nombre}
        </span>
        {isAdmin && (
          <span className="text-[8px] uppercase tracking-[1.5px] font-black px-1.5 py-0.5 rounded bg-cyan-300/15 text-cyan-200 border border-cyan-300/30">
            Admin
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={signOut}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 hover:border-rose-400/40 hover:text-rose-300 text-slate-400 transition-all active:scale-90 cursor-pointer"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}
