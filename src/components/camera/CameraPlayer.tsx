"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type MutableRefObject,
} from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "framer-motion";
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

const ease = [0.22, 1, 0.36, 1] as const;

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
  const frameControls = useAnimationControls();
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

  const closeExpanded = useCallback(async () => {
    await frameControls.start({
      scale: 0.97,
      opacity: 0.9,
      transition: { duration: 0.18, ease },
    });
    setExpanded(false);
    void frameControls.set({ scale: 1, opacity: 1 });
  }, [frameControls]);

  const openExpanded = useCallback(() => {
    setExpanded(true);
    void frameControls.start({
      scale: [0.96, 1],
      opacity: [0.9, 1],
      transition: { duration: 0.42, ease },
    });
  }, [frameControls]);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void closeExpanded();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded, closeExpanded]);

  // If the stream drops while enlarged, fold back into the page layout.
  useEffect(() => {
    if (status !== "live" && expanded) {
      setExpanded(false);
      void frameControls.set({ scale: 1, opacity: 1 });
    }
  }, [status, expanded, frameControls]);

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

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="live-expand-backdrop"
            className="fixed inset-0 z-[100] bg-[#1A2433]/75 backdrop-blur-[14px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            onMouseDown={() => void closeExpanded()}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "wood-frame",
          expanded && "wood-frame-expanded",
          !expanded && className
        )}
        animate={frameControls}
        initial={false}
        style={
          expanded
            ? {
                // Inline position beats `.wood-frame { position: relative }` so the
                // expanded frame actually fills the viewport instead of collapsing.
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 101,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                maxWidth: "none",
                maxHeight: "none",
                margin: 0,
                borderRadius: 0,
                boxShadow: "none",
                // Safe area only — keep the wood thin so the feed is huge.
                paddingTop: "max(8px, env(safe-area-inset-top))",
                paddingRight: "max(8px, env(safe-area-inset-right))",
                paddingBottom: "max(8px, env(safe-area-inset-bottom))",
                paddingLeft: "max(8px, env(safe-area-inset-left))",
              }
            : undefined
        }
      >
        <div
          className={cn(
            "wood-frame-inner relative",
            !expanded && "bg-[#DCE6EC]",
            expanded ? "min-h-0 w-full flex-1 bg-[#0a0f14]" : frameAspect,
            canExpand && !expanded && "cursor-zoom-in"
          )}
          style={
            expanded
              ? {
                  // Explicit fill — flex-1 alone can still collapse when the
                  // parent briefly has no definite height during the transition.
                  height: "100%",
                  minHeight: "100%",
                  boxShadow: "none",
                }
              : undefined
          }
          role={canExpand && !expanded ? "button" : undefined}
          tabIndex={canExpand && !expanded ? 0 : undefined}
          aria-label={
            canExpand && !expanded ? "Enlarge live camera view" : undefined
          }
          aria-expanded={expanded}
          onClick={() => {
            if (canExpand && !expanded) openExpanded();
          }}
          onKeyDown={(event) => {
            if (!canExpand || expanded) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openExpanded();
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
            <div className="pointer-events-none absolute left-3 top-3 right-3 z-20 flex items-center justify-between sm:left-4 sm:top-4">
              <CameraStatusBadge status={status} />
            </div>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.button
                key="close-expanded"
                type="button"
                aria-label="Close enlarged live view"
                initial={{ opacity: 0, scale: 0.85, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.14, duration: 0.3, ease }}
                onClick={(event) => {
                  event.stopPropagation();
                  void closeExpanded();
                }}
                className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-[#4F545A] shadow-[0_10px_28px_rgba(30,24,18,0.28)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95 sm:right-4 sm:top-4"
              >
                <span aria-hidden="true">×</span>
              </motion.button>
            )}
          </AnimatePresence>

          {canExpand && !expanded && (
            <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/95 backdrop-blur-sm">
              Tap to enlarge
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
}
