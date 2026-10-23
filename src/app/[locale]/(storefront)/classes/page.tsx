import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listSchoolClassCatalog } from "@/features/classes/application/queries";
import { toClassCatalogPrograms } from "@/features/classes/ui/class-catalog";
import { ClassesView } from "@/features/classes/ui/ClassesView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ClassesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ClassesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const classes = getDictionary(rawLocale).classes;

  return {
    title: classes.metaTitle,
    description: classes.metaDescription,
  };
}

export default async function ClassesPage({ params }: ClassesPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const catalog = await listSchoolClassCatalog(locale);
  const source =
    catalog.total > 0
      ? catalog.published.map((item) => ({
          id: item.code,
          title: item.title,
          summary: item.summary,
          directionId: item.direction,
          ageId: item.age,
          levelId: item.level,
        }))
      : dictionary.classes.programs.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          directionId: item.direction,
          ageId: item.age,
          levelId: item.level,
        }));

  return (
    <ClassesView
      locale={locale}
      dictionary={dictionary}
      programs={toClassCatalogPrograms(source, dictionary.classes)}
    />
  );
}
