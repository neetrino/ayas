"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";

import { homeAssets } from "@/features/home/ui/home-assets";

type HomeCarouselProps = {
  title: string;
  titleClassName?: string;
  previousLabel: string;
  nextLabel: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

export function HomeCarousel({
  title,
  titleClassName = "text-[#030303]",
  previousLabel,
  nextLabel,
  tone = "light",
  children,
}: HomeCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const previousIcon =
    tone === "dark" ? homeAssets.navPreviousDark : homeAssets.navPreviousLight;
  const nextIcon =
    tone === "dark" ? homeAssets.navNextDark : homeAssets.navNextLight;

  function scrollByPage(direction: -1 | 1): void {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.8, 280),
      behavior: "smooth",
    });
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8 lg:px-[62px] lg:py-24">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2 className={`home-display max-w-[16ch] text-[clamp(2.75rem,7vw,6.4375rem)] ${titleClassName}`}>
          {title}
        </h2>
        <div className="flex shrink-0 gap-1">
          <button type="button" aria-label={previousLabel} onClick={() => scrollByPage(-1)}>
            <Image src={previousIcon} alt="" width={64} height={64} />
          </button>
          <button type="button" aria-label={nextLabel} onClick={() => scrollByPage(1)}>
            <Image src={nextIcon} alt="" width={64} height={64} className="rotate-180" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
