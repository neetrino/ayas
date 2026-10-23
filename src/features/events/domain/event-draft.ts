import { locales, type Locale } from "@/lib/i18n/config";

import {
  normalizeEventSlug,
  type EventLocaleCopy,
  type EventTranslations,
} from "@/features/events/domain/event-rules";

export type EventLocaleDraft = {
  name: string;
  slug: string;
  description: string;
  venue: string;
  address: string;
  slugTouched: boolean;
};

export function emptyEventDraft(): EventLocaleDraft {
  return {
    name: "",
    slug: "",
    description: "",
    venue: "",
    address: "",
    slugTouched: false,
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
      slug: copy.slug,
      description: copy.description,
      venue: copy.venue,
      address: copy.address,
      slugTouched: true,
    };
  }

  return next;
}

function resolvedSlug(draft: EventLocaleDraft): string {
  if (draft.slugTouched && draft.slug.trim()) {
    return normalizeEventSlug(draft.slug);
  }
  return normalizeEventSlug(draft.name);
}

function isBlank(draft: EventLocaleDraft): boolean {
  return (
    !draft.name.trim() &&
    !draft.slug.trim() &&
    !draft.description.trim() &&
    !draft.venue.trim() &&
    !draft.address.trim()
  );
}

function toCopy(draft: EventLocaleDraft): EventLocaleCopy | null {
  const slug = resolvedSlug(draft);
  const copy = {
    name: draft.name.trim(),
    slug,
    description: draft.description.trim(),
    venue: draft.venue.trim(),
    address: draft.address.trim(),
  };
  if (!copy.name || !copy.slug || !copy.description || !copy.venue || !copy.address) {
    return null;
  }
  return copy;
}

/** Keeps filled locales and rejects a language that is only partly filled. */
export function collectEventTranslations(
  drafts: Record<Locale, EventLocaleDraft>,
): { ok: true; translations: EventTranslations } | { ok: false; message: string } {
  const translations: EventTranslations = {};

  for (const locale of locales) {
    const draft = drafts[locale];
    if (isBlank(draft)) {
      continue;
    }
    const copy = toCopy(draft);
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
