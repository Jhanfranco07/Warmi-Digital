import { Award, BookOpen, CircleHelp, MessageCircle, Users } from "lucide-react";

import {
  ArtisanActionCard,
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";

const moduleContent: Record<
  string,
  {
    eyebrow: string;
    description: string;
    imageUrl: string;
    stats: Array<{
      title: string;
      value: string;
      description: string;
      icon: typeof Users;
      color: string;
    }>;
    items: Array<{ title: string; description: string; meta: string }>;
    actions: Array<{
      href: string;
      title: string;
      description: string;
      icon: typeof Users;
      color: string;
    }>;
  }
> = {
  "Mi comunidad": {
    eyebrow: "Comunidad Qantu",
    description:
      "Un espacio para reconocer a otras artesanas, compartir avances, resolver dudas y mantener viva la red de apoyo de San Miguel, Cajamarca.",
    imageUrl: "/images/discover/taller.png",
    stats: [
      {
        title: "Artesanas activas",
        value: "24",
        description: "Participan en talleres, rutas y encuentros comunitarios.",
        icon: Users,
        color: "bg-[#2f62a3]"
      },
      {
        title: "Saberes compartidos",
        value: "8",
        description: "Técnicas, historias y consejos documentados por la comunidad.",
        icon: BookOpen,
        color: "bg-[#c02a68]"
      }
    ],
    items: [
      {
        meta: "Encuentro",
        title: "Círculo de historias textiles",
        description:
          "Las artesanas preparan relatos cortos sobre el origen de sus piezas."
      },
      {
        meta: "Apoyo",
        title: "Dudas sobre fotografías con celular",
        description: "La facilitadora revisará ejemplos y dará recomendaciones sencillas."
      },
      {
        meta: "Territorio",
        title: "San Miguel, Cajamarca",
        description:
          "La comunidad mantiene su identidad como punto de partida del aprendizaje."
      }
    ],
    actions: [
      {
        href: "/artesana/mensajes",
        title: "Escribir a mi facilitadora",
        description: "Consulta dudas y comparte tus avances.",
        icon: MessageCircle,
        color: "bg-[#17c3cf]"
      },
      {
        href: "/artesana/talleres",
        title: "Ver talleres comunitarios",
        description: "Revisa los encuentros disponibles.",
        icon: Users,
        color: "bg-[#f17a2a]"
      }
    ]
  },
  Mensajes: {
    eyebrow: "Acompañamiento",
    description:
      "Centraliza tus conversaciones con facilitadoras para pedir ayuda, enviar avances y recibir orientación paso a paso.",
    imageUrl: "/images/learning/aprender-hero.png",
    stats: [
      {
        title: "Conversaciones",
        value: "3",
        description: "Canales de apoyo vinculados a aprendizaje, historia y vitrina.",
        icon: MessageCircle,
        color: "bg-[#b5245b]"
      },
      {
        title: "Tiempo de respuesta",
        value: "24 h",
        description: "Referencia de atención para consultas formativas.",
        icon: CircleHelp,
        color: "bg-[#2f62a3]"
      }
    ],
    items: [
      {
        meta: "Facilitadora",
        title: "Revisión de mi historia cultural",
        description:
          "Puedes enviar tu borrador para recibir comentarios antes de publicarlo."
      },
      {
        meta: "Aprendizaje",
        title: "Duda sobre correo y documentos",
        description: "Comparte capturas o preguntas sobre el módulo de formación."
      },
      {
        meta: "Vitrina",
        title: "Preparar fotos de productos",
        description: "Pide orientación para mejorar iluminación, fondo y encuadre."
      }
    ],
    actions: [
      {
        href: "/artesana/ayuda",
        title: "Necesito ayuda",
        description: "Encuentra canales de soporte y preguntas frecuentes.",
        icon: CircleHelp,
        color: "bg-[#f5b900]"
      },
      {
        href: "/artesana/aprender",
        title: "Volver a mi aprendizaje",
        description: "Continúa tu ruta formativa.",
        icon: BookOpen,
        color: "bg-[#2f62a3]"
      }
    ]
  },
  "Mis logros": {
    eyebrow: "Autonomía digital",
    description:
      "Tus logros no solo miden ventas: reconocen cursos completados, historias documentadas, participación comunitaria y confianza digital.",
    imageUrl: "/images/discover/aprende.png",
    stats: [
      {
        title: "Insignias",
        value: "4",
        description: "Reconocimientos iniciales por avanzar en la ruta Warmi.",
        icon: Award,
        color: "bg-[#f5b900]"
      },
      {
        title: "Hitos culturales",
        value: "2",
        description: "Historia y técnica listas para fortalecer tu perfil.",
        icon: BookOpen,
        color: "bg-[#c02a68]"
      }
    ],
    items: [
      {
        meta: "Semilla Digital",
        title: "Inicio de ruta",
        description: "Primer paso para usar herramientas digitales con acompañamiento."
      },
      {
        meta: "Historia Viva",
        title: "Relato cultural iniciado",
        description: "Tu memoria familiar y comunitaria ya forma parte del proceso."
      },
      {
        meta: "Comunidad",
        title: "Participación en taller",
        description: "La asistencia también cuenta como avance de autonomía."
      }
    ],
    actions: [
      {
        href: "/artesana/mi-historia",
        title: "Fortalecer mi historia",
        description: "Completa tu ficha de patrimonio cultural.",
        icon: BookOpen,
        color: "bg-[#b5245b]"
      },
      {
        href: "/artesana/aprender",
        title: "Continuar cursos",
        description: "Suma nuevos avances formativos.",
        icon: Award,
        color: "bg-[#f17a2a]"
      }
    ]
  },
  Ayuda: {
    eyebrow: "Soporte Warmi",
    description:
      "Encuentra respuestas rápidas y canales de contacto para continuar aprendiendo sin quedarte sola en el proceso.",
    imageUrl: "/images/learning/instituciones.png",
    stats: [
      {
        title: "Correo",
        value: "24 h",
        description: "Respuesta estimada para consultas de formación.",
        icon: MessageCircle,
        color: "bg-[#17c3cf]"
      },
      {
        title: "WhatsApp",
        value: "+51",
        description: "Canal de orientación para dudas urgentes o prácticas.",
        icon: CircleHelp,
        color: "bg-[#14715d]"
      }
    ],
    items: [
      {
        meta: "Cuenta",
        title: "No puedo ingresar",
        description:
          "Verifica tu correo, contraseña y rol seleccionado antes de escribir soporte."
      },
      {
        meta: "Cursos",
        title: "No encuentro una lección",
        description: "Revisa Mi aprendizaje o pide ayuda a tu facilitadora."
      },
      {
        meta: "Vitrina",
        title: "Quiero publicar una pieza",
        description:
          "Completa primero tu historia cultural para dar contexto a tus productos."
      }
    ],
    actions: [
      {
        href: "mailto:warmidigital@gmail.com",
        title: "Enviar correo",
        description: "warmidigital@gmail.com",
        icon: MessageCircle,
        color: "bg-[#b5245b]"
      },
      {
        href: "https://wa.me/51999666333",
        title: "Abrir WhatsApp",
        description: "+51 999 666 333",
        icon: CircleHelp,
        color: "bg-[#14715d]"
      }
    ]
  }
};

export function ComingSoon({ title }: { title: string }) {
  const content = moduleContent[title] ?? moduleContent.Ayuda;

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow={content.eyebrow}
        title={title}
        description={content.description}
        imageUrl={content.imageUrl}
      />

      <section className="grid gap-5 md:grid-cols-2">
        {content.stats.map((stat) => (
          <ArtisanStatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ArtisanPanel title="Lo que encontrarás aquí" eyebrow="Ruta activa">
          <div className="grid gap-4">
            {content.items.map((item) => (
              <ArtisanListItem key={item.title} {...item} />
            ))}
          </div>
        </ArtisanPanel>

        <ArtisanPanel title="Acciones rápidas" eyebrow="Siguiente paso">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {content.actions.map((action) =>
              action.href.startsWith("http") || action.href.startsWith("mailto:") ? (
                <a
                  key={action.title}
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group border border-[#f0c7bb] bg-white p-5 shadow-[0_14px_36px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_58px_rgba(122,49,0,0.12)]"
                >
                  <span
                    className={`${action.color} inline-flex rounded-full p-3 text-white`}
                  >
                    <action.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-2xl font-bold text-[#1b1c1a]">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                    {action.description}
                  </p>
                </a>
              ) : (
                <ArtisanActionCard key={action.title} {...action} />
              )
            )}
          </div>
        </ArtisanPanel>
      </section>

      <div className="border border-[#f0c7bb] bg-[#f7e6d8] p-5 text-center font-ui text-sm font-bold text-[#123f78] md:text-base">
        Warmi Digital acompaña tu aprendizaje, tu comunidad y tu patrimonio cultural.
      </div>
    </ArtisanShell>
  );
}
