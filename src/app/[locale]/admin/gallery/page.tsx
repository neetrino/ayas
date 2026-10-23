import { notFound } from "next/navigation";

import { listAdminGalleryItems } from "@/features/gallery/application/queries";
import { AdminGalleryView } from "@/features/gallery/ui/AdminGalleryView";
import { isLocale } from "@/lib/i18n/config";

type AdminGalleryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminGalleryPage({ params }: AdminGalleryPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const items = await listAdminGalleryItems(locale);
  return <AdminGalleryView locale={locale} items={items} />;
}
