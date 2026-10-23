import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactSchoolView } from "@/features/contact/ui/ContactSchoolView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const contact = getDictionary(rawLocale).contact;

  return {
    title: contact.title,
    description: contact.subtitle,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  return <ContactSchoolView locale={locale} dictionary={getDictionary(locale)} />;
}
