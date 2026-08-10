"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/shared/actions/auth/login";
import { HandHeart, UsersRound } from "lucide-react";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [role, setRole] = React.useState<"artesana" | "facilitadora">("artesana");

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

  const roleCopy = role === "artesana" ? { title: "Bienvenida a tu taller", description: "Accede para continuar aprendiendo, creando y preservando tu herencia.", icon: HandHeart } : { title: "Bienvenida, Facilitadora", description: "Accede para continuar guiando a la comunidad y acompanando sus procesos.", icon: UsersRound };
  const RoleIcon = roleCopy.icon;
  return (
    <main className="grid min-h-screen bg-surface md:grid-cols-[1.2fr_0.8fr]">
      <aside className="relative hidden min-h-screen bg-cover bg-center md:block" style={{ backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCALyFOMNshlu8spmcZJTvzNV6c0By891ZqDXEBHhPmKcFLhA3xMzyY50ew-aW0BnQE0ss8-gSZ98s-Q5kW52fHNh5NkJp4qEH5Pv8L2p1sxcBVvRnmaZdPcA3WTTI15HVgrQol4UY4_C1EEIUIooGBBiSpRIPVTRNcSavo3TLrQwIqlAFQAJZVxpcNgIpgbxicsiWJaLkadylZrQ2N9C5x6_E2a740t9Sj5ol--qlqt49l9bTsvt-D)" }}><div className="absolute inset-0 bg-primary/20" /></aside>
      <section className="relative flex items-center justify-center p-6 md:p-12"><Link href="/" className="absolute left-6 top-7 font-serif text-headline-md text-primary md:left-12 md:top-12">Warmi Digital</Link><div className="w-full max-w-md pt-20 md:pt-12">
        <div className="mb-10 inline-flex rounded-full bg-surface-container-low p-1"><button type="button" onClick={() => setRole("artesana")} className={`rounded-full px-5 py-2 font-ui text-label-ui ${role === "artesana" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Soy Artesana</button><button type="button" onClick={() => setRole("facilitadora")} className={`rounded-full px-5 py-2 font-ui text-label-ui ${role === "facilitadora" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Soy Facilitadora</button></div>
        <RoleIcon className="h-8 w-8 text-primary" /><h1 className="mt-3 font-serif text-headline-lg text-foreground">{roleCopy.title}</h1><p className="mt-3 text-body-lg text-muted-foreground">{roleCopy.description}</p>
      <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
        {callbackUrl ? (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        ) : null}
        <div className="grid gap-6">
          <label className="block">
            <span className="text-label-ui text-muted-foreground">Usuario / Correo</span>
            <Input className="mt-2 rounded-none border-x-0 border-t-0 px-0 shadow-none" name="email" type="email" placeholder="nombre@ejemplo.com" required />
          </label>
          <label className="block">
            <span className="text-label-ui text-muted-foreground">Contrasena</span>
            <Input className="mt-2 rounded-none border-x-0 border-t-0 px-0 shadow-none" name="password" type="password" placeholder="********" required />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              name="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Recordar sesion
          </label>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-tertiary">{success}</p> : null}

        <Button className="w-full rounded-full py-6" type="submit" disabled={isPending}>
          {isPending ? "Entrando..." : "Ingresar"}
        </Button>
      </form>

      <div className="flex flex-col gap-3 pt-8 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Olvidaste tu contrasena?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Crear cuenta de artesana
        </Link>
      </div></div></section>
    </main>
  );
}
