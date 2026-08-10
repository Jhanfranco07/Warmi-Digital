"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/shared/components/auth/auth-card";
import { login } from "@/shared/actions/auth/login";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
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
    <AuthCard
      title="Iniciar sesion"
      description="Accede como ADMIN, FACILITADORA o ARTESANA con tu correo y contrasena."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {callbackUrl ? (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        ) : null}
        <div className="grid gap-4">
          <label className="block">
            <span className="text-label-ui">Correo</span>
            <Input name="email" type="email" placeholder="nombre@ejemplo.com" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Contrasena</span>
            <Input name="password" type="password" placeholder="********" required />
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

        <Button type="submit" disabled={isPending}>
          {isPending ? "Entrando..." : "Ingresar"}
        </Button>
      </form>

      <div className="flex flex-col gap-2 pt-4 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Olvidaste tu contrasena?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Crear cuenta de artesana
        </Link>
      </div>
    </AuthCard>
  );
}
