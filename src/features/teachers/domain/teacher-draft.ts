import { locales, type Locale } from "@/lib/i18n/config";

import {
  type TeacherLocaleCopy,
  type TeacherTranslations,
} from "@/features/teachers/domain/teacher-rules";

export type TeacherLocaleDraft = {
  name: string;
  experience: string;
  biography: string;
};

export function emptyTeacherDraft(): TeacherLocaleDraft {
  return { name: "", experience: "", biography: "" };
}

export function draftsFromTeacherTranslations(
  translations: TeacherTranslations | undefined,
): Record<Locale, TeacherLocaleDraft> {
  const next = {
    hy: emptyTeacherDraft(),
    en: emptyTeacherDraft(),
    ru: emptyTeacherDraft(),
  } satisfies Record<Locale, TeacherLocaleDraft>;

  for (const locale of locales) {
    const copy = translations?.[locale];
    if (!copy) {
      continue;
    }
    next[locale] = {
      name: copy.name,
      experience: copy.experience,
      biography: copy.biography,
    };
  }

  return next;
}

function isBlank(draft: TeacherLocaleDraft): boolean {
  return (
    !draft.name.trim() &&
    !draft.experience.trim() &&
    !draft.biography.trim()
  );
}

function toCopy(draft: TeacherLocaleDraft): TeacherLocaleCopy | null {
  const copy = {
    name: draft.name.trim(),
    experience: draft.experience.trim(),
    biography: draft.biography.trim(),
  };
  if (!copy.name || !copy.experience || !copy.biography) {
    return null;
  }
  return copy;
}

/** Keeps filled locales and drops a language that is still empty. */
export function collectTeacherTranslations(
  drafts: Record<Locale, TeacherLocaleDraft>,
):
  | { ok: true; translations: TeacherTranslations }
  | { ok: false; message: string } {
  const translations: TeacherTranslations = {};

  for (const locale of locales) {
    const draft = drafts[locale];
    if (isBlank(draft)) {
      continue;
    }
    const copy = toCopy(draft);
    if (!copy) {
      return {
        ok: false,
        message: `Complete the ${locale.toUpperCase()} name, experience, and biography, or leave that language empty.`,
      };
    }
    translations[locale] = copy;
  }

  if (Object.keys(translations).length === 0) {
    return {
      ok: false,
      message: "Add the teacher in at least one language.",
    };
  }

  return { ok: true, translations };
}
