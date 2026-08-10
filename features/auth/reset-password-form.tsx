"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/shared/components/auth/auth-card";
import { resetPassword } from "@/shared/actions/auth/reset-password";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      try {
        const result = await resetPassword(formData);

        if (!result.success) {
          setError(result.message ?? "No se pudo restablecer la contrasena.");
          return;
        }

        setInfo(result.message ?? "Contrasena restablecida correctamente.");
        window.location.assign(result.redirectTo ?? "/login");
      } catch (error) {
        setError((error as Error)?.message ?? "No se pudo restablecer la contrasena.");
      }
    });
  };

  return (
    <AuthCard
      title="Restablecer contrasena"
      description="Configura una nueva contrasena para tu cuenta."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <input type="hidden" name="token" value={token} />
        <label className="block">
          <span className="text-label-ui">Nueva contrasena</span>
          <Input
            name="password"
            type="password"
            placeholder="Nueva contrasena"
            required
          />
        </label>
        <label className="block">
          <span className="text-label-ui">Confirma la contrasena</span>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Repite la contrasena"
            required
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {info ? <p className="text-sm text-tertiary">{info}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Restableciendo..." : "Restablecer contrasena"}
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
