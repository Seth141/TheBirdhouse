"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraSource } from "@/lib/camera/useCameraSource";
import type { CameraSourceConfig } from "@/lib/camera/types";
import { LoadingFeather } from "@/components/motion/LoadingFeather";
import { CameraOfflineState } from "@/components/camera/CameraOfflineState";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { cn } from "@/lib/utils/cn";

interface CameraPlayerProps {
  config: CameraSourceConfig;
  variant?: "card" | "full";
  className?: string;
}

/**
 * The single surface responsible for rendering a live camera feed. It is
 * fully decoupled from where the stream actually comes from — swap the
 * `config.protocol` and this component keeps working unchanged.
 */
export function CameraPlayer({ config, variant = "card", className }: CameraPlayerProps) {
  const { status, videoRef } = useCameraSource(config);
  const isMock = config.protocol === "mock";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] bg-[#DCE6EC]",
        variant === "card"
          ? "aspect-[4/3]"
          : "aspect-[3/4] lg:aspect-video",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {(status === "idle" || status === "connecting") && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#EEF6FB]"
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
            className="absolute inset-0 flex items-center justify-center bg-[#F8F6F2]"
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
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/artwork/nests/nest-eggs.png"
                alt="Live watercolor-style view of the nest inside the birdhouse"
                fill
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </motion.div>
        )}

        {status === "live" && !isMock && (
          <motion.video
            key="live-video"
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute left-3 top-3 right-3 flex items-center justify-between">
        <CameraStatusBadge status={status} />
      </div>
    </div>
  );
}
