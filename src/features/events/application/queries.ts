import "server-only";

import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { getDb } from "@/db/client";
import { schoolEvents, type SchoolEventTranslationsJson } from "@/db/schema";
import { resolveEventAssetUrl } from "@/features/events/application/event-assets";
import { eventMedia } from "@/features/events/content/event-media";
import {
  resolveEventTranslation,
  type EventTranslations,
  type SchoolEventStatus,
} from "@/features/events/domain/event-rules";
import { sortEvents } from "@/features/events/domain/sort-events";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import { locales, type Locale } from "@/lib/i18n/config";

export type PublicSchoolEvent = {
  id: string;
  slug: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  venue: string;
  address: string;
  ageRestriction: string | null;
  priceAmount: number;
  poster: string;
  seatingPlan: string;
  gallery: string[];
};

export type AdminEventGalleryItem = {
  key: string;
  url: string;
};

export type AdminEventListItem = {
  id: string;
  status: SchoolEventStatus;
  date: string;
  startTime: string;
  durationMinutes: number;
  priceAmount: number;
  ageRestriction: string;
  title: string;
  slug: string;
  venue: string;
  posterKey: string | null;
  posterUrl: string | null;
  seatingPlanKey: string | null;
  seatingPlanUrl: string | null;
  gallery: AdminEventGalleryItem[];
  translations: EventTranslations;
};

type SchoolEventRow = typeof schoolEvents.$inferSelect;

function asTranslations(
  value: SchoolEventTranslationsJson,
): EventTranslations {
  return value;
}

function galleryItems(keys: string[]): AdminEventGalleryItem[] {
  return keys.flatMap((key) => {
    const url = resolveEventAssetUrl(key);
    return url ? [{ key, url }] : [];
  });
}

function toPublicEvent(
  row: SchoolEventRow,
  locale: Locale,
): PublicSchoolEvent | null {
  const copy = resolveEventTranslation(asTranslations(row.translations), locale);
  if (!copy) {
    return null;
  }

  const fallback = eventMedia(copy.slug);
  const gallery = galleryItems(row.galleryKeys).map((item) => item.url);

  return {
    id: row.id,
    slug: copy.slug,
    name: copy.name,
    description: copy.description,
    date: row.eventDate,
    startTime: row.startTime,
    durationMinutes: row.durationMinutes,
    venue: copy.venue,
    address: copy.address,
    ageRestriction: row.ageRestriction,
    priceAmount: row.priceAmount,
    poster: resolveEventAssetUrl(row.posterKey) ?? fallback.poster,
    seatingPlan: resolveEventAssetUrl(row.seatingPlanKey) ?? fallback.seatingPlan,
    gallery: gallery.length > 0 ? gallery : [...fallback.gallery],
  };
}

function toAdminItem(row: SchoolEventRow, locale: Locale): AdminEventListItem {
  const copy = resolveEventTranslation(asTranslations(row.translations), locale);
  return {
    id: row.id,
    status: row.status,
    date: row.eventDate,
    startTime: row.startTime,
    durationMinutes: row.durationMinutes,
    priceAmount: row.priceAmount,
    ageRestriction: row.ageRestriction ?? "",
    title: copy?.name ?? "Untitled",
    slug: copy?.slug ?? "",
    venue: copy?.venue ?? "",
    posterKey: row.posterKey,
    posterUrl: resolveEventAssetUrl(row.posterKey),
    seatingPlanKey: row.seatingPlanKey,
    seatingPlanUrl: resolveEventAssetUrl(row.seatingPlanKey),
    gallery: galleryItems(row.galleryKeys),
    translations: asTranslations(row.translations),
  };
}

/** Admin catalog, including drafts. Excludes soft-deleted rows. */
export async function listAdminEvents(
  locale: Locale,
): Promise<AdminEventListItem[]> {
  const rows = await getDb()
    .select()
    .from(schoolEvents)
    .where(isNull(schoolEvents.deletedAt))
    .orderBy(asc(schoolEvents.eventDate), asc(schoolEvents.startTime));

  return rows.map((row) => toAdminItem(row, locale));
}

async function loadPublishedEvents(locale: Locale): Promise<PublicSchoolEvent[]> {
  const rows = await getDb()
    .select()
    .from(schoolEvents)
    .where(
      and(eq(schoolEvents.status, "PUBLISHED"), isNull(schoolEvents.deletedAt)),
    );

  return sortEvents(
    rows.flatMap((row) => {
      const event = toPublicEvent(row, locale);
      return event ? [event] : [];
    }),
  );
}

/** Published events for the storefront, soonest first. */
export async function listPublishedEvents(
  locale: Locale,
): Promise<PublicSchoolEvent[]> {
  return unstable_cache(
    async () => loadPublishedEvents(locale),
    ["published-school-events", locale],
    {
      tags: [CACHE_TAGS.events],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

function eventSlugMatchesAnyLocale(slug: string) {
  return or(
    ...locales.map(
      (locale) =>
        sql`${schoolEvents.translations}->${locale}->>'slug' = ${slug}`,
    ),
  );
}

async function loadPublishedEventBySlug(
  locale: Locale,
  slug: string,
): Promise<PublicSchoolEvent | null> {
  const [row] = await getDb()
    .select()
    .from(schoolEvents)
    .where(
      and(
        eq(schoolEvents.status, "PUBLISHED"),
        isNull(schoolEvents.deletedAt),
        eventSlugMatchesAnyLocale(slug),
      ),
    )
    .limit(1);

  return row ? toPublicEvent(row, locale) : null;
}

/**
 * Loads one published event by any locale slug.
 * The page redirects when the slug is not the active locale's slug.
 */
export const getPublishedEventBySlug = cache(
  async (
    locale: Locale,
    slug: string,
  ): Promise<PublicSchoolEvent | null> => {
    return unstable_cache(
      async () => loadPublishedEventBySlug(locale, slug),
      ["published-school-event", locale, slug],
      {
        tags: [CACHE_TAGS.eventSlug(locale, slug)],
        revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
      },
    )();
  },
);
