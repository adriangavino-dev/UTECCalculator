import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Footer } from '@/components/Footer'
import { CONTACTO, RESPONSABLE } from '@/lib/legal'

const ACTUALIZADO = '26 de octubre de 2026'

const H2 = ({ children }) => <h2 className="text-lg font-semibold text-foreground mt-9 mb-2.5">{children}</h2>
const P = ({ children }) => <p className="text-[15px] leading-relaxed text-foreground/85 mb-3">{children}</p>
const Lista = ({ children }) => <ul className="list-disc pl-5 space-y-1.5 text-[15px] leading-relaxed text-foreground/85 mb-3">{children}</ul>
const Correo = () => <a href={`mailto:${CONTACTO}`} className="text-primary underline underline-offset-2">{CONTACTO}</a>

const Terminos = () => (
  <>
    <P>
      Estos términos regulan el uso de la Calculadora de notas (en adelante, “la calculadora”), una herramienta web
      gratuita para estimar promedios de cursos. Al usarla aceptas estos términos. Si no estás de acuerdo, no la uses.
    </P>

    <H2>1. Proyecto independiente y no oficial</H2>
    <P>
      La calculadora es un proyecto estudiantil independiente creado y mantenido por {RESPONSABLE}.
      <strong> No está afiliada, patrocinada, respaldada ni administrada por la Universidad de Ingeniería y
      Tecnología (UTEC)</strong> ni por ninguna otra institución. “UTEC” y cualquier otra marca o nombre
      mencionado pertenecen a sus respectivos titulares y se usan solo para indicar con qué cursos es compatible
      la herramienta.
    </P>

    <H2>2. Los resultados son estimaciones</H2>
    <P>
      Los promedios, notas necesarias y simulaciones se calculan con los pesos de evaluación registrados en la
      calculadora y con las notas que tú ingresas. Son <strong>referenciales</strong>: pueden diferir de tu nota
      oficial por errores en los datos, cambios en el sílabo, reglas de redondeo, sustitutorios u otras
      políticas de la universidad.
    </P>
    <P>
      Tu nota oficial es únicamente la que publica tu universidad. Verifica siempre con tu sílabo y tus docentes.
      No tomes decisiones académicas (retirarte de un curso, no rendir una evaluación, etc.) basándote solo en
      la calculadora.
    </P>

    <H2>3. Información de los cursos</H2>
    <P>
      Los sistemas de evaluación se registran a partir de sílabos enviados por la comunidad y pueden contener
      errores u omisiones. Si encuentras uno, repórtalo desde la opción “Solicitar curso”. La calculadora solo
      guarda los nombres y pesos de las evaluaciones; no publica los sílabos.
    </P>

    <H2>4. Uso permitido</H2>
    <P>Puedes usar la calculadora para fines personales y académicos. No está permitido:</P>
    <Lista>
      <li>Intentar acceder sin autorización a cuentas, a la base de datos o a funciones de administración.</li>
      <li>Sobrecargar el servicio, automatizar consultas masivas o interferir con su funcionamiento.</li>
      <li>Usar la calculadora para engañar a otros, por ejemplo presentando sus resultados como notas oficiales.</li>
      <li>Copiar o redistribuir el servicio presentándolo como propio.</li>
    </Lista>

    <H2>5. Cuentas de administrador</H2>
    <P>
      El inicio de sesión con Google solo es necesario para quienes administran los cursos. Los administradores
      son responsables de que los datos que registran sean correctos. El acceso de administración puede
      retirarse en cualquier momento.
    </P>

    <H2>6. Donaciones</H2>
    <P>
      Las donaciones por Yape son voluntarias, no son un pago por un servicio y no otorgan beneficios, funciones
      adicionales ni derechos sobre la calculadora.
    </P>

    <H2>7. Propiedad intelectual</H2>
    <P>
      El diseño y el código de la calculadora pertenecen a su autor. El contenido de los sílabos pertenece a sus
      respectivos autores e instituciones.
    </P>

    <H2>8. Disponibilidad y responsabilidad</H2>
    <P>
      La calculadora se ofrece “tal cual”, sin garantías de exactitud, disponibilidad o continuidad. Puede
      cambiar, interrumpirse o dejar de funcionar sin aviso. En la medida permitida por la ley, el responsable no
      es responsable por daños o perjuicios derivados del uso de la calculadora o de decisiones tomadas con base
      en sus resultados.
    </P>

    <H2>9. Contacto y solicitudes de retiro</H2>
    <P>
      Para consultas, correcciones o si eres titular de algún derecho (incluida la universidad) y quieres que se
      modifique o retire algún contenido, escribe a <Correo />. Las solicitudes se atenderán a la brevedad.
    </P>

    <H2>10. Ley aplicable y cambios</H2>
    <P>
      Estos términos se rigen por las leyes de la República del Perú. Pueden actualizarse; la fecha de la última
      versión figura al inicio de esta página.
    </P>
  </>
)

