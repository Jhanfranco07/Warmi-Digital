import Image from "next/image";
import { CheckCircle2, LogOut, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { ProfileForm } from "@/features/artisan/profile-form";
import { logout } from "@/shared/actions/auth/logout";
import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { CommunityRepository } from "@/shared/repositories/community.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanProfilePage() {
  const session = await requireRole("ARTESANA");
  const [user, communities, craftTypes] = await Promise.all([
    new ArtisanRepository().findProfile(session.user.id),
    new CommunityRepository().findActive(),
    new CommunityRepository().findCraftTypes()
  ]);
  const profile = user?.profile;
  const displayName = profile?.displayName ?? session.user.name ?? "Artesana Warmi";
  const firstName = profile?.firstName ?? displayName.split(" ")[0] ?? "";
  const lastName = profile?.lastName ?? displayName.split(" ").slice(1).join(" ");
  const communityName = profile?.community?.name ?? "San Miguel, Cajamarca";
  const craftTypeNames =
    profile?.craftTypes.map((item) => item.craftType.name).join(", ") ??
    "Especialidad pendiente";

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Hola, {displayName} <span className="text-4xl text-[#b5245b]">-</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Gestiona tu informacion personal, tu emprendimiento y la seguridad de tu
              cuenta.
            </p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="rounded-full">
              <LogOut className="h-5 w-5" />
              Cerrar sesion
            </Button>
          </form>
        </header>

        <section className="mt-8 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
              <span className="relative mx-auto grid h-44 w-44 place-items-center overflow-hidden rounded-full border-8 border-white bg-[#fff1e5] shadow-[0_18px_40px_rgba(122,49,0,0.15)]">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={displayName}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                ) : (
                  <UserRound className="h-14 w-14 text-[#b5245b]" />
                )}
              </span>
              <div>
                <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                  Perfil de artesana
                </p>
                <h2 className="mt-2 font-serif text-5xl font-bold text-[#1b1c1a]">
                  {displayName}
                </h2>
                <div className="mt-5 grid gap-3 text-[#5b4a42] md:grid-cols-2">
                  <Meta icon={MapPin} text={communityName} />
                  <Meta icon={UserRound} text={craftTypeNames} />
                  <Meta icon={Mail} text={user?.email ?? session.user.email ?? ""} />
                  <Meta icon={ShieldCheck} text="Cuenta activa" />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
              Estado de cuenta
            </h2>
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#ecd0bd] bg-[#fffaf6] p-4">
              <CheckCircle2 className="h-8 w-8 text-[#2f8b4d]" />
              <div>
                <p className="font-ui font-extrabold text-[#1b1c1a]">Cuenta activa</p>
                <p className="text-sm text-[#5b4a42]">
                  Tu cuenta esta lista para aprendizaje, comunidad y vitrina.
                </p>
              </div>
            </div>
            <form action={logout} className="mt-6">
              <Button type="submit" className="w-full bg-[#b5245b] text-white">
                <LogOut className="h-5 w-5" />
                Cerrar sesion
              </Button>
            </form>
          </article>
        </section>

        <section className="mt-7">
          <ProfileForm
            profile={{
              firstName,
              lastName,
              displayName,
              phone: profile?.phone ?? "",
              bio: profile?.bio ?? "",
              avatarUrl: profile?.avatarUrl ?? null,
              communityId: profile?.communityId ?? "",
              craftTypeIds: profile?.craftTypes.map((item) => item.craftTypeId) ?? []
            }}
            communities={communities}
            craftTypes={craftTypes}
          />
        </section>
      </div>
    </main>
  );
}

function Meta({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <p className="flex items-center gap-3 rounded-xl border border-[#ecd0bd] bg-[#fffaf6] px-4 py-3 text-sm">
      <Icon className="h-5 w-5 text-[#7a3100]" />
      {text}
    </p>
  );
}
