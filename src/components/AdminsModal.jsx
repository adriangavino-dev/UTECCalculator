import { useState, useEffect } from 'react'
import { useAdmins } from '../logic/useAdmins'
import { useToast } from './Toast'

export const AdminsModal = ({ isOpen, onClose }) => {
  const { admins, cargando, procesando, listar, agregar, quitar } = useAdmins()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (isOpen) { listar(); setEmail('') }
  }, [isOpen, listar])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleAgregar = async () => {
    if (!email.trim()) return
    const res = await agregar(email)
    if (res.ok) {
      showToast('Admin agregado', 'success')
      setEmail('')
    } else {
      showToast(res.message || 'No se pudo agregar', 'error')
    }
  }

  const handleQuitar = async (admin) => {
    const res = await quitar(admin.user_id)
    if (res.ok) showToast(`${admin.email} ya no es admin`, 'info')
    else showToast(res.message || 'No se pudo quitar', 'error')
  }

  return (
    <div
      className="fixed inset-0 bg-background dark:bg-background backdrop-blur-[2px] flex items-center justify-center p-4 z-[60]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg max-h-[88vh] rounded-2xl border border-border shadow-2xl">
        <div className="relative w-full h-full max-h-[calc(88vh-3px)] flex flex-col bg-card rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-primary font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Solo owner
              </p>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Gestionar admins
              </h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted border border-border text-foreground/80 hover:text-foreground transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-5">

            {/* Agregar */}
            <div className="mb-5">
              <label className="block text-xs text-primary font-bold mb-2">
                Agregar admin por correo
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="colaborador@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAgregar() }}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                />
                <button
                  onClick={handleAgregar}
                  disabled={procesando || !email.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Agregar
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                El colaborador debe haber iniciado sesión con Google al menos una vez.
              </p>
            </div>

            {/* Lista */}
            <p className="text-xs text-success font-bold mb-2">
              Admins actuales
            </p>
            {cargando ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Cargando…</p>
            ) : (
              <div className="space-y-2">
                {admins.map((a) => {
                  const esOwner = a.rol === 'owner'
                  return (
                    <div key={a.user_id} className="flex items-center justify-between gap-3 bg-muted border border-border rounded-2xl px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{a.email}</p>
                        <span className={`text-xs font-semibold ${esOwner ? 'text-star' : 'text-primary'}`}>
                          {esOwner ? '★ Owner' : 'Admin'}
                        </span>
                      </div>
                      {!esOwner && (
                        <button
                          onClick={() => handleQuitar(a)}
                          disabled={procesando}
                          className="shrink-0 px-3 py-2 rounded-lg bg-danger-soft hover:bg-danger-soft border border-danger/30 text-danger font-bold text-xs transition-all cursor-pointer disabled:opacity-40 active:scale-95"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
