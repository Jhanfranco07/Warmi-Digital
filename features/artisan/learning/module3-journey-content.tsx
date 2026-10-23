"use client";

import { useRef, useState, useTransition } from "react";
import { Module3Session2Content } from "@/features/artisan/learning/module3-session2-content";
import { Module3Session3Content } from "@/features/artisan/learning/module3-session3-content";
import { Module3Session4Content } from "@/features/artisan/learning/module3-session4-content";
import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { useReadingPosition } from "@/shared/learning/use-reading-position";
import { useVisitedModule3Session } from "@/shared/learning/use-module3-resume";
import {
  MODULE3_SESSIONS,
  MODULE3_PAYMENT_RULE,
  MODULE3_PAYMENT_CHECKLIST,
  MODULE3_PAYMENT_ALERTS,
  MODULE3_DELIVERY_STEPS,
  module3Progress
} from "@/shared/learning/module3-journey";

export type JourneyResource = {
  id: string;
  title: string;
  mimeType: string;
  url?: string;
  downloadUrl?: string;
  publicId?: string | null;
};

export function Module3JourneyContent({
  courseId,
  lessonId,
  resources,
  completedIds = [],
  offline = false
}: {
  courseId: string;
  lessonId: string;
  resources: JourneyResource[];
  completedIds?: string[];
  offline?: boolean;
}) {
  useVisitedModule3Session(lessonId);
  const session = MODULE3_SESSIONS.find((item) => item.id === lessonId);
  const [step, setStep] = useReadingPosition(
    `${courseId}/${lessonId}/step`,
    session?.order === 3 ? 2 : 3
  );
  const [payment, setPayment] = useState<"Yape" | "Plin" | null>(null);
  const [closing, setClosing] = useState(false);
  const [guideViewerOpen, setGuideViewerOpen] = useState(false);
  const [saved, setSaved] = useState(completedIds.includes(lessonId));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const focus = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  if (!session || session.order === 1) return null;
  const guide = resources.find((resource) => resource.mimeType === "application/pdf");
  const selectedVideo = payment
    ? resources.find(
        (resource) =>
          resource.mimeType === "video/mp4" && resource.publicId?.includes(payment)
      )
    : undefined;
  const courseHref = `/artesana/aprender/${courseId}`;
  const percentage = module3Progress([...completedIds, ...(saved ? [lessonId] : [])]);
  const narration =
    session.order === 3
      ? step === 0
        ? "Elige Yape o Plin para conocer su tutorial. No compartas contraseñas ni códigos de verificación."
        : step === 1
          ? `${MODULE3_PAYMENT_RULE} ${MODULE3_PAYMENT_CHECKLIST.join(". ")}`
          : MODULE3_PAYMENT_ALERTS.join(". ")
      : (MODULE3_DELIVERY_STEPS[step]?.items.join(". ") ?? "");

  function change(next: number) {
    setStep(next);
    setMessage("");
    setGuideViewerOpen(false);
    requestAnimationFrame(() => {
      focus.current?.focus({ preventScroll: true });
      root.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  function nextSession() {
    if (!session) return;
    if (session.order === 4) {
      setClosing(true);
      requestAnimationFrame(() => {
        focus.current?.focus({ preventScroll: true });
        root.current?.scrollIntoView({ block: "start" });
      });
      return;
    }
    const href = `${courseHref}/lecciones/${MODULE3_SESSIONS[session.order].id}`;
    if (offline) {
      window.history.pushState(null, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else window.location.assign(href);
  }
  function external(url: string) {
    if (offline || !navigator.onLine)
      setMessage("Este recurso necesita conexión a internet.");
    else window.open(url, "_blank", "noopener,noreferrer");
  }
  async function pdf(save: boolean) {
    if (!guide?.url) {
      setMessage(
        offline
          ? "Esta guía todavía no está disponible sin conexión."
          : "Esta guía todavía no está disponible."
      );
      return;
    }
    if (!save) {
      setGuideViewerOpen(true);
      setMessage("");
      return;
    }
    try {
      const response = await fetch(guide.downloadUrl ?? guide.url);
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "application/pdf"
      )
        throw new Error("PDF unavailable");
      const url = URL.createObjectURL(await response.blob());
      if (!root.current) {
        URL.revokeObjectURL(url);
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${guide.title}.pdf`;
      root.current.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage("");
    } catch {
      setMessage(
        offline
          ? "Esta guía todavía no está disponible sin conexión."
          : "No se pudo descargar la guía. Intenta nuevamente."
      );
    }
  }
  function finish() {
    if (offline) {
      nextSession();
      return;
    }
    if (!navigator.onLine) {
      setMessage("Necesitas conexión a internet para guardar tu avance.");
      return;
    }
    startTransition(async () => {
      try {
        if (!saved) {
          const result = await completeLessonAction(courseId, lessonId);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
        }
        setSaved(true);
        setMessage("");
        nextSession();
      } catch {
        setMessage(
          "No se pudo guardar tu avance. Revisa tu conexión e inténtalo otra vez."
        );
      }
    });
  }
  const shared = {
    courseHref,
    offline,
    pending,
    saved,
    guideViewerOpen,
    onGuide: (save: boolean) => void pdf(save),
    onCloseGuide: () => setGuideViewerOpen(false)
  };
  return (
    <div
      ref={root}
      data-module3-journey
      data-session-order={session.order}
      className="mx-auto w-full min-w-0 max-w-3xl scroll-mt-24 space-y-5 text-base leading-7 text-[#344441] [&_button]:scroll-mb-28"
    >
      {session.order === 2 ? (
        <Module3Session2Content
          {...shared}
          resources={resources}
          onExternal={external}
          onNextSession={finish}
        />
      ) : session.order === 3 ? (
        <Module3Session3Content
          {...shared}
          step={step}
          payment={payment}
          selectedVideo={selectedVideo}
          guide={guide}
          headingRef={focus}
          narration={narration}
          onPayment={setPayment}
          onChange={change}
          onNextSession={finish}
          onExternal={external}
        />
      ) : (
        <Module3Session4Content
          {...shared}
          step={step}
          closing={closing}
          guide={guide}
          headingRef={focus}
          onChange={change}
          onShowOutcomes={() => {
            setGuideViewerOpen(false);
            finish();
          }}
          onReturnToSession={() => {
            setClosing(false);
            change(3);
          }}
        />
      )}
      {message && (
        <p role="alert" className="px-3 text-[#800041]">
          {message}
        </p>
      )}
      {!offline && (
        <p
          data-mode-detail
          role="status"
          className="px-3 text-sm font-semibold text-[#006b5a]"
        >
          Avance del Módulo 3: {percentage}%
        </p>
      )}
    </div>
  );
}
