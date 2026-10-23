import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import type { PublicSchoolEvent } from '@/features/events/application/queries';
import { eventFactRows, type EventFact } from '@/features/events/domain/event-facts';
import {
  formatEventDate,
  formatEventDuration,
  formatEventTime,
} from '@/features/events/domain/format-event';
import { SchoolEventsFrame } from '@/features/events/ui/SchoolEventsFrame';
import { HomeHeader } from '@/features/home/ui/HomeHeader';
import { HomePillLink } from '@/features/home/ui/HomePillLink';
import { landingNavItems } from '@/features/home/ui/landing-nav';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { formatMoneyAmount } from '@/lib/money/format';

type EventDetailViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  event: PublicSchoolEvent;
};

export function EventDetailView({ locale, dictionary, event }: EventDetailViewProps) {
  const copy = dictionary.events;

  return (
    <SchoolEventsFrame locale={locale} dictionary={dictionary}>
      <article className="bg-white">
        <EventTopBar locale={locale} dictionary={dictionary} />
        <EventIntro locale={locale} copy={copy} event={event} poster={event.poster} />
        <EventSeating title={copy.seatingTitle} alt={copy.seatingAlt} src={event.seatingPlan} />
        <EventGallery title={copy.galleryTitle} alt={copy.galleryAlt} images={event.gallery} />
      </article>
    </SchoolEventsFrame>
  );
}

function EventTopBar({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const landing = dictionary.home.landing;

  return (
    <div className="relative h-28 bg-black">
      <HomeHeader
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartHref={`/${locale}/cart`}
        cartLabel={dictionary.nav.cart}
        contactHref={`/${locale}/contact`}
        contactLabel={landing.nav.contact}
        openMenuLabel={landing.openMenu}
        items={landingNavItems(locale, landing.nav, 'events')}
      />
    </div>
  );
}

function EventIntro({
  locale,
  copy,
  event,
  poster,
}: {
  locale: Locale;
  copy: Dictionary['events'];
  event: PublicSchoolEvent;
  poster: string;
}) {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:px-[84px] lg:py-16">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-black">
        <Image
          src={poster}
          alt={copy.posterAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 460px"
          className="object-cover"
        />
      </div>
      <div>
        <AppLink
          href={`/${locale}/events`}
          prefetchPolicy="intent"
          className="text-sm font-medium text-[#9f0258] underline-offset-2 hover:underline"
        >
          {copy.back}
        </AppLink>
        <h1 className="home-display mt-4 break-words text-[clamp(2.5rem,6vw,5rem)] text-[#030303]">
          {event.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-7">{event.description}</p>
        <EventFacts facts={detailFacts(locale, copy, event)} />
        <div className="mt-8">
          <HomePillLink href={`/${locale}/contact`} label={copy.buyTicket} />
        </div>
      </div>
    </div>
  );
}

function detailFacts(
  locale: Locale,
  copy: Dictionary['events'],
  event: PublicSchoolEvent,
): EventFact[] {
  return eventFactRows({
    labels: copy.fields,
    date: formatEventDate(event.date, locale),
    startTime: formatEventTime(event.startTime, locale),
    duration: formatEventDuration(event.durationMinutes, locale),
    venue: event.venue,
    address: event.address,
    ageRestriction: event.ageRestriction,
    price: formatMoneyAmount(event.priceAmount, 'AMD', locale),
  });
}

function EventFacts({ facts }: { facts: readonly EventFact[] }) {
  return (
    <dl className="mt-8 grid gap-4 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.id}>
          <dt className="text-sm text-black/50">{fact.label}</dt>
          <dd className="mt-1 text-base font-semibold text-[#792a57]">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EventSeating({ title, alt, src }: { title: string; alt: string; src: string }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 lg:px-[84px]" aria-labelledby="event-seating">
      <h2 id="event-seating" className="text-[30px] font-medium leading-9">
        {title}
      </h2>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[20px] bg-[#f6eef3]">
        <Image src={src} alt={alt} fill sizes="(max-width: 1440px) 100vw, 1272px" className="object-cover" />
      </div>
    </section>
  );
}

function EventGallery({
  title,
  alt,
  images,
}: {
  title: string;
  alt: string;
  images: readonly string[];
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-[84px]" aria-labelledby="event-gallery">
      <h2 id="event-gallery" className="text-[30px] font-medium leading-9">
        {title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {images.map((src) => (
          <li key={src} className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-black">
            <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}
