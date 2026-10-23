import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type LandingNav = Dictionary["home"]["landing"]["nav"];
type HeaderNav = Pick<
  LandingNav,
  "about" | "courses" | "teachers" | "events" | "blog" | "shop"
>;
type FooterNav = HeaderNav & Pick<LandingNav, "gallery">;

export type LandingNavKey = "about" | "courses" | "teachers" | "events" | "blog" | "shop";

type LandingNavItem = {
  href: string;
  label: string;
  current: boolean;
};

/** Header links for the school landing pages. Shop stays on the product catalog. */
export function landingNavItems(
  locale: Locale,
  nav: HeaderNav,
  current?: LandingNavKey,
): LandingNavItem[] {
  return [
    { key: "about", href: `/${locale}/about`, label: nav.about },
    { key: "courses", href: `/${locale}/classes`, label: nav.courses },
    { key: "teachers", href: `/${locale}/teachers`, label: nav.teachers },
    { key: "events", href: `/${locale}/events`, label: nav.events },
    { key: "blog", href: `/${locale}/blog`, label: nav.blog },
    { key: "shop", href: `/${locale}/products`, label: nav.shop },
  ].map((item) => ({
    href: item.href,
    label: item.label,
    current: item.key === current,
  }));
}

export function landingFooterLinks(locale: Locale, nav: FooterNav) {
  return [
    { href: `/${locale}/about`, label: nav.about },
    { href: `/${locale}/classes`, label: nav.courses },
    { href: `/${locale}/teachers`, label: nav.teachers },
    { href: `/${locale}/gallery`, label: nav.gallery },
    { href: `/${locale}/blog`, label: nav.blog },
    { href: `/${locale}/products`, label: nav.shop },
    { href: `/${locale}/events`, label: nav.events },
  ];
}
