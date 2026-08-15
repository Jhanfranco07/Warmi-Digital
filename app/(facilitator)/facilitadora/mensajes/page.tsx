import Image from "next/image";
import { Edit3, Paperclip, Search, Send, UsersRound } from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";

const conversations = [
  ["Juana Mamani", "Muchas gracias, María. Me fue muy útil.", "10:24 a. m.", "2"],
  ["Rosa Quispe", "¿Podrías enviarme el material?", "9:15 a. m.", "1"],
  ["Sonia Choque", "Listo, ya completé el taller.", "Ayer", ""],
  ["Margarita Apaza", "Perfecto, muchas gracias por la orientación.", "Ayer", "2"],
  ["Elena Huamaní", "Me gustaría participar en el próximo taller.", "2 días", ""],
  ["Luz Condori", "¿Cuándo es el próximo taller?", "2 días", ""],
  ["Petronila Yana", "Gracias por su apoyo constante.", "3 días", ""]
];

const reportCards = [
  ["Participación promedio", "68%", "+8% vs. mes pasado"],
  ["Asistencia promedio", "72%", "+6% vs. mes pasado"],
  ["Cursos completados", "24", "+6 este mes"],
  ["Artesanas activas", "86", "+12 este mes"]
];

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  await new ConversationRepository().findForUser(session.user.id);

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Mensajes y reportes</p>
        <p className="mt-1 text-base text-[#7a5b4a]">
          Comunícate con tus artesanas y consulta el impacto de tu labor.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-6 py-10 lg:px-10 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <header className="flex items-center justify-between border-b border-[#ead4ca] p-6">
            <div>
              <h1 className="font-display text-3xl">Mensajes</h1>
              <p className="mt-1 text-[#6b5a4e]">
                Conversa con tus artesanas y bríndales acompañamiento.
              </p>
            </div>
            <button className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#d89b06] px-5 font-ui font-bold text-white">
              <Edit3 className="h-4 w-4" /> Nuevo mensaje
            </button>
          </header>

          <div className="grid min-h-[760px] xl:grid-cols-[360px_1fr]">
            <aside className="border-r border-[#ead4ca]">
              <div className="space-y-3 border-b border-[#ead4ca] p-4">
                <label className="flex min-h-12 items-center gap-3 rounded-[8px] border border-[#ead4ca] px-4">
                  <Search className="h-5 w-5 text-[#7a5b4a]" />
                  <input
                    className="w-full bg-transparent outline-none"
                    placeholder="Buscar conversación..."
                  />
                </label>
                <button className="min-h-12 w-full rounded-[8px] border border-[#ead4ca] px-4 text-left text-[#6b5a4e]">
                  Todas
                </button>
              </div>
              <div>
                {conversations.map(([name, preview, time, badge], index) => (
                  <div
                    key={name}
                    className={
                      index === 0
                        ? "flex items-center gap-3 bg-[#fff8e8] p-4"
                        : "flex items-center gap-3 border-t border-[#f1e1d5] p-4"
                    }
                  >
                    <span className="font-display grid h-12 w-12 place-items-center rounded-full bg-[#f7dfac] text-xl text-[#8a1747]">
                      {name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-ui font-bold">{name}</p>
                      <p className="truncate text-sm text-[#6b5a4e]">{preview}</p>
                    </div>
                    <div className="text-right text-sm text-[#7a5b4a]">
                      <span>{time}</span>
                      {badge ? (
                        <span className="mt-2 grid h-6 w-6 place-items-center rounded-full bg-[#8a0044] text-xs font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="flex flex-col">
              <header className="flex items-center justify-between border-b border-[#ead4ca] p-5">
                <div className="flex items-center gap-3">
                  <span className="font-display grid h-12 w-12 place-items-center rounded-full bg-[#f7dfac] text-xl text-[#8a1747]">
                    J
                  </span>
                  <div>
                    <p className="font-ui font-bold">Juana Mamani</p>
                    <p className="text-sm text-[#7a5b4a]">
                      Tejidos y bordados · San Miguel
                    </p>
                  </div>
                </div>
                <button className="rounded-[8px] border border-[#d89b06] px-4 py-2 font-ui text-sm font-bold text-[#b26f00]">
                  Ver perfil
                </button>
              </header>

              <div className="flex-1 space-y-7 p-8">
                <p className="text-center text-sm text-[#9b7b66]">Lunes 10:12 a. m.</p>
                <div className="max-w-md rounded-[10px] border border-[#ead4ca] bg-white p-5 shadow-sm">
                  Buenos días, María. Quería contarte que comencé el taller de Fotografía
                  para artesanas y me está gustando mucho. Aquí envío una foto de mis
                  productos.
                </div>
                <div className="relative h-44 w-64 overflow-hidden rounded-[10px] border border-[#ead4ca]">
                  <Image
                    src="/images/discover/aprende.png"
                    alt="Producto artesanal compartido"
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                </div>
                <div className="ml-auto max-w-md rounded-[10px] bg-[#fff2cf] p-5">
                  ¡Qué linda foto, Juana! Se ve excelente tu trabajo y la presentación.
                  Sigue así, vas por muy buen camino.
                </div>
                <div className="max-w-md rounded-[10px] border border-[#ead4ca] bg-white p-5 shadow-sm">
                  Muchas gracias, María. Me fue muy útil tu recomendación sobre la
                  iluminación.
                </div>
              </div>

              <footer className="border-t border-[#ead4ca] p-5">
                <label className="block rounded-[8px] border border-[#ead4ca] bg-white px-4 py-4">
                  <input
                    className="w-full bg-transparent outline-none"
                    placeholder="Escribe tu mensaje..."
                  />
                </label>
                <div className="mt-4 flex items-center justify-between">
                  <button className="inline-flex items-center gap-2 text-[#6b5a4e]">
                    <Paperclip className="h-5 w-5" /> Adjuntar archivo
                  </button>
                  <button className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#d89b06] px-6 font-ui font-bold text-white">
                    <Send className="h-5 w-5" /> Enviar
                  </button>
                </div>
              </footer>
            </section>
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-3xl">Reportes</h2>
            <p className="mt-1 text-[#6b5a4e]">Resumen del impacto y participación.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reportCards.map(([label, value, detail]) => (
                <div key={label} className="rounded-[10px] border border-[#eed8bf] p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                    <UsersRound className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm">{label}</p>
                  <p className="font-display text-4xl">{value}</p>
                  <p className="text-sm text-emerald-700">{detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6">
            <h3 className="font-display text-2xl">Participación por curso</h3>
            <div className="mt-6 space-y-4">
              {[
                "Fotografía",
                "Costos y precios",
                "Emprendimiento digital",
                "Tejidos básicos"
              ].map((label, index) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{85 - index * 8}%</span>
                  </div>
                  <span className="block h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d89b06]"
                      style={{ width: `${85 - index * 8}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-[#fff8e8] p-6">
            <h3 className="font-display text-2xl">
              Tu acompañamiento marca la diferencia
            </h3>
            <p className="mt-3 text-[#6b5a4e]">
              Cada mensaje, taller y orientación impulsa el crecimiento de nuestras
              artesanas.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
