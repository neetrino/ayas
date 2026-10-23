import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutSchoolView } from "@/features/about/ui/AboutSchoolView";
import { toHomeCoachCards } from "@/features/home/ui/HomeCoachesSection";
import { listPublishedTeachers } from "@/features/teachers/application/queries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const about = getDictionary(rawLocale).about;

  return {
    title: about.metaTitle,
    description: about.metaDescription,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const teachers = await listPublishedTeachers(locale);

  return (
    <AboutSchoolView
      locale={locale}
      dictionary={getDictionary(locale)}
      coaches={toHomeCoachCards(teachers)}
    />
  );
}
