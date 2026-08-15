import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Globe2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound
} from "lucide-react";

import { logout } from "@/shared/actions/auth/logout";
import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanProfilePage() {
  const session = await requireRole("ARTESANA");
  const user = await new ArtisanRepository().findProfile(session.user.id);
  const profile = user?.profile;
  const displayName = profile?.displayName ?? session.user.name ?? "Elena Mamani";
  const [firstName = "Elena", lastName = "Mamani Quispe"] = displayName.split(" ");
  const communityName = profile?.community?.name ?? "San Miguel, Cajamarca";
  const craftTypes =
    profile?.craftTypes.map((item) => item.craftType.name).join(", ") ??
    "Textiles y tejidos artesanales";

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Hola, {displayName} <span className="text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Gestiona tu información personal, tu emprendimiento y la seguridad de tu
              cuenta.
            </p>
          </div>
          <span className="relative hidden h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)] md:block">
            <Image
              src={profile?.avatarUrl ?? "/images/auth/artesana.png"}
              alt={displayName}
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
        </header>

        <form action={logout} className="mt-6 lg:hidden">
          <button
            type="submit"
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#b5245b] px-5 font-ui text-base font-extrabold text-white shadow-[0_14px_30px_rgba(181,36,91,0.22)]"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </form>

        <section className="mt-8 grid gap-7 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel title="Datos personales" icon={UserRound}>
            <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
              <div className="flex flex-col items-center">
                <div className="relative h-44 w-44">
                  <span className="relative block h-full w-full overflow-hidden rounded-full border-8 border-white shadow-[0_18px_40px_rgba(122,49,0,0.15)]">
                    <Image
                      src={profile?.avatarUrl ?? "/images/auth/artesana.png"}
                      alt={displayName}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  </span>
                  <span className="absolute bottom-2 right-2 grid h-14 w-14 place-items-center rounded-full bg-[#b5245b] text-white shadow-lg">
                    <Camera className="h-6 w-6" />
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="mt-5 rounded-lg border-[#ecd0bd] bg-white text-[#7a3100] hover:bg-[#fff1e5]"
                >
                  <Camera className="h-4 w-4" />
                  Cambiar foto
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nombres" value={firstName} />
                <Field label="Apellidos" value={lastName} />
                <Field
                  label="Fecha de nacimiento"
                  value="12/06/1988"
                  icon={CalendarDays}
                />
                <Field label="Documento de identidad" value="DNI 45678901" />
                <Field label="Teléfono" value={profile?.phone ?? "+51 987 654 321"} />
                <Field
                  label="Correo electrónico"
                  value={user?.email ?? "elena.mamani@gmail.com"}
                  verified
                />
              </div>
            </div>
          </Panel>

          <Panel title="Emprendimiento" icon={Store}>
            <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
              <div className="space-y-5">
                <Field
                  label="Nombre del emprendimiento"
                  value={`Tejidos ${displayName}`}
                />
                <Field label="Categoría" value={craftTypes} />
                <Field label="Ubicación" value={communityName} />
                <div>
                  <p className="mb-2 text-sm font-bold text-[#5b4a42]">
                    Sobre mi emprendimiento
                  </p>
                  <div className="rounded-lg border border-[#ecd0bd] bg-white px-4 py-4 text-base leading-7 text-[#5b4a42]">
                    Elaboro textiles tradicionales con técnicas heredadas de mi familia.
                    Cada pieza cuenta una historia y lleva el alma de nuestra cultura.
                  </div>
                </div>
              </div>
              <div>
                <div className="relative h-56 overflow-hidden rounded-xl border border-[#ecd0bd] bg-[#fff1e5]">
                  <Image
                    src="/images/discover/aprende.png"
                    alt="Emprendimiento artesanal"
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-white/20">
                    <div className="rounded-full bg-[#fffaf6] px-7 py-5 text-center font-serif text-xl font-bold text-[#7a3100] shadow-lg">
                      Tejidos
                      <br />
                      {displayName}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-5 w-full rounded-lg border-[#ecd0bd] bg-white text-[#7a3100] hover:bg-[#fff1e5]"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar información del emprendimiento
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Cuenta" icon={Mail}>
            <div className="grid gap-5">
              <Field label="Nombre de usuario" value="elena_mamani" />
              <Field
                label="Correo electrónico"
                value={user?.email ?? "elena.mamani@gmail.com"}
                verified
              />
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Idioma" value="Español" icon={Globe2} />
                <SelectField
                  label="Zona horaria"
                  value="(GMT-5) Lima, Perú"
                  icon={Globe2}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Seguridad" icon={ShieldCheck}>
            <div className="space-y-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecd0bd] pb-6">
                <div>
                  <p className="text-sm font-bold text-[#5b4a42]">Contraseña</p>
                  <p className="mt-2 text-2xl tracking-[0.35em] text-[#1b1c1a]">
                    ••••••••
                  </p>
                  <p className="mt-2 text-sm text-[#7a5b4a]">
                    Última actualización: 20/05/2024
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-lg border-[#ecd0bd] bg-white text-[#7a3100] hover:bg-[#fff1e5]"
                >
                  <Lock className="h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </div>

              <div>
                <p className="mb-4 text-sm font-bold text-[#5b4a42]">Sesiones activas</p>
                <div className="flex items-center gap-4 rounded-xl border border-[#ecd0bd] bg-white p-4">
                  <Smartphone className="h-7 w-7 text-[#7a3100]" />
                  <div className="flex-1">
                    <p className="font-ui font-extrabold text-[#1b1c1a]">
                      Está iniciada en este dispositivo
                    </p>
                    <p className="text-sm text-[#5b4a42]">Perú · Chrome en Windows</p>
                  </div>
                  <span className="rounded-full bg-[#eaf8e8] px-4 py-2 text-sm font-bold text-[#2f8b4d]">
                    Activa
                  </span>
                </div>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#e7b89f] bg-white px-5 font-ui text-base font-extrabold text-[#b5245b] transition-colors duration-300 hover:bg-[#fff1e5]"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      <header className="flex items-center gap-3 border-b border-[#ecd0bd] bg-gradient-to-r from-white to-[#fff8f1] p-6">
        <Icon className="h-7 w-7 text-[#b5245b]" />
        <h2 className="font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  verified
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  verified?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#5b4a42]">{label}</p>
      <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-base text-[#1b1c1a]">
        {Icon ? <Icon className="h-5 w-5 text-[#7a3100]" /> : null}
        <span className="min-w-0 flex-1 truncate">{value}</span>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf8e8] px-3 py-1 text-xs font-bold text-[#2f8b4d]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verificado
          </span>
        ) : null}
        <Edit3 className="h-4 w-4 text-[#7a3100]" />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#5b4a42]">{label}</p>
      <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-base text-[#1b1c1a]">
        <Icon className="h-5 w-5 text-[#7a3100]" />
        <span className="flex-1">{value}</span>
        <ChevronDown className="h-4 w-4 text-[#7a3100]" />
      </div>
    </div>
  );
}
