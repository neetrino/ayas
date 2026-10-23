import { locales, type Locale } from "@/lib/i18n/config";

import {
  normalizeEventSlug,
  type EventLocaleCopy,
  type EventTranslations,
} from "@/features/events/domain/event-rules";

export type EventLocaleDraft = {
  name: string;
  description: string;
  venue: string;
  address: string;
};

export function emptyEventDraft(): EventLocaleDraft {
  return {
    name: "",
    description: "",
    venue: "",
    address: "",
  };
}

export function draftsFromTranslations(
  translations: EventTranslations | undefined,
): Record<Locale, EventLocaleDraft> {
  const next = {
    hy: emptyEventDraft(),
    en: emptyEventDraft(),
    ru: emptyEventDraft(),
  } satisfies Record<Locale, EventLocaleDraft>;

  for (const locale of locales) {
    const copy = translations?.[locale];
    if (!copy) {
      continue;
    }
    next[locale] = {
      name: copy.name,
      description: copy.description,
      venue: copy.venue,
      address: copy.address,
    };
  }

  return next;
}

function isBlank(draft: EventLocaleDraft): boolean {
  return (
    !draft.name.trim() &&
    !draft.description.trim() &&
    !draft.venue.trim() &&
    !draft.address.trim()
  );
}

function toCopy(draft: EventLocaleDraft, slug: string): EventLocaleCopy | null {
  const copy = {
    name: draft.name.trim(),
    slug,
    description: draft.description.trim(),
    venue: draft.venue.trim(),
    address: draft.address.trim(),
  };
  if (!copy.name || !copy.description || !copy.venue || !copy.address) {
    return null;
  }
  return copy;
}

/** One slug for every filled language. */
export function sharedEventSlug(
  translations: EventTranslations | undefined,
): string {
  return (
    translations?.en?.slug ??
    translations?.hy?.slug ??
    translations?.ru?.slug ??
    ""
  );
}

const SLUG_SOURCE_ORDER: readonly Locale[] = ["en", "hy", "ru"];

/** Suggests a slug from the first name that contains Latin letters. */
export function suggestedEventSlug(
  drafts: Record<Locale, EventLocaleDraft>,
): string {
  for (const locale of SLUG_SOURCE_ORDER) {
    const value = normalizeEventSlug(drafts[locale].name);
    if (value) {
      return value;
    }
  }
  return "";
}

/** Keeps filled locales and writes the same slug into each one. */
export function collectEventTranslations(
  drafts: Record<Locale, EventLocaleDraft>,
  slug: string,
): { ok: true; translations: EventTranslations } | { ok: false; message: string } {
  const normalizedSlug = normalizeEventSlug(slug);
  if (!normalizedSlug) {
    return { ok: false, message: "Slug is required." };
  }

  const translations: EventTranslations = {};

  for (const locale of locales) {
    const draft = drafts[locale];
    if (isBlank(draft)) {
      continue;
    }
    const copy = toCopy(draft, normalizedSlug);
    if (!copy) {
      return {
        ok: false,
        message: `Complete name, description, venue, and address for ${locale.toUpperCase()}.`,
      };
    }
    translations[locale] = copy;
  }

  if (Object.keys(translations).length === 0) {
    return { ok: false, message: "Add the event in at least one language." };
  }

  return { ok: true, translations };
}
