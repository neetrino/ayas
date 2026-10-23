"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";

type StorefrontChromeProps = {
  locale: Locale;
  header: ReactNode;
  footer: ReactNode;
  mobileNav: ReactNode;
  children: ReactNode;
};

const landingMainClassName = "w-full flex-1 bg-white";
const shopMainClassName =
  "storefront-main mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-24 sm:px-6 md:pb-10 lg:px-8";

export function StorefrontChrome({
  locale,
  header,
  footer,
  mobileNav,
  children,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const landing = isStorefrontLanding(pathname, locale);

  return (
    <div className="storefront-shell flex min-h-dvh flex-1 flex-col bg-gray-50">
      {landing ? null : header}
      <main className={landing ? landingMainClassName : shopMainClassName}>
        {children}
      </main>
      {landing ? null : footer}
      {landing ? null : mobileNav}
    </div>
  );
}

function isStorefrontLanding(pathname: string, locale: Locale): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return (
    normalized === `/${locale}` ||
    normalized === `/${locale}/about` ||
    normalized === `/${locale}/classes` ||
    normalized === `/${locale}/teachers` ||
    normalized === `/${locale}/gallery` ||
    normalized === `/${locale}/events` ||
    normalized.startsWith(`/${locale}/events/`) ||
    normalized === `/${locale}/blog` ||
    normalized.startsWith(`/${locale}/blog/`) ||
    normalized === `/${locale}/contact`
  );
}
