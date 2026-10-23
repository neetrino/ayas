import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { homeAssets } from "@/features/home/ui/home-assets";
import { HomeCarousel } from "@/features/home/ui/HomeCarousel";

export type HomeCoachCard = {
  id: string;
  name: string;
  imageSrc: string;
};

export function toHomeCoachCards(
  teachers: readonly { id: string; name: string; imageSrc: string | null }[],
): HomeCoachCard[] {
  return teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    imageSrc: teacher.imageSrc ?? homeAssets.coach,
  }));
}

type HomeCoachesSectionProps = {
  title: string;
  moreLabel: string;
  moreHref: string;
  previousLabel: string;
  nextLabel: string;
  coaches: readonly HomeCoachCard[];
};

export function HomeCoachesSection({
  title,
  moreLabel,
  moreHref,
  previousLabel,
  nextLabel,
  coaches,
}: HomeCoachesSectionProps) {
  if (coaches.length === 0) {
    return null;
  }

  return (
    <div id="teachers">
      <HomeCarousel
        title={title}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
      >
        {coaches.map((coach) => (
          <article
            key={coach.id}
            className="relative grid h-[331px] w-[min(86vw,417px)] shrink-0 snap-start grid-cols-[247px_1fr] overflow-hidden rounded-[20px] bg-black text-white"
          >
            <Image
              src={coach.imageSrc}
              alt=""
              width={247}
              height={308}
              className="m-3 h-[308px] w-[247px] rounded-[20px] object-cover"
            />
            <div className="flex flex-col justify-end gap-3 px-4 pb-8">
              <p className="text-lg font-semibold tracking-[0.02em]">{coach.name}</p>
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
