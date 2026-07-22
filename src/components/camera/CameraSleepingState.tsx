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
            : "relative z-[1] w-full bg-gradient-to-t from-[#1A2433]/85 via-[#1A2433]/45 to-transparent px-6 pb-7 pt-16 text-center"
        }
      >
        <p
          className={
            compact
              ? "font-heading text-base font-medium text-[#4F545A]"
              : "font-heading text-lg font-medium text-white lg:text-xl"
          }
        >
          The birds and camera are sleeping.
        </p>
        <p
          className={
            compact
              ? "mt-1 text-xs leading-relaxed text-[#8A8F94]"
              : "mt-1.5 text-sm leading-relaxed text-white/85"
          }
        >
          Check back tomorrow starting 5:00 AM PST.
        </p>
      </div>
    </div>
  );
}
