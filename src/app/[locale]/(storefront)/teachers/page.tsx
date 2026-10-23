import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  return <TeachersView locale={locale} dictionary={getDictionary(locale)} />;
}
