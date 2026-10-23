import { notFound } from "next/navigation";

import { listAdminClasses } from "@/features/classes/application/queries";
import { AdminClassesView } from "@/features/classes/ui/AdminClassesView";
import { isLocale } from "@/lib/i18n/config";

type AdminClassesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminClassesPage({ params }: AdminClassesPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const classes = await listAdminClasses(locale);
  return <AdminClassesView locale={locale} classes={classes} />;
}
