import type { Locale } from "@/lib/i18n/config";

export const TEACHER_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export const TEACHER_ROLES = [
  "ballet",
  "contemporary",
  "traditional",
  "team",
] as const;

export type TeacherRole = (typeof TEACHER_ROLES)[number];

export const TEACHER_CLASS_IDS = [
  "ballet-children",
  "ballet-teens",
  "ballet-adults",
  "contemporary",
  "traditional-children",
  "traditional-adults",
  "open-class",
  "stage",
] as const;

export type TeacherClassId = (typeof TEACHER_CLASS_IDS)[number];

export const TEACHER_SORT_MAX = 9999;

export type TeacherLocaleCopy = {
  name: string;
  experience: string;
  biography: string;
};

export type TeacherTranslations = Partial<Record<Locale, TeacherLocaleCopy>>;

export type TeacherRuleError =
  | "NAME_REQUIRED"
  | "EXPERIENCE_REQUIRED"
  | "BIOGRAPHY_REQUIRED"
  | "INVALID_ROLE"
  | "INVALID_CLASS"
  | "INVALID_SORT"
  | "TRANSLATION_REQUIRED";

const CLASS_IDS = new Set<string>(TEACHER_CLASS_IDS);

export function isTeacherRole(value: string): value is TeacherRole {
  return TEACHER_ROLES.some((role) => role === value);
}

export function isTeacherClassId(value: string): value is TeacherClassId {
  return CLASS_IDS.has(value);
}

export function validateTeacherLocaleCopy(
  copy: TeacherLocaleCopy,
): TeacherRuleError | null {
  if (!copy.name.trim()) {
    return "NAME_REQUIRED";
  }
  if (!copy.experience.trim()) {
    return "EXPERIENCE_REQUIRED";
  }
  if (!copy.biography.trim()) {
    return "BIOGRAPHY_REQUIRED";
  }
  return null;
}

export function validateTeacherTranslations(
  translations: TeacherTranslations,
): TeacherRuleError | null {
  const copies = Object.values(translations).filter(
    (copy): copy is TeacherLocaleCopy => copy !== undefined,
  );
  if (copies.length === 0) {
    return "TRANSLATION_REQUIRED";
  }

  for (const copy of copies) {
    const error = validateTeacherLocaleCopy(copy);
    if (error) {
      return error;
    }
  }

  return null;
}

export function validateTeacherProfile(input: {
  role: string;
  classIds: readonly string[];
  sortOrder: number;
  translations: TeacherTranslations;
}): TeacherRuleError | null {
  if (!isTeacherRole(input.role)) {
    return "INVALID_ROLE";
  }
  if (input.classIds.some((id) => !isTeacherClassId(id))) {
    return "INVALID_CLASS";
  }
  if (
    !Number.isInteger(input.sortOrder) ||
    input.sortOrder < 0 ||
    input.sortOrder > TEACHER_SORT_MAX
  ) {
    return "INVALID_SORT";
  }
  return validateTeacherTranslations(input.translations);
}

/** Picks the requested locale, then English, Armenian, and Russian. */
export function resolveTeacherTranslation(
  translations: TeacherTranslations,
  locale: Locale,
): TeacherLocaleCopy | null {
  return (
    translations[locale] ??
    translations.en ??
    translations.hy ??
    translations.ru ??
    null
  );
}

export function teacherRuleErrorMessage(code: TeacherRuleError): string {
  switch (code) {
    case "NAME_REQUIRED":
      return "Name is required.";
    case "EXPERIENCE_REQUIRED":
      return "Experience is required.";
    case "BIOGRAPHY_REQUIRED":
      return "Biography is required.";
    case "INVALID_ROLE":
      return "Choose a specialization.";
    case "INVALID_CLASS":
      return "Choose classes from the school program.";
    case "INVALID_SORT":
      return `Sort order must be a whole number from 0 to ${TEACHER_SORT_MAX}.`;
    case "TRANSLATION_REQUIRED":
      return "Add the teacher in at least one language.";
  }
}
