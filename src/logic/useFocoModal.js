import { useEffect, useRef } from 'react'

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Accesibilidad de ventanas modales: al abrir lleva el foco adentro,
// Tab no se escapa a la página de atrás y al cerrar el foco vuelve a donde estaba.
export const useFocoModal = () => {
  const ref = useRef(null)

  useEffect(() => {
    const previo = document.activeElement
    const nodo = ref.current
    nodo?.focus()

    const onKey = (e) => {
      if (e.key !== 'Tab' || !nodo) return
      const els = [...nodo.querySelectorAll(ENFOCABLES)].filter((el) => el.offsetParent !== null)
      if (els.length === 0) return
      const primero = els[0]
      const ultimo = els[els.length - 1]
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === nodo)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previo?.focus?.()
    }
  }, [])

  return ref
}
