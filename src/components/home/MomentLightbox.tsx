"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Moment } from "@/lib/query/mockData";

export function MomentLightbox({
  moment,
  open,
  onClose,
}: {
  moment: Moment;
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#28313A]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={moment.title}
        className="relative aspect-[4/3] h-auto max-h-[75vh] w-[min(92vw,40rem)] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#6B8570] via-[#5A7360] to-[#4A5F50] shadow-2xl"
      >
        <Image
          src={moment.imageSrc}
          alt={moment.title}
          fill
          sizes="(min-width: 1024px) 40rem, 92vw"
          priority
          className="object-contain object-center"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(74,95,80,0.5)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3F5244]/95 via-[#4F6655]/75 to-transparent px-5 pb-4 pt-12 text-white">
          <p className="font-heading text-xl font-semibold lg:text-2xl">
            {moment.title}
          </p>
          <p className="text-sm text-white/90">{moment.subtitle}</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close enlarged image"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-2xl leading-none text-[#4F545A] shadow-sm backdrop-blur transition-transform hover:scale-105"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
