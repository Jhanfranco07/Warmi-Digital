"use client";

import { useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, FileText } from "lucide-react";
import { PdfViewer } from "@/shared/components/media/pdf-viewer";

export function PdfGuideDialog({
  src,
  title,
  onClose
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  const opener = useRef(typeof document === "undefined" ? null : document.activeElement);
  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/30" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          data-pdf-guide-dialog
          className="fixed inset-0 z-[100] flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white text-[#202b29] focus:outline-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current instanceof HTMLElement)
              opener.current.focus({ preventScroll: true });
          }}
        >
          <header className="shrink-0 border-b border-[#ead2dc] bg-white px-3 pb-3 pt-[calc(.5rem+env(safe-area-inset-top))] sm:px-6">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-base font-bold text-[#9c174e] hover:bg-[#fff0f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9c174e]"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
                Volver a la lección
              </button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Title className="flex min-w-0 items-start gap-2 px-2 text-base font-bold leading-6 sm:text-lg">
              <FileText
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[#006b5a]"
              />
              <span className="min-w-0 break-words">{title}</span>
            </DialogPrimitive.Title>
          </header>
          <PdfViewer src={src} title={title} fullScreen />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
