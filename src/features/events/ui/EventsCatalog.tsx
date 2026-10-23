import { EventCard } from '@/features/events/ui/EventCard';

export type EventCatalogCard = {
  slug: string;
  href: string;
  name: string;
  description: string;
  poster: string;
  date: string;
  startTime: string;
  venue: string;
  price: string;
  ageRestriction: string | null;
};

type EventsCatalogProps = {
  empty: string;
  posterAlt: string;
  dateLabel: string;
  timeLabel: string;
  venueLabel: string;
  priceLabel: string;
  ageLabel: string;
  detailsLabel: string;
  events: readonly EventCatalogCard[];
};

export function EventsCatalog({
  empty,
  posterAlt,
  dateLabel,
  timeLabel,
  venueLabel,
  priceLabel,
  ageLabel,
  detailsLabel,
  events,
}: EventsCatalogProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
        {events.length === 0 ? (
          <p className="text-lg" role="status">
            {empty}
          </p>
        ) : (
          <ul className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <li key={event.slug}>
                <EventCard
                  href={event.href}
                  name={event.name}
                  description={event.description}
                  poster={event.poster}
                  posterAlt={posterAlt}
                  dateLabel={dateLabel}
                  date={event.date}
                  timeLabel={timeLabel}
                  startTime={event.startTime}
                  venueLabel={venueLabel}
                  venue={event.venue}
                  priceLabel={priceLabel}
                  price={event.price}
                  ageLabel={ageLabel}
                  ageRestriction={event.ageRestriction}
                  detailsLabel={detailsLabel}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
