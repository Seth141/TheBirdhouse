import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";

/**
 * Full-bleed hero banner: the birdhouse photo covers the entire band and
 * the greeting sits directly on top of it, with a soft scrim on the left
 * so the serif type stays legible against the photo.
 */
export function Hero() {
  return (
    <FadeIn delay={0.05} className="relative -mx-5 lg:mx-0">
      <div className="relative h-[340px] w-full overflow-hidden rounded-b-[32px] lg:h-[420px] lg:rounded-[36px] xl:h-[460px]">
        <Image
          src="/artwork/birdhouses/hero-main.png"
          alt="A watercolor-style birdhouse tucked among cherry blossoms and leaves, with a small bird perched nearby"
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover object-[62%_85%] lg:object-[52%_88%]"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8]/55 from-0% via-[#FCFBF8]/18 via-[38%] to-transparent to-[72%] lg:from-[#FCFBF8]/70 lg:via-[#FCFBF8]/28 lg:via-[42%] lg:to-transparent lg:to-[78%]" />

        <div className="relative z-10 flex h-full flex-col justify-center px-5 pb-6 text-[#4F545A] lg:max-w-[58%] lg:justify-center lg:px-9 lg:pb-0 xl:px-11">
          <p className="font-heading hidden text-[1.05rem] font-medium tracking-[0.02em] text-[#4F545A]/75 lg:mb-3 lg:block lg:text-[1.15rem]">
            Sara&apos;s Birdhouse
          </p>
          <h1 className="font-heading mt-1 text-[2.35rem] leading-[1.05] font-medium text-black lg:mt-0 lg:text-[3.25rem] lg:leading-[1.02] xl:text-[3.5rem]">
            Welcome
            <br />
            Home
          </h1>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-black lg:mt-4 lg:max-w-none lg:text-[0.95rem] lg:leading-relaxed lg:text-[#4F545A]/85">
            The birds missed you.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
