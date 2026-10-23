import "server-only";

import { revalidatePath } from "next/cache";

import type { SchoolEventTranslationsJson } from "@/db/schema";
import {
  eventRuleErrorMessage,
  normalizeEventSlug,
  validateEventSchedule,
  validateEventTranslations,
  type EventTranslations,
} from "@/features/events/domain/event-rules";
import {
  upsertSchoolEventSchema,
  type UpsertSchoolEventInput,
} from "@/features/events/schemas/event";
import { invalidateEventsCache } from "@/lib/cache/invalidate-public";
import { locales } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

export type SavedEvent = {
  data: UpsertSchoolEventInput;
  translations: EventTranslations;
};

export function translationSlugs(
  translations: EventTranslations | SchoolEventTranslationsJson | null | undefined,
): string[] {
  if (!translations) {
    return [];
  }
  return locales.flatMap((locale) => {
    const slug = translations[locale]?.slug;
    return slug ? [slug] : [];
  });
}

export function revalidateSchoolEvents(
  locale: string,
  slugs: readonly string[],
): void {
  revalidatePath(`/${locale}/admin/events`);
  for (const loc of locales) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/events`);
    for (const slug of slugs) {
      revalidatePath(`/${loc}/events/${slug}`);
    }
  }
  invalidateEventsCache({ slugs });
}

function normalizeTranslations(
  input: UpsertSchoolEventInput["translations"],
): EventTranslations {
  const next: EventTranslations = {};
  for (const locale of locales) {
    const copy = input[locale];
    if (!copy) {
      continue;
    }
    next[locale] = {
      name: copy.name.trim(),
      slug: normalizeEventSlug(copy.slug),
      description: copy.description.trim(),
      venue: copy.venue.trim(),
      address: copy.address.trim(),
    };
  }
  return next;
}

export function validatedEvent(raw: unknown): Result<SavedEvent> {
  const parsed = upsertSchoolEventSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid event payload.");
  }

  const data = {
    ...parsed.data,
    startTime: parsed.data.startTime.slice(0, 5),
  };
  const translations = normalizeTranslations(data.translations);
  const scheduleError = validateEventSchedule({
    date: data.date,
    startTime: data.startTime,
    durationMinutes: data.durationMinutes,
    priceAmount: data.priceAmount,
  });
  if (scheduleError) {
    return err(scheduleError, eventRuleErrorMessage(scheduleError));
  }

  const translationError = validateEventTranslations(translations);
  if (translationError) {
    return err(translationError, eventRuleErrorMessage(translationError));
  }

  return ok({ data, translations });
}

export function isSlugConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("school_events_slug_") ||
      error.message.includes("duplicate key"))
  );
}

export function eventValues(saved: SavedEvent) {
  return {
    status: saved.data.status,
    eventDate: saved.data.date,
    startTime: saved.data.startTime,
    durationMinutes: saved.data.durationMinutes,
    priceAmount: saved.data.priceAmount,
    ageRestriction: saved.data.ageRestriction,
    translations: saved.translations,
    updatedAt: new Date(),
  };
}
