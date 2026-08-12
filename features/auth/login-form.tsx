"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Camera, HandHeart, TrendingUp, UsersRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { login } from "@/shared/actions/auth/login";
import { cn } from "@/shared/lib/utils";

type LoginFormProps = {
  callbackUrl?: string;
  initialRole?: "artesana" | "facilitadora";
};

const roles = {
  artesana: {
    label: "Soy artesana",
    eyebrow: "Ingreso artesana",
    title: "Bienvenida a tu taller",
    description:
      "Continua tu ruta de aprendizaje, fortalece tu historia y prepara tu vitrina cultural cuando tu proceso este listo.",
    button: "Ingresar como artesana",
    accent: "#b5245b",
    soft: "#fff0f5",
    border: "#e2a0ba",
    image: "/images/auth/artesana.png",
    icon: HandHeart,
    highlights: [
      { icon: BookOpen, label: "Aprende a tu ritmo" },
      { icon: Camera, label: "Mejora tus productos" },
      { icon: UsersRound, label: "Conecta y crece" }
    ]
  },
  facilitadora: {
    label: "Soy facilitadora",
    eyebrow: "Ingreso facilitadora",
    title: "Bienvenida, facilitadora",
    description:
      "Acompana avances, organiza recursos y guia a las artesanas durante su camino digital.",
    button: "Ingresar como facilitadora",
    accent: "#d39a12",
    soft: "#fff7df",
    border: "#e5c067",
    image: "/images/auth/facilitadora.png",
    icon: UsersRound,
    highlights: [
      { icon: BookOpen, label: "Guias y materiales" },
      { icon: UsersRound, label: "Acompana y orienta" },
      { icon: TrendingUp, label: "Impulsa su desarrollo" }
    ]
  }
} satisfies Record<
  "artesana" | "facilitadora",
  {
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    accent: string;
    soft: string;
    border: string;
    image: string;
    icon: React.ComponentType<{ className?: string }>;
    highlights: Array<{
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
  const activeRole = roles[role];
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
    <main className="min-h-screen bg-[#fffaf8] text-[#1b1c1a] 2xl:h-screen 2xl:overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-[1880px] flex-col px-3 py-3 sm:px-6 lg:px-8 lg:py-5 xl:px-10 2xl:h-screen 2xl:px-12">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <Link href="/" aria-label="Ir al inicio">
            <WarmiLogo compact markClassName="w-28 md:w-36" />
          </Link>
          <div className="hidden gap-2 md:flex">
            {["#5576a7", "#b5245b", "#55d2dd", "#fc6b22", "#ff8941", "#f0bf35"].map(
              (color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </header>

        <div className="mt-3 shrink-0 border-t-4 border-[#5576a7] pt-3 text-center md:mt-4 md:pt-4">
          <p className="font-ui text-sm font-bold uppercase text-[#b5245b] xl:text-base">
            Como deseas ingresar?
          </p>
        </div>

        <div
          className="mt-3 grid flex-1 overflow-hidden rounded-lg border bg-white shadow-[0_22px_60px_rgba(122,49,0,0.1)] md:mt-4 lg:grid-cols-[minmax(640px,1.1fr)_minmax(580px,0.9fr)] 2xl:min-h-0"
          style={{ borderColor: activeRole.border }}
        >
          <div className="relative min-h-[320px] overflow-hidden bg-[#f7efe9] sm:min-h-[450px] lg:min-h-[760px] 2xl:min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                className="absolute inset-0 bg-cover bg-center"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(63,26,13,0.45), rgba(255,250,248,0.08) 56%), url(${activeRole.image})`
                }}
              />
            </AnimatePresence>

            <div className="absolute left-3 right-3 top-3 flex rounded-full bg-white/90 p-1 shadow-[0_12px_34px_rgba(27,28,26,0.18)] sm:left-5 sm:right-auto sm:top-5">
              {(Object.keys(roles) as Array<keyof typeof roles>).map((item) => {
                const option = roles[item];
                const selected = role === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 font-ui text-xs font-bold transition-colors sm:flex-none sm:px-4 sm:text-sm xl:px-5 xl:text-base",
                      selected ? "text-white" : "text-[#5b4a42]"
                    )}
                    style={{
                      backgroundColor: selected ? option.accent : "transparent"
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={`${role}-copy`}
              className="absolute inset-x-0 bottom-0 p-5 text-white md:p-8 xl:p-10"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] xl:text-base">
                {activeRole.eyebrow}
              </p>
              <h1 className="mt-2 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-6xl xl:text-7xl">
                {activeRole.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 md:text-base xl:text-lg xl:leading-8">
                {activeRole.description}
              </p>
            </motion.div>
          </div>

          <div
            className="flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-14"
            style={{ backgroundColor: activeRole.soft }}
          >
            <div className="mx-auto w-full max-w-[720px]">
              <motion.div
                key={`${role}-form-head`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <RoleIcon
                  className="h-9 w-9 xl:h-12 xl:w-12"
                  style={{ color: activeRole.accent }}
                />
                <h2 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl xl:text-6xl">
                  Accede a Warmi Digital
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5b4a42] xl:text-lg">
                  Seleccionaste:{" "}
                  <span className="font-bold" style={{ color: activeRole.accent }}>
                    {activeRole.label}
                  </span>
                </p>
              </motion.div>

              <div className="mt-5 grid grid-cols-3 gap-2 xl:gap-3">
                {activeRole.highlights.map((highlight) => {
                  const HighlightIcon = highlight.icon;

                  return (
                    <div
                      key={highlight.label}
                      className="flex min-h-[72px] flex-col items-center justify-center rounded-md bg-white/80 px-1.5 py-2 text-center text-[10px] font-bold leading-tight sm:text-[11px] xl:min-h-[96px] xl:text-sm"
                      style={{ color: activeRole.accent }}
                    >
                      <HighlightIcon className="mx-auto mb-1 h-5 w-5 xl:h-6 xl:w-6" />
                      {highlight.label}
                    </div>
                  );
                })}
              </div>

              <form className="mt-6 grid gap-4 xl:mt-8 xl:gap-6" onSubmit={handleSubmit}>
                {callbackUrl ? (
                  <input type="hidden" name="callbackUrl" value={callbackUrl} />
                ) : null}
                <label className="block">
                  <span className="font-ui text-sm font-bold text-[#5b4a42] xl:text-base">
                    Usuario / Correo
                  </span>
                  <Input
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-white/30 px-0 text-base shadow-none focus-visible:ring-0 xl:h-14 xl:text-lg"
                    name="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-bold text-[#5b4a42] xl:text-base">
                    Contrasena
                  </span>
                  <Input
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-white/30 px-0 text-base shadow-none focus-visible:ring-0 xl:h-14 xl:text-lg"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                  />
                </label>

                <div className="flex flex-col gap-3 text-sm text-[#5b4a42] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between xl:text-base">
                  <label className="flex items-center gap-2">
                    <input
                      name="remember"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-[#d8b9a8]"
                      style={{ accentColor: activeRole.accent }}
                    />
                    Recordar sesion
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#7a3100] hover:underline"
                  >
                    Olvidaste tu contrasena?
                  </Link>
                </div>

                {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
                {success ? <p className="text-sm text-[#14715d]">{success}</p> : null}

                <Button
                  className="min-h-touch-target rounded-full font-ui text-label-ui text-white xl:min-h-[56px] xl:text-base"
                  style={{ backgroundColor: activeRole.accent }}
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Entrando..." : activeRole.button}
                </Button>
              </form>

              <Link
                href="/register"
                className="mt-5 inline-flex text-sm font-bold text-[#7a3100] hover:underline xl:text-base"
              >
                Crear cuenta de artesana
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
