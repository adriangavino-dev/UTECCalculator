import { useEffect, useState } from 'react'

// Tema claro / oscuro. Por defecto sigue al sistema; al elegir uno se guarda.
const leer = () => {
  try { return localStorage.getItem('tema') || 'sistema' } catch { return 'sistema' }
}
const consulta = () => window.matchMedia('(prefers-color-scheme: dark)')

export const useTema = () => {
  const [tema, setTema] = useState(leer)
  const [sistemaOscuro, setSistemaOscuro] = useState(() => consulta().matches)
  const oscuro = tema === 'oscuro' || (tema === 'sistema' && sistemaOscuro)

  // Seguir los cambios del sistema
  useEffect(() => {
    const mq = consulta()
    const onCambio = (e) => setSistemaOscuro(e.matches)
    mq.addEventListener('change', onCambio)
    return () => mq.removeEventListener('change', onCambio)
  }, [])

  // Aplicar la clase en <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
  }, [oscuro])

  const alternar = () => {
    const nuevo = oscuro ? 'claro' : 'oscuro'
    try { localStorage.setItem('tema', nuevo) } catch { /* modo privado */ }
    setTema(nuevo)
  }

  return { oscuro, alternar }
}
