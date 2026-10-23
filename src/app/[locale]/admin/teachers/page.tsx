import { notFound } from "next/navigation";

import { listAdminClassOptions } from "@/features/classes/application/queries";
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

  const [teachers, classOptions] = await Promise.all([
    listAdminTeachers(locale),
    listAdminClassOptions(locale),
  ]);
  return (
    <AdminTeachersView
      locale={locale}
      teachers={teachers}
      classOptions={classOptions}
    />
  );
}
