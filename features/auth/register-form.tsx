"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Camera,
  HandHeart,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { register } from "@/shared/actions/auth/register";

const steps = [
  { icon: BookOpen, label: "Aprender" },
  { icon: Camera, label: "Documentar" },
  { icon: Sparkles, label: "Compartir" }
];

export function RegisterForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await register(formData);

        if (!result.success) {
          setError(result.message ?? "No se pudo completar el registro.");
          return;
        }

        setSuccess(result.message ?? "Registro exitoso.");
        window.location.assign(result.redirectTo ?? "/login");
      } catch (error) {
        setError((error as Error)?.message ?? "No se pudo completar el registro.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#1b1c1a]">
      <section className="mx-auto grid min-h-screen w-full max-w-[1720px] gap-0 px-3 py-3 sm:px-6 lg:grid-cols-[minmax(520px,0.95fr)_minmax(620px,1.05fr)] lg:px-10 lg:py-6 2xl:px-12">
        <aside className="relative hidden overflow-hidden rounded-l-lg bg-[#fff0f5] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(122,16,66,0.55), rgba(255,250,248,0.08) 58%), url(/images/auth/artesana.png)"
            }}
          />
          <div className="absolute left-8 top-8 rounded-full bg-white/90 px-5 py-3 shadow-[0_12px_34px_rgba(27,28,26,0.18)]">
            <WarmiLogo compact markClassName="w-36" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="font-ui text-sm font-bold uppercase tracking-[0.08em]">
              Registro artesana
            </p>
            <h1 className="mt-3 max-w-xl font-serif text-6xl font-bold leading-tight">
              Tu historia tambien es patrimonio vivo.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/90">
              Crea tu cuenta para iniciar tu ruta de aprendizaje, documentar tu oficio y
              fortalecer tu autonomia digital.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center rounded-lg border border-[#e2a0ba] bg-white shadow-[0_22px_60px_rgba(122,49,0,0.1)] lg:rounded-l-none">
          <div className="w-full max-w-[820px] p-4 sm:p-6 md:p-8 xl:p-10">
            <header className="mb-5 flex items-start justify-between gap-3 lg:hidden">
              <WarmiLogo compact markClassName="w-28" />
              <Link href="/login" className="text-sm font-bold text-[#7a3100]">
                Iniciar sesion
              </Link>
            </header>

            <div className="border-t-4 border-[#5576a7] pt-4 md:pt-5">
              <p className="font-ui text-sm font-bold uppercase text-[#b5245b]">
                Crea tu cuenta
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight md:text-5xl xl:text-6xl">
                Registro de artesana
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b4a42] xl:text-base">
                Ingresa tus datos para acceder a tu espacio de aprendizaje, historia y
                comunidad.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 xl:gap-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.label}
                    className="flex min-h-[66px] flex-col items-center justify-center rounded-md bg-[#fff0f5] px-1.5 py-2 text-center text-[10px] font-bold leading-tight text-[#b5245b] sm:text-[11px] xl:min-h-[82px] xl:text-xs"
                  >
                    <Icon className="mx-auto mb-1 h-5 w-5" />
                    {step.label}
                  </div>
                );
              })}
            </div>

            <form className="mt-5 grid gap-4 md:mt-6 xl:gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="firstName" label="Nombre" placeholder="Maria" />
                <TextField name="lastName" label="Apellido" placeholder="Quispe" />
              </div>
              <TextField
                name="displayName"
                label="Nombre visible"
                placeholder="Maria Artesana"
              />
              <TextField
                name="email"
                label="Correo"
                type="email"
                placeholder="nombre@ejemplo.com"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  name="password"
                  label="Contrasena"
                  type="password"
                  placeholder="********"
                />
                <TextField
                  name="confirmPassword"
                  label="Confirmar contrasena"
                  type="password"
                  placeholder="********"
                />
              </div>

              <div className="rounded-md border border-[#f0c3cf] bg-[#fff7f9] p-3 text-sm leading-6 text-[#5b4a42]">
                <div className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b5245b]" />
                  <p>
                    Tu cuenta se crea como artesana. Mas adelante podras completar tu
                    comunidad, tecnica e historia cultural.
                  </p>
                </div>
              </div>

              {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
              {success ? <p className="text-sm text-[#14715d]">{success}</p> : null}

              <Button
                className="min-h-touch-target rounded-full bg-[#b5245b] font-ui text-label-ui text-white hover:bg-[#9f1f50]"
                type="submit"
                disabled={isPending}
              >
                <HandHeart className="h-5 w-5" />
                {isPending ? "Registrando..." : "Crear mi cuenta"}
              </Button>
            </form>

            <div className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#5b4a42]">Ya tienes una cuenta?</span>
              <Link href="/login" className="font-bold text-[#7a3100] hover:underline">
                Volver al inicio de sesion
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function TextField({
  name,
  label,
  placeholder,
  type = "text"
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-ui text-sm font-bold text-[#5b4a42]">{label}</span>
      <Input
        className="mt-2 h-11 rounded-none border-x-0 border-t-0 border-[#d8b9a8] bg-transparent px-0 shadow-none focus-visible:ring-0"
        name={name}
        type={type}
        placeholder={placeholder}
        required
      />
    </label>
  );
}
