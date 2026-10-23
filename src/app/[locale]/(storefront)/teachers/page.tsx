import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listSchoolClassCatalog } from "@/features/classes/application/queries";
import { listPublishedTeachers } from "@/features/teachers/application/queries";
import { TeachersView } from "@/features/teachers/ui/TeachersView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type TeachersPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: TeachersPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const teachers = getDictionary(rawLocale).teachers;

  return {
    title: teachers.metaTitle,
    description: teachers.metaDescription,
  };
}

export default async function TeachersPage({ params }: TeachersPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const [published, catalog] = await Promise.all([
    listPublishedTeachers(locale),
    listSchoolClassCatalog(locale),
  ]);
  const classTitles =
    catalog.total > 0
      ? catalog.published.map((item) => ({ id: item.code, title: item.title }))
      : dictionary.classes.programs.map((item) => ({
          id: item.id,
          title: item.title,
        }));

  return (
    <TeachersView
      locale={locale}
      dictionary={dictionary}
      published={published}
      classTitles={classTitles}
    />
  );
}
