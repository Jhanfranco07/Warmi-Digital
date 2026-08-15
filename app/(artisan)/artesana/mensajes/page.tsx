import Image from "next/image";
import {
  CalendarDays,
  Clock,
  MapPin,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  SlidersHorizontal,
  Smile
} from "lucide-react";

const conversations = [
  {
    name: "Comunidad Qantu",
    message: "Hola Elena. Te compartimos los detalles del próximo taller.",
    time: "10:30",
    unread: 2,
    image: "/images/brand/warmi-isotipo.png",
    type: "brand"
  },
  {
    name: "María Apaza",
    message: "Gracias por la información, me será de gran ayuda.",
    time: "Ayer",
    unread: 1,
    image: "/images/auth/artesana.png"
  },
  {
    name: "Soporte Warmi Digital",
    message: "Hemos actualizado la información de tu taller.",
    time: "12/08/2026",
    unread: 0,
    image: "/images/brand/warmi-isotipo.png",
    type: "flower"
  },
  {
    name: "Ana Quispe",
    message: "¿Podrías enviarme más fotos de tu trabajo?",
    time: "10/08/2026",
    unread: 0,
    image: "/images/home/bienvenida-warmi.png"
  },
  {
    name: "Talleres y Convocatorias",
    message: "Nueva convocatoria disponible: Feria de saberes textiles.",
    time: "08/08/2026",
    unread: 0,
    image: "/images/brand/warmi-isotipo.png",
    type: "megaphone"
  },
  {
    name: "Luis Mamani",
    message: "Perfecto, estaré atento. Gracias.",
    time: "05/08/2026",
    unread: 0,
    image: "/images/discover/emprende.png"
  }
];

export default function ArtisanMessagesPage() {
  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mensajes <span className="text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Conversa, resuelve dudas y construye comunidad.
            </p>
          </div>
          <span className="relative hidden h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)] md:block">
            <Image
              src="/images/auth/artesana.png"
              alt="Elena Mamani"
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
        </header>

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
          <aside className="overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <div className="grid gap-4 border-b border-[#ecd0bd] p-5 md:grid-cols-[1fr_56px]">
              <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-[#7a5b4a]">
                <Search className="h-5 w-5" />
                Buscar conversaciones
              </div>
              <button
                type="button"
                className="grid h-14 place-items-center rounded-lg border border-[#ecd0bd] text-[#7a3100]"
                aria-label="Filtrar conversaciones"
              >
                <SlidersHorizontal className="h-6 w-6" />
              </button>
            </div>

            <div>
              {conversations.map((conversation, index) => (
                <article
                  key={conversation.name}
                  className={`flex gap-4 border-b border-[#f1ddcf] p-5 transition-colors duration-300 hover:bg-[#fff5ed] ${
                    index === 0 ? "bg-[#fff8f1]" : "bg-white"
                  }`}
                >
                  <Avatar
                    image={conversation.image}
                    name={conversation.name}
                    type={conversation.type}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate font-ui text-lg font-extrabold text-[#1b1c1a]">
                        {conversation.name}
                      </h2>
                      <span className="text-sm text-[#7a5b4a]">{conversation.time}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[#5b4a42]">
                      {conversation.message}
                    </p>
                  </div>
                  {conversation.unread ? (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#b5245b] text-xs font-bold text-white">
                      {conversation.unread}
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[760px] flex-col overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <header className="flex items-center justify-between border-b border-[#ecd0bd] p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  image="/images/brand/warmi-isotipo.png"
                  name="Comunidad Qantu"
                  type="brand"
                />
                <div>
                  <h2 className="font-ui text-xl font-extrabold text-[#1b1c1a]">
                    Comunidad Qantu
                  </h2>
                  <p className="text-sm text-[#5b4a42]">
                    Comunidad de artesanas y artesanos
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#2f9b62]">En línea</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#7a3100]">
                <Search className="h-6 w-6" />
                <MoreVertical className="h-6 w-6" />
              </div>
            </header>

            <div className="relative flex-1 space-y-6 overflow-hidden p-6">
              <div className="absolute right-10 top-16 h-72 w-72 opacity-10">
                <Image
                  src="/images/brand/warmi-isotipo.png"
                  alt=""
                  fill
                  sizes="288px"
                  className="object-contain"
                />
              </div>
              <div className="relative mx-auto w-fit rounded-full bg-[#f8eadc] px-5 py-2 text-sm font-bold text-[#7a3100]">
                Hoy
              </div>

              <MessageBubble align="left" time="10:30">
                <p>Hola Elena. Te compartimos los detalles del próximo taller.</p>
                <div className="mt-4 rounded-xl border border-[#ecd0bd] bg-white p-4">
                  <h3 className="mb-3 font-ui font-extrabold text-[#1b1c1a]">
                    Taller: Contar la historia de una pieza
                  </h3>
                  <Detail icon={CalendarDays} text="15 de agosto de 2026" />
                  <Detail icon={Clock} text="22:00" />
                  <Detail icon={MapPin} text="Centro comunal Qantu" />
                </div>
              </MessageBubble>

              <MessageBubble align="left" time="10:31">
                Esperamos contar con tu participación.
              </MessageBubble>

              <MessageBubble align="right" time="10:32">
                Muchas gracias. Ahí estaré presente.
              </MessageBubble>

              <MessageBubble align="left" time="10:33">
                ¡Excelente!
              </MessageBubble>
            </div>

            <footer className="border-t border-[#ecd0bd] p-5">
              <div className="flex items-center gap-4">
                <div className="flex min-h-14 flex-1 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-[#7a5b4a]">
                  <Paperclip className="h-5 w-5" />
                  Escribe un mensaje...
                  <Smile className="ml-auto h-5 w-5" />
                </div>
                <button
                  type="button"
                  className="grid h-14 w-14 place-items-center rounded-lg bg-[#b5245b] text-white shadow-[0_16px_30px_rgba(181,36,91,0.25)] transition-transform duration-300 hover:-translate-y-1"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#7a5b4a]">
                Sé amable y respetuosa en tus conversaciones.
              </p>
            </footer>
          </section>
        </section>
      </div>
    </main>
  );
}

function Avatar({ image, name, type }: { image: string; name: string; type?: string }) {
  return (
    <span
      className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full ${
        type === "brand" ? "bg-[#d89911] p-3" : "bg-[#fff1e5]"
      }`}
    >
      <Image src={image} alt={name} fill sizes="64px" className="object-cover" />
    </span>
  );
}

function MessageBubble({
  align,
  time,
  children
}: {
  align: "left" | "right";
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[680px] rounded-xl border px-5 py-4 shadow-[0_12px_28px_rgba(122,49,0,0.06)] ${
          align === "right"
            ? "border-[#f4c6d8] bg-[#ffdce8] text-[#1b1c1a]"
            : "border-[#ecd0bd] bg-white text-[#1b1c1a]"
        }`}
      >
        <div className="text-base leading-7">{children}</div>
        <p className="mt-2 text-right text-xs text-[#7a5b4a]">{time}</p>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <p className="mt-2 flex items-center gap-3 text-sm text-[#5b4a42]">
      <Icon className="h-5 w-5 text-[#a95511]" />
      {text}
    </p>
  );
}
