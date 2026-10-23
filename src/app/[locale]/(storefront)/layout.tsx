import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { MobileBottomNavIsland } from "@/components/layout/MobileBottomNavIsland";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MaintenanceGate } from "@/components/layout/MaintenanceGate";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  CURRENCY_COOKIE_NAME,
  parseCurrencyCookie,
} from "@/lib/money/currency-cookie";

type StorefrontLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const cookieStore = await cookies();
  const currency = parseCurrencyCookie(
    cookieStore.get(CURRENCY_COOKIE_NAME)?.value,
  );

  return (
    <StorefrontChrome
      locale={locale}
      header={
        <SiteHeader
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
      }
      footer={<SiteFooter dictionary={dictionary} locale={locale} />}
      mobileNav={
        <MobileBottomNavIsland
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
      }
    >
      <MaintenanceGate>{children}</MaintenanceGate>
    </StorefrontChrome>
  );
}
