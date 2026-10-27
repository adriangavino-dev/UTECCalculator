import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const accionEstilo = {
  crear: { label: 'Creó', color: 'text-success', bg: 'bg-success-soft border-success/30' },
  editar: { label: 'Editó', color: 'text-primary', bg: 'bg-accent border-primary/30' },
  eliminar: { label: 'Eliminó', color: 'text-danger', bg: 'bg-danger-soft border-danger/30' },
}

const tiempoRelativo = (iso) => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const HistorialModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let activo = true
    setCargando(true)
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
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-background dark:bg-background backdrop-blur-[2px] flex items-center justify-center p-4 z-[60]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg max-h-[88vh] rounded-2xl border border-border shadow-2xl">
        <div className="relative w-full h-full max-h-[calc(88vh-3px)] flex flex-col bg-card rounded-2xl overflow-hidden">

          <div className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-6 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-primary font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Últimos 50 cambios
              </p>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Historial de cursos
              </h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted border border-border text-foreground/80 hover:text-foreground transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-5">
            {cargando ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Cargando…</p>
            ) : logs.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Aún no hay cambios registrados.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const e = accionEstilo[log.accion] || accionEstilo.editar
                  return (
                    <div key={log.id} className="flex items-center gap-3 bg-muted border border-border rounded-2xl px-4 py-3">
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-md border ${e.bg} ${e.color}`}>
                        {e.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">
                          {log.curso_id}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
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
