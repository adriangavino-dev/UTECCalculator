// Descarga todos los cursos de Supabase a un archivo JSON (backup).
//
// Uso local:   npm run backup                 → backups/cursos-AAAA-MM-DD_HH-MM.json
//              npm run backup -- mi-archivo.json
// En GitHub Actions se usa para el backup diario (ver .github/workflows).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (en .env.local o como variables de entorno).')
  process.exit(1)
}

const res = await fetch(`${url}/rest/v1/cursos?select=*&order=id`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})
if (!res.ok) {
  console.error(`Error al leer los cursos: ${res.status} ${await res.text()}`)
  process.exit(1)
}

const cursos = await res.json()
// Nunca pisar un backup bueno con uno vacío
if (!Array.isArray(cursos) || cursos.length === 0) {
  console.error('Supabase devolvió 0 cursos: no se guarda el backup.')
  process.exit(1)
}

// Fecha y hora en el nombre para no pisar otro backup del mismo día
const d = new Date()
const dos = (n) => String(n).padStart(2, '0')
const sello = `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}_${dos(d.getHours())}-${dos(d.getMinutes())}`
const destino = process.argv[2] ?? `backups/cursos-${sello}.json`
mkdirSync(dirname(destino), { recursive: true })
writeFileSync(destino, JSON.stringify(cursos, null, 2) + '\n')
console.log(`✓ ${cursos.length} cursos guardados en ${destino}`)
