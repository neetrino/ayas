import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { HomePillLink } from "@/features/home/ui/HomePillLink";
import { homeAssets } from "@/features/home/ui/home-assets";

const FAN_ROTATIONS = [-58, -40, -20, 0, 20, 40, 58] as const;

type HomeEventsSectionProps = {
  title: string;
  date: string;
  moreLabel: string;
  moreHref: string;
  eventHref: string;
};

export function HomeEventsSection({
  title,
  date,
  moreLabel,
  moreHref,
  eventHref,
}: HomeEventsSectionProps) {
  return (
    <section id="events" className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="relative mx-auto h-[460px] max-w-[1440px] sm:h-[620px]">
        {FAN_ROTATIONS.map((rotation) => (
          <div
            key={rotation}
            className="absolute left-1/2 top-8 h-[280px] w-[180px] -translate-x-1/2 sm:h-[340px] sm:w-[213px]"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: "center 140%",
              zIndex: 20 - Math.abs(rotation),
            }}
          >
            <Image
              src={homeAssets.event}
              alt=""
              fill
              sizes="213px"
              className={
                rotation === 0
                  ? "rounded-[20px] border border-[#ff5bd6] object-cover shadow-[0_0_34px_rgba(173,0,95,0.61)]"
                  : "rounded-[10px] object-cover"
              }
            />
          </div>
        ))}
      </div>
      <div className="relative z-10 -mt-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-[30px] font-medium leading-9">
            <AppLink
              href={eventHref}
              prefetchPolicy="intent"
              className="underline-offset-4 hover:underline"
            >
              {title}
            </AppLink>
          </h2>
          <p className="text-base text-[#9f0258]">{date}</p>
        </div>
        <HomePillLink href={moreHref} label={moreLabel} />
      </div>
    </section>
  );
}
