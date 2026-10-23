import { locales, type Locale } from "@/lib/i18n/config";

import {
  type ClassLocaleCopy,
  type ClassTranslations,
} from "@/features/classes/domain/class-rules";

export type ClassLocaleDraft = {
  title: string;
  summary: string;
};

export function emptyClassDraft(): ClassLocaleDraft {
  return { title: "", summary: "" };
}

export function draftsFromClassTranslations(
  translations: ClassTranslations | undefined,
): Record<Locale, ClassLocaleDraft> {
  const next = {
    hy: emptyClassDraft(),
    en: emptyClassDraft(),
    ru: emptyClassDraft(),
  } satisfies Record<Locale, ClassLocaleDraft>;

  for (const locale of locales) {
    const copy = translations?.[locale];
    if (!copy) {
      continue;
    }
    next[locale] = { title: copy.title, summary: copy.summary };
  }

  return next;
}

function isBlank(draft: ClassLocaleDraft): boolean {
  return !draft.title.trim() && !draft.summary.trim();
}

function toCopy(draft: ClassLocaleDraft): ClassLocaleCopy | null {
  const copy = { title: draft.title.trim(), summary: draft.summary.trim() };
  if (!copy.title || !copy.summary) {
    return null;
  }
  return copy;
}

/** Keeps filled locales and drops a language that is still empty. */
export function collectClassTranslations(
  drafts: Record<Locale, ClassLocaleDraft>,
):
  | { ok: true; translations: ClassTranslations }
  | { ok: false; message: string } {
  const translations: ClassTranslations = {};

  for (const locale of locales) {
    const draft = drafts[locale];
    if (isBlank(draft)) {
      continue;
    }
    const copy = toCopy(draft);
    if (!copy) {
      return {
        ok: false,
        message: `Complete the ${locale.toUpperCase()} title and summary, or leave that language empty.`,
      };
    }
    translations[locale] = copy;
  }

  if (Object.keys(translations).length === 0) {
    return {
      ok: false,
      message: "Add the class in at least one language.",
    };
  }

  return { ok: true, translations };
}
