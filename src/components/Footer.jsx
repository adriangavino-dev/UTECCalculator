import { CONTACTO } from '@/lib/legal'

export const Footer = () => (
  <footer className="border-t border-border mt-auto">
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-28 md:pb-8 flex flex-col gap-4 text-sm text-muted-foreground">
      <p className="max-w-3xl leading-relaxed">
        <strong className="font-medium text-foreground">Proyecto estudiantil independiente.</strong> No está afiliado,
        patrocinado ni respaldado por la Universidad de Ingeniería y Tecnología (UTEC). Los resultados son
        referenciales: tu nota oficial es la que publica la universidad.
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span>© {new Date().getFullYear()} Calculadora de notas</span>
        <a href="/terminos" className="hover:text-foreground underline-offset-2 hover:underline">Términos de uso</a>
        <a href="/privacidad" className="hover:text-foreground underline-offset-2 hover:underline">Privacidad</a>
        <a href={`mailto:${CONTACTO}`} className="hover:text-foreground underline-offset-2 hover:underline">Contacto</a>
      </div>
    </div>
  </footer>
)
