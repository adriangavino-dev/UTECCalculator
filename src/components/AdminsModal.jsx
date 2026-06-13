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
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg max-h-[88vh] p-[1.5px] rounded-[34px] bg-gradient-to-br from-cyan-400/60 via-teal-400/40 to-sky-500/60 shadow-[0_25px_80px_-20px_rgba(56,189,248,0.4)]">
        <div className="relative w-full h-full max-h-[calc(88vh-3px)] flex flex-col bg-[#0c0824]/95 backdrop-blur-2xl rounded-[33px] overflow-hidden">

          <div className="absolute -top-32 -right-24 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                Solo owner
              </p>
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Gestionar admins
              </h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-5">

            {/* Agregar */}
            <div className="mb-5">
              <label className="block text-[10px] uppercase tracking-[2px] text-cyan-300 font-bold mb-2">
                Agregar admin por correo
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="colaborador@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAgregar() }}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 transition-all text-sm font-medium"
                />
                <button
                  onClick={handleAgregar}
                  disabled={procesando || !email.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 text-[#0a0420] font-black text-[11px] uppercase tracking-[1.5px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Agregar
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                El colaborador debe haber iniciado sesión con Google al menos una vez.
              </p>
            </div>

            {/* Lista */}
            <p className="text-[10px] uppercase tracking-[2px] text-teal-300 font-bold mb-2">
              Admins actuales
            </p>
            {cargando ? (
              <p className="text-slate-400 text-sm py-4 text-center">Cargando…</p>
            ) : (
              <div className="space-y-2">
                {admins.map((a) => {
                  const esOwner = a.rol === 'owner'
                  return (
                    <div key={a.user_id} className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{a.email}</p>
                        <span className={`text-[9px] uppercase tracking-[1.5px] font-black ${esOwner ? 'text-amber-300' : 'text-cyan-300/70'}`}>
                          {esOwner ? '★ Owner' : 'Admin'}
                        </span>
                      </div>
                      {!esOwner && (
                        <button
                          onClick={() => handleQuitar(a)}
                          disabled={procesando}
                          className="shrink-0 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-400/20 text-rose-300 font-bold text-[10px] uppercase tracking-[1.5px] transition-all cursor-pointer disabled:opacity-40 active:scale-95"
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
