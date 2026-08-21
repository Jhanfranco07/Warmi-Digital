import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

import {
  AdminUserActions,
  CreateUserDialog,
  type AdminUserListItem
} from "@/features/admin/users/admin-user-actions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import {
  type AdminUserStatus,
  UserRepository
} from "@/shared/repositories/user.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
};

const roles = ["ALL", "ARTESANA", "FACILITADORA", "ADMIN"] as const;
const statuses = ["ALL", "ACTIVE", "DISABLED"] as const;

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  FACILITADORA: "Facilitadora",
  ARTESANA: "Artesana"
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requireRole("ADMIN");
  const params = await searchParams;
  const role = parseRole(params.role);
  const status = parseStatus(params.status);
  const page = Number(params.page ?? "1");
  const repository = new UserRepository();
  const result = await repository.findForAdmin({
    q: params.q?.trim() || undefined,
    role,
    status,
    page: Number.isFinite(page) ? page : 1,
    pageSize: 12
  });

  const users = result.users.map((user): AdminUserListItem => {
    const primaryRole = pickPrimaryRole(
      user.userRoles.map((assignment) => assignment.role.name)
    );
    const profileName = [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ");
    const displayName =
      user.profile?.displayName ?? user.name ?? (profileName || user.email);

    return {
      id: user.id,
      name: displayName,
      email: user.email,
      role: primaryRole,
      roleLabel: roleLabels[primaryRole],
      status: user.deletedAt ? "DISABLED" : "ACTIVE",
      statusLabel: user.deletedAt ? "Desactivado" : "Activo",
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt),
      isSelf: user.id === session.user.id
    };
  });

  return (
    <main className="min-h-screen bg-[#fffaf8] px-4 py-6 md:px-8 lg:px-10 xl:px-14">
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="flex flex-col gap-5 border-b border-[#ead4ca] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="border-l-4 border-[#d39a12] pl-5">
            <p className="font-ui text-sm font-bold uppercase text-[#b5245b]">Admin</p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-tight text-[#101833] md:text-6xl">
              Gestion de usuarios
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#5b4a42]">
              Administra las cuentas y accesos de Warmi Digital.
            </p>
          </div>
          <CreateUserDialog />
        </div>

        <form
          action="/admin/usuarios"
          className="mt-6 grid gap-3 rounded-2xl border border-[#ead4ca] bg-white p-4 shadow-[0_14px_34px_rgba(122,49,0,0.06)] lg:grid-cols-[minmax(280px,1fr)_220px_220px_auto]"
        >
          <label className="flex h-12 items-center gap-3 rounded-lg border border-[#ead4ca] bg-[#fffaf8] px-3">
            <Search className="h-5 w-5 text-[#b5245b]" />
            <Input
              name="q"
              defaultValue={params.q}
              className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              placeholder="Buscar por nombre o correo"
            />
          </label>
          <select
            name="role"
            defaultValue={role}
            className="h-12 rounded-lg border border-[#ead4ca] bg-white px-3 font-ui text-sm"
            aria-label="Filtrar por rol"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ARTESANA">Artesana</option>
            <option value="FACILITADORA">Facilitadora</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            name="status"
            defaultValue={status}
            className="h-12 rounded-lg border border-[#ead4ca] bg-white px-3 font-ui text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="DISABLED">Desactivado</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" className="h-12 flex-1 rounded-lg">
              Buscar
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-lg">
              <Link href="/admin/usuarios">Limpiar</Link>
            </Button>
          </div>
        </form>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#ead4ca] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.07)]">
          <div className="flex flex-col gap-2 border-b border-[#ead4ca] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
              Todas las cuentas
            </h2>
            <p className="font-ui text-sm text-[#5b4a42]">
              {result.total} usuarios encontrados
            </p>
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-ui font-bold text-[#30130d]">{user.name}</p>
                        {user.isSelf ? (
                          <p className="text-xs font-semibold text-[#b5245b]">
                            Tu cuenta administrativa
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} label={user.roleLabel} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} label={user.statusLabel} />
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <AdminUserActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-[#ead4ca] bg-[#fffaf8] p-4 shadow-[0_10px_24px_rgba(122,49,0,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-ui text-lg font-extrabold text-[#30130d]">
                      {user.name}
                    </h3>
                    <p className="mt-1 break-all text-sm text-[#5b4a42]">{user.email}</p>
                  </div>
                  <AdminUserActions user={user} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <RoleBadge role={user.role} label={user.roleLabel} />
                  <StatusBadge status={user.status} label={user.statusLabel} />
                </div>
                <p className="mt-3 text-sm text-[#5b4a42]">
                  Registro: {user.createdAt}
                </p>
              </article>
            ))}
          </div>

          {users.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <h3 className="font-serif text-3xl font-bold text-[#7a3100]">
                No se encontraron usuarios.
              </h3>
              <p className="mt-2 text-sm text-[#5b4a42]">
                Ajusta la busqueda o limpia los filtros para ver mas cuentas.
              </p>
            </div>
          ) : null}

          <Pagination
            currentPage={result.page}
            pageCount={result.pageCount}
            q={params.q}
            role={role}
            status={status}
          />
        </section>
      </section>
    </main>
  );
}

