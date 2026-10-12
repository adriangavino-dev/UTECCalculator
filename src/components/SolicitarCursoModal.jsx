import { useState } from 'react'

const CONTACTOS = [
  { numero: '51944199690', label: '944 199 690' },
  { numero: '51983893217', label: '983 893 217' },
]

const armarMensaje = (tipo, curso, detalle) => {
  const lineas = [
    tipo === 'agregar'
      ? 'Hola! Quiero solicitar que agreguen un curso a la Calculadora UTEC.'
      : 'Hola! Quiero solicitar que modifiquen un curso de la Calculadora UTEC.',
    `Curso: ${curso.trim() || '(sin especificar)'}`,
  ]
  if (detalle.trim()) lineas.push(`Detalle: ${detalle.trim()}`)
  lineas.push('Te adjunto el sílabo.')
  return lineas.join('\n')
}

export const SolicitarCursoModal = ({ isOpen, onClose, cursos = [] }) => {
  const [tipo, setTipo] = useState('agregar')
  const [curso, setCurso] = useState('')
  const [detalle, setDetalle] = useState('')

  if (!isOpen) return null

  const mensaje = armarMensaje(tipo, curso, detalle)

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[70] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm max-h-[92vh] rounded-[34px] border border-white/10 shadow-2xl shadow-black/50">
        <div className="relative w-full h-full max-h-[calc(92vh-3px)] flex flex-col bg-[#0c0824] rounded-[33px] overflow-hidden">

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-2">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                ¿Falta tu curso?
              </p>
              <h3 className="text-xl font-bold tracking-tight text-slate-100">
                Solicitar curso
              </h3>
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Si tu curso no está o tiene los pesos mal, mándanos el sílabo por
              WhatsApp y lo agregamos o corregimos.
            </p>

            {/* Tipo de solicitud */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-4" role="radiogroup" aria-label="Tipo de solicitud">
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
                  className={`py-2 rounded-xl text-[11px] uppercase tracking-[2px] font-black transition-colors cursor-pointer ${
                    tipo === op.id
                      ? 'bg-cyan-300 text-[#0a0420]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <label className="block text-[10px] uppercase tracking-[2px] font-bold text-slate-400 mb-1.5" htmlFor="solicitud-curso">
              {tipo === 'agregar' ? 'Nombre o código del curso' : 'Curso a modificar'}
            </label>
            <input
              id="solicitud-curso"
              type="text"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              list={tipo === 'modificar' ? 'solicitud-cursos-lista' : undefined}
              placeholder={tipo === 'agregar' ? 'Ej. CS1111 Programación I' : 'Busca el curso'}
              className="w-full mb-4 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-300/60"
            />
            <datalist id="solicitud-cursos-lista">
              {cursos.map((c) => (
                <option key={c.id} value={`${c.id} ${c.nombre}`} />
              ))}
            </datalist>

            <label className="block text-[10px] uppercase tracking-[2px] font-bold text-slate-400 mb-1.5" htmlFor="solicitud-detalle">
              {tipo === 'agregar' ? 'Comentario (opcional)' : '¿Qué hay que cambiar?'}
            </label>
            <textarea
              id="solicitud-detalle"
              rows={3}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder={tipo === 'agregar' ? 'Sección, profesor, etc.' : 'Ej. la EC2 pesa 25%, no 20%'}
              className="w-full mb-5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-300/60 resize-none"
            />

            {/* Enviar por WhatsApp */}
            <div className="flex flex-col gap-2">
              {CONTACTOS.map((c) => (
                <a
                  key={c.numero}
                  href={`https://wa.me/${c.numero}?text=${encodeURIComponent(mensaje)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-300 hover:bg-cyan-200 text-[#0a0420] font-black text-[11px] uppercase tracking-[2px] active:scale-95 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
                  </svg>
                  Enviar a {c.label}
                </a>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-slate-500 font-medium text-center">
              Se abrirá WhatsApp con el mensaje listo. No olvides adjuntar el
              sílabo (PDF o foto) antes de enviarlo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
