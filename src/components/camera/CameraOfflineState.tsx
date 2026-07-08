import Image from "next/image";

export function CameraOfflineState({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
      <span className={compact ? "relative h-24 w-24" : "relative h-36 w-36"}>
        <Image
          src="/artwork/empty-states/camera-offline.png"
          alt=""
          fill
          className="object-contain"
        />
      </span>
      <p className="font-heading text-base font-medium text-[#4F545A]">
        The camera is resting
      </p>
      <p className="max-w-[220px] text-xs leading-relaxed text-[#8A8F94]">
        We&apos;ll bring the view back gently once the birdhouse camera
        reconnects.
      </p>
    </div>
  );
}
