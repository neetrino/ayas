import Image from "next/image";

import { HomeCarousel } from "@/features/home/ui/HomeCarousel";
import { homeAssets } from "@/features/home/ui/home-assets";

const NEWS_COUNT = 3;

type HomeNewsSectionProps = {
  title: string;
  eyebrow: string;
  quote: string;
  author: string;
  handle: string;
  previousLabel: string;
  nextLabel: string;
};

export function HomeNewsSection({
  title,
  eyebrow,
  quote,
  author,
  handle,
  previousLabel,
  nextLabel,
}: HomeNewsSectionProps) {
  return (
    <HomeCarousel title={title} previousLabel={previousLabel} nextLabel={nextLabel}>
      {Array.from({ length: NEWS_COUNT }, (_, index) => (
        <article
          key={index}
          className="flex h-[299px] w-[min(90vw,526px)] shrink-0 snap-start items-center gap-4 rounded-[28px] bg-[#792a57] py-4 pl-4 pr-6 text-white"
        >
          <Image
            src={homeAssets.gallery[4] ?? homeAssets.coach}
            alt=""
            width={240}
            height={263}
            className="h-[263px] w-[180px] shrink-0 rounded-[18px] object-cover sm:w-[240px]"
          />
          <div className="flex h-full flex-col justify-between py-3">
            <div>
              <p className="text-[13px] font-medium tracking-[-0.02em]">{eyebrow}</p>
              <p className="mt-4 text-base font-bold leading-5 tracking-[-0.03em]">
                “{quote}”
              </p>
            </div>
            <div>
              <p className="text-[13px] font-bold">{author}</p>
              <p className="text-xs">{handle}</p>
            </div>
          </div>
        </article>
      ))}
    </HomeCarousel>
  );
}
