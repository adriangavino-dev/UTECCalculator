import { Modal } from './Modal'

export const DonateModal = ({ onClose }) => (
  <Modal titulo="Apoya el proyecto" subtitulo="Donación voluntaria por Yape" onClose={onClose} className="sm:max-w-sm">
    <div className="text-center">
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-left">
        Hago y mantengo esta calculadora en mis ratos libres. Si te ahorró un dolor de cabeza sacando
        promedios y quieres apoyar para que siga viva y mejorando, puedes donar lo que quieras por Yape.
      </p>

      <div className="inline-block p-3 rounded-xl bg-white border border-border">
        <img src="/yape-qr.png" alt="Código QR de Yape para donar" className="w-56 h-56 object-contain" />
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">Escanea con la app de Yape</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Es totalmente opcional: la calculadora siempre será gratis. La donación es un aporte voluntario
        y no compra ningún servicio ni beneficio adicional.
      </p>
    </div>
  </Modal>
)
