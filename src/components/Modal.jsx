import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocoModal } from '@/logic/useFocoModal'

// Ventana modal con animación de entrada/salida.
// El padre la monta dentro de <AnimatePresence> para que también anime al cerrar.
export const Modal = ({ titulo, subtitulo, onClose, children, className, z = 'z-[70]' }) => {
  const panelRef = useFocoModal()
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className={cn('fixed inset-0 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]', z)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className={cn('outline-none w-full sm:max-w-md max-h-[92vh] flex flex-col bg-card text-card-foreground border border-border rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden', className)}
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
            {subtitulo && <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 pb-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}
