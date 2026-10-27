import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTema } from '@/logic/useTema'

export const ThemeToggle = () => {
  const { oscuro, alternar } = useTema()
  return (
    <button
      type="button"
      onClick={alternar}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer overflow-hidden"
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={oscuro ? 'luna' : 'sol'}
          initial={{ y: 14, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {oscuro ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
