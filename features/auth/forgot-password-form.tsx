"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/shared/components/auth/auth-card";
import { requestPasswordReset } from "@/shared/actions/auth/request-password-reset";

export function ForgotPasswordForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await requestPasswordReset(formData);

        if (!result.success) {
          setError(result.message ?? "No se pudo procesar la solicitud.");
          return;
        }

        setInfo(
          result.resetToken
            ? `${result.message} Token temporal de desarrollo: ${result.resetToken}`
            : (result.message ?? "Solicitud recibida.")
        );
      } catch (error) {
        setError((error as Error)?.message ?? "No se pudo procesar la solicitud.");
      }
    });
  };

  return (
    <AuthCard
      title="Olvide mi contrasena"
      description="Solicita un enlace temporal para restablecer tu contrasena."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-label-ui">Correo</span>
          <Input name="email" type="email" placeholder="nombre@ejemplo.com" required />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {info ? <p className="text-sm text-tertiary">{info}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enviando..." : "Solicitar restablecimiento"}
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
