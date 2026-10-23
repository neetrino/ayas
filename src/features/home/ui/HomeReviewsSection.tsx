import Image from "next/image";

import { HomeCarousel } from "@/features/home/ui/HomeCarousel";
import { HomePillLink } from "@/features/home/ui/HomePillLink";
import { homeAssets } from "@/features/home/ui/home-assets";

const REVIEW_COUNT = 4;

type HomeReviewsSectionProps = {
  title: string;
  quote: string;
  name: string;
  role: string;
  moreLabel: string;
  moreHref: string;
  previousLabel: string;
  nextLabel: string;
};

export function HomeReviewsSection({
  title,
  quote,
  name,
  role,
  moreLabel,
  moreHref,
  previousLabel,
  nextLabel,
}: HomeReviewsSectionProps) {
  return (
    <section className="relative overflow-hidden text-white">
      <Image
        src={homeAssets.reviews}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="relative">
        <div className="mx-auto flex max-w-[1440px] justify-center px-4 pt-16">
          <HomePillLink href={moreHref} label={moreLabel} tone="light" />
        </div>
        <HomeCarousel
          title={title}
          titleClassName="text-white"
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          tone="dark"
        >
          {Array.from({ length: REVIEW_COUNT }, (_, index) => (
            <article
              key={index}
              className="flex h-[269px] w-[min(86vw,371px)] shrink-0 snap-start flex-col justify-center gap-4 rounded-[30px] bg-white p-8 text-[#464646] shadow-[0_4px_5px_rgba(82,82,82,0.1)]"
            >
              <Image src={homeAssets.quote} alt="" width={60} height={39} />
              <p className="text-base leading-[1.36]">“{quote}”</p>
              <div className="flex items-center gap-4">
                <Image
                  src={homeAssets.avatar}
                  alt=""
                  width={60}
                  height={60}
                  className="size-[60px] rounded-full object-cover"
                />
                <div>
                  <p className="text-xl font-semibold">{name}</p>
                  <p className="text-base text-[#d7d7d7]">{role}</p>
                </div>
              </div>
            </article>
          ))}
        </HomeCarousel>
      </div>
    </section>
  );
}
