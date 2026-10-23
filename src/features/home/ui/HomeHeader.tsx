import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { homeAssets } from "@/features/home/ui/home-assets";
import type { Locale } from "@/lib/i18n/config";

type HomeNavItem = {
  href: string;
  label: string;
  current?: boolean;
};

type HomeHeaderProps = {
  locale: Locale;
  languageLabel: string;
  navLabel: string;
  cartHref: string;
  cartLabel: string;
  contactHref: string;
  contactLabel: string;
  openMenuLabel: string;
  items: readonly HomeNavItem[];
};

export function HomeHeader({
  locale,
  languageLabel,
  navLabel,
  cartHref,
  cartLabel,
  contactHref,
  contactLabel,
  openMenuLabel,
  items,
}: HomeHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <AppLink href={`/${locale}`} prefetchPolicy="intent" className="shrink-0">
            <Image
              src={homeAssets.logo}
              alt="AYAS"
              width={87}
              height={82}
              className="h-[72px] w-[76px] object-cover object-center"
              priority
            />
          </AppLink>
          <nav
            aria-label={navLabel}
            className="hidden h-16 items-center gap-8 rounded-full bg-white px-8 lg:flex"
          >
            <HomeNavLinks items={items} />
          </nav>
        </div>
        <div className="flex items-center gap-4 text-white">
          <AppLink href={cartHref} prefetchPolicy="intent" aria-label={cartLabel}>
            <Image src={homeAssets.cart} alt="" width={26} height={26} />
          </AppLink>
          <LocaleSwitcher
            locale={locale}
            label={languageLabel}
            compact
            dropdownClassName="inline-flex h-11 items-center gap-1 border-0 bg-transparent px-1 text-white shadow-none"
            triggerClassName="inline-flex items-center gap-1 text-base font-semibold text-white [&_svg]:text-white"
          />
          <AppLink
            href={contactHref}
            prefetchPolicy="intent"
            className="hidden h-[60px] items-center rounded-full bg-white px-6 text-base font-semibold tracking-[0.02em] text-black lg:inline-flex"
          >
            {contactLabel}
          </AppLink>
          <details className="relative lg:hidden">
            <summary
              aria-label={openMenuLabel}
              className="grid size-11 list-none place-items-center rounded-full bg-white text-black"
            >
              <span className="sr-only">{openMenuLabel}</span>
              <span aria-hidden="true" className="flex w-4 flex-col gap-1">
                <span className="h-0.5 w-full bg-black" />
                <span className="h-0.5 w-full bg-black" />
                <span className="h-0.5 w-full bg-black" />
              </span>
            </summary>
            <nav className="absolute right-0 mt-3 flex w-56 flex-col gap-3 rounded-3xl bg-white p-5 text-black shadow-lg">
              <HomeNavLinks items={items} stacked />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function HomeNavLinks({
  items,
  stacked = false,
}: {
  items: readonly HomeNavItem[];
  stacked?: boolean;
}) {
  return (
    <>
      {items.map((item) => (
        <AppLink
          key={`${item.label}-${item.href}`}
          href={item.href}
          prefetchPolicy="intent"
          className={
            stacked
              ? "text-sm font-medium text-black/80"
              : item.current
                ? "text-sm font-semibold tracking-[0.02em] text-black"
                : "text-sm tracking-[0.02em] text-black/60"
          }
        >
          {item.label}
        </AppLink>
      ))}
    </>
  );
}
