import type { Locale } from "@/lib/i18n/config";

export const SCHOOL_EVENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type SchoolEventStatus = (typeof SCHOOL_EVENT_STATUSES)[number];

export const EVENT_GALLERY_LIMIT = 8;

export type EventLocaleCopy = {
  name: string;
  slug: string;
  description: string;
  venue: string;
  address: string;
};

export type EventTranslations = Partial<Record<Locale, EventLocaleCopy>>;

export type EventRuleError =
  | "NAME_REQUIRED"
  | "SLUG_REQUIRED"
  | "DESCRIPTION_REQUIRED"
  | "VENUE_REQUIRED"
  | "ADDRESS_REQUIRED"
  | "INVALID_SLUG"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "INVALID_DURATION"
  | "INVALID_PRICE"
  | "TRANSLATION_REQUIRED";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Lowercases and hyphenates an event slug. */
export function normalizeEventSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** True when the value is a real calendar day in YYYY-MM-DD. */
export function isEventDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** True when the value is a 24-hour HH:mm clock time. */
export function isEventStartTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function validateEventSchedule(input: {
  date: string;
  startTime: string;
  durationMinutes: number;
  priceAmount: number;
}): EventRuleError | null {
  if (!isEventDate(input.date)) {
    return "INVALID_DATE";
  }
  if (!isEventStartTime(input.startTime)) {
    return "INVALID_TIME";
  }
  if (
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 1 ||
    input.durationMinutes > 1440
  ) {
    return "INVALID_DURATION";
  }
  if (
    !Number.isInteger(input.priceAmount) ||
    input.priceAmount < 0 ||
    input.priceAmount > 10_000_000
  ) {
    return "INVALID_PRICE";
  }
  return null;
}

export function validateEventLocaleCopy(
  copy: EventLocaleCopy,
): EventRuleError | null {
  if (!copy.name.trim()) {
    return "NAME_REQUIRED";
  }

  const slug = normalizeEventSlug(copy.slug);
  if (!slug) {
    return "SLUG_REQUIRED";
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "INVALID_SLUG";
  }
  if (!copy.description.trim()) {
    return "DESCRIPTION_REQUIRED";
  }
  if (!copy.venue.trim()) {
    return "VENUE_REQUIRED";
  }
  if (!copy.address.trim()) {
    return "ADDRESS_REQUIRED";
  }
  return null;
}

export function validateEventTranslations(
  translations: EventTranslations,
): EventRuleError | null {
  const copies = Object.values(translations).filter(
    (copy): copy is EventLocaleCopy => copy !== undefined,
  );
  if (copies.length === 0) {
    return "TRANSLATION_REQUIRED";
  }

  for (const copy of copies) {
    const error = validateEventLocaleCopy({
      ...copy,
      slug: normalizeEventSlug(copy.slug),
    });
    if (error) {
      return error;
    }
  }

  return null;
}

/** Picks the requested locale, then English, Armenian, and Russian. */
export function resolveEventTranslation(
  translations: EventTranslations,
  locale: Locale,
): EventLocaleCopy | null {
  return (
    translations[locale] ??
    translations.en ??
    translations.hy ??
    translations.ru ??
    null
  );
}

export function eventRuleErrorMessage(code: EventRuleError): string {
  switch (code) {
    case "NAME_REQUIRED":
      return "Name is required.";
    case "SLUG_REQUIRED":
      return "Slug is required.";
    case "DESCRIPTION_REQUIRED":
      return "Description is required.";
    case "VENUE_REQUIRED":
      return "Venue is required.";
    case "ADDRESS_REQUIRED":
      return "Address is required.";
    case "INVALID_SLUG":
      return "Slug must use lowercase letters, numbers, and hyphens.";
    case "INVALID_DATE":
      return "Enter a valid date.";
    case "INVALID_TIME":
      return "Enter a start time as HH:mm.";
    case "INVALID_DURATION":
      return "Duration must be between 1 and 1440 minutes.";
    case "INVALID_PRICE":
      return "Ticket price must be a whole AMD amount.";
    case "TRANSLATION_REQUIRED":
      return "Add the event in at least one language.";
  }
}
