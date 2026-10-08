"use client";
/* eslint-disable @next/next/no-img-element -- Cache the existing originals, without remote image transforms. */
/* eslint-disable @next/next/no-html-link-for-pages -- The existing offline shell handles navigation locally. */
import { ArrowRight, BookOpen, CheckCircle2, WifiOff } from "lucide-react";
import { LEARNING_PROGRAM, moduleCapability } from "@/shared/learning/program";
import type { ModuleDownload } from "@/shared/offline/module3-types";
import {
  OFFLINE_HERO,
  OFFLINE_LOGO,
  offlineProgress
} from "@/shared/offline/offline-presentation";

export function DownloadedModuleCard({ download }: { download: ModuleDownload }) {
  const progress = offlineProgress(download);
  const href = `/artesana/aprender/${moduleCapability(download.moduleId) ? LEARNING_PROGRAM.id : download.courseId}?module=${encodeURIComponent(download.moduleId)}`;
  return (
    <article
      data-downloaded-module={download.moduleId}
      className="space-y-3 rounded-lg border border-[#ead2dc] bg-white p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-[#24756f]">
        <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
        Disponible sin conexión
      </p>
      <h3 className="font-serif text-xl font-bold leading-snug text-[#202b29]">
        {moduleCapability(download.moduleId)?.title ?? download.title}
      </h3>
      <p>{download.lessons.length} sesiones disponibles</p>
      {progress && (
        <p className="text-sm text-[#24756f]">
          {progress.completed} de {progress.total} sesiones completadas al descargar
        </p>
      )}
      <a
        href={href}
        className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
        aria-label={`Continuar: ${moduleCapability(download.moduleId)?.title ?? download.title}`}
      >
        Continuar
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </a>
    </article>
  );
}
export function OfflineHome({
  downloads,
  loading
}: {
  downloads: ModuleDownload[];
  loading: boolean;
}) {
  return (
    <div data-warmi-offline-home className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-[#ead2dc] bg-white">
        <div
          className="bg-[#303b36] bg-cover bg-center px-5 py-7 text-center text-white sm:px-8 sm:py-10"
          style={{
            backgroundImage: `linear-gradient(rgba(20,30,26,.7),rgba(20,30,26,.8)),url(${OFFLINE_HERO})`
          }}
        >
          <img
            src={OFFLINE_LOGO}
            alt="Warmi Digital"
            width={80}
            height={80}
            className="mx-auto h-20 w-20 rounded-full bg-white object-contain p-1"
          />
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-wide sm:text-4xl">
            WARMI DIGITAL
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-base italic leading-7">
            Artesanas conectadas, historias que transforman.
          </p>
        </div>
        <div className="space-y-4 p-5 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#185750]">
            <WifiOff aria-hidden="true" className="h-5 w-5 shrink-0" />
            Estás sin conexión
          </h2>
          <p className="leading-7">
            Puedes seguir aprendiendo con los contenidos que descargaste.
          </p>
          {downloads.length > 0 && (
            <a
              data-offline-learning-cta
              href="/artesana/aprender"
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-[#b5245b] px-4 py-4 text-center font-bold text-white hover:bg-[#941747]"
            >
              <BookOpen aria-hidden="true" className="h-5 w-5 shrink-0" />
              Continuar mi aprendizaje
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
            </a>
          )}
          {loading ? (
            <p role="status">Cargando contenidos descargados…</p>
          ) : (
            downloads.length === 0 && (
              <p role="status">
                Todavía no hay contenidos descargados en este dispositivo. Cuando tengas
                conexión, entra a Mi aprendizaje y descarga un módulo.
              </p>
            )
          )}
        </div>
      </section>
      {downloads.length > 0 && (
        <section
          aria-label="Contenidos descargados"
          className="grid gap-4 md:grid-cols-2"
        >
          {downloads.map((d) => (
            <DownloadedModuleCard key={d.moduleId} download={d} />
          ))}
        </section>
      )}
    </div>
  );
}
