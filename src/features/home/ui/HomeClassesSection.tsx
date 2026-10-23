import Image from "next/image";

import { homeAssets } from "@/features/home/ui/home-assets";

const CLASS_COUNT = 3;

type HomeClassesSectionProps = {
  name: string;
};

export function HomeClassesSection({ name }: HomeClassesSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#d3a3c4_0%,#e9d1e1_50%,#ffffff_100%)] py-16 shadow-[0_-12px_17px_rgba(159,2,88,0.27)] lg:py-24">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 select-none text-center text-[clamp(4rem,12vw,6.875rem)] font-bold leading-none tracking-[-0.02em] text-[rgba(203,165,208,0.45)]"
      >
        DANCE DANCE DANCE DANCE
      </p>
      <div className="relative mx-auto flex max-w-[1440px] snap-x gap-8 overflow-x-auto px-4 pt-28 sm:px-8 lg:justify-center lg:px-[62px] [scrollbar-width:none]">
        {Array.from({ length: CLASS_COUNT }, (_, index) => (
          <article
            key={index}
            className="relative h-[470px] w-[min(86vw,510px)] shrink-0 snap-start overflow-hidden rounded-[30px] bg-black"
          >
            <p className="absolute inset-x-0 top-8 z-10 text-center text-2xl text-[#f0ece4]">
              {name}
            </p>
            <Image
              src={homeAssets.classCard}
              alt=""
              fill
              sizes="510px"
              className="object-cover object-top pt-14"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
