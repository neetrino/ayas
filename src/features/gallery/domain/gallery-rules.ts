import {
  isGalleryCategory,
  isGalleryKind,
  type GalleryCategory,
  type GalleryKind,
} from "@/features/gallery/domain/gallery-item";
import { galleryPlayback } from "@/features/gallery/domain/gallery-playback";
import type { Locale } from "@/lib/i18n/config";

export const GALLERY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type GalleryStatus = (typeof GALLERY_STATUSES)[number];

export const GALLERY_SORT_MAX = 9999;

export type GalleryLocaleCopy = {
  title: string;
  alt: string;
};

export type GalleryTranslations = Partial<Record<Locale, GalleryLocaleCopy>>;

export type GalleryRuleError =
  | "TITLE_REQUIRED"
  | "ALT_REQUIRED"
  | "INVALID_CATEGORY"
  | "INVALID_KIND"
  | "INVALID_SORT"
  | "INVALID_VIDEO"
  | "TRANSLATION_REQUIRED";

export function validateGalleryLocaleCopy(
  copy: GalleryLocaleCopy,
): GalleryRuleError | null {
  if (!copy.title.trim()) {
    return "TITLE_REQUIRED";
  }
  if (!copy.alt.trim()) {
    return "ALT_REQUIRED";
  }
  return null;
}

export function validateGalleryTranslations(
  translations: GalleryTranslations,
): GalleryRuleError | null {
  const copies = Object.values(translations).filter(
    (copy): copy is GalleryLocaleCopy => copy !== undefined,
  );
  if (copies.length === 0) {
    return "TRANSLATION_REQUIRED";
  }

  for (const copy of copies) {
    const error = validateGalleryLocaleCopy(copy);
    if (error) {
      return error;
    }
  }

  return null;
}

/** Photos store no video. Videos must be a playable gallery URL. */
export function normalizeGalleryVideo(
  kind: string,
  raw: string | null | undefined,
): { videoUrl: string | null } | { error: "INVALID_VIDEO" } {
  if (kind === "photo") {
    return { videoUrl: null };
  }
  const trimmed = raw?.trim() ?? "";
  if (!galleryPlayback(trimmed)) {
    return { error: "INVALID_VIDEO" };
  }
  return { videoUrl: trimmed };
}

export function validateGalleryProfile(input: {
  category: string;
  kind: string;
  sortOrder: number;
  videoUrl: string | null | undefined;
  translations: GalleryTranslations;
}): GalleryRuleError | null {
  if (!isGalleryCategory(input.category)) {
    return "INVALID_CATEGORY";
  }
  if (!isGalleryKind(input.kind)) {
    return "INVALID_KIND";
  }
  if (
    !Number.isInteger(input.sortOrder) ||
    input.sortOrder < 0 ||
    input.sortOrder > GALLERY_SORT_MAX
  ) {
    return "INVALID_SORT";
  }
  if ("error" in normalizeGalleryVideo(input.kind, input.videoUrl)) {
    return "INVALID_VIDEO";
  }
  return validateGalleryTranslations(input.translations);
}

/** Picks the requested locale, then English, Armenian, and Russian. */
export function resolveGalleryTranslation(
  translations: GalleryTranslations,
  locale: Locale,
): GalleryLocaleCopy | null {
  return (
    translations[locale] ??
    translations.en ??
    translations.hy ??
    translations.ru ??
    null
  );
}

export function galleryRuleErrorMessage(code: GalleryRuleError): string {
  switch (code) {
    case "TITLE_REQUIRED":
      return "Title is required.";
    case "ALT_REQUIRED":
      return "Alt text is required.";
    case "INVALID_CATEGORY":
      return "Choose a gallery category.";
    case "INVALID_KIND":
      return "Choose a photo or a video.";
    case "INVALID_SORT":
      return `Sort order must be a whole number from 0 to ${GALLERY_SORT_MAX}.`;
    case "INVALID_VIDEO":
      return "Use a YouTube or Vimeo link, or a /gallery/*.mp4 path.";
    case "TRANSLATION_REQUIRED":
      return "Add the gallery item in at least one language.";
  }
}

export type { GalleryCategory, GalleryKind };
