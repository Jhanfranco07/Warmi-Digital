"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  HandHeart,
  TrendingUp,
  UsersRound
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { login } from "@/shared/actions/auth/login";
import { cn } from "@/shared/lib/utils";

type LoginFormProps = {
  callbackUrl?: string;
  initialRole?: "artesana" | "facilitadora";
};

const roleOptions = {
  artesana: {
    eyebrow: "Ingresar como artesana",
    title: "Bienvenida a tu taller",
    description:
      "Accede a modulos de aprendizaje, recursos y herramientas digitales para fortalecer tu emprendimiento.",
    button: "Ingresar como artesana",
    accent: "#b5245b",
    soft: "#fff0f5",
    border: "#e2a0ba",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGgKcUdhFAz7xu7Lh4yWBB9KQfpCjA3MuKPBvVvb4j-PACBJaQMiytvgKOvo0Se7xNfFzDs4kPrwezehnYiJOjtRW20DyD3BWDggWnEsgQySwOp3of4nO6eHtx2nQk2AjtUXqDZ4UDMojrexi581KWqhNoxwR4XJz54mShphLbYTqKNlQmN2mT8nCldPzz9QxFQpX-uX_qXhPQ59lEdAWaXepnzKAkOcOUA4nrUFh9g4jHk",
    icon: HandHeart,
    features: [
      { icon: BookOpen, label: "Aprende a tu ritmo" },
      { icon: Camera, label: "Mejora tus productos" },
      { icon: UsersRound, label: "Conecta y crece" }
    ]
  },
  facilitadora: {
    eyebrow: "Ingresar como facilitadora",
    title: "Bienvenida, facilitadora",
    description:
      "Accede a guias, recursos y materiales para acompanar a las artesanas en su camino digital.",
    button: "Ingresar como facilitadora",
    accent: "#d39a12",
    soft: "#fff7df",
    border: "#e5c067",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCALyFOMNshlu8spmcZJTvzNV6c0By891ZqDXEBHhPmKcFLhA3xMzyY50ew-aW0BnQE0ss8-gSZ98s-Q5kW52fHNh5NkJp4qEH5Pv8L2p1sxcBVvRnmaZdPcA3WTTI15HVgrQol4UY4_C1EEIUIooGBBiSpRIPVTRNcSavo3TLrQwIqlAFQAJZVxpcNgIpgbxicsiWJaLkadylZrQ2N9C5x6_E2a740t9Sj5ol--qlqt49l9bTsvt-D",
    icon: UsersRound,
    features: [
      { icon: BookOpen, label: "Guias y materiales" },
      { icon: UsersRound, label: "Acompana y orienta" },
      { icon: TrendingUp, label: "Impulsa su desarrollo" }
    ]
  }
} satisfies Record<
  "artesana" | "facilitadora",
  {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    accent: string;
    soft: string;
    border: string;
    image: string;
    icon: React.ComponentType<{ className?: string }>;
    features: Array<{
      icon: React.ComponentType<{ className?: string }>;
      label: string;
    }>;
  }
>;

