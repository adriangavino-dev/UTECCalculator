import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Une clases de Tailwind sin conflictos (convención de shadcn / 21st.dev)
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
