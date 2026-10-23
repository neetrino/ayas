import Image from "next/image";

import { HomePillLink } from "@/features/home/ui/HomePillLink";
import { homeAssets } from "@/features/home/ui/home-assets";

type HomeAboutSectionProps = {
  title: string;
  first: string;
  second: string;
  coursesLabel: string;
  coursesHref: string;
};

export function HomeAboutSection({
  title,
  first,
  second,
  coursesLabel,
  coursesHref,
}: HomeAboutSectionProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[minmax(0,588px)_1fr] lg:px-[84px] lg:py-24">
        <div className="flex flex-col gap-8">
          <h2 className="home-display text-[clamp(3rem,7vw,6.4375rem)] text-[#030303]">
            {title}
          </h2>
          <div className="flex max-w-[520px] flex-col gap-6 text-lg leading-6">
            <p>{first}</p>
            <p>{second}</p>
          </div>
        </div>
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          <Image
            src={homeAssets.about}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
          <div className="absolute bottom-6 right-0">
            <HomePillLink href={coursesHref} label={coursesLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
