import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { listPublishedEvents } from '@/features/events/application/queries';
import { EventsView } from '@/features/events/ui/EventsView';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type EventsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const events = getDictionary(rawLocale).events;

  return {
    title: events.metaTitle,
    description: events.metaDescription,
  };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  const events = await listPublishedEvents(locale);

  return <EventsView locale={locale} dictionary={getDictionary(locale)} events={events} />;
}
