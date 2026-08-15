import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  ChevronRight,
  Edit3,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { logout } from "@/shared/actions/auth/logout";
import { requireRole } from "@/shared/server/auth/helpers";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#5b4a42]">{label}</p>
      <div className="rounded-[8px] border border-[#ead4ca] bg-white px-4 py-3">
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
      <header className="flex items-center justify-between border-b border-[#ead4ca] px-6 py-5">
        <h2 className="font-display flex items-center gap-3 text-2xl text-[#8a1747]">
          <Icon className="h-6 w-6 text-[#d89b06]" />
          {title}
        </h2>
        <button className="inline-flex items-center gap-2 rounded-[8px] border border-[#d89b06] px-4 py-2 font-ui text-sm font-bold text-[#b26f00]">
          <Edit3 className="h-4 w-4" /> Editar
        </button>
      </header>
      <div className="p-6">{children}</div>
    </article>
  );
}

const quickActions: {
  title: string;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Editar información personal",
    detail: "Actualiza tus datos y contacto",
    Icon: UserRound
  },
  {
    title: "Cambiar contraseña",
    detail: "Mejora la seguridad de tu cuenta",
    Icon: Lock
  },
  {
    title: "Preferencias de notificación",
    detail: "Configura cómo recibes alertas",
    Icon: Bell
  }
];

export default async function FacilitatorProfilePage() {
  const session = await requireRole("FACILITADORA");
  const displayName = session.user.name ?? "María Quispe";
  const email = session.user.email ?? "maria.quispe@warmi.org";

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10" />

      <section className="mx-auto max-w-[1500px] space-y-7 px-6 py-10 lg:px-10">
        <div>
          <h1 className="font-display text-5xl leading-tight xl:text-6xl">Mi perfil</h1>
          <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
            Gestiona tu información personal, tu cuenta y tu seguridad.
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_330px]">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-8 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <div className="grid gap-8 lg:grid-cols-[180px_1fr_320px]">
              <div className="relative h-40 w-40">
                <span className="font-display grid h-full w-full place-items-center rounded-full bg-[#f7dfac] text-7xl text-[#8a1747]">
                  {displayName.charAt(0)}
                </span>
                <span className="absolute bottom-1 right-1 grid h-12 w-12 place-items-center rounded-full border border-[#ead4ca] bg-white text-[#d89b06] shadow-lg">
                  <Camera className="h-5 w-5" />
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-4xl">{displayName}</h2>
                  <span className="rounded-[6px] bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Facilitadora
                  </span>
                </div>
                <div className="mt-5 space-y-3 text-[#5f4a3a]">
                  <p className="flex items-center gap-3">
                    <Building2 className="h-5 w-5" /> Institución: Asociación de Artesanas
                    de San Miguel
                  </p>
                  <p className="flex items-center gap-3">
                    <Star className="h-5 w-5" /> Especialidad: Tejidos y bordados en lana
                    de alpaca
                  </p>
                </div>
                <p className="mt-5 max-w-2xl text-[#5f4a3a]">
                  Facilitadora comprometida con el desarrollo de artesanas cajamarquinas,
                  impulsando técnicas tradicionales y herramientas digitales para
                  fortalecer sus emprendimientos.
                </p>
              </div>
              <div className="space-y-4 border-l border-[#ead4ca] pl-8 text-[#5f4a3a]">
                <p className="font-ui font-bold text-[#2a211c]">Contacto</p>
                <p className="flex items-center gap-3">
                  <Phone className="h-5 w-5" /> +51 987 654 321
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-5 w-5" /> {email}
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" /> San Miguel, Cajamarca
                </p>
                <p className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5" /> Miembro desde: 12 may. 2022
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-7 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl">Estado de cuenta</h2>
            <div className="mt-6 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <span className="rounded-[6px] bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                Cuenta activa
              </span>
            </div>
            <p className="mt-5 text-[#6b5a4e]">Tu cuenta está activa y en buen estado.</p>
            <p className="mt-5 text-sm text-[#6b5a4e]">
              Último inicio de sesión: Hoy, 9:15 a. m.
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Panel title="Datos personales" icon={UserRound}>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Nombres" value="María" />
                <Field label="Apellidos" value="Quispe Mamani" />
                <Field label="Teléfono" value="+51 987 654 321" />
                <Field label="Fecha de nacimiento" value="15/08/1985" />
                <Field label="Documento de identidad" value="DNI 44876532" />
                <Field label="Género" value="Femenino" />
              </div>
            </Panel>

            <Panel title="Institución" icon={Building2}>
              <div className="grid gap-5 md:grid-cols-3">
                <Field
                  label="Institución"
                  value="Asociación de Artesanas de San Miguel"
                />
                <Field label="Cargo / Rol" value="Facilitadora principal" />
                <Field label="Años en la institución" value="5 años" />
              </div>
            </Panel>

            <Panel title="Especialidad" icon={Star}>
              <div className="space-y-5">
                <Field
                  label="Especialidad principal"
                  value="Tejidos y bordados en lana de alpaca"
                />
                <div className="flex flex-wrap gap-3">
                  {[
                    "Tejido en telar de cintura",
                    "Diseño de patrones tradicionales",
                    "Acompañamiento digital"
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-[6px] bg-[#fff2cf] px-4 py-2 text-sm font-bold text-[#8a5d00]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Datos de cuenta" icon={Mail}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Correo electrónico" value={email} />
                <Field label="Nombre de usuario" value="maria.quispe" />
              </div>
            </Panel>
          </div>

          <aside className="space-y-6">
            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-2xl">Acciones rápidas</h2>
              <div className="mt-5 divide-y divide-[#ead4ca]">
                {quickActions.map(({ title, detail, Icon }) => (
                  <button
                    key={title}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold">{title}</span>
                      <span className="text-sm text-[#6b5a4e]">{detail}</span>
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-2xl">Seguridad</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="font-bold">Contraseña</p>
                  <p className="text-sm text-[#6b5a4e]">
                    Última actualización: 15 ene. 2024
                  </p>
                </div>
                <div>
                  <p className="font-bold">Verificación en dos pasos</p>
                  <p className="text-sm text-[#6b5a4e]">
                    Añade una capa adicional de seguridad.
                  </p>
                  <span className="mt-2 inline-flex rounded-[6px] bg-[#ffe8f0] px-3 py-1 text-xs font-bold text-[#9d0f4f]">
                    Desactivada
                  </span>
                </div>
              </div>
              <form action={logout} className="mt-7">
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#d89b06] font-ui font-bold text-white"
                >
                  <LogOut className="h-5 w-5" /> Cerrar sesión
                </button>
              </form>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
