import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { formatNota } from '@/logic/useCalculadora'

// Número que se desliza al nuevo valor cuando cambia (p. ej. al escribir una nota)
export const NumeroAnimado = ({ valor, formato = formatNota, className }) => {
  const reducir = useReducedMotion()
  const mv = useMotionValue(valor ?? 0)
  const texto = useTransform(mv, (v) => formato(v))

  useEffect(() => {
    if (valor === null || valor === undefined) return
    const control = animate(mv, valor, { duration: reducir ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] })
    return () => control.stop()
  }, [valor, mv, reducir])

  if (valor === null || valor === undefined) return <span className={className}>—</span>
  return <motion.span className={className}>{texto}</motion.span>
}
