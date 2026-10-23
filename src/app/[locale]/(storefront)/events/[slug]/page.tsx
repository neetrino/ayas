import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { getPublishedEventBySlug } from '@/features/events/application/queries';
import { EventDetailView } from '@/features/events/ui/EventDetailView';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type EventPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const events = getDictionary(rawLocale).events;
  const event = await getPublishedEventBySlug(rawLocale, slug);

  if (!event) {
    return { title: events.metaTitle };
  }

  return {
    title: event.name,
    description: event.description,
    alternates: {
      canonical: `/${rawLocale}/events/${event.slug}`,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { locale: rawLocale, slug } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const event = await getPublishedEventBySlug(locale, slug);

  if (!event) {
    notFound();
  }

  if (event.slug !== slug) {
    redirect(`/${locale}/events/${event.slug}`);
  }

  return (
    <EventDetailView
      locale={locale}
      dictionary={getDictionary(locale)}
      event={event}
    />
  );
}
