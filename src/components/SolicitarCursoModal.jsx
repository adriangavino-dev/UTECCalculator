import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Modal } from './Modal'

const CONTACTOS = [
  { numero: '51944199690', label: '944 199 690' },
  { numero: '51983893217', label: '983 893 217' },
]

const armarMensaje = (tipo, curso, detalle) => {
  const lineas = [
    tipo === 'agregar'
      ? 'Hola! Quiero solicitar que agreguen un curso a la Calculadora de notas.'
      : 'Hola! Quiero solicitar que modifiquen un curso de la Calculadora de notas.',
    `Curso: ${curso.trim() || '(sin especificar)'}`,
  ]
  if (detalle.trim()) lineas.push(`Detalle: ${detalle.trim()}`)
  lineas.push('Te adjunto el sílabo.')
  return lineas.join('\n')
}

const campo = 'w-full px-3.5 py-2.5 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'

export const SolicitarCursoModal = ({ onClose, cursos = [], inicial }) => {
  const [tipo, setTipo] = useState(inicial?.tipo ?? 'agregar')
  const [curso, setCurso] = useState(inicial?.curso ?? '')
  const [detalle, setDetalle] = useState('')

  const mensaje = armarMensaje(tipo, curso, detalle)

  return (
    <Modal titulo="Solicitar curso" subtitulo="¿Falta tu curso o tiene un peso mal?" onClose={onClose}>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        Mándanos el sílabo por WhatsApp y lo agregamos o corregimos.
      </p>

      {/* Tipo de solicitud */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted mb-4" role="radiogroup" aria-label="Tipo de solicitud">
        {[
          { id: 'agregar', label: 'Agregar' },
          { id: 'modificar', label: 'Modificar' },
        ].map((op) => (
          <button
            key={op.id}
            type="button"
            role="radio"
            aria-checked={tipo === op.id}
            onClick={() => setTipo(op.id)}
            className={`h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tipo === op.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="solicitud-curso">
        {tipo === 'agregar' ? 'Nombre o código del curso' : 'Curso a modificar'}
      </label>
      <input
        id="solicitud-curso"
        type="text"
        value={curso}
        onChange={(e) => setCurso(e.target.value)}
        list={tipo === 'modificar' ? 'solicitud-cursos-lista' : undefined}
        placeholder={tipo === 'agregar' ? 'Ej. CS1111 Programación I' : 'Busca el curso'}
        className={`${campo} mb-4`}
      />
      <datalist id="solicitud-cursos-lista">
        {cursos.map((c) => (
          <option key={c.id} value={`${c.id} ${c.nombre}`} />
        ))}
      </datalist>

      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="solicitud-detalle">
        {tipo === 'agregar' ? 'Comentario (opcional)' : '¿Qué hay que cambiar?'}
      </label>
      <textarea
        id="solicitud-detalle"
        rows={3}
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        placeholder={tipo === 'agregar' ? 'Sección, profesor, etc.' : 'Ej. la EC2 pesa 25%, no 20%'}
        className={`${campo} mb-5 resize-none`}
      />

      {/* Enviar por WhatsApp */}
      <div className="flex flex-col gap-2">
        {CONTACTOS.map((c) => (
          <a
            key={c.numero}
            href={`https://wa.me/${c.numero}?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.99] transition"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar a {c.label}
          </a>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Se abrirá WhatsApp con el mensaje listo. No olvides adjuntar el sílabo (PDF o foto) antes de enviarlo.
      </p>
    </Modal>
  )
}
