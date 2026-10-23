import { HomeHeader } from "@/features/home/ui/HomeHeader";
import {
  landingNavItems,
  type LandingNavKey,
} from "@/features/home/ui/landing-nav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type LandingNav = Dictionary["home"]["landing"]["nav"];

type SchoolPageHeroProps = {
  locale: Locale;
  languageLabel: string;
  navLabel: string;
  cartLabel: string;
  openMenuLabel: string;
  contactLabel: string;
  nav: LandingNav;
  current?: LandingNavKey;
  title: string;
  lead: string;
  /** Wider measure for titles that are longer than a short display word. */
  titleMeasure?: "compact" | "wide";
};

export function SchoolPageHero({
  locale,
  languageLabel,
  navLabel,
  cartLabel,
  openMenuLabel,
  contactLabel,
  nav,
  current,
  title,
  lead,
  titleMeasure = "compact",
}: SchoolPageHeroProps) {
  const titleClassName =
    titleMeasure === "wide"
      ? "text-[clamp(2.25rem,6vw,5.5rem)] [overflow-wrap:normal] sm:max-w-[20ch]"
      : "text-[clamp(2.25rem,8vw,7.5rem)] sm:max-w-[12ch]";
  return (
    <section className="bg-white">
      <div className="relative h-28 bg-black">
        <HomeHeader
          locale={locale}
          languageLabel={languageLabel}
          navLabel={navLabel}
          cartHref={`/${locale}/cart`}
          cartLabel={cartLabel}
          contactHref={`/${locale}/contact`}
          contactLabel={contactLabel}
          openMenuLabel={openMenuLabel}
          items={landingNavItems(locale, nav, current)}
        />
      </div>
      <div className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-8 lg:px-[84px] lg:pt-16">
        <h1 className={`home-display max-w-full break-words text-[#030303] ${titleClassName}`}>
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-7">{lead}</p>
      </div>
    </section>
  );
}
