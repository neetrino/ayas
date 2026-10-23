import Image from "next/image";

import { HomePillLink } from "@/features/home/ui/HomePillLink";
import { homeAssets } from "@/features/home/ui/home-assets";

type HomeCtaSectionProps = {
  title: string;
  body: string;
  registerLabel: string;
  registerHref: string;
};

export function HomeCtaSection({
  title,
  body,
  registerLabel,
  registerHref,
}: HomeCtaSectionProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_548px] lg:px-10 lg:py-20">
        <div className="relative min-h-[360px] lg:min-h-[552px]">
          <Image
            src={homeAssets.cta}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-left"
          />
        </div>
        <div className="flex flex-col items-end gap-6 text-right text-[#792a57]">
          <h2 className="home-display text-[clamp(3.2rem,7vw,7.7rem)]">{title}</h2>
          <p className="max-w-[420px] text-lg font-medium leading-6">{body}</p>
          <HomePillLink href={registerHref} label={registerLabel} />
        </div>
      </div>
    </section>
  );
}