export function LoginForm({ callbackUrl, initialRole = "artesana" }: LoginFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [role, setRole] = React.useState<"artesana" | "facilitadora">(initialRole);
  const activeRole = roleOptions[role];
  const RoleIcon = activeRole.icon;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await login(formData);

        if (!result.success) {
          setError(result.message ?? "No se pudo iniciar sesion.");
          return;
        }

        setSuccess(result.message ?? "Ingreso exitoso.");
        window.location.assign(result.redirectTo ?? "/artisan");
      } catch (error) {
        setError((error as Error)?.message ?? "Error de autenticacion.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#1b1c1a]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside
          className="relative min-h-[280px] overflow-hidden bg-cover bg-center lg:min-h-screen"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(122,16,66,0.34), rgba(255,250,248,0.06)), url(${activeRole.image})`
          }}
        >
          <div className="bg-white/88 absolute left-5 top-5 rounded-full px-4 py-2 shadow-[0_14px_40px_rgba(27,28,26,0.18)] lg:hidden">
            <WarmiLogo compact markClassName="h-9" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4b220f]/80 to-transparent p-6 text-white lg:p-10">
            <p className="font-ui text-label-ui">WARMI DIGITAL</p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-tight lg:text-6xl">
              Tecnologia que acompana la tradicion.
            </h2>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-4xl">
            <Link href="/" className="hidden w-fit lg:block">
              <WarmiLogo compact markClassName="h-12" />
            </Link>

            <div className="mt-2 border-t-4 border-[#5576a7] pt-6 lg:mt-10">
              <div className="flex items-center justify-center gap-3 text-center">
                <span className="text-2xl text-[#c8905a]">✣</span>
                <h1 className="font-ui text-2xl font-extrabold uppercase text-[#b5245b] md:text-3xl">
                  Como deseas ingresar?
                </h1>
                <span className="text-2xl text-[#c8905a]">✣</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <RoleCard
                  selected={role === "artesana"}
                  role="artesana"
                  onSelect={setRole}
                />
                <RoleCard
                  selected={role === "facilitadora"}
                  role="facilitadora"
                  onSelect={setRole}
                />
              </div>
            </div>

            <div
              className="mt-6 grid overflow-hidden rounded-lg border bg-white shadow-[0_18px_50px_rgba(122,49,0,0.1)] lg:grid-cols-[0.92fr_1.08fr]"
              style={{ borderColor: activeRole.border }}
            >
              <div
                className="hidden min-h-[360px] bg-cover bg-center lg:block"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,250,248,0.82)), url(${activeRole.image})`
                }}
              />

              <div className="p-6 md:p-8">
                <span
                  className="inline-flex rounded-full px-4 py-2 font-ui text-label-ui text-white"
                  style={{ backgroundColor: activeRole.accent }}
                >
                  {activeRole.eyebrow}
                </span>
                <RoleIcon className="mt-8 h-9 w-9" style={{ color: activeRole.accent }} />
                <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                  {activeRole.title}
                </h2>
                <p className="mt-3 max-w-lg text-body-md text-[#5b4a42]">
                  {activeRole.description}
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {callbackUrl ? (
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                  ) : null}
                  <label className="block">
                    <span className="font-ui text-label-ui text-[#5b4a42]">
                      Usuario / Correo
                    </span>
                    <Input
                      className="mt-2 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-transparent px-0 shadow-none focus-visible:ring-0"
                      name="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-ui text-label-ui text-[#5b4a42]">
                      Contrasena
                    </span>
                    <Input
                      className="mt-2 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-transparent px-0 shadow-none focus-visible:ring-0"
                      name="password"
                      type="password"
                      placeholder="********"
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#5b4a42]">
                    <input
                      name="remember"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-[#d8b9a8]"
                      style={{ accentColor: activeRole.accent }}
                    />
                    Recordar sesion
                  </label>

                  {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
                  {success ? <p className="text-sm text-[#14715d]">{success}</p> : null}

                  <Button
                    className="min-h-touch-target w-full rounded-full font-ui text-label-ui text-white"
                    style={{ backgroundColor: activeRole.accent }}
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Entrando..." : activeRole.button}
                  </Button>
                </form>

                <div className="flex flex-col gap-3 pt-7 text-sm text-[#7a3100]">
                  <Link href="/forgot-password" className="hover:underline">
                    Olvidaste tu contrasena?
                  </Link>
                  <Link href="/register" className="hover:underline">
                    Crear cuenta de artesana
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RoleCard({
  role,
  selected,
  onSelect
}: {
  role: "artesana" | "facilitadora";
  selected: boolean;
  onSelect: (role: "artesana" | "facilitadora") => void;
}) {
  const option = roleOptions[role];
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={cn(
        "group overflow-hidden rounded-lg border bg-white text-left shadow-[0_12px_32px_rgba(122,16,66,0.08)] transition-transform hover:-translate-y-1",
        selected && "ring-2 ring-offset-2"
      )}
      style={{
        borderColor: option.border,
        backgroundColor: option.soft,
        ["--tw-ring-color" as string]: option.accent
      }}
      aria-pressed={selected}
    >
      <div className="grid min-h-[220px] grid-cols-[1fr_44%]">
        <div className="flex flex-col p-5">
          <span
            className="grid h-14 w-14 place-items-center rounded-full text-white"
            style={{ backgroundColor: option.accent }}
          >
            <Icon className="h-7 w-7" />
          </span>
          <h2
            className="mt-5 font-ui text-2xl font-extrabold uppercase leading-tight"
            style={{ color: option.accent }}
          >
            {option.eyebrow}
          </h2>
          <p className="mt-3 text-sm font-semibold text-[#74483d]">
            {option.description}
          </p>
          <span
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-md px-4 py-2 font-ui text-label-ui text-white"
            style={{ backgroundColor: option.accent }}
          >
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div
          className="bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to left, rgba(255,255,255,0), ${option.soft} 92%), url(${option.image})`
          }}
        />
      </div>
      <div
        className="grid grid-cols-3 border-t px-3 py-3"
        style={{ borderColor: option.border }}
      >
        {option.features.map((feature) => {
          const FeatureIcon = feature.icon;

          return (
            <span
              key={feature.label}
              className="flex flex-col items-center gap-1 text-center text-[11px] font-semibold"
              style={{ color: option.accent }}
            >
              <FeatureIcon className="h-5 w-5" />
              {feature.label}
            </span>
          );
        })}
      </div>
    </button>
  );
}
