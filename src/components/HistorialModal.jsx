import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const accionEstilo = {
  crear: { label: 'Creó', color: 'text-teal-300', bg: 'bg-teal-300/10 border-teal-300/30' },
  editar: { label: 'Editó', color: 'text-cyan-300', bg: 'bg-cyan-300/10 border-cyan-300/30' },
  eliminar: { label: 'Eliminó', color: 'text-rose-300', bg: 'bg-rose-400/10 border-rose-400/30' },
}

const tiempoRelativo = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const HistorialModal = ({ onClose }) => {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    supabase
      .from('cursos_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (activo) {
          if (!error && data) setLogs(data)
          setCargando(false)
        }
      })
    return () => { activo = false }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg max-h-[88vh] p-[1.5px] rounded-[34px] bg-gradient-to-br from-cyan-400/60 via-teal-400/40 to-sky-500/60 shadow-[0_25px_80px_-20px_rgba(56,189,248,0.4)]">
        <div className="relative w-full h-full max-h-[calc(88vh-3px)] flex flex-col bg-[#0c0824]/95 backdrop-blur-2xl rounded-[33px] overflow-hidden">

          <div className="absolute -top-32 -right-24 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                Últimos 50 cambios
              </p>
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Historial de cursos
              </h3>
            </div>
            <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-5">
            {cargando ? (
              <p className="text-slate-400 text-sm py-8 text-center">Cargando…</p>
            ) : logs.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">Aún no hay cambios registrados.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const e = accionEstilo[log.accion] || accionEstilo.editar
                  return (
                    <div key={log.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                      <span className={`shrink-0 text-[9px] font-black uppercase tracking-[1.5px] px-2 py-1 rounded-md border ${e.bg} ${e.color}`}>
                        {e.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {log.curso_id}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {log.actor_email} · {tiempoRelativo(log.created_at)}
                        </p>
                      </div>
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
