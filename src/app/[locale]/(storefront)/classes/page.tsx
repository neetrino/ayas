import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  return <ClassesView locale={locale} dictionary={getDictionary(locale)} />;
}
