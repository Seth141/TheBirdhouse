"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Moment } from "@/lib/query/mockData";
import { getBirdNote } from "@/lib/species/blurbs";

const ease = [0.22, 1, 0.36, 1] as const;

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
  const note = getBirdNote(moment.title);

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="moment-lightbox"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[#1A2433]/58 backdrop-blur-[10px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={moment.title}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease }}
            className="relative z-10 flex max-h-[min(88vh,44rem)] w-[min(92vw,26rem)] flex-col overflow-hidden rounded-[28px] shadow-[0_28px_80px_rgba(26,36,51,0.38)] sm:w-[min(92vw,30rem)]"
          >
            {/* Photo frame */}
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#6B8570] via-[#5A7360] to-[#4A5F50]">
              <Image
                src={moment.imageSrc}
                alt={moment.title}
                fill
                sizes="(min-width: 640px) 30rem, 92vw"
                priority
                className="object-contain object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(74,95,80,0.45)_100%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#3F5244]/50 to-transparent"
              />

              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close enlarged image"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-2xl leading-none text-[#4F545A] shadow-[0_8px_24px_rgba(30,24,18,0.18)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* Learn panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45, ease }}
              className="relative overflow-hidden bg-[#F7F4EE] px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#D6E1D5]/55 blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-[#C5D4DF]/40 blur-2xl"
              />

              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8FA896] sm:text-[11px]">
                  Learn about your birds
                </p>

                <h2 className="font-heading mt-1.5 text-2xl font-medium leading-tight text-[#4F545A] sm:text-[1.7rem]">
                  {moment.title}
                </h2>

                {note.scientificName && (
                  <p className="mt-0.5 text-sm italic text-[#8A8F94]">
                    {note.scientificName}
                  </p>
                )}

                <p className="mt-1 text-xs text-[#8A8F94]">{moment.subtitle}</p>

                <div
                  aria-hidden
                  className="mt-3.5 h-px w-12 bg-gradient-to-r from-[#8FA896]/70 to-transparent"
                />

                <p className="mt-3.5 text-sm leading-relaxed text-[#5C6166] sm:text-[0.95rem] sm:leading-relaxed">
                  {note.blurb}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
