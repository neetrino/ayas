import type { Locale } from "@/lib/i18n/config";

export const CLASS_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type ClassStatus = (typeof CLASS_STATUSES)[number];

export const CLASS_DIRECTIONS = [
  "ballet",
  "contemporary",
  "traditional",
  "open",
] as const;

export type ClassDirection = (typeof CLASS_DIRECTIONS)[number];

export const CLASS_AGES = [
  "children",
  "teens",
  "adults",
  "youth",
  "all",
] as const;

export type ClassAge = (typeof CLASS_AGES)[number];

export const CLASS_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "all",
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];

export const CLASS_SORT_MAX = 9999;

export const CLASS_CODE_MAX = 64;

export const CLASS_CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ClassOption = {
  code: string;
  title: string;
};

export type ClassLocaleCopy = {
  title: string;
  summary: string;
};

export type ClassTranslations = Partial<Record<Locale, ClassLocaleCopy>>;

export type ClassRuleError =
  | "TITLE_REQUIRED"
  | "SUMMARY_REQUIRED"
  | "INVALID_CODE"
  | "INVALID_DIRECTION"
  | "INVALID_AGE"
  | "INVALID_LEVEL"
  | "INVALID_SORT"
  | "TRANSLATION_REQUIRED";

export function isClassCode(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= CLASS_CODE_MAX &&
    CLASS_CODE_PATTERN.test(value)
  );
}

export function isClassDirection(value: string): value is ClassDirection {
  return CLASS_DIRECTIONS.some((item) => item === value);
}

export function isClassAge(value: string): value is ClassAge {
  return CLASS_AGES.some((item) => item === value);
}

export function isClassLevel(value: string): value is ClassLevel {
  return CLASS_LEVELS.some((item) => item === value);
}

/** Builds a stable code from a Latin title. Armenian and Russian titles return empty. */
export function classCodeFromTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, CLASS_CODE_MAX);
  return isClassCode(slug) ? slug : "";
}

export function validateClassLocaleCopy(
  copy: ClassLocaleCopy,
): ClassRuleError | null {
  if (!copy.title.trim()) {
    return "TITLE_REQUIRED";
  }
  if (!copy.summary.trim()) {
    return "SUMMARY_REQUIRED";
  }
  return null;
}

export function validateClassTranslations(
  translations: ClassTranslations,
): ClassRuleError | null {
  const copies = Object.values(translations).filter(
    (copy): copy is ClassLocaleCopy => copy !== undefined,
  );
  if (copies.length === 0) {
    return "TRANSLATION_REQUIRED";
  }

  for (const copy of copies) {
    const error = validateClassLocaleCopy(copy);
    if (error) {
      return error;
    }
  }

  return null;
}

export function validateClassProfile(input: {
  code?: string;
  direction: string;
  age: string;
  level: string;
  sortOrder: number;
  translations: ClassTranslations;
}): ClassRuleError | null {
  if (input.code !== undefined && !isClassCode(input.code)) {
    return "INVALID_CODE";
  }
  if (!isClassDirection(input.direction)) {
    return "INVALID_DIRECTION";
  }
  if (!isClassAge(input.age)) {
    return "INVALID_AGE";
  }
  if (!isClassLevel(input.level)) {
    return "INVALID_LEVEL";
  }
  if (
    !Number.isInteger(input.sortOrder) ||
    input.sortOrder < 0 ||
    input.sortOrder > CLASS_SORT_MAX
  ) {
    return "INVALID_SORT";
  }
  return validateClassTranslations(input.translations);
}

/** Picks the requested locale, then English, Armenian, and Russian. */
export function resolveClassTranslation(
  translations: ClassTranslations,
  locale: Locale,
): ClassLocaleCopy | null {
  return (
    translations[locale] ??
    translations.en ??
    translations.hy ??
    translations.ru ??
    null
  );
}

export function classRuleErrorMessage(code: ClassRuleError): string {
  switch (code) {
    case "TITLE_REQUIRED":
      return "Title is required.";
    case "SUMMARY_REQUIRED":
      return "Summary is required.";
    case "INVALID_CODE":
      return "Use a code of lowercase letters, numbers, and hyphens.";
    case "INVALID_DIRECTION":
      return "Choose a direction.";
    case "INVALID_AGE":
      return "Choose an age group.";
    case "INVALID_LEVEL":
      return "Choose a level.";
    case "INVALID_SORT":
      return `Sort order must be a whole number from 0 to ${CLASS_SORT_MAX}.`;
    case "TRANSLATION_REQUIRED":
      return "Add the class in at least one language.";
  }
}
