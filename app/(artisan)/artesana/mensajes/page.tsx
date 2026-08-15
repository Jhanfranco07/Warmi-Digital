import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Edit3,
  Info,
  MapPin,
  MoreVertical,
  Paperclip,
  Plus,
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
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-28 pt-6 lg:hidden">
        <div className="pointer-events-none absolute -right-20 top-28 h-56 w-56 rounded-full bg-[#ffe6ee]" />
        <div className="pointer-events-none absolute -right-8 top-32 h-44 w-44 opacity-70">
          <Image
            src="/images/brand/warmi-isotipo.png"
            alt=""
            fill
            sizes="176px"
            className="object-contain"
          />
        </div>

        <div className="relative">
          <h1 className="font-serif text-5xl font-bold leading-tight text-[#7a1042]">
            Mensajes <span className="text-[#ef9baa]">❧</span>
          </h1>

          <div className="mt-6 flex min-h-16 items-center gap-4 rounded-full border border-[#f0c3cf] bg-white px-5 shadow-[0_14px_30px_rgba(181,36,91,0.08)]">
            <Search className="h-7 w-7 text-[#b5245b]" />
            <span className="text-lg text-[#8d7a72]">Buscar conversaciones...</span>
          </div>

          <div className="mt-6 flex items-center gap-8 border-b border-[#f5d2dc] text-lg">
            <span className="border-b-2 border-[#b5245b] pb-3 font-bold text-[#7a1042]">
              Todas
            </span>
            <span className="pb-3 text-[#8d7a72]">No leídas</span>
            <span className="pb-3 text-[#8d7a72]">Grupos</span>
            <a
              href="#chat-warmi"
              className="ml-auto flex items-center gap-2 pb-3 font-bold text-[#b5245b]"
            >
              Nuevo
              <Edit3 className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-4 space-y-1">
            {conversations.slice(0, 4).map((conversation, index) => (
              <a
                key={conversation.name}
                href="#chat-warmi"
                className={`flex items-center gap-4 rounded-3xl border p-4 transition-transform duration-300 active:scale-[0.98] ${
                  index === 0
                    ? "border-[#f0c3cf] bg-[#fff1f5] shadow-[0_12px_26px_rgba(181,36,91,0.08)]"
                    : "border-transparent bg-transparent"
                }`}
              >
                <Avatar
                  image={conversation.image}
                  name={conversation.name}
                  type={conversation.type}
                  size="mobile"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="truncate font-ui text-xl font-extrabold text-[#1b1c1a]">
                      {conversation.name}
                    </h2>
                    <span className="text-sm text-[#7a5b4a]">{conversation.time}</span>
                  </div>
                  <p className="mt-1 truncate text-base text-[#5b4a42]">
                    {conversation.message}
                  </p>
                </div>
                {conversation.unread ? (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#b5245b] text-sm font-bold text-white">
                    {conversation.unread}
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        </div>

        <section
          id="chat-warmi"
          className="relative mt-8 scroll-mt-24 overflow-hidden rounded-t-[28px] border-t border-[#f5cbd5] bg-white/75 pt-4"
        >
          <header className="flex items-center gap-4 border-b border-[#f5d2dc] px-1 pb-4">
            <a
              href="#"
              aria-label="Volver a mensajes"
              className="grid h-11 w-11 place-items-center rounded-full text-[#7a1042]"
            >
              <ArrowLeft className="h-6 w-6" />
            </a>
            <Avatar
              image="/images/brand/warmi-isotipo.png"
              name="Warmi Digital"
              type="brand"
              size="mobile"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-ui text-xl font-extrabold text-[#1b1c1a]">
                Warmi Digital
              </h2>
              <p className="text-sm font-bold text-[#2f9b62]">En línea</p>
            </div>
            <Info className="h-7 w-7 text-[#7a1042]" />
          </header>

          <div className="space-y-5 px-1 py-5">
            <MobileMessage align="left" time="10:30">
              ¡Hola Elena! Gracias por ser parte de Warmi Digital. Estoy aquí para
              acompañarte en tu aprendizaje y crecimiento.
            </MobileMessage>
            <MobileMessage align="right" time="10:32">
              ¡Hola! Muchas gracias. Estoy muy emocionada por empezar el taller.
            </MobileMessage>
            <MobileMessage align="left" time="10:33">
              Qué bueno. Te comparto el recordatorio de tu próximo taller:
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#f5d2dc] bg-white">
                <div className="grid grid-cols-[112px_1fr]">
                  <div className="relative min-h-[132px]">
                    <Image
                      src="/images/discover/aprende.png"
                      alt="Taller de tejido"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-ui text-base font-extrabold leading-tight text-[#1b1c1a]">
                      Taller: Introducción al patrimonio textil
                    </h3>
                    <p className="mt-3 text-sm text-[#5b4a42]">
                      Sábado 15 de agosto, 10:00 a. m.
                    </p>
                    <p className="mt-1 text-sm text-[#5b4a42]">En vivo por Zoom</p>
                  </div>
                </div>
                <a
                  href="/artesana/talleres"
                  className="flex items-center justify-center gap-2 border-t border-[#f5d2dc] px-4 py-4 font-bold text-[#b5245b]"
                >
                  Ver detalles del taller
                  <ChevronRightIcon />
                </a>
              </div>
            </MobileMessage>
            <MobileMessage align="right" time="10:35">
              Genial. Ahí estaré. Gracias.
            </MobileMessage>
          </div>

          <footer className="sticky bottom-20 rounded-full border border-[#f5d2dc] bg-white p-3 shadow-[0_16px_40px_rgba(181,36,91,0.12)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#b5245b] text-white"
                aria-label="Agregar archivo"
              >
                <Plus className="h-7 w-7" />
              </button>
              <div className="flex min-h-12 flex-1 items-center rounded-full border border-[#f5d2dc] px-4 text-[#8d7a72]">
                Escribe tu mensaje...
                <Smile className="ml-auto h-6 w-6 text-[#b5245b]" />
              </div>
              <button
                type="button"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ffe6ee] text-[#b5245b]"
                aria-label="Enviar mensaje"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
          </footer>
        </section>
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
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
                        <span className="text-sm text-[#7a5b4a]">
                          {conversation.time}
                        </span>
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
    </>
  );
}

function Avatar({
  image,
  name,
  type,
  size = "desktop"
}: {
  image: string;
  name: string;
  type?: string;
  size?: "desktop" | "mobile";
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${
        size === "mobile" ? "h-16 w-16" : "h-16 w-16"
      } ${type === "brand" ? "bg-[#d89911] p-3" : "bg-[#fff1e5]"}`}
    >
      <Image src={image} alt={name} fill sizes="64px" className="object-cover" />
    </span>
  );
}

function MobileMessage({
  align,
  time,
  children
}: {
  align: "left" | "right";
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[22px] border px-5 py-4 text-lg leading-7 shadow-[0_12px_28px_rgba(122,16,66,0.08)] ${
          align === "right"
            ? "border-[#f5cbd5] bg-[#ffe2ea] text-[#1b1c1a]"
            : "border-[#f5d2dc] bg-white text-[#1b1c1a]"
        }`}
      >
        {children}
        <p className="mt-2 text-right text-xs text-[#8d7a72]">{time}</p>
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return <span className="text-xl leading-none">›</span>;
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
