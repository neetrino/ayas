import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { HomeHeader } from "@/features/home/ui/HomeHeader";
import { landingNavItems } from "@/features/home/ui/landing-nav";
import { HomePillLink } from "@/features/home/ui/HomePillLink";
import { homeAssets } from "@/features/home/ui/home-assets";
import type { Locale } from "@/lib/i18n/config";

type HomeHeroCopy = {
  dance: string;
  feel: string;
  shine: string;
  lead: string;
  more: string;
  register: string;
  statValue: string;
  statLabel: string;
};

type HomeHeroSectionProps = {
  locale: Locale;
  languageLabel: string;
  navLabel: string;
  cartLabel: string;
  openMenuLabel: string;
  contactLabel: string;
  nav: {
    about: string;
    courses: string;
    teachers: string;
    events: string;
    blog: string;
    shop: string;
  };
  copy: HomeHeroCopy;
};

export function HomeHeroSection({
  locale,
  languageLabel,
  navLabel,
  cartLabel,
  openMenuLabel,
  contactLabel,
  nav,
  copy,
}: HomeHeroSectionProps) {
  const stats = [copy.statLabel, copy.statLabel, copy.statLabel];

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-black text-white lg:min-h-[1080px]">
      <Image
        src={homeAssets.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <HomeHeader
        locale={locale}
        languageLabel={languageLabel}
        navLabel={navLabel}
        cartHref={`/${locale}/cart`}
        cartLabel={cartLabel}
        contactHref={`/${locale}/contact`}
        contactLabel={contactLabel}
        openMenuLabel={openMenuLabel}
        items={landingNavItems(locale, nav)}
      />
      <div className="relative z-10 ml-auto flex min-h-[760px] w-full flex-col justify-center bg-gradient-to-br from-white/10 to-black/40 px-6 py-28 sm:px-12 lg:min-h-[1080px] lg:w-[659px] lg:rounded-l-[50px] lg:px-16">
        <h1 className="home-display max-w-[12ch] text-[clamp(4.5rem,8vw,10.2rem)] text-white">
          {copy.dance}{" "}
          <span className="text-[0.7em] font-extralight tracking-[-0.03em]">
            {copy.feel}
          </span>
          <span className="mt-2 block">{copy.shine}</span>
        </h1>
        <p className="mt-8 max-w-sm text-base leading-relaxed text-white">
          {copy.lead}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <HomePillLink href={`/${locale}/about`} label={copy.more} tone="light" />
          <AppLink
            href={`/${locale}/contact`}
            prefetchPolicy="intent"
            className="inline-flex h-14 items-center rounded-full bg-white/10 px-6 text-lg font-medium text-white"
          >
            {copy.register}
          </AppLink>
        </div>
        <dl className="mt-16 flex gap-10">
          {stats.map((label, index) => (
            <div key={`${label}-${index}`}>
              <dt className="text-[40px] leading-9">{copy.statValue}</dt>
              <dd className="mt-2 text-sm font-semibold">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
