import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';

type EventCardProps = {
  href: string;
  name: string;
  description: string;
  poster: string;
  posterAlt: string;
  dateLabel: string;
  date: string;
  timeLabel: string;
  startTime: string;
  venueLabel: string;
  venue: string;
  priceLabel: string;
  price: string;
  ageLabel: string;
  ageRestriction: string | null;
  detailsLabel: string;
};

export function EventCard({
  href,
  name,
  description,
  poster,
  posterAlt,
  dateLabel,
  date,
  timeLabel,
  startTime,
  venueLabel,
  venue,
  priceLabel,
  price,
  ageLabel,
  ageRestriction,
  detailsLabel,
}: EventCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] bg-[#f6eef3]">
      <AppLink href={href} prefetchPolicy="intent" className="relative block h-80 bg-black">
        <Image src={poster} alt={posterAlt} fill sizes="420px" className="object-cover" />
      </AppLink>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-2xl font-semibold text-[#030303]">
          <AppLink href={href} prefetchPolicy="intent" className="underline-offset-2 hover:underline">
            {name}
          </AppLink>
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-base leading-6">{description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Fact label={dateLabel} value={date} />
          <Fact label={timeLabel} value={startTime} />
          <Fact label={venueLabel} value={venue} />
          <Fact label={priceLabel} value={price} />
          {ageRestriction ? <Fact label={ageLabel} value={ageRestriction} /> : null}
        </dl>
        <AppLink
          href={href}
          prefetchPolicy="intent"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {detailsLabel}
        </AppLink>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-black/50">{label}</dt>
      <dd className="mt-1 font-semibold text-[#792a57]">{value}</dd>
    </div>
  );
}
