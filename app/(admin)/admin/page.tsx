import Link from "next/link";
import { ArrowRight, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UserRepository } from "@/shared/repositories/user.repository";

const cards = [
  {
    key: "totalUsers",
    label: "Total de usuarios",
    icon: Users,
    className: "bg-[#fffaf8] text-[#7a3100]"
  },
  {
    key: "activeArtisans",
    label: "Artesanas activas",
    icon: UserCheck,
    className: "bg-[#fff0f5] text-[#b5245b]"
  },
  {
    key: "activeFacilitators",
    label: "Facilitadoras activas",
    icon: ShieldCheck,
    className: "bg-[#fff7df] text-[#946300]"
  },
  {
    key: "disabledUsers",
    label: "Cuentas desactivadas",
    icon: UserX,
    className: "bg-slate-100 text-slate-700"
  }
] as const;

export default async function AdminPage() {
  const summary = await new UserRepository().getAdminSummary();

  return (
    <main className="min-h-screen bg-[#fffaf8] px-4 py-6 md:px-8 lg:px-10 xl:px-14">
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="border-l-4 border-[#d39a12] pl-5">
          <p className="font-ui text-sm font-bold uppercase text-[#b5245b]">Admin</p>
          <h1 className="mt-2 font-serif text-5xl font-bold leading-tight text-[#101833] md:text-6xl">
            Panel administrativo
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5b4a42]">
            Gestion basica de cuentas y accesos del ecosistema Warmi Digital.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ key, label, icon: Icon, className }) => (
            <Card key={key} className="border-[#ead4ca] shadow-[0_18px_44px_rgba(122,49,0,0.07)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base text-[#5b3b2f]">{label}</CardTitle>
                <span className={`grid h-12 w-12 place-items-center rounded-full ${className}`}>
                  <Icon className="h-6 w-6" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-5xl font-bold text-[#30130d]">
                  {summary[key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-[#ead4ca] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.07)]">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
                Gestionar usuarios
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b4a42]">
                Crea cuentas, revisa estados, cambia roles y activa o desactiva accesos.
              </p>
            </div>
            <Button asChild className="rounded-full bg-[#b5245b] text-white hover:bg-[#941747]">
              <Link href="/admin/usuarios">
                Gestionar usuarios
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
