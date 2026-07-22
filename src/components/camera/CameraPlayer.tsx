"use client";

import Image from "next/image";
import { useEffect, useState, type MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraSource } from "@/lib/camera/useCameraSource";
import type {
  CameraConnectionStatus,
  CameraSnapshot,
  CameraSourceConfig,
} from "@/lib/camera/types";
import { LoadingFeather } from "@/components/motion/LoadingFeather";
import { CameraOfflineState } from "@/components/camera/CameraOfflineState";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { cn } from "@/lib/utils/cn";

interface CameraPlayerProps {
  config: CameraSourceConfig;
  variant?: "card" | "full";
  className?: string;
  showBadge?: boolean;
  /** Allow tapping the live feed to enlarge it (full variant). */
  expandable?: boolean;
  onStatusChange?: (status: CameraConnectionStatus) => void;
  /** Optional ref filled with the active captureSnapshot function. */
  captureRef?: MutableRefObject<(() => Promise<CameraSnapshot>) | null>;
}

/**
 * The single surface responsible for rendering a live camera feed. It is
 * fully decoupled from where the stream actually comes from — swap the
 * `config.protocol` and this component keeps working unchanged.
 *
 * Video/img elements stay mounted (hidden until live) so attach can bind
 * before status flips to "live". Expand uses the same mounted media node.
 */
export function CameraPlayer({
  config,
  variant = "card",
  className,
  showBadge = true,
  expandable = variant === "full",
  onStatusChange,
  captureRef,
}: CameraPlayerProps) {
  const { status, mediaRef, captureSnapshot } = useCameraSource(config);
  const isMock = config.protocol === "mock";
  const isMjpeg = config.protocol === "mjpeg";
  const [expanded, setExpanded] = useState(false);
  const canExpand = expandable && status === "live";

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (!captureRef) return;
    captureRef.current = captureSnapshot;
    return () => {
      captureRef.current = null;
    };
  }, [captureRef, captureSnapshot]);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  // If the stream drops while enlarged, fold back into the page layout.
  useEffect(() => {
    if (status !== "live" && expanded) setExpanded(false);
  }, [status, expanded]);

  const frameAspect =
    variant === "card"
      ? "aspect-[4/3]"
      : "aspect-[3/4] lg:aspect-video";

  return (
    <>
      {/* Keeps page layout stable while the real frame is fixed + enlarged. */}
      {expanded && (
        <div
          className={cn("wood-frame pointer-events-none invisible", className)}
          aria-hidden
        >
          <div className={cn("wood-frame-inner", frameAspect)} />
        </div>
      )}

      <div
        className={cn(
          expanded
            ? "fixed inset-0 z-[100] flex items-center justify-center bg-[#28313A]/60 p-3 backdrop-blur-sm lg:p-6"
            : cn("wood-frame", className)
        )}
        onMouseDown={
          expanded
            ? (event) => {
                if (event.target === event.currentTarget) setExpanded(false);
              }
            : undefined
        }
      >
        <div
          className={cn(
            "wood-frame-inner relative bg-[#DCE6EC]",
            expanded
              ? "aspect-[3/4] h-auto max-h-[min(92vh,100%)] w-full max-w-[min(96vw,72rem)] overflow-hidden rounded-[22px] shadow-2xl lg:aspect-video"
              : frameAspect,
            canExpand && !expanded && "cursor-zoom-in"
          )}
          role={canExpand && !expanded ? "button" : undefined}
          tabIndex={canExpand && !expanded ? 0 : undefined}
          aria-label={
            canExpand && !expanded ? "Enlarge live camera view" : undefined
          }
          onClick={() => {
            if (canExpand && !expanded) setExpanded(true);
          }}
          onKeyDown={(event) => {
            if (!canExpand || expanded) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpanded(true);
            }
          }}
        >
          {/* Always-mounted media targets — hidden until live so attach can bind. */}
          {!isMock && !isMjpeg && (
            <video
              ref={mediaRef as (node: HTMLVideoElement | null) => void}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                status === "live" ? "opacity-100" : "opacity-0"
              )}
              autoPlay
              muted
              playsInline
            />
          )}

          {!isMock && isMjpeg && (
            // eslint-disable-next-line @next/next/no-img-element -- live MJPEG multipart stream
            <img
              ref={mediaRef as (node: HTMLImageElement | null) => void}
              alt="Live birdhouse camera"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                status === "live" ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          <AnimatePresence mode="wait">
            {(status === "idle" || status === "connecting") && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-[#EEF6FB]"
              >
                <LoadingFeather label="Connecting to your birdhouse…" />
              </motion.div>
            )}

            {(status === "offline" || status === "error") && (
              <motion.div
                key="offline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-[#F8F6F2]"
              >
                <CameraOfflineState compact={variant === "card"} />
              </motion.div>
            )}

            {status === "live" && isMock && (
              <motion.div
                key="live-mock"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={config.snapshotUrl ?? "/artwork/nests/nest-eggs.png"}
                    alt="Live watercolor-style view of the nest inside the birdhouse"
                    fill
                    sizes="(max-width: 480px) 100vw, 480px"
                    className="object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {showBadge && (
            <div className="pointer-events-none absolute left-3 top-3 right-3 z-20 flex items-center justify-between">
              <CameraStatusBadge status={status} />
            </div>
          )}

          {expanded && (
            <button
              type="button"
              aria-label="Close enlarged live view"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(false);
              }}
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-2xl leading-none text-[#4F545A] shadow-sm backdrop-blur transition-transform hover:scale-105"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}

          {canExpand && !expanded && (
            <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/95 backdrop-blur-sm">
              Tap to enlarge
            </span>
          )}
        </div>
      </div>
    </>
  );
}
