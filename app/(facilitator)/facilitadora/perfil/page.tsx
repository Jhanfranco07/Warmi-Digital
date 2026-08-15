import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";

import { logout } from "@/shared/actions/auth/logout";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function FacilitatorProfilePage() {
  const session = await requireRole("FACILITADORA");
  const displayName = session.user.name ?? "María Quispe";

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Mi perfil</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-[#171412]">
          Hola, {displayName}
        </h1>
        <p className="mt-2 font-ui text-lg text-[#6b5a4e]">
          Gestiona tu información de facilitadora y la seguridad de tu cuenta.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <article className="rounded-[10px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="grid h-40 w-40 place-items-center rounded-full bg-[#f7dfac] font-display text-7xl text-[#8a1747]">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-4xl">{displayName}</h2>
              <p className="mt-2 text-[#6b5a4e]">Facilitadora</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[8px] border border-[#ead4ca] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#8a1747]">
                    <Mail className="h-4 w-4" /> Correo electrónico
                  </p>
                  <p className="mt-2">{session.user.email ?? "maria.quispe@gmail.com"}</p>
                </div>
                <div className="rounded-[8px] border border-[#ead4ca] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#8a1747]">
                    <UserRound className="h-4 w-4" /> Rol
                  </p>
                  <p className="mt-2">Acompañamiento y formación</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[10px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <h2 className="flex items-center gap-3 font-display text-3xl">
            <ShieldCheck className="h-7 w-7 text-[#d89b06]" />
            Seguridad
          </h2>
          <p className="mt-4 text-[#6b5a4e]">
            Cierra tu sesión cuando termines de acompañar a tus artesanas.
          </p>
          <form action={logout} className="mt-8">
            <button
              type="submit"
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-[8px] bg-[#d89b06] px-5 font-ui text-base font-extrabold text-white shadow-[0_14px_30px_rgba(216,155,6,0.22)] transition hover:bg-[#b98200]"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
