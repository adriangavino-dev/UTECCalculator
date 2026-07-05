import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  return ctx || { showToast: () => {} }
}

let idCounter = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  const showToast = useCallback((mensaje, tipo = 'success') => {
    const id = ++idCounter
    setToasts((t) => [...t, { id, mensaje, tipo }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const estilos = {
  success: { border: 'border-teal-300/40', icon: '✓', iconBg: 'bg-teal-300', text: 'text-teal-100' },
  error: { border: 'border-rose-400/40', icon: '✕', iconBg: 'bg-rose-400', text: 'text-rose-100' },
  info: { border: 'border-sky-300/40', icon: 'ℹ', iconBg: 'bg-sky-300', text: 'text-sky-100' },
}

const Toast = ({ mensaje, tipo, onClose }) => {
  const s = estilos[tipo] || estilos.success
  return (
    <div className={`pointer-events-auto flex items-center gap-3 pl-3 pr-4 py-3 rounded-2xl bg-[#0c0824] border ${s.border} shadow-lg shadow-black/40 animate-fade-in min-w-[240px] max-w-sm`}>
      <span className={`w-7 h-7 shrink-0 rounded-lg ${s.iconBg} text-[#0a0420] font-black flex items-center justify-center text-sm`}>
        {s.icon}
      </span>
      <span className={`text-sm font-semibold ${s.text} flex-1`}>{mensaje}</span>
      <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs" aria-label="Cerrar aviso">
        ✕
      </button>
    </div>
  )
}
