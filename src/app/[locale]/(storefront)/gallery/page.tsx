import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listPublishedGallery } from "@/features/gallery/application/queries";
import { GalleryView } from "@/features/gallery/ui/GalleryView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type GalleryPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const gallery = getDictionary(rawLocale).gallery;

  return {
    title: gallery.metaTitle,
    description: gallery.metaDescription,
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  const items = await listPublishedGallery(locale);
  return (
    <GalleryView locale={locale} dictionary={getDictionary(locale)} items={items} />
  );
}
