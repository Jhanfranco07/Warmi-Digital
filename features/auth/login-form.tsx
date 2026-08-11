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
    image: "/images/auth/artesana.png",
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
    image: "/images/auth/facilitadora.png",
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
    <main className="min-h-screen bg-[#fffaf8] text-[#1b1c1a] lg:h-screen lg:overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:px-10 lg:py-5">
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

        <div className="mt-3 shrink-0 border-t-4 border-[#5576a7] pt-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="font-serif text-2xl text-[#c8905a]">*</span>
            <h1 className="font-ui text-2xl font-extrabold uppercase text-[#b5245b] md:text-3xl">
              Como deseas ingresar?
            </h1>
            <span className="font-serif text-2xl text-[#c8905a]">*</span>
          </div>
        </div>

        <div className="mt-4 grid shrink-0 gap-4 lg:grid-cols-2">
          <RoleCard selected={role === "artesana"} role="artesana" onSelect={setRole} />
          <RoleCard
            selected={role === "facilitadora"}
            role="facilitadora"
            onSelect={setRole}
          />
        </div>

        <div
          className="mt-4 grid flex-1 overflow-hidden rounded-lg border bg-white shadow-[0_18px_44px_rgba(122,49,0,0.09)] lg:min-h-0 lg:grid-cols-[0.72fr_1.28fr]"
          style={{ borderColor: activeRole.border }}
        >
          <div
            className="hidden bg-cover bg-center lg:block"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,250,248,0.08), rgba(255,250,248,0.9)), url(${activeRole.image})`
            }}
          />

          <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <span
                className="inline-flex rounded-full px-4 py-2 font-ui text-sm font-bold text-white"
                style={{ backgroundColor: activeRole.accent }}
              >
                {activeRole.eyebrow}
              </span>
              <RoleIcon className="mt-5 h-8 w-8" style={{ color: activeRole.accent }} />
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">
                {activeRole.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                {activeRole.description}
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              {callbackUrl ? (
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="font-ui text-sm font-bold text-[#5b4a42]">
                    Usuario / Correo
                  </span>
                  <Input
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-transparent px-0 shadow-none focus-visible:ring-0"
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
                    className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-transparent px-0 shadow-none focus-visible:ring-0"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                  />
                </label>
              </div>

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
                <div className="flex gap-4 text-[#7a3100]">
                  <Link href="/forgot-password" className="hover:underline">
                    Olvidaste tu contrasena?
                  </Link>
                  <Link href="/register" className="hover:underline">
                    Crear cuenta
                  </Link>
                </div>
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
          </div>
        </div>
      </section>
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
        "group overflow-hidden rounded-lg border bg-white text-left shadow-[0_12px_30px_rgba(122,16,66,0.08)] transition-transform hover:-translate-y-1",
        selected && "ring-2 ring-offset-2"
      )}
      style={{
        borderColor: option.border,
        backgroundColor: option.soft,
        ["--tw-ring-color" as string]: option.accent
      }}
      aria-pressed={selected}
    >
      <div className="grid min-h-[210px] grid-cols-[1fr_42%]">
        <div className="flex flex-col p-5">
          <span
            className="grid h-12 w-12 place-items-center rounded-full text-white"
            style={{ backgroundColor: option.accent }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <h2
            className="mt-4 max-w-[250px] font-ui text-2xl font-extrabold uppercase leading-tight"
            style={{ color: option.accent }}
          >
            {option.eyebrow}
          </h2>
          <p className="mt-2 max-w-[300px] text-sm font-semibold leading-5 text-[#74483d]">
            {option.description}
          </p>
          <span
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-md px-4 py-2 font-ui text-sm font-bold text-white"
            style={{ backgroundColor: option.accent }}
          >
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div
          className="bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to left, rgba(255,255,255,0), ${option.soft} 82%), url(${option.image})`
          }}
        />
      </div>
      <div
        className="grid grid-cols-3 border-t px-3 py-2.5"
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
