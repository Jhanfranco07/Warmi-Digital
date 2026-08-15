import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  FolderOpen,
  Pencil,
  PlayCircle,
  Plus,
  Search
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { CourseRepository } from "@/shared/repositories/course.repository";

const courseRows = [
  {
    title: "Tejido en telar de cintura",
    level: "Intermedio",
    description: "Aprende técnicas tradicionales del tejido en telar de cintura.",
    image: "/images/discover/aprende.png",
    modules: 6,
    artisans: 24,
    progress: 78,
    facilitator: "María Quispe",
    updatedAt: "24 may. 2024",
    status: "Activo"
  },
  {
    title: "Decoración en cerámica",
    level: "Básico",
    description: "Explora técnicas de decoración y pintura en cerámica.",
    image: "/images/discover/taller.png",
    modules: 5,
    artisans: 18,
    progress: 62,
    facilitator: "Rosa Quispe",
    updatedAt: "20 may. 2024",
    status: "Activo"
  },
  {
    title: "Tintes naturales",
    level: "Intermedio",
    description: "Aprende a obtener y aplicar tintes naturales en fibras textiles.",
    image: "/images/discover/recursos.png",
    modules: 4,
    artisans: 15,
    progress: 55,
    facilitator: "Sonia Choque",
    updatedAt: "15 may. 2024",
    status: "Activo"
  },
  {
    title: "Diseño de patrones textiles",
    level: "Avanzado",
    description: "Crea patrones originales inspirados en la cultura local.",
    image: "/images/discover/emprende.png",
    modules: 3,
    artisans: 0,
    progress: 0,
    facilitator: "María Quispe",
    updatedAt: "10 may. 2024",
    status: "En borrador"
  }
];

const materials = [
  ["PDF", "Guía: Tejido en telar de cintura", "Tejido en telar de cintura", "2.4 MB"],
  ["VIDEO", "Técnicas de urdido", "Tejido en telar de cintura", "45.6 MB"],
  ["PDF", "Patrones geométricos andinos", "Diseño de patrones textiles", "1.8 MB"],
  ["GUÍA", "¿Cómo preparar tintes naturales?", "Tintes naturales", "3.1 MB"],
  ["VIDEO", "Proceso de teñido con cochinilla", "Tintes naturales", "37.2 MB"]
];

