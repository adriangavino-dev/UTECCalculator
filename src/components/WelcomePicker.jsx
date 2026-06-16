import { BrandMark } from './BrandMark'

export const WelcomePicker = ({ carreras, onPick }) => {
  return (
    <div className="max-w-md mx-auto mt-16 md:mt-24 animate-fade-in">
      <div className="relative p-[1.5px] rounded-[40px] bg-gradient-to-br from-cyan-400/60 via-teal-400/40 to-sky-500/60 animate-pulse-glow">
        <div className="relative bg-[#0c0824]/90 backdrop-blur-2xl p-10 rounded-[38px] text-center overflow-hidden">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative">
            <div className="flex justify-center mb-8">
              <BrandMark size="hero" float />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
                Calculadora de Notas
              </span>
            </h1>
            <p className="text-cyan-300/70 mb-10 text-[10px] uppercase tracking-[4px] font-bold">
              ◢ Selecciona tu carrera ◣
            </p>

            <div className="flex flex-col gap-3">
              {carreras.map((nombre) => (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => onPick(nombre)}
                  className="group relative w-full overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-slate-100 font-semibold py-4 px-5 rounded-2xl border border-white/10 hover:border-cyan-300/50 transition-all active:scale-[0.98] text-base flex items-center justify-between cursor-pointer"
                >
                  <span className="absolute inset-y-0 left-0 w-0 group-hover:w-full bg-gradient-to-r from-cyan-400/15 via-teal-400/10 to-transparent transition-all duration-500"></span>
                  <span className="relative flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] group-hover:bg-teal-300 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.9)] transition-all"></span>
                    {nombre}
                  </span>
                  <span className="relative text-cyan-300 group-hover:text-teal-300 group-hover:translate-x-1 transition-all text-lg">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-500 mt-6 tracking-[3px] uppercase font-bold">
        <span className="text-cyan-400">UTEC</span> · Sistema de Cálculo
      </p>
    </div>
  )
}
