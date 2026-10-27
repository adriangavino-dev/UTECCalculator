import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X } from 'lucide-react'

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
      {/* Encima del botón de Donar (y de la barra inferior en móvil) */}
      <div className="fixed bottom-[150px] md:bottom-20 right-4 md:right-5 z-[80] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const estilos = {
  success: { Icono: Check, fondo: 'bg-success text-white dark:text-black' },
  error: { Icono: X, fondo: 'bg-danger text-white dark:text-black' },
  info: { Icono: Info, fondo: 'bg-primary text-primary-foreground' },
}

const Toast = ({ mensaje, tipo, onClose }) => {
  const { Icono, fondo } = estilos[tipo] || estilos.success
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
      className="pointer-events-auto flex items-center gap-3 pl-3 pr-3.5 py-3 rounded-xl bg-card border border-border shadow-lg min-w-[240px] max-w-sm"
    >
      <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center ${fondo}`}>
        <Icono className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
      <span className="text-sm font-medium text-foreground flex-1 break-all">{mensaje}</span>
      <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Cerrar aviso">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
