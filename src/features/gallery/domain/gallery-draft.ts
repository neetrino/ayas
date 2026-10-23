import { locales, type Locale } from "@/lib/i18n/config";

import {
  type GalleryLocaleCopy,
  type GalleryTranslations,
} from "@/features/gallery/domain/gallery-rules";

export type GalleryLocaleDraft = {
  title: string;
  alt: string;
};

export function emptyGalleryDraft(): GalleryLocaleDraft {
  return { title: "", alt: "" };
}

export function draftsFromGalleryTranslations(
  translations: GalleryTranslations | undefined,
): Record<Locale, GalleryLocaleDraft> {
  const next = {
    hy: emptyGalleryDraft(),
    en: emptyGalleryDraft(),
    ru: emptyGalleryDraft(),
  } satisfies Record<Locale, GalleryLocaleDraft>;

  for (const locale of locales) {
    const copy = translations?.[locale];
    if (!copy) {
      continue;
    }
    next[locale] = { title: copy.title, alt: copy.alt };
  }

  return next;
}

function isBlank(draft: GalleryLocaleDraft): boolean {
  return !draft.title.trim() && !draft.alt.trim();
}

function toCopy(draft: GalleryLocaleDraft): GalleryLocaleCopy | null {
  const copy = { title: draft.title.trim(), alt: draft.alt.trim() };
  if (!copy.title || !copy.alt) {
    return null;
  }
  return copy;
}

/** Keeps filled locales and drops a language that is still empty. */
export function collectGalleryTranslations(
  drafts: Record<Locale, GalleryLocaleDraft>,
):
  | { ok: true; translations: GalleryTranslations }
  | { ok: false; message: string } {
  const translations: GalleryTranslations = {};

  for (const locale of locales) {
    const draft = drafts[locale];
    if (isBlank(draft)) {
      continue;
    }
    const copy = toCopy(draft);
    if (!copy) {
      return {
        ok: false,
        message: `Complete the ${locale.toUpperCase()} title and alt text, or leave that language empty.`,
      };
    }
    translations[locale] = copy;
  }

  if (Object.keys(translations).length === 0) {
    return {
      ok: false,
      message: "Add the gallery item in at least one language.",
    };
  }

  return { ok: true, translations };
}
