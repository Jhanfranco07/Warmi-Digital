"use client";
import { countLabel, snapshotProgressLabel } from "@/shared/learning/presentation";
/* eslint-disable @next/next/no-img-element -- Cache the existing originals, without remote image transforms. */
/* eslint-disable @next/next/no-html-link-for-pages -- The existing offline shell handles navigation locally. */
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LEARNING_PROGRAM, moduleCapability } from "@/shared/learning/program";
import type { ModuleDownload } from "@/shared/offline/module3-types";
import { Footer } from "@/shared/components/layout/footer";
import { offlineProgress } from "@/shared/offline/offline-presentation";
import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiWelcomeContent } from "@/shared/components/landing/welcome-content";
import { WarmiProgrammeContent } from "@/shared/components/landing/programa-content";
import { WarmiDiscoveryContent } from "@/shared/components/landing/descubre-content";
import { WarmiIdentityContent } from "@/shared/components/landing/identidad-content";

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
      <p>
        {countLabel(download.lessons.length, "sesión disponible", "sesiones disponibles")}
      </p>
      {progress && progress.total > 0 && (
        <p className="text-sm text-[#24756f]">
          {snapshotProgressLabel(progress.completed, progress.total)}
        </p>
      )}
      <a
        href={href}
        className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
        aria-label={`${progress && progress.total > 0 && progress.completed === progress.total ? "Repasar" : "Continuar"}: ${moduleCapability(download.moduleId)?.title ?? download.title}`}
      >
        {progress && progress.total > 0 && progress.completed === progress.total
          ? "Repasar"
          : "Continuar"}
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
    <div
      data-warmi-offline-home
      className="overflow-hidden rounded-lg border border-[#ead2dc] bg-white"
    >
      <WarmiPublicHeader offline compact />
      {loading ? (
        <p role="status" className="p-5">
          Cargando contenidos descargados…
        </p>
      ) : downloads.length === 0 ? (
        <p role="status" className="p-5">
          Todavía no hay contenidos descargados en este dispositivo. Cuando tengas
          conexión, entra a Mi aprendizaje y descarga un módulo.
        </p>
      ) : null}
      <WarmiWelcomeContent offline />
      <section id="programa" aria-labelledby="offline-programa" className="scroll-mt-16">
        <h2
          id="offline-programa"
          className="px-4 pt-8 font-serif text-3xl font-bold text-[#123f78]"
        >
          Programa Warmi
        </h2>
        <WarmiProgrammeContent offline />
      </section>
      <section id="descubre" aria-labelledby="offline-descubre" className="scroll-mt-16">
        <h2
          id="offline-descubre"
          className="px-4 pt-8 font-serif text-3xl font-bold text-[#123f78]"
        >
          Descubre
        </h2>
        <WarmiDiscoveryContent offline />
      </section>
      <section
        id="identidad"
        aria-labelledby="offline-identidad"
        className="scroll-mt-16"
      >
        <h2
          id="offline-identidad"
          className="px-4 py-8 font-serif text-3xl font-bold text-[#123f78]"
        >
          Identidad Warmi · Riqsichiq Warmi
        </h2>
        <WarmiIdentityContent offline />
      </section>
      {downloads.length > 0 && (
        <section
          aria-label="Contenidos descargados"
          className="grid gap-4 p-4 md:grid-cols-2"
        >
          {downloads.map((d) => (
            <DownloadedModuleCard key={d.moduleId} download={d} />
          ))}
        </section>
      )}
      <Footer />
    </div>
  );
}
