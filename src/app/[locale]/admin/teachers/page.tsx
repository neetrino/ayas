import { notFound } from "next/navigation";

import { listAdminTeachers } from "@/features/teachers/application/queries";
import { AdminTeachersView } from "@/features/teachers/ui/AdminTeachersView";
import { isLocale } from "@/lib/i18n/config";

type AdminTeachersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTeachersPage({ params }: AdminTeachersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const teachers = await listAdminTeachers(locale);
  return <AdminTeachersView locale={locale} teachers={teachers} />;
}
