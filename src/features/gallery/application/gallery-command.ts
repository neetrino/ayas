import "server-only";

import { revalidatePath } from "next/cache";

import type { SchoolGalleryTranslationsJson } from "@/db/schema";
import {
  galleryRuleErrorMessage,
  normalizeGalleryVideo,
  validateGalleryProfile,
  type GalleryTranslations,
} from "@/features/gallery/domain/gallery-rules";
import {
  upsertSchoolGallerySchema,
  type UpsertSchoolGalleryInput,
} from "@/features/gallery/schemas/gallery";
import { invalidateGalleryCache } from "@/lib/cache/invalidate-public";
import { locales } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

export type SavedGalleryItem = {
  data: UpsertSchoolGalleryInput;
  translations: GalleryTranslations;
  videoUrl: string | null;
};

function normalizeTranslations(
  input: UpsertSchoolGalleryInput["translations"],
): GalleryTranslations {
  const next: GalleryTranslations = {};
  for (const locale of locales) {
    const copy = input[locale];
    if (!copy) {
      continue;
    }
    next[locale] = { title: copy.title.trim(), alt: copy.alt.trim() };
  }
  return next;
}

export function validatedGalleryItem(raw: unknown): Result<SavedGalleryItem> {
  const parsed = upsertSchoolGallerySchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid gallery payload.");
  }

  const translations = normalizeTranslations(parsed.data.translations);
  const video = normalizeGalleryVideo(parsed.data.kind, parsed.data.videoUrl);
  if ("error" in video) {
    return err(video.error, galleryRuleErrorMessage(video.error));
  }

  const profileError = validateGalleryProfile({
    category: parsed.data.category,
    kind: parsed.data.kind,
    sortOrder: parsed.data.sortOrder,
    videoUrl: video.videoUrl,
    translations,
  });
  if (profileError) {
    return err(profileError, galleryRuleErrorMessage(profileError));
  }

  return ok({
    data: parsed.data,
    translations,
    videoUrl: video.videoUrl,
  });
}

export function galleryValues(saved: SavedGalleryItem) {
  return {
    status: saved.data.status,
    category: saved.data.category,
    kind: saved.data.kind,
    sortOrder: saved.data.sortOrder,
    videoUrl: saved.videoUrl,
    translations: saved.translations,
    updatedAt: new Date(),
  };
}

export function revalidateSchoolGallery(locale: string): void {
  revalidatePath(`/${locale}/admin/gallery`);
  for (const loc of locales) {
    revalidatePath(`/${loc}/gallery`);
  }
  invalidateGalleryCache();
}

export function galleryAuditDiff(
  translations: GalleryTranslations | SchoolGalleryTranslationsJson | null | undefined,
  status: string,
  category: string,
  kind: string,
): Record<string, unknown> {
  const titles = locales.flatMap((loc) => {
    const title = translations?.[loc]?.title;
    return title ? [title] : [];
  });
  return { status, category, kind, titles };
}
