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
        className="relative aspect-[3/4] h-auto max-h-[75vh] w-[min(75vw,28rem)] overflow-hidden rounded-[28px] bg-[#3F5244] shadow-2xl"
      >
        <Image
          src={moment.imageSrc}
          alt={moment.title}
          fill
          sizes="(min-width: 1024px) 28rem, 75vw"
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-[#4F6655] px-5 py-4 text-white">
          <p className="font-heading text-xl font-semibold lg:text-2xl">
            {moment.title}
          </p>
          <p className="text-sm text-white">{moment.subtitle}</p>
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