const metricCards: {
  label: string;
  value: number;
  detail: string;
  Icon: LucideIcon;
}[] = [
  { label: "Cursos activos", value: 12, detail: "+2 este mes", Icon: BookOpen },
  { label: "En borrador", value: 3, detail: "Sin publicar", Icon: FileText },
  { label: "Materiales subidos", value: 86, detail: "+14 este mes", Icon: FolderOpen }
];

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const courses = await new CourseRepository().findManagedCourses(session.user.id);
  const activeCount =
    courses.filter((course) => course.status === "PUBLISHED").length || 12;

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm text-[#6b5a4e]">
          Inicio <span className="mx-3 text-[#c69b76]">›</span>
          <span className="font-bold text-[#171412]">Cursos</span>
        </p>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_760px] xl:items-end">
          <div>
            <h1 className="font-display text-5xl leading-tight xl:text-6xl">
              Cursos y materiales
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Gestiona los cursos que facilitas y los materiales de aprendizaje.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {metricCards.map(({ label, value, detail, Icon }) => (
              <article
                key={label}
                className="rounded-[10px] border border-[#eed8bf] bg-white p-5 shadow-[0_18px_45px_rgba(122,73,20,0.07)]"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="font-display text-3xl">
                      {label === "Cursos activos" ? activeCount : value}
                    </p>
                    <p className="font-ui text-sm font-bold">{label}</p>
                    <p className="text-sm text-emerald-700">{detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr_180px_220px_240px]">
          <Link
            href="/facilitadora/cursos/nuevo"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#d89b06] px-5 font-ui font-bold text-white shadow-[0_12px_28px_rgba(216,155,6,0.22)]"
          >
            <Plus className="h-5 w-5" /> Nuevo curso
          </Link>
          <label className="flex min-h-12 items-center gap-3 rounded-[8px] border border-[#ead4ca] bg-white px-4">
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Buscar cursos..."
            />
            <Search className="h-5 w-5 text-[#7a5b4a]" />
          </label>
          {[
            "Estado: Todos",
            "Nivel: Todos los niveles",
            "Ordenar por: Más recientes"
          ].map((item) => (
            <button
              key={item}
              className="rounded-[8px] border border-[#ead4ca] bg-white px-4 text-left font-ui text-sm text-[#6b5a4e]"
            >
              {item}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {courseRows.map((course) => (
            <article
              key={course.title}
              className="grid gap-5 rounded-[10px] border border-[#eed8bf] bg-white p-4 shadow-[0_16px_42px_rgba(122,73,20,0.06)] transition duration-300 hover:-translate-y-1 xl:grid-cols-[200px_1fr_90px_120px_150px_190px_150px] xl:items-center"
            >
              <div className="relative h-32 overflow-hidden rounded-[8px]">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl">{course.title}</h2>
                  <span
                    className={
                      course.status === "Activo"
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                        : "rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]"
                    }
                  >
                    {course.status}
                  </span>
                </div>
                <span className="mt-3 inline-flex rounded-full bg-[#ffe8f0] px-3 py-1 text-xs font-bold text-[#8a1747]">
                  {course.level}
                </span>
                <p className="mt-2 text-sm text-[#6b5a4e]">{course.description}</p>
              </div>
              <p className="text-sm">
                <span className="font-display block text-2xl">{course.modules}</span>
                Módulos
              </p>
              <p className="text-sm">
                <span className="font-display block text-2xl">{course.artisans}</span>
                Artesanas inscritas
              </p>
              <div>
                <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-[#79b44a] font-ui text-sm font-bold">
                  {course.progress}%
                </div>
                <p className="mt-2 text-xs text-[#6b5a4e]">Promedio de progreso</p>
              </div>
              <div>
                <p className="text-xs text-[#7a5b4a]">Facilitadora responsable</p>
                <p className="mt-2 font-ui font-bold">{course.facilitator}</p>
              </div>
              <div className="grid gap-2">
                <Link
                  href="/facilitadora/cursos/nuevo"
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d89b06] px-4 py-2 font-ui font-bold text-[#b26f00]"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Link>
                <Link
                  href="/facilitadora/cursos"
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d89b06] px-4 py-2 font-ui font-bold text-[#b26f00]"
                >
                  Ver detalle <ChevronRight className="h-4 w-4" />
                </Link>
                <p className="text-xs text-[#9b7b66]">Actualizado: {course.updatedAt}</p>
              </div>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Materiales recientes</h2>
            <Link
              href="/facilitadora/cursos"
              className="font-ui text-sm font-bold text-[#8a1747]"
            >
              Ver todos los materiales
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {materials.map(([type, title, course, size]) => (
              <article
                key={title}
                className="rounded-[10px] border border-[#eed8bf] bg-white p-5 shadow-[0_14px_36px_rgba(122,73,20,0.06)]"
              >
                <span
                  className={
                    type === "VIDEO"
                      ? "grid h-11 w-11 place-items-center rounded-[8px] bg-emerald-100 text-emerald-700"
                      : "grid h-11 w-11 place-items-center rounded-[8px] bg-[#ffe8e8] text-[#c73737]"
                  }
                >
                  {type === "VIDEO" ? (
                    <PlayCircle className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </span>
                <p className="mt-4 text-xs font-bold text-[#9a6800]">{type}</p>
                <h3 className="mt-1 font-ui font-bold">{title}</h3>
                <p className="mt-2 text-sm text-[#6b5a4e]">{course}</p>
                <p className="mt-5 text-xs text-[#9b7b66]">
                  Subido hace 1 semana · {size}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
