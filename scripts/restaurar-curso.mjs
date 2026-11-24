// Genera el SQL para devolver un curso a como estaba en un backup.
// No toca la base de datos: imprime el SQL para pegarlo en Supabase → SQL Editor.
//
// Uso: npm run restaurar -- backups/cursos-2026-10-26.json CC1103
import { readFileSync } from 'node:fs'

const [archivo, id] = process.argv.slice(2)
if (!archivo || !id) {
  console.error('Uso: npm run restaurar -- <archivo-de-backup.json> <ID_DEL_CURSO>')
  process.exit(1)
}

const cursos = JSON.parse(readFileSync(archivo, 'utf8'))
const curso = cursos.find((c) => c.id.toLowerCase() === id.toLowerCase())
if (!curso) {
  console.error(`El curso ${id} no está en ${archivo}.`)
  process.exit(1)
}

// Texto SQL entre comillas simples
const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const carrera = [].concat(curso.carrera || [])
const etiquetas = Array.isArray(curso.etiquetas) ? curso.etiquetas : null

// Las etiquetas solo existen en backups hechos después de activarlas
const conEtiquetas = etiquetas !== null
console.log(`-- Restaurar ${curso.id} (${curso.nombre}) desde ${archivo}
insert into cursos (id, nombre, carrera, sistema${conEtiquetas ? ', etiquetas' : ''})
values (
  ${q(curso.id)},
  ${q(curso.nombre)},
  array[${carrera.map(q).join(', ')}]::text[],
  ${q(JSON.stringify(curso.sistema))}::jsonb${conEtiquetas ? `,
  array[${etiquetas.map(q).join(', ')}]::text[]` : ''}
)
on conflict (id) do update
  set nombre = excluded.nombre,
      carrera = excluded.carrera,
      sistema = excluded.sistema${conEtiquetas ? `,
      etiquetas = excluded.etiquetas` : ''};`)
