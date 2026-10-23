import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import { schoolGalleryItems, type SchoolGalleryTranslationsJson } from "@/db/schema";
import { resolveGalleryImageUrl } from "@/features/gallery/application/persist-gallery-image";
import {
  toGalleryCards,
  type GalleryCard,
  type GallerySourceItem,
  type GalleryStill,
} from "@/features/gallery/domain/gallery-catalog";
import {
  resolveGalleryTranslation,
  type GalleryCategory,
  type GalleryKind,
  type GalleryStatus,
  type GalleryTranslations,
} from "@/features/gallery/domain/gallery-rules";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import type { Locale } from "@/lib/i18n/config";

export type AdminGalleryListItem = {
  id: string;
  status: GalleryStatus;
  category: GalleryCategory;
  kind: GalleryKind;
  sortOrder: number;
  title: string;
  imageKey: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  translations: GalleryTranslations;
};

type GalleryRow = typeof schoolGalleryItems.$inferSelect;

function asTranslations(value: SchoolGalleryTranslationsJson): GalleryTranslations {
  return value;
}

function toAdminItem(row: GalleryRow, locale: Locale): AdminGalleryListItem {
  const copy = resolveGalleryTranslation(asTranslations(row.translations), locale);
  return {
    id: row.id,
    status: row.status,
    category: row.category,
    kind: row.kind,
    sortOrder: row.sortOrder,
    title: copy?.title ?? "Untitled",
    imageKey: row.imageKey,
    imageUrl: resolveGalleryImageUrl(row.imageKey),
    videoUrl: row.videoUrl,
    translations: asTranslations(row.translations),
  };
}

/** Admin catalog, including drafts. Excludes soft-deleted rows. */
export async function listAdminGalleryItems(
  locale: Locale,
): Promise<AdminGalleryListItem[]> {
  const rows = await getDb()
    .select()
    .from(schoolGalleryItems)
    .where(isNull(schoolGalleryItems.deletedAt))
    .orderBy(asc(schoolGalleryItems.sortOrder), asc(schoolGalleryItems.createdAt));

  return rows.map((row) => toAdminItem(row, locale));
}

function publishedSources(rows: GalleryRow[], locale: Locale): {
  items: GallerySourceItem[];
  media: Map<string, GalleryStill>;
} {
  const items: GallerySourceItem[] = [];
  const media = new Map<string, GalleryStill>();

  for (const row of rows) {
    const copy = resolveGalleryTranslation(asTranslations(row.translations), locale);
    const image = resolveGalleryImageUrl(row.imageKey);
    if (!copy || !image) {
      continue;
    }
    items.push({
      slug: row.id,
      category: row.category,
      kind: row.kind,
      title: copy.title,
      alt: copy.alt,
    });
    media.set(row.id, { image, videoUrl: row.videoUrl });
  }

  return { items, media };
}

async function loadPublishedGallery(locale: Locale): Promise<GalleryCard[]> {
  const rows = await getDb()
    .select()
    .from(schoolGalleryItems)
    .where(
      and(
        eq(schoolGalleryItems.status, "PUBLISHED"),
        isNull(schoolGalleryItems.deletedAt),
      ),
    )
    .orderBy(asc(schoolGalleryItems.sortOrder), asc(schoolGalleryItems.createdAt));

  const { items, media } = publishedSources(rows, locale);
  return toGalleryCards(items, (slug) => media.get(slug) ?? null);
}

/** Published gallery cards for the public catalog, in sort order. */
export async function listPublishedGallery(locale: Locale): Promise<GalleryCard[]> {
  return unstable_cache(
    async () => loadPublishedGallery(locale),
    ["published-school-gallery", locale],
    {
      tags: [CACHE_TAGS.gallery],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
