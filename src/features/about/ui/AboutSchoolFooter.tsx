import { landingFooterLinks } from "@/features/home/ui/landing-nav";
import { HomeSiteFooter } from "@/features/home/ui/HomeSiteFooter";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutSchoolFooterProps = {
  locale: Locale;
  nav: Dictionary["home"]["landing"]["nav"];
  footer: Dictionary["home"]["landing"]["footer"];
};

export function AboutSchoolFooter({ locale, nav, footer }: AboutSchoolFooterProps) {
  return (
    <HomeSiteFooter
      brand="AYAS"
      visit={footer.visit}
      phone={footer.phone}
      email={footer.email}
      addressLine1={footer.addressLine1}
      addressLine2={footer.addressLine2}
      mapLabel={footer.map}
      copyright={footer.copyright}
      maker={footer.maker}
      makerSuffix={footer.makerSuffix}
      links={landingFooterLinks(locale, nav)}
    />
  );
}
