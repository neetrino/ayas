import type { PublicSchoolEvent } from '@/features/events/application/queries';
import { visibleAgeRestriction } from '@/features/events/domain/event-facts';
import { formatEventDate, formatEventTime } from '@/features/events/domain/format-event';
import { EventsCatalog, type EventCatalogCard } from '@/features/events/ui/EventsCatalog';
import { SchoolEventsFrame } from '@/features/events/ui/SchoolEventsFrame';
import { SchoolPageHero } from '@/features/home/ui/SchoolPageHero';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { formatMoneyAmount } from '@/lib/money/format';

type EventsViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  events: readonly PublicSchoolEvent[];
};

export function EventsView({ locale, dictionary, events }: EventsViewProps) {
  const landing = dictionary.home.landing;
  const copy = dictionary.events;

  return (
    <SchoolEventsFrame locale={locale} dictionary={dictionary}>
      <SchoolPageHero
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartLabel={dictionary.nav.cart}
        openMenuLabel={landing.openMenu}
        contactLabel={landing.nav.contact}
        nav={landing.nav}
        current="events"
        title={copy.hero.title}
        lead={copy.hero.lead}
      />
      <EventsCatalog
        empty={copy.empty}
        posterAlt={copy.posterAlt}
        dateLabel={copy.fields.date}
        timeLabel={copy.fields.startTime}
        venueLabel={copy.fields.venue}
        priceLabel={copy.fields.price}
        ageLabel={copy.fields.age}
        detailsLabel={copy.details}
        events={catalogCards(locale, events)}
      />
    </SchoolEventsFrame>
  );
}

function catalogCards(
  locale: Locale,
  events: readonly PublicSchoolEvent[],
): EventCatalogCard[] {
  return events.map((event) => ({
    slug: event.slug,
    href: `/${locale}/events/${event.slug}`,
    name: event.name,
    description: event.description,
    poster: event.poster,
    date: formatEventDate(event.date, locale),
    startTime: formatEventTime(event.startTime, locale),
    venue: event.venue,
    price: formatMoneyAmount(event.priceAmount, 'AMD', locale),
    ageRestriction: visibleAgeRestriction(event.ageRestriction),
  }));
}
