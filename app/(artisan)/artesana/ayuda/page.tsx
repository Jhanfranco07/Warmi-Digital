import { Mail, MessageCircle, ShieldCheck } from "lucide-react";

export default function ArtisanHelpPage() {
  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header>
          <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl">
            Ayuda
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5b4a42]">
            Encuentra canales de soporte para resolver dudas sobre aprendizaje, talleres,
            vitrina cultural y uso de la plataforma.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <HelpCard
            icon={MessageCircle}
            title="Acompañamiento"
            text="Escribe a tu facilitadora desde Mensajes cuando necesites orientación sobre tu ruta."
          />
          <HelpCard
            icon={Mail}
            title="Correo de soporte"
            text="Usa los canales institucionales definidos por Warmi Digital para consultas administrativas."
          />
          <HelpCard
            icon={ShieldCheck}
            title="Seguridad"
            text="No compartas tu contraseña. Actualízala desde Mi perfil si sospechas de un acceso no autorizado."
          />
        </section>
      </div>
    </main>
  );
}

function HelpCard({
  icon: Icon,
  title,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-6 shadow-[0_18px_44px_rgba(122,49,0,0.08)]">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff0d6] text-[#d7920c]">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
      <p className="mt-3 text-base leading-7 text-[#5b4a42]">{text}</p>
    </article>
  );
}
