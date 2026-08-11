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
    <main className="min-h-screen bg-[#fffaf8] text-[#1b1c1a] lg:h-screen lg:overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:px-10 lg:py-6">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <Link href="/" aria-label="Ir al inicio">
            <WarmiLogo compact markClassName="w-32 md:w-36" />
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

        <div className="mt-4 shrink-0 border-t-4 border-[#5576a7] pt-4 text-center">
          <p className="font-ui text-sm font-bold uppercase text-[#b5245b]">
            Como deseas ingresar?
          </p>
        </div>

        <div
          className="mt-4 grid flex-1 overflow-hidden rounded-lg border bg-white shadow-[0_22px_60px_rgba(122,49,0,0.1)] lg:min-h-0 lg:grid-cols-[1.06fr_0.94fr]"
          style={{ borderColor: activeRole.border }}
        >
          <div className="relative min-h-[300px] overflow-hidden bg-[#f7efe9] lg:min-h-0">
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

            <div className="absolute left-5 top-5 flex rounded-full bg-white/90 p-1 shadow-[0_12px_34px_rgba(27,28,26,0.18)]">
              {(Object.keys(roles) as Array<keyof typeof roles>).map((item) => {
                const option = roles[item];
                const selected = role === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={cn(
                      "rounded-full px-4 py-2 font-ui text-sm font-bold transition-colors",
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
              className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-ui text-sm font-bold uppercase tracking-[0.08em]">
                {activeRole.eyebrow}
              </p>
              <h1 className="mt-2 max-w-xl font-serif text-4xl font-bold leading-tight md:text-6xl">
                {activeRole.title}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/90 md:text-base">
                {activeRole.description}
              </p>
            </motion.div>
          </div>

          <div
            className="flex flex-col justify-center p-5 md:p-8"
            style={{ backgroundColor: activeRole.soft }}
          >
            <div className="mx-auto w-full max-w-md">
              <motion.div
                key={`${role}-form-head`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <RoleIcon className="h-9 w-9" style={{ color: activeRole.accent }} />
                <h2 className="mt-4 font-serif text-4xl font-bold leading-tight">
                  Accede a Warmi Digital
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                  Seleccionaste:{" "}
                  <span className="font-bold" style={{ color: activeRole.accent }}>
                    {activeRole.label}
                  </span>
                </p>
              </motion.div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {activeRole.highlights.map((highlight) => {
                  const HighlightIcon = highlight.icon;

                  return (
                    <div
                      key={highlight.label}
                      className="rounded-md bg-white/80 px-2 py-3 text-center text-[11px] font-bold"
                      style={{ color: activeRole.accent }}
                    >
                      <HighlightIcon className="mx-auto mb-1 h-5 w-5" />
                      {highlight.label}
                    </div>
                  );
                })}
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {callbackUrl ? (
                  <input type="hidden" name="callbackUrl" value={callbackUrl} />
                ) : null}
                <label className="block">
                  <span className="font-ui text-sm font-bold text-[#5b4a42]">
                    Usuario / Correo
                  </span>
                  <Input
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-white/30 px-0 shadow-none focus-visible:ring-0"
                    name="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-bold text-[#5b4a42]">
                    Contrasena
                  </span>
                  <Input
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-white/30 px-0 shadow-none focus-visible:ring-0"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b4a42]">
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
                  className="min-h-touch-target rounded-full font-ui text-label-ui text-white"
                  style={{ backgroundColor: activeRole.accent }}
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Entrando..." : activeRole.button}
                </Button>
              </form>

              <Link
                href="/register"
                className="mt-5 inline-flex text-sm font-bold text-[#7a3100] hover:underline"
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
