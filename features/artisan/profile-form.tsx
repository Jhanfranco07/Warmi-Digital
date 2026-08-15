"use client";

import { useActionState, useEffect, useTransition } from "react";
import { Camera, Lock, Save } from "lucide-react";
import { toast } from "sonner";

import {
  changeArtisanPasswordAction,
  updateArtisanAvatarAction,
  updateArtisanProfileAction
} from "@/shared/actions/artisan/profile";
import { AvatarUpload } from "@/shared/components/upload/avatar-upload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

type ProfileFormProps = {
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
    communityId: string | null;
    craftTypeIds: string[];
  };
  communities: Array<{ id: string; name: string }>;
  craftTypes: Array<{ id: string; name: string }>;
};

const initialState = { ok: false, message: "" };

export function ProfileForm({ profile, communities, craftTypes }: ProfileFormProps) {
  const [isUploading, startUploading] = useTransition();
  const [profileState, profileAction, profilePending] = useActionState(
    updateArtisanProfileAction,
    initialState
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changeArtisanPasswordAction,
    initialState
  );

  useEffect(() => {
    if (!profileState.message) return;
    if (profileState.ok) {
      toast.success(profileState.message);
    } else {
      toast.error(profileState.message);
    }
  }, [profileState]);

  useEffect(() => {
    if (!passwordState.message) return;
    if (passwordState.ok) {
      toast.success(passwordState.message);
    } else {
      toast.error(passwordState.message);
    }
  }, [passwordState]);

  return (
    <div className="grid gap-7 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
        <header className="mb-6 flex items-center gap-3">
          <Camera className="h-7 w-7 text-[#b5245b]" />
          <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
            Datos personales
          </h2>
        </header>

        <AvatarUpload
          currentUrl={profile.avatarUrl}
          alt={profile.displayName}
          folder="warmi/avatars"
          onUploaded={(file) => {
            startUploading(async () => {
              const result = await updateArtisanAvatarAction(file.id);
              if (result.ok) {
                toast.success(result.message);
              } else {
                toast.error(result.message);
              }
            });
          }}
        />

        <form action={profileAction} className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Nombres">
            <Input name="firstName" defaultValue={profile.firstName} />
          </Field>
          <Field label="Apellidos">
            <Input name="lastName" defaultValue={profile.lastName} />
          </Field>
          <Field label="Nombre visible">
            <Input name="displayName" defaultValue={profile.displayName} />
          </Field>
          <Field label="Teléfono">
            <Input name="phone" defaultValue={profile.phone ?? ""} />
          </Field>
          <Field label="Comunidad">
            <select
              name="communityId"
              defaultValue={profile.communityId ?? ""}
              className="min-h-12 rounded-md border border-input bg-background px-3"
            >
              <option value="">Selecciona una comunidad</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Especialidades">
            <div className="grid gap-2 rounded-md border border-input bg-background p-3">
              {craftTypes.map((craftType) => (
                <label key={craftType.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="craftTypeIds"
                    value={craftType.id}
                    defaultChecked={profile.craftTypeIds.includes(craftType.id)}
                  />
                  {craftType.name}
                </label>
              ))}
            </div>
          </Field>
          <label className="grid gap-2 md:col-span-2">
            Bio
            <Textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} />
          </label>
          <Button
            type="submit"
            disabled={profilePending || isUploading}
            className="md:col-span-2"
          >
            <Save className="h-5 w-5" />
            Guardar perfil
          </Button>
        </form>
      </section>

      <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
        <header className="mb-6 flex items-center gap-3">
          <Lock className="h-7 w-7 text-[#b5245b]" />
          <h2 className="font-serif text-3xl font-bold text-[#b5245b]">Seguridad</h2>
        </header>
        <form action={passwordAction} className="grid gap-5">
          <Field label="Contraseña actual">
            <Input name="currentPassword" type="password" />
          </Field>
          <Field label="Nueva contraseña">
            <Input name="newPassword" type="password" />
          </Field>
          <Field label="Confirmar contraseña">
            <Input name="confirmPassword" type="password" />
          </Field>
          <Button type="submit" variant="outline" disabled={passwordPending}>
            Cambiar contraseña
          </Button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#5b4a42]">
      {label}
      {children}
    </label>
  );
}
