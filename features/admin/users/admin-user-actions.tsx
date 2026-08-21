"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { UserRole } from "@prisma/client";
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  UserCog,
  UserMinus,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

import {
  activateAdminUser,
  changeAdminUserRole,
  createAdminUser,
  deactivateAdminUser,
  type AdminActionState
} from "@/shared/actions/admin/users";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  status: "ACTIVE" | "DISABLED";
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  isSelf: boolean;
};

const initialState: AdminActionState = { ok: false, message: "" };

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createAdminUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
      setOpen(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-[#b5245b] text-white hover:bg-[#941747]">
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Crea una cuenta con contrasena temporal. La persona podra cambiarla
            despues desde su perfil.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="font-ui text-sm font-bold text-[#5b3b2f]">Nombre</span>
            <Input name="name" required placeholder="Ej. Maria Quispe" />
          </label>
          <label className="block space-y-2">
            <span className="font-ui text-sm font-bold text-[#5b3b2f]">Correo</span>
            <Input name="email" type="email" required placeholder="correo@ejemplo.com" />
          </label>
          <label className="block space-y-2">
            <span className="font-ui text-sm font-bold text-[#5b3b2f]">Rol</span>
            <select
              name="role"
              defaultValue="ARTESANA"
              className="h-11 w-full rounded-md border border-[#ead4ca] bg-white px-3 font-ui text-sm"
            >
              <option value="ARTESANA">Artesana</option>
              <option value="FACILITADORA">Facilitadora</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="font-ui text-sm font-bold text-[#5b3b2f]">
              Contrasena temporal
            </span>
            <Input name="password" type="password" required minLength={8} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUserActions({ user }: { user: AdminUserListItem }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <UserDetailsDialog user={user} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={`Acciones de ${user.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ChangeRoleDialog user={user}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <UserCog className="mr-2 h-4 w-4" />
              Cambiar rol
            </DropdownMenuItem>
          </ChangeRoleDialog>
          {user.status === "ACTIVE" ? (
            <StatusDialog user={user} mode="deactivate">
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <UserMinus className="mr-2 h-4 w-4" />
                Desactivar cuenta
              </DropdownMenuItem>
            </StatusDialog>
          ) : (
            <StatusDialog user={user} mode="activate">
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Activar cuenta
              </DropdownMenuItem>
            </StatusDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UserDetailsDialog({ user }: { user: AdminUserListItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>Informacion administrativa basica.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3 rounded-xl border border-[#ead4ca] bg-[#fffaf8] p-4 text-sm">
          <Detail label="Correo" value={user.email} />
          <Detail label="Rol" value={user.roleLabel} />
          <Detail label="Estado" value={user.statusLabel} />
          <Detail label="Fecha de registro" value={user.createdAt} />
          <Detail label="Ultima actualizacion" value={user.updatedAt} />
        </dl>
        <DialogFooter className="gap-2">
          <ChangeRoleDialog user={user}>
            <Button variant="outline">
              <ShieldCheck className="h-4 w-4" />
              Cambiar rol
            </Button>
          </ChangeRoleDialog>
          <StatusDialog user={user} mode={user.status === "ACTIVE" ? "deactivate" : "activate"}>
            <Button variant={user.status === "ACTIVE" ? "destructive" : "default"}>
              {user.status === "ACTIVE" ? "Desactivar" : "Activar"}
            </Button>
          </StatusDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
      <dt className="font-ui font-bold text-[#7a3100]">{label}</dt>
      <dd className="text-[#30130d]">{value}</dd>
    </div>
  );
}

function ChangeRoleDialog({
  user,
  children
}: {
  user: AdminUserListItem;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(changeAdminUserRole, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar rol</DialogTitle>
          <DialogDescription>
            Actualiza el acceso principal de {user.name}. No se permiten cambios que
            dejen sin control tu propia cuenta administrativa.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <label className="block space-y-2">
            <span className="font-ui text-sm font-bold text-[#5b3b2f]">Nuevo rol</span>
            <select
              name="role"
              defaultValue={user.role}
              className="h-11 w-full rounded-md border border-[#ead4ca] bg-white px-3 font-ui text-sm"
            >
              <option value="ARTESANA" disabled={user.isSelf}>
                Artesana
              </option>
              <option value="FACILITADORA" disabled={user.isSelf}>
                Facilitadora
              </option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {user.isSelf ? (
            <p className="rounded-lg bg-[#fff2cf] px-3 py-2 text-sm text-[#7a3100]">
              No puedes quitarte el rol ADMIN desde este panel.
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({
  user,
  mode,
  children
}: {
  user: AdminUserListItem;
  mode: "activate" | "deactivate";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = mode === "activate" ? activateAdminUser : deactivateAdminUser;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const isDeactivate = mode === "deactivate";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivate ? "Desactivar esta cuenta?" : "Activar esta cuenta?"}
          </DialogTitle>
          <DialogDescription>
            {isDeactivate
              ? "Esta persona ya no podra ingresar a Warmi Digital hasta que vuelvas a activar su cuenta."
              : "Esta persona podra volver a ingresar a Warmi Digital con sus credenciales."}
          </DialogDescription>
        </DialogHeader>
        {user.isSelf && isDeactivate ? (
          <p className="rounded-lg bg-[#ffe8ef] px-3 py-2 text-sm font-semibold text-[#9d0f4f]">
            No puedes desactivar tu propia cuenta administrativa.
          </p>
        ) : null}
        <form action={formAction}>
          <input type="hidden" name="userId" value={user.id} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <SubmitButton disabled={user.isSelf && isDeactivate} mode={mode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({
  disabled,
  mode
}: {
  disabled?: boolean;
  mode: "activate" | "deactivate";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={mode === "deactivate" ? "destructive" : "default"}
      disabled={pending || disabled}
    >
      {mode === "activate" ? <CheckCircle2 className="h-4 w-4" /> : null}
      {pending
        ? "Procesando..."
        : mode === "activate"
          ? "Activar cuenta"
          : "Desactivar cuenta"}
    </Button>
  );
}
