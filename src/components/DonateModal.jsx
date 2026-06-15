export const DonateModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-[#07061a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[70] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm max-h-[92vh] p-[1.5px] rounded-[34px] bg-gradient-to-br from-cyan-400/60 via-teal-400/40 to-sky-500/60 shadow-[0_25px_80px_-20px_rgba(56,189,248,0.4)]">
        <div className="relative w-full h-full max-h-[calc(92vh-3px)] flex flex-col bg-[#0c0824]/95 backdrop-blur-2xl rounded-[33px] overflow-hidden">

          <div className="absolute -top-32 -right-24 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-2">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                Apoya el proyecto
              </p>
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">Invítame un café</span>
                <span aria-hidden="true">☕</span>
              </h3>
            </div>
            <button onClick={onClose} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 text-center">
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Hago y mantengo esta calculadora en mis ratos libres. Si te ahorró
              un dolor de cabeza sacando promedios y quieres apoyar para que siga
              viva y mejorando, puedes donar lo que quieras por Yape. 💜
            </p>

            {/* Tarjeta del QR */}
            <div className="relative inline-block p-[1.5px] rounded-3xl bg-gradient-to-br from-cyan-400/60 to-teal-400/60 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)]">
              <div className="bg-white rounded-[22px] p-3">
                <img
                  src="/yape-qr.png"
                  alt="QR de Yape para donar"
                  className="w-56 h-56 object-contain rounded-xl"
                />
              </div>
            </div>

            <p className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] font-bold text-cyan-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
              Escanea con la app de Yape
            </p>

            <p className="mt-4 text-[11px] text-slate-500 font-medium">
              ¡Gracias de corazón por el apoyo! No es obligatorio, la calculadora
              siempre será gratis para todos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
