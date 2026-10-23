import type { ReactNode } from 'react';

import { AboutSchoolFooter } from '@/features/about/ui/AboutSchoolFooter';
import { HomeCtaSection } from '@/features/home/ui/HomeCtaSection';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type SchoolEventsFrameProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

export function SchoolEventsFrame({ locale, dictionary, children }: SchoolEventsFrameProps) {
  const landing = dictionary.home.landing;

  return (
    <div className="home-landing">
      {children}
      <HomeCtaSection
        title={landing.cta.title}
        body={landing.cta.body}
        registerLabel={landing.cta.register}
        registerHref={`/${locale}/contact`}
      />
      <AboutSchoolFooter locale={locale} nav={landing.nav} footer={landing.footer} />
    </div>
  );
}
