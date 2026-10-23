import { notFound } from "next/navigation";

import { listAdminEvents } from "@/features/events/application/queries";
import { AdminEventsView } from "@/features/events/ui/AdminEventsView";
import { isLocale } from "@/lib/i18n/config";

type AdminEventsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEventsPage({ params }: AdminEventsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const events = await listAdminEvents(locale);
  return <AdminEventsView locale={locale} events={events} />;
}