const Privacidad = () => (
  <>
    <P>
      Esta política explica qué datos personales trata la Calculadora de notas, para qué y cuáles son tus
      derechos, de acuerdo con la Ley N.º 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.
    </P>

    <H2>1. Responsable</H2>
    <P>
      El responsable del tratamiento es {RESPONSABLE}. Puedes contactarlo en <Correo />.
    </P>

    <H2>2. Lo que se queda solo en tu dispositivo</H2>
    <P>
      Las notas que escribes, los cursos que marcas como tuyos y tu preferencia de tema (claro u oscuro) se
      guardan <strong>únicamente en el almacenamiento local de tu navegador</strong>. No se envían a ningún servidor
      ni el responsable puede verlos. Puedes borrarlos con el botón “Limpiar notas” o eliminando los datos del sitio
      en tu navegador.
    </P>

    <H2>3. Datos que sí se tratan</H2>
    <Lista>
      <li>
        <strong>Inicio de sesión con Google (opcional):</strong> si inicias sesión, se reciben tu nombre, correo
        electrónico, foto de perfil e identificador de Google, para identificarte y, si eres administrador,
        darte acceso a la gestión de cursos.
      </li>
      <li>
        <strong>Administradores:</strong> se guarda su correo y rol, y un registro de los cambios que hacen en los
        cursos (qué cambió, quién y cuándo), para poder revisar y deshacer errores.
      </li>
      <li>
        <strong>Solicitudes por WhatsApp:</strong> si envías un sílabo o una solicitud, los responsables reciben tu
        número, tu nombre de perfil y lo que envíes, solo para atender tu solicitud.
      </li>
      <li>
        <strong>Donaciones por Yape:</strong> si donas, Yape muestra al receptor los datos que su app comparte
        normalmente (por ejemplo, tu nombre). No se usan para ningún otro fin.
      </li>
      <li>
        <strong>Datos técnicos:</strong> los proveedores de alojamiento y tipografías pueden registrar tu dirección IP
        y datos del navegador al cargar la página, por motivos técnicos y de seguridad.
      </li>
    </Lista>
    <P>No se venden datos, no se usan para publicidad y no se usan cookies de seguimiento.</P>

    <H2>4. Proveedores y transferencia internacional</H2>
    <P>
      Para funcionar, la calculadora usa servicios de terceros que pueden almacenar o procesar datos fuera del
      Perú: <strong>Vercel</strong> (alojamiento), <strong>Supabase</strong> (base de datos e inicio de sesión),
      <strong> Google</strong> (inicio de sesión y tipografías), y <strong>WhatsApp/Meta</strong> y <strong>Yape</strong>{' '}
      cuando decides usarlos. Cada uno tiene su propia política de privacidad.
    </P>

    <H2>5. Conservación</H2>
    <P>
      Los datos de inicio de sesión y de administradores se conservan mientras la cuenta esté activa o mientras
      sean necesarios para la seguridad del servicio. Puedes pedir su eliminación en cualquier momento.
    </P>

    <H2>6. Tus derechos</H2>
    <P>
      Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición, y revocar tu
      consentimiento, escribiendo a <Correo />. Si consideras que no fueron atendidos, puedes acudir a la
      Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
    </P>

    <H2>7. Cambios</H2>
    <P>Esta política puede actualizarse; la fecha de la última versión figura al inicio de esta página.</P>
  </>
)

const PAGINAS = {
  '/terminos': { titulo: 'Términos de uso', Contenido: Terminos },
  '/privacidad': { titulo: 'Política de privacidad', Contenido: Privacidad },
}

export const PaginaLegal = ({ ruta }) => {
  const { titulo, Contenido } = PAGINAS[ruta]
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 min-w-0">
            <BrandMark />
            <span className="font-semibold text-[15px] text-foreground truncate">Calculadora de notas</span>
          </a>
          <ThemeToggle />
        </div>
      </header>
      <motion.main
        className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-16"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Volver a la calculadora
        </a>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mt-5">{titulo}</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">Última actualización: {ACTUALIZADO}</p>
        <Contenido />
      </motion.main>
      <Footer />
    </div>
  )
}
