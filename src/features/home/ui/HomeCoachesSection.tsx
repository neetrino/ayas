import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { HomeCarousel } from "@/features/home/ui/HomeCarousel";
import { homeAssets } from "@/features/home/ui/home-assets";

const COACH_COUNT = 3;

type HomeCoachesSectionProps = {
  title: string;
  name: string;
  moreLabel: string;
  moreHref: string;
  previousLabel: string;
  nextLabel: string;
};

export function HomeCoachesSection({
  title,
  name,
  moreLabel,
  moreHref,
  previousLabel,
  nextLabel,
}: HomeCoachesSectionProps) {
  return (
    <div id="teachers">
      <HomeCarousel
        title={title}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
      >
        {Array.from({ length: COACH_COUNT }, (_, index) => (
          <article
            key={index}
            className="relative grid h-[331px] w-[min(86vw,417px)] shrink-0 snap-start grid-cols-[247px_1fr] overflow-hidden rounded-[20px] bg-black text-white"
          >
            <Image
              src={homeAssets.coach}
              alt=""
              width={247}
              height={308}
              className="m-3 h-[308px] w-[247px] rounded-[20px] object-cover"
            />
            <div className="flex flex-col justify-end gap-3 px-4 pb-8">
              <p className="text-lg font-semibold tracking-[0.02em]">{name}</p>
              <AppLink
                href={moreHref}
                prefetchPolicy="intent"
                className="text-sm text-white/65"
              >
                {moreLabel}
              </AppLink>
            </div>
          </article>
        ))}
      </HomeCarousel>
    </div>
  );
}
