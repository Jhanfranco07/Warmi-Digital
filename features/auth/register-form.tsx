"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/shared/components/auth/auth-card";
import { register } from "@/shared/actions/auth/register";

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
    <AuthCard
      title="Registro de artesana"
      description="Crea tu cuenta para acceder al panel de artesana y comenzar con el aprendizaje."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="text-label-ui">Nombre</span>
            <Input name="firstName" type="text" placeholder="Maria" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Apellido</span>
            <Input name="lastName" type="text" placeholder="Quispe" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Nombre visible</span>
            <Input name="displayName" type="text" placeholder="Maria Artesana" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Correo</span>
            <Input name="email" type="email" placeholder="nombre@ejemplo.com" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Contrasena</span>
            <Input name="password" type="password" placeholder="********" required />
          </label>
          <label className="block">
            <span className="text-label-ui">Confirmar contrasena</span>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="********"
              required
            />
          </label>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-tertiary">{success}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Registrando..." : "Crear cuenta"}
        </Button>
      </form>

      <div className="flex flex-col gap-2 pt-4 text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Volver al inicio de sesion
        </Link>
      </div>
    </AuthCard>
  );
}
