import Image from "next/image";

export function CameraSleepingState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center gap-3 px-4 py-6 text-center"
          : "relative flex h-full min-h-full w-full flex-col items-center justify-end overflow-hidden"
      }
    >
      {compact ? (
        <span className="relative h-36 w-28 overflow-hidden rounded-2xl">
          <Image
            src="/artwork/empty-states/camera-sleeping.png"
            alt="A bluebird sleeping in a blossomed nest under the moon"
            fill
            className="object-cover object-[50%_78%]"
            sizes="112px"
            priority
          />
        </span>
      ) : (
        <Image
          src="/artwork/empty-states/camera-sleeping.png"
          alt="A bluebird sleeping in a blossomed nest under the moon"
          fill
          className="object-cover object-[50%_82%] lg:object-[50%_78%]"
          sizes="(min-width: 1024px) 70vw, 100vw"
          priority
        />
      )}

      <div
        className={
          compact
            ? "max-w-[240px]"
            : "absolute inset-x-0 bottom-0 z-[1] w-full bg-gradient-to-t from-[#1A2433]/90 via-[#1A2433]/50 to-transparent px-5 pb-4 pt-10 text-center lg:pb-5"
        }
      >
        <p
          className={
            compact
              ? "font-heading text-sm font-medium text-[#4F545A]"
              : "font-heading text-sm font-medium text-white lg:text-[0.95rem]"
          }
        >
          The birds and camera are sleeping.
        </p>
        <p
          className={
            compact
              ? "mt-1 text-xs leading-relaxed text-[#8A8F94]"
              : "mt-1 text-[11px] leading-relaxed text-white/85 lg:text-xs"
          }
        >
          Check back tomorrow starting 5:00 AM PST.
        </p>
      </div>
    </div>
  );
}