function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const className =
    role === "ADMIN"
      ? "bg-[#fff7df] text-[#946300]"
      : role === "FACILITADORA"
        ? "bg-[#e6fbfd] text-[#0d7280]"
        : "bg-[#fff0f5] text-[#b5245b]";

  return <Badge className={`border-transparent ${className}`}>{label}</Badge>;
}

function StatusBadge({
  status,
  label
}: {
  status: "ACTIVE" | "DISABLED";
  label: string;
}) {
  const className =
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-[#ffe8ef] text-[#9d0f4f]";

  return <Badge className={`border-transparent ${className}`}>{label}</Badge>;
}

function Pagination({
  currentPage,
  pageCount,
  q,
  role,
  status
}: {
  currentPage: number;
  pageCount: number;
  q?: string;
  role: UserRole | "ALL";
  status: AdminUserStatus | "ALL";
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#ead4ca] px-5 py-4">
      <Button asChild variant="outline" size="sm" disabled={currentPage <= 1}>
        {currentPage <= 1 ? (
          <span>
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </span>
        ) : (
          <Link href={adminUsersUrl({ q, role, status, page: currentPage - 1 })}>
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Link>
        )}
      </Button>
      <p className="font-ui text-sm font-bold text-[#5b4a42]">
        Pagina {currentPage} de {pageCount}
      </p>
      <Button asChild variant="outline" size="sm" disabled={currentPage >= pageCount}>
        {currentPage >= pageCount ? (
          <span>
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : (
          <Link href={adminUsersUrl({ q, role, status, page: currentPage + 1 })}>
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}

function adminUsersUrl({
  q,
  role,
  status,
  page
}: {
  q?: string;
  role: UserRole | "ALL";
  status: AdminUserStatus | "ALL";
  page: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role !== "ALL") params.set("role", role);
  if (status !== "ALL") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/usuarios?${query}` : "/admin/usuarios";
}

function parseRole(value?: string): UserRole | "ALL" {
  return roles.includes(value as (typeof roles)[number])
    ? (value as UserRole | "ALL")
    : "ALL";
}

function parseStatus(value?: string): AdminUserStatus | "ALL" {
  return statuses.includes(value as (typeof statuses)[number])
    ? (value as AdminUserStatus | "ALL")
    : "ALL";
}

function pickPrimaryRole(userRoles: UserRole[]): UserRole {
  if (userRoles.includes("ADMIN")) return "ADMIN";
  if (userRoles.includes("FACILITADORA")) return "FACILITADORA";
  return "ARTESANA";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}
