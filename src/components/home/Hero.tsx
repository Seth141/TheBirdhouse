import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";

/**
 * Full-bleed hero banner: the birdhouse photo covers the entire band and
 * the greeting sits directly on top of it, with a soft scrim on the left
 * so the serif type stays legible against the photo.
 */
export function Hero() {
  return (
    <FadeIn delay={0.05} className="relative -mx-5">
      <div className="relative h-[340px] w-full overflow-hidden rounded-b-[32px]">
        <Image
          src="/artwork/birdhouses/hero-main.png"
          alt="A watercolor-style birdhouse tucked among cherry blossoms and leaves, with a small bird perched nearby"
          fill
          sizes="100vw"
          className="object-cover object-[62%_85%]"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8]/55 from-0% via-[#FCFBF8]/18 via-[38%] to-transparent to-[72%]" />

        <div className="relative z-10 flex h-full flex-col justify-center px-5 pb-6 text-black">
          <p className="font-body text-sm"> </p>
          <h1 className="font-heading mt-1 text-[2.35rem] leading-[1.05] font-medium">
            Welcome
            <br />
            Home
          </h1>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed">
            The birds missed you.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
