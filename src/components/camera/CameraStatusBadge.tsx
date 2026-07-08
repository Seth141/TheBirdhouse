import { cn } from "@/lib/utils/cn";
import type { CameraConnectionStatus } from "@/lib/camera/types";

const copy: Record<CameraConnectionStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  live: "Live",
  offline: "Offline",
  error: "Unavailable",
};

export function CameraStatusBadge({
  status,
  className,
}: {
  status: CameraConnectionStatus;
  className?: string;
}) {
  const isLive = status === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md",
        isLive
          ? "bg-[#D6E1D5]/80 text-[#4F545A]"
          : "bg-white/60 text-[#8A8F94]",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isLive ? "bg-[#7C9473] animate-pulse" : "bg-[#B9AEA4]"
        )}
      />
      {copy[status]}
    </span>
  );
}
